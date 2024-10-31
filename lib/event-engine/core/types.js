"use strict";
/**
 * Event Engine Core types module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvent = createEvent;
exports.createEffect = createEffect;
exports.createManagedEffect = createManagedEffect;
/**
 * Create and configure event engine event.
 *
 * @internal
 */
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
/**
 * Create and configure short-term effect invocation.
 *
 * @internal
 */
function createEffect(type, fn) {
    const creator = (...args) => {
        return { type, payload: fn(...args), managed: false };
    };
    creator.type = type;
    return creator;
}
/**
 * Create and configure long-running effect invocation.
 *
 * @internal
 */
function createManagedEffect(type, fn) {
    const creator = (...args) => {
        return { type, payload: fn(...args), managed: true };
    };
    creator.type = type;
    creator.cancel = { type: 'CANCEL', payload: type, managed: false };
    return creator;
}
