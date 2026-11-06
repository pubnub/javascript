import PubNub from 'pubnub';
import type { SecuredKeyset } from './env.js';

/**
 * Fail-safe revoke of the application-level Access Manager (v2) grant.
 *
 * The `grantAllChannelsAllAuthKeys` sample grants read to everybody on the keyset. If a run dies between that grant
 * and its revoke, the secured keyset stays open to strangers for the grant ttl (1440 minutes). So the revoke exists
 * in four places: the step's own `finally`, the Mocha root `before` and `after` hooks, the janitor, and the signal handlers
 * (they run the janitor). Every call retries and a final failure is loud. The `pam` and `datasync` keysets are shared with
 * the SDK's other CI jobs, which is why the hooks also prove that a stranger is refused before and after the suite.
 */

// Backoff is linear (1 s, 2 s, ...). The revoke is a single idempotent call, so retrying is safe, unlike a publish.
const SLEEP = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * `grant({ read: false, write: false, ttl: 1 })` on a secret-key client replaces the application-level Access Manager (v2)
 * rights with none, which closes what `grantAllChannelsAllAuthKeys` opened. Throws after the last attempt, after a loud console warning
 * that tells a human how to close the keyset by hand.
 */
export async function revokeApplicationGrant(client: PubNub, attempts = 3, delayMs = 1_000): Promise<void> {
  let last: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await client.grant({ read: false, write: false, ttl: 1 });
      return;
    } catch (error) {
      last = error;
      if (attempt < attempts) await SLEEP(delayMs * attempt);
    }
  }
  const detail = last instanceof Error ? last.message : String(last);
  console.error(
    '\n!!! WARNING !!! The application-level grant on the secured keyset could NOT be revoked after ' +
      `${attempts} attempts (${detail}). The keyset may be OPEN for reads until the grant ttl runs out (up to 1440 minutes). ` +
      'Run `npm run test:docs-snippets:janitor` or revoke it in the Admin Portal now.\n',
  );
  throw new Error(`could not revoke the application-level grant on the secured keyset: ${detail}`);
}

/** Revokes with a short-lived client of its own. Used by the root hook, the janitor and the signal handlers. */
// Own client: the world's `server` client may already be destroyed (signal path) or never built (root `before` hook).
export async function revokeApplicationGrantOnKeyset(secured: SecuredKeyset, tag: string, attempts = 3): Promise<void> {
  const client = new PubNub({ ...secured, userId: `janitor-am-${tag}`, logLevel: PubNub.LogLevel.None, heartbeatInterval: 0 });
  try {
    await revokeApplicationGrant(client, attempts);
  } finally {
    client.destroy();
  }
}

/** True when the SDK error says the keyset refused the call for lack of permission (HTTP 403, access denied category). */
function isAccessDenied(error: unknown): boolean {
  const status = (error as { status?: { category?: string; statusCode?: number } } | undefined)?.status;
  return status?.category === 'PNAccessDeniedCategory' || status?.statusCode === 403;
}

/** What one probe saw. `unknown` means it got an answer that proves nothing (network error, timeout, 5xx, 400). */
export interface ProbeResult {
  /** What a client without a token could do. Empty when the keyset refused both. */
  open: string[];
  /** Answers that were neither a success nor a 403. */
  unknown: string[];
}

/**
 * Asks the keyset whether a client with NO token and NO auth key can publish or read. Only two answers count: success (the
 * keyset is open for that) and 403 / PNAccessDeniedCategory (closed). Anything else, a network error, a timeout, a 5xx or a
 * 400, is `unknown`: it says nothing about enforcement, so it must never pass as "closed".
 *
 * Publish needs the write permission, read (`fetchMessages`) needs read. The application-level sample grants read only, so
 * the read probe is the one that notices it. The keysets this runs against have Message Persistence on (README, "Features
 * each keyset needs"), so a refused read is a 403 and not a 400.
 */
