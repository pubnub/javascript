"use strict";

function objectToList(o) {
  var l = [];
  Object.keys(o).forEach(function (key) {
    return l.push(key);
  });
  return l;
}

function encodeString(input) {
  return encodeURIComponent(input).replace(/[!~*'()]/g, function (x) {
    return "%".concat(x.charCodeAt(0).toString(16).toUpperCase());
  });
}

function objectToListSorted(o) {
  return objectToList(o).sort();
}

function signPamFromParams(params) {
  var l = objectToListSorted(params);
  return l.map(function (paramKey) {
    return "".concat(paramKey, "=").concat(encodeString(params[paramKey]));
  }).join('&');
}

function endsWith(searchString, suffix) {
  return searchString.indexOf(suffix, this.length - suffix.length) !== -1;
}

function createPromise() {
  var successResolve;
  var failureResolve;
  var promise = new Promise(function (fulfill, reject) {
    successResolve = fulfill;
    failureResolve = reject;
  });
  return {
    promise: promise,
    reject: failureResolve,
    fulfill: successResolve
  };
}

var deprecationMessage = "The Objects v1 API has been deprecated.\nYou can learn more about Objects v2 API at https://www.pubnub.com/docs/web-javascript/api-reference-objects.\nIf you have questions about the Objects v2 API or require additional help with migrating to the new data model, please contact PubNub Support at support@pubnub.com.";

function deprecated(fn) {
  return function () {
    if (typeof process !== 'undefined') {
      var _process, _process$env;

      if (((_process = process) === null || _process === void 0 ? void 0 : (_process$env = _process.env) === null || _process$env === void 0 ? void 0 : _process$env.NODE_ENV) !== 'test') {
        console.warn(deprecationMessage);
      }
    }

    return fn.apply(void 0, arguments);
  };
}

module.exports = {
  signPamFromParams: signPamFromParams,
  endsWith: endsWith,
  createPromise: createPromise,
  encodeString: encodeString,
  deprecated: deprecated
};
//# sourceMappingURL=utils.js.map
