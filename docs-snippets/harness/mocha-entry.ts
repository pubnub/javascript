/**
 * The Mocha spec file: where the registry becomes tests. It builds the `World`, registers every page, selects the steps of
 * this run and creates one `it()` per step in phase order. It is loaded from the staged copy
 * `docs-snippets/.run/<runId>/harness/`, never from the source tree. It is not named `*.test.ts`, so the SDK's root
 * `.mocharc.json` never picks it up, and it never loads `test/setup-why.ts` (that file restores nock).
 *
 * Per step it: sets the role, decides skip (registry.skipReason), runs the body, waits one tick for stray promise
 * rejections (guard.ts), runs the honesty checks, records the result for later `needs`, and tags the Mocha test with
 * `pnMeta`, `pnReason` and `pnNote` so reporter.cjs can write the JSON.
 *
 * Honesty checks after a passing body (`afterStep`): every snippet id of the step reached its `snippet.end` line (the
 * staged copy calls `__snippetRan('<id>')` there, see stage.ts), and the step recorded at least one assertion. They run
 * inside the test and not in a Mocha `afterEach` hook on purpose: a failing hook makes Mocha abort every later test of the
 * suite, a failing check here fails only this step.
 *
 * Selection: `DOCS_SNIPPETS_SHARD` (a role), `DOCS_SNIPPETS_GREP` (set by the CLI from `--grep`) and `DOCS_SNIPPETS_ONLY`
 * (exact ids) choose steps. A chosen step's `needs` that the filter left out run on demand before it, with their own role's
 * keys, and are reported as prerequisites, not as passed tests.
 *
 * Root hooks: `before` closes any leftover application-level grant on the secured keysets this run uses and proves that a
 * stranger is refused. `after` runs the janitor, proves the same again, and fails the run on residue or a critical cleanup
 * error.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { drainGuard, describeError, explainError, installGuard } from './guard.js';
import { loadEnv, securedKeysets, type Role } from './env.js';
import { registry, rolesOf, selectSteps, stepTitle, type StepDef } from './registry.js';
import { World } from './world.js';
import { runJanitor } from './janitor.js';
import { closeAndVerifyApplicationGrant, revokeApplicationGrantOnKeyset } from './revoke.js';
import { recorder } from './recorder.js';
import assert from './assert.js';
import { installQuiet, mute, unmute } from './quiet.js';
import { installShutdown } from './signals.js';
import { installRedaction } from './redact.cjs';
import { SkipStep } from './step.js';
import { registerAll } from '../run.js';

/**
 * DOCS_SNIPPETS_DRY=1 swaps every step body for a no-op so the Mocha binding, the reporter and the skip logic can be
 * exercised without a network. DOCS_SNIPPETS_DRY_FAIL names one step that throws. Used by `cli.ts dry` only.
 */
const dry = process.env.DOCS_SNIPPETS_DRY === '1';
const dryFail = process.env.DOCS_SNIPPETS_DRY_FAIL;

installRedaction();
const env = loadEnv();
const world = new World(env, env.runId);
installGuard();
// SDK client logs printed by snippets are collected per step (quiet.ts). A user who set a log level or
// DOCS_SNIPPETS_VERBOSE=1 wants to see them, so nothing is muted then.
installQuiet({
  enabled: process.env.DOCS_SNIPPETS_LOG_LEVEL === undefined && process.env.DOCS_SNIPPETS_VERBOSE !== '1',
});
registry.reset();
registry.availability = dry
  ? { open: true, pam: true, datasync: true }
  : { open: Boolean(env.open), pam: Boolean(env.pam), datasync: Boolean(env.datasync) };
registerAll(world);
const wiring = registry.validate();
if (wiring.length > 0) throw new Error(`step wiring is broken:\n${wiring.join('\n')}`);

const only = process.env.DOCS_SNIPPETS_ONLY?.split(',')
  .map((id) => id.trim())
  .filter(Boolean);
const shard = env.shard;
const selection = selectSteps(registry, { shard, grep: process.env.DOCS_SNIPPETS_GREP || undefined, only });
/** Roles that run in this process (selected steps and their prerequisites). Only their keysets are guarded and cleaned. */
const usedRoles: Set<Role> = rolesOf(registry, selection);

const startedAt = Date.now();

// Published for the reporter (same process): the full plan and the selection, so the report can list prerequisites and
// steps that a filter left out.
(globalThis as { __pnDocsPlan?: unknown }).__pnDocsPlan = registry.ordered().map((def) => ({
  id: def.id,
  page: def.page,
  phase: def.phase,
  kind: def.kind,
  snippets: def.snippets,
  keyset: def.keyset,
  proves: def.proves,
  selected: selection.run.has(def.id) && !selection.prerequisites.has(def.id),
  prerequisite: selection.prerequisites.has(def.id),
}));
(globalThis as { __pnDocsSelection?: unknown }).__pnDocsSelection = {
  shard: shard ?? null,
  grep: process.env.DOCS_SNIPPETS_GREP ?? null,
  only: only ?? null,
  mutate: process.env.DOCS_SNIPPETS_MUTATE ?? null,
  roles: [...usedRoles],
};

