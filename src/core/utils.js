/* @flow */

import uuidGenerator from 'uuid';

/* eslint no-unused-expressions: 0, block-scoped-var: 0, no-redeclare: 0, guard-for-in: 0 */

let defaultConfiguration = require('../../defaults.json');
let NOW = 1;

function rnow(): number {
  return +new Date;
}

function unique(): string {
  return 'x' + ++NOW + '' + (+new Date);
}

function isArray(arg: Object): boolean {
  return !!arg && typeof arg !== 'string' && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === 'number');
  // return !!arg && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === "number")
}

/**
 * EACH
 * ====
 * each( [1,2,3], function(item) { } )
 */
function each(o: Object, f: Function) {
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
function encode(path: string): string {
  console.log(path, encodeURIComponent(path))

  return encodeURIComponent(path);
}

/**
 * Build Url
 * =======
 *
 */
function buildURL(urlComponents: Array<string>, urlParams: Object): string {
  var url = urlComponents.join(defaultConfiguration.URLBIT);
  var params = [];

  if (!urlParams) return url;

  each(urlParams, function (key, value) {
    var valueStr = (typeof value === 'object') ? JSON.stringify(value) : value;
    (typeof value !== 'undefined' &&
      value !== null && encode(valueStr).length > 0
    ) && params.push(key + '=' + encode(valueStr));
  });

  url += '?' + params.join(defaultConfiguration.PARAMSBIT);
  return url;
}

/**
 * timeout
 * =======
 * timeout( function(){}, 100 );
 */
function timeout(fun, wait) {
  if (typeof(setTimeout) === 'undefined') {
    return;
  }

  return setTimeout(fun, wait);
}

/**
 * uuid
 * ====
 * var my_uuid = generateUUID();
 */
function generateUUID(callback: Function): string {
  var u = uuidGenerator.v4();
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

function _object_to_key_list(o: Object): Array<mixed> {
  let l = [];
  each(o, function (key) {
    l.push(key);
  });
  return l;
}

function _object_to_key_list_sorted(o: Object): Array<mixed> {
  return _object_to_key_list(o).sort();
}

function _get_pam_sign_input_from_params(params: Object): string {
  let l = _object_to_key_list_sorted(params);
  return map(l, (paramKey) => paramKey + '=' + pamEncode(params[paramKey])).join('&');
}

function validateHeartbeat(heartbeat: number, cur_heartbeat: number, error: Function): number {
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
      let errorMessage = 'Presence Heartbeat value invalid. Valid range ( x >';
      errorMessage += defaultConfiguration._minimumHeartbeatInterval + ' or x = 0). Current Value : ';
      errorMessage += (cur_heartbeat || defaultConfiguration._minimumHeartbeatInterval);

      error(errorMessage);
    }
    return cur_heartbeat || defaultConfiguration._minimumHeartbeatInterval;
  } else return heartbeat;
}

module.exports = {
  buildURL: buildURL,
  encode: encode,
  each: each,
  rnow: rnow,
  isArray: isArray,
  map: map,
  pamEncode: pamEncode,
  generateUUID: generateUUID,
  timeout: timeout,
  _get_pam_sign_input_from_params: _get_pam_sign_input_from_params,
  _object_to_key_list_sorted: _object_to_key_list_sorted,
  _object_to_key_list: _object_to_key_list,
  validateHeartbeat: validateHeartbeat,
  unique: unique
};
