/* eslint-disable prettier/prettier, max-len -- sample text must stay character for character, so its long lines cannot be re-wrapped */
import assert from 'node:assert/strict';
import { createClient, observer } from '../support/clients';
import { captureConsole } from '../support/console';
import { settled, sleep, watch } from '../support/wait';

/**
 * Live event rate limiting. Port of docs-snippets/use-cases/live-event-rate-limiting.ts.
 * Needs Presence on the open keyset (the shard occupancy comes from Here Now).
 */
describe('use-cases/live-event-rate-limiting', () => {
  it('rateLimitingReadShardOccupancy, rateLimitingPickShardForFan, rateLimitingThrottleFanPublishes: occupancy per shard is read, a fan is placed in a shard with room and its publishes are throttled on the client', async function () {
    this.timeout(90_000);
    const pubnub = createClient('open', 'fan-42');
    const logs = captureConsole('log');
    const errors = captureConsole('error');
    // Another fan sits in shard 0, so the shard has a known occupant. The hereNow of the open keyset is eventually consistent.
    const occupant = await watch(observer(), ['game.chat.shard-0']);
    try {
      // The sample reads the three shards once and the assertion needs shard 0 to hold the occupant, so wait until the same
      // read, from another client, shows it on consecutive polls.
      await settled(
        async () => {
          const here = await observer().hereNow({ channels: ['game.chat.shard-0'], includeUUIDs: true });
          assert.ok(here.channels['game.chat.shard-0']?.occupants.some((o) => o.uuid === 'observer'), 'observer is listed');
          const counted = await observer().hereNow({
            channels: ['game.chat.shard-0', 'game.chat.shard-1', 'game.chat.shard-2'],
            includeUUIDs: false,
          });
          assert.ok((counted.channels['game.chat.shard-0']?.occupancy ?? 0) >= 1, 'shard 0 counts the occupant');
        },
        { timeout: 30_000, label: 'occupant visible in hereNow' },
      );

      // snippet.rateLimitingReadShardOccupancy
      try {
        const response = await pubnub.hereNow({
          channels: ['game.chat.shard-0', 'game.chat.shard-1', 'game.chat.shard-2'],
          includeUUIDs: false,
        });

        Object.entries(response.channels).forEach(([channel, data]) => {
          console.log(`${channel} holds ${data.occupancy} fans`);
        });
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Reading the shard occupancy failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end

      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      // Other tests may have fans in the shards, so only the known occupant is asserted: shard 0 holds at least one fan.
      const shard0 = logs.lines.find((line) => line.startsWith('game.chat.shard-0 holds '));
      assert.ok(shard0, `a line for shard 0 in ${JSON.stringify(logs.lines)}`);
      assert.match(shard0, /^game\.chat\.shard-0 holds [1-9]\d* fans$/);
      logs.lines.length = 0;

      // snippet.rateLimitingPickShardForFan
      async function pickShardForFan(shardCount = 0, maxFansPerShard = 0) {
        const channels = Array.from({ length: shardCount }, (_, index) => `game.chat.shard-${index}`);

        const response = await pubnub.hereNow({ channels, includeUUIDs: false });

        const openShard = channels.find((channel) => (response.channels[channel]?.occupancy ?? 0) < maxFansPerShard);

        if (!openShard) {
          throw new Error('every shard is full, so add more shards before the next match');
        }

        return openShard;
      }

      const shard = await pickShardForFan(10, 1000);

      console.log('this fan joins', shard);
      // snippet.end

      // The first shard below the limit is shard 0: it holds one or a few fans, far below 1000.
      assert.equal(shard, 'game.chat.shard-0');
      assert.deepEqual(logs.lines, ['this fan joins game.chat.shard-0']);
      // A limit of 1 makes shard 0 (which holds the occupant) full, so the next shard with room is picked.
      assert.notEqual(await pickShardForFan(3, 1), 'game.chat.shard-0');
      await assert.rejects(pickShardForFan(1, 1), /every shard is full/);
      const watching = await watch(observer(), [shard]);
      logs.lines.length = 0;

      // snippet.rateLimitingThrottleFanPublishes
      const minimumMillisecondsBetweenMessages = 2000;
      let lastPublishedAt = 0;

      async function sendChatMessage(text = '') {
        const now = Date.now();

        if (now - lastPublishedAt < minimumMillisecondsBetweenMessages) {
          console.log('too soon, so this message is dropped before it reaches the network');
          return;
        }

        lastPublishedAt = now;

        await pubnub.publish({
          channel: shard,
          message: { text },
          customMessageType: 'text-message',
        });
      }

      await sendChatMessage('Offside, surely?');
      // snippet.end

      // The sample does not keep the publish response, so match the message by publisher and text.
      const first = await watching.next(
        'message',
        (m) => (m.message as { text?: string }).text === 'Offside, surely?' && m.publisher === 'fan-42',
      );
      assert.equal(first.channel, shard);
      assert.equal(first.customMessageType, 'text-message');
      assert.deepEqual(logs.lines, [], 'the first message is not throttled');

      // A second message inside the 2 s window is dropped before the network; a fixed wait proves it never arrives.
      const tooSoonText = `too soon ${Date.now()}`;
      await sendChatMessage(tooSoonText);
      assert.deepEqual(logs.lines, ['too soon, so this message is dropped before it reaches the network']);
      await sleep(1500);
      assert.ok(
        !watching.events.some((e) => (e.event as { message?: { text?: string } }).message?.text === tooSoonText),
        'the throttled message never reached the channel',
      );

      // After the window has passed, the next message goes out.
      await sleep(2100 - 1500);
      const laterText = `later ${Date.now()}`;
      await sendChatMessage(laterText);
      await watching.next('message', (m) => (m.message as { text?: string }).text === laterText);
      assert.equal(logs.lines.length, 1, 'no further throttle log');
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      watching.stop();
    } finally {
      occupant.stop();
      logs.restore();
      errors.restore();
    }
  });
});
