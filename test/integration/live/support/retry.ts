/**
 * Retry for SETUP and CLEANUP code only: seeding, resets, the janitor. It never wraps a snippet, an assertion about a sample's
 * effect, or a call whose failure is what the test asserts. The tier runs with Mocha `retries: 0` on purpose.
 *
 * What counts as transient (shapes from src/errors/pubnub-api-error.ts):
 * - a rejected PubNub call is a `PubNubError` whose `status` carries `category` and `statusCode`; a callback style status and
 *   a janitor `fetch` error carry them directly. HTTP 5xx and 429 are transient, any other code (400, 403, 404, 409, ...) is final.
 * - without an HTTP code (statusCode 0 or missing) the category decides: PNNetworkIssuesCategory, PNTimeoutCategory,
 *   PNServerErrorCategory and PNUnknownCategory (a transport failure the SDK could not classify) are transient. Cancelled,
 *   bad request, access denied, validation and malformed response are not.
 * - a plain Error that is a transport failure (undici "fetch failed", ECONNRESET, ETIMEDOUT, ...) is transient. Anything else is
 *   not: an AssertionError, a TypeError, a validation error thrown before a request is sent.
 *
 * A retried write can have reached the service although its answer was lost (a 5xx after the write, a timeout), so a retried
 * publish may be stored twice. Callers that count what is stored must tolerate or remove such a duplicate (see seeding in
 * api-reference/message-persistence-legacy.test.ts).
 */

export interface RetryOptions {
  /** Total tries including the first. Default 3. */
  attempts?: number;
  /** Names the call in the log line. Never put keys, tokens or payloads in it. */
  label?: string;
  /** Base of the backoff in milliseconds: base * attempt. Default 500. */
  backoff?: number;
}

type ErrorLike = {
  name?: string;
  code?: unknown;
  message?: string;
  cause?: { code?: unknown };
  statusCode?: number;
  category?: string;
  status?: { statusCode?: number; category?: string };
};

export function statusCode(error: unknown): number | undefined {
  const e = error as ErrorLike | undefined;
  return e?.status?.statusCode ?? e?.statusCode;
}

export function categoryOf(error: unknown): string | undefined {
  const e = error as ErrorLike | undefined;
  return e?.status?.category ?? e?.category;
}

const TRANSIENT_CATEGORIES = new Set([
  'PNNetworkIssuesCategory',
  'PNTimeoutCategory',
  'PNServerErrorCategory',
  'PNUnknownCategory',
]);
const TRANSPORT =
  /fetch failed|socket hang up|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|ENETUNREACH|UND_ERR/i;

export function isTransient(error: unknown): boolean {
  const e = error as ErrorLike | undefined;
  if (!e || e.name === 'AssertionError' || e.code === 'ERR_ASSERTION') return false;
  const code = statusCode(error);
  if (code !== undefined && code > 0) return code >= 500 || code === 429;
  const category = categoryOf(error);
  if (category !== undefined) return TRANSIENT_CATEGORIES.has(category);
  return TRANSPORT.test(`${e.message ?? ''} ${String(e.code ?? '')} ${String(e.cause?.code ?? '')}`);
}

const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs `fn`; on a transient failure waits `backoff * attempt` ms and runs it again, up to `attempts` tries. Logs one line per retry. */
export async function retryTransient<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const attempts = options.attempts ?? 3;
  const backoff = options.backoff ?? 500;
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= attempts || !isTransient(error)) throw error;
      const code = statusCode(error);
      console.log(
        `retryTransient: ${options.label ?? 'call'} failed (attempt ${attempt} of ${attempts}, ` +
          `category ${categoryOf(error) ?? 'none'}, status ${code ?? 'none'}), retrying`,
      );
      await pause(backoff * attempt);
    }
  }
}
