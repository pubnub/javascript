/* eslint no-unused-expressions: 0, block-scoped-var: 0, no-redeclare: 0, guard-for-in: 0 */

var defaultConfiguration = require('../defaults.json');

function rnow() {
  return +new Date;
}

function isArray(arg) {
  return !!arg && typeof arg !== 'string' && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === 'number');
  // return !!arg && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === "number")
}

/**
 * EACH
 * ====
 * each( [1,2,3], function(item) { } )
 */
function each(o, f) {
  if (!o || !f) {
    return;
  }

  if (isArray(o)) {
    for (var i = 0, l = o.length; i < l;) {
      f.call(o[i], o[i], i++);
    }
  } else {
    for (var i in o) {
      o.hasOwnProperty &&
      o.hasOwnProperty(i) &&
      f.call(o[i], i, o[i]);
    }
  }
}

/**
 * ENCODE
 * ======
 * var encoded_data = encode('path');
 */
function encode(path) { return encodeURIComponent(path); }

/**
 * Build Url
 * =======
 *
 */
function buildURL(urlComponents, urlParams) {
  var url = urlComponents.join(defaultConfiguration.URLBIT);
  var params = [];

  if (!urlParams) return url;

  each(urlParams, function (key, value) {
    var valueStr = (typeof value === 'object') ? JSON['stringify'](value) : value;
    (typeof value !== 'undefined' &&
      value !== null && encode(valueStr).length > 0
    ) && params.push(key + '=' + encode(valueStr));
  });

  url += '?' + params.join(defaultConfiguration.PARAMSBIT);
  return url;
}

/**
 * UPDATER
 * =======
 * var timestamp = unique();
 */
function updater(fun, rate) {
  var timeout;
  var last = 0;
  var runnit = function () {
    if (last + rate > rnow()) {
      clearTimeout(timeout);
      timeout = setTimeout(runnit, rate);
    } else {
      last = rnow();
      fun();
    }
  };

  return runnit;
}

module.exports = {
  buildURL: buildURL,
  encode: encode,
  each: each,
  updater: updater,
  rnow: rnow
};
