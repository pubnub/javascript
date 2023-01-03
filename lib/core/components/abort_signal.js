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
        var _this = _super !== null && _super.apply(this, arguments) || this;
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
