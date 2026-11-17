/* eslint-disable prettier/prettier, max-len -- sample text must stay character for character, so its long lines cannot be re-wrapped */
import assert from 'node:assert/strict';
import { assertTimetoken } from '../support/assertions';
import { createClient } from '../support/clients';
import { captureConsole } from '../support/console';
import { keysOf } from '../support/env';
import { withPlaceholders } from '../support/placeholders';
import { connected, eventually, sleep } from '../support/wait';

/**
 * Hide and remove chat messages. Port of docs-snippets/use-cases/game-chat-moderation.ts.
 * Runs on the Access Manager keyset (grantToken needs the secret key); Message Persistence and Delete-From-History must be on.
 */
describe('use-cases/game-chat-moderation', () => {
  const published: string[] = [];
  const cleaner = () =>
    createClient('pam', 'moderation-cleaner', { secretKey: keysOf('pam').secretKey, heartbeatInterval: 0 });

  after(async () => {
    // Best effort: remove the messages this test left on the shared literal channels (one tick wide windows).
    for (const [channel, timetoken] of published.map((entry) => entry.split(':') as [string, string])) {
      try {
        await cleaner().deleteMessages({ channel, start: (BigInt(timetoken) - BigInt(1)).toString(), end: timetoken });
      } catch {
        // already deleted, or the keyset has no Delete-From-History
      }
    }
  });

  it('chatModerationGrantControlChannelAccess, chatModerationApplyModeratorToken, chatModerationFlagMessage, chatModerationReceiveModerationDecisions, chatModerationLoadHistoryWithFlags, chatModerationDeleteMessage: a moderator token lets moderator-7 flag a message, clients hide it live and from history, and the server deletes it for good', async function () {
    this.timeout(120_000);
    const { publishKey, subscribeKey, secretKey } = keysOf('pam');
    const logs = captureConsole('log');
    const errors = captureConsole('error');
    const realBigInt = globalThis.BigInt;
    // The moderator's own client has no secret key; the server holds it.
    // Placeholders of the samples (token, message timetoken) are filled in at call time from this object.
    const placeholders: Record<string, string> = {};
    const pubnub = withPlaceholders(createClient('pam', 'moderator-7'), placeholders);
    const server = withPlaceholders(
      createClient('pam', 'moderation-service', { secretKey, heartbeatInterval: 0 }),
      placeholders,
    );
    assert.ok(publishKey && subscribeKey);
    try {
      // snippet.chatModerationGrantControlChannelAccess
      try {
        const token = await server.grantToken({
          ttl: 60,
          authorizedUserId: 'moderator-7',
          resources: {
            channels: {
              'game.chat': { read: true },
              'game.chat.moderation': { read: true, write: true },
            },
          },
        });
        console.log('token that lets moderator-7 publish hide decisions:', token);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Granting moderator access failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end

      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      const grantLine = logs.lines.find((line) => line.startsWith('token that lets moderator-7 publish hide decisions: '));
      assert.ok(grantLine, 'the sample printed the token');
      const token = grantLine.slice('token that lets moderator-7 publish hide decisions: '.length);
      const parsed = server.parseToken(token);
      assert.ok(parsed, 'the token parses');
      assert.equal(parsed.authorized_uuid, 'moderator-7');
      assert.equal(parsed.ttl, 60);
      assert.deepEqual(parsed.resources?.channels?.['game.chat.moderation'], {
        read: true,
        write: true,
        manage: false,
        delete: false,
        get: false,
        update: false,
        join: false,
      });
      assert.equal(parsed.resources?.channels?.['game.chat']?.read, true);
      assert.equal(parsed.resources?.channels?.['game.chat']?.write, false);

      // The sample shows a placeholder where the reader pastes the printed token, message timetoken and so on.
      // This test chat message is what a moderator would flag. The server publishes it (fans' tokens are another page).
      const flagged = await server.publish({ channel: 'game.chat', message: { text: `moderation test: flag me ${Date.now()}` } });
      const neighbour = await server.publish({ channel: 'game.chat', message: { text: `moderation test: keep me ${Date.now()}` } });
      published.push(`game.chat:${flagged.timetoken}`, `game.chat:${neighbour.timetoken}`);
      placeholders['replace-with-the-token-server-js-printed'] = token;
      placeholders['replace-with-message-timetoken'] = flagged.timetoken;

      // snippet.chatModerationApplyModeratorToken
      pubnub.setToken('replace-with-the-token-server-js-printed');
      // snippet.end

      assert.equal(pubnub.getToken(), token, 'the moderator client now carries the granted token');
      // A grant takes a moment to apply on the service. Probe with a signal (not a message) until write is accepted.
      await eventually(() => pubnub.signal({ channel: 'game.chat.moderation', message: 'probe' }), {
        timeout: 30_000,
        label: 'token accepted for write on game.chat.moderation',
      });

      // snippet.chatModerationFlagMessage
      try {
        const response = await pubnub.publish({
          channel: 'game.chat.moderation',
          message: {
            action: 'hide',
            messageTimetoken: 'replace-with-message-timetoken',
          },
          customMessageType: 'moderation-hide',
          storeInHistory: true,
        });
        console.log('message flagged at timetoken:', response.timetoken);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Flagging the message failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end

      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      const flagLine = logs.lines.find((line) => line.startsWith('message flagged at timetoken: '));
      assert.ok(flagLine, 'the sample reported the flag');
      const flagTimetoken = flagLine.slice('message flagged at timetoken: '.length);
      assertTimetoken(flagTimetoken);
      published.push(`game.chat.moderation:${flagTimetoken}`);

      const ready = connected(pubnub, { channels: ['game.chat.moderation'] });
      // snippet.chatModerationReceiveModerationDecisions
      const hiddenTimetokens = new Set();

      const moderationSubscription = pubnub.channel('game.chat.moderation').subscription();

      moderationSubscription.onMessage = (event) => {
        const decision = event.message;
        const action =
          typeof decision === 'object' && decision !== null && !Array.isArray(decision) && 'action' in decision
            ? decision.action
            : undefined;
        const messageTimetoken =
          typeof decision === 'object' && decision !== null && !Array.isArray(decision) && 'messageTimetoken' in decision
            ? decision.messageTimetoken
            : undefined;

        if (action === 'hide' && typeof messageTimetoken === 'string') {
          hiddenTimetokens.add(messageTimetoken);
          console.log('hide the message published at', messageTimetoken);
        }
      };

      moderationSubscription.subscribe();
      // snippet.end

      await ready;
      // The page's own run order (everything is appended to moderator.js, in page order: apply token, flag, subscribe, history)
      // publishes the flag before this subscription exists. A subscription starts at the current server time, so that earlier
      // decision is NOT delivered live; moderator.js sees it only in the history fetch. Proved below: a decision published after
      // the subscription is received, and the earlier flag was not received before it (messages arrive in order).
      // A decision published after the subscription is delivered: flag a third message to prove the handler.
      const live = await server.publish({ channel: 'game.chat', message: { text: `moderation test: live hide ${Date.now()}` } });
      published.push(`game.chat:${live.timetoken}`);
      const liveDecision = await pubnub.publish({
        channel: 'game.chat.moderation',
        message: { action: 'hide', messageTimetoken: live.timetoken },
        customMessageType: 'moderation-hide',
        storeInHistory: true,
      });
      published.push(`game.chat.moderation:${liveDecision.timetoken}`);
      await eventually(() => assert.ok(hiddenTimetokens.has(live.timetoken), 'live decision handled'), {
        label: 'live hide decision received',
      });
      assert.ok(logs.lines.includes(`hide the message published at ${live.timetoken}`));
      assert.ok(!hiddenTimetokens.has(flagged.timetoken), 'the flag published before the subscription was not delivered live');
      assert.ok(
        !logs.lines.includes(`hide the message published at ${flagged.timetoken}`),
        'the page order logs no live hide event for the flag published before the subscription',
      );
      // A decision that is not a hide for a string timetoken is ignored.
      await pubnub.publish({ channel: 'game.chat.moderation', message: { action: 'noop', messageTimetoken: neighbour.timetoken } });
      await pubnub.publish({ channel: 'game.chat.moderation', message: 'just text' });
      await sleep(1500);
      assert.ok(!hiddenTimetokens.has(neighbour.timetoken), 'a non-hide decision hides nothing');
      assert.deepEqual(errors.lines, [], 'the error path was not taken');

      // Wait until history holds the three chat messages and both hide decisions, so the history fetch sees them.
      await eventually(
        async () => {
          const history = await server.fetchMessages({ channels: ['game.chat', 'game.chat.moderation'], count: 25 });
          const chat = (history.channels['game.chat'] ?? []).map((m) => m.timetoken);
          const decisions = (history.channels['game.chat.moderation'] ?? []).map((m) => m.timetoken);
          assert.ok([flagged, neighbour, live].every((m) => chat.includes(m.timetoken)), 'chat messages stored');
          assert.ok([flagTimetoken, liveDecision.timetoken].every((t) => decisions.includes(t)), 'decisions stored');
        },
        { timeout: 30_000, label: 'history holds this run' },
      );
      logs.lines.length = 0;

      // snippet.chatModerationLoadHistoryWithFlags
      try {
        const response = await pubnub.fetchMessages({
          channels: ['game.chat', 'game.chat.moderation'],
          count: 25,
        });

        const moderationEntries = response.channels['game.chat.moderation'] ?? [];

        moderationEntries.forEach((entry) => {
          const decision = entry.message;
          const action =
            typeof decision === 'object' && decision !== null && !Array.isArray(decision) && 'action' in decision
              ? decision.action
              : undefined;
          const messageTimetoken =
            typeof decision === 'object' && decision !== null && !Array.isArray(decision) && 'messageTimetoken' in decision
              ? decision.messageTimetoken
              : undefined;

          if (action === 'hide' && typeof messageTimetoken === 'string') {
            hiddenTimetokens.add(messageTimetoken);
          }
        });

        const chatEntries = response.channels['game.chat'] ?? [];

        chatEntries.forEach((entry) => {
          const hidden = hiddenTimetokens.has(entry.timetoken.toString());
          console.log(entry.timetoken, hidden ? '[hidden by a moderator]' : entry.message);
        });
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Loading the moderated history failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end

      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      assert.ok(hiddenTimetokens.has(flagged.timetoken), 'history gave the hide decision of the flagged message');
      assert.ok(logs.lines.includes(`${flagged.timetoken} [hidden by a moderator]`), 'flagged message is rendered as hidden');
      assert.ok(logs.lines.includes(`${live.timetoken} [hidden by a moderator]`), 'live-flagged message is rendered as hidden');
      const neighbourLine = logs.lines.find((line) => line.startsWith(`${neighbour.timetoken} `));
      assert.ok(neighbourLine && neighbourLine.includes('keep me') && !neighbourLine.includes('hidden'), 'unflagged message keeps its text');

      // The sample has a placeholder timetoken as a local variable that it passes to BigInt(). Substitute the placeholder
      // inside BigInt for this run (the text readers see stays as it is); `end` goes through the placeholder wrapper.
      globalThis.BigInt = Object.assign(
        ((value: unknown) => realBigInt(value === 'replace-with-message-timetoken' ? flagged.timetoken : (value as string))) as typeof BigInt,
        realBigInt,
      );
      logs.lines.length = 0;

      // snippet.chatModerationDeleteMessage
      try {
        const messageTimetoken = 'replace-with-message-timetoken';
        const start = (BigInt(messageTimetoken) - BigInt(1)).toString();
        const end = messageTimetoken;

        const response = await server.deleteMessages({
          channel: 'game.chat',
          start,
          end,
        });
        console.log('message deleted from Message Persistence:', response);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Deleting the message failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end

      globalThis.BigInt = realBigInt;
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      assert.ok(logs.lines.some((line) => line.startsWith('message deleted from Message Persistence:')));
      // Only the flagged message is gone; the hide decision and the neighbouring messages stay.
      await eventually(
        async () => {
          const history = await server.fetchMessages({ channels: ['game.chat', 'game.chat.moderation'], count: 25 });
          const chat = (history.channels['game.chat'] ?? []).map((m) => m.timetoken);
          assert.ok(!chat.includes(flagged.timetoken), 'flagged message is deleted');
          assert.ok(chat.includes(neighbour.timetoken) && chat.includes(live.timetoken), 'the other messages stay');
          const decisions = (history.channels['game.chat.moderation'] ?? []).map((m) => m.timetoken);
          assert.ok(decisions.includes(flagTimetoken), 'the hide decision stays in history');
        },
        { label: 'only the flagged message is deleted' },
      );
    } finally {
      globalThis.BigInt = realBigInt;
      logs.restore();
      errors.restore();
    }
  });
});
