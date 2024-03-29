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
            // TODO: Find out actual `error` type.
            /* eslint-disable  @typescript-eslint/no-explicit-any */
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
            // TODO: Find out actual `error` type.
            /* eslint-disable  @typescript-eslint/no-explicit-any */
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
            validate: function () {
                if (this.maximumRetry > 10)
                    throw new Error('Maximum retry for linear retry policy can not be more than 10');
            },
        };
    };
    RetryPolicy.ExponentialRetryPolicy = function (configuration) {
        return {
            minimumDelay: configuration.minimumDelay,
            maximumDelay: configuration.maximumDelay,
            maximumRetry: configuration.maximumRetry,
            shouldRetry: function (reason, attempt) {
                var _a;
                if (((_a = reason === null || reason === void 0 ? void 0 : reason.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                    return false;
                }
                return this.maximumRetry > attempt;
            },
            getDelay: function (attempt, reason) {
                var _a;
                var delay = (_a = reason.retryAfter) !== null && _a !== void 0 ? _a : Math.min(Math.pow(2, attempt), this.maximumDelay);
                return (delay + Math.random()) * 1000;
            },
            getGiveupReason: function (reason, attempt) {
                var _a;
                if (this.maximumRetry <= attempt) {
                    return 'retry attempts exhausted.';
                }
                if (((_a = reason === null || reason === void 0 ? void 0 : reason.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                    return 'forbidden operation.';
                }
                return 'unknown error';
            },
            validate: function () {
                if (this.minimumDelay < 2)
                    throw new Error('Minimum delay can not be set less than 2 seconds for retry');
                else if (this.maximumDelay)
                    throw new Error('Maximum delay can not be set more than 150 seconds for retry');
                else if (this.maximumRetry > 6)
                    throw new Error('Maximum retry for exponential retry policy can not be more than 6');
            },
        };
    };
    return RetryPolicy;
}());
exports.RetryPolicy = RetryPolicy;