// Snippet ids that reached their `snippet.end` line in the running step (the staged copy calls this, see stage.ts).
const ran = new Set<string>();
(globalThis as { __snippetRan?: (id: string) => void }).__snippetRan = (id: string): void => {
  ran.add(id);
};
// Assertions recorded before the first snippet of the step started (fixtures, `watch()` waits). They do not count for the
// zero-assertion check, which asks whether the step asserted anything about the docs code.
let beforeSnippet: number | undefined;
(globalThis as { __snippetStart?: (id: string) => void }).__snippetStart = (): void => {
  if (beforeSnippet === undefined) beforeSnippet = recorder.total;
};

/**
 * Debug aid: DOCS_SNIPPETS_INJECT_FAILURE=<stepId>[,<stepId>] runs the step normally, then makes it throw an SDK-style 403.
 * It exists to look at the failure part of the report. The CLI refuses it in CI (policy.ts).
 */
const injected = new Set(
  (process.env.DOCS_SNIPPETS_INJECT_FAILURE ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
);
function injectedError(id: string): Error {
  const error = new Error('REST API request processing error, check status for details');
  error.name = 'PubNubError';
  (error as Error & { status?: unknown }).status = {
    error: true,
    category: 'PNAccessDeniedCategory',
    operation: 'PNPublishOperation',
    statusCode: 403,
    errorData: {
      message: `Forbidden (injected by DOCS_SNIPPETS_INJECT_FAILURE for step ${id})`,
      status: 403,
      service: 'Access Manager',
    },
  };
  return error;
}

/** Secured keysets this run touches, without duplicates. */
const guarded = securedKeysets(env).filter(
  (k) => usedRoles.has(k.role) || (env.sharedSecured && usedRoles.has('datasync')),
);

/** Proves that a stranger (no auth key, no token) is refused on every guarded keyset. Used before and after the steps. */
async function proveNoApplicationGrant(when: string): Promise<void> {
  for (const { role, keys } of guarded) {
    const waited = await closeAndVerifyApplicationGrant(keys, `${when}-r${world.runId}`);
    console.log(
      `${env.sharedSecured ? 'pam and datasync' : role} keyset: a client without a token is refused (${when}${waited.attempts > 1 ? `, after ${Math.round(waited.ms / 1000)} s` : ''})`,
    );
  }
}

if (!dry) {
  installShutdown(
    // First and alone: close the application-level grant on every secured keyset this run uses. One quick call each, so it
    // finishes before a CI cancel escalates to SIGKILL.
    async () => {
      // Stop collecting console output (quiet.ts): from here on every line of the cleanup must be visible.
      unmute();
      for (const { role, keys } of guarded) {
        await revokeApplicationGrantOnKeyset(keys, `signal-r${world.runId}`, 1);
        process.stderr.write(`${role} keyset: application-level grant revoked\n`);
      }
    },
    async () => {
      const report = await runJanitor(env, world.runId, new Date(startedAt), [...usedRoles]);
      for (const line of report.log) console.log(`janitor: ${line}`);
      await world.dispose();
    },
  );
  if (process.env.DOCS_SNIPPETS_PRINT_RESOLVE !== '0') {
    // The suite tests this repository's build, never a package from npm.
    console.log(`pubnub resolves to ${fs.realpathSync(fileURLToPath(import.meta.resolve('pubnub')))}`);
  }
}

/** Honesty checks of a passing step, see the header. */
function afterStep(def: StepDef, assertions: number): void {
  if (def.kind !== 'step' || dry) return;
  const missing = def.snippets.filter((id) => !ran.has(id));
  if (missing.length > 0) {
    throw new Error(
      `honesty check: snippet ${missing.join(', ')} of step ${def.id} did not reach its snippet.end line, so the docs code did not run to the end`,
    );
  }
  if (assertions === 0) {
    throw new Error(
      `honesty check: step ${def.id} recorded zero assertions after its snippet started, so it proves nothing about what the docs page claims`,
    );
  }
}

describe('JavaScript SDK docs snippets', function () {
  this.timeout(30_000);

  for (const def of registry.ordered()) {
    if (!selection.run.has(def.id)) continue;
    const prerequisite = selection.prerequisites.has(def.id);
    const test = it(`${prerequisite ? '(prerequisite) ' : ''}${stepTitle(def)}`, async function () {
      this.timeout(def.timeout);
      world.useRole(def.keyset);
      const reason = registry.skipReason(def);
      if (reason) {
        registry.record(def.id, { status: 'skipped', reason });
        (this.test as unknown as { pnReason?: string }).pnReason = reason;
        this.skip();
      }
      drainGuard();
      ran.clear();
      beforeSnippet = undefined;
      const began = Date.now();
      const tagged = this.test as unknown as {
        pnAssertions?: unknown;
        pnDropped?: number;
        pnSuppressed?: number;
        pnOutput?: string[];
      };
      recorder.begin();
      mute();
      let collected: string[] = [];
      let collectedTotal = 0;
      let thrown: unknown;
      let failedStep = false;
      let assertionCount = 0;
      try {
        if (dry) {
          await dryAssertions(def.id, def.id === dryFail);
          if (injected.has(def.id)) throw injectedError(def.id);
        } else {
          await def.fn();
          if (injected.has(def.id)) throw injectedError(def.id);
        }
        // A snippet may leave a promise un-awaited. One macrotask later it has settled, and a rejection recorded by
        // guard.ts fails this step instead of leaking into the next one.
        await new Promise((resolve) => setImmediate(resolve));
        const stray = drainGuard();
        if (stray.length > 0) {
          throw new Error(
            `unhandled rejection during step ${def.id}: ${stray.map((s) => describeError(s.error)).join('; ')}`,
          );
        }
      } catch (error) {
        thrown = error;
        failedStep = true;
      } finally {
        const quietResult = unmute();
        collected = quietResult.lines;
        collectedTotal = quietResult.total;
        const afterStart = recorder.total - (beforeSnippet ?? 0);
        const { assertions, dropped } = recorder.end();
        assertionCount = afterStart;
        tagged.pnAssertions = assertions;
        tagged.pnDropped = dropped;
        tagged.pnSuppressed = collectedTotal;
        if (failedStep && !(thrown instanceof SkipStep)) tagged.pnOutput = collected.slice(-60);
      }
      if (!failedStep) {
        try {
          afterStep(def, assertionCount);
        } catch (error) {
          thrown = error;
          failedStep = true;
        }
      }
      if (!failedStep) {
        registry.record(def.id, { status: 'passed', durationMs: Date.now() - began });
        return;
      }
      const error = thrown;
      if (error instanceof SkipStep) {
        registry.record(def.id, { status: 'skipped', reason: error.reason });
        (this.test as unknown as { pnReason?: string; pnNote?: string }).pnReason = error.reason;
        (this.test as unknown as { pnNote?: string }).pnNote = error.detail;
        if (error.detail) console.log(`skipped ${def.id} (${error.reason}): ${error.detail}`);
        this.skip();
      }
      explainError(error);
      registry.record(def.id, { status: 'failed', error: describeError(error), durationMs: Date.now() - began });
      if (collected.length > 0)
        console.error(
          `console output of ${def.id} before it failed (last ${Math.min(collected.length, 30)} of ${collectedTotal} lines):\n${collected.slice(-30).join('\n')}`,
        );
      throw error;
    });
    (test as unknown as { pnMeta: unknown }).pnMeta = {
      id: def.id,
      page: def.page,
      phase: def.phase,
      kind: def.kind,
      snippets: def.snippets,
      skipIf: def.skipIf,
      keyset: def.keyset,
      needs: def.needs,
      proves: def.proves,
      prerequisite,
    };
  }

  // A crashed earlier run, or a grant of another job on a shared keyset, may leave a secured keyset open. Steps such as
  // `publishHandleErrors` need the keyset to really deny a client without a token, so prove it before the first step.
  before(async function () {
    this.timeout(150_000);
    if (dry) return;
    await proveNoApplicationGrant('before');
  });

  after(async function () {
    this.timeout(240_000);
    try {
      if (!dry && (env.open || env.pam || env.datasync)) {
        const report = await runJanitor(env, world.runId, new Date(startedAt), [...usedRoles]);
        for (const line of report.log) console.log(`janitor: ${line}`);
        if (report.critical.length > 0) {
          throw new Error(`janitor could not make the keysets safe: ${report.critical.join('; ')}`);
        }
        // Residue = objects created during the run whose id has no run suffix, so a snippet wrote a literal that is missing
        // from fixtures/names.ts and the next run would collide with it.
        if (report.residue.length > 0) {
          throw new Error(
            `residue: ${report.residue.length} object(s) created during the run have no run suffix, so a snippet uses ` +
              `a literal missing from fixtures/names.ts: ${report.residue.join(', ')}`,
          );
        }
        // The janitor revoked the application-level grant. Wait until a stranger is refused again, so the next job on a
        // shared keyset starts closed.
        await proveNoApplicationGrant('after');
      }
    } finally {
      mute();
      await world.dispose();
      await new Promise((resolve) => setImmediate(resolve));
      unmute();
    }
  });
});

/**
 * Dry run only: makes a no-op step look like a real one for the report, so the dry run proves that assertions, failures and
 * descriptions reach report/run.json without a network. `fail` ends in a failing assertion.
 */
async function dryAssertions(id: string, fail: boolean): Promise<void> {
  assert.equal(1 + 1, 2, `dry run assertion of ${id}`);
  assert.ok(true, 'dry run: ok assertion');
  if (fail)
    assert.equal(
      1,
      1,
      'dry run: label with a key pub-c-0123abcd-0123-4abc-8def-0123456789ab and token p0F2AkF0Gl' + 'A'.repeat(30),
    );
  if (fail) assert.deepEqual(['actual'], ['expected'], 'dry run: simulated failing assertion');
}
