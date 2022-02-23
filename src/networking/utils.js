/*       */

export function encodedKeyValuePair(pairs, key, value) {
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

export function buildUrl(url, params) {
  const pairs = [];

  Object.keys(params).forEach((key) => {
    encodedKeyValuePair(pairs, key, params[key]);
  });

  return `${url}?${pairs.join('&')}`;
}
