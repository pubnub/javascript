export const encodeString = (input) => {
    return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
};
export const encodeNames = (names, defaultString) => {
    const encodedNames = names.map((name) => encodeString(name));
    return encodedNames.length ? encodedNames.join(',') : defaultString !== null && defaultString !== void 0 ? defaultString : '';
};
export const removeSingleOccurance = (source, elementsToRemove) => {
    const removed = Object.fromEntries(elementsToRemove.map((prop) => [prop, false]));
    return source.filter((e) => {
        if (elementsToRemove.includes(e) && !removed[e]) {
            removed[e] = true;
            return false;
        }
        return true;
    });
};
export const findUniqueCommonElements = (a, b) => {
    return [...a].filter((value) => b.includes(value) && a.indexOf(value) === a.lastIndexOf(value) && b.indexOf(value) === b.lastIndexOf(value));
};
export const queryStringFromObject = (query) => {
    return Object.keys(query)
        .map((key) => {
        const queryValue = query[key];
        if (!Array.isArray(queryValue))
            return `${key}=${encodeString(queryValue)}`;
        return queryValue.map((value) => `${key}=${encodeString(value)}`).join('&');
    })
        .join('&');
};
