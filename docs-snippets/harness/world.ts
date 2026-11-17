/**
 * The `world` object every page module receives. It is the harness side of the test: run id, name suffixing,
 * placeholders, the cast of clients, cleanup tracking, spies and console capture.
 *
 * Architecture notes:
 * - One `World` per run. `mocha-entry.ts` builds it from the environment, registers all pages with it, and disposes
 *   it in the root `after` hook (plus the signal handler for a killed run).
 * - Clients are created lazily on first use and cached by role. A run that only has the open keyset never
 *   builds `server`, `alice` or `bob`, so it never needs those keys.
 * - Every client is tracked and destroyed at the end. A leaked subscribed client can keep the Node process alive and
 *   leaves presence entries on the keyset.
 * - Names go through `n()` (the run suffix, see fixtures/names.ts). Inside snippets the stage rewrite applies the suffix,
 *   outside snippets the step author calls `world.n()`.
 */
import type { ChildProcess } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from './assert.js';
import PubNub from 'pubnub';
import { suffixName } from '../fixtures/names.js';
import { randomRunId, type Env, type LogLevelName, type Role, type SecuredKeyset } from './env.js';
import { LocalProxy } from './proxy.js';
import { addSecrets } from './redact.cjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/**
 * The Sneaker Drop cast. `server` is the staff back office, `shopper`/`friend` are plain open-keyset users, `alice`/`bob` hold
 * tokens. `server`, `alice` and `bob` live on a secured keyset: the one of the running step's role (`pam` or `datasync`).
 */
export type ClientRole = 'server' | 'alice' | 'bob' | 'shopper' | 'friend' | 'observer';

// The env var holds a name (`DOCS_SNIPPETS_LOG_LEVEL=debug`), the SDK wants its enum value.
const LOG_LEVELS: Record<LogLevelName, PubNub.LogLevel> = {
  trace: PubNub.LogLevel.Trace,
  debug: PubNub.LogLevel.Debug,
  info: PubNub.LogLevel.Info,
  warn: PubNub.LogLevel.Warn,
  error: PubNub.LogLevel.Error,
  none: PubNub.LogLevel.None,
};

/** What `world.spy()` returns: every call's arguments and result, plus a way to undo the wrap. */
export interface SpyHandle<R = unknown> {
  calls: unknown[][];
  results: R[];
  restore(): void;
}

export interface ConsoleCapture {
  lines: string[];
  restore(): void;
}

/**
 * Everything a step needs: run id, name suffixing, placeholders, a multi-client factory and tracked cleanup.
 *
 * Clients are created lazily, so a run that only touches the open keyset never needs the secured one.
 * The secret key only ever reaches the `server` client and the snippet that shows server configuration.
 */
export class World {
  readonly runId: string;
  readonly env: Env;
  /** Directory of fixture files. Steps that read relative paths change into it. */
  readonly fixtures = path.resolve(HERE, '..', 'fixtures');
  readonly proxy = new LocalProxy();
  private readonly tracked = new Set<PubNub>();
  private readonly children = new Set<ChildProcess>();
  private readonly placeholderValues = new Map<string, string>();
  private readonly cache = new Map<string, PubNub>();
  /**
   * Role of the step that is running, set by mocha-entry.ts before each step. Snippets name the secured keyset `secured`
   * (hidden lines such as `...world.live.secured` are docs text and stay unchanged), and this decides which keyset that is.
   */
  private role_: Role = 'open';
  private restorers: Array<() => void> = [];
  private counter = 0;

  constructor(env: Env, runId?: string) {
    this.env = env;
    this.runId = runId ?? env.runId ?? randomRunId();
  }

  /** Sets the role of the running step. Called by the Mocha binding, never by a step. */
  useRole(role: Role): void {
    this.role_ = role;
  }

  get role(): Role {
    return this.role_;
  }

  /** The secured role of the running step. A step of role `open` that touches a secured keyset is a wiring error. */
  get securedRole(): 'pam' | 'datasync' {
    if (this.role_ === 'open') {
      throw new Error("this step runs as role open but used a secured keyset (world.server, alice, bob or live.secured). Give it keyset: 'pam' or 'datasync'.");
    }
    return this.role_;
  }

