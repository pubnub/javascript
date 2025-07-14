/**
 * PubNub package utilities module.
 *
 * @internal
 */

import { Payload, Query } from './types/api';

/**
 * Percent-encode input string.
 *
 * **Note:** Encode content in accordance of the `PubNub` service requirements.
 *
 * @param input - Source string or number for encoding.
 *
 * @returns Percent-encoded string.
 *
 * @internal
 */
export const encodeString = (input: string | number) => {
  return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
};

/**
 * Percent-encode list of names (channels).
 *
 * @param names - List of names which should be encoded.
 *
 * @param [defaultString] - String which should be used in case if {@link names} is empty.
 *
 * @returns String which contains encoded names joined by non-encoded `,`.
 *
 * @internal
 */
export const encodeNames = (names: string[], defaultString?: string) => {
  const encodedNames = names.map((name) => encodeString(name));
  return encodedNames.length ? encodedNames.join(',') : (defaultString ?? '');
};

/**
 * @internal
 */
export const removeSingleOccurrence = (source: string[], elementsToRemove: string[]) => {
  const removed = Object.fromEntries(elementsToRemove.map((prop) => [prop, false]));

  return source.filter((e) => {
    if (elementsToRemove.includes(e) && !removed[e]) {
      removed[e] = true;
      return false;
    }
    return true;
  });
};

/**
 * @internal
 */
export const findUniqueCommonElements = (a: string[], b: string[]) => {
  return [...a].filter(
    (value) =>
      b.includes(value) && a.indexOf(value) === a.lastIndexOf(value) && b.indexOf(value) === b.lastIndexOf(value),
  );
};

/**
 * Transform query key / value pairs to the string.
 *
 * @param query - Key / value pairs of the request query parameters.
 *
 * @returns Stringified query key / value pairs.
 *
 * @internal
 */
export const queryStringFromObject = (query: Query) => {
  return Object.keys(query)
    .map((key) => {
      const queryValue = query[key];
      if (!Array.isArray(queryValue)) return `${key}=${encodeString(queryValue)}`;

      return queryValue.map((value) => `${key}=${encodeString(value)}`).join('&');
    })
    .join('&');
};

/**
 * Adjust `timetoken` to represent current time in PubNub's high-precision time format.
 *
 * @param timetoken - Timetoken recently used for subscribe long-poll request.
 * @param [referenceTimetoken] - Previously computed reference timetoken.
 *
 * @returns Adjusted timetoken if recent timetoken available.
 */
export const subscriptionTimetokenFromReference = (
  timetoken: string,
  referenceTimetoken: string,
): string | undefined => {
  if (referenceTimetoken === '0' || timetoken === '0') return undefined;

  const timetokenDiff = adjustedTimetokenBy(`${Date.now()}0000`, referenceTimetoken, false);
  return adjustedTimetokenBy(timetoken, timetokenDiff, true);
};

/**
 * Create reference timetoken based on subscribe timetoken and the user's local time.
 *
 * Subscription-based reference timetoken allows later computing approximate timetoken at any point in time.
 *
 * @param [serviceTimetoken] - Timetoken received from the PubNub subscribe service.
 * @param [catchUpTimetoken] - Previously stored or user-provided catch-up timetoken.
 * @param [referenceTimetoken] - Previously computed reference timetoken. **Important:** This value should be used
 * in the case of restore because the actual time when service and catch-up timetokens are received is really
 * different from the current local time.
 *
 * @returns Reference timetoken.
 */
export const referenceSubscribeTimetoken = (
  serviceTimetoken?: string | null,
  catchUpTimetoken?: string | null,
  referenceTimetoken?: string | null,
) => {
  if (!serviceTimetoken || serviceTimetoken.length === 0) return undefined;

  if (catchUpTimetoken && catchUpTimetoken.length > 0 && catchUpTimetoken !== '0') {
    // Compensate reference timetoken because catch-up timetoken has been used.
    const timetokensDiff = adjustedTimetokenBy(serviceTimetoken, catchUpTimetoken, false);
    return adjustedTimetokenBy(
      referenceTimetoken ?? `${Date.now()}0000`,
      timetokensDiff.replace('-', ''),
      Number(timetokensDiff) < 0,
    );
  } else if (referenceTimetoken && referenceTimetoken.length > 0 && referenceTimetoken !== '0')
    return referenceTimetoken;
  else return `${Date.now()}0000`;
};

/**
 * High-precision time token adjustment.
 *
 * @param timetoken - Source timetoken which should be adjusted.
 * @param value - Value in nanoseconds which should be used for source timetoken adjustment.
 * @param increment - Whether source timetoken should be incremented or decremented.
 *
 * @returns Adjusted high-precision PubNub timetoken.
 */
export const adjustedTimetokenBy = (timetoken: string, value: string, increment: boolean): string => {
  // Normalize value to the PubNub's high-precision time format.
  if (value.startsWith('-')) {
    value = value.replace('-', '');
    increment = false;
  }
  value = value.padStart(17, '0');

  const secA = timetoken.slice(0, 10);
  const tickA = timetoken.slice(10, 17);
  const secB = value.slice(0, 10);
  const tickB = value.slice(10, 17);

  let seconds = Number(secA);
  let ticks = Number(tickA);
  seconds += Number(secB) * (increment ? 1 : -1);
  ticks += Number(tickB) * (increment ? 1 : -1);

  if (ticks >= 10_000_000) {
    seconds += Math.floor(ticks / 10_000_000);
    ticks %= 10_000_000;
  } else if (ticks < 0) {
    if (seconds > 0) {
      seconds -= 1;
      ticks += 10_000_000;
    } else if (seconds < 0) ticks *= -1;
  } else if (seconds < 0 && ticks > 0) {
    seconds += 1;
    ticks = 10_000_000 - ticks;
  }

  return seconds !== 0 ? `${seconds}${`${ticks}`.padStart(7, '0')}` : `${ticks}`;
};

/**
 * Compute received update (message, event) fingerprint.
 *
 * @param input - Data payload from subscribe API response.
 *
 * @returns Received update fingerprint.
 */
export const messageFingerprint = (input: Payload) => {
  const msg = typeof input !== 'string' ? JSON.stringify(input) : input;
  const mfp = new Uint32Array(1);
  let walk = 0;
  let len = msg.length;

  while (len-- > 0) mfp[0] = (mfp[0] << 5) - mfp[0] + msg.charCodeAt(walk++);
  return mfp[0].toString(16).padStart(8, '0');
};
