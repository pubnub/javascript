/* eslint-disable @typescript-eslint/no-explicit-any */

import { Subject } from '../../core/components/subject';

import { Change } from './change';
import { State } from './state';
import { GenericMap, Event } from './types';

export class Engine<Events extends GenericMap, Effects extends GenericMap> extends Subject<Change<Events, Effects>> {
  describe<Context>(label: string): State<Context, Events, Effects> {
    return new State<Context, Events, Effects>(label);
  }

  private currentState?: State<any, Events, Effects>;
  private currentContext?: any;

  start<Context>(initialState: State<Context, Events, Effects>, initialContext: Context) {
    this.currentState = initialState;
    this.currentContext = initialContext;

    this.notify({
      type: 'engineStarted',
      state: initialState,
      context: initialContext,
    });

    return;
  }

  transition<K extends keyof Events & string>(event: Event<K, Events[K]>) {
    if (!this.currentState) {
      throw new Error('Start the engine first');
    }

    this.notify({
      type: 'eventReceived',
      event: event,
    });

    const transition = this.currentState.transition(this.currentContext, event);

    if (transition) {
      const [newState, newContext, effects] = transition;

      for (const effect of this.currentState.exitEffects) {
        this.notify({
          type: 'invocationDispatched',
          invocation: effect(this.currentContext),
        });
      }

      const oldState = this.currentState;
      this.currentState = newState;
      const oldContext = this.currentContext;
      this.currentContext = newContext;

      this.notify({
        type: 'transitionDone',
        fromState: oldState,
        fromContext: oldContext,
        toState: newState,
        toContext: newContext,
        event: event,
      });

      for (const effect of effects) {
        this.notify({
          type: 'invocationDispatched',
          invocation: effect,
        });
      }

      for (const effect of this.currentState.enterEffects) {
        this.notify({
          type: 'invocationDispatched',
          invocation: effect(this.currentContext),
        });
      }
    }
  }
}
