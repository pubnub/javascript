import { Query } from './types/api';

/**
 * Percent-encode input string.
 *
 * **Note:** Encode content in accordance of the `PubNub` service requirements.
 *
 * @param input - Source string or number for encoding.
 *
 * @returns Percent-encoded string.
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
 */
export const encodeNames = (names: string[], defaultString?: string) => {
  const encodedNames = names.map((name) => encodeString(name));
  return encodedNames.length ? encodedNames.join(',') : defaultString ?? '';
};

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
