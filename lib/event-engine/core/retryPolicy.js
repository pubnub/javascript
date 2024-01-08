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
            getDelay: function (_) {
                return this.delay * 1000;
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
            getDelay: function (attempt) {
                var calculatedDelay = Math.trunc(Math.pow(2, attempt)) * 1000 + Math.random() * 1000;
                if (calculatedDelay > 150000) {
                    return 150000;
                }
                else {
                    return calculatedDelay;
                }
            },
        };
    };
    return RetryPolicy;
}());
exports.RetryPolicy = RetryPolicy;
