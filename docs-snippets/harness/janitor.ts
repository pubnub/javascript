import PubNub from 'pubnub';
import { allGroupNames, hasRunSuffix, names, SUFFIX_PATTERN, suffixName } from '../fixtures/names.js';
import { ROLES, runIdAgeMs, securedKeysets, type Env, type Role } from './env.js';
import { sweepDataSync } from './janitor-datasync.js';
import { revokeApplicationGrantOnKeyset } from './revoke.js';

/**
 * Janitor. Runs in the Mocha root `after` hook and from `npm run test:docs-snippets:janitor`.
 *
 * Phase 1 scope:
 *  1. delete this run's channel groups (registered names, 404 ignored)
 *  2. remove this run's App Context users and channels on the open keyset
 *  3. sweep App Context objects with a run suffix older than six hours (crashed earlier runs)
 *  4. report residue: App Context objects created or updated during the run window without a run suffix
 *
 * Also removes files uploaded to the file sharing channels and push registrations of the registered device tokens,
 * and revokes the application-level Access Manager grant on the pam and datasync keysets (fail-safe, see revoke.ts).
 *
 * Crashed-run sweep by pattern: run ids carry their start time (env.ts). Every run id found on a channel group or an
 * App Context object that is older than six hours, and is not this run, gets the same per-run cleanup as this run:
 * its channel groups, files on the file sharing channels and push registrations. The ids are printed first.
 * DataSync objects on the datasync keyset are cleaned by janitor-datasync.ts.
 * Messages cannot be listed by channel, so history residue relies on 1-day retention.
 */

// Why six hours: longer than any single run (the full suite takes minutes), so a run id this old cannot belong to a live
// run, yet short enough that a crash is cleaned the same day.
const SIX_HOURS = 6 * 60 * 60 * 1000;
/** Channels the file sharing samples upload to. */
const FILE_CHANNELS = ['my_channel', 'awesomeChannel', 'preflight_channel'];

/** `log` lines are printed. `residue` and `critical` make the run fail (see mocha-entry.ts). */
export interface JanitorReport {
  log: string[];
  residue: string[];
  /** Cleanup that failed in a way that leaves the keysets in an unsafe state. The run must fail. */
  critical: string[];
}

interface ObjectLike {
  id: string;
  updated?: string;
}

/**
 * Cleans up after one run and after crashed ones. `since` is the run start, it bounds which unsuffixed objects count as
 * residue. Never throws for ordinary cleanup failures (a missing object is fine), only reports `critical` for the revoke.
 */
