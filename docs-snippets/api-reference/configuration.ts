import assert from '../harness/assert.js';
import PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';
import { watch } from '../harness/wait.js';
import { eventually } from '../harness/wait.js';

/**
 * docs/sdks/javascript/api-reference/configuration.md
 *
 * Init snippets keep the placeholder keys the docs show. A hidden spread after the visible keys swaps in the
 * live keyset (design 4.3, rule 4). Everything else in the snippets runs exactly as the docs show it.
 *
 * Keyset: open, except `configurationServerOpertaion` (secured, needs the secret key). Phase: P0, because every later
 * page depends on construction working. Sneaker Drop story: the app boots its clients (shopper, read-only kiosk,
 * staff server) before anything else happens. Proves: each constructor shape and the client getters and setters
 * behave as the page says, the filter expression is applied by the service, and the constructor error table is
 * accurate. Deliberately does not prove: subscribe or publish behavior beyond one `time()` call per client (the
 * keys are real), or Access Manager enforcement (authKey is only stored here).
 */
export default page('api-reference/configuration', 'P0', (world) => {
  // The kitchen-sink constructor. The hidden spread swaps in the live keys only (`openKeys`), so the snippet's own
  // `logLevel: Debug` stays in effect. After the snippet: the user id carries the run suffix (registered name), the auth
  // key is stored, the crypto module works, `time()` proves the keys are real, and the Debug logger wrote output.
  // Debug output goes to console.debug and includes the configuration (keys), so it is captured, not printed.
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
    // logLevel: Debug from the snippet is in effect (the hidden spread no longer overrides it).
    assert.ok(debugLog.lines.length > 0, 'the Debug logger wrote no output, so logLevel: Debug did not take effect');
  });

  // The id keeps the docs' spelling ("Opertaion") because the docs embed it by that name. Secured keyset: the only
  // snippet that shows a secretKey. It skips as missing-env:secured when that keyset is not configured.
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

  // Two clients with different crypto modules, never connected to a channel. The cross decrypt asserts the comments in
  // the snippet ("decrypts data encrypted with the legacy and the 256 bit ciphers"). Pure local work.
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
    // Both modules decrypt what the other one encrypted, as the comments in the snippet say.
    const payload = JSON.stringify({ note: 'same input' });
    assert.deepEqual(pubnub.decrypt(pubnubLegacy.encrypt(payload)), { note: 'same input' });
    assert.deepEqual(pubnubLegacy.decrypt(pubnub.encrypt(payload)), { note: 'same input' });
    // The two modules produce different ciphertext (random IVs, different headers), so the choice is applied.
    assert.notEqual(pubnub.encrypt(payload), pubnubLegacy.encrypt(payload));
  });

  // Uses a fresh client so renaming its user id cannot disturb the shared shopper. The `time()` call proves the client
  // still works after the change.
  step('setUserIdBasicUsage', { proves: 'setUserId renames the user and the client keeps working.' }, async () => {
    const pubnub = world.fresh('setuserid');
    // snippet.setUserIdBasicUsage
    pubnub.setUserId('myUniqueUserId');
    // snippet.end
    assert.equal(pubnub.getUserId(), world.n('myUniqueUserId'));
    world.check.serverTime((await pubnub.time()).timetoken);
  });

  // Fresh clients get the run suffix from world.client, so the assertion also guards that names are isolated per run.
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
    // 'my_authkey' is a registered name (the Access Manager pages use it), so the staged snippet carries the suffix.
    assert.equal(pubnub.getAuthKey(), world.n('my_authkey'));
  });

  // The setter runs outside the markers so this snippet shows the getter alone. 'my_authkey' is not suffixed here
  // because the setter call sits outside a snippet region, where the stage rewrite does not apply.
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

  // The setter is outside the snippet for the same reason as getAuthKeyBasicUsage.
  step('getFilterExpressionBasicUsage', { proves: 'getFilterExpression returns the expression that was set.' }, () => {
    const pubnub = world.fresh('getfilter');
    pubnub.setFilterExpression("such == 'wow'");
    // The snippet discards the return value, so a spy records what the call returned.
    const spy = world.spy(pubnub, 'getFilterExpression');
    // snippet.getFilterExpressionBasicUsage
    pubnub.getFilterExpression();
    // snippet.end
    assert.deepEqual(spy.results, ["such == 'wow'"]);
  });

  // Runs in P9, last, so tearing down a client cannot affect other steps. The pre-condition `watch` makes the destroy
  // observable. `eventually` waits because the unsubscribe state clears asynchronously.
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

  // Constructor error table of the Initialization errors section. No snippet, so check().
  check('configurationInitializationErrors', { proves: 'Each documented constructor error is thrown for the matching bad configuration.' }, () => {
    const base = { subscribeKey: world.live.openSubscribeOnly.subscribeKey as string };
    assert.throws(() => new PubNub({ ...base } as unknown as PubNub.PubNubConfiguration), /'userId' not set/);
    assert.throws(() => new PubNub({ ...base, userId: '   ' }), /'userId' is empty/);
    assert.throws(
      () => new PubNub({ ...base, userId: 'a', uuid: 'b' } as unknown as PubNub.PubNubConfiguration),
      /use only 'userId'/,
    );
    // The docs table says an empty string gives "'userId' is empty". The SDK checks falsiness first, so '' is "not set".
    // The docs row needs a fix (live finding). The assertion follows the SDK source.
    assert.throws(() => new PubNub({ ...base, userId: '' }), /'userId' not set/);
  });

  // Plain pub/sub, so no preflight dependency. The two publishes are ordered, so once
  // message 2 arrives the filtered one (message 1) would already have been delivered if the server let it through.
  // The filter expression from the configuration page, proven on the wire: the server drops what does not match.
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
