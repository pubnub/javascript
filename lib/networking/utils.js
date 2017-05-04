'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.encodedKeyValuePair = encodedKeyValuePair;
exports.buildUrl = buildUrl;
function encodedKeyValuePair(pairs, key, value) {
  if (value != null) {
    if (Array.isArray(value)) {
      value.forEach(function (item) {
        encodedKeyValuePair(pairs, key, item);
      });
    } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
      Object.keys(value).forEach(function (subkey) {
        encodedKeyValuePair(pairs, key + '[' + subkey + ']', value[subkey]);
      });
    } else {
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
  } else if (value === null) {
    pairs.push(encodeURIComponent('' + encodeURIComponent(key)));
  }
}

function buildUrl(url, params) {
  var pairs = [];

  Object.keys(params).forEach(function (key) {
    encodedKeyValuePair(pairs, key, params[key]);
  });

  return url + '?' + pairs.join('&');
}
//# sourceMappingURL=utils.js.map
