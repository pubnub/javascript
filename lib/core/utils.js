/**
 * Percent-encode input string.
 *
 * **Note:** Encode content in accordance of the `PubNub` service requirements.
 *
 * @param input - Source string or number for encoding.
 *
 * @returns Percent-encoded string.
 */
export const encodeString = (input) => {
    return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
};
export const removeSingleOccurance = (source, elementsToRemove) => {
    const removed = Object.fromEntries(elementsToRemove.map((prop) => [prop, false]));
    return source.filter((e) => {
        if (elementsToRemove.includes(e) && !removed[e]) {
            removed[e] = true;
            return false;
        }
        return true;
    });
};
export const findUniqueCommonElements = (a, b) => {
    return [...a].filter((value) => b.includes(value) && a.indexOf(value) === a.lastIndexOf(value) && b.indexOf(value) === b.lastIndexOf(value));
};
/**
 * Transform query key / value pairs to the string.
 *
 * @param query - Key / value pairs of the request query parameters.
 *
 * @returns Stringified query key / value pairs.
 */
export const queryStringFromObject = (query) => {
    return Object.keys(query)
        .map((key) => {
        const queryValue = query[key];
        if (!Array.isArray(queryValue))
            return `${key}=${encodeString(queryValue)}`;
        return queryValue.map((value) => `${key}=${encodeString(value)}`).join('&');
    })
        .join('&');
};
