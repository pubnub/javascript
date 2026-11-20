/**
 * Makes a rejected PubNub SDK call explain itself in the failure list.
 *
 * The SDK rejects most service failures with the generic message "REST API request processing error, check status for details".
 * What explains the failure (category, HTTP status, operation, the service's own error body) sits on `error.status`, which the
 * Mocha reporter never prints. `explainSdkError(err)` finds the SDK error (the error itself, or one on its `.cause` chain, which
 * is where `eventually` and `settled` keep the last failure) and appends a two line summary to the message of the error that
 * Mocha reports. It also puts the new message into the stack header, because Mocha's reporter splits message from stack by
 * looking the message up in the stack and drops the "Caused by" section when it cannot find it.
 *
 * Nothing else about the error changes: same object, same class, same stack frames, same `.cause`. The summary goes through
 * `redact()` (keys of the environment, key-shaped and token-like strings) and through `scrub()` below (URLs are cut to their
 * path without the query, values of key/token/auth/signature fields are masked).
 *
 * It is wired once, for every test and every hook of both npm scripts, in support/hooks.ts.
 */
import { redact } from './env';

type SdkStatusLike = {
  category?: unknown;
  statusCode?: unknown;
  operation?: unknown;
  errorData?: unknown;
};

const MAX_DETAIL = 500;
const MAX_DEPTH = 6;

/** Errors already annotated, so one error object that Mocha reports twice (test and hook) is annotated once. */
const annotated = new WeakSet<object>();

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/** The status an SDK error carries: `error.status` (PubNubError) or the error itself when it has the status fields (PubNubAPIError). */
function sdkStatusOf(error: Record<string, unknown>): SdkStatusLike | undefined {
  const status = error.status;
  if (isObject(status) && ('category' in status || typeof status.statusCode === 'number')) return status;
  if (typeof error.category === 'string' && typeof error.statusCode === 'number') return error;
  return undefined;
}

/** Walks `err` and its `.cause` chain and returns the first SDK status found. */
function findSdkStatus(err: unknown): SdkStatusLike | undefined {
  const seen = new Set<unknown>();
  let current: unknown = err;
  for (let depth = 0; depth < MAX_DEPTH && isObject(current) && !seen.has(current); depth += 1) {
    seen.add(current);
    const status = sdkStatusOf(current);
    if (status) return status;
    current = current.cause;
  }
  return undefined;
}

/** Cuts every URL to its path (no host, no query, no fragment: queries carry keys and signatures). */
function stripUrls(text: string): string {
  return text.replace(/\bhttps?:\/\/[^\s"'<>)\]]+/gi, (url) => {
    try {
      return `<url ${new URL(url).pathname}>`;
    } catch {
      return '<url>';
    }
  });
}

/** Masks the value of fields and query parameters whose name says they are credentials. */
function maskCredentialFields(text: string): string {
  const name =
    '(?:auth(?:Key|Token)?|token|signature|sig|secret(?:Key)?|publish(?:Key)?|subscribe(?:Key)?|cipher(?:Key)?|password|api[-_]?key|access[-_]?key)';
  return text
    .replace(new RegExp(`("${name}"\\s*:\\s*)"[^"]*"`, 'gi'), '$1"***"')
    .replace(new RegExp(`(\\b${name}\\s*[=:]\\s*)[^\\s,&"'}]+`, 'gi'), '$1***');
}

/** `redact()` first (it knows the exact keys of this run), then the pattern based scrubbing. */
function scrub(text: string): string {
  return maskCredentialFields(stripUrls(redact(text)));
}

function compact(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '[unserializable error data]';
  }
}

/** The two line summary of the SDK status, or undefined when `err` is not (and does not wrap) an SDK error. */
export function summarizeSdkError(err: unknown): string | undefined {
  const status = findSdkStatus(err);
  if (!status) return undefined;
  const head =
    `PubNub SDK status: category=${String(status.category ?? 'n/a')} statusCode=${String(status.statusCode ?? 'n/a')} ` +
    `operation=${String(status.operation ?? 'n/a')}`;
  let detail = compact(status.errorData).replace(/\s+/g, ' ').trim();
  if (detail.length > MAX_DETAIL) detail = `${detail.slice(0, MAX_DETAIL)}... [truncated]`;
  return scrub(detail ? `${head}\n  service said: ${detail}` : `${head}\n  service said: (no error data)`);
}

/**
 * Appends the SDK summary to `err.message` and to the message in `err.stack`. No-op for anything that is not an SDK error or
 * does not wrap one, for an error already annotated, and when the error cannot be modified. Never throws.
 */
export function explainSdkError(err: unknown): void {
  try {
    if (!(err instanceof Error) || annotated.has(err)) return;
    const summary = summarizeSdkError(err);
    if (!summary) return;
    annotated.add(err);
    const original = err.message;
    // Read the stack before touching the message: V8 may format the header lazily, on the first read.
    const stackBefore = err.stack;
    // Mocha prints the first line of the message after 5 spaces, so the continuation lines line up under it.
    const message = `${original}\n${summary.replace(/^/gm, '     ')}`;
    err.message = message;
    if (typeof stackBefore === 'string' && original && !String(err.stack).includes(message)) {
      err.stack = stackBefore.replace(original, () => message);
    }
  } catch {
    /* explaining a failure must never change or hide it */
  }
}
