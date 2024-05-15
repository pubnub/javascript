"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryPolicy = void 0;
class RetryPolicy {
    static LinearRetryPolicy(configuration) {
        return {
            delay: configuration.delay,
            maximumRetry: configuration.maximumRetry,
            /* eslint-disable  @typescript-eslint/no-explicit-any */
            shouldRetry(error, attempt) {
                var _a;
                if (((_a = error === null || error === void 0 ? void 0 : error.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                    return false;
                }
                return this.maximumRetry > attempt;
            },
            getDelay(_, reason) {
                var _a;
                const delay = (_a = reason.retryAfter) !== null && _a !== void 0 ? _a : this.delay;
                return (delay + Math.random()) * 1000;
            },
            /* eslint-disable  @typescript-eslint/no-explicit-any */
            getGiveupReason(error, attempt) {
                var _a;
                if (this.maximumRetry <= attempt) {
                    return 'retry attempts exhaused.';
                }
                if (((_a = error === null || error === void 0 ? void 0 : error.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                    return 'forbidden operation.';
                }
                return 'unknown error';
            },
            validate() {
                if (this.maximumRetry > 10)
                    throw new Error('Maximum retry for linear retry policy can not be more than 10');
            },
        };
    }
    static ExponentialRetryPolicy(configuration) {
        return {
            minimumDelay: configuration.minimumDelay,
            maximumDelay: configuration.maximumDelay,
            maximumRetry: configuration.maximumRetry,
            shouldRetry(reason, attempt) {
                var _a;
                if (((_a = reason === null || reason === void 0 ? void 0 : reason.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                    return false;
                }
                return this.maximumRetry > attempt;
            },
            getDelay(attempt, reason) {
                var _a;
                const delay = (_a = reason.retryAfter) !== null && _a !== void 0 ? _a : Math.min(Math.pow(2, attempt), this.maximumDelay);
                return (delay + Math.random()) * 1000;
            },
            getGiveupReason(reason, attempt) {
                var _a;
                if (this.maximumRetry <= attempt) {
                    return 'retry attempts exhausted.';
                }
                if (((_a = reason === null || reason === void 0 ? void 0 : reason.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                    return 'forbidden operation.';
                }
                return 'unknown error';
            },
            validate() {
                if (this.minimumDelay < 2)
                    throw new Error('Minimum delay can not be set less than 2 seconds for retry');
                else if (this.maximumDelay)
                    throw new Error('Maximum delay can not be set more than 150 seconds for retry');
                else if (this.maximumRetry > 6)
                    throw new Error('Maximum retry for exponential retry policy can not be more than 6');
            },
        };
    }
}
exports.RetryPolicy = RetryPolicy;
