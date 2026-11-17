import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import PubNub from 'pubnub';
import { assertTimetoken } from '../support/assertions';
import { createClient, observer, track } from '../support/clients';
import { captureConsole } from '../support/console';
import { keysOf } from '../support/env';
import { storedMessage } from '../support/history';
import { connected, eventually, watch } from '../support/wait';

/**
 * Port of docs-snippets/use-cases/match-stats.ts (page use-cases/sports-media-entertainment/match-stats).
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
  before(clearHistory);
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
      // storeInHistory: the value is in Message Persistence under that very timetoken.
      await eventually(async () => {
        const stored = await storedMessage(observer(), 'game.match-stats.score', scoreTimetoken);
        assert.deepEqual(stored?.message, { value: '3-1' });
      });

      // A stat that changes while nobody listens: the feed publishes it, a scoreboard starting later reads it back.
      const feed = createClient('open', 'match-service');
      const possession = { value: `54%-${randomUUID()}` };
      const possessionTimetoken = (
        await feed.publish({ channel: channelOf('possession'), message: possession, storeInHistory: true })
      ).timetoken;
      await eventually(async () => {
        const stored = await storedMessage(observer(), channelOf('possession'), possessionTimetoken);
        assert.deepEqual(stored?.message, possession);
      });

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
      // Message Persistence is eventually consistent, so the sample runs again until the stored values show up.
      await eventually(
        async () => {
          log.lines.length = 0;
          await fetchCurrentValues(lateScoreboard);
          assert.deepEqual(errors.lines, [], 'the fetch did not take the error path');
          assert.ok(log.lines.includes('score is currently {"value":"3-1"}'), `logged: ${log.lines.join(' | ')}`);
          assert.ok(
            log.lines.includes(`possession is currently ${JSON.stringify(possession)}`),
            `logged: ${log.lines.join(' | ')}`,
          );
        },
        { label: 'current value of every stat', timeout: 30_000 },
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
