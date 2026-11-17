/**
 * The janitor: cleans EXACTLY the resources listed in resources.ts, per keyset role. Best effort and idempotent: a second pass
 * right after the first finds nothing to remove.
 *
 * Safety rules (do not relax):
 *  - It deletes only names from resources.ts. It never lists a keyset and deletes what it finds (no getAll*), never touches a
 *    DataSync class and never changes keyset configuration.
 *  - The only things it reads without a name are the memberships of a LISTED user or channel, and it removes one only when
 *    both sides are listed. Anything else is reported in `notes` as left in place.
 *  - A role whose keys are missing is skipped with a note.
 *
 * Scope per role: open: channel groups, App Context users/channels/memberships, push registrations, files, history.
 * pam: revoke of the application-level Access Manager grant, plus the same lists as open when the role has any.
 * datasync: the same revoke (once when pam and datasync are one keyset), DataSync objects (janitor-datasync.ts), history.
 *
 * Run alone: `npm run test:integration:live:janitor`. The root hooks (hooks.ts) call it before and after the whole run.
 */
import PubNub from 'pubnub';
import { cleanDataSync } from './janitor-datasync';
import { CONCURRENCY, describeError, Ledger, MAX_PAGES, pause, pool, retry, statusCode } from './janitor-util';
import { env, redact, ROLES, type Env, type Role } from './env';
import { RESOURCES, type RoleResources } from './resources';

export interface JanitorReport {
  /** Everything removed. */
  removed: Array<{ role: Role; kind: string; name: string }>;
  /** Resources that could not be removed (after retries). A failure before the run fails the run. */
  failed: string[];
  /** Skipped parts, resources left in place on purpose, features that are off. */
  notes: string[];
  /** Failures that leave a keyset unsafe (the application-level grant could not be revoked). Always fail the run. */
  critical: string[];
  ms: number;
}

export interface JanitorOptions {
  roles?: readonly Role[];
  /** Replace the resource list (tests of the janitor itself). Defaults to resources.ts. */
  resources?: Readonly<Record<Role, RoleResources>>;
  env?: Env;
}

function clientFor(environment: Env, role: Role): PubNub | undefined {
  const keys = environment[role];
  if (!keys) return undefined;
  return new PubNub({
    ...keys,
    userId: 'janitor',
    logLevel: PubNub.LogLevel.None,
    heartbeatInterval: 0,
  });
}

/**
 * `grant({ read: false, write: false, ttl: 1 })` on a secret-key client replaces the application-level Access Manager (v2)
 * rights with none, which closes what the `grantAllChannelsAllAuthKeys` sample opened. Retried, then critical. The revoke takes up
 * to about 60 seconds to take effect, `verifyApplicationGrantClosed` waits for it.
 */
async function revokeApplicationGrant(client: PubNub, ledger: Ledger): Promise<void> {
  try {
    await retry(() => client.grant({ read: false, write: false, ttl: 1 }), 3);
    ledger.remove('application-level Access Manager grant', 'revoked');
  } catch (error) {
    ledger.critical.push(
      `${ledger.role} keyset: the application-level grant could not be revoked (${describeError(error)}). The keyset may be OPEN ` +
        'for reads until the grant ttl runs out (up to 1440 minutes). Revoke it in the Admin Portal.',
    );
  }
}

/**
 * Waits until a client WITHOUT a token is refused on the secured keyset (Access Manager enforces again). A revoke starts a clock of up
 * to about 60 seconds, and a test that expects a 403 for a tokenless client would fail on a keyset that still behaves as open.
 * The probe uses a channel no test ever grants. Returns the waiting time in ms, throws when the keyset stays open for `timeoutMs`.
 */
