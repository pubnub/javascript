import { randomInt, randomUUID } from 'node:crypto';

/**
 * A name that no other run uses, for channels and users a test asserts on exactly. Names built this way cannot be listed in
 * resources.ts, so the janitor never removes the messages on them; they expire with the retention of the keyset.
 */
export const unique = (base: string): string => `${base}-${randomUUID().slice(0, 8)}`;

/** A sorted copy, for comparing lists whose order the service does not promise. */
export const sorted = (values: string[]): string[] => [...values].sort();

/**
 * A suffix for the id of an object a test creates on a keyset that other runs have used for years (DataSync objects, which a
 * test run can leave behind). 14 characters of `[0-9a-z]`: the time in milliseconds in base 36 (8 characters until the year 2059),
 * then 6 random base-36 characters (36^6, about 2.2 billion values), so two ids collide only when two runs draw the same random
 * part in the same millisecond (within one process they never do). No `_` (the service rejects it in ids), no upper case, no separator of its own. Ids built from it
 * stay at or under 28 characters with the prefixes of the endpoint tests (the longest id the docs samples create is 28).
 */
export function uniqueSuffix(): string {
  const now = Date.now();
  if (now !== drawnAt) {
    drawnAt = now;
    drawn.clear();
  }
  // Two ids of this process never share a millisecond and a draw, however fast a loop asks.
  let random: number;
  do random = randomInt(36 ** 6);
  while (drawn.has(random));
  drawn.add(random);
  return `${now.toString(36)}${random.toString(36).padStart(6, '0')}`;
}

let drawnAt = 0;
const drawn = new Set<number>();