  private securedKeys(): SecuredKeyset {
    const role = this.securedRole;
    const keys = this.env[role];
    if (!keys) throw new Error(`${role} keyset is not configured (${role === 'pam' ? 'PAM_*' : 'DS_*'})`);
    return keys;
  }

  /**
   * Spread into snippet constructors through hidden lines: keys and log level only, never identity.
   * The docs show `publishKey: 'YOUR_PUBLISH_KEY'`. The hidden `...world.live.open` after it overrides the placeholder with
   * the real key, so the page text stays generic and the run is live. Each property is a getter so that reading a keyset
   * that is not configured throws a clear message at the moment of use, not at startup.
   * Typed as Partial so the spread after the visible placeholder keys compiles (TS2783 otherwise). */
  get live(): {
    open: Partial<{ publishKey: string; subscribeKey: string; logLevel: PubNub.LogLevel }>;
    /** Keys only. Use it where the snippet sets `logLevel` itself, because `open` carries the run's log level. */
    openKeys: Partial<{ publishKey: string; subscribeKey: string }>;
    openSubscribeOnly: Partial<{ subscribeKey: string; logLevel: PubNub.LogLevel }>;
    secured: Partial<{ publishKey: string; subscribeKey: string; secretKey: string; logLevel: PubNub.LogLevel }>;
  } {
    const logLevel = LOG_LEVELS[this.env.logLevel];
    const open = this.env.open;
    const securedKeys = (): SecuredKeyset => this.securedKeys();
    return {
      get openKeys() {
        if (!open) throw new Error('open keyset is not configured (SUBSCRIBE_KEY, PUBLISH_KEY)');
        return { ...open };
      },
      get open() {
        if (!open) throw new Error('open keyset is not configured (SUBSCRIBE_KEY, PUBLISH_KEY)');
        return { ...open, logLevel };
      },
      get openSubscribeOnly() {
        if (!open) throw new Error('open keyset is not configured (SUBSCRIBE_KEY, PUBLISH_KEY)');
        return { subscribeKey: open.subscribeKey, logLevel };
      },
      get secured() {
        return { ...securedKeys(), logLevel };
      },
    };
  }

  /** Spread into a configuration to point a client at a port where nothing listens (port 1 is reserved, connect is refused at once). Every request fails fast with a network error. */
  get unreachable(): { origin: string; ssl: false } {
    return { origin: '127.0.0.1:1', ssl: false };
  }

  /** Applies the run suffix to a name. Use it outside snippet markers, where the stage rewrite does not apply. */
  n(name: string): string {
    return suffixName(name, this.runId);
  }

  // ---- placeholders ---
  // A placeholder is a docs literal such as 'replace_with_message_timetoken' that only the run can fill. The stage rewrite
  // turns it into world.ph('messageTimetoken'), and an earlier step supplies the value with world.setPh(). Reading a key
  // nobody set throws, which points at the step order instead of sending the service a bogus timetoken.---------------------------------------------------------------------------------------

  /** Live value for a placeholder literal. Staged snippets call this, see `fixtures/names.ts`. */
  ph(key: string): string {
    const value = this.placeholderValues.get(key);
    if (value === undefined) {
      throw new Error(`placeholder "${key}" has no value yet. A step must call world.setPh('${key}', ...) first.`);
    }
    return value;
  }

  setPh(key: string, value: string): void {
    this.placeholderValues.set(key, value);
  }

  // ---- values out of a try block --------------------------------------------------------------------------------
  // Some pages show a call inside `try { ... } catch (status) { console.log(status); }`. The `const` the call returns
  // is block scoped, so a hidden `world.keep('name', value)` as the last line of the try hands it to the step's assertions,
  // which read it with `world.take('name')`. If the try threw, the catch only logged and keep never ran: take then fails
  // the step, so a swallowed error can never pass.

  private readonly keptValues = new Map<string, unknown>();

  /** Stores a value from inside a snippet's try block (hidden line). */
  keep(name: string, value: unknown): void {
    this.keptValues.set(name, value);
  }

  /** Reads and removes a value stored by `keep`. Throws when the snippet's try block did not reach `keep`. */
  take<T>(name: string): T {
    if (!this.keptValues.has(name)) {
      throw new Error(`the snippet did not reach world.keep('${name}'): its try block threw and the catch only logged it (see the log above)`);
    }
    const value = this.keptValues.get(name) as T;
    this.keptValues.delete(name);
    return value;
  }

