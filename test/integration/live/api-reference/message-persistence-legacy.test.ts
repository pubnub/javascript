import assert from 'node:assert/strict';
import type PubNub from 'pubnub';
import { addToTimetoken } from '../support/assertions';
import { captureConsole } from '../support/console';
import { friend, observer, shopper } from '../support/clients';
import { withPlaceholders } from '../support/placeholders';
import { newSeedRun, seedPublish, settleSeeded, storedMessage, untilStored } from '../support/history';
import { retryTransient } from '../support/retry';
import { eventually, sleep } from '../support/wait';

/**
 * Examples for the deprecated `history()` method and the deprecated `data` property of `actions` on `fetchMessages()`.
 * Port of docs-snippets/api-reference/message-persistence-legacy.ts. Message Persistence and Delete-From-History must be on
 * for the open keyset.
 *
 * Channels are shared and persistent, and the samples read "the latest 100" of a channel. So every test reads its own
 * window: the messages it just published are the newest on the channel, and the placeholder literals of the samples
 * (`13406746780720711`, `123123123133`, `123123123123`) are replaced by this run's timetokens through `withPlaceholders`,
 * which keeps the sample text unchanged.
 *
 * The one test that clears a channel is historyPagingExample: the sample walks the WHOLE channel `history_test` and the text
 * leaves no way to bound that, so it deletes that channel's history at its start.
 * Residue: seeded messages on `history_channel`, `my_channel`, `persist_channel`, `history_documented_behavior` (105
 * messages, written once) and `history_test` (120 messages, cleared at the start of each run).
 */
