import assert from './assert.js';
import { explainError } from './guard.js';
import { preflightMessage } from './preflight-errors.js';
import { page, check } from './step.js';
import { eventually, PRESENCE_TIMEOUT, watch } from './wait.js';

/**
 * Keyset capability checks. The first live run showed that a keyset without Presence,
 * Storage Delete or App Context makes many snippets fail with the same opaque 403. A preflight turns that into
 * one named failure, and steps that `needs` it are skipped as `blocked-by:<preflight>`, so one root cause
 * shows as one failure.
 */
export default page('harness/preflight', 'P0', (world) => {
  // One throw per cause, with a message that names the Admin Portal setting. `explainError` first appends the service's
  // own message to the SDK's generic one, so the report line explains itself.
  const fail = (feature: string, setting: string, error: unknown): never => {
    explainError(error);
    throw new Error(preflightMessage(error, 'open', feature, setting));
  };

  // Keys and network first, so a mistyped key or an offline machine reads as that and not as three missing features.
  check('preflightKeyset', { proves: 'Preflight: the open keyset keys work and the network is reachable, shown by a publish.' }, async () => {
    try {
      await world.observer.publish({ channel: world.n('preflight_channel'), message: { preflight: true } });
    } catch (error) {
      fail('working keys (publish and subscribe)', 'a publish and subscribe key pair', error);
    }
  });

  // Each preflight below depends on the previous one, so one broken key shows one failure and the rest are blocked-by.
  check('preflightPersistence', { needs: ['preflightKeyset'], proves: 'Preflight: Message Persistence is enabled on the open keyset.' }, async () => {
    try {
      await world.observer.fetchMessages({ channels: [world.n('preflight_channel')], count: 1 });
    } catch (error) {
      fail('Message Persistence', 'Message Persistence', error);
    }
  });

  check('preflightDeleteFromHistory', { needs: ['preflightPersistence'], proves: 'Preflight: Delete-From-History is enabled on the open keyset.' }, async () => {
    // Deleting an empty range on an unused channel has no side effect. 403 means the setting is off.
    const now = (await world.observer.time()).timetoken;
    try {
      await world.observer.deleteMessages({ channel: world.n('preflight_channel'), start: (BigInt(now) - 1n).toString(), end: now });
    } catch (error) {
      fail('"delete from history"', 'Delete-From-History (Storage Delete)', error);
    }
  });

  // Presence has no cheap read-only probe. Subscribe a fresh client and wait until hereNow lists it. That depends on
  // heartbeats, hence the longer timeout and the short-heartbeat client options.
  check('preflightPresence', { needs: ['preflightKeyset'], timeout: 60_000, proves: 'Preflight: Presence is enabled and tracks a subscribed client in hereNow.' }, async () => {
    const channel = world.n('preflight_channel');
    const client = world.fresh('preflightpresence', world.presenceOptions);
    await watch(client, [channel]);
    try {
      await eventually(async () => {
        const here = await world.observer.hereNow({ channels: [channel] });
        assert.equal(here.channels[channel]?.occupancy, 1, 'hereNow does not list the subscribed client');
      }, { timeout: PRESENCE_TIMEOUT, label: 'client visible in hereNow' });
    } catch (error) {
      fail('Presence', 'Presence', error);
    }
  });
});
