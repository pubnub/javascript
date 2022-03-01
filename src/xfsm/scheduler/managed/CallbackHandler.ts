import { AnySignature } from '../..'
import { HandlerLifecycleOptions, ManagedHandler } from '../Handler'

type CallbackHandlerSource<S extends AnySignature, C, D extends {}, Ev extends S['event']> = (
  options: HandlerLifecycleOptions<S, C, D, Ev>
) => ((options: HandlerLifecycleOptions<S, C, D, Ev>) => void) | void

export class CallbackHandler<S extends AnySignature, C, D extends {}, Ev extends S['event']> extends ManagedHandler<
  S,
  C,
  D,
  Ev
> {
  private cleanup?: ((options: HandlerLifecycleOptions<S, C, D, Ev>) => void) | void

  constructor(private source: CallbackHandlerSource<S, C, D, Ev>) {
    super()
  }

  start(options: HandlerLifecycleOptions<S, C, D, Ev>): void {
    this.cleanup = this.source(options)
  }

  dispose(options: HandlerLifecycleOptions<S, C, D, Ev>): void {
    this.cleanup?.(options)
  }
}

export const fromCallback = <S extends AnySignature, C, D extends {}, Ev extends S['event']>(
  source: CallbackHandlerSource<S, C, D, Ev>
) => {
  return () => new CallbackHandler<S, C, D, Ev>(source)
}
