/* eslint-disable prettier/prettier, max-len -- sample text must stay character for character, so its long lines cannot be re-wrapped */
import assert from 'node:assert/strict';
import { createClient, observer } from '../support/clients';
import { captureConsole } from '../support/console';
import { storedMessage } from '../support/history';
import { connected, eventually, sleep, watch } from '../support/wait';

/**
 * Automated polling. Port of docs-snippets/use-cases/automated-polling.ts.
 * The trigger messages come from an Illuminate Business Rule on the real service. The keyset of the tier has no such rule, so
 * the test publishes the triggers itself with the payload the page describes and verifies the poll service side.
 * Needs Message Persistence on the open keyset (the poll is published with storeInHistory).
 */
describe('use-cases/automated-polling', () => {
  it('automatedPollingPublishTriggeredPoll, automatedPollingThrottleTriggers, automatedPollingReceiveTrigger: a trigger opens the poll for its reaction, a second trigger inside the cooldown does not', async function () {
    this.timeout(60_000);
    const pubnub = createClient('open', 'poll-service');
    const logs = captureConsole('log');
    const errors = captureConsole('error');
    const polls = await watch(observer(), ['game.new-poll']);
    try {
      // snippet.automatedPollingPublishTriggeredPoll
      const pollsByReaction = new Map([
        [
          '\u{1F621}',
          {
            title: 'Which team is playing dirtiest?',
            options: [
              { id: 1, text: 'Home team' },
              { id: 2, text: 'Away team' },
            ],
          },
        ],
        [
          '\u{1F389}',
          {
            title: 'Whose fans are celebrating hardest?',
            options: [
              { id: 1, text: 'Home team' },
              { id: 2, text: 'Away team' },
            ],
          },
        ],
      ]);

      async function openPollForReaction(reaction = '') {
        const template = pollsByReaction.get(reaction);

        if (!template) {
          console.log('no poll is defined for', reaction);
          return;
        }

        try {
          const response = await pubnub.publish({
            channel: 'game.new-poll',
            message: {
              id: `poll-${Date.now()}`,
              title: template.title,
              durationSeconds: 30,
              options: template.options,
            },
            customMessageType: 'poll-opened',
            storeInHistory: true,
          });
          console.log('triggered poll published at timetoken:', response.timetoken);
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(
            `Publishing the triggered poll failed: ${error}${status ? ` Additional information: ${status}` : ''}`,
          );
        }
      }
      // snippet.end

      // Open one poll directly, and ask for a reaction nobody defined a poll for.
      await openPollForReaction('\u{1F621}');
      await openPollForReaction('\u{1F4A4}');
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      assert.ok(logs.lines.includes('no poll is defined for \u{1F4A4}'));
      const direct = logs.lines.find((l) => l.startsWith('triggered poll published at timetoken: '));
      assert.ok(direct, 'the poll was published');
      const directTimetoken = direct.slice('triggered poll published at timetoken: '.length);
      const directPoll = await polls.next('message', (m) => m.timetoken === directTimetoken);
      assert.equal(directPoll.customMessageType, 'poll-opened');
      assert.equal(directPoll.publisher, 'poll-service');
      const directBody = directPoll.message as { id: string; title: string; durationSeconds: number; options: unknown[] };
      assert.equal(directBody.title, 'Which team is playing dirtiest?');
      assert.equal(directBody.durationSeconds, 30);
      assert.deepEqual(directBody.options, [
        { id: 1, text: 'Home team' },
        { id: 2, text: 'Away team' },
      ]);
      assert.match(directBody.id, /^poll-\d+$/);
      await eventually(
        async () => {
          assert.ok(await storedMessage(observer(), 'game.new-poll', directTimetoken), 'poll is stored');
        },
        { label: 'poll stored' },
      );
      logs.lines.length = 0;

      // snippet.automatedPollingThrottleTriggers
      const minimumMillisecondsBetweenPolls = 60000;
      let lastPollOpenedAt = 0;

      function shouldOpenPoll() {
        const now = Date.now();

        if (now - lastPollOpenedAt < minimumMillisecondsBetweenPolls) {
          console.log('that trigger arrived inside the cooldown window, so no new poll opened');
          return false;
        }

        lastPollOpenedAt = now;
        return true;
      }
      // snippet.end

      assert.equal(shouldOpenPoll(), true, 'the first trigger is allowed');
      assert.equal(shouldOpenPoll(), false, 'the second one inside the cooldown is refused');
      assert.deepEqual(logs.lines, ['that trigger arrived inside the cooldown window, so no new poll opened']);
      // Reset the cooldown the assertions above consumed, as a fresh service would have it.
      lastPollOpenedAt = 0;
      logs.lines.length = 0;

      const ready = connected(pubnub, { channels: ['game.poll-triggers'] });
      // snippet.automatedPollingReceiveTrigger
      const triggerSubscription = pubnub.channel('game.poll-triggers').subscription({ receivePresenceEvents: false });

      triggerSubscription.onMessage = (event) => {
        const trigger = event.message;
        const rawReaction =
          typeof trigger === 'object' && trigger !== null && !Array.isArray(trigger) && 'reaction' in trigger
            ? trigger.reaction
            : undefined;

        if (typeof rawReaction !== 'string') return;

        const reaction = rawReaction;

        console.log('open a poll because fans keep tapping', reaction);

        if (!pollsByReaction.has(reaction) || shouldOpenPoll()) {
          void openPollForReaction(reaction);
        }
      };

      triggerSubscription.subscribe();
      // snippet.end

      await ready;
      const sender = createClient('open', 'poll-trigger-sender');
      // A message without a reaction is ignored.
      await sender.publish({ channel: 'game.poll-triggers', message: { something: 'else' } });
      // First trigger: a poll for the celebrating reaction opens.
      const trigger = await sender.publish({
        channel: 'game.poll-triggers',
        message: { reaction: '\u{1F389}' },
        customMessageType: 'poll-trigger',
      });
      const opened = await polls.next(
        'message',
        (m) => m.timetoken > directTimetoken && (m.message as { title?: string }).title === 'Whose fans are celebrating hardest?',
      );
      assert.ok(BigInt(opened.timetoken) > BigInt(trigger.timetoken));
      assert.equal(opened.publisher, 'poll-service');
      assert.equal(opened.customMessageType, 'poll-opened');
      assert.ok(logs.lines.includes('open a poll because fans keep tapping \u{1F389}'));
      assert.equal(logs.lines.filter((l) => l.startsWith('open a poll')).length, 1, 'the message without a reaction was ignored');

      // Second mapped trigger inside the cooldown: logged as a trigger, refused by the throttle, no new poll. A wait proves absence.
      const pollsBefore = polls.events.filter((e) => e.kind === 'message').length;
      await sender.publish({
        channel: 'game.poll-triggers',
        message: { reaction: '\u{1F621}' },
        customMessageType: 'poll-trigger',
      });
      await eventually(() => assert.ok(logs.lines.includes('open a poll because fans keep tapping \u{1F621}')), {
        label: 'second trigger received',
      });
      assert.ok(logs.lines.includes('that trigger arrived inside the cooldown window, so no new poll opened'));
      await sleep(2000);
      assert.equal(polls.events.filter((e) => e.kind === 'message').length, pollsBefore, 'no second poll opened');
      assert.deepEqual(errors.lines, [], 'the error path was not taken');

      // An unmapped reaction must not use up the cooldown: reset it, send an unmapped trigger and at once a mapped one.
      lastPollOpenedAt = 0;
      logs.lines.length = 0;
      const pollsBeforeUnmapped = polls.events.filter((e) => e.kind === 'message').length;
      await sender.publish({
        channel: 'game.poll-triggers',
        message: { reaction: '\u{1F4A4}' },
        customMessageType: 'poll-trigger',
      });
      const afterUnmapped = await sender.publish({
        channel: 'game.poll-triggers',
        message: { reaction: '\u{1F621}' },
        customMessageType: 'poll-trigger',
      });
      const openedAfterUnmapped = await polls.next(
        'message',
        (m) => BigInt(m.timetoken) > BigInt(afterUnmapped.timetoken) && (m.message as { title?: string }).title === 'Which team is playing dirtiest?',
      );
      assert.equal(openedAfterUnmapped.publisher, 'poll-service');
      assert.ok(logs.lines.includes('open a poll because fans keep tapping \u{1F4A4}'));
      assert.ok(logs.lines.includes('no poll is defined for \u{1F4A4}'));
      assert.ok(
        !logs.lines.includes('that trigger arrived inside the cooldown window, so no new poll opened'),
        'the unmapped trigger did not consume the cooldown',
      );
      await sleep(1000);
      assert.equal(
        polls.events.filter((e) => e.kind === 'message').length,
        pollsBeforeUnmapped + 1,
        'exactly one poll opened, for the mapped reaction',
      );
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
    } finally {
      polls.stop();
      logs.restore();
      errors.restore();
    }
  });
});
