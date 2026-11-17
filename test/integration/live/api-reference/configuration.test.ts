import assert from 'node:assert/strict';
import PubNub from 'pubnub';
import { assertServerTime } from '../support/assertions';
import { createClient, friend, shopper, track } from '../support/clients';
import { quietConsole } from '../support/console';
import { keysOf, openKeys, securedKeys, subscribeKeyOnly } from '../support/env';
import { eventually, watch } from '../support/wait';

/**
 * Configuration examples. Port of docs-snippets/api-reference/configuration.ts.
 * The samples show placeholder keys. The hidden spread after them puts the real keys of the keyset in, so the text readers see
 * stays generic. The spread is typed Partial, otherwise TypeScript reports the overwritten visible keys (TS2783).
 */

describe('api-reference/configuration', () => {
  it('configurationBasicUsage: the full constructor sample yields a working client with its user id, auth key, crypto module and Debug logging, and time() succeeds', async () => {
    // Debug level makes the SDK print its configuration, which holds the keys. Keep it out of the test output.
    const debugLog = quietConsole();
    // snippet.configurationBasicUsage
    // Initialize PubNub with your keys
    const pubnubConfig = new PubNub({
      subscribeKey: 'YOUR_SUBSCRIBE_KEY',
      publishKey: 'YOUR_PUBLISH_KEY',
      userId: 'YOUR_USER_ID',
      cryptoModule: PubNub.CryptoModule?.aesCbcCryptoModule({ cipherKey: 'YOUR_CIPHER_KEY' }),
      authKey: 'accessMangerToken',
      logLevel: PubNub.LogLevel.Debug,
      ssl: true,
      presenceTimeout: 130,
      // snippet.hide
      ...openKeys(),
      // snippet.show
    });

    // snippet.end
    track(pubnubConfig);
    try {
      assert.equal(pubnubConfig.getUserId(), 'YOUR_USER_ID');
      assert.equal(pubnubConfig.getAuthKey(), 'accessMangerToken');
      // cryptoModule is active: encrypt and decrypt round trip. encrypt() with a crypto module takes a string and decrypt()
      // JSON-parses the plain text, so pass stringified JSON.
      assert.deepEqual(pubnubConfig.decrypt(pubnubConfig.encrypt(JSON.stringify({ greeting: 'hello' }))), {
        greeting: 'hello',
      });
      assertServerTime((await pubnubConfig.time()).timetoken);
    } finally {
      debugLog.restore();
    }
    assert.ok(debugLog.lines.length > 0, 'the Debug logger wrote no output, so logLevel: Debug did not take effect');
  });

  it('configurationServerOpertaion: the server configuration sample builds a client with the secret key and its user id, and time() succeeds', async () => {
    // snippet.configurationServerOpertaion
    const pubnubServer = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      userId: 'myUniqueUserId',
      secretKey: 'secretKey',
      heartbeatInterval: 0,
      // snippet.hide
      ...securedKeys(),
      // snippet.show
    });
    // snippet.end
    track(pubnubServer);
    assert.equal(pubnubServer.getUserId(), 'myUniqueUserId');
    assertServerTime((await pubnubServer.time()).timetoken);
  });

  // The id keeps the docs' spelling ("Real"). A subscribe-only client has no publishKey, so the SDK refuses to publish
  // locally. The `time()` call shows the subscribe key itself is valid.
  it('configurationRealOnlyClient: a client with only a subscribe key works for time() and refuses to publish locally', async () => {
    // snippet.configurationRealOnlyClient
    // Initialize for Read Only Client

    const pubnubReadOnly = new PubNub({
      subscribeKey: 'mySubscribeKey',
      userId: 'myUniqueUserId',
      // snippet.hide
      ...subscribeKeyOnly(),
      // snippet.show
    });
    // snippet.end
    track(pubnubReadOnly);
    // Read-only means no publishKey: publishing is refused before any request is sent.
    await assert.rejects(
      pubnubReadOnly.publish({ channel: 'my_channel', message: { text: 'x' } }),
      (error: unknown) => {
        assert.match(JSON.stringify((error as { status?: unknown }).status), /publishKey/);
        return true;
      },
    );
    assertServerTime((await pubnubReadOnly.time()).timetoken);
  });

  it("configurationCryptoModule: two clients with different crypto modules decrypt each other's data as the sample comments claim", () => {
    // snippet.configurationCryptoModule
    // encrypts using 256-bit AES-CBC cipher (recommended)
    // decrypts data encrypted with the legacy and the 256 bit AES-CBC ciphers
    const pubnub = new PubNub({
      subscribeKey: 'YOUR_SUBSCRIBE_KEY',
      userId: 'YOUR_USER_ID',
      cryptoModule: PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'pubnubenigma' }),
      // snippet.hide
      ...subscribeKeyOnly(),
      // snippet.show
    });

    // encrypts with 128-bit cipher key entropy (legacy)
    // decrypts data encrypted with the legacy and the 256-bit AES-CBC ciphers
    const pubnubLegacy = new PubNub({
      subscribeKey: 'YOUR_SUBSCRIBE_KEY',
      userId: 'YOUR_USER_ID',
      cryptoModule: PubNub.CryptoModule.legacyCryptoModule({ cipherKey: 'pubnubenigma' }),
      // snippet.hide
      ...subscribeKeyOnly(),
      // snippet.show
    });
    // snippet.end
    track(pubnub);
    track(pubnubLegacy);
    const payload = JSON.stringify({ note: 'same input' });
    assert.deepEqual(pubnub.decrypt(pubnubLegacy.encrypt(payload)), { note: 'same input' });
    assert.deepEqual(pubnubLegacy.decrypt(pubnub.encrypt(payload)), { note: 'same input' });
    // The two modules produce different ciphertext (random IVs, different headers), so the choice is applied.
    assert.notEqual(pubnub.encrypt(payload), pubnubLegacy.encrypt(payload));
  });

  it('setUserIdBasicUsage: setUserId renames the user and the client keeps working', async () => {
    const pubnub = shopper();
    // snippet.setUserIdBasicUsage
    pubnub.setUserId('myUniqueUserId');
    // snippet.end
    assert.equal(pubnub.getUserId(), 'myUniqueUserId');
    assertServerTime((await pubnub.time()).timetoken);
  });

  it('getUserIdBasicUsage: getUserId returns the user id given at construction', () => {
    const pubnub = shopper();
    // snippet.getUserIdBasicUsage
    const currentUserId = pubnub.getUserId();
    // snippet.end
    assert.equal(currentUserId, 'shopper');
    assert.equal(currentUserId, pubnub.userId);
  });

  // Local state only: the auth key matters when Access Manager is on, which the access manager pages cover.
  it('setAuthKeyBasicUsage: setAuthKey stores the auth key on the client', () => {
    const pubnub = shopper();
    // snippet.setAuthKeyBasicUsage
    pubnub.setAuthKey('my_authkey');
    // snippet.end
    assert.equal(pubnub.getAuthKey(), 'my_authkey');
  });

  it('getAuthKeyBasicUsage: getAuthKey returns the auth key that was set', () => {
    const pubnub = shopper();
    pubnub.setAuthKey('my_authkey');
    // snippet.getAuthKeyBasicUsage
    const currentAuthKey = pubnub.getAuthKey();
    // snippet.end
    assert.equal(currentAuthKey, 'my_authkey');
  });

  // Local check of the stored expression. The wire effect is proven by the test `filterExpressionDropsMessage` below.
  // The older docs literal `such=wow` is not valid filter syntax: a live probe (2026-11-03) showed the server delivers
  // no message at all for it, while `such == 'wow'` delivers only the matching one.
  it('setFilterExpressionBasicUsage: setFilterExpression stores the filter expression on the client', () => {
    const pubnub = shopper();
    // snippet.setFilterExpressionBasicUsage
    pubnub.setFilterExpression("such == 'wow'");
    // snippet.end
    assert.equal(pubnub.getFilterExpression(), "such == 'wow'");
  });

  it('getFilterExpressionBasicUsage: getFilterExpression returns the expression that was set', () => {
    const pubnub = shopper();
    pubnub.setFilterExpression("such == 'wow'");
    // Record what the sample's call returns.
    const results: Array<string | null | undefined> = [];
    const original = pubnub.getFilterExpression.bind(pubnub);
    pubnub.getFilterExpression = () => {
      const result = original();
      results.push(result);
      return result;
    };
    // snippet.getFilterExpressionBasicUsage
    pubnub.getFilterExpression();
    // snippet.end
    assert.deepEqual(results, ["such == 'wow'"]);
  });

  it('destroyBasicUsage: destroy() stops a subscribed client and clears its subscriptions', async () => {
    const pubnub = shopper();
    await watch(pubnub, ['my_channel']);
    assert.ok(pubnub.getSubscribedChannels().includes('my_channel'), 'subscribed before destroy');
    // snippet.destroyBasicUsage
    pubnub.destroy();
    // snippet.end
    await eventually(() => assert.deepEqual(pubnub.getSubscribedChannels(), []), { label: 'destroy unsubscribes' });
  });

  it('configurationInitializationErrors: each documented constructor error is thrown for the matching bad configuration', () => {
    const base = { subscribeKey: keysOf('open').subscribeKey };
    assert.throws(() => new PubNub({ ...base } as unknown as PubNub.PubNubConfiguration), /'userId' not set/);
    assert.throws(() => new PubNub({ ...base, userId: '   ' }), /'userId' is empty/);
    assert.throws(
      () => new PubNub({ ...base, userId: 'a', uuid: 'b' } as unknown as PubNub.PubNubConfiguration),
      /use only 'userId'/,
    );
    assert.throws(() => new PubNub({ ...base, userId: '' }), /'userId' not set/);
  });

  it('filterExpressionDropsMessage: a subscribe filter expression makes the server drop messages that do not match, observed on the wire', async function () {
    this.timeout(45_000);
    // A unique channel of this run: the test publishes its own messages and counts what arrives, so it must not share a channel.
    const channel = `filter_channel-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const subscriber = createClient('open', 'filtered');
    subscriber.setFilterExpression("such == 'wow'");
    const listening = await watch(subscriber, [channel]);
    const publisher = friend();
    await publisher.publish({ channel, message: { n: 1 }, meta: { such: 'nope' } });
    await publisher.publish({ channel, message: { n: 2 }, meta: { such: 'wow' } });
    // The publishes are ordered, so once message 2 has arrived message 1 would have arrived before it, had it passed.
    const delivered = await listening.next('message', (m) => (m.message as { n?: number }).n === 2);
    assert.equal((delivered.userMetadata as { such?: string }).such, 'wow');
    assert.equal(
      listening.events.filter((e) => e.kind === 'message').length,
      1,
      'the message with meta such=nope must be dropped by the filter',
    );
    listening.stop();
  });
});
