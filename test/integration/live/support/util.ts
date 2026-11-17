import { randomUUID } from 'node:crypto';

/**
 * A name that no other run uses, for channels and users a test asserts on exactly. Names built this way cannot be listed in
 * resources.ts, so the janitor never removes the messages on them; they expire with the retention of the keyset.
 */
export const unique = (base: string): string => `${base}-${randomUUID().slice(0, 8)}`;

/** A sorted copy, for comparing lists whose order the service does not promise. */
export const sorted = (values: string[]): string[] => [...values].sort();
