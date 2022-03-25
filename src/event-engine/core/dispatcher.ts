/* eslint-disable @typescript-eslint/no-explicit-any */

import { Handler } from './handler';
import { GenericInvocation, GenericMap, InvocationTypeFromMap } from './types';

type HandlerCreator<Payload> = (payload: Payload) => Handler<Payload>;

export class Dispatcher<
  Effects extends GenericMap,
  Invocation extends GenericInvocation = InvocationTypeFromMap<Effects>,
> {
  private instances: Map<string, Handler<Effects[any]>> = new Map();
  private handlers: Map<string, HandlerCreator<Effects[any]>> = new Map();

  on<K extends keyof Effects & string>(type: K, handlerCreator: HandlerCreator<Effects[K]>) {
    this.handlers.set(type, handlerCreator);
  }

  dispatch(invocation: Invocation): void {
    if (invocation.type === 'CANCEL') {
      if (this.instances.has(invocation.payload)) {
        const instance = this.instances.get(invocation.payload);

        instance?.cancel();

        this.instances.delete(invocation.payload);
      }

      return;
    }

    const handlerCreator = this.handlers.get(invocation.type);

    if (!handlerCreator) {
      throw new Error(`Unhandled invocation '${invocation.type}'`);
    }

    const instance = handlerCreator(invocation.payload);

    if (invocation.managed) {
      this.instances.set(invocation.type, instance);
    }

    instance.start();
  }
}
