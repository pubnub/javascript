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

module.exports = {
  signPamFromParams,
  endsWith,
  createPromise,
  encodeString,
};
