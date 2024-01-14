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
                if (reason === null || reason === void 0 ? void 0 : reason.retryAfter) {
                    return reason.retryAfter * 1000;
                }
                return (this.delay + Math.random()) * 1000;
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
                if (reason === null || reason === void 0 ? void 0 : reason.retryAfter) {
                    return reason.retryAfter * 1000;
                }
                var calculatedDelay = (Math.pow(2, attempt) + Math.random()) * 1000;
                if (calculatedDelay > this.maximumDelay) {
                    return this.maximumDelay;
                }
                else {
                    return calculatedDelay;
                }
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
