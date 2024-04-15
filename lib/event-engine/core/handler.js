import { AbortSignal } from '../../core/components/abort_signal';
export class Handler {
    constructor(payload, dependencies) {
        this.payload = payload;
        this.dependencies = dependencies;
    }
}
class AsyncHandler extends Handler {
    constructor(payload, dependencies, asyncFunction) {
        super(payload, dependencies);
        this.asyncFunction = asyncFunction;
        this.abortSignal = new AbortSignal();
    }
    start() {
        this.asyncFunction(this.payload, this.abortSignal, this.dependencies).catch((error) => {
        });
    }
    cancel() {
        this.abortSignal.abort();
    }
}
export const asyncHandler = (handlerFunction) => (payload, dependencies) => new AsyncHandler(payload, dependencies, handlerFunction);
