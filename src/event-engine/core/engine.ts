/**
 * Event Engine Core module.
 *
 * @internal
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { LoggerManager } from '../../core/components/logger-manager';
import { Subject } from '../../core/components/subject';
import { GenericMap, Event } from './types';
import { Change } from './change';
import { State } from './state';

/**
 * Generic event engine.
 *
 * @internal
 */
export class Engine<Events extends GenericMap, Effects extends GenericMap> extends Subject<Change<Events, Effects>> {
  private _currentState?: State<any, Events, Effects>;
  private _pendingEvents: Event<any, any>[] = [];
  private _inTransition: boolean = false;
  private _currentContext?: any;

  constructor(private readonly logger: LoggerManager) {
    super(true);
  }

  get currentState(): State<any, Events, Effects> | undefined {
    return this._currentState;
  }

  get currentContext(): any | undefined {
    return this._currentContext;
  }

  describe<Context>(label: string): State<Context, Events, Effects> {
    return new State<Context, Events, Effects>(label);
  }

  start<Context>(initialState: State<Context, Events, Effects>, initialContext: Context) {
    this._currentState = initialState;
    this._currentContext = initialContext;

    this.notify({
      type: 'engineStarted',
      state: initialState,
      context: initialContext,
    });

    return;
  }

  transition<K extends keyof Events & string>(event: Event<K, Events[K]>) {
    if (!this._currentState) {
      this.logger.error('Engine', 'Finite state machine is not started');
      throw new Error('Start the engine first');
    }

    if (this._inTransition) {
      this.logger.trace('Engine', () => ({
        messageType: 'object',
        message: event,
        details: 'Event engine in transition. Enqueue received event:',
      }));
      this._pendingEvents.push(event);

      return;
    } else this._inTransition = true;

    this.logger.trace('Engine', () => ({
      messageType: 'object',
      message: event,
      details: 'Event engine received event:',
    }));

    this.notify({
      type: 'eventReceived',
      event: event,
    });

    const transition = this._currentState.transition(this._currentContext, event);

    if (transition) {
      const [newState, newContext, effects] = transition;

      this.logger.trace('Engine', `Exiting state: ${this._currentState.label}`);

      for (const effect of this._currentState.exitEffects) {
        this.notify({
          type: 'invocationDispatched',
          invocation: effect(this._currentContext),
        });
      }

      this.logger.trace('Engine', () => ({
        messageType: 'object',
        details: `Entering '${newState.label}' state with context:`,
        message: newContext,
      }));

      const oldState = this._currentState;
      this._currentState = newState;
      const oldContext = this._currentContext;
      this._currentContext = newContext;

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

      for (const effect of this._currentState.enterEffects) {
        this.notify({
          type: 'invocationDispatched',
          invocation: effect(this._currentContext),
        });
      }
    } else
      this.logger.warn('Engine', `No transition from '${this._currentState.label}' found for event: ${event.type}`);
    this._inTransition = false;

    // Check whether a pending task should be dequeued.
    if (this._pendingEvents.length > 0) {
      const nextEvent = this._pendingEvents.shift();

      if (nextEvent) {
        this.logger.trace('Engine', () => ({
          messageType: 'object',
          message: nextEvent,
          details: 'De-queueing pending event:',
        }));

        this.transition(nextEvent);
      }
    }
  }
}
