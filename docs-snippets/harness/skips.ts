/**
 * The allowed-skip list. `registry.add` rejects any `skipIf` outside it, and the reporter (reporter.cjs) repeats the same
 * pattern to flag a skip that slipped in anyway, so a typo can never hide a step.
 *
 * Skip reasons. Anything outside this list fails the run.
 *
 * `blocked-by:<id>` and `missing-env:<keyset>` are produced by the runner itself and
 * cannot be passed to `skipIf`.
 */
export const ALLOWED_SKIP = /^(browser-only|react-native|needs-real-device|needs-feature:[a-z0-9-]+)$/;

export function assertAllowedSkip(reason: string, where: string): void {
  if (!ALLOWED_SKIP.test(reason)) {
    throw new Error(
      `${where}: skip reason "${reason}" is not allowed. Use browser-only, react-native, needs-real-device, ` +
        `needs-feature:<name>.`,
    );
  }
}

/** A runner-generated reason is fine locally. `missing-env:*` additionally fails CI (see policy.ts). */
export function isRunnerReason(reason: string): boolean {
  return /^(blocked-by:.+|missing-env:(open|pam|datasync))$/.test(reason);
}
