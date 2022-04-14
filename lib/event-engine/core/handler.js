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
exports.asyncHandler = exports.Handler = void 0;
var abort_signal_1 = require("../../core/components/abort_signal");
var Handler = /** @class */ (function () {
    function Handler(payload, dependencies) {
        this.payload = payload;
        this.dependencies = dependencies;
    }
    return Handler;
}());
exports.Handler = Handler;
var AsyncHandler = /** @class */ (function (_super) {
    __extends(AsyncHandler, _super);
    function AsyncHandler(payload, dependencies, asyncFunction) {
        var _this = _super.call(this, payload, dependencies) || this;
        _this.asyncFunction = asyncFunction;
        _this.abortSignal = new abort_signal_1.AbortSignal();
        return _this;
    }
    AsyncHandler.prototype.start = function () {
        this.asyncFunction(this.payload, this.abortSignal, this.dependencies);
    };
    AsyncHandler.prototype.cancel = function () {
        this.abortSignal.abort();
    };
    return AsyncHandler;
}(Handler));
var asyncHandler = function (handlerFunction) {
    return function (payload, dependencies) {
        return new AsyncHandler(payload, dependencies, handlerFunction);
    };
};
exports.asyncHandler = asyncHandler;
