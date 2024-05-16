/**
 * Re-map CBOR object keys from potentially C buffer strings to actual strings.
 *
 * @param obj CBOR which should be remapped to stringified keys.
 *
 * @returns Dictionary with stringified keys.
 *
 * @internal
 */
export function stringifyBufferKeys(obj: unknown): Record<string, unknown> {
  const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && value.constructor === Object;
  const isString = (value: unknown): value is string => typeof value === 'string' || value instanceof String;
  const isNumber = (value: unknown): value is number => typeof value === 'number' && isFinite(value);

  if (!isObject(obj)) return obj as Record<string, unknown>;

  const normalizedObject: Record<string, unknown> = {};

  Object.keys(obj).forEach((key) => {
    const keyIsString = isString(key);
    let stringifiedKey = key;
    const value = obj[key];

    if (keyIsString && key.indexOf(',') >= 0) {
      const bytes = key.split(',').map(Number);

      stringifiedKey = bytes.reduce((string, byte) => {
        return string + String.fromCharCode(byte);
      }, '');
    } else if (isNumber(key) || (keyIsString && !isNaN(Number(key)))) {
      stringifiedKey = String.fromCharCode(isNumber(key) ? key : parseInt(key, 10));
    }

    normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value) : value;
  });

  return normalizedObject;
}
