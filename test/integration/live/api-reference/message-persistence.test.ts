import assert from 'node:assert/strict';
import type PubNub from 'pubnub';
import { addToTimetoken } from '../support/assertions';
import { friend, observer, shopper } from '../support/clients';
import { retryTransient } from '../support/retry';
import { withPlaceholders } from '../support/placeholders';
import { newSeedRun, seedPublish, settleSeeded, untilStored } from '../support/history';
import { eventually, settled } from '../support/wait';

/**
 * Message persistence examples. Message Persistence and
 * Delete-From-History must be on for the open keyset.
 *
 * The samples carry placeholder literals (`replace-with-start-timetoken` and so on). The client is wrapped with
 * `withPlaceholders`, so the sample text stays unchanged and the real timetokens reach the service. Channels are shared and
 * persistent: every assertion is bounded to a timetoken window that holds only what this test published.
 * Residue: seeded messages (customMessageType `seed`) stay on `my-channel`, `chats.room1`, `chats.room2`, `ch2`, `ch3`
 * and `my_channel` (one message with meta and a reaction). `ch1` messages are deleted by the delete tests.
 */
describe('api-reference/message-persistence', () => {
  // Publishes `count` messages as the friend and returns their timetokens, oldest first. Setup, so a transient publish failure
  // is repeated (seedPublish); settleSeeded then removes any stored copy a repeat left behind, so the windows below hold exactly
  // the returned messages.
  const seed = async (channel: string, count: number): Promise<string[]> => {
    const run = newSeedRun();
    const tokens: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const { timetoken } = await seedPublish(run, `seed ${channel} publish`, () =>
        friend().publish({ channel, message: { seed: i, run: run.id }, customMessageType: 'seed' }),
      );
      tokens.push(timetoken);
    }
    await settleSeeded(channel, tokens, run);
    return tokens;
  };

  type WithActions = { actions?: Record<string, Record<string, unknown[]>> };

  it('fetchMessagesBasicUsage: fetchMessages with count, start and end returns one message of the window', async () => {
    const tokens = await seed('my-channel', 3);
    await untilStored('my-channel', tokens);
    // `start` is the exclusive newer bound and `end` the inclusive older bound: the window holds exactly the three messages.
    const pubnub = withPlaceholders(shopper(), {
      'replace-with-start-timetoken': addToTimetoken(tokens[2], 1),
      'replace-with-end-timetoken': tokens[0],
    });

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
    const messages = result.channels['my-channel'] ?? [];
    assert.equal(messages.length, 1, 'count: 1 returns one message');
    assert.ok(tokens.includes(String(messages[0].timetoken)), 'the message is one of the seeded ones');
    assert.equal(messages[0].customMessageType, 'seed');
  });

  it('fetchMessagesWithMetaActions: fetchMessages returns meta, message actions and the custom message type when asked for', async () => {
    const pubnub = shopper();
    // Setup, so the publish is repeated on a transient failure. A stored copy of a repeated publish is harmless: the test reads
    // its message by timetoken. The action is not repeated (a second add could count twice).
    const { timetoken } = await retryTransient(
      () =>
        friend().publish({
          channel: 'my_channel',
          message: { text: 'with meta and an action' },
          meta: { source: 'docs-snippets' },
          customMessageType: 'text-message',
        }),
      { label: 'seed my_channel publish' },
    );
    await friend().addMessageAction({
      channel: 'my_channel',
      messageTimetoken: timetoken,
      action: { type: 'reaction', value: 'smiley_face' },
    });
    // The same read as the sample, from another client, until it holds on consecutive polls.
    await settled(
      async () => {
        const probe = await observer().fetchMessages({
          channels: ['my_channel'],
          stringifiedTimeToken: true,
          includeMeta: true,
          includeMessageActions: true,
          includeCustomMessageType: true,
        });
        const found = probe.channels['my_channel']?.find((m) => String(m.timetoken) === timetoken);
        assert.ok((found as WithActions | undefined)?.actions, 'message and its action are stored');
        assert.deepEqual(found?.meta, { source: 'docs-snippets' });
      },
      { timeout: 30_000, label: 'message with action stored' },
    );

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
    // The sample asks for the newest messages of a shared channel, so look up this run's message by its timetoken.
    const found = response.channels['my_channel']?.find((m) => String(m.timetoken) === timetoken);
    assert.ok(found, 'the seeded message is returned');
    assert.deepEqual(found.meta, { source: 'docs-snippets' });
    assert.equal(found.customMessageType, 'text-message');
    assert.ok((found as WithActions).actions?.reaction?.smiley_face, 'the reaction is attached to the message');
  });

  it('messageCountBasicUsage: messageCounts with one timetoken counts the messages per channel since that time', async () => {
    const before = (await observer().time()).timetoken;
    const first = await seed('chats.room1', 2);
    const second = await seed('chats.room2', 1);
    await untilStored('chats.room1', first);
    await untilStored('chats.room2', second);
    // messageCounts is its own read path, so wait for the same count the sample reads, not only for the history.
    await settled(
      async () => {
        const counts = await observer().messageCounts({
          channels: ['chats.room1', 'chats.room2'],
          channelTimetokens: [before],
        });
        assert.ok(counts.channels['chats.room1'] >= 2, `chats.room1 counts ${counts.channels['chats.room1']}`);
        assert.ok(counts.channels['chats.room2'] >= 1, `chats.room2 counts ${counts.channels['chats.room2']}`);
      },
      { label: 'message counts caught up' },
    );
    const pubnub = withPlaceholders(shopper(), { 'replace-with-timetoken': before });

    // snippet.messageCountBasicUsage
    const result = await pubnub.messageCounts({
      channels: ['chats.room1', 'chats.room2'],
      channelTimetokens: ['replace-with-timetoken'], // single timetoken applied to all channels
    });
    console.log('Message counts retrieved successfully:', result);
    // snippet.end
    // The count covers the window since `before`, which holds this test's messages. The channels are shared, so allow more
    // than were seeded, but never fewer.
    assert.ok(
      result.channels['chats.room1'] >= 2,
      `chats.room1 counts the 2 seeded messages (got ${result.channels['chats.room1']})`,
    );
    assert.ok(
      result.channels['chats.room2'] >= 1,
      `chats.room2 counts the seeded message (got ${result.channels['chats.room2']})`,
    );
  });

  it('messageCountTimetokensForChannels: messageCounts with one timetoken per channel gives the per-channel counts', async () => {
    const channels = ['ch1', 'ch2', 'ch3'];
    // One timetoken per channel, taken just before that channel gets 1, 2 and 3 messages.
    const froms: string[] = [];
    for (const [index, channel] of channels.entries()) {
      froms.push((await observer().time()).timetoken);
      await seed(channel, index + 1);
    }
    // One wait for the three channels: the same count the sample reads, held on consecutive polls.
    await settled(
      async () => {
        const counts = await observer().messageCounts({ channels, channelTimetokens: froms });
        channels.forEach((channel, index) => {
          assert.ok(counts.channels[channel] >= index + 1, `${channel} counts ${counts.channels[channel]}`);
        });
      },
      { label: 'message counts caught up on ch1, ch2, ch3' },
    );
    const pubnub = withPlaceholders(shopper(), {
      'replace-with-channel-timetoken-ch1': froms[0],
      'replace-with-channel-timetoken-ch2': froms[1],
      'replace-with-channel-timetoken-ch3': froms[2],
    });

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
    // Each window starts just before this test's own messages. Shared channels may hold more, never fewer.
    channels.forEach((channel, index) => {
      assert.ok(
        response.channels[channel] >= index + 1,
        `${channel} counts its ${index + 1} seeded messages (got ${response.channels[channel]})`,
      );
    });
  });

  // `start` is exclusive and `end` inclusive, so start = T - 1 and end = T delete exactly the message at T.
  // A neighbour is published right after the target, and must survive the delete. One wait covers both.
  const deleteOne = async (): Promise<{ token: string; neighbour: string; placeholders: Record<string, string> }> => {
    const [token] = await seed('ch1', 1);
    const [neighbour] = await seed('ch1', 1);
    await untilStored('ch1', [token, neighbour]);
    return {
      token,
      neighbour,
      placeholders: {
        'replace-with-start-timetoken': addToTimetoken(token, -1),
        'replace-with-end-timetoken': token,
      },
    };
  };

  // Waits until a deleted message is gone for readers, deletion is also eventually consistent.
  const untilDeleted = (channel: string, token: string): Promise<void> =>
    eventually(
      async () => {
        const history = await observer().fetchMessages({ channels: [channel], count: 100 });
        assert.ok(
          !(history.channels[channel] ?? []).some((m) => String(m.timetoken) === token),
          'message is still stored',
        );
      },
      { timeout: 30_000, label: 'message deleted' },
    );

  it('deleteMessagesBasicUsage: deleteMessages removes exactly the message at the boundary timetoken', async () => {
    // A neighbour published right after must survive the delete of `token`.
    const { token, neighbour, placeholders } = await deleteOne();
    const pubnub = withPlaceholders(shopper(), placeholders);

    // snippet.deleteMessagesBasicUsage
    const result = await pubnub.deleteMessages({
      channel: 'ch1',
      start: 'replace-with-start-timetoken',
      end: 'replace-with-end-timetoken',
    });
    console.log('Messages deleted successfully:', result);
    // snippet.end
    await untilDeleted('ch1', token);
    const left = await observer().fetchMessages({ channels: ['ch1'], count: 100 });
    assert.ok(
      left.channels['ch1']?.some((m) => String(m.timetoken) === neighbour),
      'the neighbouring message is kept',
    );
  });

  it('deleteSpecificMessages: the second deleteMessages sample removes exactly the message at its boundary timetoken', async () => {
    const { token, neighbour, placeholders } = await deleteOne();
    const pubnub = withPlaceholders(shopper(), placeholders);

    // snippet.deleteSpecificMessages
    const response = await pubnub.deleteMessages({
      channel: 'ch1',
      start: 'replace-with-start-timetoken',
      end: 'replace-with-end-timetoken',
    });
    console.log('delete messages response:', response);
    // snippet.end
    await untilDeleted('ch1', token);
    const left = await observer().fetchMessages({ channels: ['ch1'], count: 100 });
    assert.ok(
      left.channels['ch1']?.some((m) => String(m.timetoken) === neighbour),
      'the neighbouring message is kept',
    );
  });
});
