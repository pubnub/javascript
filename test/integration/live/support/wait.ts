/**
 * Waiting primitives. Poll a read until it holds (`eventually`) or listen for the exact event the action should cause. Use a
 * fixed `sleep` only to prove that something did NOT arrive.
 *
 * - `eventually`    poll a read (hereNow, history, App Context filter) that is eventually consistent on the service.
 * - `settled`       like `eventually`, but the read must hold on several consecutive polls. Use it as the precondition of a
 *                   sample that reads the same state once and asserts it exactly (see README, Waiting).
 * - `expectEvent`   register a listener BEFORE the action, resolve on the first matching event.
 * - `connected`     resolve when a subscribe is really active. A publish sent before that point is not delivered.
 * - `watch`         subscribe once and record everything, so the assertion can come after the publish without racing.
 * - `expectStatus`  resolve on a status category such as `PNConnectedCategory`.
 *
 * Every helper rejects with a message that says what was awaited and what was seen.
 */
import type PubNub from 'pubnub';

export interface EventuallyOptions {
  /** Milliseconds. Default 15000. */
  timeout?: number;
  /** Milliseconds between attempts. Default 500. */
  interval?: number;
  label?: string;
}

/** Presence is the slowest eventual state: what hereNow and similar reads show lags the heartbeat. */
export const PRESENCE_TIMEOUT = 45_000;

/**
 * How long a test waits for a presence event it caused. The keyset announces a join or leave after a 2 s debounce when the
 * channel holds at most 20 occupants, and falls back to one summary per 10 s interval above that. 30 s covers the debounce,
 * one interval and a long-poll cycle with margin.
 */
export const PRESENCE_EVENT_TIMEOUT = 30_000;

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Polls a read until the callback stops throwing, then returns its value. On timeout the error carries the last failure. */
export async function eventually<T>(fn: () => Promise<T> | T, options: EventuallyOptions = {}): Promise<T> {
  const timeout = options.timeout ?? 15_000;
  const interval = options.interval ?? 500;
  const deadline = Date.now() + timeout;
  let last: unknown;
  let attempts = 0;
  for (;;) {
    attempts += 1;
    try {
      return await fn();
    } catch (error) {
      last = error;
    }
    if (Date.now() + interval > deadline) break;
    await sleep(interval);
  }
  const detail = last instanceof Error ? last.message : String(last);
  const error = new Error(
    `eventually${options.label ? ` (${options.label})` : ''} timed out after ${timeout}ms, ${attempts} attempts. Last: ${detail}`,
  );
  (error as Error & { cause?: unknown }).cause = last;
  throw error;
}

export interface SettledOptions extends EventuallyOptions {
  /** How many polls in a row must pass. Default 3. */
  consecutive?: number;
}

/**
 * Polls a read until it passes `consecutive` times in a row, then returns the value of the last pass. A failed poll resets
 * the count. Use it where a later request reads the same state ONCE and an exact assertion depends on it: the service answers
 * reads from replicas that do not all see a write at the same moment, so one passing read only proves that one replica caught
 * up (a read right after it can still land on a lagging one, as `getMembershipsFilterExample` did in CI).
 *
 * Defaults: 3 passes, 750 ms apart. The spacing matters as much as the count. Reads a few milliseconds apart can be served from the
 * same replica or cache, so they confirm little. 750 ms gives another replica a real chance to answer, and three passes cover two independent confirmations of the first, at a fixed cost of
 * (consecutive - 1) * interval = 1.5 s once the state is visible. `interval` is also the pause between failed polls. The
 * default `timeout` is 15 s like `eventually`; pass the same longer timeout the old `eventually` call had.
 * A fresh client does not help: the tier's helper clients share one connection pool (support/clients.ts), so only time moves
 * a read to another replica.
 */
