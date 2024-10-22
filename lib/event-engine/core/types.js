"use strict";
/**
 * Event Engine Core types module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManagedEffect = exports.createEffect = exports.createEvent = void 0;
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
exports.createEvent = createEvent;
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
exports.createEffect = createEffect;
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
exports.createManagedEffect = createManagedEffect;
