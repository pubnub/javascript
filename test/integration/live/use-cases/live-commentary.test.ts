/* eslint-disable prettier/prettier, max-len -- sample text must stay character for character, so its long lines cannot be re-wrapped */
import assert from 'node:assert/strict';
import { assertTimetoken } from '../support/assertions';
import { createClient, observer } from '../support/clients';
import { captureConsole } from '../support/console';
import { storedMessage } from '../support/history';
import { connected, eventually, settled, sleep } from '../support/wait';

/**
 * Live commentary tutorial. Port of docs-snippets/use-cases/live-commentary.ts.
 * Needs Message Persistence on the open keyset (the backlog step reads stored remarks).
 */
describe('use-cases/live-commentary', () => {
  it('liveCommentaryPublishRemark, liveCommentarySubscribe, liveCommentaryLoadBacklog, liveCommentaryUnsubscribe: a remark is stored, a viewer receives the next one live, catches up from the backlog and stops listening', async function () {
    this.timeout(60_000);
    const pubnub = createClient('open', 'fan-42');
    const logs = captureConsole('log');
    const errors = captureConsole('error');
    const sigintBefore = process.listeners('SIGINT');
    const realExit = process.exit;
    const exitCodes: unknown[] = [];
    try {
      // snippet.liveCommentaryPublishRemark
      try {
        const response = await pubnub.publish({
          channel: 'game.commentary',
          message: {
            text: 'Long ball over the top, and the striker is clean through.',
            clock: '48:07',
          },
          customMessageType: 'commentary',
          storeInHistory: true,
        });
        console.log('commentary published at timetoken:', response.timetoken);
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Publishing the commentary failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end

      const published = logs.lines.find((line) => line.startsWith('commentary published at timetoken: '));
      assert.ok(published, 'the sample reported the publish');
      const firstTimetoken = published.slice('commentary published at timetoken: '.length);
      assertTimetoken(firstTimetoken);
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
      const stored = await eventually(
        async () => {
          const entry = await storedMessage(observer(), 'game.commentary', firstTimetoken);
          assert.ok(entry, 'remark is stored');
          return entry;
        },
        { label: 'commentary stored' },
      );
      assert.deepEqual(stored.message, {
        text: 'Long ball over the top, and the striker is clean through.',
        clock: '48:07',
      });

      const ready = connected(pubnub, { channels: ['game.commentary'] });
      // snippet.liveCommentarySubscribe
      const commentaryChannel = pubnub.channel('game.commentary');
      const commentarySubscription = commentaryChannel.subscription({ receivePresenceEvents: false });

      commentarySubscription.onMessage = (event) => {
        console.log(`[${event.timetoken}] ${JSON.stringify(event.message)}`);
      };

      pubnub.addListener({
        status: (event) => {
          if (event.category === 'PNConnectedCategory') {
            console.log('connected and ready to receive commentary');
          }
        },
      });

      commentarySubscription.subscribe();
      // snippet.end

      await ready;
      assert.ok(logs.lines.includes('connected and ready to receive commentary'), 'connected message printed');
      // A second remark from another client (the commentator), with a text unique to this run.
      const liveText = `Corner kick, run ${Date.now()}`;
      const live = await createClient('open', 'commentator').publish({
        channel: 'game.commentary',
        message: { text: liveText, clock: '49:30' },
        customMessageType: 'commentary',
      });
      await eventually(
        () => {
          assert.ok(
            logs.lines.includes(`[${live.timetoken}] ${JSON.stringify({ text: liveText, clock: '49:30' })}`),
            'the viewer printed the live remark',
          );
        },
        { label: 'live remark printed' },
      );
      assert.ok(
        !logs.lines.some((line) => line.startsWith(`[${firstTimetoken}]`)),
        'the remark published before the subscription is not replayed live',
      );

      // The sample loads the newest 25 once and the assertions need both remarks, so wait until the same read, from another client,
      // lists both on consecutive polls.
      await settled(
        async () => {
          const backlog = await observer().fetchMessages({ channels: ['game.commentary'], count: 25 });
          const tokens = (backlog.channels['game.commentary'] ?? []).map((m) => String(m.timetoken));
          assert.ok(tokens.includes(firstTimetoken), 'first remark is in the backlog');
          assert.ok(tokens.includes(live.timetoken), 'live remark is in the backlog');
        },
        { label: 'both remarks in the newest 25' },
      );
      const beforeBacklog = logs.lines.length;
      // snippet.liveCommentaryLoadBacklog
      try {
        const response = await pubnub.fetchMessages({
          channels: ['game.commentary'],
          count: 25,
        });

        const entries = response.channels['game.commentary'] ?? [];

        entries.forEach((entry) => {
          console.log(entry.timetoken, entry.message);
        });
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        console.error(`Loading the commentary backlog failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      }
      // snippet.end

      const backlog = logs.lines.slice(beforeBacklog);
      assert.ok(
        backlog.some((line) => line.startsWith(`${firstTimetoken} {`) && line.includes('"clock":"48:07"')),
        'the backlog has the first remark',
      );
      assert.ok(
        backlog.some((line) => line.startsWith(`${live.timetoken} {`) && line.includes(liveText)),
        'the backlog has the second remark',
      );
      assert.deepEqual(errors.lines, [], 'the error path was not taken');

      // snippet.liveCommentaryUnsubscribe
      process.on('SIGINT', () => {
        console.log('viewer shutting down, closing the commentary subscription');
        commentarySubscription.unsubscribe();
        process.exit(0);
      });
      // snippet.end

      const handlers = process.listeners('SIGINT').filter((listener) => !sigintBefore.includes(listener));
      assert.equal(handlers.length, 1, 'the sample registered one SIGINT handler');
      // Run the handler as Ctrl+C would, without letting it stop the test process.
      process.exit = ((code?: number) => {
        exitCodes.push(code);
      }) as typeof process.exit;
      handlers[0]('SIGINT');
      process.exit = realExit;
      assert.ok(logs.lines.includes('viewer shutting down, closing the commentary subscription'));
      assert.deepEqual(exitCodes, [0]);
      // The subscription is closed: a remark published now is not printed. Proving absence needs a wait.
      const afterText = `After the whistle ${Date.now()}`;
      await createClient('open', 'commentator').publish({
        channel: 'game.commentary',
        message: { text: afterText, clock: '90:00' },
        customMessageType: 'commentary',
      });
      await sleep(2500);
      assert.ok(!logs.lines.some((line) => line.includes(afterText)), 'nothing is printed after unsubscribe');
      assert.deepEqual(errors.lines, [], 'the error path was not taken');
    } finally {
      process.exit = realExit;
      process.listeners('SIGINT').forEach((listener) => {
        if (!sigintBefore.includes(listener)) process.removeListener('SIGINT', listener);
      });
      logs.restore();
      errors.restore();
    }
  });
});
