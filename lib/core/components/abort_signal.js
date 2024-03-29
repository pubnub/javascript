"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.AbortSignal = exports.AbortError = void 0;
var subject_1 = require("./subject");
var AbortError = /** @class */ (function (_super) {
    __extends(AbortError, _super);
    function AbortError() {
        var _newTarget = this.constructor;
        var _this = _super.call(this, 'The operation was aborted.') || this;
        _this.name = 'AbortError';
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return AbortError;
}(Error));
exports.AbortError = AbortError;
var AbortSignal = /** @class */ (function (_super) {
    __extends(AbortSignal, _super);
    function AbortSignal() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this._aborted = false;
        return _this;
    }
    Object.defineProperty(AbortSignal.prototype, "aborted", {
        get: function () {
            return this._aborted;
        },
        enumerable: false,
        configurable: true
    });
    AbortSignal.prototype.throwIfAborted = function () {
        if (this._aborted) {
            throw new AbortError();
        }
    };
    AbortSignal.prototype.abort = function () {
        this._aborted = true;
        this.notify(new AbortError());
    };
    return AbortSignal;
}(subject_1.Subject));
exports.AbortSignal = AbortSignal;