export async function runJanitor(env: Env, runId: string, since: Date, roles: readonly Role[] = ROLES): Promise<JanitorReport> {
  const log: string[] = [];
  const residue: string[] = [];
  const critical: string[] = [];
  // Only the keysets of the roles this run used. CI runs the shards in parallel, and an open shard must never revoke the
  // application-level grant a pam step is testing at that moment.
  const uses = (role: Role): boolean => roles.includes(role) || (role === 'pam' && env.sharedSecured && roles.includes('datasync'));
  // Safety first: never leave a secured keyset open to strangers. pam and datasync may be one keyset, it is revoked once.
  for (const { role, keys } of securedKeysets(env).filter((k) => uses(k.role))) {
    try {
      await revokeApplicationGrantOnKeyset(keys, `r${runId}`);
      // The revoke call succeeded, but Access Manager (v2) needs up to about 60 seconds to apply it. The root `after` hook waits
      // for it (revoke.ts, closeAndVerifyApplicationGrant). The standalone janitor command only says so.
      log.push(`application-level grant on the ${role} keyset revoked (it can take up to 60 s to take effect)`);
    } catch (error) {
      critical.push(`${role} keyset: ${(error as Error).message}`);
    }
  }
  // DataSync objects live on the datasync keyset, see janitor-datasync.ts. A failure here must not skip the open keyset cleanup.
  if (roles.includes('datasync')) {
    try {
      const dataSync = await sweepDataSync(env, runId, since);
      log.push(...dataSync.log);
      residue.push(...dataSync.residue);
    } catch (error) {
      log.push(`DataSync sweep failed (${(error as Error).message ?? error})`);
    }
  }
  if (!env.open) {
    log.push('open keyset not configured, nothing to clean');
    return { log, residue, critical };
  }
  // A throwaway admin client of its own: the world's clients are destroyed before the janitor runs after a signal.
  const admin = new PubNub({
    publishKey: env.open.publishKey,
    subscribeKey: env.open.subscribeKey,
    userId: `janitor-r${runId}`,
    logLevel: PubNub.LogLevel.None,
  });

  try {
    // Run ids of crashed runs, discovered by pattern before anything is deleted.
    const stale = new Set<string>();
    // Collects the run id from any resource name with a `-r<id>` suffix, if that run is old enough to be dead.
    const noteStale = (id: string): void => {
      const match = SUFFIX_PATTERN.exec(id);
      if (!match) return;
      const other = match[0].slice(2);
      if (other === runId) return;
      const age = runIdAgeMs(other);
      if (age !== undefined && age > SIX_HOURS) stale.add(other);
    };
    let groupNames: string[] = [];
    try {
      groupNames = (await admin.channelGroups.listGroups()).groups;
      groupNames.forEach(noteStale);
    } catch (error) {
      log.push(`channel group listing unavailable, group sweep skipped (${(error as Error).message ?? error})`);
    }

    // 1. Everything this run created, then the same for each crashed run.
    log.push(`run id ${runId}`);
    await cleanupRun(admin, runId, log, residue);
    const objects = new Map<'uuid' | 'channel', ObjectLike[]>();
    for (const kind of ['uuid', 'channel'] as const) {
      try {
        const listed = await listAll(admin, kind);
        objects.set(kind, listed);
        listed.forEach((o) => noteStale(o.id));
      } catch (error) {
        log.push(`App Context ${kind} metadata unavailable, skipped (${(error as Error).message ?? error})`);
      }
    }
    if (stale.size > 0) log.push(`crashed runs older than six hours found by pattern: ${[...stale].join(', ')}`);
    for (const id of stale) {
      log.push(`sweeping run id ${id}`);
      await cleanupRun(admin, id, log, residue);
    }

    // 2 to 4. App Context. `mine` = this run's suffix, `old` = any suffixed object not touched for six hours,
    // anything else created during this run without a suffix is residue (the snippet used an unregistered literal).
    // The lookahead accepts the suffix on the first dot segment (`chats-r<id>.room1`) or at the end of the name.
    const runSuffix = new RegExp(`-r${runId}(?=\\.|$)`);
    for (const kind of ['uuid', 'channel'] as const) {
      const listed = objects.get(kind);
      if (!listed) continue;
      const now = Date.now();
      let removed = 0;
      for (const object of listed) {
        const updated = object.updated ? Date.parse(object.updated) : 0;
        const mine = runSuffix.test(object.id);
        const old = hasRunSuffix(object.id) && updated > 0 && now - updated > SIX_HOURS;
        if (mine || old) {
          try {
            if (kind === 'uuid') await admin.objects.removeUUIDMetadata({ uuid: object.id });
            else await admin.objects.removeChannelMetadata({ channel: object.id });
            removed += 1;
          } catch {
            // Already gone.
          }
        } else if (!hasRunSuffix(object.id) && updated >= since.getTime()) {
          residue.push(`${kind}:${object.id}`);
        }
      }
      log.push(`App Context ${kind} metadata removed: ${removed}`);
    }
  } finally {
    admin.destroy();
  }
  return { log, residue, critical };
}

