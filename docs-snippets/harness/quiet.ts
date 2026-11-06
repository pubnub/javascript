/**
 * Keeps the console quiet while steps run, without losing anything.
 *
 * Why: docs snippets create clients with `logLevel: Debug` or `Trace` and the SDK's default console logger prints every
 * entry (`PubNub-00ead8ce Trace EventEngine Leave all with parameters`), also later when `world.dispose()` destroys the
 * client. A run with hundreds of such lines hides the Mocha result and is hard to redact by eye. The lines are not noise to
 * the steps that assert them, those steps replace `console` themselves (`world.captureConsole`) or pass a `loggers` array.
 *
 * How: this module replaces the console methods ONCE per process with thin wrappers. While muted a wrapper stores the formatted
 * line (a step can fetch them with `unmute()`), otherwise it calls the original. The wrappers are never removed, because
 * `world.captureConsole` saves "the current console method" and restores it later, and that must stay valid.
 * The stdout/stderr redaction (redact.cjs) is untouched: whatever finally prints is still masked, and the lines kept for the
 * report are masked by the reporter.
 *
 * Off switch: set `DOCS_SNIPPETS_LOG_LEVEL` (you asked for logs) or `DOCS_SNIPPETS_VERBOSE=1` and nothing is muted.
 */
import { format } from 'node:util';

const METHODS = ['log', 'info', 'debug', 'warn', 'error', 'trace'] as const;
type Method = (typeof METHODS)[number];

let installed = false;
let enabled = true;
let muted = false;
let buffer: string[] = [];
// A Trace logger can print thousands of lines per step. Only the newest KEEP lines are stored, the total is still counted.
const KEEP = 500;
let total = 0;
const originals = {} as Record<Method, (...args: unknown[]) => void>;

/** Installs the wrappers. Idempotent. `enabled` false means "never mute" (you want to see the logs). */
export function installQuiet(options: { enabled: boolean }): void {
  enabled = options.enabled;
  if (installed) return;
  installed = true;
  for (const method of METHODS) {
    originals[method] = console[method].bind(console) as (...args: unknown[]) => void;
    console[method] = (...args: unknown[]): void => {
      if (muted && enabled) {
        total += 1;
        buffer.push(`[console.${method}] ${format(...args)}`);
        if (buffer.length > KEEP) buffer.shift();
      }
      else originals[method](...args);
    };
  }
}

/** Starts collecting console output instead of printing it. */
export function mute(): void {
  muted = true;
  buffer = [];
  total = 0;
}

/** Stops collecting and returns the newest collected lines since `mute()` and how many lines there were in total. */
export function unmute(): { lines: string[]; total: number } {
  muted = false;
  const lines = buffer;
  const count = total;
  buffer = [];
  total = 0;
  return { lines, total: count };
}
