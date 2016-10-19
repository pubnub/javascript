'use strict';

function pamEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*~]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

function objectToList(o) {
  var l = [];
  Object.keys(o).forEach(function (key) {
    return l.push(key);
  });
  return l;
}

function objectToListSorted(o) {
  return objectToList(o).sort();
}

function signPamFromParams(params) {
  var l = objectToListSorted(params);
  return l.map(function (paramKey) {
    return paramKey + '=' + pamEncode(params[paramKey]);
  }).join('&');
}

function endsWith(searchString, suffix) {
  return searchString.indexOf(suffix, this.length - suffix.length) !== -1;
}

function createPromise() {
  var successResolve = void 0;
  var failureResolve = void 0;
  var promise = new Promise(function (fulfill, reject) {
    successResolve = fulfill;
    failureResolve = reject;
  });

  return { promise: promise, reject: failureResolve, fulfill: successResolve };
}

module.exports = { signPamFromParams: signPamFromParams, endsWith: endsWith, createPromise: createPromise };
//# sourceMappingURL=utils.js.map
