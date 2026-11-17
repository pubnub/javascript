import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import PubNub from 'pubnub';
import { assertTimetoken } from '../support/assertions';
import { createClient, observer, track } from '../support/clients';
import { captureConsole } from '../support/console';
import { keysOf } from '../support/env';
import { connected, eventually, sleep, watch } from '../support/wait';

/**
 * Port of docs-snippets/use-cases/live-polls.ts (page use-cases/sports-media-entertainment/live-polls).
 * One flow over three channels: open a poll, a late fan fetches it, the fan votes, the service publishes the tally and the
 * fan receives it. Needs Message Persistence on the open keyset.
 */
describe('use-cases/live-polls', () => {
  const CHANNELS = ['game.new-poll', 'game.poll-votes', 'game.poll-results'];
  // The three channels are shared literals: clear their history so the late-joiner fetch reads this run's poll.
  const clearHistory = async (): Promise<void> => {
    const cleaner = createClient('open', 'live-polls-cleaner');
    for (const channel of CHANNELS) {
      try {
        await cleaner.deleteMessages({ channel });
      } catch {
        // Best effort.
      }
    }
  };
  before(clearHistory);
  after(clearHistory);

  it('livePollsPublishPoll, livePollsSubscribeToPolls, livePollsFetchOpenPoll, livePollsPublishVote, livePollsSubscribeToResults, livePollsPublishResults: a poll opens, a late fan fetches it, votes, and both see the tally', async function () {
    this.timeout(90_000);
    const { publishKey, subscribeKey } = keysOf('open');
    const log = captureConsole('log');
    const errors = captureConsole('error');
    try {
      // The poll service (open-poll.js) and the fan (vote.js) are two clients, as on the page.
      const service = track(new PubNub({ publishKey, subscribeKey, userId: 'match-service' }));
      const fan = track(new PubNub({ publishKey, subscribeKey, userId: 'fan-42' }));
      // An independent client records every message on the three channels.
      const seen = await watch(observer(), CHANNELS);
      const timetokenOf = (prefix: string): string => {
        const line = log.lines.find((l) => l.startsWith(prefix));
        assert.ok(
          line,
          `expected a log line "${prefix}". Logged: ${log.lines.join(' | ')}. Errors: ${errors.lines.join(' | ')}`,
        );
        const timetoken = line.slice(prefix.length);
        assertTimetoken(timetoken);
        return timetoken;
      };

      // 1. open-poll.js publishes the poll.
      {
        const pubnub = service;
        /* eslint-disable prettier/prettier */
        // snippet.livePollsPublishPoll
        const poll = {
          id: 'poll-1',
          title: 'Who will win the match?',
          durationSeconds: 60,
          options: [
            { id: 1, text: 'Home team' },
            { id: 2, text: 'Away team' },
            { id: 3, text: 'Draw' },
          ],
        };

        try {
          const response = await pubnub.publish({
            channel: 'game.new-poll',
            message: poll,
            customMessageType: 'poll-opened',
            storeInHistory: true,
          });
          console.log('poll published at timetoken:', response.timetoken);
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(`Publishing the poll failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
        }
        // snippet.end
        /* eslint-enable prettier/prettier */
        assert.deepEqual(errors.lines, [], 'the poll publish did not take the error path');
        assert.deepEqual(poll.options.length, 3);
      }
      const pollTimetoken = timetokenOf('poll published at timetoken: ');
      const openedEvent = await seen.next('message', (m) => m.timetoken === pollTimetoken);
      assert.equal(openedEvent.channel, 'game.new-poll');
      assert.equal(openedEvent.customMessageType, 'poll-opened');
      assert.equal(openedEvent.publisher, 'match-service');
      assert.equal((openedEvent.message as { id: string }).id, 'poll-1');

      // 2. vote.js starts after the publish: its live subscription must not deliver the earlier poll.
      {
        const pubnub = fan;
        const ready = connected(pubnub, { channels: ['game.new-poll'] });
        /* eslint-disable prettier/prettier */
        // snippet.livePollsSubscribeToPolls
        const pollChannel = pubnub.channel('game.new-poll');
        const pollSubscription = pollChannel.subscription({ receivePresenceEvents: false });

        pollSubscription.onMessage = (event) => {
          console.log('new poll:', event.message);
        };

        pollSubscription.subscribe();
        // snippet.end
        /* eslint-enable prettier/prettier */
        await ready;
        assert.deepEqual(pubnub.getSubscribedChannels(), ['game.new-poll']);
      }
      // Proves an absence: a subscription only delivers what is published after it connects.
      await sleep(2000);
      assert.deepEqual(
        log.lines.filter((line) => line.startsWith('new poll:')),
        [],
        'the poll published before the subscription is not delivered live',
      );

      // 3. ... so the fan fetches the stored poll instead. Message Persistence lags the publish, so the sample runs again until
      // it finds this run's poll.
      const fetchOpenPoll = async (): Promise<void> => {
        const pubnub = fan;
        /* eslint-disable prettier/prettier */
        // snippet.livePollsFetchOpenPoll
        try {
          const response = await pubnub.fetchMessages({
            channels: ['game.new-poll'],
            count: 1,
          });

          const entries = response.channels['game.new-poll'];

          if (entries && entries.length > 0) {
            console.log('poll that is already open:', entries[0].message);
          }
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(`Fetching the open poll failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
        }
        // snippet.end
        /* eslint-enable prettier/prettier */
      };
      await eventually(
        async () => {
          log.lines.length = 0;
          await fetchOpenPoll();
          assert.deepEqual(errors.lines, [], 'the fetch did not take the error path');
          assert.equal(log.lines.length, 1, `logged: ${log.lines.join(' | ')}`);
        },
        { label: 'the stored poll is fetched' },
      );
      // The service returns the keys in its own order, so compare the parsed object.
      assert.ok(log.lines[0].startsWith('poll that is already open: '));
      assert.deepEqual(JSON.parse(log.lines[0].slice('poll that is already open: '.length)), {
        id: 'poll-1',
        title: 'Who will win the match?',
        durationSeconds: 60,
        options: [
          { id: 1, text: 'Home team' },
          { id: 2, text: 'Away team' },
          { id: 3, text: 'Draw' },
        ],
      });
      // The fetched message is the one of this run (history of the channel was cleared first).
      const stored = await observer().fetchMessages({ channels: ['game.new-poll'], count: 1 });
      assert.equal(stored.channels['game.new-poll'][0].timetoken, pollTimetoken);

      // The subscription is live: a poll opened now arrives (a unique poll, published outside the samples).
      const liveId = `poll-live-${randomUUID()}`;
      await service.publish({ channel: 'game.new-poll', message: { id: liveId, title: 'Live', options: [] } });
      await eventually(() =>
        assert.ok(
          log.lines.some((l) => l.startsWith('new poll:') && l.includes(liveId)),
          log.lines.join(' | '),
        ),
      );

      // 4. the fan votes on game.poll-votes.
      log.lines.length = 0;
      {
        const pubnub = fan;
        /* eslint-disable prettier/prettier */
        // snippet.livePollsPublishVote
        try {
          const response = await pubnub.publish({
            channel: 'game.poll-votes',
            message: { pollId: 'poll-1', optionId: 2 },
            customMessageType: 'poll-vote',
          });
          console.log('vote published at timetoken:', response.timetoken);
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(`Publishing the vote failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
        }
        // snippet.end
        /* eslint-enable prettier/prettier */
      }
      assert.deepEqual(errors.lines, [], 'the vote publish did not take the error path');
      const voteTimetoken = timetokenOf('vote published at timetoken: ');
      const vote = await seen.next('message', (m) => m.timetoken === voteTimetoken);
      assert.equal(vote.channel, 'game.poll-votes');
      assert.equal(vote.customMessageType, 'poll-vote');
      assert.deepEqual(vote.message, { pollId: 'poll-1', optionId: 2 });
      // The vote names no voter; PubNub records the publisher.
      assert.equal(vote.publisher, 'fan-42');

      // 5. both sides subscribe to the results before the tally is published (the page says to do it before the timer fires).
      log.lines.length = 0;
      const fanReady = connected(fan, { channels: ['game.poll-results'] });
      {
        const pubnub = fan;
        /* eslint-disable prettier/prettier */
        // snippet.livePollsSubscribeToResults
        const resultsChannel = pubnub.channel('game.poll-results');
        const resultsSubscription = resultsChannel.subscription({ receivePresenceEvents: false });

        resultsSubscription.onMessage = (event) => {
          console.log('poll results:', event.message);
        };

        resultsSubscription.subscribe();
        // snippet.end
        /* eslint-enable prettier/prettier */
        assert.ok(resultsSubscription);
      }
      await fanReady;
      assert.ok(fan.getSubscribedChannels().includes('game.poll-results'));

      // 6. the service publishes the tally.
      {
        const pubnub = service;
        /* eslint-disable prettier/prettier */
        // snippet.livePollsPublishResults
        try {
          const response = await pubnub.publish({
            channel: 'game.poll-results',
            message: {
              pollId: 'poll-1',
              totals: { 1: 812, 2: 1043, 3: 219 },
              closed: true,
            },
            customMessageType: 'poll-results',
            storeInHistory: true,
          });
          console.log('results published at timetoken:', response.timetoken);
        } catch (error) {
          const status = error instanceof Error && 'status' in error ? error.status : undefined;
          console.error(`Publishing the results failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
        }
        // snippet.end
        /* eslint-enable prettier/prettier */
      }
      assert.deepEqual(errors.lines, [], 'the results publish did not take the error path');
      const resultsTimetoken = timetokenOf('results published at timetoken: ');
      const tally = await seen.next('message', (m) => m.timetoken === resultsTimetoken);
      assert.equal(tally.channel, 'game.poll-results');
      assert.equal(tally.customMessageType, 'poll-results');
      assert.equal(tally.publisher, 'match-service');
      assert.deepEqual(tally.message, { pollId: 'poll-1', totals: { 1: 812, 2: 1043, 3: 219 }, closed: true });
      // The fan's subscription received the same tally.
      await eventually(() =>
        assert.ok(
          log.lines.includes('poll results: {"pollId":"poll-1","totals":{"1":812,"2":1043,"3":219},"closed":true}'),
          log.lines.join(' | '),
        ),
      );
      // storeInHistory on the results: the tally is readable after the fact.
      await eventually(async () => {
        const history = await observer().fetchMessages({ channels: ['game.poll-results'], count: 1 });
        assert.equal(history.channels['game.poll-results']?.[0].timetoken, resultsTimetoken);
      });
    } finally {
      log.restore();
      errors.restore();
    }
  });
});
