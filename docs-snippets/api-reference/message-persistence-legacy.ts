import type PubNub from 'pubnub';
import assert from '../harness/assert.js';
import { page, step, check } from '../harness/step.js';
import { eventually, sleep } from '../harness/wait.js';
import { recorder } from '../harness/recorder.js';
import { addToTimetoken } from '../harness/assertions.js';

/**
 * Examples for the deprecated `history()` method and the deprecated `data` property of `actions` on `fetchMessages()`.
 */
export default page('api-reference/message-persistence-legacy', 'P8', (world) => {
  // Publishes `count` messages as the friend, optionally with `meta`, and returns their timetokens, oldest first.
  const seed = async (channel: string, count: number, extra: { meta?: Record<string, string> } = {}): Promise<string[]> => {
    const tokens: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const { timetoken } = await world.friend.publish({ channel, message: { legacy: 'history', n: i }, ...extra });
      tokens.push(timetoken);
    }
    return tokens;
  };

  // Fine for up to 100 messages. For larger sets use untilAllStored below.
  const untilStored = (channel: string, tokens: string[]): Promise<void> =>
    eventually(async () => {
      const history = await world.observer.fetchMessages({ channels: [channel], count: 100 });
      const have = new Set((history.channels[channel] ?? []).map((m) => String(m.timetoken)));
      for (const token of tokens) assert.ok(have.has(token), `${token} is not stored yet`);
    }, { timeout: 30_000, label: `messages stored on ${channel}` });

  /**
   * Waits until every one of `tokens` is stored, however many there are. `untilStored` reads one page of at most 100
   * messages (the cap of `fetchMessages`), so with more than 100 seeded messages it can only vouch for the newest
   * 100. This one walks the channel page by page from the newest message to the oldest, always asking for the page
   * that ends before the oldest message of the previous page, and checks the whole set of tokens at the end.
   * Storage is eventually consistent, so the walk repeats until nothing is missing or the timeout passes.
   */
  const untilAllStored = (channel: string, tokens: string[]): Promise<void> =>
    eventually(async () => {
      const have = new Set<string>();
      let before: string | undefined;
      for (;;) {
        const page = await world.observer.fetchMessages({ channels: [channel], count: 100, ...(before ? { start: before } : {}) });
        const items = page.channels[channel] ?? [];
        for (const item of items) have.add(String(item.timetoken));
        // A page shorter than the cap is the last one. Messages come oldest first, so items[0] is the oldest of the page.
        if (items.length < 100) break;
        before = String(items[0].timetoken);
      }
      const missing = tokens.filter((token) => !have.has(token));
      assert.equal(missing.length, 0, `${missing.length} of ${tokens.length} seeded messages are not stored yet (first missing: ${missing[0]})`);
    }, { timeout: 45_000, label: `all ${tokens.length} messages stored on ${channel}` });

  /** Every stored message of a channel, oldest first, through the non-deprecated reader. */
  // Reference reader for expected values: the non-deprecated fetchMessages, so history() is compared against an independent source.
  const stored = async (channel: string): Promise<string[]> => {
    const history = await world.observer.fetchMessages({ channels: [channel], count: 100 });
    return (history.channels[channel] ?? []).map((m) => String(m.timetoken));
  };

  // Normalizes timetokens to strings, history() returns numbers unless stringifiedTimeToken is set.
  const tokensOf = (result: { messages: Array<{ timetoken: string | number }> }): string[] => result.messages.map((m) => String(m.timetoken));

  // history() always returns oldest first, whatever `reverse` is.
  const isAscending = (tokens: string[]): boolean => tokens.every((t, i) => i === 0 || BigInt(tokens[i - 1]) < BigInt(t));

  step('historyBasicUsage', { needs: ['preflightPersistence'], proves: 'history returns the three seeded messages oldest first with the start and end timetokens.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('history_channel');
    const tokens = await seed(channel, 3);
    await untilStored(channel, tokens);

    // snippet.historyBasicUsage
    try {
        const result = await pubnub.history({
            channel: "history_channel",
            count: 100, // how many items to fetch
            stringifiedTimeToken: true, // false is the default
        });
        // snippet.hide
        world.keep('result', result);
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    const result = world.take<PubNub.History.GetHistoryResponse>('result');

    assert.deepEqual(tokensOf(result), tokens, 'the three seeded messages, oldest first');
    assert.deepEqual((result.messages[0].entry as { n: number }).n, 0);
    assert.equal(result.startTimeToken, tokens[0]);
    assert.equal(result.endTimeToken, tokens[2]);
  });

  step('historyOldestThree', { needs: ['preflightPersistence'], proves: 'history with reverse true and count 3 returns the three oldest messages.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('my_channel');
    const tokens = await seed(channel, 3);
    await untilStored(channel, tokens);
    const expected = (await stored(channel)).slice(0, 3);
    assert.equal(expected.length, 3);

    // snippet.historyOldestThree
    try {
        const result = await pubnub.history({
            channel: "my_channel",
            reverse: true, // Setting to true will traverse the time line in reverse starting with the oldest message first.
            count: 3, // how many items to fetch
            stringifiedTimeToken: true, // false is the default
        });
        // snippet.hide
        world.keep('result', result);
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    const result = world.take<PubNub.History.GetHistoryResponse>('result');

    assert.deepEqual(tokensOf(result), expected, 'the three oldest messages of the channel');
  });

  step('historyNewerThanTimetoken', { needs: ['preflightPersistence'], proves: 'history with reverse and start returns only messages newer than the anchor, and start is exclusive.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('my_channel');
    const [, middle, newest] = await seed(channel, 3);
    await untilStored(channel, [newest]);
    world.setPh('historyAnchor', middle);

    // snippet.historyNewerThanTimetoken
    try {
        const result = await pubnub.history({
            channel: "my_channel",
            reverse: true, // Setting to true will traverse the time line in reverse starting with the oldest message first.
            stringifiedTimeToken: true, // false is the default
            start: "13406746780720711", // start timetoken to fetch
        });
        // snippet.hide
        world.keep('result', result);
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    const result = world.take<PubNub.History.GetHistoryResponse>('result');

    const tokens = tokensOf(result);
    assert.equal(tokens[0], newest, 'start is exclusive: the first message is the one after the anchor');
    assert.ok(!tokens.includes(middle), 'the anchor itself is not returned');
    assert.ok(tokens.every((t) => BigInt(t) > BigInt(middle)));
    assert.ok(isAscending(tokens));
  });

  step('historyUntilTimetoken', { needs: ['preflightPersistence'], proves: 'history with only end returns messages down to the anchor, and end is inclusive.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('my_channel');
    const [oldest, middle, newest] = await seed(channel, 3);
    await untilStored(channel, [newest]);
    world.setPh('historyAnchor', middle);

    // snippet.historyUntilTimetoken
    try {
        const result = await pubnub.history({
            channel: "my_channel",
            stringifiedTimeToken: true, // false is the default
            end: "13406746780720711", // end timetoken to fetch
        });
        // snippet.hide
        world.keep('result', result);
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    const result = world.take<PubNub.History.GetHistoryResponse>('result');

    const tokens = tokensOf(result);
    assert.equal(tokens[0], middle, 'end is inclusive: the anchor is the oldest returned message');
    assert.ok(tokens.includes(newest));
    assert.ok(!tokens.includes(oldest), 'older than the anchor is not returned');
    assert.ok(isAscending(tokens));
  });

  step('historyPagingExample', { needs: ['preflightPersistence'], timeout: 120_000, proves: 'The paging helper of the page collects all 120 messages across two pages.' }, async () => {
    const pubnub = world.fresh('history-paging');
    const originalHistory = pubnub.history.bind(pubnub) as (...args: unknown[]) => Promise<unknown>;
    (pubnub as unknown as { history: unknown }).history = async (...args: unknown[]): Promise<unknown> => {
      const attempts = 3;
      for (let attempt = 1; ; attempt += 1) {
        try {
          return await originalHistory(...args);
        } catch (error) {
          const category = (error as { status?: { category?: string } }).status?.category;
          if (category !== 'PNNetworkIssuesCategory') throw error;
          if (attempt >= attempts) {
            (error as Error).message = `${(error as Error).message} (history failed ${attempts} times with a network error)`;
            throw error;
          }
          recorder.record({ kind: 'retry', label: `history retried after a network error (attempt ${attempt} of ${attempts})`, ok: true });
          await sleep(1_000 * attempt);
        }
      }
    };
    const channel = world.n('history_test');
    // More than one page of 100 messages, so the loop has to page.
    const tokens: string[] = [];
    for (let batch = 0; batch < 6; batch += 1) {
      const sent = await Promise.all(
        Array.from({ length: 20 }, (_, i) => world.friend.publish({ channel, message: { legacy: 'paging', n: batch * 20 + i } })),
      );
      tokens.push(...sent.map((s) => s.timetoken));
    }
    // Wait for all 120 seeded messages, not only the newest 100. The oldest 20 sit on the second page.
    await untilAllStored(channel, tokens);
    await eventually(async () => {
      const probe = await world.observer.fetchMessages({ channels: [channel], count: 100 });
      assert.equal(probe.channels[channel]?.length, 100);
    }, { timeout: 30_000, label: 'first page is full' });

    // snippet.historyPagingExample
    async function getAllMessages(initialTimetoken = '') {
      const allMessages = [];
      let latestCount = 100;
      let timetoken = initialTimetoken;

      while (latestCount === 100) {
        const { messages, startTimeToken, endTimeToken } = await pubnub.history(
          {
            channel: 'history_test',
            stringifiedTimeToken: true, // false is the default
            start: timetoken, // start timetoken to fetch
          }
        );

        latestCount = messages.length;
        timetoken = String(startTimeToken);

        if (messages && messages.length > 0) {
          allMessages.push(...messages);
        }
      }

      return allMessages;
    }

    // Usage examples:
    // await getAllMessages();
    // await getAllMessages("12345678901234");
    // snippet.end

    // History is eventually consistent, so wait until the oldest messages are stored too.
    const all = await eventually(async () => {
      const found = await getAllMessages();
      assert.equal(found.length, 120, 'paging returns every message');
      return found;
    }, { timeout: 45_000, label: 'paging collects all seeded messages' });
    assert.deepEqual(new Set(all.map((m) => m.timetoken)), new Set(tokens), 'each seeded message exactly once');
    // A valid timetoken starts the walk there: nothing newer than it is returned.
    const sortedTokens = [...tokens].sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1));
    const fromMiddle = await getAllMessages(sortedTokens[59]);
    assert.equal(fromMiddle.length, 59, 'start is exclusive, so only the 59 messages before the 60th are returned');
  });

  step('historyIncludeMeta', { needs: ['preflightPersistence'], proves: 'includeMeta returns meta for a message published with metadata and omits it for others.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('my_channel');
    const [withMeta] = await seed(channel, 1, { meta: { legacy: 'meta' } });
    await untilStored(channel, [withMeta]);

    // snippet.historyIncludeMeta
    try {
        const result = await pubnub.history({
            channel: "my_channel",
            stringifiedTimeToken: true,
            includeMeta: true,
        });
        // snippet.hide
        world.keep('result', result);
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    const result = world.take<PubNub.History.GetHistoryResponse>('result');

    const found = result.messages.find((m) => m.timetoken === withMeta);
    assert.ok(found, 'the seeded message is returned');
    assert.deepEqual(found.meta, { legacy: 'meta' });
    // The meta property is present only when the publisher set metadata.
    assert.ok(result.messages.some((m) => m.meta === undefined), 'messages without metadata have no meta property');
  });

  step('historyWithPromises', { needs: ['preflightPersistence'], proves: 'The promise form of history logs the response with the expected messages.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('history_channel');
    const tokens = await seed(channel, 3);
    await untilStored(channel, tokens);
    // The docs literals are 1970 timetokens. The live values are the newest boundary (start) and the oldest one (end).
    world.setPh('historyPromiseStart', addToTimetoken(tokens[2], 1));
    world.setPh('historyPromiseEnd', tokens[0]);

    await world.withConsole(async (logs) => {
      // snippet.historyWithPromises
      pubnub.history({
        channel: 'history_channel',
        reverse: true, // Setting to true will traverse the time line in reverse starting with the oldest message first.
        count: 100, // how many items to fetch
        stringifiedTimeToken: true, // false is the default
        start: '123123123133', // start timetoken to fetch
        end: '123123123123', // end timetoken to fetch
      }).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error);
      });
      // snippet.end

      await eventually(() => {
        assert.ok(logs.lines.some((line) => line.includes('"messages"')), `the response was logged. Logged: ${logs.lines.join(' | ').slice(0, 300)}`);
      }, { label: 'promise resolved and logged' });
      const response = JSON.parse(logs.lines.find((line) => line.includes('"messages"'))!);
      assert.deepEqual(response.messages.map((m: { timetoken: string }) => String(m.timetoken)), tokens);
    });
  });


  check('historyDocumentedBehavior', { needs: ['historyPagingExample'], timeout: 60_000, proves: 'The prose claims of the history page hold: the cap of 100, ordering, returned fields and timetoken types.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('history_test');
    const probe = (parameters: Partial<Parameters<typeof pubnub.history>[0]>) =>
      pubnub.history({ channel, stringifiedTimeToken: true, ...parameters });

    // "The maximum is 100, and history() lowers a larger value to 100."
    assert.equal((await probe({ count: 150 })).messages.length, 100);

    // "history() always returns the messages sorted from the oldest to the newest, whatever reverse is."
    const newestFive = await probe({ count: 5 });
    const oldestFive = await probe({ count: 5, reverse: true });
    for (const result of [newestFive, oldestFive]) assert.ok(isAscending(tokensOf(result)));
    // reverse decides which end of the interval the retrieval starts from.
    assert.ok(BigInt(oldestFive.messages[4].timetoken) < BigInt(newestFive.messages[0].timetoken), 'reverse starts from the oldest end');

    // Returns: startTimeToken and endTimeToken hold the timetokens of the first and last returned message, as strings.
    assert.equal(newestFive.startTimeToken, newestFive.messages[0].timetoken);
    assert.equal(newestFive.endTimeToken, newestFive.messages[4].timetoken);
    assert.equal(typeof newestFive.startTimeToken, 'string');
    for (const message of newestFive.messages) {
      assert.deepEqual(Object.keys(message).sort(), ['entry', 'timetoken'], 'an item has entry and timetoken, and meta only when set');
    }

    // Without stringifiedTimeToken the timetokens are numbers.
    const plain = await pubnub.history({ channel, count: 1 });
    assert.equal(typeof plain.messages[0].timetoken, 'number');

    // "With start, start must be a higher timetoken than end." The docs promises sample passes start below end. Record what the service does with that order.
    const older = String(oldestFive.messages[0].timetoken);
    const newer = String(newestFive.messages[4].timetoken);
    const inverted = await probe({ count: 100, start: older, end: newer });
    const ordered = await probe({ count: 100, start: newer, end: older });
    console.log(`history with start below end returned ${inverted.messages.length} messages, with start above end ${ordered.messages.length}`);
    assert.ok(ordered.messages.length > 0, 'start above end returns the messages in between');
  });

  check('historyActionsDataDeprecated', { needs: ['preflightPersistence'], proves: 'The deprecated data property of actions equals actions, and both are absent without includeMessageActions.' }, async () => {
    const pubnub = world.shopper;
    const channel = world.n('persist_channel');
    const [token] = await seed(channel, 1);
    await world.friend.addMessageAction({ channel, messageTimetoken: token, action: { type: 'reaction', value: 'smiley_face' } });
    type WithActions = { timetoken: string | number; actions?: Record<string, Record<string, unknown[]>>; data?: unknown };
    const found = await eventually(async () => {
      const response = await pubnub.fetchMessages({ channels: [channel], includeMessageActions: true });
      const item = response.channels[channel]?.find((m) => String(m.timetoken) === token) as WithActions | undefined;
      assert.ok(item?.actions, 'the message has actions');
      return item;
    }, { timeout: 30_000, label: 'message with action stored' });
    assert.deepEqual(found.data, found.actions, 'the deprecated data property holds the same value as actions');
    assert.ok(found.actions?.reaction?.smiley_face, 'grouped by action type, then by action value');

    // "The response has them only with includeMessageActions and when the message has actions."
    const without = await pubnub.fetchMessages({ channels: [channel] });
    const plain = without.channels[channel]?.find((m) => String(m.timetoken) === token) as WithActions | undefined;
    assert.equal(plain?.actions, undefined);
    assert.equal(plain?.data, undefined);
  });
});