  // ---- clients ------------------------------------------------------------------------------------------------

  /** Registers a client for `dispose()`. Use it for clients a step builds by hand (for example the docs `new PubNub(...)`). */
  track<T extends PubNub>(client: T): T {
    this.tracked.add(client);
    return client;
  }

  /** Registers a child process. `dispose()` and the signal handlers kill it, so a killed run leaves no subscribed process behind. */
  trackChild<T extends ChildProcess>(child: T): T {
    this.children.add(child);
    return child;
  }

  /**
   * Creates a tracked client on a keyset. `secured` means the secured keyset of the running step's role. `userId` gets the run
   * suffix unless it already carries it.
   */
  client(keyset: 'open' | 'secured' | Role, userId: string, extra: Partial<PubNub.PubNubConfiguration> = {}): PubNub {
    const role: Role = keyset === 'secured' ? this.securedRole : keyset;
    const keys = role === 'open' ? this.env.open : this.env[role];
    if (!keys) throw new Error(`${role} keyset is not configured`);
    const config: PubNub.PubNubConfiguration = {
      publishKey: keys.publishKey,
      subscribeKey: keys.subscribeKey,
      userId: userId.includes(`-r${this.runId}`) ? userId : this.n(userId),
      logLevel: LOG_LEVELS[this.env.logLevel],
      ...extra,
    };
    return this.track(new PubNub(config));
  }

  /** A new open-keyset client with a unique user id, for steps that must not disturb shared clients. */
  fresh(label = 'fresh', extra: Partial<PubNub.PubNubConfiguration> = {}): PubNub {
    this.counter += 1;
    return this.client('open', `${label}-${this.counter}`, extra);
  }

  /**
   * Short heartbeat settings so presence waits stay small. The default presence timeout is 300 s, so a client that
   * leaves without unsubscribing would linger in hereNow for five minutes. 20 s with an 8 s heartbeat keeps the waits in
   * wait.ts (PRESENCE_TIMEOUT) realistic.
   */
  get presenceOptions(): Partial<PubNub.PubNubConfiguration> {
    return { presenceTimeout: 20, heartbeatInterval: 8 };
  }

  // Memoizes one client per role. Roles are shared across steps on purpose: tokens, listeners and subscriptions carry over,
  // which mirrors an app that keeps one client. Steps that must not disturb that use `fresh()`.
  // Secured roles are cached per keyset role, so `alice` of a pam step and `alice` of a datasync step are different clients.
  private cast(role: ClientRole, build: () => PubNub): PubNub {
    const key = role === 'server' || role === 'alice' || role === 'bob' ? `${this.securedRole}:${role}` : role;
    let client = this.cache.get(key);
    if (!client) {
      client = build();
      this.cache.set(key, client);
    }
    return client;
  }

  /** Open keyset, plain user. Most snippets run as this client. */
  get shopper(): PubNub {
    return this.cast('shopper', () => this.client('open', 'shopper'));
  }
  get friend(): PubNub {
    return this.cast('friend', () => this.client('open', 'friend'));
  }
  /** Never runs docs code. Subscribes and reads to verify effects. */
  get observer(): PubNub {
    return this.cast('observer', () => this.client('open', 'observer'));
  }
  /** Secured keyset, secret key. Grants, DataSync writes, revokes. */
  get server(): PubNub {
    return this.cast('server', () => {
      const secured = this.securedKeys();
      // heartbeatInterval 0: a server that only signs grants has no use for presence heartbeats.
      return registerGrantedTokens(this.client('secured', 'staff-server', { secretKey: secured.secretKey, heartbeatInterval: 0 }));
    });
  }
  /** Secured keyset, token holder. Call `setToken('alice', token)` after the grant step. */
  get alice(): PubNub {
    return this.cast('alice', () => this.client('secured', 'user-alice'));
  }
  get bob(): PubNub {
    return this.cast('bob', () => this.client('secured', 'user-bob'));
  }

  setToken(role: 'alice' | 'bob', token: string): void {
    (role === 'alice' ? this.alice : this.bob).setToken(token);
  }

  // ---- helpers ------------------------------------------------------------------------------------------------

