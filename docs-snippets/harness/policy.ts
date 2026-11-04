import type { Env } from './env.js';

/**
 * Run policy: what turns a technically green Mocha run into a failed job. Pure functions, so the dry run tests every rule
 * without keys. `cli.ts` calls `launchProblems` before the run and `outcomeProblems` after it.
 *
 * - Skip budget: steps skipped as `blocked-by:*` mean a root cause hid other steps. `DOCS_SNIPPETS_SKIP_BUDGET` caps them.
 *   In CI the default is 0.
 * - In CI, every subset option is refused: `--grep`, `DOCS_SNIPPETS_ONLY`, `DOCS_SNIPPETS_MUTATE`,
 *   `DOCS_SNIPPETS_INJECT_FAILURE`. A subset run must never pass as the full run. A shard is not a subset: the workflow runs
 *   all three.
 * - In CI, `trace` and `debug` log levels are refused because the SDK logs its configuration at those levels.
 * - Any `missing-env` skip in CI fails.
 * - `needs-feature:<name>` is an allowed skip outside the budget, but `DOCS_SNIPPETS_REQUIRE_FEATURES=<name>,...` makes the
 *   named ones fatal.
 * - `DOCS_SNIPPETS_STRICT=1` makes every skip fatal.
 */

export interface PolicyReport {
  skips: Array<{ id: string; reason: string; note?: string }>;
}

/** Options that select a subset of the plan or break a step on purpose. Each is refused in CI. */
export const SUBSET_VARS = ['DOCS_SNIPPETS_ONLY', 'DOCS_SNIPPETS_MUTATE', 'DOCS_SNIPPETS_INJECT_FAILURE'] as const;

export function launchProblems(
  env: Env,
  vars: Record<string, string | undefined> = process.env,
  args: { grep?: string } = {},
): string[] {
  const problems: string[] = [];
  if (env.skipBudgetProblem) problems.push(env.skipBudgetProblem);
  if (env.shardProblem) problems.push(env.shardProblem);
  if (env.ci) {
    if (args.grep) problems.push('--grep is set in CI. A subset run must not pass as the full run. Remove it.');
    for (const name of SUBSET_VARS) {
      if (vars[name])
        problems.push(
          `${name} is set in CI. It selects a subset or breaks a step on purpose, which must never pass as the full run. Unset it.`,
        );
    }
    if (env.logLevel === 'trace' || env.logLevel === 'debug') {
      problems.push(
        `DOCS_SNIPPETS_LOG_LEVEL=${env.logLevel} is refused in CI. The SDK logs its configuration at that level, which includes keys. Use info or lower.`,
      );
    }
  }
  return problems;
}

export function outcomeProblems(env: Env, report: PolicyReport): string[] {
  const problems: string[] = [];
  const missing = report.skips.filter((s) => s.reason.startsWith('missing-env:'));
  if (env.ci && missing.length > 0)
    problems.push(`${missing.length} step(s) were skipped for missing env in CI, which fails the run`);
  const blocked = report.skips.filter((s) => s.reason.startsWith('blocked-by:'));
  if (blocked.length > env.skipBudget) {
    const roots = [...new Set(blocked.map((s) => s.reason.slice('blocked-by:'.length)))];
    problems.push(
      `${blocked.length} step(s) were skipped as blocked-by, more than the budget of ${env.skipBudget} (DOCS_SNIPPETS_SKIP_BUDGET). Root causes: ${roots.join(', ')}`,
    );
  }
  for (const feature of env.requireFeatures) {
    const hit = report.skips.filter((s) => s.reason === `needs-feature:${feature}`);
    if (hit.length > 0) {
      problems.push(
        `${hit.length} step(s) were skipped as needs-feature:${feature} but DOCS_SNIPPETS_REQUIRE_FEATURES lists it: ${hit.map((s) => s.id).join(', ')}`,
      );
    }
  }
  if (env.strict && report.skips.length > 0) {
    const reasons = [...new Set(report.skips.map((s) => s.reason))];
    problems.push(
      `${report.skips.length} step(s) were skipped and DOCS_SNIPPETS_STRICT=1 makes every skip fatal. Reasons: ${reasons.join(', ')}`,
    );
  }
  return problems;
}

/** Every `needs-feature:*` skip, for the end-of-run summary. The tag is allowed, so it needs to be visible instead. */
export function featureSkips(report: PolicyReport): Array<{ id: string; reason: string; note?: string }> {
  return report.skips.filter((s) => s.reason.startsWith('needs-feature:'));
}
