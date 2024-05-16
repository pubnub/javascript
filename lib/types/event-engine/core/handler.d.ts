import { AbortSignal } from '../../core/components/abort_signal';
export declare abstract class Handler<Payload, Dependencies> {
    protected payload: Payload;
    protected readonly dependencies: Dependencies;
    constructor(payload: Payload, dependencies: Dependencies);
    abstract start(): void;
    abstract cancel(): void;
}
type AsyncHandlerFunction<Payload, Dependencies> = (payload: Payload, abortSignal: AbortSignal, dependencies: Dependencies) => Promise<void>;
declare class AsyncHandler<Payload, Dependencies> extends Handler<Payload, Dependencies> {
    private asyncFunction;
    abortSignal: AbortSignal;
    constructor(payload: Payload, dependencies: Dependencies, asyncFunction: AsyncHandlerFunction<Payload, Dependencies>);
    start(): void;
    cancel(): void;
}
export declare const asyncHandler: <Payload, Dependencies>(handlerFunction: AsyncHandlerFunction<Payload, Dependencies>) => (payload: Payload, dependencies: Dependencies) => AsyncHandler<Payload, Dependencies>;
export {};
