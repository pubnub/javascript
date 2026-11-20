import assert from 'node:assert/strict';
// snippet.importPubNub
import PubNub from 'pubnub';
// snippet.end
// snippet.importFS
import fs from 'fs';
// snippet.end
import { assertServerTime } from '../support/assertions';
import { track } from '../support/clients';
import { openKeys } from '../support/env';

/**
 * Shared examples used next to the examples of many pages: the SDK import line, the `fs` import for Node.js file sharing and
 * the generic client constructor.
 * The two import snippets sit at the top of the file because an import cannot sit inside a test. They run when the file loads
 * and the tests below prove that the imported names are the real thing.
 */

describe('shared/import-pubnub', () => {
  it('importPubNub: the import line gives the PubNub constructor', () => {
    assert.equal(typeof PubNub, 'function');
    assert.equal(typeof PubNub.CryptoModule.aesCbcCryptoModule, 'function');
  });

  it('importFS: the fs import line gives the Node.js file system module', () => {
    assert.equal(typeof fs.readFileSync, 'function');
    assert.equal(fs.existsSync(__filename), true);
  });

  it('PubNubinitBasicUsage: the generic init sample builds a working client and time() succeeds', async () => {
    // snippet.PubNubinitBasicUsage
    // Initialize PubNub with your keys
    const pubnub = new PubNub({
      publishKey: 'YOUR_PUBLISH_KEY',
      subscribeKey: 'YOUR_SUBSCRIBE_KEY',
      userId: 'YOUR_USER_ID',
      // snippet.hide
      ...openKeys(),
      // snippet.show
    });
    // snippet.end

    track(pubnub);
    assert.equal(pubnub.getUserId(), 'YOUR_USER_ID');
    assertServerTime((await pubnub.time()).timetoken);
  });
});
