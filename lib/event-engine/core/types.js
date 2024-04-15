export function createEvent(type, fn) {
    const creator = function (...args) {
        return {
            type,
            payload: fn === null || fn === void 0 ? void 0 : fn(...args),
        };
    };
    creator.type = type;
    return creator;
}
export function createEffect(type, fn) {
    const creator = (...args) => {
        return { type, payload: fn(...args), managed: false };
    };
    creator.type = type;
    return creator;
}
export function createManagedEffect(type, fn) {
    const creator = (...args) => {
        return { type, payload: fn(...args), managed: true };
    };
    creator.type = type;
    creator.cancel = { type: 'CANCEL', payload: type, managed: false };
    return creator;
}
