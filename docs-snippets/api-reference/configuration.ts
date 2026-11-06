import assert from '../harness/assert.js';
import PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';
import { watch } from '../harness/wait.js';
import { eventually } from '../harness/wait.js';

/**
 * Configuration examples.
 */
export default page('api-reference/configuration', 'P0', (world) => {
  step('configurationBasicUsage', { proves: 'The full constructor sample yields a working client with the run user id, auth key, crypto module and Debug logging, and time() succeeds.' }, async () => {
    const debugLog = world.captureConsole('debug');
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
      ...world.live.openKeys,
      // snippet.show
    });

    // snippet.end
    world.track(pubnubConfig);
    try {
      assert.equal(pubnubConfig.getUserId(), world.n('YOUR_USER_ID'));
      assert.equal(pubnubConfig.getAuthKey(), 'accessMangerToken');
      // cryptoModule is active: encrypt and decrypt round trip. encrypt() with a crypto module takes a string and decrypt() JSON-parses the plain text, so pass stringified JSON.
      assert.deepEqual(pubnubConfig.decrypt(pubnubConfig.encrypt(JSON.stringify({ greeting: 'hello' }))), { greeting: 'hello' });
      world.check.serverTime((await pubnubConfig.time()).timetoken);
    } finally {
      debugLog.restore();
    }
    assert.ok(debugLog.lines.length > 0, 'the Debug logger wrote no output, so logLevel: Debug did not take effect');
  });

  step('configurationServerOpertaion', { keyset: 'pam', proves: 'The server configuration sample builds a client with the secret key and the run user id, and time() succeeds.' }, async () => {
    // snippet.configurationServerOpertaion
    const pubnubServer = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      userId: 'myUniqueUserId',
      secretKey: 'secretKey',
      heartbeatInterval: 0,
      // snippet.hide
      ...world.live.secured,
      // snippet.show
    });
    // snippet.end
    world.track(pubnubServer);
    assert.equal(pubnubServer.getUserId(), world.n('myUniqueUserId'));
    world.check.serverTime((await pubnubServer.time()).timetoken);
  });

  // The id keeps the docs' spelling ("Real"). A subscribe-only client has no publishKey, so the SDK refuses to
  // publish locally. The `time()` call shows the subscribe key itself is valid.
  step('configurationRealOnlyClient', { proves: 'A client with only a subscribe key works for time() and refuses to publish locally.' }, async () => {
    // snippet.configurationRealOnlyClient
    // Initialize for Read Only Client

    const pubnubReadOnly = new PubNub({
      subscribeKey: 'mySubscribeKey',
      userId: 'myUniqueUserId',
      // snippet.hide
      ...world.live.openSubscribeOnly,
      // snippet.show
    });
    // snippet.end
    world.track(pubnubReadOnly);
    // Read-only means no publishKey: publishing is refused before any request is sent.
    await assert.rejects(pubnubReadOnly.publish({ channel: world.n('my_channel'), message: { text: 'x' } }), (error: unknown) => {
      assert.match(JSON.stringify((error as { status?: unknown }).status), /publishKey/);
      return true;
    });
    world.check.serverTime((await pubnubReadOnly.time()).timetoken);
  });

  step('configurationCryptoModule', { proves: 'Two clients with different crypto modules decrypt each other\'s data as the sample comments claim.' }, async () => {
    // snippet.configurationCryptoModule
    // encrypts using 256-bit AES-CBC cipher (recommended)
    // decrypts data encrypted with the legacy and the 256 bit AES-CBC ciphers
    const pubnub = new PubNub({
      subscribeKey: 'YOUR_SUBSCRIBE_KEY',
      userId: 'YOUR_USER_ID',
      cryptoModule: PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'pubnubenigma' }),
      // snippet.hide
      ...world.live.openSubscribeOnly,
      // snippet.show
    });

    // encrypts with 128-bit cipher key entropy (legacy)
    // decrypts data encrypted with the legacy and the 256-bit AES-CBC ciphers
    const pubnubLegacy = new PubNub({
      subscribeKey: 'YOUR_SUBSCRIBE_KEY',
      userId: 'YOUR_USER_ID',
      cryptoModule: PubNub.CryptoModule.legacyCryptoModule({ cipherKey: 'pubnubenigma' }),
      // snippet.hide
      ...world.live.openSubscribeOnly,
      // snippet.show
    });
    // snippet.end
    world.track(pubnub);
    world.track(pubnubLegacy);
    const payload = JSON.stringify({ note: 'same input' });
    assert.deepEqual(pubnub.decrypt(pubnubLegacy.encrypt(payload)), { note: 'same input' });
    assert.deepEqual(pubnubLegacy.decrypt(pubnub.encrypt(payload)), { note: 'same input' });
    // The two modules produce different ciphertext (random IVs, different headers), so the choice is applied.
    assert.notEqual(pubnub.encrypt(payload), pubnubLegacy.encrypt(payload));
  });

  step('setUserIdBasicUsage', { proves: 'setUserId renames the user and the client keeps working.' }, async () => {
    const pubnub = world.fresh('setuserid');
    // snippet.setUserIdBasicUsage
    pubnub.setUserId('myUniqueUserId');
    // snippet.end
    assert.equal(pubnub.getUserId(), world.n('myUniqueUserId'));
    world.check.serverTime((await pubnub.time()).timetoken);
  });

  step('getUserIdBasicUsage', { proves: 'getUserId returns the user id given at construction, including the run suffix.' }, () => {
    const pubnub = world.fresh('getuserid');
    // snippet.getUserIdBasicUsage
    const currentUserId = pubnub.getUserId();
    // snippet.end
    assert.equal(currentUserId, pubnub.userId);
    assert.ok(currentUserId.endsWith(`-r${world.runId}`), 'user id carries the run suffix');
  });

  // Local state only: the auth key matters when Access Manager is on, which is covered by the access manager modules.
  step('setAuthKeyBasicUsage', { proves: 'setAuthKey stores the auth key on the client.' }, () => {
    const pubnub = world.fresh('setauthkey');
    // snippet.setAuthKeyBasicUsage
    pubnub.setAuthKey('my_authkey');
    // snippet.end
    assert.equal(pubnub.getAuthKey(), world.n('my_authkey'));
  });

  step('getAuthKeyBasicUsage', { proves: 'getAuthKey returns the auth key that was set.' }, () => {
    const pubnub = world.fresh('getauthkey');
    pubnub.setAuthKey('my_authkey');
    // snippet.getAuthKeyBasicUsage
    const currentAuthKey = pubnub.getAuthKey();
    // snippet.end
    assert.equal(currentAuthKey, 'my_authkey');
  });

  // Local check of the stored expression. The wire effect is proven by the check `filterExpressionDropsMessage` below.
  // The older docs literal `such=wow` is not valid filter syntax: a live probe (2026-11-03) showed the server delivers
  // no message at all for it, while `such == 'wow'` delivers only the matching one.
  step('setFilterExpressionBasicUsage', { proves: 'setFilterExpression stores the filter expression on the client.' }, () => {
    const pubnub = world.fresh('setfilter');
    // snippet.setFilterExpressionBasicUsage
    pubnub.setFilterExpression("such == 'wow'");
    // snippet.end
    assert.equal(pubnub.getFilterExpression(), "such == 'wow'");
  });

  step('getFilterExpressionBasicUsage', { proves: 'getFilterExpression returns the expression that was set.' }, () => {
    const pubnub = world.fresh('getfilter');
    pubnub.setFilterExpression("such == 'wow'");
    const spy = world.spy(pubnub, 'getFilterExpression');
    // snippet.getFilterExpressionBasicUsage
    pubnub.getFilterExpression();
    // snippet.end
    assert.deepEqual(spy.results, ["such == 'wow'"]);
  });

  step('destroyBasicUsage', { phase: 'P9', proves: 'destroy() stops a subscribed client and clears its subscriptions.' }, async () => {
    const pubnub = world.fresh('destroy');
    const channel = world.n('my_channel');
    await watch(pubnub, [channel]);
    assert.ok(pubnub.getSubscribedChannels().includes(channel), 'subscribed before destroy');
    // snippet.destroyBasicUsage
    pubnub.destroy();
    // snippet.end
    await eventually(() => assert.deepEqual(pubnub.getSubscribedChannels(), []), { label: 'destroy unsubscribes' });
  });

  check('configurationInitializationErrors', { proves: 'Each documented constructor error is thrown for the matching bad configuration.' }, () => {
    const base = { subscribeKey: world.live.openSubscribeOnly.subscribeKey as string };
    assert.throws(() => new PubNub({ ...base } as unknown as PubNub.PubNubConfiguration), /'userId' not set/);
    assert.throws(() => new PubNub({ ...base, userId: '   ' }), /'userId' is empty/);
    assert.throws(
      () => new PubNub({ ...base, userId: 'a', uuid: 'b' } as unknown as PubNub.PubNubConfiguration),
      /use only 'userId'/,
    );
    assert.throws(() => new PubNub({ ...base, userId: '' }), /'userId' not set/);
  });

  check('filterExpressionDropsMessage', { phase: 'P4', timeout: 45_000, proves: 'A subscribe filter expression makes the server drop messages that do not match, observed on the wire.' }, async () => {
    const channel = world.n('filter_channel');
    const subscriber = world.fresh('filtered');
    subscriber.setFilterExpression("such == 'wow'");
    const listening = await watch(subscriber, [channel]);
    await world.friend.publish({ channel, message: { n: 1 }, meta: { such: 'nope' } });
    await world.friend.publish({ channel, message: { n: 2 }, meta: { such: 'wow' } });
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
