import { explainError } from './guard.js';
import assert from './assert.js';
import { readFeatures, missingFeatures } from './keyset-features.js';
import { registry } from './registry.js';
import { page, check } from './step.js';
import { eventually, watch } from './wait.js';
import type { Role } from './env.js';

/**
 * One message per keyset that names every missing feature (design rule: "Presence is off on the open keyset", never a
 * guess from a failed call). Registered last in run.ts, so these checks run after every other P0 preflight.
 *
 * Per role:
 *  1. With PUBNUB_ADMIN_API_KEY and a keyset id, read the keyset configuration through the Admin API (read only,
 *     keyset-features.ts). Without them, this part is skipped and says so.
 *  2. Confirm each feature with one SDK probe. Features with their own preflight step (Presence, Message Persistence,
 *     Delete-From-History, App Context, Files, Mobile Push) are not probed twice: their recorded results are collected.
 *     The features without one are probed here: Stream Controller wildcard subscribe and App Context events on the open
 *     keyset, Access Manager with token revocation on the pam keyset, Access Manager and the DataSync classes on the datasync
 *     keyset.
 *  3. Fail once, with every missing feature in one message. Nothing is ever changed on a keyset.
 *
 * DataSync event rules have no API. They stay a probe in api-reference/datasync.ts (`datasyncEvents`, skips as
 * needs-feature:datasync-events).
 */
const OTHER_PREFLIGHTS: Record<string, string> = {
  preflightKeyset: 'working keys (publish)',
  preflightPersistence: 'Message Persistence',
  preflightDeleteFromHistory: 'Message Persistence Delete-From-History',
  preflightPresence: 'Presence with tracking on all channels',
  preflightAppContext: 'App Context',
  preflightFiles: 'Files',
  preflightMobilePush: 'Mobile Push Notifications',
};

export default page('harness/preflight-summary', 'P0', (world) => {
  /** Admin API part, shared by the three checks. Returns missing features and a note for the log. */
  const adminPart = async (role: Role): Promise<{ missing: string[]; note: string }> => {
    try {
      const read = await readFeatures(world.env, role);
      if (read.status === 'read')
        return {
          missing: missingFeatures(role, read.config),
          note: `${role} keyset configuration read through the Admin API`,
        };
      if (read.status === 'mismatch')
        return { missing: [`the Admin API keyset id for role ${role} is wrong: ${read.why}`], note: '' };
      return { missing: [], note: `Admin API read of the ${role} keyset skipped (${read.why}), SDK probes only` };
    } catch (error) {
      return {
        missing: [],
        note: `Admin API read of the ${role} keyset failed (${(error as Error).message}), SDK probes only`,
      };
    }
  };

  const finish = (role: Role, missing: string[], notes: string[]): void => {
    for (const note of notes.filter(Boolean)) console.log(note);
    // Each feature once, even when the Admin API and a probe both report it.
    const unique = [...new Set(missing)];
    assert.deepEqual(unique, [], `features of the ${role} keyset`);
  };

  check(
    'preflightFeaturesOpen',
    {
      timeout: 90_000,
      proves: 'Preflight: the open keyset has every feature the open samples need, named in one message when not.',
    },
    async () => {
      const { missing, note } = await adminPart('open');
      for (const [id, feature] of Object.entries(OTHER_PREFLIGHTS)) {
        const result = registry.result(id);
        if (result?.status === 'failed')
          missing.push(`${feature} is not usable on the open keyset (preflight ${id} failed: ${result.error ?? ''})`);
        if (result?.status === 'skipped' && result.reason?.startsWith('needs-feature:'))
          missing.push(`${feature} is off on the open keyset (${result.reason})`);
      }
      // Stream Controller with wildcard subscribe: a wildcard subscription receives a publish to a matching channel.
      try {
        const root = world.n('preflight_wild');
        const listener = await watch(world.fresh('preflightwild'), [`${root}.*`]);
        try {
          await world.observer.publish({ channel: `${root}.probe`, message: { wildcard: true } });
          await listener.next('message', (m) => m.channel === `${root}.probe`, { timeout: 10_000 });
        } finally {
          listener.stop();
        }
      } catch (error) {
        explainError(error);
        missing.push(
          `Stream Controller wildcard subscribe is not working on the open keyset (${(error as Error).message})`,
        );
      }
      // App Context events: a subscriber of a channel receives the objects event of its channel metadata.
      try {
        const channel = world.n('preflight_channel');
        const listener = await watch(world.fresh('preflightobjects'), [channel]);
        try {
          await world.observer.objects.setChannelMetadata({ channel, data: { name: 'preflight' } });
          await listener.next('objects', (e) => e.channel === channel, { timeout: 15_000 });
        } finally {
          listener.stop();
          await world.observer.objects.removeChannelMetadata({ channel }).catch(() => undefined);
        }
      } catch (error) {
        explainError(error);
        missing.push(
          `App Context channel metadata events are not delivered on the open keyset (${(error as Error).message})`,
        );
      }
      finish('open', missing, [note]);
    },
  );

  /** Access Manager probe for a secured role: grant a token, and with `revoke` also revoke it. */
  const accessManagerProbe = async (role: 'pam' | 'datasync', revoke: boolean, missing: string[]): Promise<void> => {
    let token: string | undefined;
    try {
      token = await world.server.grantToken({
        ttl: 1,
        authorized_uuid: world.n('am-v2-user'),
        resources: { channels: { [world.n('am_other')]: { read: true } } },
      });
      assert.ok(token, 'grantToken returned a token');
    } catch (error) {
      explainError(error);
      missing.push(`Access Manager is not usable on the ${role} keyset (${(error as Error).message})`);
      return;
    }
    if (!revoke) return;
    try {
      await world.server.revokeToken(token);
    } catch (error) {
      explainError(error);
      missing.push(`Access Manager token revocation is off on the ${role} keyset (${(error as Error).message})`);
    }
  };

  check(
    'preflightFeaturesPam',
    {
      keyset: 'pam',
      timeout: 60_000,
      proves: 'Preflight: the pam keyset has Access Manager with token revocation, named in one message when not.',
    },
    async () => {
      const { missing, note } = await adminPart('pam');
      await accessManagerProbe('pam', true, missing);
      finish('pam', missing, [note]);
    },
  );

  check(
    'preflightFeaturesDatasync',
    {
      keyset: 'datasync',
      timeout: 60_000,
      proves:
        'Preflight: the datasync keyset has Access Manager, DataSync and the product and ProductOwner classes, named in one message when not.',
    },
    async () => {
      const { missing, note } = await adminPart('datasync');
      await accessManagerProbe('datasync', false, missing);
      const ds = world.server.dataSync;
      try {
        await ds.getUsers({ limit: 1 });
      } catch (error) {
        explainError(error);
        missing.push(`DataSync is not usable on the datasync keyset (${(error as Error).message})`);
      }
      for (const [label, read] of [
        ['class product v1', () => ds.getEntities({ class: 'product', classVersion: 1, limit: 1 })],
        ['class ProductOwner v1', () => ds.getRelationships({ class: 'ProductOwner', classVersion: 1, limit: 1 })],
      ] as const) {
        try {
          await eventually(
            async () => {
              await read();
            },
            { timeout: 5_000, label },
          );
        } catch (error) {
          missing.push(`DataSync ${label} is missing on the datasync keyset (run npm run docs-snippets:provision)`);
        }
      }
      finish('datasync', missing, [note, 'DataSync event rules have no API, the step datasyncEvents probes them']);
    },
  );
});
