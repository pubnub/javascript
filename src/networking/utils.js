/* @flow */

export function encodedKeyValuePair(pairs: Array<string>, key: string, value: Object): void {
  if (value != null) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        encodedKeyValuePair(pairs, key, item);
      });
    } else if (typeof value === 'object') {
      Object.keys(value).forEach((subkey) => {
        encodedKeyValuePair(pairs, `${key}[${subkey}]`, value[subkey]);
      });
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  } else if (value === null) {
    pairs.push(encodeURIComponent(`${encodeURIComponent(key)}`));
  }
}

export function buildUrl(url: string, params: Object): string {
  let pairs = [];

  Object.keys(params).forEach((key) => {
    encodedKeyValuePair(pairs, key, params[key]);
  });

  return `${url}?${pairs.join('&')}`;
}
