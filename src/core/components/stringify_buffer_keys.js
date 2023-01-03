export function stringifyBufferKeys(obj) {
  const isObject = (value) => value && typeof value === 'object' && value.constructor === Object;
  const isString = (value) => typeof value === 'string' || value instanceof String;
  const isNumber = (value) => typeof value === 'number' && isFinite(value);

  if (!isObject(obj)) {
    return obj;
  }

  const normalizedObject = {};

  Object.keys(obj).forEach((key) => {
    const keyIsString = isString(key);
    let stringifiedKey = key;
    const value = obj[key];

    if (Array.isArray(key) || (keyIsString && key.indexOf(',') >= 0)) {
      const bytes = keyIsString ? key.split(',') : key;

      stringifiedKey = bytes.reduce((string, byte) => {
        string += String.fromCharCode(byte);
        return string;
      }, '');
    } else if (isNumber(key) || (keyIsString && !isNaN(key))) {
      stringifiedKey = String.fromCharCode(keyIsString ? parseInt(key, 10) : 10);
    }

    normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value) : value;
  });

  return normalizedObject;
}
