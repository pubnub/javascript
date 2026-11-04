// snippet.importPubNub
import PubNub from 'pubnub';
// snippet.end
// snippet.importFS
import fs from 'fs';
// snippet.end
import assert from '../harness/assert.js';
import { page, step } from '../harness/step.js';

/**
 * Shared snippet ids that many docs pages embed next to their own snippet: `importPubNub` (the one line import) and
 * `PubNubinitBasicUsage` (the generic client constructor). They belong to no single page, hence the `shared/` folder.
 *
 * Keyset: open. Phase: P0 (boot). Story: this is the first thing Sneaker Drop code does, build a client from the keys.
 *
 * Proves: the constructor snippet runs with real keys (hidden `...world.live.open` replaces the placeholders), the user
 * id gets the run suffix from the stage rewrite (`YOUR_USER_ID` is registered), and a request that needs the subscribe key
 * succeeds. Does not prove: any feature beyond reaching the service. Configuration options live in configuration.ts.
 *
 * `importPubNub` and `importFS` are import-only and sit at module level, which the marker lint allows for imports. They are
 * compiled by `tsc` (a rename of the default export breaks `npm run test:docs-snippets:types`) but no step runs them. `importFS` lives here
 * because the file sharing page shows it between `importPubNub` and `PubNubinitBasicUsage` in one block. The file sharing
 * steps use their own `fs` import (api-reference/file-sharing.ts).
 */
export default page('shared/import-pubnub', 'P0', (world) => {
  // Constructs the docs client with live keys, then proves it works with a cheap keyed call (`time`).
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

    // The snippet builds its own client, so register it for destroy() at the end of the run.
    world.track(pubnub);
    assert.equal(pubnub.getUserId(), world.n('YOUR_USER_ID'));
    // The user id came through the staged rewrite, so it carries the run suffix.
    // The keys are real: a request that needs the subscribe key succeeds.
    world.check.serverTime((await pubnub.time()).timetoken);
  });
});
