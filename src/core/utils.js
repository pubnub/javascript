/* @flow */
/* eslint no-unused-expressions: 0, block-scoped-var: 0, no-redeclare: 0, guard-for-in: 0 */

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

module.exports = {
  encode,
  each,
  isArray,
  map,
  pamEncode,
  _get_pam_sign_input_from_params,
  _object_to_key_list_sorted,
  _object_to_key_list,
  endsWith(searchString: string, suffix: string): boolean {
    return searchString.indexOf(suffix, this.length - suffix.length) !== -1;
  }
};
