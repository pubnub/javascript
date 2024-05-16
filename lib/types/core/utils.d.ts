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
export declare const encodeString: (input: string | number) => string;
/**
 * Percent-encode list of names (channels).
 *
 * @param names - List of names which should be encoded.
 *
 * @param [defaultString] - String which should be used in case if {@link names} is empty.
 *
 * @returns String which contains encoded names joined by non-encoded `,`.
 */
export declare const encodeNames: (names: string[], defaultString?: string) => string;
export declare const removeSingleOccurrence: (source: string[], elementsToRemove: string[]) => string[];
export declare const findUniqueCommonElements: (a: string[], b: string[]) => string[];
/**
 * Transform query key / value pairs to the string.
 *
 * @param query - Key / value pairs of the request query parameters.
 *
 * @returns Stringified query key / value pairs.
 */
export declare const queryStringFromObject: (query: Query) => string;
