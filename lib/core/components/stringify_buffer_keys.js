"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyBufferKeys = void 0;
function stringifyBufferKeys(obj) {
    var isObject = function (value) { return value && typeof value === 'object' && value.constructor === Object; };
    var isString = function (value) { return typeof value === 'string' || value instanceof String; };
    var isNumber = function (value) { return typeof value === 'number' && isFinite(value); };
    if (!isObject(obj)) {
        return obj;
    }
    var normalizedObject = {};
    Object.keys(obj).forEach(function (key) {
        var keyIsString = isString(key);
        var stringifiedKey = key;
        var value = obj[key];
        if (Array.isArray(key) || (keyIsString && key.indexOf(',') >= 0)) {
            var bytes = keyIsString ? key.split(',') : key;
            stringifiedKey = bytes.reduce(function (string, byte) {
                string += String.fromCharCode(byte);
                return string;
            }, '');
        }
        else if (isNumber(key) || (keyIsString && !isNaN(key))) {
            stringifiedKey = String.fromCharCode(keyIsString ? parseInt(key, 10) : 10);
        }
        normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value) : value;
    });
    return normalizedObject;
}
exports.stringifyBufferKeys = stringifyBufferKeys;