export async function verifyApplicationGrantClosed(
  keys: { publishKey: string; subscribeKey: string },
  timeoutMs = 120_000,
): Promise<number> {
  const started = Date.now();
  let last = '';
  for (let attempt = 1; ; attempt += 1) {
    // Only the publish and subscribe key: a client that holds the secret key would never be refused.
    const probe = new PubNub({
      publishKey: keys.publishKey,
      subscribeKey: keys.subscribeKey,
      userId: `janitor-probe-${attempt}`,
      logLevel: PubNub.LogLevel.None,
      heartbeatInterval: 0,
    });
    const channel = `janitor-probe-${Date.now().toString(36)}-${attempt}`;
    const open: string[] = [];
    const unclear: string[] = [];
    const ask = async (label: string, call: () => Promise<unknown>): Promise<void> => {
      try {
        await call();
        open.push(label);
      } catch (error) {
        if (statusCode(error) !== 403) unclear.push(`${label}: ${describeError(error)}`);
      }
    };
    try {
      await ask('publish', () => probe.publish({ channel, message: { probe: true } }));
      await ask('read', () => probe.fetchMessages({ channels: [channel], count: 1 }));
    } finally {
      probe.destroy();
    }
    // Closed only when both calls got a 403. An unclear answer (network, 5xx, 400) is retried, never taken as closed.
    if (open.length === 0 && unclear.length === 0) return Date.now() - started;
    last = [open.length ? `a client without a token could ${open.join(' and ')}` : '', unclear.join('; ')]
      .filter(Boolean)
      .join(', ');
    if (Date.now() - started + 3_000 > timeoutMs) break;
    await pause(3_000);
  }
  throw new Error(
    `the secured keyset still lets a client without a token through ${Math.round((Date.now() - started) / 1000)} s after the ` +
      `application-level grant was revoked (${last}). A grant from an earlier run is probably still effective (a revoke takes up ` +
      'to about 60 seconds to propagate). Check the keyset in the Admin Portal (Access Manager must be on), then run again.',
  );
}

/** Channel groups: listed names only. A group with no channel does not exist for the service. */
async function cleanChannelGroups(pn: PubNub, names: readonly string[], ledger: Ledger): Promise<void> {
  await pool(names, CONCURRENCY, async (channelGroup) => {
    try {
      const { channels } = await retry(() => pn.channelGroups.listChannels({ channelGroup }));
      if (channels.length === 0) return;
      await retry(() => pn.channelGroups.deleteGroup({ channelGroup }));
      ledger.remove('channel group', channelGroup);
    } catch (error) {
      ledger.fail('channel group', channelGroup, error);
    }
  });
}

/** Pages `fetch` until the cursor ends. */
async function allPages<T>(fetch: (next?: string) => Promise<{ data: T[]; next?: string }>): Promise<T[]> {
  const out: T[] = [];
  let next: string | undefined;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await retry(() => fetch(next));
    out.push(...response.data);
    next = response.next;
    if (!next || response.data.length === 0) break;
  }
  return out;
}

/**
 * App Context. Memberships first (referential integrity is off, so deleting a user or channel would leave them behind), then the
 * listed users and channels. Only memberships whose both sides are listed are removed.
 */
async function cleanAppContext(
  pn: PubNub,
  users: readonly string[],
  channels: readonly string[],
  ledger: Ledger,
): Promise<void> {
  const userSet = new Set(users);
  const channelSet = new Set(channels);
  const left = (text: string): void =>
    ledger.note(`App Context membership left in place, one side is not in resources.ts: ${text}`);

  await pool(users, CONCURRENCY, async (uuid) => {
    try {
      const memberships = await allPages((next) =>
        pn.objects.getMemberships({ uuid, limit: 100, page: next ? { next } : undefined }),
      );
      const own = memberships.map((m) => m.channel.id).filter((id) => channelSet.has(id));
      memberships
        .map((m) => m.channel.id)
        .filter((id) => !channelSet.has(id))
        .forEach((id) => left(`${uuid} -> ${id}`));
      if (own.length === 0) return;
      await retry(() => pn.objects.removeMemberships({ uuid, channels: own }));
      own.forEach((id) => ledger.remove('App Context membership', `${uuid} -> ${id}`));
    } catch (error) {
      if (statusCode(error) !== 404) ledger.fail('App Context memberships of user', uuid, error);
    }
  });
  await pool(channels, CONCURRENCY, async (channel) => {
    try {
      const members = await allPages((next) =>
        pn.objects.getChannelMembers({ channel, limit: 100, page: next ? { next } : undefined }),
      );
      const own = members.map((m) => m.uuid.id).filter((id) => userSet.has(id));
      members
        .map((m) => m.uuid.id)
        .filter((id) => !userSet.has(id))
        .forEach((id) => left(`${id} -> ${channel}`));
      if (own.length === 0) return;
      await retry(() => pn.objects.removeChannelMembers({ channel, uuids: own }));
      own.forEach((id) => ledger.remove('App Context member', `${id} -> ${channel}`));
    } catch (error) {
      if (statusCode(error) !== 404) ledger.fail('App Context members of channel', channel, error);
    }
  });

  const removeObject = async (
    kind: string,
    name: string,
    get: () => Promise<unknown>,
    del: () => Promise<unknown>,
  ): Promise<void> => {
    try {
      await retry(get);
    } catch (error) {
      if (statusCode(error) !== 404) ledger.fail(kind, name, error);
      return;
    }
    try {
      await retry(del);
      ledger.remove(kind, name);
    } catch (error) {
      if (statusCode(error) !== 404) ledger.fail(kind, name, error);
    }
  };
  await pool(users, CONCURRENCY, (uuid) =>
    removeObject(
      'App Context user',
      uuid,
      () => pn.objects.getUUIDMetadata({ uuid }),
      () => pn.objects.removeUUIDMetadata({ uuid }),
    ),
  );
  await pool(channels, CONCURRENCY, (channel) =>
    removeObject(
      'App Context channel',
      channel,
      () => pn.objects.getChannelMetadata({ channel }),
      () => pn.objects.removeChannelMetadata({ channel }),
    ),
  );
}

