/**
 * Waiting primitives. The rule of the app is "no blind retries and no fixed sleeps": every wait either polls a read until
 * an assertion holds (`eventually`) or listens for the exact event the action should cause.
 *
 * - `eventually`    poll a read (hereNow, history, App Context filter) that is eventually consistent on the service.
 * - `expectEvent`   register a listener BEFORE the action, resolve on the first matching event.
 * - `connected`     resolve when a subscribe is really active. Subscribing is asynchronous, a publish sent before that
 *                   point is not delivered to the new subscriber, which is the classic race in pub/sub tests.
 * - `watch`         subscribe once and record everything, so the assertion can come after the publish without racing.
 * - `expectStatus`  resolve on a status category such as `PNConnectedCategory`.
 *
 * Every helper rejects with a message that says what was awaited and what was seen, so a timeout reads as a diagnosis.
 */
import assert from './assert.js';
import { recorder, type AssertionRecord } from './recorder.js';
import type PubNub from 'pubnub';
import { redact } from './redact.cjs';

export interface EventuallyOptions {
  /** Milliseconds. Default 15000. Presence reads use 45000. */
  timeout?: number;
  /** Milliseconds between attempts. Default 500. */
  interval?: number;
  label?: string;
}

// Presence is the slowest eventual state: join and timeout events lag the heartbeat (see World.presenceOptions).
export const PRESENCE_TIMEOUT = 45_000;

/**
 * Polls a read until the callback stops throwing, then returns its value. No blind retries: on timeout the
 * error carries the last assertion message so the failure explains itself.
 */
export async function eventually<T>(fn: () => Promise<T> | T, options: EventuallyOptions = {}): Promise<T> {
  const timeout = options.timeout ?? 15_000;
  const interval = options.interval ?? 500;
  const deadline = Date.now() + timeout;
  const name = options.label ? `eventually: ${options.label}` : 'eventually';
  let last: unknown;
  let attempts = 0;
  for (;;) {
    attempts += 1;
    // Assertions inside the callback record into a private buffer. A failed attempt is expected and must not show up in the
    // report as a failed assertion, only the attempt that passed is kept (see recorder.ts).
    const buffer: AssertionRecord[] = [];
    try {
      const value = await recorder.attempt(buffer, fn);
      recorder.commit(buffer);
      recorder.record({ kind: 'eventually', label: `${name} held${attempts > 1 ? ` after ${attempts} attempts` : ''}`, ok: true });
      return value;
    } catch (error) {
      last = error;
    }
    if (Date.now() + interval > deadline) break;
    await sleep(interval);
  }
  const detail = last instanceof Error ? last.message : String(last);
  recorder.record({ kind: 'eventually', label: `${name} did not hold within ${timeout}ms (${attempts} attempts)`, ok: false, actual: redact(detail).slice(0, 200) });
  const error = new Error(`eventually${options.label ? ` (${options.label})` : ''} timed out after ${timeout}ms. Last: ${detail}`);
  (error as Error & { cause?: unknown }).cause = last;
  throw error;
}

/**
 * Removes a listener after the current dispatch. Removing it inside its own callback mutates the SDK's listener
 * array while it iterates, which makes the SDK skip the next listener (the first live rerun lost a snippet's
 * status listener this way).
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

/**
 * Registers a listener now and resolves on the first event of `kind` that satisfies `predicate`. Call it
 * before the action that causes the event. Rejects on timeout.
 */
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
    // The step awaits this promise, and Mocha's own test timer keeps the process alive meanwhile. unref() only means an
    // abandoned wait cannot hold the process open after the run.
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
      recorder.record({ kind: 'event', label: `received a "${kind}" event that matched`, ok: true });
      resolve(event);
    };
    target.addListener(listener);
  });
}

// Statuses that mean a subscribe loop is up. A re-subscribe reports `SubscriptionChanged`, a recovered network `Reconnected`.
const CONNECT_CATEGORIES = new Set(['PNConnectedCategory', 'PNSubscriptionChangedCategory', 'PNReconnectedCategory']);

/**
 * Resolves when the client reports a connected or subscription-changed status that covers every channel and
 * group. Register it BEFORE the call that subscribes (statuses are not replayed). Affected channels
 * accumulate, so several subscribes in one tick that coalesce into one status still resolve.
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
        const done = [...needChannels].every((c) => seenChannels.has(c)) && [...needGroups].every((g) => seenGroups.has(g));
        if (done) {
          clearTimeout(timer);
          detach(client, listener);
          recorder.record({ kind: 'connected', label: `subscription connected (${[...needChannels, ...needGroups].length} channel or group name(s))`, ok: true });
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
    // The step awaits this promise, and Mocha's own test timer keeps the process alive meanwhile. unref() only means an
    // abandoned wait cannot hold the process open after the run.
    timer.unref();
    client.addListener(listener);
  });
}

/** One event a `Watch` saw, tagged with the listener it arrived on. */
export interface RecordedEvent {
  kind: EventKind;
  event: unknown;
}

/**
 * A subscription that records every event it receives, so a step can subscribe once and assert later without
 * racing the publish. Created with `watch()`.
 */
export class Watch {
  readonly events: RecordedEvent[] = [];
  // Callers blocked in `next()`. Each is woken as soon as an event arrives, instead of polling on a timer only.
  private waiters: Array<() => void> = [];

