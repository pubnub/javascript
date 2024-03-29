"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryStringFromObject = exports.findUniqueCommonElements = exports.removeSingleOccurance = exports.encodeString = void 0;
/**
 * Percent-encode input string.
 *
 * **Note:** Encode content in accordance of the `PubNub` service requirements.
 *
 * @param input - Source string or number for encoding.
 *
 * @returns Percent-encoded string.
 */
var encodeString = function (input) {
    return encodeURIComponent(input).replace(/[!~*'()]/g, function (x) { return "%".concat(x.charCodeAt(0).toString(16).toUpperCase()); });
};
exports.encodeString = encodeString;
var removeSingleOccurance = function (source, elementsToRemove) {
    var removed = Object.fromEntries(elementsToRemove.map(function (prop) { return [prop, false]; }));
    return source.filter(function (e) {
        if (elementsToRemove.includes(e) && !removed[e]) {
            removed[e] = true;
            return false;
        }
        return true;
    });
};
exports.removeSingleOccurance = removeSingleOccurance;
var findUniqueCommonElements = function (a, b) {
    return __spreadArray([], __read(a), false).filter(function (value) {
        return b.includes(value) && a.indexOf(value) === a.lastIndexOf(value) && b.indexOf(value) === b.lastIndexOf(value);
    });
};
exports.findUniqueCommonElements = findUniqueCommonElements;
/**
 * Transform query key / value pairs to the string.
 *
 * @param query - Key / value pairs of the request query parameters.
 *
 * @returns Stringified query key / value pairs.
 */
var queryStringFromObject = function (query) {
    return Object.keys(query)
        .map(function (key) {
        var queryValue = query[key];
        if (!Array.isArray(queryValue))
            return "".concat(key, "=").concat((0, exports.encodeString)(queryValue));
        return queryValue.map(function (value) { return "".concat(key, "=").concat((0, exports.encodeString)(value)); }).join('&');
    })
        .join('&');
};
exports.queryStringFromObject = queryStringFromObject;
