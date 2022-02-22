import { AnySignature } from '../..';
import { HandlerLifecycleOptions, ManagedHandler } from '../Handler';

type PromiseHandlerSource<S extends AnySignature, C, D extends {}, Ev extends S['event']> = (
  options: HandlerLifecycleOptions<S, C, D, Ev> & { cancelSignal: AbortSignal }
) => Promise<void>;

export class PromiseHandler<S extends AnySignature, C, D extends {}, Ev extends S['event']> extends ManagedHandler<
  S,
  C,
  D,
  Ev
> {
  private controller: AbortController | undefined;

  constructor(private source: PromiseHandlerSource<S, C, D, Ev>) {
    super();
  }

  start(options: HandlerLifecycleOptions<S, C, D, Ev>): void {
    this.controller = new AbortController();

    this.source({ ...options, cancelSignal: this.controller.signal });
  }

  dispose(_options: HandlerLifecycleOptions<S, C, D, Ev>): void {
    this.controller?.abort();
  }
}

export const fromAsync = <S extends AnySignature, C, D extends {}, Ev extends S['event']>(
  source: PromiseHandlerSource<S, C, D, Ev>
) => {
  return () => new PromiseHandler<S, C, D, Ev>(source);
};
