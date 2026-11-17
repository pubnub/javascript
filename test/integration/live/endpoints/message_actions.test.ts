/**
 * Real-network counterpart of test/integration/endpoints/message_actions.test.ts: the nine tests that publish to the service and
 * add, read or remove message actions (the nock-mocked tests of that file stay there). Not documentation samples.
 *
 * Needs the `open` keyset with Message Persistence and message actions (SUBSCRIBE_KEY, PUBLISH_KEY). Every test uses a channel
 * named after a fresh UUID, so runs on a shared, persistent keyset never see each other's messages or actions. The mocked
 * original waited a fixed 500 ms or 2 s before reading actions back; here the read is polled with `eventually`, and the
 * message action events are awaited with `expectEvent`.
 */
import type PubNub from 'pubnub';

import assert from 'node:assert';
import { randomUUID } from 'node:crypto';

import { createClient } from '../support/clients';
import { connected, eventually, expectEvent } from '../support/wait';

/** Message action object. */
type MessageAction = PubNub.MessageAction.AddMessageActionParameters['action'];

const uniqueChannel = (suffix = ''): string => `message-actions-${randomUUID()}${suffix}`;

/** Publishes `count` messages one after another and returns their timetokens, sorted. */
async function publishMessages(client: PubNub, count: number, channel: string): Promise<string[]> {
  const timetokens: string[] = [];

  for (let messageIdx = 0; messageIdx < count; messageIdx += 1) {
    const response = await client.publish({ message: { messageIdx, time: Date.now() }, channel });
    timetokens.push(response.timetoken);
  }

  return timetokens.sort((left, right) => parseInt(left, 10) - parseInt(right, 10));
}

/** Attaches `count` message actions to each referenced message and returns the action timetokens, sorted. */
async function addActions(
  client: PubNub,
  count: number,
  messageTimetokens: string[],
  channel: string,
): Promise<string[]> {
  const types = ['reaction', 'receipt', 'custom'];
  const values = Array.from({ length: 10 }, () => randomUUID());
  const timetokens: string[] = [];

  for (const messageTimetoken of messageTimetokens) {
    for (let messageActionIdx = 0; messageActionIdx < count; messageActionIdx += 1) {
      const action: MessageAction = {
        type: types[(messageActionIdx + 1) % 3],
        value: values[(messageActionIdx + 1) % 10],
      };
      const response = await client.addMessageAction({ channel, messageTimetoken, action });
      timetokens.push(response.data.actionTimetoken);
    }
  }

  return timetokens.sort((left, right) => parseInt(left, 10) - parseInt(right, 10));
}

