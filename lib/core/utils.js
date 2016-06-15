'use strict';

function isArray(arg) {
  return !!arg && typeof arg !== 'string' && (Array.isArray && Array.isArray(arg) || typeof arg.length === 'number');
}

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

function encode(path) {
  return encodeURIComponent(path);
}

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

module.exports = {
  encode: encode,
  each: each,
  isArray: isArray,
  map: map,
  pamEncode: pamEncode,
  _get_pam_sign_input_from_params: _get_pam_sign_input_from_params,
  _object_to_key_list_sorted: _object_to_key_list_sorted,
  _object_to_key_list: _object_to_key_list,
  endsWith: function endsWith(searchString, suffix) {
    return searchString.indexOf(suffix, this.length - suffix.length) !== -1;
  }
};
//# sourceMappingURL=utils.js.map
