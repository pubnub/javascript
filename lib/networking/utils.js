"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUrl = exports.encodedKeyValuePair = void 0;
function encodedKeyValuePair(pairs, key, value) {
    if (value != null) {
        if (Array.isArray(value)) {
            value.forEach(function (item) {
                encodedKeyValuePair(pairs, key, item);
            });
        }
        else if (typeof value === 'object') {
            Object.keys(value).forEach(function (subkey) {
                encodedKeyValuePair(pairs, "".concat(key, "[").concat(subkey, "]"), value[subkey]);
            });
        }
        else {
            pairs.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(value)));
        }
    }
    else if (value === null) {
        pairs.push(encodeURIComponent("".concat(encodeURIComponent(key))));
    }
}
exports.encodedKeyValuePair = encodedKeyValuePair;
function buildUrl(url, params) {
    var pairs = [];
    Object.keys(params).forEach(function (key) {
        encodedKeyValuePair(pairs, key, params[key]);
    });
    return "".concat(url, "?").concat(pairs.join('&'));
}
exports.buildUrl = buildUrl;
