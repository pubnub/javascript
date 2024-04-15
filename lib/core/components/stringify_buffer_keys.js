export function stringifyBufferKeys(obj) {
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
        if (keyIsString && key.indexOf(',') >= 0) {
            const bytes = key.split(',').map(Number);
            stringifiedKey = bytes.reduce((string, byte) => {
                return string + String.fromCharCode(byte);
            }, '');
        }
        else if (isNumber(key) || (keyIsString && !isNaN(Number(key)))) {
            stringifiedKey = String.fromCharCode(isNumber(key) ? key : parseInt(key, 10));
        }
        normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value) : value;
    });
    return normalizedObject;
}
