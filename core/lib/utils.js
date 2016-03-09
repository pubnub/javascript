'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-unused-expressions: 0, block-scoped-var: 0, no-redeclare: 0, guard-for-in: 0 */

var defaultConfiguration = require('../defaults.json');
var REPL = /{([\w\-]+)}/g;

function rnow() {
  return +new Date();
}

function isArray(arg) {
  return !!arg && typeof arg !== 'string' && (Array.isArray && Array.isArray(arg) || typeof arg.length === 'number');
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
      o.hasOwnProperty && o.hasOwnProperty(i) && f.call(o[i], i, o[i]);
    }
  }
}

/**
 * ENCODE
 * ======
 * var encoded_data = encode('path');
 */
function encode(path) {
  return encodeURIComponent(path);
}

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
    var valueStr = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? JSON['stringify'](value) : value;
    typeof value !== 'undefined' && value !== null && encode(valueStr).length > 0 && params.push(key + '=' + encode(valueStr));
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
  var runnit = function runnit() {
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

/**
 * GREP
 * ====
 * var list = grep( [1,2,3], function(item) { return item % 2 } )
 */
function grep(list, fun) {
  var fin = [];
  each(list || [], function (l) {
    fun(l) && fin.push(l);
  });
  return fin;
}

/**
 * SUPPLANT
 * ========
 * var text = supplant( 'Hello {name}!', { name : 'John' } )
 */
function supplant(str, values) {
  return str.replace(REPL, function (_, match) {
    return values[match] || _;
  });
}

/**
 * timeout
 * =======
 * timeout( function(){}, 100 );
 */
function timeout(fun, wait) {
  if (typeof setTimeout === 'undefined') {
    return;
  }

  return setTimeout(fun, wait);
}

/**
 * uuid
 * ====
 * var my_uuid = generateUUID();
 */
function generateUUID(callback) {
  var u = _uuid2.default.v4();
  if (callback) callback(u);
  return u;
}

/**
 * MAP
 * ===
 * var list = map( [1,2,3], function(item) { return item + 1 } )
 */
function map(list, fun) {
  var fin = [];
  each(list || [], function (k, v) {
    fin.push(fun(k, v));
  });
  return fin;
}

function pamEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*~]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

function _object_to_key_list(o) {
  var l = [];
  each(o, function (key) {
    l.push(key);
  });
  return l;
}

function _object_to_key_list_sorted(o) {
  return _object_to_key_list(o).sort();
}

function _get_pam_sign_input_from_params(params) {
  var l = _object_to_key_list_sorted(params);
  return map(l, function (paramKey) {
    return paramKey + '=' + pamEncode(params[paramKey]);
  }).join('&');
}

function validateHeartbeat(heartbeat, cur_heartbeat, error) {
  var err = false;

  if (typeof heartbeat === 'undefined') {
    return cur_heartbeat;
  }

  if (typeof heartbeat === 'number') {
    if (heartbeat > defaultConfiguration._minimumHeartbeatInterval || heartbeat === 0) {
      err = false;
    } else {
      err = true;
    }
  } else if (typeof heartbeat === 'boolean') {
    if (!heartbeat) {
      return 0;
    } else {
      return defaultConfiguration._defaultHeartbeatInterval;
    }
  } else {
    err = true;
  }

  if (err) {
    if (error) {
      var errorMessage = 'Presence Heartbeat value invalid. Valid range ( x >';
      errorMessage += defaultConfiguration._minimumHeartbeatInterval + ' or x = 0). Current Value : ';
      errorMessage += cur_heartbeat || defaultConfiguration._minimumHeartbeatInterval;

      error(errorMessage);
    }
    return cur_heartbeat || defaultConfiguration._minimumHeartbeatInterval;
  } else return heartbeat;
}

module.exports = {
  buildURL: buildURL,
  encode: encode,
  each: each,
  updater: updater,
  rnow: rnow,
  isArray: isArray,
  map: map,
  pamEncode: pamEncode,
  generateUUID: generateUUID,
  timeout: timeout,
  supplant: supplant,
  grep: grep,
  _get_pam_sign_input_from_params: _get_pam_sign_input_from_params,
  _object_to_key_list_sorted: _object_to_key_list_sorted,
  _object_to_key_list: _object_to_key_list,
  validateHeartbeat: validateHeartbeat
};
//# sourceMappingURL=utils.js.map
