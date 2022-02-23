/*       */

function objectToList(o) {
  const l = [];
  Object.keys(o).forEach((key) => l.push(key));
  return l;
}

function encodeString(input) {
  return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
}

function objectToListSorted(o) {
  return objectToList(o).sort();
}

function signPamFromParams(params) {
  const l = objectToListSorted(params);
  return l.map((paramKey) => `${paramKey}=${encodeString(params[paramKey])}`).join('&');
}

function endsWith(searchString, suffix) {
  return searchString.indexOf(suffix, this.length - suffix.length) !== -1;
}

function createPromise() {
  let successResolve;
  let failureResolve;
  const promise = new Promise((fulfill, reject) => {
    successResolve = fulfill;
    failureResolve = reject;
  });

  return { promise, reject: failureResolve, fulfill: successResolve };
}

const deprecationMessage = `The Objects v1 API has been deprecated.
You can learn more about Objects v2 API at https://www.pubnub.com/docs/web-javascript/api-reference-objects.
If you have questions about the Objects v2 API or require additional help with migrating to the new data model,
please contact PubNub Support at support@pubnub.com.`;

function deprecated(fn) {
  return (...args) => {
    if (typeof process !== 'undefined') {
      if (process?.env?.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.warn(deprecationMessage);
      }
    }

    return fn(...args);
  };
}

module.exports = {
  signPamFromParams,
  endsWith,
  createPromise,
  encodeString,
  deprecated,
};
