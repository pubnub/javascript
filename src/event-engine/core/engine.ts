/* eslint-disable @typescript-eslint/no-explicit-any */

import { Subject } from '../../core/event-emitter';

import { State } from './state';
import { GenericMap, InvocationTypeFromMap, Event } from './types';

export class Engine<Events extends GenericMap, Effects extends GenericMap> extends Subject<
  InvocationTypeFromMap<Effects>
> {
  describe<Context>(label: string): State<Context, Events, Effects> {
    return new State<Context, Events, Effects>(label);
  }

  private currentState?: State<any, Events, Effects>;
  private currentContext?: any;

  start<Context>(initialState: State<Context, Events, Effects>, initialContext: Context) {
    this.currentState = initialState;
    this.currentContext = initialContext;

    return;
  }

  transition<K extends keyof Events & string>(event: Event<K, Events[K]>) {
    if (!this.currentState) {
      throw new Error('Start the engine first');
    }

    const change = this.currentState.transition(this.currentContext, event);

    if (change) {
      const [newState, newContext, effects] = change;

      for (const effect of this.currentState.exitEffects) {
        this.notify(effect(this.currentContext));
      }

      this.currentState = newState;
      this.currentContext = newContext;

      for (const effect of effects) {
        this.notify(effect);
      }

      for (const effect of this.currentState.enterEffects) {
        this.notify(effect(this.currentContext));
      }
    }
  }
}
