/**
 * Per-test cleanup list. A test registers the removal of an object it is about to create (`cleanupAfterTest`, or the typed
 * `removeAfterTest` of datasync-live-helpers.ts), and the root `afterEach` (hooks.ts) runs `runCleanups()` once the test is over,
 * passed or failed, before the clients are destroyed. So a failed assertion, a failed seed or a timeout does not leave the object
 * on a keyset that outlives the run.
 *
 * Only what a test registered is removed: nothing here lists, sweeps or matches by prefix. Removals run newest first (a
 * relationship or a membership goes before the entities it links). A failure never fails the test, because the test is already
 * decided: a 404 is silent (the test removed the object itself, or the create never stored it), any other failure prints one line.
 */
import { categoryOf, retryTransient, statusCode } from './retry';

interface Cleanup {
  label: string;
  run: () => Promise<unknown>;
}

let pending: Cleanup[] = [];

/** Registers `run` to execute after the current test. `label` names it in the log line of a failed removal: never put keys or tokens in it. */
export function cleanupAfterTest(label: string, run: () => Promise<unknown>): void {
  pending.push({ label, run });
}

/** Runs and clears the registered removals, newest first. Never throws. Called by the root `afterEach`. */
export async function runCleanups(): Promise<void> {
  const batch = pending.reverse();
  pending = [];
  for (const { label, run } of batch) {
    try {
      // A removal is idempotent (a second one answers 404), so a transient failure may be retried.
      await retryTransient(run, { attempts: 2, backoff: 300, label });
    } catch (error) {
      if (statusCode(error) === 404) continue;
      console.log(
        `cleanup: ${label} failed (category ${categoryOf(error) ?? 'none'}, status ${statusCode(error) ?? 'none'}), the object may be left on the keyset`,
      );
    }
  }
}
