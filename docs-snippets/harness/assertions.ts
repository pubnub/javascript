/**
 * Small assertion helpers that steps share. They exist because the SDK reports failures as a rejected promise
 * carrying a `status` object (category, statusCode, errorData) rather than as a typed error class, so "this call must
 * be refused for reason X" is the same few lines everywhere.
 */
import assert from './assert.js';

/**
 * Adds `delta` to a PubNub timetoken (17-digit string) without losing precision. Timetokens are 10 ns ticks and exceed
 * Number.MAX_SAFE_INTEGER, so plain arithmetic would round. BigInt keeps it exact.
 */
export function addToTimetoken(timetoken: string, delta: number): string {
  return (BigInt(timetoken) + BigInt(delta)).toString();
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
