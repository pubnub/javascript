import assert from 'node:assert/strict';
import PubNub from 'pubnub';
import { assertTimetoken, rejectsValidation } from '../support/assertions';
import { keysOf } from '../support/env';
import { unique } from '../support/util';
import { observer, shopper, track } from '../support/clients';
import { sleep, watch } from '../support/wait';

/**
 * Examples for the deprecated `fire()` method and its replacement. Port of docs-snippets/api-reference/publish-legacy.ts.
 * The page has no snippet markers: every test is a behaviour check. Channels are unique per run (nothing is stored on them,
 * and a unique name keeps the "nothing arrived" checks free of other runs' traffic).
 */
describe('api-reference/publish-legacy', () => {
  it('publishLegacyFireResolvesUndefined: fire() resolves with undefined although the TypeScript type promises a response', async () => {
    const response = await shopper().fire({ channel: unique('fire_undefined'), message: { legacy: 'fire' } });
    // The TypeScript signature promises a PublishResponse, the runtime value is undefined.
    assert.equal(response, undefined);
  });

  it('publishLegacyFireDiscardsErrors: publish rejects with a validation error on a bad client while fire swallows it', async () => {
    // A client without publishKey cannot publish. publish() reports it, fire() does not.
    const noPublishKey = track(
      new PubNub({ subscribeKey: keysOf('open').subscribeKey, userId: unique('fire-no-key') }),
    );
    const channel = unique('fire_errors');
    await rejectsValidation(noPublishKey.publish({ channel, message: { legacy: 'publish' } }), /Missing 'publishKey'/);
    assert.equal(
      await noPublishKey.fire({ channel, message: { legacy: 'fire' } }),
      undefined,
      'fire() resolves undefined and discards the error',
    );
  });

  it('publishLegacyReplacementDoesNotReplicateOrStore: the fire replacement call is neither delivered to subscribers nor stored in history', async function () {
    this.timeout(45_000);
    const channel = unique('fire_replacement');
    const listening = await watch(observer(), [channel]);
    const response = await shopper().publish({
      channel,
      message: { legacy: 'not-replicated' },
      storeInHistory: false,
      replicate: false,
    });
    assertTimetoken(response.timetoken);
    // Proves that nothing arrived, so a fixed wait is right.
    await sleep(4000);
    assert.ok(
      !listening.events.some(
        (e) => (e.event as { message?: { legacy?: string } }).message?.legacy === 'not-replicated',
      ),
      'with replicate: false the message does not reach subscribers',
    );
    // The channel name is unique to this run, so any stored message here would be this one.
    const history = await observer().fetchMessages({ channels: [channel], count: 25 });
    assert.equal(history.channels[channel]?.length ?? 0, 0, 'with storeInHistory: false nothing is stored');
    listening.stop();
  });
});