  /**
   * Wraps `obj[method]`, records calls and results, and calls through. Restored by `dispose()`.
   * Used where the docs only show that something was called (a status listener, a transport) and the effect is internal.
   */
  spy<T extends object, K extends keyof T & string>(obj: T, method: K): SpyHandle {
    const original = (obj as Record<string, unknown>)[method] as (...args: unknown[]) => unknown;
    const handle: SpyHandle = { calls: [], results: [], restore: () => undefined };
    (obj as Record<string, unknown>)[method] = function (this: unknown, ...args: unknown[]) {
      const result = original.apply(obj, args);
      handle.calls.push(args);
      handle.results.push(result);
      return result;
    };
    handle.restore = () => {
      (obj as Record<string, unknown>)[method] = original;
    };
    this.restorers.push(handle.restore);
    return handle;
  }

  /**
   * Captures `console.log` (or another method) lines. The logging pages print through console, so asserting on the lines is
   * the only way to prove the sample works. Call `restore()` in a `finally`. */
  captureConsole(method: 'log' | 'info' | 'debug' | 'warn' | 'error' = 'log'): ConsoleCapture {
    const original = console[method];
    const lines: string[] = [];
    console[method] = (...args: unknown[]) => {
      lines.push(args.map((a) => (typeof a === 'string' ? a : safeJson(a))).join(' '));
    };
    const restore = (): void => {
      console[method] = original;
    };
    this.restorers.push(restore);
    return { lines, restore };
  }

  /** Runs `fn` with `console.log` captured and restores it afterwards, also when `fn` throws. */
  async withConsole<T>(fn: (logs: ConsoleCapture) => Promise<T> | T): Promise<T> {
    const logs = this.captureConsole('log');
    try {
      return await fn(logs);
    } finally {
      logs.restore();
    }
  }

  /**
   * Reusable shape checks for in-snippet or post-snippet assertions. A timetoken is checked the same way everywhere: a string
   * of 17 digits (10 ns ticks since 1970), as the SDK types declare it.
   */
  readonly check = {
    timetoken(value: unknown): void {
      assert.equal(typeof value, 'string', `expected a timetoken string, got ${typeof value} ${String(value)}`);
      assert.match(String(value), /^\d{17}$/, `expected a 17 digit timetoken, got ${String(value)}`);
    },
    /**
     * The timetoken of `time()`. SDK finding: the types declare `timetoken: string` (src/core/endpoints/time.ts), but the
     * SDK returns the parsed JSON number, which is above Number.MAX_SAFE_INTEGER and can lose its last digit. This check
     * pins that behavior: when the SDK returns a string, it fails and the special case can go.
     */
    serverTime(value: unknown): void {
      assert.equal(typeof value, 'number', `time() timetoken: the SDK used to return a number although the types say string, got ${typeof value}`);
      assert.match(String(value), /^\d{17}$/, `expected a 17 digit timetoken, got ${String(value)}`);
    },
  };

  /** Destroys every tracked client and restores spies and console. */
  async dispose(): Promise<void> {
    // Order: restore patched globals first so cleanup logging is not captured, then kill child processes (they hold
    // subscriptions), then destroy clients, then stop the proxy their sockets might still use.
    for (const restore of this.restorers.splice(0)) restore();
    for (const child of this.children) {
      if (child.exitCode === null && !child.killed) child.kill('SIGKILL');
    }
    this.children.clear();
    for (const client of this.tracked) {
      try {
        // Drop listeners first so the final unsubscribe status does not fire into a step that already finished.
        client.removeAllListeners();
        client.destroy();
      } catch {
        // A client that failed to build or was destroyed by its own step is fine.
      }
    }
    this.tracked.clear();
    this.cache.clear();
    await this.proxy.stop();
  }
}

/**
 * Every token the server client grants becomes a known secret for the redaction (redact.cjs), so its exact value is masked
 * in any output, on top of the token shape pattern. Samples print tokens with console.log, and a failing step shows its
 * console output in the CI log and in report/run.json.
 */
function registerGrantedTokens(client: PubNub): PubNub {
  const grant = client.grantToken.bind(client) as (...args: unknown[]) => unknown;
  (client as unknown as { grantToken: (...args: unknown[]) => unknown }).grantToken = (...args: unknown[]) => {
    const result = grant(...args);
    if (result instanceof Promise) {
      return result.then((token: unknown) => {
        if (typeof token === 'string') addSecrets([token]);
        return token;
      });
    }
    return result;
  };
  return client;
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
