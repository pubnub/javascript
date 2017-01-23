/* @flow */

function objectToList(o: Object): Array<any> {
  let l = [];
  Object.keys(o).forEach(key => l.push(key));
  return l;
}

function encodeString(input: string): string {
  return encodeURIComponent(input).replace(/[!~*'()]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
}

function objectToListSorted(o: Object): Array<any> {
  return objectToList(o).sort();
}

function signPamFromParams(params: Object): string {
  let l = objectToListSorted(params);
  return l.map(paramKey => `${paramKey}=${encodeString(params[paramKey])}`).join('&');
}

function endsWith(searchString: string, suffix: string): boolean {
  return searchString.indexOf(suffix, this.length - suffix.length) !== -1;
}

function createPromise() {
  let successResolve;
  let failureResolve;
  let promise = new Promise((fulfill, reject) => {
    successResolve = fulfill;
    failureResolve = reject;
  });

  return { promise, reject: failureResolve, fulfill: successResolve };
}

module.exports = { signPamFromParams, endsWith, createPromise, encodeString };
