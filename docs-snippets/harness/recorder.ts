/**
 * Assertion recorder: remembers every assertion a step executed, so the run report can show what a step really checked.
 *
 * Why it exists: the JSON report used to say "passed" or "failed" per step and nothing about what the step proved. A human
 * reading a green run could not tell a step with ten assertions from a step with none. `harness/assert.ts` (the recorded
 * drop-in for `node:assert/strict`) and the wait helpers (`eventually`, `expectEvent`, `connected`) call `record()`, the
 * Mocha binding (mocha-entry.ts) brackets each step with `begin()` and `end()` and hands the result to reporter.cjs.
 *
 * Two details worth knowing:
 * - Polling. `eventually` runs its callback many times and most attempts fail on purpose. Each attempt records into a private
 *   buffer (AsyncLocalStorage, so unrelated timers cannot leak into it). Only the buffer of the attempt that passed is kept.
 * - Size. Repeated identical entries collapse into one entry with a count, and a step keeps at most MAX_ENTRIES entries.
 *
 * Nothing here changes whether an assertion passes. It only observes.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { inspect } from 'node:util';
import { redact } from './redact.cjs';

/** One assertion (or one wait that behaves like one) as the report shows it. */
export interface AssertionRecord {
  /** `equal`, `deepEqual`, `ok`, `match`, `rejects`, `eventually`, `event`, `connected` and so on. */
  kind: string;
  /** The message the step gave, or a generated one that shows the values. */
  label: string;
  ok: boolean;
  /** How many identical consecutive assertions this entry stands for. */
  count: number;
  /** Failed assertions only: the values the assertion compared, already shortened. */
  expected?: string;
  actual?: string;
  /** Failed assertions only: the first stack frame inside the suite, as `file:line:column`. */
  frame?: string;
}

const MAX_ENTRIES = 200;

/** Shortens any value for a report line. Never throws, never prints more than `max` characters. */
export function short(value: unknown, max = 80): string {
  let text: string;
  try {
    // No maxStringLength: inspect would cut a long string inside an object, and a key cut in half escapes redaction.
    text = typeof value === 'string' ? JSON.stringify(value) : inspect(value, { depth: 2, breakLength: Infinity, maxArrayLength: 8 });
  } catch {
    text = String(value);
  }
  // Redact the whole text first, then shorten, so no key can be cut into a piece that matches neither its value nor its shape.
  text = redact(text);
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

/**
 * First stack frame that belongs to the suite (a page module, shared snippet or helper) and not to the recording layer, Node
 * or a dependency. The staged copy lives in `.run/<runId>/`, the prefix is cut so the frame names the source file, whose
 * line numbers are the same (the stage rewrite changes string literals only, never lines).
 */
export function appFrame(stack: string | undefined): string | undefined {
  if (!stack) return undefined;
  for (const line of stack.split('\n').slice(1)) {
    if (/node:internal|node_modules|harness\/(assert|recorder)\./.test(line)) continue;
    const match = /\(?((?:file:\/\/)?[^()\s]+:\d+:\d+)\)?\s*$/.exec(line.trim());
    if (!match) continue;
    return match[1].replace(/^file:\/\//, '').replace(/^.*?\.run\/[0-9a-z]+\//, '').replace(/^.*?\/docs-snippets\//, '');
  }
  return undefined;
}

class Recorder {
  private entries: AssertionRecord[] | undefined;
  private dropped = 0;
  /** Assertions recorded into the running step so far, merged and dropped ones included. The honesty check reads it. */
  total = 0;
  private readonly scope = new AsyncLocalStorage<AssertionRecord[]>();

  /** Starts a fresh list for the step that is about to run. */
  begin(): void {
    this.entries = [];
    this.dropped = 0;
    this.total = 0;
  }

  /** Returns what the step recorded and stops recording. `dropped` counts entries beyond the cap. */
  end(): { assertions: AssertionRecord[]; dropped: number } {
    const result = { assertions: this.entries ?? [], dropped: this.dropped };
    this.entries = undefined;
    this.dropped = 0;
    return result;
  }

  /** Adds an entry to the current polling attempt if there is one, otherwise to the running step. */
  record(entry: Omit<AssertionRecord, 'count'>): void {
    this.push(this.scope.getStore() ?? this.entries, { ...entry, count: 1 });
  }

  /** Appends already finished entries (the passing attempt of a poll) to the current list. */
  commit(buffer: AssertionRecord[]): void {
    const target = this.scope.getStore() ?? this.entries;
    for (const entry of buffer) this.push(target, entry);
  }

  /** Runs `fn` with a private buffer, so its failed attempts can be thrown away. */
  attempt<T>(buffer: AssertionRecord[], fn: () => T): T {
    return this.scope.run(buffer, fn);
  }

  private push(target: AssertionRecord[] | undefined, entry: AssertionRecord): void {
    if (!target) return;
    if (target === this.entries) this.total += entry.count;
    const last = target[target.length - 1];
    if (last && last.kind === entry.kind && last.label === entry.label && last.ok === entry.ok && entry.ok) {
      last.count += entry.count;
      return;
    }
    if (target.length >= MAX_ENTRIES && target === this.entries) {
      this.dropped += entry.count;
      return;
    }
    target.push(entry);
  }
}

/** One recorder per process. The staged mocha-entry and the staged page modules share this instance. */
export const recorder = new Recorder();
