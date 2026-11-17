import assert from 'node:assert/strict';
import type PubNub from 'pubnub';
import { addToTimetoken } from './assertions';
import { observer, shopper } from './clients';
import { retryTransient } from './retry';
import { settled, sleep } from './wait';
import { randomUUID } from 'node:crypto';

/**
 * Reads the stored message published at exactly `timetoken`, or undefined. Channels are shared and persistent, so a test
 * must look for its own message by timetoken, not take "the latest N". The window is one tick wide on both sides.
 */
export async function storedMessage(client: PubNub, channel: string, timetoken: string) {
  const history = await client.fetchMessages({
    channels: [channel],
    start: addToTimetoken(timetoken, 1),
    end: addToTimetoken(timetoken, -1),
  });
  return history.channels[channel]?.find((m) => m.timetoken === timetoken);
}

/**
 * Waits until every timetoken of `tokens` is visible to a reader on `channel` (newest 100 messages only; the write and the read
 * model of the service are separate). For larger sets, page through the channel instead. One read that shows the messages does
 * not vouch for the next one (replicas lag independently), and the samples read the window once and assert it exactly, so the
 * read must hold on consecutive polls (`settled`, about 1.5 s once the messages are visible).
 */
export function untilStored(channel: string, tokens: string[]): Promise<void> {
  return settled(
    async () => {
      const history = await observer().fetchMessages({ channels: [channel], count: 100 });
      const have = new Set((history.channels[channel] ?? []).map((m) => String(m.timetoken)));
      for (const token of tokens) assert.ok(have.has(token), `${token} is not stored yet`);
    },
    { timeout: 30_000, label: `messages stored on ${channel}` },
  );
}

/**
 * Seeding with retry. Setup code only: a publish that fails with a transient error (5xx, 429, network) is repeated, because
 * the failure says nothing about the sample. A failed attempt can still have reached the service, so the message may be stored
 * twice: once under a timetoken the caller never saw. A caller that counts the messages of a channel therefore
 *   1. puts `run: seedRun.id` into the payload of every seeded message,
 *   2. publishes through `seedPublish(seedRun, ...)`, which counts the repeats, and
 *   3. calls `settleSeeded(channel, tokens, seedRun)` before it relies on the count. When nothing was repeated it returns at
 *      once. Otherwise it waits until the returned timetokens are visible, lets the read model settle, deletes every stored
 *      message of this run whose timetoken the caller does not hold, and waits until none is left.
 */
export interface SeedRun {
  readonly id: string;
  /** How many publishes needed more than one attempt. */
  retried: number;
}

export const newSeedRun = (): SeedRun => ({ id: randomUUID(), retried: 0 });

export function seedPublish<T>(run: SeedRun, label: string, publish: () => Promise<T>): Promise<T> {
  let attempts = 0;
  return retryTransient(
    () => {
      attempts += 1;
      return publish();
    },
    { label },
  ).finally(() => {
    if (attempts > 1) run.retried += 1;
  });
}

/** Every stored message of `channel` newer than `oldest` (all when omitted), read page by page from the newest. */
async function scanChannel(channel: string, oldest?: string): Promise<Array<{ timetoken: string; message: unknown }>> {
  const out: Array<{ timetoken: string; message: unknown }> = [];
  let before: string | undefined;
  for (let page = 0; page < 50; page += 1) {
    const response = await observer().fetchMessages({
      channels: [channel],
      count: 100,
      ...(before ? { start: before } : {}),
      ...(oldest ? { end: oldest } : {}),
    });
    const items = response.channels[channel] ?? [];
    for (const item of items) out.push({ timetoken: String(item.timetoken), message: item.message });
    if (items.length < 100) break;
    before = String(items[0].timetoken);
  }
  return out;
}

/** See `SeedRun`. Leaves exactly `tokens` of this run on `channel`. A no-op when no publish was repeated. */
export async function settleSeeded(channel: string, tokens: string[], run: SeedRun): Promise<void> {
  if (run.retried === 0) return;
  const wanted = new Set(tokens);
  // A repeated publish happens within seconds of the first attempt, so two minutes before the oldest token is a safe bound.
  const oldest = tokens.reduce((a, b) => (BigInt(a) < BigInt(b) ? a : b));
  const bound = addToTimetoken(oldest, -1_200_000_000);
  const extras = async () =>
    (await scanChannel(channel, bound)).filter(
      (m) => (m.message as { run?: string } | null)?.run === run.id && !wanted.has(m.timetoken),
    );
  await settled(
    async () => {
      const have = new Set((await scanChannel(channel, bound)).map((m) => m.timetoken));
      for (const token of tokens) assert.ok(have.has(token), `${token} is not stored yet`);
    },
    { timeout: 45_000, label: `seeded messages stored on ${channel}` },
  );
  // The first attempt of a repeated publish is older than the one that succeeded, so it is visible by now. The pause is a
  // margin for the eventually consistent read model, not a retry.
  await sleep(3_000);
  const duplicates = await extras();
  for (const { timetoken } of duplicates) {
    await retryTransient(
      () => shopper().deleteMessages({ channel, start: addToTimetoken(timetoken, -1), end: timetoken }),
      { label: `delete duplicate seed on ${channel}` },
    );
  }
  if (duplicates.length > 0) {
    await settled(async () => assert.equal((await extras()).length, 0, 'duplicates are gone'), {
      timeout: 45_000,
      label: `duplicate seeds removed from ${channel}`,
    });
  }
  console.log(`seeding ${channel}: ${run.retried} publish(es) repeated, ${duplicates.length} duplicate(s) removed`);
}
