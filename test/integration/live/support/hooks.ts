/**
 * Mocha root hooks of the live tier (loaded by .mocharc.cjs).
 *
 * before all: key check (the open keyset must be set; a run without --grep and without file arguments needs the pam and datasync
 *   keysets too, see `isFullRun`), then the janitor (cleans every resource of resources.ts), then, on a
 *   secured keyset, a wait until a client without a token is refused again, then the preflight (keyset features).
 *   A cleanup failure here FAILS the run with a message that lists what could not be removed: the tests assume a clean slate.
 * after each: restores the console if a test left it captured, then destroys every tracked client.
 * after all: the janitor again. Its failures are printed loudly but do NOT fail the run (the test results stay what they are, and
 *   the next run's "before all" cleanup retries and fails the run when the keyset is still dirty). One exception: a failed revoke of
 *   the application-level Access Manager grant leaves a secured keyset open, so it fails the run.
 *
 * failure explanation: every failure of a test or of a hook (before, beforeEach, after, ...) that is, or wraps through `.cause`, a
 *   PubNub SDK error gets the SDK's status (category, status code, operation, the service's error data) appended to its message,
 *   so the failure list at the end of the run explains itself. See explain-error.ts. Installed for both npm scripts.
 *
 * The endpoint tests (`.mocharc.endpoints.cjs`, LIVE_TIER=endpoints) check no role up front: a test fails with a "missing keys"
 * message (env names) when the role it builds a client for is not set. Janitor and preflight default to off there.
 *
 * `LIVE_JANITOR=off` skips both cleanups (use it for a single page with `--grep`: a full pass costs about the time
 * reported in the README). `LIVE_PREFLIGHT=off` skips the preflight.
 */
import { destroyClients } from './clients';
import { restoreAllConsoles } from './console';
import { describeRoles, env, janitorEnabled, preflightEnabled, redact, ROLES } from './env';
import { explainSdkError } from './explain-error';
import { formatReport, runJanitor, verifyApplicationGrantClosed } from './janitor';
import { runPreflight } from './preflight';

/**
 * True when the command line selects everything: no --grep / --fgrep and no spec file argument. A full run needs every
 * role up front, so a missing keyset fails it at once and not after minutes in the first test that needs it. A partial run
 * checks only the roles its tests ask for, when they build their client.
 */
function isFullRun(argv: readonly string[] = process.argv.slice(2)): boolean {
  const selects = (arg: string): boolean => /^(--grep|-g|--fgrep|-f)(=|$)/.test(arg) || /\.ts$/.test(arg);
  return !argv.some(selects);
}

/** True under `.mocharc.endpoints.cjs` (it sets LIVE_TIER=endpoints): no role is checked up front (each test needs its own, see `keysOf`), janitor and preflight default to off. */
const endpointsTier = process.env.LIVE_TIER === 'endpoints';

/**
 * Every failure of the run, test or hook, passes through `Runner#fail` before the reporter sees it, so wrapping it once covers
 * all of them, including `before` and `beforeEach` hooks, which `afterEach` cannot reach (a failed hook is reported against the
 * hook, not `currentTest`). The wrapper only annotates the error and then calls the original with the same arguments: results,
 * counts and the error object stay as they are. `Runner#fail` is not part of Mocha's documented API, so when it is missing (a
 * Mocha upgrade) the install reports false and the `afterEach` fallback below annotates failed tests (hook failures stay plain).
 */
function installFailureExplainer(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Runner = require('mocha/lib/runner') as { prototype: { fail?: (...args: unknown[]) => unknown } };
    const original = Runner.prototype.fail;
    if (typeof original !== 'function') return false;
    Runner.prototype.fail = function (this: unknown, ...args: unknown[]): unknown {
      explainSdkError(args[1]);
      return original.apply(this, args);
    };
    return true;
  } catch {
    return false;
  }
}
const explainerInstalled = installFailureExplainer();

const banner = (lines: string[]): void => {
  const bar = '!'.repeat(78);
  console.error(`\n${bar}\n${lines.map(redact).join('\n')}\n${bar}\n`);
};

export const mochaHooks = {
  async beforeAll(this: Mocha.Context): Promise<void> {
    // The cleanup waits for Access Manager to propagate a revoke (up to about 60 s), so the default test timeout does not fit.
    this.timeout(300_000);
    console.log(`keysets: ${describeRoles()}`);
    const { open, missing } = env();
    // Endpoint tier: no role is required up front. Each test asks for its role when it builds a client (`keysOf` throws an error that
    // names the missing env variables), so a --grep run of the DataSync files needs only the DS_* keys and a run of the open-keyset
    // files needs only SUBSCRIBE_KEY and PUBLISH_KEY.
    if (!endpointsTier && !open) {
      throw new Error(
        `The live tier needs the open keyset. Missing: ${missing.open.join(', ')}. ` +
          'Set them in the environment or in test/integration/live/.env.local (see .env.example).',
      );
    }
    if (!endpointsTier && isFullRun()) {
      const absent = ROLES.filter((role) => !env()[role]);
      if (absent.length) {
        throw new Error(
          `A full run needs every keyset. Missing: ${absent.map((role) => `${role} (${env().missing[role].join(', ')})`).join('; ')}. ` +
            'Set them, or select tests with --grep (that run needs only the roles of those tests).',
        );
      }
    }
    if (janitorEnabled()) {
      const report = await runJanitor();
      formatReport(report).forEach((line) => console.log(line));
      if (report.critical.length || report.failed.length) {
        throw new Error(
          'The cleanup before the run failed, so the tests would start on a dirty keyset. ' +
            `${[...report.critical, ...report.failed].map(redact).join(' | ')}. ` +
            'Fix the cause, or run `npm run test:integration:live:janitor` to retry the cleanup alone.',
        );
      }
      const secured = env().pam ?? env().datasync;
      if (secured) {
        const ms = await verifyApplicationGrantClosed(secured);
        console.log(`janitor: a client without a token is refused on the secured keyset (${ms} ms)`);
      }
    } else {
      console.log('janitor: skipped before the run (LIVE_JANITOR=off)');
    }
    if (preflightEnabled()) {
      const { notes } = await runPreflight();
      notes.forEach((note) => console.log(`preflight: ${note}`));
      console.log('preflight: keyset features ok');
    }
  },
  afterEach(this: Mocha.Context): void {
    if (!explainerInstalled) explainSdkError(this.currentTest?.err);
    restoreAllConsoles();
    destroyClients();
  },
  async afterAll(this: Mocha.Context): Promise<void> {
    if (!janitorEnabled()) return;
    this.timeout(300_000);
    let report;
    try {
      report = await runJanitor();
    } catch (error) {
      banner([
        `JANITOR CRASHED after the run: ${error instanceof Error ? error.message : String(error)}`,
        'The keysets may hold leftovers.',
      ]);
      return;
    }
    formatReport(report).forEach((line) => console.log(line));
    if (report.failed.length) {
      banner([
        'JANITOR: the cleanup after the run could not remove everything. Test results are not affected.',
        ...report.failed.map((f) => `  ${f}`),
        'The next run fails in its "before all" cleanup until this is fixed.',
      ]);
    }
    if (report.critical.length) {
      banner(['JANITOR CRITICAL: a secured keyset may be left OPEN.', ...report.critical]);
      throw new Error(`cleanup after the run left a secured keyset open: ${report.critical.map(redact).join(' | ')}`);
    }
  },
};
