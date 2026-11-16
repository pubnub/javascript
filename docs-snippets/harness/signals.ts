/**
 * SIGINT and SIGTERM handlers. A killed run must not leave a secured keyset open or leak resources, so the handler runs the
 * cleanup, then exits with the conventional code.
 *
 * A cancelled GitHub Actions job gets SIGINT, then SIGTERM about 7.5 s later, then SIGKILL about 2.5 s after that. So:
 * - `urgent` runs first and alone: it revokes the application-level Access Manager grants, a single quick call per keyset.
 *   That is what must finish before SIGKILL.
 * - `cleanup` (janitor, client teardown) runs after it.
 * - SIGTERM never skips the cleanup. Only a second SIGINT (a person pressing Ctrl-C twice) exits at once.
 *
 * Exit codes follow the shell convention 128 + signal number (SIGINT 2 -> 130, SIGTERM 15 -> 143), so CI sees a cancel as
 * such. `budgetMs` (100 s) caps the whole cleanup so a hung janitor cannot keep a cancelled job alive.
 */
// Written straight to stderr, not through `console`: a cancel lands in the middle of a step, while quiet.ts collects console
// output, and these lines must be seen. stderr still goes through the redaction (redact.cjs).
const say = (line: string): void => {
  process.stderr.write(`${line}\n`);
};

// One Ctrl-C or one CI cancel reaches this process more than once: the signal goes to the whole process group, and the
// launchers in between (npm, tsx) relay it to their child too. A repeat inside this window is the same signal, not a second
// Ctrl-C.
const SAME_SIGNAL_MS = 2_000;

export function installShutdown(urgent: () => Promise<void>, cleanup: () => Promise<void>, budgetMs = 100_000): void {
  let running = false;
  let code = 0;
  let firstAt = 0;
  // In CI no signal may skip the cleanup: a cancel must never leave a keyset open.
  const ci = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);
  const handle = (signal: NodeJS.Signals, signalCode: number): void => {
    if (running) {
      if (signal === 'SIGINT' && !ci && Date.now() - firstAt > SAME_SIGNAL_MS) {
        say('SIGINT again, exiting without waiting for cleanup');
        process.exit(signalCode);
      }
      if (Date.now() - firstAt > SAME_SIGNAL_MS) say(`${signal} received while cleaning up, the cleanup continues`);
      return;
    }
    running = true;
    firstAt = Date.now();
    code = signalCode;
    say(`
${signal} received: revoking Access Manager grants first, then cleaning up. Press Ctrl-C again to skip.`);
    const timer = setTimeout(() => {
      say('cleanup took too long, exiting');
      process.exit(code);
    }, budgetMs);
    const step = async (label: string, fn: () => Promise<void>): Promise<void> => {
      try {
        await fn();
      } catch (error) {
        say(`${label} failed: ${(error as Error)?.message ?? error}`);
      }
    };
    void (async () => {
      await step('revoke', urgent);
      await step('cleanup', cleanup);
      clearTimeout(timer);
      process.exit(code);
    })();
  };
  process.on('SIGINT', () => handle('SIGINT', 130));
  process.on('SIGTERM', () => handle('SIGTERM', 143));
}
