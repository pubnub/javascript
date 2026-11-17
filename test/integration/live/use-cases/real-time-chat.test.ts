import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import PubNub from 'pubnub';
import { assertTimetoken } from '../support/assertions';
import { createClient, observer, track } from '../support/clients';
import { captureConsole } from '../support/console';
import { keysOf } from '../support/env';
import { withPlaceholders } from '../support/placeholders';
import { connected, eventually, PRESENCE_TIMEOUT } from '../support/wait';

/**
 * Port of docs-snippets/use-cases/real-time-chat.ts (page use-cases/sports-media-entertainment/real-time-chat).
 * One flow, as the page runs it: set channel and fan metadata, join with presence, send, load history, count fans, react.
 * Needs Presence, Message Persistence and App Context on the open keyset.
 */
describe('use-cases/real-time-chat', () => {
  const clean = async (): Promise<void> => {
    const cleaner = createClient('open', 'real-time-chat-cleaner');
    // Best effort: everything the sample writes under its literal names.
    await cleaner.deleteMessages({ channel: 'game.chat' }).catch(() => undefined);
    await cleaner.objects.removeChannelMetadata({ channel: 'game.chat' }).catch(() => undefined);
    await cleaner.objects.removeUUIDMetadata({ uuid: 'fan-42' }).catch(() => undefined);
  };
  before(clean);
  after(clean);

  it('fanChatCreateChannelMetadata, fanChatSetFanProfile, fanChatSubscribeWithPresence, fanChatSendMessage, fanChatLoadRecentMessages, fanChatCountFansOnline, fanChatReceiveReactions, fanChatAddReaction: two fans chat, see presence and history, and a reaction reaches the subscriber', async function () {
    this.timeout(120_000);
    const { publishKey, subscribeKey } = keysOf('open');
    const log = captureConsole('log');
    const errors = captureConsole('error');
    try {
      const reader = observer();
      // The second fan of the page (index2.js).
      const fan108 = createClient('open', 'fan-108');
      // The page tells readers to replace the timetoken placeholder by the timetoken of the message they sent. Only that
      // argument is swapped, the value is filled in below once the message exists.
      const placeholders: Record<string, string> = {};
      const pubnub = withPlaceholders(track(new PubNub({ publishKey, subscribeKey, userId: 'fan-42' })), placeholders);

      /* eslint-disable prettier/prettier */
      // snippet.fanChatCreateChannelMetadata
      try {
        const response = await pubnub.objects.setChannelMetadata({
          channel: 'game.chat',
          data: {
            name: 'Match chat',
            description: 'Open chat for everyone watching the match',
          },
        });
        console.log('channel metadata set:', response.data);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Setting the channel metadata failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.deepEqual(errors.lines, [], 'channel metadata: error path not taken');
      assert.ok(log.lines.some((l) => l.startsWith('channel metadata set: ') && l.includes('"name":"Match chat"')));
      // Another client reads the same header back.
      await eventually(async () => {
        const read = await reader.objects.getChannelMetadata({ channel: 'game.chat' });
        assert.equal(read.data.name, 'Match chat');
        assert.equal(read.data.description, 'Open chat for everyone watching the match');
      });

      /* eslint-disable prettier/prettier */
      // snippet.fanChatSetFanProfile
      try {
        const response = await pubnub.objects.setUUIDMetadata({
          uuid: 'fan-42',
          data: {
            name: 'Alex Moreau',
            profileUrl: 'https://example.com/avatars/fan-42.png',
            custom: { supports: 'home' },
          },
        });
        console.log('fan profile set:', response.data);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Setting the fan profile failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.deepEqual(errors.lines, [], 'fan profile: error path not taken');
      assert.ok(log.lines.some((l) => l.startsWith('fan profile set: ') && l.includes('"supports":"home"')));
      await eventually(async () => {
        const read = await reader.objects.getUUIDMetadata({ uuid: 'fan-42' });
        assert.equal(read.data.name, 'Alex Moreau');
        assert.equal(read.data.profileUrl, 'https://example.com/avatars/fan-42.png');
        assert.deepEqual(read.data.custom, { supports: 'home' });
      });

      // Join with presence events. The second fan joins afterwards, so the presence handler has something to report.
      const joined = connected(pubnub, { channels: ['game.chat'] });
      /* eslint-disable prettier/prettier */
      // snippet.fanChatSubscribeWithPresence
      const chatChannel = pubnub.channel('game.chat');
      const chatSubscription = chatChannel.subscription({ receivePresenceEvents: true });

      chatSubscription.onMessage = (event) => {
        console.log(`${event.publisher}: ${JSON.stringify(event.message)}`);
      };

      chatSubscription.onPresence = (event) => {
        if (event.action === 'interval' || event.action === 'join' || event.action === 'leave') {
          console.log('fans in this chat:', event.occupancy);
        }
      };

      chatSubscription.subscribe();
      // snippet.end
      /* eslint-enable prettier/prettier */
      await joined;
      assert.ok(pubnub.getSubscribedChannels().includes('game.chat'));
      // fan-108 joins: the presence handler of the sample prints the occupancy, which now counts both fans.
      log.lines.length = 0;
      const join108 = connected(fan108, { channels: ['game.chat'] });
      fan108.subscriptionSet({ channels: ['game.chat'] }).subscribe();
      await join108;
      await eventually(
        () =>
          assert.ok(
            log.lines.some((l) => /^fans in this chat: ([2-9]|\d\d+)$/.test(l)),
            `logged: ${log.lines.join(' | ')}`,
          ),
        { label: 'presence handler of the sample prints an occupancy of at least 2', timeout: PRESENCE_TIMEOUT },
      );

      /* eslint-disable prettier/prettier */
      // snippet.fanChatSendMessage
      try {
        const response = await pubnub.publish({
          channel: 'game.chat',
          message: { text: 'What a save!' },
          customMessageType: 'text-message',
          storeInHistory: true,
        });
        console.log('chat message published at timetoken:', response.timetoken);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Publishing the chat message failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.deepEqual(errors.lines, [], 'send: error path not taken');
      const sentLine = log.lines.find((l) => l.startsWith('chat message published at timetoken: '));
      assert.ok(sentLine, `logged: ${log.lines.join(' | ')}`);
      const messageTimetoken = sentLine.split(': ')[1];
      assertTimetoken(messageTimetoken);
      placeholders['replace-with-message-timetoken'] = messageTimetoken;
      // The message reaches the sample's own message handler (the sender is subscribed too).
      await eventually(() => assert.ok(log.lines.includes('fan-42: {"text":"What a save!"}'), log.lines.join(' | ')));

      // The other fan answers: the message handler prints `<publisher>: <json>`.
      const reply = `reply-${randomUUID()}`;
      await fan108.publish({ channel: 'game.chat', message: { text: reply }, storeInHistory: true });
      await eventually(() => assert.ok(log.lines.includes(`fan-108: {"text":"${reply}"}`), log.lines.join(' | ')));

      // Load what was said: Message Persistence lags the publish, so run the sample again until this run's message shows.
      const loadRecent = async (): Promise<void> => {
        /* eslint-disable prettier/prettier */
        // snippet.fanChatLoadRecentMessages
        try {
          const response = await pubnub.fetchMessages({
            channels: ['game.chat'],
            count: 25,
            includeMessageActions: true,
          });

          const entries = response.channels['game.chat'] ?? [];

          entries.forEach((entry) => {
            console.log(entry.timetoken, entry.message);
          });
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(`Loading recent messages failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
        }
        // snippet.end
        /* eslint-enable prettier/prettier */
      };
      await eventually(
        async () => {
          log.lines.length = 0;
          await loadRecent();
          assert.deepEqual(errors.lines, [], 'load: error path not taken');
          assert.ok(
            log.lines.includes(`${messageTimetoken} {"text":"What a save!"}`),
            `backlog: ${log.lines.join(' | ')}`,
          );
        },
        { label: 'backlog contains the message of this run' },
      );

      // Here Now in count-only mode: at least the two fans of this run are present (others may be, on the shared channel).
      const countFans = async (): Promise<void> => {
        /* eslint-disable prettier/prettier */
        // snippet.fanChatCountFansOnline
        try {
          const response = await pubnub.hereNow({
            channels: ['game.chat'],
            includeUUIDs: false,
          });
          console.log('fans in the chat:', response.totalOccupancy);
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(`Counting the fans online failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
        }
        // snippet.end
        /* eslint-enable prettier/prettier */
      };
      await eventually(
        async () => {
          log.lines.length = 0;
          await countFans();
          assert.deepEqual(errors.lines, [], 'count: error path not taken');
          const line = log.lines.find((l) => l.startsWith('fans in the chat: '));
          assert.ok(line, `logged: ${log.lines.join(' | ')}`);
          assert.ok(Number(line.split(': ')[1]) >= 2, line);
        },
        { label: 'Here Now counts both fans', timeout: PRESENCE_TIMEOUT },
      );

      // Reactions: the handler is registered first, then a reaction is added to the message sent above.
      log.lines.length = 0;
      const reactionsReady = connected(pubnub, { channels: ['game.chat'] }, { timeout: 5000 }).catch(() => undefined);
      /* eslint-disable prettier/prettier */
      // snippet.fanChatReceiveReactions
      const reactionsSubscription = pubnub.channel('game.chat').subscription();

      reactionsSubscription.onMessageAction = (event) => {
        console.log(`${event.publisher} reacted with ${event.data.value} to the message at ${event.data.messageTimetoken}`);
      };

      reactionsSubscription.subscribe();
      // snippet.end
      /* eslint-enable prettier/prettier */
      await reactionsReady;
      assert.ok(reactionsSubscription);

      /* eslint-disable prettier/prettier */
      // snippet.fanChatAddReaction
      try {
        const response = await pubnub.addMessageAction({
          channel: 'game.chat',
          messageTimetoken: 'replace-with-message-timetoken',
          action: {
            type: 'reaction',
            value: '\u{1F44F}',
          },
        });
        console.log('reaction added at timetoken:', response.data.actionTimetoken);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Adding the reaction failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.deepEqual(errors.lines, [], 'reaction: error path not taken');
      const reactionLine = log.lines.find((l) => l.startsWith('reaction added at timetoken: '));
      assert.ok(reactionLine, `logged: ${log.lines.join(' | ')}`);
      const actionTimetoken = reactionLine.split(': ')[1];
      assertTimetoken(actionTimetoken);
      await eventually(
        () =>
          assert.ok(
            log.lines.includes(`fan-42 reacted with \u{1F44F} to the message at ${messageTimetoken}`),
            log.lines.join(' | '),
          ),
        { label: 'reaction event reaches the subscription' },
      );
      // The reaction is stored against the original message.
      await eventually(async () => {
        const actions = await reader.getMessageActions({ channel: 'game.chat' });
        const mine = actions.data.find((a) => a.actionTimetoken === actionTimetoken);
        assert.equal(mine?.messageTimetoken, messageTimetoken);
        assert.equal(mine?.type, 'reaction');
        assert.equal(mine?.value, '\u{1F44F}');
      });
    } finally {
      log.restore();
      errors.restore();
    }
  });
});
