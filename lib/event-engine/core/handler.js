"use strict";
/**
 * Event Engine Core Effects handler module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.Handler = void 0;
const abort_signal_1 = require("../../core/components/abort_signal");
/**
 * Synchronous (short-term) effect invocation handler.
 *
 * Handler manages effect execution on behalf of effect dispatcher.
 *
 * @internal
 */
class Handler {
    constructor(payload, dependencies) {
        this.payload = payload;
        this.dependencies = dependencies;
    }
}
exports.Handler = Handler;
/**
 * Asynchronous (long-running) effect invocation handler.
 *
 * Handler manages effect execution on behalf of effect dispatcher.
 *
 * @internal
 */
class AsyncHandler extends Handler {
    constructor(payload, dependencies, asyncFunction) {
        super(payload, dependencies);
        this.asyncFunction = asyncFunction;
        this.abortSignal = new abort_signal_1.AbortSignal();
    }
    start() {
        this.asyncFunction(this.payload, this.abortSignal, this.dependencies).catch((error) => {
            // console.log('Unhandled error:', error);
            // swallow the error
        });
    }
    cancel() {
        this.abortSignal.abort();
    }
}
/**
 * Asynchronous effect invocation handler constructor.
 *
 * @param handlerFunction - Function which performs asynchronous action and should be called on `start`.
 *
 * @internal
 */
const asyncHandler = (handlerFunction) => (payload, dependencies) => new AsyncHandler(payload, dependencies, handlerFunction);
exports.asyncHandler = asyncHandler;
