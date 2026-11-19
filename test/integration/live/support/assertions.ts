/**
 * Small assertion helpers. The SDK reports failures as a rejected promise carrying a `status` object (category, statusCode,
 * errorData) rather than as a typed error class, so "this call must be refused for reason X" is the same few lines everywhere.
 */
import assert from 'node:assert/strict';

/** Adds `delta` to a PubNub timetoken (17-digit string) without losing precision (BigInt, not Number). */
export function addToTimetoken(timetoken: string, delta: number): string {
  return (BigInt(timetoken) + BigInt(delta)).toString();
}

/** A timetoken as `publish()` and the other writes return it: a string of 17 digits (10 ns ticks since 1970). */
export function assertTimetoken(value: unknown): void {
  assert.equal(typeof value, 'string', `expected a timetoken string, got ${typeof value} ${String(value)}`);
  assert.match(String(value), /^\d{17}$/, `expected a 17 digit timetoken, got ${String(value)}`);
}

/**
 * The timetoken of `time()`. The types declare `timetoken: string`, but the SDK returns the parsed JSON number, which is above
 * Number.MAX_SAFE_INTEGER and can lose its last digit. This pins that behaviour: when the SDK starts returning a string,
 * it fails and the special case can go.
 */
export function assertServerTime(value: unknown): void {
  assert.equal(typeof value, 'number', `time() timetoken: expected the number the SDK returns, got ${typeof value}`);
  assert.match(String(value), /^\d{17}$/, `expected a 17 digit timetoken, got ${String(value)}`);
}

/** Resolves when `promise` rejects with the SDK's validation error and the status message matches. */
export async function rejectsValidation(promise: Promise<unknown>, pattern: RegExp): Promise<void> {
  await assert.rejects(promise, (error: unknown) => {
    const status = (error as { status?: { category?: string; message?: unknown } }).status;
    assert.equal(String(status?.category), 'PNValidationErrorCategory', 'expected a validation error');
    assert.match(String(status?.message ?? ''), pattern);
    return true;
  });
}

/** Resolves when `promise` rejects with an SDK error whose category matches (for example access denied). */
export async function rejectsWithCategory(promise: Promise<unknown>, category: string): Promise<void> {
  await assert.rejects(promise, (error: unknown) => {
    const status = (error as { status?: { category?: string } }).status;
    assert.equal(String(status?.category), category);
    return true;
  });
}
