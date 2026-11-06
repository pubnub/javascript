/**
 * Recorded drop-in for `node:assert/strict`.
 *
 * Page modules import this instead of Node's module (only the import line changed, the calls are the same). Every call
 * behaves exactly like the Node original: same checks, same errors, same return values, and the same TypeScript types,
 * so `assert.ok(x)` still narrows. On top of that each call is written to the recorder (recorder.ts), which is how the run
 * report lists the assertions of every step with their messages.
 *
 * It wraps every function Node exports (`ok`, `equal`, `deepEqual`, `match`, `rejects`, `throws`, `fail`, ...), so a method
 * a step starts using later is recorded without touching this file.
 */
import nodeAssert from 'node:assert/strict';
import { appFrame, recorder, short } from './recorder.js';

type AnyFn = (...args: unknown[]) => unknown;

/** Where the optional message sits for each assertion. The `throws` family takes it last, the others at a fixed position. */
function messageOf(kind: string, args: unknown[]): string | undefined {
  const lastIsMessage = (): string | undefined => {
    const last = args[args.length - 1];
    return args.length > 1 && typeof last === 'string' ? last : undefined;
  };
  switch (kind) {
    case 'ok':
      return typeof args[1] === 'string' ? args[1] : undefined;
    case 'fail':
      return typeof args[0] === 'string' ? args[0] : undefined;
    case 'throws':
    case 'rejects':
    case 'doesNotThrow':
    case 'doesNotReject':
      return lastIsMessage();
    case 'ifError':
      return undefined;
    default:
      // equal, notEqual, deepEqual, strictEqual, match, ... take (actual, expected, message).
      return typeof args[2] === 'string' ? args[2] : undefined;
  }
}

/** The label of an assertion: its message, or a generated line that shows what was compared. */
function labelOf(kind: string, args: unknown[]): string {
  const message = messageOf(kind, args);
  if (message) return message;
  switch (kind) {
    case 'ok':
      return `ok: ${short(args[0])}`;
    case 'match':
    case 'doesNotMatch':
      return `${kind}: ${short(args[0])} against ${short(args[1])}`;
    case 'throws':
    case 'rejects':
    case 'doesNotThrow':
    case 'doesNotReject':
      return `${kind}: ${typeof args[1] === 'function' || args[1] instanceof RegExp || typeof args[1] === 'object' ? 'with the expected error' : 'any error'}`;
    case 'fail':
      return 'fail';
    default:
      return `${kind}: ${short(args[0], 50)} and ${short(args[1], 50)}`;
  }
}

/** Records a failed assertion with the values and the first frame inside the suite. */
function recordFailure(kind: string, args: unknown[], error: unknown, callSite: Error | undefined): void {
  const e = error as { actual?: unknown; expected?: unknown; stack?: string };
  recorder.record({
    kind,
    label: labelOf(kind, args),
    ok: false,
    actual: 'actual' in (e ?? {}) ? short(e.actual, 200) : undefined,
    expected: 'expected' in (e ?? {}) ? short(e.expected, 200) : undefined,
    frame: appFrame(e?.stack) ?? appFrame(callSite?.stack),
  });
}

function wrap(kind: string, fn: AnyFn): AnyFn {
  return function recordedAssertion(...args: unknown[]): unknown {
    // A rejected async assertion loses the caller in its stack, so remember the call site up front (async kinds only).
    const callSite = kind === 'rejects' || kind === 'doesNotReject' ? new Error() : undefined;
    let result: unknown;
    try {
      result = fn.apply(nodeAssert, args);
    } catch (error) {
      recordFailure(kind, args, error, callSite);
      throw error;
    }
    if (result instanceof Promise) {
      return result.then(
        (value) => {
          recorder.record({ kind, label: labelOf(kind, args), ok: true });
          return value;
        },
        (error) => {
          recordFailure(kind, args, error, callSite);
          throw error;
        },
      );
    }
    recorder.record({ kind, label: labelOf(kind, args), ok: true });
    return result;
  };
}

// `assert(value, message)` is `assert.ok`. Every other export that is a function gets the same wrapper, except classes
// (AssertionError) and the `strict` self-reference.
const recorded = wrap('ok', nodeAssert as unknown as AnyFn) as AnyFn & Record<string, unknown>;
for (const [name, member] of Object.entries(nodeAssert)) {
  if (typeof member !== 'function' || name === 'strict' || /^[A-Z]/.test(name)) continue;
  recorded[name] = wrap(name, member as AnyFn);
}
recorded.AssertionError = nodeAssert.AssertionError;
recorded.strict = recorded;

// Typed as the Node module so every assertion signature (including `asserts value`) is kept.
export const assert: typeof nodeAssert = recorded as unknown as typeof nodeAssert;
export default assert;
