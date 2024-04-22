"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryStringFromObject = exports.findUniqueCommonElements = exports.removeSingleOccurance = exports.encodeNames = exports.encodeString = void 0;
const encodeString = (input) => {
    return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
};
exports.encodeString = encodeString;
const encodeNames = (names, defaultString) => {
    const encodedNames = names.map((name) => (0, exports.encodeString)(name));
    return encodedNames.length ? encodedNames.join(',') : defaultString !== null && defaultString !== void 0 ? defaultString : '';
};
exports.encodeNames = encodeNames;
const removeSingleOccurance = (source, elementsToRemove) => {
    const removed = Object.fromEntries(elementsToRemove.map((prop) => [prop, false]));
    return source.filter((e) => {
        if (elementsToRemove.includes(e) && !removed[e]) {
            removed[e] = true;
            return false;
        }
        return true;
    });
};
exports.removeSingleOccurance = removeSingleOccurance;
const findUniqueCommonElements = (a, b) => {
    return [...a].filter((value) => b.includes(value) && a.indexOf(value) === a.lastIndexOf(value) && b.indexOf(value) === b.lastIndexOf(value));
};
exports.findUniqueCommonElements = findUniqueCommonElements;
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
