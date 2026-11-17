import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import PubNub from 'pubnub';
import { assertTimetoken } from '../support/assertions';
import { createClient, observer, track } from '../support/clients';
import { captureConsole } from '../support/console';
import { keysOf } from '../support/env';
import { storedMessage } from '../support/history';
import { connected, eventually, settled, watch } from '../support/wait';

/**
 *
 * One flow: a scoreboard subscribes to the wildcard, a feed publishes one stat, a late scoreboard fills in current values.
 * Needs wildcard subscribe (Stream Controller) and Message Persistence on the open keyset.
 */
describe('use-cases/match-stats', () => {
  const STATS = ['score', 'possession', 'shots', 'cards'];
  const channelOf = (stat: string): string => `game.match-stats.${stat}`;
  // The sample channels are shared literals: clear their history so "currently" can be asserted exactly for this run.
  const clearHistory = async (): Promise<void> => {
    const cleaner = createClient('open', 'match-stats-cleaner');
    for (const stat of STATS) {
      try {
        await cleaner.deleteMessages({ channel: channelOf(stat) });
      } catch {
        // Best effort.
      }
    }
  };
  before(async function () {
    this.timeout(60_000);
    await clearHistory();
    // The sample prints nothing for a stat without a stored value, and the test asserts that for shots and cards. A read that
    // still showed an old message after the delete would break that, so wait until their history reads empty on consecutive polls.
    await settled(
      async () => {
        const left = await observer().fetchMessages({ channels: ['shots', 'cards'].map(channelOf), count: 1 });
        assert.deepEqual(
          ['shots', 'cards'].map((stat) => left.channels[channelOf(stat)]?.length ?? 0),
          [0, 0],
          'shots and cards have no stored value',
        );
      },
      { timeout: 30_000, label: 'shots and cards history cleared' },
    );
  });
  after(clearHistory);

  it('matchStatsPublishOneStat, matchStatsSubscribeToAllStats, matchStatsFetchCurrentValues: a published stat reaches the wildcard subscription and a late reader gets the current value of every stat', async function () {
    this.timeout(90_000);
    const { publishKey, subscribeKey } = keysOf('open');
    const log = captureConsole('log');
    const errors = captureConsole('error');
    try {
      // Hidden from readers: the page shows its own `new PubNub` with placeholder keys.
      const pubnub = track(new PubNub({ publishKey, subscribeKey, userId: 'fan-42' }));
      // An independent client that records everything on the stat channels, to prove delivery and the publish options.
      const seen = await watch(observer(), STATS.map(channelOf));

      // The scoreboard starts first (page: "Run it"), then the feed publishes.
      const ready = connected(pubnub, { channels: ['game.match-stats.*'] });
      /* eslint-disable prettier/prettier */
      // snippet.matchStatsSubscribeToAllStats
      const statsSubscription = pubnub.subscriptionSet({
        channels: ['game.match-stats.*'],
        subscriptionOptions: { receivePresenceEvents: false },
      });

      statsSubscription.onMessage = (event) => {
        const statName = event.channel.split('.').pop();
        console.log(`${statName} is now`, event.message);
      };

      statsSubscription.subscribe();
      // snippet.end
      /* eslint-enable prettier/prettier */
      await ready;
      assert.deepEqual(pubnub.getSubscribedChannels(), ['game.match-stats.*']);

      /* eslint-disable prettier/prettier */
      // snippet.matchStatsPublishOneStat
      try {
        const response = await pubnub.publish({
          channel: 'game.match-stats.score',
          message: { value: '3-1' },
          customMessageType: 'match-stat',
          storeInHistory: true,
        });
        console.log('score published at timetoken:', response.timetoken);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Publishing the stat failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end
      /* eslint-enable prettier/prettier */
      assert.deepEqual(errors.lines, [], 'the publish did not take the error path');
      const publishedLine = log.lines.find((line) => line.startsWith('score published at timetoken: '));
      assert.ok(publishedLine, `logged: ${log.lines.join(' | ')}`);
      const scoreTimetoken = publishedLine.split(': ')[1];
      assertTimetoken(scoreTimetoken);

      // The wildcard subscription delivered it, and the channel name supplied the stat name.
      await eventually(() => assert.ok(log.lines.includes('score is now {"value":"3-1"}'), log.lines.join(' | ')));
      const delivered = await seen.next('message', (m) => m.timetoken === scoreTimetoken);
      assert.equal(delivered.channel, 'game.match-stats.score');
      assert.equal(delivered.customMessageType, 'match-stat');
      assert.equal(delivered.publisher, 'fan-42');
      // storeInHistory: the value is in Message Persistence under that very timetoken (waited for together with the possession below).

      // A stat that changes while nobody listens: the feed publishes it, a scoreboard starting later reads it back.
      const feed = createClient('open', 'match-service');
      const possession = { value: `54%-${randomUUID()}` };
      const possessionTimetoken = (
        await feed.publish({ channel: channelOf('possession'), message: possession, storeInHistory: true })
      ).timetoken;
      // The scoreboard sample below reads the newest value of every stat once and the assertions are exact. So wait until the same
      // read, from another client, returns the score and the possession on consecutive polls (storeInHistory: they are in
      // Message Persistence under their timetokens).
      await settled(
        async () => {
          const current = await observer().fetchMessages({
            channels: ['score', 'possession', 'shots', 'cards'].map(channelOf),
            count: 1,
          });
          const score = current.channels[channelOf('score')]?.[0];
          assert.equal(score?.timetoken, scoreTimetoken, 'the score is the newest stored value');
          assert.deepEqual(score?.message, { value: '3-1' });
          const stat = current.channels[channelOf('possession')]?.[0];
          assert.equal(stat?.timetoken, possessionTimetoken, 'the possession is the newest stored value');
          assert.deepEqual(stat?.message, possession);
        },
        { label: 'current value of every stat stored', timeout: 30_000 },
      );

      // A late scoreboard: its own client, so the fetch does not rely on the live subscription above.
      const lateScoreboard = track(new PubNub({ publishKey, subscribeKey, userId: 'fan-43' }));
      const fetchCurrentValues = async (pubnub: PubNub): Promise<void> => {
        /* eslint-disable prettier/prettier */
        // snippet.matchStatsFetchCurrentValues
        const statNames = ['score', 'possession', 'shots', 'cards'];

        try {
          const response = await pubnub.fetchMessages({
            channels: statNames.map((statName) => `game.match-stats.${statName}`),
            count: 1,
          });

          statNames.forEach((statName) => {
            const entries = response.channels[`game.match-stats.${statName}`];

            if (entries && entries.length > 0) {
              console.log(`${statName} is currently`, entries[0].message);
            }
          });
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(`Fetching the current stats failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
        }
        // snippet.end
        /* eslint-enable prettier/prettier */
      };
      // The sample runs once. Message Persistence is eventually consistent, which is what the wait above is for.
      log.lines.length = 0;
      await fetchCurrentValues(lateScoreboard);
      assert.deepEqual(errors.lines, [], 'the fetch did not take the error path');
      assert.ok(log.lines.includes('score is currently {"value":"3-1"}'), `logged: ${log.lines.join(' | ')}`);
      assert.ok(
        log.lines.includes(`possession is currently ${JSON.stringify(possession)}`),
        `logged: ${log.lines.join(' | ')}`,
      );
      // shots and cards were never published in this run (history cleared first): nothing is printed for them.
      assert.ok(!log.lines.some((line) => line.startsWith('shots is currently')));
      assert.ok(!log.lines.some((line) => line.startsWith('cards is currently')));
    } finally {
      log.restore();
      errors.restore();
    }
  });
});
