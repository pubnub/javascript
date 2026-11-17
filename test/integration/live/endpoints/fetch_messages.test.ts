/**
 * Real-network counterpart of test/integration/endpoints/fetch_messages.test.ts: the four tests that publish to the service
 * and read the messages back (the nock-mocked tests of that file stay there). Not documentation samples.
 *
 * Needs the `open` keyset with Message Persistence and message actions (SUBSCRIBE_KEY, PUBLISH_KEY). Every test uses a channel
 * named after a fresh UUID, so runs on a shared, persistent keyset never see each other's messages. Reads that depend on
 * eventually consistent storage are polled with `eventually` instead of waiting a fixed time.
 */
import type PubNub from 'pubnub';

import assert from 'node:assert';
import { randomUUID } from 'node:crypto';

import { createClient } from '../support/clients';
import { eventually } from '../support/wait';

/** Published test message shape. */
type TestMessage = { messageIdx: string; time: number };

type Published = { message: TestMessage; timetoken: string };

const uniqueChannel = (): string => `fetch-messages-${randomUUID()}`;

/** Publishes `count` messages one after another (even indexes carry metadata), returns them sorted by timetoken. */
async function publishMessagesToChannel(
  client: PubNub,
  count: number,
  channel: string,
  customMessageType: string,
): Promise<Published[]> {
  const messages: Published[] = [];

  for (let messageIdx = 0; messageIdx < count; messageIdx += 1) {
    const message: TestMessage = { messageIdx: [channel, messageIdx].join(': '), time: Date.now() };
    const payload: PubNub.Publish.PublishParameters = { message, channel };

    if (customMessageType.length) payload.customMessageType = customMessageType;
    if (messageIdx % 2 === 0) payload.meta = { time: message.time };

    const response = await client.publish(payload);
    messages.push({ message, timetoken: response.timetoken });
  }

  return messages.sort((left, right) => parseInt(left.timetoken, 10) - parseInt(right.timetoken, 10));
}

/** Attaches `count` message actions to each referenced message and returns the added actions sorted by action timetoken. */
async function addActionsInChannel(
  client: PubNub,
  count: number,
  messageTimetokens: string[],
  channel: string,
): Promise<PubNub.MessageAction.MessageAction[]> {
  const types = ['reaction', 'receipt', 'custom'];
  const values = Array.from({ length: 10 }, () => randomUUID());
  const actions: PubNub.MessageAction.MessageAction[] = [];

  for (const messageTimetoken of messageTimetokens) {
    for (let messageActionIdx = 0; messageActionIdx < count; messageActionIdx += 1) {
      const action = { type: types[(messageActionIdx + 1) % 3], value: values[(messageActionIdx + 1) % 10] };
      const response = await client.addMessageAction({ channel, messageTimetoken, action });
      actions.push(response.data);
    }
  }

  return actions.sort((left, right) => parseInt(left.actionTimetoken, 10) - parseInt(right.actionTimetoken, 10));
}

describe('endpoints/fetch_messages: fetchMessages against the service', function () {
  this.timeout(60000);

  let pubnub: PubNub;

  beforeEach(() => {
    // The root hook destroys the client after the test.
    pubnub = createClient('open', 'myUUID');
  });

  it('supports metadata', async () => {
    const channel = uniqueChannel();
    const messages = await publishMessagesToChannel(pubnub, 10, channel, '');

    await eventually(
      async () => {
        const response = await pubnub.fetchMessages({ channels: [channel], count: 25, includeMeta: true });
        const channelMessages = response.channels[channel];

        assert.deepEqual(channelMessages[0].meta, { time: messages[0].message.time });
        assert(!channelMessages[1].meta);
      },
      { timeout: 30_000, label: 'fetchMessages with includeMeta' },
    );
  });

  it('supports custom message type', async () => {
    const channel = uniqueChannel();
    await publishMessagesToChannel(pubnub, 2, channel, 'test-message-type');

    const response = await pubnub.fetchMessages({ channels: [channel], includeCustomMessageType: true });
    response.channels[channel].forEach((message) => {
      assert.equal(message.customMessageType, 'test-message-type');
    });
  });

  for (const field of ['data', 'actions'] as const) {
    it(`supports actions (stored as '${field}' field)`, async () => {
      const channel = uniqueChannel();
      const expectedActionsCount = 4;
      const messages = await publishMessagesToChannel(pubnub, 2, channel, '');
      const messageTimetokens = messages.map((message) => message.timetoken);
      const actions = await addActionsInChannel(pubnub, expectedActionsCount, messageTimetokens, channel);

      // The mocked original waited a fixed 2 s before reading; poll until the actions are visible instead.
      await eventually(
        async () => {
          const response = await pubnub.fetchMessages({ channels: [channel], includeMessageActions: true });
          const fetchedMessages = response.channels[channel];
          // TypeScript types system now requires to figure out type of object before using it.
          assert('actions' in fetchedMessages[0]);
          const actionsByType = (field === 'data' ? fetchedMessages[0].data : fetchedMessages[0].actions) ?? {};
          let historyActionsCount = 0;

          Object.keys(actionsByType).forEach((actionType) => {
            Object.keys(actionsByType[actionType]).forEach((actionValue) => {
              historyActionsCount += 1;

              assert.equal(
                actions.some((action) => action.value === actionValue),
                true,
              );
            });
          });

          assert.equal(historyActionsCount, expectedActionsCount);
          assert.equal(fetchedMessages[0].timetoken, messageTimetokens[0]);
          assert.equal(
            fetchedMessages[fetchedMessages.length - 1].timetoken,
            messageTimetokens[messageTimetokens.length - 1],
          );
        },
        { timeout: 30_000, label: `fetchMessages with actions (${field})` },
      );
    });
  }
});
