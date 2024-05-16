"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManagedEffect = exports.createEffect = exports.createEvent = void 0;
function createEvent(type, fn) {
    const creator = function (...args) {
        return {
            type,
            payload: fn === null || fn === void 0 ? void 0 : fn(...args),
        };
    };
    creator.type = type;
    return creator;
}
exports.createEvent = createEvent;
function createEffect(type, fn) {
    const creator = (...args) => {
        return { type, payload: fn(...args), managed: false };
    };
    creator.type = type;
    return creator;
}
exports.createEffect = createEffect;
function createManagedEffect(type, fn) {
    const creator = (...args) => {
        return { type, payload: fn(...args), managed: true };
    };
    creator.type = type;
    creator.cancel = { type: 'CANCEL', payload: type, managed: false };
    return creator;
}
exports.createManagedEffect = createManagedEffect;