/** Gateways the old janitor covered: fcm, apns (v1) and both apns2 environments with the docs topic. */
function gatewaysOf(pn: PubNub): Array<{
  label: string;
  list: (device: string) => Promise<{ channels: string[] }>;
  remove: (device: string) => Promise<unknown>;
}> {
  const topic = 'com.example.bundle_id';
  return [
    {
      label: 'fcm',
      list: (device) => pn.push.listChannels({ device, pushGateway: 'fcm' }),
      remove: (device) => pn.push.deleteDevice({ device, pushGateway: 'fcm' }),
    },
    {
      label: 'apns',
      list: (device) => pn.push.listChannels({ device, pushGateway: 'apns' }),
      remove: (device) => pn.push.deleteDevice({ device, pushGateway: 'apns' }),
    },
    ...(['production', 'development'] as const).map((environment) => ({
      label: `apns2/${environment}`,
      list: (device: string) => pn.push.listChannels({ device, pushGateway: 'apns2', environment, topic }),
      remove: (device: string) => pn.push.deleteDevice({ device, pushGateway: 'apns2', environment, topic }),
    })),
  ];
}

/**
 * Push registrations of the listed tokens on every gateway. A 400 or 403 answer to the listing means "not applicable" (push add-on
 * off, or a token format the gateway rejects, such as `niceDevice` on apns): noted once, not a failure.
 */
async function cleanPush(pn: PubNub, devices: readonly string[], ledger: Ledger): Promise<void> {
  const jobs = devices.flatMap((device) => gatewaysOf(pn).map((gateway) => ({ device, gateway })));
  await pool(jobs, CONCURRENCY, async ({ device, gateway }) => {
    const name = `${device.slice(0, 8)}... on ${gateway.label}`;
    let channels: string[];
    try {
      channels = (await retry(() => gateway.list(device))).channels;
    } catch (error) {
      const code = statusCode(error);
      if (code === 400 || code === 403 || code === 404)
        ledger.note(`push ${gateway.label} not applicable (${describeError(error)})`);
      else ledger.fail('push device', name, error);
      return;
    }
    if (channels.length === 0) return;
    try {
      await retry(() => gateway.remove(device));
      ledger.remove('push device', name);
    } catch (error) {
      ledger.fail('push device', name, error);
    }
  });
}

/** Files on the listed file channels. Pages through the listing (100 per page) before deleting, so deletes cannot shift pages. */
async function cleanFiles(pn: PubNub, channels: readonly string[], ledger: Ledger): Promise<void> {
  await pool(channels, CONCURRENCY, async (channel) => {
    let files: Array<{ id: string; name: string }>;
    try {
      files = await allPages((next) =>
        pn.listFiles({ channel, limit: 100, next }).then((r) => ({ data: r.data, next: r.next })),
      );
    } catch (error) {
      // Files off on the keyset, or a channel that never had a file, both leave nothing behind unless the call is a real failure.
      if (statusCode(error) === 404) return;
      if (statusCode(error) === 400 || statusCode(error) === 403) {
        ledger.note(`files not available on this keyset (${describeError(error)})`);
        return;
      }
      ledger.fail('files of channel', channel, error);
      return;
    }
    await pool(files, 4, async (file) => {
      try {
        await retry(() => pn.deleteFile({ channel, id: file.id, name: file.name }));
        ledger.remove('file', `${channel}/${file.name}`);
      } catch (error) {
        if (statusCode(error) !== 404) ledger.fail('file', `${channel}/${file.name}`, error);
      }
    });
  });
}

/**
 * Message history of the listed channels, deleted with `deleteMessages` and no start/end (full range). Only channels that have a
 * message are touched (one multi-channel `fetchMessages` per 50 channels finds them). A keyset that refuses it with 403 (Delete-From-History
 * off) or has no Message Persistence is skipped with a note.
 */
