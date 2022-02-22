import { AnySignature } from '../..'
import { HandlerLifecycleOptions, OneshotHandler } from '../Handler'

type FunctionHandlerSource<S extends AnySignature, C, D extends {}, Ev extends S['event']> = (
  options: HandlerLifecycleOptions<S, C, D, Ev>
) => ((options: HandlerLifecycleOptions<S, C, D, Ev>) => void) | void

export class FunctionHandler<S extends AnySignature, C, D extends {}, Ev extends S['event']> extends OneshotHandler<
  S,
  C,
  D,
  Ev
> {
  constructor(private source: FunctionHandlerSource<S, C, D, Ev>) {
    super()
  }

  run(options: HandlerLifecycleOptions<S, C, D, Ev>): void {
    this.source(options)
  }
}

export const fromFunction = <S extends AnySignature, C, D extends {}, Ev extends S['event']>(
  source: FunctionHandlerSource<S, C, D, Ev>
) => {
  return () => new FunctionHandler<S, C, D, Ev>(source)
}
