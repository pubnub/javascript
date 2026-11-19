/** Console capture for samples that report through `console`. Call `restore()` when the sample is done (in a `finally` when it can throw). */
export interface ConsoleCapture {
  lines: string[];
  restore(): void;
}

const active = new Set<() => void>();

export function captureConsole(method: 'log' | 'info' | 'debug' | 'warn' | 'error' = 'log'): ConsoleCapture {
  const original = console[method];
  const lines: string[] = [];
  console[method] = (...args: unknown[]) => {
    lines.push(args.map((a) => (typeof a === 'string' ? a : safeJson(a))).join(' '));
  };
  const restore = (): void => {
    console[method] = original;
    active.delete(restore);
  };
  active.add(restore);
  return { lines, restore };
}

/** Undoes every capture that is still active, newest first. The root hook calls it after each test, so a test that failed before its own `restore()` cannot leave the console muted. */
export function restoreAllConsoles(): void {
  for (const restore of [...active].reverse()) restore();
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * Silences log, info, debug, warn and error. Use it while a client logs at Debug or Trace level: the SDK prints its
 * configuration, which holds the keys. `lines` has everything printed meanwhile. Call `restore()` in a `finally`.
 */
export function quietConsole(): ConsoleCapture {
  const captures = (['log', 'info', 'debug', 'warn', 'error'] as const).map((method) => captureConsole(method));
  return {
    get lines() {
      return captures.flatMap((capture) => capture.lines);
    },
    restore: () => captures.forEach((capture) => capture.restore()),
  };
}
