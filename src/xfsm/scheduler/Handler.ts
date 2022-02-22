import { AnySignature, DispatchInterface, Effect } from '..';

export type HandlerLifecycleOptions<S extends AnySignature, C, D extends {}, Ev extends S['event']> = {
  dispatch: DispatchInterface<S['eventMap']>;
  event?: Ev;

  getContext: () => C;
  getCurrentState: () => S['stateType'];

  dependencies: D;
};

export abstract class Handler<S extends AnySignature, C, D extends {}, Ev extends S['event']> {}
export abstract class ManagedHandler<S extends AnySignature, C, D extends {}, Ev extends S['event']> extends Handler<
  S,
  C,
  D,
  Ev
> {
  abstract start(options: HandlerLifecycleOptions<S, C, D, Ev>): void;
  abstract dispose(options: HandlerLifecycleOptions<S, C, D, Ev>): void;
}
export abstract class OneshotHandler<S extends AnySignature, C, D extends {}, Ev extends S['event']> extends Handler<
  S,
  C,
  D,
  Ev
> {
  abstract run(options: HandlerLifecycleOptions<S, C, D, Ev>): void;
}

export type HandlerCreator<
  S extends AnySignature,
  C,
  D extends {},
  Eff extends Effect<S['effectType'], any>
> = Eff extends Effect<S['effectType'], infer X>
  ? () => X extends S['eventType'] ? OneshotHandler<S, C, D, S['eventMap'][X]> : ManagedHandler<S, C, D, S['event']>
  : never;

export type Handlers<S extends AnySignature, C, D extends {}> = {
  [Key in S['effectType']]: HandlerCreator<S, C, D, S['effectMap'][Key]>;
};
