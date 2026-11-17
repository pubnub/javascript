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

/**
 * True for the answer a DataSync create gets when the id already exists: HTTP 409 with the service code DS-0301 in the error
 * body (`status.errorData`, for example `{ errors: [{ errorCode: 'DS-0301', ... }] }`; see the duplicate create test in
 * api-reference/datasync.test.ts).
 */
export function isAlreadyExists(error: unknown): boolean {
  if (statusCode(error) !== 409) return false;
  const data = (error as { status?: { errorData?: unknown } } | undefined)?.status?.errorData;
  try {
    return JSON.stringify(data ?? {}).includes('DS-0301');
  } catch {
    return false;
  }
}

/**
 * Creates a DataSync object whose id is unique to this run (`freshId`, `projectionId`) and tolerates a transient service error.
 *
 * A create is not idempotent, so a plain retry is unsafe: when the first attempt was stored but its answer was lost (a 5xx after
 * the write, a timeout), the retry meets the object it just created and gets 409 (DS-0301). With an id nobody else can hold,
 * that 409 can only mean "the earlier attempt was stored", so it counts as success, and the object is read back (`readBack`, a get
 * by id) so the caller still gets the eTag and timestamps the create would have returned.
 *
 * - failure of the FIRST attempt that is not transient (including a 409, which means the id was not unique): thrown at once.
 * - transient failure (`isTransient`): retried like `retryTransient`, up to `attempts` tries (default 3).
 * - 409 / DS-0301 on a RETRY: resolved through `readBack` (itself retried on transient errors). Never on the first attempt.
 * - any other failure of a retry (403, 400, ...): thrown.
 *
 * Use it for setup, and for a create that only triggers an event the test then asserts on. Never inside a documentation sample
 * (those use fixed literal ids, where a 409 means a leftover and must fail). Logs one line per retry and one when the 409 path
 * resolves; ids, payloads and keys are never logged.
 */
export async function createWithRunUniqueId<T>(
  create: () => Promise<T>,
  readBack: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const backoff = options.backoff ?? 500;
  const label = options.label ?? 'create';
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await create();
    } catch (error) {
      if (attempt > 1 && isAlreadyExists(error)) {
        console.log(
          `createWithRunUniqueId: ${label} answered 409 DS-0301 on attempt ${attempt} of ${attempts}: ` +
            'an earlier attempt was stored, reading the object back',
        );
        return retryTransient(readBack, { ...options, label: `${label} read-back` });
      }
      if (attempt >= attempts || !isTransient(error)) throw error;
      console.log(
        `createWithRunUniqueId: ${label} failed (attempt ${attempt} of ${attempts}, ` +
          `category ${categoryOf(error) ?? 'none'}, status ${statusCode(error) ?? 'none'}), retrying`,
      );
      await pause(backoff * attempt);
    }
  }
}

/**
 * Seeds state on a channel with a run-unique name and, when a seeding call fails transiently, throws that channel away and runs
 * the whole seeding again on a new one (up to `attempts` tries, default 3). Nothing else depends on the channel name, and the
 * tests that use it assert exact counts of what the seeding wrote, so a half-written channel must never be reused: a publish that
 * was stored although its answer was lost would add one message, and a plain retry would add another. Only the seeding is
 * covered. The call a test asserts on stays outside and is never retried. Returns the channel that was seeded and what `seed` returned.
 */
export async function seedOnFreshChannel<T>(
  newChannel: () => string,
  seed: (channel: string) => Promise<T>,
  options: RetryOptions = {},
): Promise<{ channel: string; result: T }> {
  const attempts = options.attempts ?? 3;
  const backoff = options.backoff ?? 500;
  for (let attempt = 1; ; attempt += 1) {
    const channel = newChannel();
    try {
      return { channel, result: await seed(channel) };
    } catch (error) {
      if (attempt >= attempts || !isTransient(error)) throw error;
      console.log(
        `seedOnFreshChannel: ${options.label ?? 'seed'} failed (attempt ${attempt} of ${attempts}, ` +
          `category ${categoryOf(error) ?? 'none'}, status ${statusCode(error) ?? 'none'}), starting again on a new channel`,
      );
      await pause(backoff * attempt);
    }
  }
}