  constructor(
    private readonly set: ReturnType<PubNub['subscriptionSet']>,
    private readonly client: PubNub,
  ) {
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
        if (ok) {
          recorder.record({ kind: 'event', label: `watched client received a "${kind}" event that matched`, ok: true });
          return recorded.event as EventOf<K>;
        }
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        assert.fail(`no "${kind}" event matched within ${timeout}ms. Recorded: ${this.events.map((e) => e.kind).join(',') || 'none'}`);
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

  /** Unsubscribes and drops the listeners. Call it when the step is done so the observer stops receiving. */
  stop(): void {
    this.set.unsubscribe();
    this.set.removeAllListeners();
    void this.client;
  }
}

export interface WatchOptions {
  channelGroups?: string[];
  presence?: boolean;
  timeout?: number;
}

/**
 * Subscribes `client` to channels (and groups), waits until connected and returns a recording `Watch`.
 * The channels must already carry the run suffix (use `world.n()`).
 *
 * Pass a client that has not subscribed before, for example `world.fresh('observer')`. A reused client can
 * still report the status of an earlier unsubscribe for the same channel, which would resolve `connected`
 * before the new subscription is active.
 */
export async function watch(client: PubNub, channels: string[], options: WatchOptions = {}): Promise<Watch> {
  const set = client.subscriptionSet({
    channels,
    channelGroups: options.channelGroups,
    subscriptionOptions: options.presence ? { receivePresenceEvents: true } : undefined,
  });
  // Order matters: register the connected listener first, then subscribe. Statuses are not replayed, so a listener added
  // after `subscribe()` could miss the very status it waits for.
  const ready = connected(client, { channels, channelGroups: options.channelGroups }, { timeout: options.timeout });
  const handle = new Watch(set, client);
  set.subscribe();
  await ready;
  return handle;
}

/**
 * Resolves on the first status event whose category is one of `categories`. Register it before the action.
 */
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
        recorder.record({ kind: 'status', label: `status ${category} received`, ok: true });
        resolve(category);
      },
    };
    const timer = setTimeout(() => {
      client.removeListener(listener);
      reject(new Error(`no status in [${categories.join(', ')}] within ${timeout}ms`));
    }, timeout);
    // The step awaits this promise, and Mocha's own test timer keeps the process alive meanwhile. unref() only means an
    // abandoned wait cannot hold the process open after the run.
    timer.unref();
    client.addListener(listener);
  });
}

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Tallies the events a step's recording listener saw, by kind, with the time of the first one. A step that waits for
 * "every event kind" uses it so a timeout names the kinds that arrived (with counts) and the kinds still missing,
 * instead of reporting only the one assertion that failed last. Times are milliseconds since the log was created.
 *
 * `match` narrows a kind to the events the step actually triggered (for example the join of the second client, not any
 * presence event on a busy channel). An event that does not match is kept in `of()` but does not count as arrived.
 */
export class KindLog<E = any> {
  private readonly events = new Map<string, E[]>();
  private readonly first = new Map<string, number>();
  private readonly started = Date.now();

  constructor(
    readonly kinds: readonly string[],
    private readonly match: Record<string, (event: E) => boolean> = {},
  ) {
    kinds.forEach((kind) => this.events.set(kind, []));
  }

  /** Listener callback for one kind: `message: log.on('message')`. */
  on(kind: string): (event: E) => void {
    return (event) => {
      this.events.get(kind)!.push(event);
      if (this.matches(kind, event) && !this.first.has(kind)) this.first.set(kind, Date.now() - this.started);
    };
  }

  /** The events of one kind, in arrival order (all of them, matching or not). */
  of(kind: string): E[] {
    return this.events.get(kind) ?? [];
  }

  private matches(kind: string, event: E): boolean {
    const predicate = this.match[kind];
    if (!predicate) return true;
    try {
      return predicate(event);
    } catch {
      return false;
    }
  }

  /** The events of one kind that count as the awaited one. */
  matching(kind: string): E[] {
    return this.of(kind).filter((event) => this.matches(kind, event));
  }

  /** "arrived: message x1 (+120ms), presence x2 (+800ms). missing: signal, objects. other events: presence x3". */
  summary(required: readonly string[] = this.kinds): string {
    const arrived = required.filter((k) => this.matching(k).length > 0).map((k) => `${k} x${this.matching(k).length} (+${this.first.get(k)}ms)`);
    const missing = required.filter((k) => this.matching(k).length === 0);
    const other = required.filter((k) => this.of(k).length > this.matching(k).length).map((k) => `${k} x${this.of(k).length - this.matching(k).length}`);
    return `arrived: ${arrived.join(', ') || 'none'}. missing: ${missing.join(', ') || 'none'}${other.length ? `. other events: ${other.join(', ')}` : ''}`;
  }

  /** Throws (for `eventually`) while any required kind has no matching event. The message carries the full summary. */
  assertArrived(required: readonly string[] = this.kinds): void {
    if (required.some((k) => this.matching(k).length === 0)) throw new Error(this.summary(required));
  }
}

/**
 * For conditions that are not event kinds (a console line per handler, say). Throws one error that lists every
 * condition that does not hold, so a timeout names all missing ones and not only the first.
 */
export function assertAll(conditions: Record<string, boolean>): void {
  const missing = Object.entries(conditions).filter(([, ok]) => !ok).map(([name]) => name);
  if (missing.length > 0) {
    const held = Object.entries(conditions).filter(([, ok]) => ok).map(([name]) => name);
    throw new Error(`missing: ${missing.join(', ')}. held: ${held.join(', ') || 'none'}`);
  }
}

/**
 * How long a step waits for a presence event it caused. The keyset announces a join or leave after the 2 s debounce when
 * the channel holds at most 20 occupants (announce max), and falls back to one summary per 10 s interval above that.
 * 30 s covers debounce, one interval and a long-poll cycle with margin.
 */
export const PRESENCE_EVENT_TIMEOUT = 30_000;
