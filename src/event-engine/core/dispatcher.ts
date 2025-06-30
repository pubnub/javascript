/**
 * Event Engine Core Effects dispatcher module.
 *
 * @internal
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { GenericInvocation, GenericMap, InvocationTypeFromMap } from './types';
import { LoggerManager } from '../../core/components/logger-manager';
import { Handler } from './handler';

/**
 * Effects invocation processing handler function definition.
 *
 * @internal
 */
type HandlerCreator<Payload, Dependencies> = (
  payload: Payload,
  dependencies: Dependencies,
) => Handler<Payload, Dependencies>;

/**
 * Event Engine effects dispatcher.
 *
 * Dispatcher responsible for invocation enqueue and dequeue for processing.
 *
 * @internal
 */
export class Dispatcher<
  Effects extends GenericMap,
  Dependencies,
  Invocation extends GenericInvocation = InvocationTypeFromMap<Effects>,
> {
  constructor(
    private readonly dependencies: Dependencies,
    private readonly logger: LoggerManager,
  ) {}

  private instances: Map<string, Handler<Effects[any], Dependencies>> = new Map();
  private handlers: Map<string, HandlerCreator<Effects[any], Dependencies>> = new Map();

  on<K extends keyof Effects & string>(type: K, handlerCreator: HandlerCreator<Effects[K], Dependencies>) {
    this.handlers.set(type, handlerCreator);
  }

  dispatch(invocation: Invocation): void {
    this.logger.trace('Dispatcher', `Process invocation: ${invocation.type}`);

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
      this.logger.error('Dispatcher', `Unhandled invocation '${invocation.type}'`);
      throw new Error(`Unhandled invocation '${invocation.type}'`);
    }

    const instance = handlerCreator(invocation.payload, this.dependencies);

    this.logger.trace('Dispatcher', () => ({
      messageType: 'object',
      details: 'Call invocation handler with parameters:',
      message: invocation.payload,
      ignoredKeys: ['abortSignal'],
    }));

    if (invocation.managed) {
      this.instances.set(invocation.type, instance);
    }

    instance.start();
  }

  dispose() {
    for (const [key, instance] of this.instances.entries()) {
      instance.cancel();
      this.instances.delete(key);
    }
  }
}
