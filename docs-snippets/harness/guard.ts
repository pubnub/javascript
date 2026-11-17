/**
 * Failure-on-unhandled-rejection guard. Snippets let errors throw, so a rejection nobody awaits means a step
 * did something the harness did not assert. The guard records it against the running step and the step runner
 * fails that step after the body returns.
 */

// Module-level on purpose: the process-wide `unhandledRejection` event has no idea which step is running, so the step runner
// drains this list before and after each step to assign blame.
const recorded: Array<{ kind: string; error: unknown }> = [];
let installed = false;

/** Idempotent. Without a handler Node would crash the whole run on an unhandled rejection. Here it fails one step. */
export function installGuard(): void {
  if (installed) return;
  installed = true;
  process.on('unhandledRejection', (error) => {
    recorded.push({ kind: 'unhandledRejection', error });
  });
}

/** Returns and clears errors recorded since the last call. */
export function drainGuard(): Array<{ kind: string; error: unknown }> {
  return recorded.splice(0, recorded.length);
}

/** One line for reports. Falls back to JSON for non-Error throws (the SDK sometimes rejects with a plain status object). */
export function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  try {
    return typeof error === 'string' ? error : JSON.stringify(error);
  } catch {
    return String(error);
  }
}

// The subset of the SDK's rejection shape that carries a reason.
interface SdkStatus {
  category?: unknown;
  statusCode?: unknown;
  errorData?: { error_message?: unknown; message?: unknown; error?: { message?: unknown } } | unknown;
  message?: unknown;
}

/**
 * The SDK reports most service failures as "REST API request processing error, check status for details".
 * This appends the category, status code and the service's own message, so a report line explains itself.
 */
export function explainError(error: unknown): void {
  if (!(error instanceof Error)) return;
  const status = (error as Error & { status?: SdkStatus }).status;
  if (!status || typeof status !== 'object') return;
  const data = (status.errorData ?? {}) as { error_message?: unknown; message?: unknown; error?: { message?: unknown } };
  const detail = data.error_message ?? data.message ?? data.error?.message ?? status.message;
  const parts = [String(status.category ?? ''), String(status.statusCode ?? '')].filter(Boolean).join(' ');
  error.message = `${error.message} [${parts}${detail ? `: ${String(detail)}` : ''}]`;
}
