// snippet.importPubNub
import PubNub from 'pubnub';
// snippet.end
// snippet.importFS
import fs from 'fs';
// snippet.end
import assert from '../harness/assert.js';
import { page, step } from '../harness/step.js';

/**
 * Shared examples used next to the examples of many pages: the SDK import line, the `fs` import for Node.js file
 * sharing and the generic client constructor.
 */
export default page('shared/import-pubnub', 'P0', (world) => {
  step('PubNubinitBasicUsage', { proves: 'The generic init sample builds a working client and time() succeeds.' }, async () => {
    // snippet.PubNubinitBasicUsage
    // Initialize PubNub with your keys
    const pubnub = new PubNub({
      publishKey: 'YOUR_PUBLISH_KEY',
      subscribeKey: 'YOUR_SUBSCRIBE_KEY',
      userId: 'YOUR_USER_ID',
      // snippet.hide
      ...world.live.open,
      // snippet.show
    });
    // snippet.end

    world.track(pubnub);
    assert.equal(pubnub.getUserId(), world.n('YOUR_USER_ID'));
    world.check.serverTime((await pubnub.time()).timetoken);
  });
});