describe('api-reference/message-persistence-legacy', () => {
  // Hands the result out of the sample's try block (set on a hidden line of the sample).
  let capturedResult: PubNub.History.GetHistoryResponse | undefined;
  beforeEach(() => {
    capturedResult = undefined;
  });

  // Publishes `count` messages as the friend, optionally with `meta`, and returns their timetokens, oldest first. Setup, so a
  // transient publish failure is repeated (seedPublish). A repeated publish may leave a stored copy under a timetoken this test
  // never saw, which the exact-order assertions below would trip over: settleSeeded removes such copies before the sample runs.
  const seed = async (
    channel: string,
    count: number,
    extra: { meta?: Record<string, string> } = {},
  ): Promise<string[]> => {
    const run = newSeedRun();
    const tokens: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const { timetoken } = await seedPublish(run, `seed ${channel} publish`, () =>
        friend().publish({ channel, message: { legacy: 'history', n: i, run: run.id }, ...extra }),
      );
      tokens.push(timetoken);
    }
    await settleSeeded(channel, tokens, run);
    return tokens;
  };

  /**
   * Waits until every one of `tokens` is stored, however many there are. `untilStored` reads one page of at most 100
   * messages, so with more it can only vouch for the newest 100. This one walks the channel page by page from the newest
   * message to the oldest and checks the whole set of tokens at the end. Storage is eventually consistent, so the walk
   * repeats until nothing is missing or the timeout passes.
   */
  const untilAllStored = (channel: string, tokens: string[]): Promise<void> =>
    eventually(
      async () => {
        const have = new Set<string>();
        let before: string | undefined;
        for (;;) {
          const page = await observer().fetchMessages({
            channels: [channel],
            count: 100,
            ...(before ? { start: before } : {}),
          });
          const items = page.channels[channel] ?? [];
          for (const item of items) have.add(String(item.timetoken));
          // A page shorter than the cap is the last one. Messages come oldest first, so items[0] is the oldest of the page.
          if (items.length < 100) break;
          before = String(items[0].timetoken);
        }
        const missing = tokens.filter((token) => !have.has(token));
        assert.equal(
          missing.length,
          0,
          `${missing.length} of ${tokens.length} seeded messages are not stored yet (first missing: ${missing[0]})`,
        );
      },
      { timeout: 45_000, label: `all ${tokens.length} messages stored on ${channel}` },
    );

  // Normalizes timetokens to strings, history() returns numbers unless stringifiedTimeToken is set.
  const tokensOf = (result: { messages: Array<{ timetoken: string | number }> }): string[] =>
    result.messages.map((m) => String(m.timetoken));

  // history() always returns oldest first, whatever `reverse` is.
  const isAscending = (tokens: string[]): boolean =>
    tokens.every((t, i) => i === 0 || BigInt(tokens[i - 1]) < BigInt(t));

  // history() with one retry loop for network hiccups, as the old harness did.
  const withRetry = (pubnub: PubNub): PubNub => {
    const originalHistory = pubnub.history.bind(pubnub) as (...args: unknown[]) => Promise<unknown>;
    (pubnub as unknown as { history: unknown }).history = async (...args: unknown[]): Promise<unknown> => {
      const attempts = 3;
      for (let attempt = 1; ; attempt += 1) {
        try {
          return await originalHistory(...args);
        } catch (error) {
          const category = (error as { status?: { category?: string } }).status?.category;
          if (category !== 'PNNetworkIssuesCategory' || attempt >= attempts) throw error;
          await sleep(1_000 * attempt);
        }
      }
    };
    return pubnub;
  };

  it('historyBasicUsage: history returns the three seeded messages as the newest, oldest first, with the start and end timetokens', async () => {
    const pubnub = shopper();
    const tokens = await seed('history_channel', 3);
    await untilStored('history_channel', tokens);

    /* eslint-disable prettier/prettier, max-len -- sample text is copied as readers see it */

    // snippet.historyBasicUsage
    try {
        const result = await pubnub.history({
            channel: "history_channel",
            count: 100, // how many items to fetch
            stringifiedTimeToken: true, // false is the default
        });
      // snippet.hide
      capturedResult = result;
      // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    /* eslint-enable prettier/prettier, max-len */
    assert.ok(capturedResult, 'the history call returned a result (its catch only logs)');
    const result = capturedResult;

    // The channel is shared, so earlier messages may precede them: the three just published are the newest, in order.
    assert.deepEqual(tokensOf(result).slice(-3), tokens, 'the three seeded messages are the newest, oldest first');
    assert.ok(isAscending(tokensOf(result)));
    assert.deepEqual(
      result.messages.slice(-3).map((m) => (m.entry as { n: number }).n),
      [0, 1, 2],
    );
    assert.equal(result.startTimeToken, tokensOf(result)[0]);
    assert.equal(result.endTimeToken, tokens[2]);
  });

  it('historyOldestThree: history with reverse true and count 3 returns the three oldest messages', async () => {
    const pubnub = shopper();
    const tokens = await seed('my_channel', 3);
    await untilStored('my_channel', tokens);

    /* eslint-disable prettier/prettier, max-len -- sample text is copied as readers see it */

    // snippet.historyOldestThree
    try {
        const result = await pubnub.history({
            channel: "my_channel",
            reverse: true, // Setting to true will traverse the time line in reverse starting with the oldest message first.
            count: 3, // how many items to fetch
            stringifiedTimeToken: true, // false is the default
        });
      // snippet.hide
      capturedResult = result;
      // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    /* eslint-enable prettier/prettier, max-len */
    assert.ok(capturedResult, 'the history call returned a result (its catch only logs)');
    const result = capturedResult;

    // The oldest messages of a shared channel are not this run's, so check them against an independent reader (fetchMessages).
    const got = tokensOf(result);
    assert.equal(got.length, 3);
    assert.ok(isAscending(got));
    const older = await observer().fetchMessages({ channels: ['my_channel'], start: got[0], count: 1 });
    assert.equal(
      older.channels['my_channel']?.length ?? 0,
      0,
      'nothing on the channel is older than the first returned message',
    );
    const window = await observer().fetchMessages({
      channels: ['my_channel'],
      start: addToTimetoken(got[2], 1),
      end: got[0],
      count: 100,
    });
    assert.deepEqual(
      (window.channels['my_channel'] ?? []).map((m) => String(m.timetoken)),
      got,
      'the three messages are exactly the oldest ones of the channel',
    );
  });

  it('historyNewerThanTimetoken: history with reverse and start returns only messages newer than the anchor, and start is exclusive', async () => {
    const [, middle, newest] = await seed('my_channel', 3);
    await untilStored('my_channel', [newest]);
    const pubnub = withPlaceholders(shopper(), { '13406746780720711': middle });

    /* eslint-disable prettier/prettier, max-len -- sample text is copied as readers see it */

    // snippet.historyNewerThanTimetoken
    try {
        const result = await pubnub.history({
            channel: "my_channel",
            reverse: true, // Setting to true will traverse the time line in reverse starting with the oldest message first.
            stringifiedTimeToken: true, // false is the default
            start: "13406746780720711", // start timetoken to fetch
        });
      // snippet.hide
      capturedResult = result;
      // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    /* eslint-enable prettier/prettier, max-len */
    assert.ok(capturedResult, 'the history call returned a result (its catch only logs)');
    const result = capturedResult;

    const tokens = tokensOf(result);
    assert.equal(tokens[0], newest, 'start is exclusive: the first message is the one after the anchor');
    assert.ok(!tokens.includes(middle), 'the anchor itself is not returned');
    assert.ok(tokens.every((t) => BigInt(t) > BigInt(middle)));
    assert.ok(isAscending(tokens));
  });

  it('historyUntilTimetoken: history with only end returns messages down to the anchor, and end is inclusive', async () => {
    const [oldest, middle, newest] = await seed('my_channel', 3);
    await untilStored('my_channel', [newest]);
    const pubnub = withPlaceholders(shopper(), { '13406746780720711': middle });

    /* eslint-disable prettier/prettier, max-len -- sample text is copied as readers see it */

    // snippet.historyUntilTimetoken
    try {
        const result = await pubnub.history({
            channel: "my_channel",
            stringifiedTimeToken: true, // false is the default
            end: "13406746780720711", // end timetoken to fetch
        });
      // snippet.hide
      capturedResult = result;
      // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    /* eslint-enable prettier/prettier, max-len */
    assert.ok(capturedResult, 'the history call returned a result (its catch only logs)');
    const result = capturedResult;

    const tokens = tokensOf(result);
    assert.equal(tokens[0], middle, 'end is inclusive: the anchor is the oldest returned message');
    assert.ok(tokens.includes(newest));
    assert.ok(!tokens.includes(oldest), 'older than the anchor is not returned');
    assert.ok(isAscending(tokens));
  });

  it('historyPagingExample: the paging helper of the page collects all 120 messages across two pages', async function () {
    this.timeout(240_000);
    const pubnub = withRetry(shopper());
    // Records every page the sample reads, so a count mismatch can say which message went missing and how the pages looked.
    const pages: string[] = [];
    const historyOfSample = pubnub.history.bind(pubnub) as (
      ...args: unknown[]
    ) => Promise<PubNub.History.GetHistoryResponse>;
    (pubnub as unknown as { history: unknown }).history = async (...args: unknown[]) => {
      const page = await historyOfSample(...args);
      const first = page.messages[0]?.timetoken;
      const last = page.messages[page.messages.length - 1]?.timetoken;
      pages.push(
        `${page.messages.length} messages (${first}..${last}), startTimeToken ${page.startTimeToken}, endTimeToken ${page.endTimeToken}`,
      );
      return page;
    };
    // The sample walks the whole channel and cannot be bounded, so start from an empty channel: clear everything older than
    // now (an upper bound, so a message published afterwards is never caught by a late delete) and wait until it is empty.
    // Both bounds are needed: observed on the open keyset, a delete with only `end` is accepted ({}) but removes nothing, so
    // the previous run's 120 messages stayed and the wait below timed out (6 of 13 runs). With `start` too it clears within seconds.
    const now = (await observer().time()).timetoken;
    const deleteBound = now;
    await shopper().deleteMessages({ channel: 'history_test', start: '1', end: now });
    await eventually(
      async () => {
        const probe = await observer().fetchMessages({ channels: ['history_test'], count: 1 });
        assert.equal(probe.channels['history_test']?.length ?? 0, 0, 'history_test is empty');
      },
      { timeout: 60_000, label: 'history_test cleared' },
    );
    // More than one page of 100 messages, so the loop has to page. Observed: two concurrent publishes can come back with the SAME
    // timetoken, and the service then stores only one of them (a run stored 119 of 120, and the 120 returned tokens held a
    // duplicate). So the seeding publishes in parallel for speed, then replaces every message whose timetoken repeats until 120
    // distinct timetokens are stored, and records each collision so the log shows it.
    // A publish that fails transiently is repeated (seedPublish), and a failed attempt may still have been stored. The repeat
    // returns its own timetoken, so such a message would make 121 on the channel and break the exact count below. Every
    // payload carries the run id, and settleSeeded deletes stored copies of this run whose timetoken is not in `tokens`.
    const seedRun = newSeedRun();
    const tokens: string[] = [];
    const collisions: string[] = [];
    let nextN = 0;
    while (tokens.length < 120) {
      const wanted = Math.min(20, 120 - tokens.length);
      const sent = await Promise.all(
        Array.from({ length: wanted }, () => {
          const n = nextN++;
          return seedPublish(seedRun, 'seed history_test publish', () =>
            friend().publish({ channel: 'history_test', message: { legacy: 'paging', n, run: seedRun.id } }),
          );
        }),
      );
      for (const { timetoken } of sent) {
        if (tokens.includes(timetoken)) collisions.push(timetoken);
        else tokens.push(timetoken);
      }
    }
    if (collisions.length > 0)
      console.log(
        `history_test seeding: replaced ${collisions.length} publish(es) with a repeated timetoken: ${collisions}`,
      );
    // Wait for all 120 seeded messages, not only the newest 100. The oldest 20 sit on the second page.
    await untilAllStored('history_test', tokens);
    // Exactly 120 must be stored before the sample runs, however many publishes were repeated.
    await settleSeeded('history_test', tokens, seedRun);

    /* eslint-disable prettier/prettier, max-len -- sample text is copied as readers see it */

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
    /* eslint-enable prettier/prettier, max-len */

    // History is eventually consistent, so wait until the oldest messages are stored too. On a failure the message names the
    // seeded timetokens the sample did not return and whether a tight fetchMessages window finds each of them, which tells a
    // paging defect of the sample (the message is stored) from a storage defect (it is not).
    let lastFound: Array<{ timetoken: string | number }> = [];
    let all: Array<{ timetoken: string | number }>;
    try {
      all = await eventually(
        async () => {
          pages.length = 0;
          const found = await getAllMessages();
          lastFound = found;
          assert.equal(found.length, 120, 'paging returns every message of the cleared channel');
          return found;
        },
        { timeout: 45_000, label: 'paging collects all seeded messages' },
      );
    } catch (error) {
      const returned = new Set(lastFound.map((m) => String(m.timetoken)));
      const missing = tokens.filter((t) => !returned.has(t));
      const lines: string[] = [];
      for (const token of missing) {
        const stored = await storedMessage(observer(), 'history_test', token).catch(() => undefined);
        lines.push(
          `${token} (seeded #${tokens.indexOf(token)}): fetchMessages ${stored ? 'FINDS it' : 'does NOT find it'}`,
        );
      }
      const sorted = [...tokens].sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1));
      const unexpected = lastFound.filter((m) => !tokens.includes(String(m.timetoken))).length;
      throw new Error(
        `${(error as Error).message}\nsample returned ${lastFound.length} (${unexpected} not seeded), missing: ${lines.join('; ') || 'none'}\n` +
          `${collisions.length} repeated publish timetokens replaced during seeding, delete bound ${deleteBound}, first seeded ${sorted[0]}, last seeded ${sorted[sorted.length - 1]}, seeded in publish order #0 ${tokens[0]}\n` +
          `pages of the last attempt: ${pages.join(' | ')}`,
      );
    }
    assert.deepEqual(new Set(all.map((m) => m.timetoken)), new Set(tokens), 'each seeded message exactly once');
    // A valid timetoken starts the walk there: nothing newer than it is returned.
    const sortedTokens = [...tokens].sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1));
    const fromMiddle = await getAllMessages(sortedTokens[59]);
    assert.equal(fromMiddle.length, 59, 'start is exclusive, so only the 59 messages before the 60th are returned');
  });

  it('historyIncludeMeta: includeMeta returns meta for a message published with metadata and omits it for others', async () => {
    const pubnub = shopper();
    const [withMeta] = await seed('my_channel', 1, { meta: { legacy: 'meta' } });
    const [plain] = await seed('my_channel', 1);
    await untilStored('my_channel', [withMeta, plain]);

    /* eslint-disable prettier/prettier, max-len -- sample text is copied as readers see it */

    // snippet.historyIncludeMeta
    try {
        const result = await pubnub.history({
            channel: "my_channel",
            stringifiedTimeToken: true,
            includeMeta: true,
        });
      // snippet.hide
      capturedResult = result;
      // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    /* eslint-enable prettier/prettier, max-len */
    assert.ok(capturedResult, 'the history call returned a result (its catch only logs)');
    const result = capturedResult;

    const found = result.messages.find((m) => m.timetoken === withMeta);
    assert.ok(found, 'the seeded message is returned');
    assert.deepEqual(found.meta, { legacy: 'meta' });
    // The meta property is present only when the publisher set metadata.
    const without = result.messages.find((m) => m.timetoken === plain);
    assert.ok(without, 'the message without metadata is returned');
    assert.equal(without.meta, undefined, 'a message without metadata has no meta property');
  });

  it('historyWithPromises: the promise form of history logs the response with the expected messages', async () => {
    const tokens = await seed('history_channel', 3);
    await untilStored('history_channel', tokens);
    // The docs literals are 1970 timetokens. The live values are the newest boundary (start) and the oldest one (end), so
    // the window holds exactly the three seeded messages.
    const pubnub = withPlaceholders(shopper(), {
      '123123123133': addToTimetoken(tokens[2], 1),
      '123123123123': tokens[0],
    });

    const logs = captureConsole('log');
    try {
      /* eslint-disable prettier/prettier, max-len -- sample text is copied as readers see it */
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
      /* eslint-enable prettier/prettier, max-len */

      await eventually(
        () => {
          assert.ok(
            logs.lines.some((line) => line.includes('"messages"')),
            `the response was logged. Logged: ${logs.lines.join(' | ').slice(0, 300)}`,
          );
        },
        { label: 'promise resolved and logged' },
      );
      const response = JSON.parse(logs.lines.find((line) => line.includes('"messages"'))!);
      assert.deepEqual(
        response.messages.map((m: { timetoken: string }) => String(m.timetoken)),
        tokens,
      );
    } finally {
      logs.restore();
    }
  });

  it('historyDocumentedBehavior: the prose claims of the history page hold: the cap of 100, ordering, returned fields and timetoken types', async function () {
    this.timeout(180_000);
    const pubnub = shopper();
    const channel = 'history_documented_behavior';
    // The claims need a channel with more than 100 messages. It is written once and then reused by later runs.
    const probeCount = async (): Promise<number> =>
      (await observer().fetchMessages({ channels: [channel], count: 100 })).channels[channel]?.length ?? 0;
    if ((await probeCount()) < 100) {
      for (let batch = 0; batch < 5; batch += 1) {
        // Setup with retry. No de-duplication: the claims need at least 100 messages, and an extra stored copy changes none of them.
        await Promise.all(
          Array.from({ length: 21 }, (_, i) =>
            retryTransient(() => friend().publish({ channel, message: { legacy: 'documented', n: batch * 21 + i } }), {
              label: `seed ${channel} publish`,
            }),
          ),
        );
      }
      await eventually(async () => assert.equal(await probeCount(), 100), {
        timeout: 45_000,
        label: 'channel holds 100 messages',
      });
    }
    const probe = (parameters: Partial<Parameters<typeof pubnub.history>[0]>) =>
      pubnub.history({ channel, stringifiedTimeToken: true, ...parameters });

    // "The maximum is 100, and history() lowers a larger value to 100."
    assert.equal((await probe({ count: 150 })).messages.length, 100);

    // "history() always returns the messages sorted from the oldest to the newest, whatever reverse is."
    const newestFive = await probe({ count: 5 });
    const oldestFive = await probe({ count: 5, reverse: true });
    for (const result of [newestFive, oldestFive]) assert.ok(isAscending(tokensOf(result)));
    // reverse decides which end of the interval the retrieval starts from.
    assert.ok(
      BigInt(oldestFive.messages[4].timetoken) < BigInt(newestFive.messages[0].timetoken),
      'reverse starts from the oldest end',
    );

    // Returns: startTimeToken and endTimeToken hold the timetokens of the first and last returned message, as strings.
    assert.equal(newestFive.startTimeToken, newestFive.messages[0].timetoken);
    assert.equal(newestFive.endTimeToken, newestFive.messages[4].timetoken);
    assert.equal(typeof newestFive.startTimeToken, 'string');
    for (const message of newestFive.messages) {
      assert.deepEqual(
        Object.keys(message).sort(),
        ['entry', 'timetoken'],
        'an item has entry and timetoken, and meta only when set',
      );
    }

    // Without stringifiedTimeToken the timetokens are numbers.
    const plain = await pubnub.history({ channel, count: 1 });
    assert.equal(typeof plain.messages[0].timetoken, 'number');

    // "With start, start must be a higher timetoken than end." The docs sample passes start below end. Record what the service does with that order.
    const older = String(oldestFive.messages[0].timetoken);
    const newer = String(newestFive.messages[4].timetoken);
    const inverted = await probe({ count: 100, start: older, end: newer });
    const ordered = await probe({ count: 100, start: newer, end: older });
    console.log(
      `history with start below end returned ${inverted.messages.length} messages, with start above end ${ordered.messages.length}`,
    );
    assert.ok(ordered.messages.length > 0, 'start above end returns the messages in between');
  });

  it('historyActionsDataDeprecated: the deprecated data property of actions equals actions, and both are absent without includeMessageActions', async () => {
    const pubnub = shopper();
    const channel = 'persist_channel';
    const [token] = await seed(channel, 1);
    await friend().addMessageAction({
      channel,
      messageTimetoken: token,
      action: { type: 'reaction', value: 'smiley_face' },
    });
    type WithActions = {
      timetoken: string | number;
      actions?: Record<string, Record<string, unknown[]>>;
      data?: unknown;
    };
    const found = await eventually(
      async () => {
        const response = await pubnub.fetchMessages({ channels: [channel], includeMessageActions: true });
        const item = response.channels[channel]?.find((m) => String(m.timetoken) === token) as WithActions | undefined;
        assert.ok(item?.actions, 'the message has actions');
        return item;
      },
      { timeout: 30_000, label: 'message with action stored' },
    );
    assert.deepEqual(found.data, found.actions, 'the deprecated data property holds the same value as actions');
    assert.ok(found.actions?.reaction?.smiley_face, 'grouped by action type, then by action value');

    // "The response has them only with includeMessageActions and when the message has actions."
    const without = await pubnub.fetchMessages({ channels: [channel] });
    const plainItem = without.channels[channel]?.find((m) => String(m.timetoken) === token) as WithActions | undefined;
    assert.ok(plainItem, 'the message is returned without actions');
    assert.equal(plainItem.actions, undefined);
    assert.equal(plainItem.data, undefined);
  });
});
