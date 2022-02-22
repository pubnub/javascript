/**
 * This sub-module contains complete type description of the extended finite state machine.
 */

import { MapOf } from '../utils';

/**
 * =======================
 *  Basic building blocks
 * =======================
 */

/**
 * `State` is just a union of all possible states, where each state is
 * identified by a string.
 */
export type State<T extends string> = T;

/**
 * `Event` is a description of a State change in the xFSM.
 * Events can contain arbitrary payload.
 */
export type Event<T extends string, P> = {
  type: T;
  payload: P;
};

/**
 * A helper to transform Event map into a map with Event dispatchers.
 */
export type DispatchInterface<EvM extends MapOf<Event<any, any>>> = {
  [Key in keyof EvM]: (payload: EvM[Key]['payload']) => boolean;
};

/**
 * `Action` is a description of a Context change emitted by the xFSM.
 * When `EventType` is void, it applies to all event types.
 */
export type Action<T extends string, EvT extends string | null = null> = EvT extends null
  ? T
  : {
      type: T;
      eventType: EvT;
    };

export type TransitionAction<T extends string, EvT extends string> = Action<T, EvT>;
export type StateAction<T extends string> = Action<T, null>;

/**
 * A helper to extract Action Types from Action Map.
 */
export type ExtractActionType<Ac> = Ac extends Action<infer AcT, any> ? AcT : never;

/**
 * `Effect` is a description of a side-effect emitted by the xFSM.
 * Effect lifetime is bound to a state.
 */
export type Effect<T extends string, EvT extends string | null = null> = EvT extends null
  ? T
  : {
      type: T;
      eventType: EvT;
    };

export type OneshotEffect<T extends string, EvT extends string> = Effect<T, EvT>;
export type ManagedEffect<T extends string> = Effect<T, null>;

/**
 * A helper to extract Effect types from Effect map.
 */
export type ExtractEffectType<Eff> = Eff extends Effect<infer EffT, any> ? EffT : never;

/**
 * `Signature` is a collection of all required types for ease of use.
 */
export type MachineSignature<
  StT extends string,
  Ev extends Event<any, any>,
  Ac extends Action<any, any>,
  Eff extends Effect<any, any>
> = {
  event: Ev;
  action: Ac;
  effect: Eff;

  eventMap: { [Key in Ev['type']]: Ev extends Event<Key, infer P> ? Event<Key, P> : never };
  actionMap: { [Key in ExtractActionType<Ac>]: Ac extends Action<Key, infer P> ? Action<Key, P> : never };
  effectMap: { [Key in ExtractEffectType<Eff>]: Eff extends Effect<Key, infer P> ? Effect<Key, P> : never };

  stateType: StT;
  eventType: Ev['type'];
  actionType: ExtractActionType<Ac>;
  effectType: ExtractEffectType<Eff>;

  transitionActionType: Ac extends Action<infer AcT, string> ? AcT : never;
  stateActionType: Ac extends Action<infer AcT, null> ? AcT : never;

  transitionEffectType: Eff extends Effect<infer EffT, string> ? EffT : never;
  stateEffectType: Eff extends Effect<infer EffT, null> ? EffT : never;
};

export type AnySignature = MachineSignature<any, Event<any, any>, Action<any, any>, Effect<any>>;

/**
 * =========================
 *  Transition descriptions
 * =========================
 */

/**
 * `TransitionDescription` represents change from one state to target state.
 */
export type TransitionDescription<S extends AnySignature> = {
  target: S['stateType'];

  internal?: boolean;
  actions?: Array<S['transitionActionType']>;
  effects?: Array<S['transitionEffectType']>;
};

/**
 * `StateTransitions` represents all possible transitions for specific state.
 */
export type StateTransitions<S extends AnySignature> = {
  [Key in keyof S['eventMap']]?: TransitionDescription<S>;
};

/**
 * `StateDescription` represents a complete description of a state
 * with all edge actions and effects.
 */
export type StateDescription<S extends AnySignature> = {
  effects?: Array<S['stateEffectType']>;

  onEnter?: Array<S['stateActionType']>;
  onExit?: Array<S['stateActionType']>;

  transitions?: StateTransitions<S>;
};

/**
 * `Description` represents a complete description of a xFSM.
 */
export type Description<S extends AnySignature> = {
  [Key in S['stateType']]: StateDescription<S>;
};
