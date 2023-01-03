import { AbortSignal } from '../../core/components/abort_signal';

export abstract class Handler<Payload, Dependencies> {
  constructor(protected payload: Payload, protected readonly dependencies: Dependencies) {}

  abstract start(): void;
  abstract cancel(): void;
}

type AsyncHandlerFunction<Payload, Dependencies> = (
  payload: Payload,
  abortSignal: AbortSignal,
  dependencies: Dependencies,
) => Promise<void>;

class AsyncHandler<Payload, Dependencies> extends Handler<Payload, Dependencies> {
  abortSignal = new AbortSignal();

  constructor(
    payload: Payload,
    dependencies: Dependencies,
    private asyncFunction: AsyncHandlerFunction<Payload, Dependencies>,
  ) {
    super(payload, dependencies);
  }

  start() {
    this.asyncFunction(this.payload, this.abortSignal, this.dependencies);
  }

  cancel() {
    this.abortSignal.abort();
  }
}

export const asyncHandler =
  <Payload, Dependencies>(handlerFunction: AsyncHandlerFunction<Payload, Dependencies>) =>
  (payload: Payload, dependencies: Dependencies) =>
    new AsyncHandler(payload, dependencies, handlerFunction);
