"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryPolicy = void 0;
var RetryPolicy = /** @class */ (function () {
    function RetryPolicy() {
    }
    RetryPolicy.LinearRetryPolicy = function (configuration) {
        return {
            delay: configuration.delay,
            maximumRetry: configuration.maximumRetry,
            shouldRetry: function (error, attempt) {
                var _a;
                if (((_a = error === null || error === void 0 ? void 0 : error.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                    return false;
                }
                return this.maximumRetry > attempt;
            },
            getDelay: function (_, reason) {
                var _a;
                var delay = (_a = reason.retryAfter) !== null && _a !== void 0 ? _a : this.delay;
                return (delay + Math.random()) * 1000;
            },
            getGiveupReason: function (error, attempt) {
                var _a;
                if (this.maximumRetry <= attempt) {
                    return 'retry attempts exhaused.';
                }
                if (((_a = error === null || error === void 0 ? void 0 : error.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                    return 'forbidden operation.';
                }
                return 'unknown error';
            },
        };
    };
    RetryPolicy.ExponentialRetryPolicy = function (configuration) {
        return {
            minimumDelay: configuration.minimumDelay,
            maximumDelay: configuration.maximumDelay,
            maximumRetry: configuration.maximumRetry,
            shouldRetry: function (error, attempt) {
                var _a;
                if (((_a = error === null || error === void 0 ? void 0 : error.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                    return false;
                }
                return this.maximumRetry > attempt;
            },
            getDelay: function (attempt, reason) {
                var _a;
                var delay = (_a = reason.retryAfter) !== null && _a !== void 0 ? _a : Math.min(Math.pow(2, attempt), this.maximumDelay);
                return (delay + Math.random()) * 1000;
            },
            getGiveupReason: function (error, attempt) {
                var _a;
                if (this.maximumRetry <= attempt) {
                    return 'retry attempts exhaused.';
                }
                if (((_a = error === null || error === void 0 ? void 0 : error.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                    return 'forbidden operation.';
                }
                return 'unknown error';
            },
        };
    };
    return RetryPolicy;
}());
exports.RetryPolicy = RetryPolicy;
