import type { Env } from './env.js';

/**
 * Run policy: what turns a technically green Mocha run into a failed job. Pure functions, so the dry run tests every rule
 * without keys. `cli.ts` calls `launchProblems` before the run and `outcomeProblems` after it.
 *
 * - A skip fails the run, always: locally, in CI, nightly. A run must run every valid test. A skip means a keyset lacks a
 *   feature or class, keys are missing, or an upstream step failed, and each of those is a defect to fix, not to tolerate.
 *   There is no budget, no allowed list and no opt-out.
 * - In CI, every subset option is refused: `--grep`, `DOCS_SNIPPETS_ONLY`, `DOCS_SNIPPETS_MUTATE`,
 *   `DOCS_SNIPPETS_INJECT_FAILURE`. A subset run must never pass as the full run. A shard is not a subset: the workflow runs
 *   all three.
 * - In CI, `trace` and `debug` log levels are refused because the SDK logs its configuration at those levels.
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

export function outcomeProblems(report: PolicyReport): string[] {
  if (report.skips.length === 0) return [];
  const byReason = new Map<string, string[]>();
  for (const skip of report.skips) byReason.set(skip.reason, [...(byReason.get(skip.reason) ?? []), skip.id]);
  const lines = [...byReason].map(([reason, ids]) => `  ${reason}: ${ids.join(', ')}`);
  const hints = new Set<string>();
  for (const reason of byReason.keys()) {
    if (reason.startsWith('missing-env:'))
      hints.add(`set the ${reason.slice('missing-env:'.length)} keys (docs-snippets/.env.local locally, the SDK_DOCS_* secrets in CI)`);
    else if (reason.startsWith('needs-feature:'))
      hints.add(`turn ${reason.slice('needs-feature:'.length)} on for the keyset (see "Features each keyset needs" in docs-snippets/README.md)`);
    else if (reason.startsWith('blocked-by:')) hints.add('fix the step a blocked-by reason names, the steps that need it skip until then');
  }
  return [
    `${report.skips.length} step(s) were skipped. A run must run every valid test, so any skip fails it:\n${lines.join('\n')}\nTo fix: ${[...hints].join('. ')}.`,
  ];
}
