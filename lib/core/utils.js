"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryStringFromObject = exports.findUniqueCommonElements = exports.removeSingleOccurrence = exports.encodeNames = exports.encodeString = void 0;
/**
 * Percent-encode input string.
 *
 * **Note:** Encode content in accordance of the `PubNub` service requirements.
 *
 * @param input - Source string or number for encoding.
 *
 * @returns Percent-encoded string.
 */
const encodeString = (input) => {
    return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
};
exports.encodeString = encodeString;
/**
 * Percent-encode list of names (channels).
 *
 * @param names - List of names which should be encoded.
 *
 * @param [defaultString] - String which should be used in case if {@link names} is empty.
 *
 * @returns String which contains encoded names joined by non-encoded `,`.
 */
const encodeNames = (names, defaultString) => {
    const encodedNames = names.map((name) => (0, exports.encodeString)(name));
    return encodedNames.length ? encodedNames.join(',') : defaultString !== null && defaultString !== void 0 ? defaultString : '';
};
exports.encodeNames = encodeNames;
const removeSingleOccurrence = (source, elementsToRemove) => {
    const removed = Object.fromEntries(elementsToRemove.map((prop) => [prop, false]));
    return source.filter((e) => {
        if (elementsToRemove.includes(e) && !removed[e]) {
            removed[e] = true;
            return false;
        }
        return true;
    });
};
exports.removeSingleOccurrence = removeSingleOccurrence;
const findUniqueCommonElements = (a, b) => {
    return [...a].filter((value) => b.includes(value) && a.indexOf(value) === a.lastIndexOf(value) && b.indexOf(value) === b.lastIndexOf(value));
};
exports.findUniqueCommonElements = findUniqueCommonElements;
/**
 * Transform query key / value pairs to the string.
 *
 * @param query - Key / value pairs of the request query parameters.
 *
 * @returns Stringified query key / value pairs.
 */
const queryStringFromObject = (query) => {
    return Object.keys(query)
        .map((key) => {
        const queryValue = query[key];
        if (!Array.isArray(queryValue))
            return `${key}=${(0, exports.encodeString)(queryValue)}`;
        return queryValue.map((value) => `${key}=${(0, exports.encodeString)(value)}`).join('&');
    })
        .join('&');
};
exports.queryStringFromObject = queryStringFromObject;
