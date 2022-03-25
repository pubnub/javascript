export abstract class Handler<Payload> {
  constructor(protected payload: Payload) {}

  abstract start(): void;
  abstract cancel(): void;
}

type AsyncHandlerFunction<Payload> = (payload: Payload) => Promise<void>;

class AsyncHandler<Payload> extends Handler<Payload> {
  constructor(payload: Payload, private asyncFunction: AsyncHandlerFunction<Payload>) {
    super(payload);
  }

  start() {
    this.asyncFunction(this.payload);

    return;
  }
  cancel() {
    return;
  }
}

export const asyncHandler =
  <Payload>(handlerFunction: AsyncHandlerFunction<Payload>) =>
  (payload: Payload) =>
    new AsyncHandler(payload, handlerFunction);