async function cleanHistory(pn: PubNub, channels: readonly string[], ledger: Ledger): Promise<void> {
  const withMessages: string[] = [];
  for (let i = 0; i < channels.length; i += 50) {
    const chunk = channels.slice(i, i + 50);
    try {
      const response = await retry(() => pn.fetchMessages({ channels: chunk, count: 1 }));
      for (const [channel, messages] of Object.entries(response.channels ?? {}))
        if (messages.length > 0) withMessages.push(channel);
    } catch (error) {
      const code = statusCode(error);
      if (code === 400 || code === 403) {
        ledger.note(`history not readable, history deletion skipped (${describeError(error)})`);
        return;
      }
      ledger.fail('history read of channels', chunk.join(','), error);
    }
  }
  let refused = false;
  await pool(withMessages, CONCURRENCY, async (channel) => {
    if (refused) return;
    try {
      await retry(() => pn.deleteMessages({ channel }));
      ledger.remove('history of channel', channel);
    } catch (error) {
      if (statusCode(error) === 403) {
        refused = true;
        ledger.note(`Delete-From-History is off, history deletion skipped (${describeError(error)})`);
      } else {
        ledger.fail('history of channel', channel, error);
      }
    }
  });
}

const unique = (...lists: Array<readonly string[] | undefined>): string[] => [
  ...new Set(lists.flatMap((l) => l ?? [])),
];

/** Cleans every role (or `options.roles`). Never throws for an ordinary failure, they are collected in the report. */
export async function runJanitor(options: JanitorOptions = {}): Promise<JanitorReport> {
  const started = Date.now();
  const environment = options.env ?? env();
  const resources = options.resources ?? RESOURCES;
  const report: JanitorReport = { removed: [], failed: [], notes: [], critical: [], ms: 0 };
  const take = (ledger: Ledger): void => {
    report.removed.push(...ledger.removed);
    report.failed.push(...ledger.failed);
    report.notes.push(...ledger.notes);
    report.critical.push(...ledger.critical);
  };

  for (const role of options.roles ?? ROLES) {
    const ledger = new Ledger(role);
    const client = clientFor(environment, role);
    if (!client) {
      ledger.note(`skipped, keys missing: ${environment.missing[role].join(', ')}`);
      take(ledger);
      continue;
    }
    const list = resources[role];
    try {
      if (role !== 'open') {
        // pam and datasync may be one keyset: revoke it once, on the pam role.
        if (role === 'datasync' && environment.sharedSecured && environment.pam)
          ledger.note('same keyset as pam, grant revoked there');
        else await revokeApplicationGrant(client, ledger);
      }
      const groups = list.channelGroups ?? [];
      const files = list.fileChannels ?? [];
      const steps: Array<() => Promise<void>> = [];
      if (groups.length) steps.push(() => cleanChannelGroups(client, groups, ledger));
      const users = list.appContext?.users ?? [];
      const appChannels = list.appContext?.channels ?? [];
      if (users.length || appChannels.length) steps.push(() => cleanAppContext(client, users, appChannels, ledger));
      if (list.pushDevices?.length) steps.push(() => cleanPush(client, list.pushDevices!, ledger));
      if (files.length) steps.push(() => cleanFiles(client, files, ledger));
      if (list.dataSync) steps.push(() => cleanDataSync(client, list.dataSync!, ledger));
      for (const step of steps) await step();
      // History last: files and objects above may publish nothing, but earlier steps are independent of it.
      const history = unique(list.channels, list.fileChannels);
      if (history.length) await cleanHistory(client, history, ledger);
    } catch (error) {
      ledger.fail('janitor step', role, error);
    } finally {
      client.destroy();
      take(ledger);
    }
  }
  report.ms = Date.now() - started;
  return report;
}

/** Console lines of a report: counts per kind, names, notes, failures. Everything is redacted. */
export function formatReport(report: JanitorReport): string[] {
  const lines: string[] = [];
  const byKind = new Map<string, string[]>();
  for (const { role, kind, name } of report.removed)
    byKind.set(`${role} ${kind}`, [...(byKind.get(`${role} ${kind}`) ?? []), name]);
  lines.push(`janitor: removed ${report.removed.length} item(s) in ${(report.ms / 1000).toFixed(1)} s`);
  for (const [kind, names] of byKind) lines.push(`  removed ${kind}: ${names.length} (${names.join(', ')})`);
  for (const note of report.notes) lines.push(`  note: ${note}`);
  for (const failure of report.failed) lines.push(`  COULD NOT REMOVE ${failure}`);
  for (const critical of report.critical) lines.push(`  CRITICAL ${critical}`);
  return lines.map(redact);
}
