import assert from 'node:assert/strict';
import PubNub from 'pubnub';
import { assertTimetoken, rejectsValidation, rejectsWithCategory } from '../support/assertions';
import { createClient, observer, server, shopper, unreachable } from '../support/clients';
import { captureConsole } from '../support/console';
import { storedMessage } from '../support/history';
import { eventually, settled, sleep, watch } from '../support/wait';

/**
 * Publish and signal examples, including `fire()`. Port of docs-snippets/api-reference/publish.ts.
 * Message Persistence must be on for the open keyset (publishBasicUsage and the ttl test read history).
 */
describe('api-reference/publish', () => {
  it('publishBasicUsage: publish delivers a message with meta and a custom message type to a subscriber and stores it', async () => {
    const pubnub = shopper();
    const listening = await watch(observer(), ['my_channel']);

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

    assertTimetoken(response.timetoken);
    // Match this run's own message by timetoken: the channel is shared and persistent.
    const received = await listening.next('message', (m) => m.timetoken === response.timetoken);
    assert.deepEqual(received.message, { text: 'Hello World' });
    assert.equal(received.publisher, pubnub.getUserId());
    assert.equal(received.userMetadata?.sender, 'user123');
    assert.equal(received.customMessageType, 'text-message');
    // storeInHistory: true, so Message Persistence has it too.
    await eventually(
      async () => {
        assert.ok(await storedMessage(observer(), 'my_channel', response.timetoken), 'message is stored');
      },
      { label: 'published message is persisted' },
    );
    listening.stop();
  });

  it('publishStoreThePublishedMessagefor10Hours: publish with a ttl still delivers and stores the message', async () => {
    const pubnub = shopper();
    const listening = await watch(observer(), ['my_channel']);

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

    assertTimetoken(response.timetoken);
    const received = await listening.next('message', (m) => m.timetoken === response.timetoken);
    assert.equal(received.message, 'hello!');
    await eventually(
      async () => {
        assert.ok(await storedMessage(observer(), 'my_channel', response.timetoken), 'message is stored');
      },
      { label: 'message with ttl is persisted' },
    );
    listening.stop();
  });

  it('publishMinimal: the minimal publish returns a string timetoken and delivers the message', async () => {
    const pubnub = shopper();
    const listening = await watch(observer(), ['my_channel']);

    // snippet.publishMinimal
    const { timetoken } = await pubnub.publish({
      channel: 'my_channel',
      message: { text: 'Hello' },
    });

    console.log(timetoken); // "17918851187695440" (a string)
    // snippet.end

    assert.equal(typeof timetoken, 'string');
    assertTimetoken(timetoken);
    const received = await listening.next('message', (m) => m.timetoken === timetoken);
    assert.deepEqual(received.message, { text: 'Hello' });
    listening.stop();
  });

  it('publishFalsyMessage: a wrapped value 0 is delivered as a message', async () => {
    const pubnub = shopper();
    const listening = await watch(observer(), ['my_channel']);

    // snippet.publishFalsyMessage
    // message: 0 is rejected with "Missing 'message'", so wrap the value
    await pubnub.publish({
      channel: 'my_channel',
      message: { value: 0 },
    });
    // snippet.end

    // The sample does not keep the response, so the message cannot be matched by timetoken. The watch subscribed just before
    // the publish and this tier runs alone on its keyset, so the first `{ value: 0 }` from this publisher is ours.
    const received = await listening.next(
      'message',
      (m) => (m.message as { value?: number }).value === 0 && m.publisher === pubnub.getUserId(),
    );
    assert.deepEqual(received.message, { value: 0 });
    await rejectsValidation(pubnub.publish({ channel: 'my_channel', message: 0 }), /Missing 'message'/);
    listening.stop();
  });

  it('signalBasicUsage: signal reaches a subscriber as a signal event with the custom message type, not as a message', async () => {
    const pubnub = shopper();
    const listening = await watch(observer(), ['foo']);

    // snippet.signalBasicUsage
    const response = await pubnub.signal({
      message: 'hello',
      channel: 'foo',
      customMessageType: 'text-message',
    });
    console.log('signal response:', response);
    // snippet.end

    assertTimetoken(response.timetoken);
    const received = await listening.next('signal', (s) => s.timetoken === response.timetoken);
    assert.equal(received.message, 'hello');
    assert.equal(received.publisher, pubnub.getUserId());
    assert.equal(received.customMessageType, 'text-message');
    listening.stop();
  });

  it('fireBasicUsage: fire sends to Functions only, so subscribers receive nothing and history stores nothing', async () => {
    const pubnub = shopper();
    const listening = await watch(observer(), ['my_channel']);
    // Everything fired by the sample is newer than this timetoken. Shared history may hold older messages, so the "not
    // stored" check looks only at the window after it.
    const { timetoken: before } = await observer().time();

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

    // fire() sends to Functions only: subscribers do not receive it and Message Persistence does not store it. This is the
    // one place a fixed sleep is right, because the test proves that nothing arrived.
    await sleep(4000);
    assert.ok(
      !listening.events.some((e) => (e.event as { message?: { such?: string } }).message?.such === 'object'),
      'a fired message must not reach subscribers',
    );
    const history = await observer().fetchMessages({ channels: ['my_channel'], end: String(before), count: 25 });
    assert.ok(
      !history.channels['my_channel']?.some((m) => (m.message as { such?: string } | undefined)?.such === 'object'),
      'a fired message is not stored',
    );
    listening.stop();
  });

  // Needs the pam keyset (PAM_* env names): Access Manager on, and no grant that lets a client without a token publish.
  it('publishHandleErrors: the same error handling code logs the right line for success, access denied (403), validation and network failure', async function () {
    this.timeout(240_000);
    type PubNubError = PubNub.PubNubError;

    const attempt = async (pubnub: PubNub): Promise<string[]> => {
      const errors = captureConsole('error');
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

    // Wait until the keyset enforces Access Manager on this channel for a stranger, on consecutive probes. One refusal only proves
    // that one node knows the revoke (the nodes learn of it at different moments, up to about 60 s), and the sample below runs
    // once, so a stranger that is let through by a lagging node would fail it. A keyset that never denies fails here with a
    // message that names the cause, not with an empty list further down.
    await settled(
      () =>
        rejectsWithCategory(
          createClient('pam', 'no-token-probe').publish({ channel: 'my_channel', message: { probe: true } }),
          'PNAccessDeniedCategory',
        ),
      {
        timeout: 120_000,
        interval: 2_000,
        label:
          'a client without a token is refused on the channel (Access Manager grants and revokes take up to 60 s to propagate)',
      },
    );

    // Success: the server client may publish, so no error line.
    assert.deepEqual(await attempt(server()), [], 'a valid publish logs nothing');

    // Access denied: the sample runs once, as written.
    assert.deepEqual(await attempt(createClient('pam', 'no-token-user')), [
      '403: the token or authKey has no write permission on the channel',
    ]);

    // Validation: no publish key, the SDK refuses before it sends.
    const invalid = await attempt(createClient('pam', 'no-publish-key-user', { publishKey: '' }));
    assert.equal(invalid.length, 1);
    assert.match(invalid[0], /^The call is invalid: /);

    // Network: nothing listens on the target port, so the connection is refused. Publish has no retry, so the call fails at once.
    assert.deepEqual(await attempt(createClient('pam', 'unreachable-user', unreachable)), [
      'The network is unreachable. Retry the publish yourself.',
    ]);
  });
});