/** Channel groups, files and push registrations of one run id on the open keyset. */
async function cleanupRun(admin: PubNub, runId: string, log: string[], residue: string[]): Promise<void> {
  const label = `[${runId}]`;
  let removedGroups = 0;
  for (const name of allGroupNames()) {
    try {
      await admin.channelGroups.deleteGroup({ channelGroup: suffixName(name, runId) });
      removedGroups += 1;
    } catch {
      // Missing groups are fine.
    }
  }
  log.push(`${label} channel groups deleted: ${removedGroups}`);

  let removedFiles = 0;
  for (const base of FILE_CHANNELS) {
    const channel = suffixName(base, runId);
    try {
      const listed = await admin.listFiles({ channel, limit: 100 });
      for (const file of listed.data) {
        try {
          await admin.deleteFile({ channel, id: file.id, name: file.name });
          removedFiles += 1;
        } catch {
          // Already gone.
        }
      }
    } catch {
      // Files not enabled or the channel never had a file.
    }
  }
  log.push(`${label} files deleted: ${removedFiles}`);

  // Push registrations. Device tokens are derived from the run id (names.ts `deviceToken`), so a crashed run's
  // tokens are recomputed from its run id alone. The registrations themselves cannot be listed without the token.
  // Run ids of crashed push runs are found through the `push_marker` channel metadata the mobile push page sets
  // (see api-reference/mobile-push.ts), which the App Context sweep above lists by pattern.
  // `niceDevice` is the docs sample's token. The app only registers it in the harness check that proves the
  // apns/apns2 rejection claim, and that check removes it again, but a crash in between is covered here.
  const devices = [...names.device.map((base) => suffixName(base, runId)), suffixName('niceDevice', runId)];
  // Gateway variants the app can register on: fcm, apns (v1) and both apns2 environments with the docs topic.
  const gateways: Array<{
    label: string;
    remove: (device: string) => Promise<unknown>;
    list: (device: string) => Promise<{ channels: string[] }>;
  }> = [
    { label: 'fcm', remove: (device) => admin.push.deleteDevice({ device, pushGateway: 'fcm' }), list: (device) => admin.push.listChannels({ device, pushGateway: 'fcm' }) },
    { label: 'apns', remove: (device) => admin.push.deleteDevice({ device, pushGateway: 'apns' }), list: (device) => admin.push.listChannels({ device, pushGateway: 'apns' }) },
    ...(['production', 'development'] as const).map((environment) => ({
      label: `apns2/${environment}`,
      remove: (device: string) => admin.push.deleteDevice({ device, pushGateway: 'apns2', environment, topic: 'com.example.bundle_id' }),
      list: (device: string) => admin.push.listChannels({ device, pushGateway: 'apns2', environment, topic: 'com.example.bundle_id' }),
    })),
  ];
  let removedDevices = 0;
  for (const device of devices) {
    for (const gateway of gateways) {
      try {
        await gateway.remove(device);
        removedDevices += 1;
      } catch {
        // Mobile push off, a token the gateway rejects (niceDevice on apns), or nothing registered.
      }
    }
  }
  log.push(`${label} push device registrations deleted (calls that succeeded): ${removedDevices}`);
  // Verify, per gateway: a list call for each token must come back empty. Errors mean push is off or the token
  // never registered there, which leaves nothing behind. Only a non-empty answer is residue.
  for (const device of devices) {
    for (const gateway of gateways) {
      try {
        const left = await gateway.list(device);
        if (left.channels.length > 0) residue.push(`push ${gateway.label} ${device.slice(0, 8)}...: ${left.channels.join(',')}`);
      } catch {
        // Nothing to list.
      }
    }
  }
}

// Pages through App Context (100 per page, at most 20 pages) so cleanup finds objects beyond the first page.
async function listAll(admin: PubNub, kind: 'uuid' | 'channel'): Promise<ObjectLike[]> {
  const out: ObjectLike[] = [];
  let next: string | undefined;
  for (let page = 0; page < 20; page += 1) {
    const response =
      kind === 'uuid'
        ? await admin.objects.getAllUUIDMetadata({ limit: 100, page: next ? { next } : undefined })
        : await admin.objects.getAllChannelMetadata({ limit: 100, page: next ? { next } : undefined });
    out.push(...response.data.map((d) => ({ id: d.id, updated: d.updated })));
    next = response.next;
    if (!next || response.data.length === 0) break;
  }
  return out;
}