describe('endpoints/message_actions: message actions against the service', function () {
  this.timeout(60000);

  let pubnub: PubNub;

  beforeEach(() => {
    // The root hook destroys the client after the test.
    pubnub = createClient('open', 'myUUID');
  });

  describe('addMessageAction', () => {
    const addsAction = async (channel: string): Promise<void> => {
      const messageAction: MessageAction = { type: 'custom', value: randomUUID() };
      const [messageTimetoken] = await publishMessages(pubnub, 1, channel);

      const response = await pubnub.addMessageAction({ channel, messageTimetoken, action: messageAction });

      assert.equal(response.data.type, messageAction.type);
      assert.equal(response.data.value, messageAction.value);
      assert.equal(response.data.uuid, pubnub.getUUID());
      assert.equal(response.data.messageTimetoken, messageTimetoken);
      assert(response.data.actionTimetoken);
    };

    it('add message action', () => addsAction(uniqueChannel()));

    it('add message action with encoded channel', () => addsAction(uniqueChannel('#1')));

    it('add message action should trigger event', async () => {
      const messageAction: MessageAction = { type: 'custom', value: randomUUID() };
      const channel = uniqueChannel();

      const ready = connected(pubnub, { channels: [channel] });
      const event = expectEvent(pubnub, 'messageAction', (e) => e.data.value === messageAction.value);
      pubnub.subscribe({ channels: [channel] });
      await ready;

      const published = await pubnub.publish({ channel, message: { hello: 'test' }, sendByPost: true });
      await pubnub.addMessageAction({ channel, messageTimetoken: published.timetoken, action: messageAction });

      const messageActionEvent = await event;
      assert(messageActionEvent.data);
      assert.equal(messageActionEvent.data.type, messageAction.type);
      assert.equal(messageActionEvent.data.value, messageAction.value);
      assert.equal(messageActionEvent.data.uuid, pubnub.getUUID());
      assert.equal(messageActionEvent.data.messageTimetoken, published.timetoken);
      assert(messageActionEvent.data.actionTimetoken);
      assert.equal(messageActionEvent.event, 'added');
      pubnub.unsubscribeAll();
    });
  });

  describe('removeMessageAction', () => {
    const removesAction = async (channel: string): Promise<void> => {
      const messageTimetokens = await publishMessages(pubnub, 1, channel);
      const actionTimetokens = await addActions(pubnub, 1, messageTimetokens, channel);

      await eventually(
        async () => {
          const response = await pubnub.getMessageActions({ channel });
          assert.equal(response.data.length, actionTimetokens.length);
        },
        { timeout: 30_000, label: 'the added action is listed' },
      );

      // A rejected promise is the failed status of the callback form (`status.error`).
      await pubnub.removeMessageAction({
        channel,
        actionTimetoken: actionTimetokens[0],
        messageTimetoken: messageTimetokens[0],
      });

      await eventually(
        async () => {
          const response = await pubnub.getMessageActions({ channel });
          assert.equal(response.data.length, 0);
        },
        { timeout: 30_000, label: 'the removed action is gone' },
      );
    };

    it('remove message action', () => removesAction(uniqueChannel()));

    it('remove message action with encoded channel', () => removesAction(uniqueChannel('#1')));

    it('remove message action should trigger event', async () => {
      const channel = uniqueChannel();
      const messageTimetokens = await publishMessages(pubnub, 1, channel);
      const actionTimetokens = await addActions(pubnub, 1, messageTimetokens, channel);

      const ready = connected(pubnub, { channels: [channel] });
      const event = expectEvent(pubnub, 'messageAction', (e) => e.event === 'removed');
      pubnub.subscribe({ channels: [channel] });
      await ready;

      await pubnub.removeMessageAction({
        channel,
        actionTimetoken: actionTimetokens[0],
        messageTimetoken: messageTimetokens[0],
      });

      const messageActionEvent = await event;
      assert(messageActionEvent.data);
      assert.equal(messageActionEvent.data.uuid, pubnub.getUUID());
      assert.equal(messageActionEvent.data.messageTimetoken, messageTimetokens[0]);
      assert.equal(messageActionEvent.data.actionTimetoken, actionTimetokens[0]);
      assert.equal(messageActionEvent.event, 'removed');
      pubnub.unsubscribeAll();
    });
  });

  describe('getMessageAction', () => {
    const fetchesActions = async (channel: string): Promise<void> => {
      const messageTimetokens = await publishMessages(pubnub, 2, channel);
      const actionTimetokens = await addActions(pubnub, 3, messageTimetokens, channel);
      const lastPublishedActionTimetoken = actionTimetokens[actionTimetokens.length - 1];
      const firstPublishedActionTimetoken = actionTimetokens[0];

      await eventually(
        async () => {
          const response = await pubnub.getMessageActions({ channel });
          const firstFetchedActionTimetoken = response.data[0].actionTimetoken;
          const lastFetchedActionTimetoken = response.data[response.data.length - 1].actionTimetoken;
          assert.equal(firstFetchedActionTimetoken, firstPublishedActionTimetoken);
          assert.equal(lastFetchedActionTimetoken, lastPublishedActionTimetoken);
          assert.equal(response.data.length, actionTimetokens.length);
          assert.equal(response.start, firstPublishedActionTimetoken);
          assert.equal(response.end, lastPublishedActionTimetoken);
        },
        { timeout: 30_000, label: 'getMessageActions lists every added action' },
      );
    };

    it('fetch message actions', () => fetchesActions(uniqueChannel()));

    it('fetch message actions with encoded channel', () => fetchesActions(uniqueChannel('#1')));

    it('fetch next message actions page', async () => {
      const channel = uniqueChannel();
      const messageTimetokens = await publishMessages(pubnub, 2, channel);
      const actionTimetokens = await addActions(pubnub, 5, messageTimetokens, channel);
      const lastPublishedActionTimetoken = actionTimetokens[actionTimetokens.length - 1];
      const halfSize = Math.floor(actionTimetokens.length * 0.5);
      const firstPublishedActionTimetoken = actionTimetokens[0];
      const middleMinusOnePublishedActionTimetoken = actionTimetokens[halfSize - 1];
      const middlePublishedActionTimetoken = actionTimetokens[halfSize];

      await eventually(
        async () => {
          const response = await pubnub.getMessageActions({ channel, limit: halfSize });
          let firstFetchedActionTimetoken = response.data[0].actionTimetoken;
          let lastFetchedActionTimetoken = response.data[response.data.length - 1].actionTimetoken;
          assert.equal(firstFetchedActionTimetoken, middlePublishedActionTimetoken);
          assert.equal(lastFetchedActionTimetoken, lastPublishedActionTimetoken);
          assert.equal(response.data.length, halfSize);
          assert.equal(response.start, middlePublishedActionTimetoken);
          assert.equal(response.end, lastPublishedActionTimetoken);

          const next = await pubnub.getMessageActions({
            channel,
            start: middlePublishedActionTimetoken,
            limit: halfSize,
          });
          firstFetchedActionTimetoken = next.data[0].actionTimetoken;
          lastFetchedActionTimetoken = next.data[next.data.length - 1].actionTimetoken;
          assert.equal(firstFetchedActionTimetoken, firstPublishedActionTimetoken);
          assert.equal(lastFetchedActionTimetoken, middleMinusOnePublishedActionTimetoken);
          assert.equal(next.data.length, halfSize);
          assert.equal(next.start, firstPublishedActionTimetoken);
          assert.equal(next.end, middleMinusOnePublishedActionTimetoken);
        },
        { timeout: 30_000, label: 'getMessageActions pages' },
      );
    });
  });
});
