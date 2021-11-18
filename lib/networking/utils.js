"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildUrl = buildUrl;
exports.encodedKeyValuePair = encodedKeyValuePair;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function encodedKeyValuePair(pairs, key, value) {
  if (value != null) {
    if (Array.isArray(value)) {
      value.forEach(function (item) {
        encodedKeyValuePair(pairs, key, item);
      });
    } else if ((0, _typeof2["default"])(value) === 'object') {
      Object.keys(value).forEach(function (subkey) {
        encodedKeyValuePair(pairs, "".concat(key, "[").concat(subkey, "]"), value[subkey]);
      });
    } else {
      pairs.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(value)));
    }
  } else if (value === null) {
    pairs.push(encodeURIComponent("".concat(encodeURIComponent(key))));
  }
}

function buildUrl(url, params) {
  var pairs = [];
  Object.keys(params).forEach(function (key) {
    encodedKeyValuePair(pairs, key, params[key]);
  });
  return "".concat(url, "?").concat(pairs.join('&'));
}
//# sourceMappingURL=utils.js.map
