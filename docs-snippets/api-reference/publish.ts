import assert from '../harness/assert.js';
import type PubNub from 'pubnub';
import { page, step } from '../harness/step.js';
import { recorder } from '../harness/recorder.js';
import { eventually, sleep, watch } from '../harness/wait.js';
import { rejectsValidation, rejectsWithCategory } from '../harness/assertions.js';

/**
 * Publish and signal examples, including `fire()`.
 */
export default page('api-reference/publish', 'P4', (world) => {
  step('publishBasicUsage', { needs: ['preflightPersistence'], proves: 'publish delivers a message with meta and a custom message type to a subscriber and stores it.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('my_channel');
    const listening = await watch(world.fresh('observer'), [channel]);

    // snippet.publishBasicUsage
    const response = await pubnub.publish({
      message: { text: 'Hello World' },
      channel: 'my_channel',
      sendByPost: false,
      storeInHistory: true,
      meta: { sender: 'user123' },
      customMessageType: 'text-message',
    });
    console.log('Publish Success:', response);
    // snippet.end

    world.check.timetoken(response.timetoken);
    const received = await listening.next('message', (m) => (m.message as { text?: string }).text === 'Hello World');
    assert.equal(received.timetoken, response.timetoken);
    assert.equal(received.publisher, pubnub.getUserId());
    assert.equal(received.userMetadata?.sender, 'user123');
    assert.equal(received.customMessageType, 'text-message');
    // storeInHistory: true, so Message Persistence has it too.
    await eventually(async () => {
      const history = await world.observer.fetchMessages({ channels: [channel], count: 10 });
      assert.ok(history.channels[channel]?.some((m) => m.timetoken === response.timetoken), 'message is stored');
    }, { label: 'published message is persisted' });
    listening.stop();
  });

  step('publishStoreThePublishedMessagefor10Hours', { needs: ['preflightPersistence'], proves: 'publish with a ttl still delivers and stores the message.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('my_channel');
    const listening = await watch(world.fresh('observer'), [channel]);

    // snippet.publishStoreThePublishedMessagefor10Hours
    const response = await pubnub.publish({
      message: 'hello!',
      channel: 'my_channel',
      storeInHistory: true,
      ttl: 10,
      customMessageType: 'text-message',
    });

    console.log('message published with server response:', response);
    // snippet.end

    world.check.timetoken(response.timetoken);
    const received = await listening.next('message', (m) => m.message === 'hello!');
    assert.equal(received.timetoken, response.timetoken);
    await eventually(async () => {
      const history = await world.observer.fetchMessages({ channels: [channel], count: 10 });
      assert.ok(history.channels[channel]?.some((m) => m.timetoken === response.timetoken), 'message is stored');
    }, { label: 'message with ttl is persisted' });
    listening.stop();
  });

  step('publishMinimal', { proves: 'The minimal publish returns a string timetoken and delivers the message.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('my_channel');
    const listening = await watch(world.fresh('observer'), [channel]);

    // snippet.publishMinimal
    const { timetoken } = await pubnub.publish({
      channel: 'my_channel',
      message: { text: 'Hello' },
    });

    console.log(timetoken); // "17918851187695440" (a string)
    // snippet.end

    assert.equal(typeof timetoken, 'string');
    world.check.timetoken(timetoken);
    const received = await listening.next('message', (m) => (m.message as { text?: string }).text === 'Hello');
    assert.equal(received.timetoken, timetoken);
    listening.stop();
  });

  step('publishFalsyMessage', { proves: 'A wrapped value 0 is delivered as a message.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('my_channel');
    const listening = await watch(world.fresh('observer'), [channel]);

    // snippet.publishFalsyMessage
    // message: 0 is rejected with "Missing 'message'", so wrap the value
    await pubnub.publish({
      channel: 'my_channel',
      message: { value: 0 },
    });
    // snippet.end

    const received = await listening.next('message', (m) => (m.message as { value?: number }).value === 0);
    assert.deepEqual(received.message, { value: 0 });
    await rejectsValidation(pubnub.publish({ channel, message: 0 }), /Missing 'message'/);
    listening.stop();
  });

  step('signalBasicUsage', { proves: 'signal reaches a subscriber as a signal event with the custom message type, not as a message.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('foo');
    const listening = await watch(world.fresh('observer'), [channel]);

    // snippet.signalBasicUsage
    const response = await pubnub.signal({
      message: 'hello',
      channel: 'foo',
      customMessageType: 'text-message',
    });
    console.log('signal response:', response);
    // snippet.end

    world.check.timetoken(response.timetoken);
    const received = await listening.next('signal', (s) => s.message === 'hello');
    assert.equal(received.timetoken, response.timetoken);
    assert.equal(received.publisher, pubnub.getUserId());
    assert.equal(received.customMessageType, 'text-message');
    listening.stop();
  });

  step('fireBasicUsage', { phase: 'P8', proves: 'fire sends to Functions only, so subscribers receive nothing and history stores nothing.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('my_channel');
    const listening = await watch(world.fresh('observer'), [channel]);

    // snippet.fireBasicUsage
    // Initialize PubNub with your keys
    await pubnub.fire({
      message: {
        such: 'object',
      },
      channel: 'my_channel',
      sendByPost: false, // true to send via post
      meta: {
        cool: 'meta',
      }, // fire extra meta with the request
    });

    console.log('message fired');
    // snippet.end

    // fire() sends to Functions only: subscribers do not receive it and Message Persistence does not store it.
    await sleep(4000);
    assert.ok(
      !listening.events.some((e) => (e.event as { message?: { such?: string } }).message?.such === 'object'),
      'a fired message must not reach subscribers',
    );
    const history = await world.observer.fetchMessages({ channels: [channel], count: 25 });
    assert.ok(
      !history.channels[channel]?.some((m) => (m.message as { such?: string } | undefined)?.such === 'object'),
      'a fired message is not stored',
    );
    listening.stop();
  });

  step('publishHandleErrors', { keyset: 'pam', timeout: 240_000, proves: 'The same error handling code logs the right line for success, access denied (403), validation and network failure.' }, async () => {
    type PubNubError = PubNub.PubNubError;

    const attempt = async (pubnub: PubNub): Promise<string[]> => {
      const errors = world.captureConsole('error');
      try {
        // snippet.publishHandleErrors
        try {
          await pubnub.publish({
            channel: 'my_channel',
            message: { text: 'Hello' },
          });
        } catch (e) {
          const status = (e as PubNubError).status;

          if (status?.category === 'PNValidationErrorCategory') {
            console.error('The call is invalid:', status.message);
          } else if (status?.category === 'PNAccessDeniedCategory') {
            console.error('403: the token or authKey has no write permission on the channel');
          } else if (status?.category === 'PNNetworkIssuesCategory') {
            console.error('The network is unreachable. Retry the publish yourself.');
          } else {
            console.error(status?.category, status?.statusCode, status?.errorData);
          }
        }
        // snippet.end
      } finally {
        errors.restore();
      }
      return errors.lines;
    };

    // Wait until the keyset enforces Access Manager on this channel for a stranger. Without this wait the 403 branch below
    // is only as reliable as the propagation of earlier grants and revokes on the keyset. A keyset that never denies fails
    // here with a message that names the cause, not with an empty list further down.
    await eventually(
      () =>
        rejectsWithCategory(
          world.client('secured', 'no-token-probe').publish({ channel: world.n('my_channel'), message: { probe: true } }),
          'PNAccessDeniedCategory',
        ),
      { timeout: 120_000, interval: 3_000, label: 'a client without a token is refused on the channel (Access Manager grants and revokes take up to 60 s to propagate)' },
    );

    // Success: the server client may publish, so no error line.
    assert.deepEqual(await attempt(world.server), [], 'a valid publish logs nothing');

    let deniedAttempts = 0;
    await eventually(async () => {
      deniedAttempts += 1;
      const denied = await attempt(world.client('secured', `no-token-user-${deniedAttempts}`));
      assert.deepEqual(denied, ['403: the token or authKey has no write permission on the channel']);
    }, { timeout: 90_000, interval: 3_000, label: 'a tokenless publish logs the 403 line (Access Manager enforcement reaches every node)' });
    recorder.record({ kind: 'event', label: `tokenless publish logged the 403 line on attempt ${deniedAttempts}`, ok: true });

    // Validation: no publish key, the SDK refuses before it sends.
    const invalid = await attempt(world.client('secured', 'no-publish-key-user', { publishKey: '' }));
    assert.equal(invalid.length, 1);
    assert.match(invalid[0], /^The call is invalid: /);

    // Network: the proxy refuses every tunnel. Publish has no retry, so the call fails at once.
    await world.proxy.start();
    const proxied = world.client('secured', 'proxied-user');
    proxied.setProxy(world.proxy.config);
    world.proxy.outage(true);
    try {
      assert.deepEqual(await attempt(proxied), ['The network is unreachable. Retry the publish yourself.']);
    } finally {
      world.proxy.outage(false);
    }
  });
});
