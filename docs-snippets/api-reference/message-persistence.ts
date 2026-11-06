import assert from '../harness/assert.js';
import { page, step } from '../harness/step.js';
import { eventually } from '../harness/wait.js';
import { addToTimetoken } from '../harness/assertions.js';

/**
 * Message persistence examples.
 */
export default page('api-reference/message-persistence', 'P5', (world) => {
  // Publishes `count` messages as the friend and returns their timetokens, oldest first.
  const seed = async (channel: string, count: number): Promise<string[]> => {
    const tokens: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const { timetoken } = await world.friend.publish({ channel, message: { seed: i }, customMessageType: 'seed' });
      tokens.push(timetoken);
    }
    return tokens;
  };

  type WithActions = { actions?: Record<string, Record<string, unknown[]>> };

  // Waits until every seeded timetoken is visible to a reader. The write and the read model are separate, so one read is not enough.
  const untilStored = (channel: string, tokens: string[]): Promise<void> =>
    eventually(async () => {
      const history = await world.observer.fetchMessages({ channels: [channel], count: 100 });
      const have = new Set((history.channels[channel] ?? []).map((m) => String(m.timetoken)));
      for (const token of tokens) assert.ok(have.has(token), `${token} is not stored yet`);
    }, { timeout: 30_000, label: `messages stored on ${channel}` });

  step('fetchMessagesBasicUsage', { needs: ['preflightPersistence'], proves: 'fetchMessages with count, start and end returns exactly one seeded message.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('my-channel');
    const tokens = await seed(channel, 3);
    await untilStored(channel, tokens);
    // `start` is the exclusive newer bound and `end` the inclusive older bound.
    world.setPh('historyStart', addToTimetoken(tokens[2], 1));
    world.setPh('historyEnd', tokens[0]);

    // snippet.fetchMessagesBasicUsage
    // Function to fetch message history
    const result = await pubnub.fetchMessages({
      channels: ['my-channel'],
      count: 1, // Number of messages to retrieve
      includeCustomMessageType: true, // if you want to include custom message type in the response
      start: 'replace-with-start-timetoken', // start timetoken
      end: 'replace-with-end-timetoken', // end timetoken
    });
    console.log('Fetched Messages:', result);
    // snippet.end
    const messages = result.channels[channel] ?? [];
    assert.equal(messages.length, 1, 'count: 1 returns one message');
    assert.ok(tokens.includes(String(messages[0].timetoken)), 'the message is one of the seeded ones');
    assert.equal(messages[0].customMessageType, 'seed');
  });

  step('fetchMessagesWithMetaActions', { needs: ['preflightPersistence'], proves: 'fetchMessages returns meta, message actions and the custom message type when asked for.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('my_channel');
    const { timetoken } = await world.friend.publish({
      channel,
      message: { text: 'with meta and an action' },
      meta: { source: 'docs-snippets' },
      customMessageType: 'text-message',
    });
    await world.friend.addMessageAction({
      channel,
      messageTimetoken: timetoken,
      action: { type: 'reaction', value: 'smiley_face' },
    });
    await eventually(async () => {
      const probe = await world.observer.fetchMessages({ channels: [channel], includeMessageActions: true, includeMeta: true });
      const found = probe.channels[channel]?.find((m) => String(m.timetoken) === timetoken);
      assert.ok((found as WithActions | undefined)?.actions, 'message and its action are stored');
    }, { timeout: 30_000, label: 'message with action stored' });

    // snippet.fetchMessagesWithMetaActions
    const response = await pubnub.fetchMessages({
      channels: ['my_channel'],
      stringifiedTimeToken: true,
      includeMeta: true,
      includeMessageActions: true,
      includeCustomMessageType: true,
    });
    console.log('fetch messages response:', response);
    // snippet.end
    const found = response.channels[channel]?.find((m) => String(m.timetoken) === timetoken);
    assert.ok(found, 'the seeded message is returned');
    assert.deepEqual(found.meta, { source: 'docs-snippets' });
    assert.equal(found.customMessageType, 'text-message');
    assert.ok((found as WithActions).actions?.reaction?.smiley_face, 'the reaction is attached to the message');
  });

  step('messageCountBasicUsage', { needs: ['preflightPersistence'], proves: 'messageCounts with one timetoken counts the messages per channel since that time.' }, async () => {
    const pubnub = world.shopper;
    const [room1, room2] = [world.n('chats.room1'), world.n('chats.room2')];
    const before = (await world.observer.time()).timetoken;
    const first = await seed(room1, 2);
    const second = await seed(room2, 1);
    await untilStored(room1, first);
    await untilStored(room2, second);
    world.setPh('countFrom', before);

    // snippet.messageCountBasicUsage
    const result = await pubnub.messageCounts({
      channels: ['chats.room1', 'chats.room2'],
      channelTimetokens: ['replace-with-timetoken'], // single timetoken applied to all channels
    });
    console.log('Message counts retrieved successfully:', result);
    // snippet.end
    assert.deepEqual(result.channels, { [room1]: 2, [room2]: 1 });
  });

  step('messageCountTimetokensForChannels', { needs: ['preflightPersistence'], proves: 'messageCounts with one timetoken per channel gives the per-channel counts.' }, async () => {
    const pubnub = world.shopper;
    const channels = [world.n('ch1'), world.n('ch2'), world.n('ch3')];
    // One timetoken per channel, taken just before that channel gets 1, 2 and 3 messages.
    for (const [index, channel] of channels.entries()) {
      world.setPh(`countFromCh${index + 1}`, (await world.observer.time()).timetoken);
      await untilStored(channel, await seed(channel, index + 1));
    }

    // snippet.messageCountTimetokensForChannels
    const response = await pubnub.messageCounts({
      channels: ['ch1', 'ch2', 'ch3'],
      channelTimetokens: [
        'replace-with-channel-timetoken-ch1', // timetoken for channel ch1
        'replace-with-channel-timetoken-ch2', // timetoken for channel ch2
        'replace-with-channel-timetoken-ch3', // timetoken for channel ch3
      ],
    });
    console.log('message count response:', response);
    // snippet.end
    assert.deepEqual(response.channels, { [channels[0]]: 1, [channels[1]]: 2, [channels[2]]: 3 });
  });

  // `start` is exclusive and `end` inclusive, so start = T - 1 and end = T delete exactly the message at T.
  const deleteOne = async (): Promise<{ channel: string; token: string }> => {
    const channel = world.n('ch1');
    const [token] = await seed(channel, 1);
    await untilStored(channel, [token]);
    world.setPh('historyStart', addToTimetoken(token, -1));
    world.setPh('historyEnd', token);
    return { channel, token };
  };

  // Waits until a deleted message is gone for readers, deletion is also eventually consistent.
  const untilDeleted = (channel: string, token: string): Promise<void> =>
    eventually(async () => {
      const history = await world.observer.fetchMessages({ channels: [channel], count: 100 });
      assert.ok(!(history.channels[channel] ?? []).some((m) => String(m.timetoken) === token), 'message is still stored');
    }, { timeout: 30_000, label: 'message deleted' });

  step('deleteMessagesBasicUsage', { needs: ['preflightDeleteFromHistory'], proves: 'deleteMessages removes exactly the message at the boundary timetoken.' }, async () => {
    const pubnub = world.shopper;
    const { channel, token } = await deleteOne();

    // snippet.deleteMessagesBasicUsage
    const result = await pubnub.deleteMessages({
      channel: 'ch1',
      start: 'replace-with-start-timetoken',
      end: 'replace-with-end-timetoken',
    });
    console.log('Messages deleted successfully:', result);
    // snippet.end
    await untilDeleted(channel, token);
  });

  step('deleteSpecificMessages', { needs: ['preflightDeleteFromHistory'], proves: 'The second deleteMessages sample removes exactly the message at its boundary timetoken.' }, async () => {
    const pubnub = world.shopper;
    const { channel, token } = await deleteOne();

    // snippet.deleteSpecificMessages
    const response = await pubnub.deleteMessages({
      channel: 'ch1',
      start: 'replace-with-start-timetoken',
      end: 'replace-with-end-timetoken',
    });
    console.log('delete messages response:', response);
    // snippet.end
    await untilDeleted(channel, token);
  });
});
