"use strict";
/**
 * PubNub package utilities module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageFingerprint = exports.adjustedTimetokenBy = exports.referenceSubscribeTimetoken = exports.subscriptionTimetokenFromReference = exports.queryStringFromObject = exports.findUniqueCommonElements = exports.removeSingleOccurrence = exports.encodeNames = exports.encodeString = void 0;
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
 *
 * @internal
 */
const encodeNames = (names, defaultString) => {
    const encodedNames = names.map((name) => (0, exports.encodeString)(name));
    return encodedNames.length ? encodedNames.join(',') : (defaultString !== null && defaultString !== void 0 ? defaultString : '');
};
exports.encodeNames = encodeNames;
/**
 * @internal
 */
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
/**
 * @internal
 */
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
 *
 * @internal
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
/**
 * Adjust `timetoken` to represent current time in PubNub's high-precision time format.
 *
 * @param timetoken - Timetoken recently used for subscribe long-poll request.
 * @param [referenceTimetoken] - Previously computed reference timetoken.
 *
 * @returns Adjusted timetoken if recent timetoken available.
 */
const subscriptionTimetokenFromReference = (timetoken, referenceTimetoken) => {
    if (referenceTimetoken === '0' || timetoken === '0')
        return undefined;
    const timetokenDiff = (0, exports.adjustedTimetokenBy)(`${Date.now()}0000`, referenceTimetoken, false);
    return (0, exports.adjustedTimetokenBy)(timetoken, timetokenDiff, true);
};
exports.subscriptionTimetokenFromReference = subscriptionTimetokenFromReference;
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
const referenceSubscribeTimetoken = (serviceTimetoken, catchUpTimetoken, referenceTimetoken) => {
    if (!serviceTimetoken || serviceTimetoken.length === 0)
        return undefined;
    if (catchUpTimetoken && catchUpTimetoken.length > 0 && catchUpTimetoken !== '0') {
        // Compensate reference timetoken because catch-up timetoken has been used.
        const timetokensDiff = (0, exports.adjustedTimetokenBy)(serviceTimetoken, catchUpTimetoken, false);
        return (0, exports.adjustedTimetokenBy)(referenceTimetoken !== null && referenceTimetoken !== void 0 ? referenceTimetoken : `${Date.now()}0000`, timetokensDiff.replace('-', ''), Number(timetokensDiff) < 0);
    }
    else if (referenceTimetoken && referenceTimetoken.length > 0 && referenceTimetoken !== '0')
        return referenceTimetoken;
    else
        return `${Date.now()}0000`;
};
exports.referenceSubscribeTimetoken = referenceSubscribeTimetoken;
/**
 * High-precision time token adjustment.
 *
 * @param timetoken - Source timetoken which should be adjusted.
 * @param value - Value in nanoseconds which should be used for source timetoken adjustment.
 * @param increment - Whether source timetoken should be incremented or decremented.
 *
 * @returns Adjusted high-precision PubNub timetoken.
 */
const adjustedTimetokenBy = (timetoken, value, increment) => {
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
    if (ticks >= 10000000) {
        seconds += Math.floor(ticks / 10000000);
        ticks %= 10000000;
    }
    else if (ticks < 0) {
        if (seconds > 0) {
            seconds -= 1;
            ticks += 10000000;
        }
        else if (seconds < 0)
            ticks *= -1;
    }
    else if (seconds < 0 && ticks > 0) {
        seconds += 1;
        ticks = 10000000 - ticks;
    }
    return seconds !== 0 ? `${seconds}${`${ticks}`.padStart(7, '0')}` : `${ticks}`;
};
exports.adjustedTimetokenBy = adjustedTimetokenBy;
/**
 * Compute received update (message, event) fingerprint.
 *
 * @param input - Data payload from subscribe API response.
 *
 * @returns Received update fingerprint.
 */
const messageFingerprint = (input) => {
    const msg = typeof input !== 'string' ? JSON.stringify(input) : input;
    const mfp = new Uint32Array(1);
    let walk = 0;
    let len = msg.length;
    while (len-- > 0)
        mfp[0] = (mfp[0] << 5) - mfp[0] + msg.charCodeAt(walk++);
    return mfp[0].toString(16).padStart(8, '0');
};
exports.messageFingerprint = messageFingerprint;