export async function tokenlessAccess(probe: PubNub, channel: string): Promise<ProbeResult> {
  const result: ProbeResult = { open: [], unknown: [] };
  const attempt = async (label: string, call: () => Promise<unknown>): Promise<void> => {
    try {
      await call();
      result.open.push(label);
    } catch (error) {
      if (!isAccessDenied(error)) result.unknown.push(`${label}: ${describe(error)}`);
    }
  };
  await attempt('publish', () => probe.publish({ channel, message: { probe: true } }));
  await attempt('read', () => probe.fetchMessages({ channels: [channel], count: 1 }));
  return result;
}

function describe(error: unknown): string {
  const e = error as { message?: string; status?: { category?: string; statusCode?: number } };
  return `${e?.message ?? String(error)} [${e?.status?.category ?? ''} ${e?.status?.statusCode ?? ''}]`.trim();
}

/**
 * Closes the application-level grant and then WAITS until the keyset really enforces Access Manager.
 *
 * Why waiting is needed: Access Manager (v2) grants and revokes take up to about 60 seconds to propagate. A previous run
 * (or a run that was cancelled) may have left a grant, and the revoke only starts the clock. A step that expects a 403 for a
 * tokenless client, such as `publishHandleErrors`, would otherwise fail on a keyset that still behaves as open. The probe
 * is a tokenless client (no secret key, no auth key) on a channel no run ever grants, so a grant of the same run cannot hide it.
 *
 * Throws with a message that names the cause when the keyset is still open after `timeoutMs`.
 * Returns how long it took (`attempts` 1 means it was closed right away).
 */
export async function closeAndVerifyApplicationGrant(
  secured: SecuredKeyset,
  tag: string,
  options: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<{ attempts: number; ms: number }> {
  const timeoutMs = options.timeoutMs ?? 120_000;
  const intervalMs = options.intervalMs ?? 3_000;
  await revokeApplicationGrantOnKeyset(secured, tag);
  const started = Date.now();
  let attempts = 0;
  let last = '';
  for (;;) {
    attempts += 1;
    // A fresh client (no secret key, no auth key, no token) on a fresh channel each attempt: only an application-level grant
    // can let it through, because no run ever grants this channel name.
    const probe = new PubNub({
      publishKey: secured.publishKey,
      subscribeKey: secured.subscribeKey,
      userId: `janitor-probe-${tag}-${attempts}`,
      logLevel: PubNub.LogLevel.None,
      heartbeatInterval: 0,
    });
    let seen: ProbeResult;
    try {
      seen = await tokenlessAccess(probe, `docs-snippets-probe-${tag}-${Date.now().toString(36)}-${attempts}`);
    } finally {
      probe.destroy();
    }
    // Closed only when both probes got a 403. An unknown answer is retried like an open one, never taken as closed.
    if (seen.open.length === 0 && seen.unknown.length === 0) return { attempts, ms: Date.now() - started };
    last = [
      seen.open.length > 0 ? `a client without a token could ${seen.open.join(' and ')}` : '',
      seen.unknown.length > 0 ? `no clear answer: ${seen.unknown.join('; ')}` : '',
    ]
      .filter(Boolean)
      .join(', ');
    if (Date.now() + intervalMs - started > timeoutMs) break;
    await SLEEP(intervalMs);
  }
  throw new Error(
    `could not prove that the secured keyset enforces Access Manager ${Math.round((Date.now() - started) / 1000)} s after the application-level grant was revoked (${last}). ` +
      'Steps that expect a 403 for a client without a token would fail. A grant from an earlier run is probably still effective: ' +
      'revoke and grant changes take up to about 60 seconds to propagate, but a grant whose revoke failed lasts up to 1440 minutes. ' +
      'Run `npm run test:docs-snippets:janitor`, check the keyset in the Admin Portal (Access Manager must be on), then run again.',
  );
}
