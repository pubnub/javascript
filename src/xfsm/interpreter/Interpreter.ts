import { AnySignature, Description, DispatchInterface, StateDescription } from '../description';
import { transition } from '../transition';
import { Reducers } from './Reducer';
import { ChangelogEntry, Listener } from './Changelog';

export type InterpreterOptions<S extends AnySignature, C> = {
  initialState: S['stateType'];
  initialContext: C;

  actions: Reducers<S, C>;

  warnOnInvalidTransitions?: boolean;
};

export class Interpreter<S extends AnySignature, C> {
  public dispatch: DispatchInterface<S['eventMap']>;

  private state: S['stateType'];
  private context: C;

  private actions: Reducers<S, C>;

  private listeners: Set<Listener<S, C>> = new Set();

  private warnOnInvalidTransitions: boolean;

  constructor(private description: Description<S>, options: InterpreterOptions<S, C>) {
    this.state = options.initialState;
    this.context = options.initialContext;

    this.actions = options.actions;
    this.dispatch = this.createInterfaceFromEvents();

    this.warnOnInvalidTransitions = options.warnOnInvalidTransitions ?? false;
  }

  private isStarted: boolean = false;

  /**
   * This function emits effects and actions for the initial state. The Interpreter cannot be considered valid
   * without calling this method.
   */
  public start(): void {
    if (!this.isStarted) {
      this.isStarted = true;

      const state = this.description[this.state];

      this.notify({
        type: 'interpreter-started',
        initialState: this.state,
        actions: state.onEnter ?? [],
        startedEffects: state.effects ?? [],
      });

      this.applyActions(state.onEnter ?? []);
      this.emitEffects(this.state, 'start', state.effects ?? []);
    }
  }

  public listen(listener: Listener<S, C>): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public waitFor(state: S['stateType'], timeout?: number): Promise<void> {
    if (state === this.state) {
      return Promise.resolve();
    }

    if (timeout) {
      return new Promise((resolve, reject) => {
        const unsubscribe = this.listen((changelog) => {
          if (changelog.type === 'transition' && changelog.to === state) {
            unsubscribe();
            resolve();
          }
        });

        setTimeout(() => reject(new Error(`Timed out while waiting for state ${state}.`)), timeout);
      });
    } else {
      return Promise.reject(new Error(`Expected to be in state ${state} (actual state: ${this.state}).`));
    }
  }

  public getCurrentState(): S['stateType'] {
    return this.state;
  }

  public getContext(): C {
    return this.context;
  }

  private notify(changelog: ChangelogEntry<S>) {
    for (const listener of this.listeners.values()) {
      setTimeout(() => {
        listener(changelog, this);
      }, 0);
    }
  }

  private transition<T extends S['eventType']>(type: T, payload: S['eventMap'][T]): boolean {
    if (!this.isStarted) {
      throw new Error("Interpreter hasn't been started yet.");
    }

    const event: S['eventMap'][T] = { type, payload } as S['eventMap'][T];

    this.notify({
      type: 'event-received',
      event: event,
    });

    const change = transition(this.description, this.state, event);

    if (change.type === 'valid') {
      this.emitEffects(this.state, 'dispose', change.effects.dispose, event);

      this.notify({
        type: 'transition',
        from: this.state,
        to: change.state,
        event: event,
        exitActions: change.actions.exit,
        transitionActions: change.actions.transition,
        enterActions: change.actions.enter,
        startedEffects: change.effects.start,
        disposedEffects: change.effects.dispose,
        transitionEffects: change.effects.transition,
      });

      this.applyActions(change.actions.exit, event);

      this.state = change.state;
      this.applyActions(change.actions.transition, event);
      this.emitEffects(this.state, 'one-shot', change.effects.transition, event);

      this.applyActions(change.actions.enter, event);
      this.emitEffects(this.state, 'start', change.effects.start, event);
    } else {
      if (this.warnOnInvalidTransitions) {
        console.warn(`Invalid transition! State "${this.state}" does not recognize this event: ${event}`);
      }

      this.notify({
        type: 'invalid-transition',
        event: event,
        state: this.state,
      });
    }

    return change.type === 'valid';
  }

  private applyActions(actions: Array<S['actionType']>, event?: S['eventMap'][S['eventType']]) {
    for (const action of actions) {
      const reducer = this.actions[action];

      if (typeof reducer !== 'function') {
        throw new Error('Unreachable');
      }

      const result = reducer(this.getContext(), event as any);

      if (result !== undefined) {
        this.context = result;
      }

      this.notify({
        type: 'action-applied',
        action: action,
        event: event,
      });
    }
  }

  private emitEffects(
    state: S['stateType'],
    lifecycle: 'dispose' | 'start' | 'one-shot',
    effects: Array<S['effectType']>,
    event?: S['eventMap'][S['eventType']]
  ) {
    for (const [index, effect] of effects.entries()) {
      this.notify({
        type: 'effect-emitted',
        state: state,
        effect: effect,
        effectIndex: index,
        lifecycle: lifecycle,
        event: event,
      });
    }
  }

  // Another ugly hack for ease of use
  private createInterfaceFromEvents(): DispatchInterface<S['eventMap']> {
    const events: Array<S['eventType']> = [];

    for (const state of Object.values<StateDescription<S>>(this.description)) {
      if (!state.transitions) {
        continue;
      }

      for (const eventType of Object.keys(state.transitions) as Array<S['eventType']>) {
        if (!events.includes(eventType)) events.push(eventType);
      }
    }

    return Object.fromEntries(
      events.map((event) => [
        event,
        (payload: S['eventType']['payload']) => {
          return this.transition(event, payload);
        },
      ])
    ) as DispatchInterface<S['eventMap']>;
  }
}