export async function settled<T>(fn: () => Promise<T> | T, options: SettledOptions = {}): Promise<T> {
  const timeout = options.timeout ?? 15_000;
  const interval = options.interval ?? 750;
  const consecutive = options.consecutive ?? 3;
  if (!Number.isInteger(consecutive) || consecutive < 1) {
    throw new Error('settled: consecutive must be an integer >= 1');
  }
  const deadline = Date.now() + timeout;
  let last: unknown;
  let lastValue: T | undefined;
  let streak = 0;
  let best = 0;
  let polls = 0;
  for (;;) {
    polls += 1;
    try {
      lastValue = await fn();
      streak += 1;
      best = Math.max(best, streak);
      if (streak >= consecutive) return lastValue;
    } catch (error) {
      last = error;
      streak = 0;
    }
    if (Date.now() + interval > deadline) break;
    await sleep(interval);
  }
  let detail: string;
  if (last === undefined) detail = 'none (no poll failed, the timeout was shorter than the confirmations)';
  else detail = last instanceof Error ? last.message : String(last);
  const error = new Error(
    `settled${options.label ? ` (${options.label})` : ''} timed out after ${timeout}ms, ${polls} polls. ` +
      `Reached ${streak} consecutive successes at the end, at most ${best}, of ${consecutive} needed. Last failure: ${detail}`,
  );
  (error as Error & { cause?: unknown }).cause = last;
  throw error;
}

/**
 * Removes a listener after the current dispatch. Removing it inside its own callback mutates the SDK's listener array while
 * it iterates, which makes the SDK skip the next listener.
 */
function detach(target: { removeListener(listener: PubNub.Listener): void }, listener: PubNub.Listener): void {
  setImmediate(() => target.removeListener(listener));
}

/** Anything with the listener API: the client, a subscription or a subscription set. */
export interface ListenerTarget {
  addListener(listener: PubNub.Listener): void;
  removeListener(listener: PubNub.Listener): void;
}

/** Listener callbacks the helpers can wait for. `status` has its own helpers (`connected`, `expectStatus`). */
export type EventKind = 'message' | 'signal' | 'presence' | 'messageAction' | 'file' | 'objects';

type EventOf<K extends EventKind> = Parameters<NonNullable<PubNub.Listener[K]>>[0];

export interface ExpectOptions {
  timeout?: number;
}

/** Registers a listener now and resolves on the first event of `kind` that satisfies `predicate`. Call it before the action. */
export function expectEvent<K extends EventKind>(
  target: ListenerTarget,
  kind: K,
  predicate: (event: EventOf<K>) => boolean = () => true,
  options: ExpectOptions = {},
): Promise<EventOf<K>> {
  const timeout = options.timeout ?? 15_000;
  return new Promise<EventOf<K>>((resolve, reject) => {
    const listener: PubNub.Listener = {};
    const timer = setTimeout(() => {
      target.removeListener(listener);
      reject(new Error(`no "${kind}" event matched within ${timeout}ms`));
    }, timeout);
    // Mocha's own test timer keeps the process alive meanwhile. unref() only means an abandoned wait cannot hold it open.
    timer.unref();
    (listener as Record<string, unknown>)[kind] = (event: EventOf<K>) => {
      // A predicate that throws (reading a field of an event of another shape) means "not this one", not a test failure.
      let matched = false;
      try {
        matched = predicate(event);
      } catch {
        matched = false;
      }
      if (!matched) return;
      clearTimeout(timer);
      detach(target, listener);
      resolve(event);
    };
    target.addListener(listener);
  });
}

// Statuses that mean a subscribe loop is up. A re-subscribe reports `SubscriptionChanged`, a recovered network `Reconnected`.
const CONNECT_CATEGORIES = new Set(['PNConnectedCategory', 'PNSubscriptionChangedCategory', 'PNReconnectedCategory']);

/**
 * Resolves when the client reports a connected or subscription-changed status that covers every channel and group. Register
 * it BEFORE the call that subscribes (statuses are not replayed).
 */
export function connected(
  client: Pick<PubNub, 'addListener' | 'removeListener'>,
  targets: { channels?: string[]; channelGroups?: string[] },
  options: ExpectOptions = {},
): Promise<void> {
  const timeout = options.timeout ?? 15_000;
  const needChannels = new Set(targets.channels ?? []);
  const needGroups = new Set(targets.channelGroups ?? []);
  return new Promise<void>((resolve, reject) => {
    const seenChannels = new Set<string>();
    const seenGroups = new Set<string>();
    const listener: PubNub.Listener = {
      status: (status) => {
        if (!CONNECT_CATEGORIES.has(String(status.category))) return;
        const event = status as PubNub.StatusEvent;
        // A status without lists means the whole subscription is up.
        event.affectedChannels?.forEach((c) => seenChannels.add(c));
        event.subscribedChannels?.forEach((c) => seenChannels.add(c));
        event.affectedChannelGroups?.forEach((g) => seenGroups.add(g));
        const done =
          [...needChannels].every((c) => seenChannels.has(c)) && [...needGroups].every((g) => seenGroups.has(g));
        if (done) {
          clearTimeout(timer);
          detach(client, listener);
          resolve();
        }
      },
    };
    const timer = setTimeout(() => {
      client.removeListener(listener);
      reject(
        new Error(
          `not connected within ${timeout}ms. Wanted channels [${[...needChannels]}] groups [${[...needGroups]}], ` +
            `saw channels [${[...seenChannels]}] groups [${[...seenGroups]}]`,
        ),
      );
    }, timeout);
    timer.unref();
    client.addListener(listener);
  });
}

