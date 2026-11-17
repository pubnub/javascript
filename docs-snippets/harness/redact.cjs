'use strict';
/**
 * Secret masking. Nothing the suite prints or writes may contain a key, locally or in CI. GitHub masks secrets in job logs,
 * but not in uploaded artifacts, and a local terminal has no masking at all, so this module is the protection everywhere.
 *
 * Masked:
 * - the exact values of every configured key (the env names below, plus values registered with `addSecrets`, for example
 *   keys the loader read from a local env file), and their URL-encoded forms (secret keys can contain `+`, `/` and `=`,
 *   which a URL carries as `%2B`, `%2F` and `%3D`). A masked value keeps no characters, only `[redacted]`.
 * - any key shaped like `pub-c-<uuid>`, `sub-c-<uuid>` or `sec-c-<base64>`, and Access Manager tokens, also when
 *   they are URL-encoded.
 *
 * Covered output paths:
 * - `process.stdout` and `process.stderr` writes of any kind (strings, Buffers, any typed array). Writes are buffered up to
 *   the end of the line, so a key split across two writes is masked whole. A partial line is flushed after 100 ms, when the
 *   buffer is large, and at exit.
 * - console output (it goes through those streams), Mocha output, SDK logger output.
 * - an uncaught exception outside Mocha. Node would print it straight to the file descriptor and bypass the streams, so a
 *   handler prints the redacted stack instead. When another handler is installed (Mocha has one while tests run), that
 *   handler owns the error and this one stays out of the way.
 * - files written by the reporter (they call `redact()` before writing).
 *
 * This is a CommonJS file because the Mocha reporter is CommonJS and the harness imports it too.
 */
// Keep in sync with SECRET_NAMES in env.ts (this file is CommonJS and cannot import it).
const KEY_VARS = [
  'PUBLISH_KEY',
  'SUBSCRIBE_KEY',
  'PAM_PUBLISH_KEY',
  'PAM_SUBSCRIBE_KEY',
  'PAM_SECRET_KEY',
  'DS_PUBLISH_KEY',
  'DS_SUBSCRIBE_KEY',
  'DS_SECRET_KEY',
  'PUBNUB_ADMIN_API_KEY',
];
// One character of a base64 or base64url value, plain or URL-encoded.
const B64 = '(?:[A-Za-z0-9_=+/-]|%2[BbFf]|%3[Dd])';
const SHAPES = [
  [/\b(pub|sub)-c-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, (m) => `${m.slice(0, 6)}***`],
  [new RegExp(`\\bsec-c-${B64}{16,}`, 'g'), () => 'sec-c-***'],
  // Access Manager tokens are base64 of a CBOR map whose first field is "v". The first four characters encode the map size,
  // so they differ by shape: `p0F2` for a token without an authorized user id, `qEF2` with one, and so on. This matches every
  // map size from 1 to 23 (`oUF2` to `t0F2`).
  [new RegExp(`\\b[o-t][0EUk]F2${B64}{24,}`, 'g'), () => '[token]'],
];

// Process-wide state. The source tree and the staged copy under .run/<runId>/ each load their own copy of this module, so
// the secret list and the "installed" flag live on a global symbol that every copy shares.
const STATE = Symbol.for('docs-snippets.redaction');
const state = globalThis[STATE] || (globalThis[STATE] = { extra: new Set(), installed: false });
// Secrets that are not env vars (values the loader read from a local env file).
const extra = state.extra;

/** Registers more literal secrets to mask, for example values read from a local env file. */
function addSecrets(values) {
  for (const value of values) if (typeof value === 'string' && value.trim().length >= 8) extra.add(value.trim());
}

/** Every literal form of a secret that can appear in output: the value and its URL-encoded form. */
function forms(value) {
  const out = [value];
  const encoded = encodeURIComponent(value);
  if (encoded !== value) out.push(encoded, encoded.toLowerCase());
  return out;
}

function literalSecrets(env) {
  const out = new Set();
  for (const value of extra) for (const form of forms(value)) out.add(form);
  for (const name of KEY_VARS) {
    const value = env[name];
    if (value && value.trim().length >= 8) for (const form of forms(value.trim())) out.add(form);
  }
  // Longest first, so a secret that contains another one is masked whole and not left with a tail.
  return [...out].sort((a, b) => b.length - a.length);
}

/** Literal secrets become `[redacted]`. Shaped keys keep their kind (`pub-c-`, `sub-c-`) and nothing else. */
function redact(text, env = process.env) {
  let out = String(text);
  for (const secret of literalSecrets(env)) out = out.split(secret).join('[redacted]');
  for (const [pattern, replace] of SHAPES) out = out.replace(pattern, replace);
  return out;
}

/** Text of any chunk a stream accepts. Undefined for chunks that carry no text (they pass through unchanged). */
function chunkText(chunk) {
  if (typeof chunk === 'string') return chunk;
  if (Buffer.isBuffer(chunk)) return chunk.toString('utf8');
  if (ArrayBuffer.isView(chunk)) return Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength).toString('utf8');
  return undefined;
}

const FLUSH_MS = 100;
const MAX_PENDING = 16 * 1024;

/** Wraps one stream: buffers to the end of the line, redacts, then writes with the original `write`. */
function wrapStream(stream) {
  const write = stream.write.bind(stream);
  let pending = '';
  let timer;
  const flush = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    if (!pending) return;
    const text = pending;
    pending = '';
    write(redact(text));
  };
  stream.write = (chunk, encoding, callback) => {
    const done = typeof encoding === 'function' ? encoding : callback;
    const text = chunkText(chunk);
    if (text === undefined) return write(chunk, encoding, callback);
    const all = pending + text;
    const end = all.lastIndexOf('\n');
    let result = true;
    if (end === -1) {
      pending = all;
    } else {
      pending = all.slice(end + 1);
      result = write(redact(all.slice(0, end + 1)));
    }
    if (pending.length > MAX_PENDING) flush();
    else if (pending && !timer) {
      timer = setTimeout(flush, FLUSH_MS);
      timer.unref();
    }
    if (done) process.nextTick(done);
    return result;
  };
  return flush;
}

/**
 * Installs the stream wrappers and the uncaught exception fallback. Process-wide and idempotent, which is why every entry
 * point (cli, mocha-entry, provision) calls it first.
 */
function installRedaction() {
  if (state.installed) return;
  state.installed = true;
  const flushers = [process.stdout, process.stderr].map(wrapStream);
  const flushAll = () => flushers.forEach((flush) => flush());
  process.on('beforeExit', flushAll);
  process.on('exit', flushAll);
  process.on('uncaughtException', (error) => {
    // Another handler (Mocha while it runs) owns the error. Only when this is the last one, act like Node, redacted.
    if (process.listenerCount('uncaughtException') > 1) return;
    flushAll();
    const text = error && error.stack ? error.stack : String(error);
    process.stderr.write(`${redact(text)}\n`);
    flushAll();
    process.exit(1);
  });
}

/** The literal secrets currently known (for the reporter self-test only, never print them). */
function knownSecrets(env = process.env) {
  return literalSecrets(env);
}

module.exports = { redact, addSecrets, installRedaction, knownSecrets };
