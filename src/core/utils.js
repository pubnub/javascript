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
  return encodeURIComponent(path);
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

function v2ChangeKey(o, ok, nk) {
  if (typeof o[ok] !== 'undefined') {
    let t = o[ok];
    o[nk] = t;
    delete o[ok];
  }
  return true;
}

function v2ExpandKeys(m: Object): Object {
  if (m.o) {
    v2ChangeKey(m.o, 't', 'timetoken');
    v2ChangeKey(m.o, 'r', 'regionCode');
  }

  if (m.p) {
    v2ChangeKey(m.p, 't', 'timetoken');
    v2ChangeKey(m.p, 'r', 'regionCode');
  }

  v2ChangeKey(m, 'a', 'shard');
  v2ChangeKey(m, 'b', 'subscriptionMatch');
  v2ChangeKey(m, 'c', 'channel');
  v2ChangeKey(m, 'd', 'payload');
  v2ChangeKey(m, 'ear', 'eatAfterReading');
  v2ChangeKey(m, 'f', 'flags');
  v2ChangeKey(m, 'i', 'issuing_client_id');
  v2ChangeKey(m, 'k', 'subscribeKey');
  v2ChangeKey(m, 's', 'sequenceNumber');
  v2ChangeKey(m, 'o', 'originationTimetoken');
  v2ChangeKey(m, 'p', 'publishTimetoken');
  v2ChangeKey(m, 'r', 'replicationMap');
  v2ChangeKey(m, 'u', 'userMetadata');
  v2ChangeKey(m, 'w', 'waypointList');

  return m;
}

module.exports = {
  v2ExpandKeys,
  encode,
  each,
  rnow,
  isArray,
  map,
  pamEncode,
  _get_pam_sign_input_from_params,
  _object_to_key_list_sorted,
  _object_to_key_list,
  validateHeartbeat,
  endsWith(searchString, suffix) {
    return searchString.indexOf(suffix, this.length - suffix.length) !== -1;
  }
};
