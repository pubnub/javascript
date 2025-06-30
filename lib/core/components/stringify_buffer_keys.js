"use strict";
/**
 * CBOR support module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyBufferKeys = stringifyBufferKeys;
/**
 * Re-map CBOR object keys from potentially C buffer strings to actual strings.
 *
 * @param obj CBOR which should be remapped to stringified keys.
 * @param nestingLevel PAM token structure nesting level.
 *
 * @returns Dictionary with stringified keys.
 *
 * @internal
 */
function stringifyBufferKeys(obj, nestingLevel = 0) {
    const isObject = (value) => typeof value === 'object' && value !== null && value.constructor === Object;
    const isString = (value) => typeof value === 'string' || value instanceof String;
    const isNumber = (value) => typeof value === 'number' && isFinite(value);
    if (!isObject(obj))
        return obj;
    const normalizedObject = {};
    Object.keys(obj).forEach((key) => {
        const keyIsString = isString(key);
        let stringifiedKey = key;
        const value = obj[key];
        if (nestingLevel < 2) {
            if (keyIsString && key.indexOf(',') >= 0) {
                const bytes = key.split(',').map(Number);
                stringifiedKey = bytes.reduce((string, byte) => {
                    return string + String.fromCharCode(byte);
                }, '');
            }
            else if (isNumber(key) || (keyIsString && !isNaN(Number(key)))) {
                stringifiedKey = String.fromCharCode(isNumber(key) ? key : parseInt(key, 10));
            }
        }
        normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value, nestingLevel + 1) : value;
    });
    return normalizedObject;
}
