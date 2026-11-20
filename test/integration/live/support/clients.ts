/**
 * Plain client factories. Every client is tracked and destroyed by the root hook (hooks.ts) after each test, so no test
 * leaks a subscribed client into the next one. User ids are literal and shared across runs on purpose: the tier runs one
 * live run per keyset at a time.
 */
import PubNub from 'pubnub';
import { quietConsole } from './console';
import { keysOf, type Role } from './env';

const tracked = new Set<PubNub>();

/**
 * Every helper client talks to one host and shares one connection pool. The SDK gives each client its own undici pool and a
 * random host of ps1..ps20, so each short-lived client pays a TCP and TLS handshake (3 round trips) before its first request.
 * At a 190 ms round trip that is 0.9 s for the first request of a client against 0.35 s for the next. Most tests build several
 * clients (`observer()` is a new client every call), so the handshakes were about half of the run.
 */
const SHARED_ORIGIN = 'ps.pndsn.com';
let sharedPool: unknown;

/** True when `extra` leaves the connection settings alone, so the client may use the shared host and pool. */
const usesDefaultConnection = (extra: Partial<PubNub.PubNubConfiguration>): boolean =>
  !extra.origin &&
  !('proxy' in extra) &&
  extra.keepAlive === undefined &&
  !extra.keepAliveSettings &&
  extra.ssl !== false;

type Pooled = { nodeTransport?: { keepAliveAgent?: unknown; makeKeepAliveAgent?: () => unknown } };

function shareConnectionPool(client: PubNub): void {
  // The transport and its pool are SDK internals (no public option takes a pool), so this stays defensive: when the shape
  // changes the client keeps its own pool and only runs slower.
  const transport = (client as unknown as Pooled).nodeTransport;
  if (!transport) return;
  // The pool of a client built with keepAlive false does not reuse sockets, so the shared one comes from a keep-alive client
  // that is never used. The helper clients stay keepAlive false because the SDK refuses setProxy on a keepAlive client.
  if (!sharedPool) {
    const { publishKey, subscribeKey } = keysOf('open');
    const donor = new PubNub({ publishKey, subscribeKey, userId: 'pool-donor', keepAlive: true });
    sharedPool = (donor as unknown as Pooled).nodeTransport?.makeKeepAliveAgent?.();
    donor.destroy();
  }
  if (sharedPool) transport.keepAliveAgent = sharedPool;
}

/**
 * A client on the keyset of `role`, destroyed after the current test. `extra` overrides any configuration field. A client whose
 * `extra` sets no origin, proxy, keep-alive or ssl option runs on the shared host and connection pool (see above).
 */
export function createClient(role: Role, userId: string, extra: Partial<PubNub.PubNubConfiguration> = {}): PubNub {
  const { publishKey, subscribeKey } = keysOf(role);
  const pooled = usesDefaultConnection(extra);
  const client = new PubNub({
    publishKey,
    subscribeKey,
    userId,
    ...(pooled ? { origin: SHARED_ORIGIN } : {}),
    ...extra,
  });
  if (pooled) shareConnectionPool(client);
  tracked.add(client);
  return client;
}

/** Open keyset, plain user. Most samples run as this client. */
export const shopper = (extra?: Partial<PubNub.PubNubConfiguration>): PubNub => createClient('open', 'shopper', extra);
export const friend = (extra?: Partial<PubNub.PubNubConfiguration>): PubNub => createClient('open', 'friend', extra);
/** Never runs sample code. Subscribes and reads to verify effects. Every call returns a new client. */
export const observer = (extra?: Partial<PubNub.PubNubConfiguration>): PubNub =>
  createClient('open', 'observer', extra);

/** Secured keyset with the secret key: grants, revokes. Defaults to the `pam` keyset. */
export function server(role: 'pam' | 'datasync' = 'pam', extra: Partial<PubNub.PubNubConfiguration> = {}): PubNub {
  // heartbeatInterval 0: a server that only signs grants has no use for presence heartbeats.
  return createClient(role, 'staff-server', { secretKey: keysOf(role).secretKey, heartbeatInterval: 0, ...extra });
}

/** Spread into a configuration to point a client at a port where nothing listens. Every request fails at once with a network error. */
export const unreachable = { origin: '127.0.0.1:1', ssl: false } as const;

/** Registers a client the test built by hand (for example the `new PubNub(...)` of a sample). */
export function track<T extends PubNub>(client: T): T {
  tracked.add(client);
  return client;
}

/** Destroys every tracked client. The root hook calls it after each test. */
export function destroyClients(): void {
  // A client at Debug or Trace level logs a dump of its state while it is destroyed, long after its test printed its summary.
  const quiet = quietConsole();
  try {
    destroyAll();
  } finally {
    quiet.restore();
  }
}

function destroyAll(): void {
  for (const client of tracked) {
    try {
      // Drop listeners first so the final unsubscribe status does not fire into a test that already finished.
      client.removeAllListeners();
      client.destroy();
    } catch {
      // A client that failed to build or was destroyed by its test is fine.
    }
  }
  tracked.clear();
}
