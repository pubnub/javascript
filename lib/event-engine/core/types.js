"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManagedEffect = exports.createEffect = exports.createEvent = void 0;
function createEvent(type, fn) {
    var creator = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return {
            type: type,
            payload: fn === null || fn === void 0 ? void 0 : fn.apply(void 0, __spreadArray([], __read(args), false)),
        };
    };
    creator.type = type;
    return creator;
}
exports.createEvent = createEvent;
function createEffect(type, fn) {
    var creator = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return { type: type, payload: fn.apply(void 0, __spreadArray([], __read(args), false)), managed: false };
    };
    creator.type = type;
    return creator;
}
exports.createEffect = createEffect;
function createManagedEffect(type, fn) {
    var creator = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return { type: type, payload: fn.apply(void 0, __spreadArray([], __read(args), false)), managed: true };
    };
    creator.type = type;
    creator.cancel = { type: 'CANCEL', payload: type, managed: false };
    return creator;
}
exports.createManagedEffect = createManagedEffect;