/** One event a `Watch` saw, tagged with the listener it arrived on. */
export interface RecordedEvent {
  kind: EventKind;
  event: unknown;
}

/** A subscription that records every event it receives, so a test can subscribe once and assert later. Created with `watch()`. */
export class Watch {
  readonly events: RecordedEvent[] = [];
  // Callers blocked in `next()`. Each is woken as soon as an event arrives.
  private waiters: Array<() => void> = [];

  constructor(private readonly set: ReturnType<PubNub['subscriptionSet']>) {
    const record = (kind: EventKind) => (event: unknown) => {
      this.events.push({ kind, event });
      this.waiters.splice(0).forEach((wake) => wake());
    };
    set.addListener({
      message: record('message'),
      signal: record('signal'),
      presence: record('presence'),
      messageAction: record('messageAction'),
      file: record('file'),
      objects: record('objects'),
    });
  }

  /** Resolves with the first recorded event of `kind` matching `predicate`, waiting if needed. */
  async next<K extends EventKind>(
    kind: K,
    predicate: (event: EventOf<K>) => boolean = () => true,
    options: ExpectOptions = {},
  ): Promise<EventOf<K>> {
    const timeout = options.timeout ?? 15_000;
    const deadline = Date.now() + timeout;
    for (;;) {
      for (const recorded of this.events) {
        if (recorded.kind !== kind) continue;
        let ok = false;
        try {
          ok = predicate(recorded.event as EventOf<K>);
        } catch {
          ok = false;
        }
        if (ok) return recorded.event as EventOf<K>;
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new Error(
          `no "${kind}" event matched within ${timeout}ms. Recorded: ${this.events.map((e) => e.kind).join(',') || 'none'}`,
        );
      }
      // Sleep until the next event wakes us. The 250 ms cap is a safety net, not a poll interval.
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, Math.min(remaining, 250));
        this.waiters.push(() => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
  }

  /** Unsubscribes and drops the listeners. */
  stop(): void {
    this.set.unsubscribe();
    this.set.removeAllListeners();
  }
}

export interface WatchOptions {
  channelGroups?: string[];
  presence?: boolean;
  timeout?: number;
}

/**
 * Subscribes `client` to channels (and groups), waits until connected and returns a recording `Watch`. Pass a client that has
 * not subscribed before (`observer()` builds a new one on every call): a reused client can still report the status of an
 * earlier unsubscribe, which would resolve `connected` before the new subscription is active.
 */
export async function watch(client: PubNub, channels: string[], options: WatchOptions = {}): Promise<Watch> {
  const set = client.subscriptionSet({
    channels,
    channelGroups: options.channelGroups,
    subscriptionOptions: options.presence ? { receivePresenceEvents: true } : undefined,
  });
  // Register the connected listener first, then subscribe: statuses are not replayed.
  const ready = connected(client, { channels, channelGroups: options.channelGroups }, { timeout: options.timeout });
  const handle = new Watch(set);
  set.subscribe();
  await ready;
  return handle;
}

/** Resolves on the first status event whose category is one of `categories`. Register it before the action. */
export function expectStatus(
  client: Pick<PubNub, 'addListener' | 'removeListener'>,
  categories: string[],
  options: ExpectOptions = {},
): Promise<string> {
  const timeout = options.timeout ?? 15_000;
  return new Promise<string>((resolve, reject) => {
    const listener: PubNub.Listener = {
      status: (status) => {
        const category = String(status.category);
        if (!categories.includes(category)) return;
        clearTimeout(timer);
        detach(client, listener);
        resolve(category);
      },
    };
    const timer = setTimeout(() => {
      client.removeListener(listener);
      reject(new Error(`no status in [${categories.join(', ')}] within ${timeout}ms`));
    }, timeout);
    timer.unref();
    client.addListener(listener);
  });
}
