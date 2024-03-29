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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationError = exports.PubNubError = void 0;
var PubNubError = /** @class */ (function (_super) {
    __extends(PubNubError, _super);
    function PubNubError(message, status) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        _this.status = status;
        _this.name = _this.constructor.name;
        _this.message = message;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return PubNubError;
}(Error));
exports.PubNubError = PubNubError;
function createError(errorPayload, type) {
    var _a;
    (_a = errorPayload.statusCode) !== null && _a !== void 0 ? _a : (errorPayload.statusCode = 0);
    return __assign(__assign({}, errorPayload), { statusCode: errorPayload.statusCode, error: true, type: type });
}
function createValidationError(message, statusCode) {
    return createError(__assign({ message: message }, (statusCode !== undefined ? { statusCode: statusCode } : {})), 'validationError');
}
exports.createValidationError = createValidationError;
