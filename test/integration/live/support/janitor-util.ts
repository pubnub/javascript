/** Small helpers shared by janitor.ts and janitor-datasync.ts. */
import { redact, type Role } from './env';
import { retryTransient, statusCode } from './retry';

export { statusCode };

export const CONCURRENCY = 8;
/** Bounds paging loops in case the service keeps returning cursors. */
export const MAX_PAGES = 50;

/** Collects what one pass did. Names go through `redact` before they are stored. */
export class Ledger {
  readonly removed: Array<{ role: Role; kind: string; name: string }> = [];
  readonly failed: string[] = [];
  readonly notes: string[] = [];
  readonly critical: string[] = [];
  private readonly seenNotes = new Set<string>();

  constructor(public role: Role) {}
  remove(kind: string, name: string): void {
    this.removed.push({ role: this.role, kind, name });
  }
  fail(kind: string, name: string, error: unknown): void {
    this.failed.push(`${this.role} ${kind} ${name}: ${describeError(error)}`);
  }
  note(text: string): void {
    const line = `${this.role}: ${text}`;
    if (!this.seenNotes.has(line)) {
      this.seenNotes.add(line);
      this.notes.push(line);
    }
  }
}

export function describeError(error: unknown): string {
  const e = error as { message?: string; status?: { statusCode?: number; errorData?: unknown } } | undefined;
  const code = statusCode(error);
  const data = e?.status?.errorData ? ` ${JSON.stringify(e.status.errorData)}` : '';
  return redact(`${e?.message ?? String(error)}${code ? ` [HTTP ${code}]` : ''}${data}`).slice(0, 300);
}

export const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** The janitor's calls are idempotent: transient failures (network, 5xx, 429) are retried by the shared retryTransient, a 4xx is final. */
export const retry = <T>(call: () => Promise<T>, attempts = 3): Promise<T> =>
  retryTransient(call, { attempts, label: 'janitor' });

/** Runs `fn` over `items` with at most `limit` calls at once. */
export async function pool<T>(items: readonly T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < items.length) await fn(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}
