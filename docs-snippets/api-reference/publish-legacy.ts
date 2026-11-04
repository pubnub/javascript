import assert from '../harness/assert.js';
import PubNub from 'pubnub';
import { check, page } from '../harness/step.js';
import { sleep, watch } from '../harness/wait.js';
import { rejectsValidation } from '../harness/assertions.js';

/**
 * docs/sdks/javascript/api-reference/publish-legacy.md
 *
 * Keyset: open. Phase: P8 "Legacy". In the Sneaker Drop story this covers the old fire-and-forget way to announce a
 * drop to Functions only.
 *
 * The page has no code sample, only prose about `fire()`. The snippet `fireBasicUsage` lives in `publish.ts` (P8, kept
 * with the other publish samples so the id stays together). These checks have no snippet markers, they prove the
 * page's claims: `fire()` resolves with `undefined` and swallows request errors, and the replacement
 * `publish({ storeInHistory: false, replicate: false })` returns a timetoken, reports errors and neither reaches
 * subscribers nor Message Persistence.
 */
export default page('api-reference/publish-legacy', 'P8', (world) => {
  // Records a docs/SDK mismatch: the TypeScript type promises a PublishResponse but fire() resolves with undefined.
  check('publishLegacyFireResolvesUndefined', { proves: 'fire() resolves with undefined although the TypeScript type promises a response.' }, async () => {
    const channel = world.n('my_channel');
    const response = await world.shopper.fire({ channel, message: { legacy: 'fire' } });
    // The TypeScript signature promises a PublishResponse, the runtime value is undefined.
    assert.equal(response, undefined);
  });

  // Same client twice: publish() rejects with a validation error, fire() swallows it. A client without publishKey is the cheapest reproducible error.
  check('publishLegacyFireDiscardsErrors', { proves: 'publish rejects with a validation error on a bad client while fire swallows it.' }, async () => {
    // A client without publishKey cannot publish. publish() reports it, fire() does not.
    const noPublishKey = world.track(
      new PubNub({ subscribeKey: world.env.open!.subscribeKey, userId: world.n('fire-no-key') }),
    );
    const channel = world.n('my_channel');
    await rejectsValidation(noPublishKey.publish({ channel, message: { legacy: 'publish' } }), /Missing 'publishKey'/);
    assert.equal(await noPublishKey.fire({ channel, message: { legacy: 'fire' } }), undefined, 'fire() resolves undefined and discards the error');
  });

  // Proves the replacement call. The two negative claims (no delivery, no storage) cannot wait for an event,
  // so the check sleeps 4 seconds and then reads history. Needs persistence so the empty history means "not stored"
  // and not "persistence is off".
  check('publishLegacyReplacementDoesNotReplicateOrStore', { needs: ['preflightPersistence'], timeout: 45_000, proves: 'The fire replacement call is neither delivered to subscribers nor stored in history.' }, async () => {
    const channel = world.n('fire_replacement');
    const listening = await watch(world.fresh('observer'), [channel]);
    const response = await world.shopper.publish({
      channel,
      message: { legacy: 'not-replicated' },
      storeInHistory: false,
      replicate: false,
    });
    world.check.timetoken(response.timetoken);
    await sleep(4000);
    assert.ok(
      !listening.events.some((e) => (e.event as { message?: { legacy?: string } }).message?.legacy === 'not-replicated'),
      'with replicate: false the message does not reach subscribers',
    );
    const history = await world.observer.fetchMessages({ channels: [channel], count: 25 });
    assert.equal(history.channels[channel]?.length ?? 0, 0, 'with storeInHistory: false nothing is stored');
    listening.stop();
  });
});
