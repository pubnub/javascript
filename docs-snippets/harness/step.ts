/**
 * The authoring API of the app: what a page module imports to register its steps.
 *
 *   page(path, defaultPhase, (world) => { step(...); check(...); stub(...); })
 *
 * - `step`  runs one or more docs snippets (the code between `// snippet.<id>` markers) and asserts around them.
 * - `check` is a harness-only step with no markers: fixtures, effect checks, error tables, preflights.
 * - `stub`  is a documented skipped step. It keeps a docs page visible in the report without running anything.
 * - `skipStep` lets a running step skip itself with a precise reason (see `SkipStep`).
 *
 * Nothing runs when these functions are called. They only record a definition in the registry (registry.ts).
 * `harness/mocha-entry.ts` later turns each definition into a Mocha test, so the order of registration, the phase and
 * the `needs` edges decide when and whether a step executes.
 */
import { registry, type Phase, type StepOptions } from './registry.js';
import type { World } from './world.js';

export type { Phase, StepOptions } from './registry.js';

type Body = () => Promise<void> | void;

/**
 * One docs snippet run (or a short sequence of snippets the docs show together).
 *
 * The id is the first snippet id inside the body. The marker lint checks that, checks that `snippets` equals
 * the markers inside, and rejects nesting. Snippets let errors throw, so the body asserts around them.
 */
export function step(id: string, options: StepOptions, fn: Body): void;
export function step(id: string, fn: Body): void;
export function step(id: string, a: StepOptions | Body, b?: Body): void {
  const options = typeof a === 'function' ? {} : a;
  const fn = typeof a === 'function' ? a : (b as Body);
  registry.add('step', id, options, fn);
}

/** A harness-only step: fixtures, effect checks and error tables. It contains no snippet markers. */
export function check(id: string, options: StepOptions, fn: Body): void;
export function check(id: string, fn: Body): void;
export function check(id: string, a: StepOptions | Body, b?: Body): void {
  const options = typeof a === 'function' ? {} : a;
  const fn = typeof a === 'function' ? a : (b as Body);
  registry.add('check', id, options, fn);
}

/** Why each stub exists, by step id. Kept for debugging only (nothing reads it yet). The skip reason itself is `skipIf`. */
export const stubNotes = new Map<string, string>();

/** A documented skipped stub. Reported as skipped with its reason, never executed. */
export function stub(id: string, reason: string, note: string): void {
  // The stub note doubles as the description in the report, so a skipped stub says what it stands for.
  registry.add('stub', id, { skipIf: reason, proves: note }, () => {
    throw new Error(`stub ${id} must never run: ${note}`);
  });
  stubNotes.set(id, note);
}

/** What a page file default exports. `run.ts` lists these, `setup` is called once per run with the shared `World`. */
export interface PageModule {
  path: string;
  phase: Phase;
  setup(world: World): void;
}

/** A docs page module. `phase` is the default for its steps, a step may override it. */
export function page(pagePath: string, phase: Phase, setup: (world: World) => void): PageModule {
  return {
    path: pagePath,
    phase,
    setup(world) {
      registry.withPage(pagePath, phase, () => setup(world));
    },
  };
}

/**
 * Thrown by a step or check to skip itself with a precise reason, for example a keyset that lacks DataSync
 * classes. The runner records the step as skipped, and steps that `needs` it are skipped as `blocked-by:<id>`.
 *
 * Two reason families are accepted, both already inside the allowed list:
 * - `blocked-by:<text>`: a root cause (a missing class) hides this step. Counts against `DOCS_SNIPPETS_SKIP_BUDGET`.
 * - `needs-feature:<name>`: the keyset lacks a switch that cannot be set from code (DataSync event rules live in the
 *   Admin Portal). It does not count against the budget. `DOCS_SNIPPETS_REQUIRE_FEATURES` makes it a failure (policy.ts).
 *
 * `detail` is free text for the human: it is printed and written to the report as `note`, so the reason itself can
 * stay a short, matchable tag.
 */
export class SkipStep extends Error {
  readonly reason: string;
  readonly detail?: string;
  constructor(reason: string, detail?: string) {
    super(`skipped: ${reason}`);
    this.name = 'SkipStep';
    this.reason = reason;
    this.detail = detail;
    if (!/^(blocked-by:.+|needs-feature:[a-z0-9-]+)$/.test(reason)) {
      throw new Error(`SkipStep reason must be "blocked-by:<text>" or "needs-feature:<name>", got "${reason}"`);
    }
  }
}

/** Skips the running step from inside its body. Typed `never`, so code after the call is known to be unreachable. */
export function skipStep(reason: string, detail?: string): never {
  throw new SkipStep(reason, detail);
}
