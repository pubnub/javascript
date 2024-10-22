/**
 * Event Engine Core Effects handler module.
 *
 * @internal
 */

import { AbortSignal } from '../../core/components/abort_signal';

/**
 * Synchronous (short-term) effect invocation handler.
 *
 * Handler manages effect execution on behalf of effect dispatcher.
 *
 * @internal
 */
export abstract class Handler<Payload, Dependencies> {
  constructor(
    protected payload: Payload,
    protected readonly dependencies: Dependencies,
  ) {}

  abstract start(): void;
  abstract cancel(): void;
}

/**
 * Asynchronous effect execution function definition.
 *
 * @internal
 */
type AsyncHandlerFunction<Payload, Dependencies> = (
  payload: Payload,
  abortSignal: AbortSignal,
  dependencies: Dependencies,
) => Promise<void>;

/**
 * Asynchronous (long-running) effect invocation handler.
 *
 * Handler manages effect execution on behalf of effect dispatcher.
 *
 * @internal
 */
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
export const asyncHandler =
  <Payload, Dependencies>(handlerFunction: AsyncHandlerFunction<Payload, Dependencies>) =>
  (payload: Payload, dependencies: Dependencies) =>
    new AsyncHandler(payload, dependencies, handlerFunction);
