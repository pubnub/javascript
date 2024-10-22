/**
 * Event Engine Core state change module.
 *
 * @internal
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { State } from './state';
import { EventTypeFromMap, GenericMap, InvocationTypeFromMap } from './types';

/** @internal */
export type EngineStarted<Events extends GenericMap, Effects extends GenericMap> = {
  type: 'engineStarted';

  state: State<any, Events, Effects>;
  context: any;
};

/** @internal */
export type EventReceived<Events extends GenericMap> = {
  type: 'eventReceived';

  event: EventTypeFromMap<Events>;
};

/** @internal */
export type TransitionDone<Events extends GenericMap, Effects extends GenericMap> = {
  type: 'transitionDone';
  event: EventTypeFromMap<Events>;

  fromState: State<any, Events, Effects>;
  toState: State<any, Events, Effects>;

  fromContext: any;
  toContext: any;
};

/** @internal */
export type InvocationDispatched<Effects extends GenericMap> = {
  type: 'invocationDispatched';
  invocation: InvocationTypeFromMap<Effects>;
};

/** @internal */
export type Change<Events extends GenericMap, Effects extends GenericMap> =
  | TransitionDone<Events, Effects>
  | InvocationDispatched<Effects>
  | EngineStarted<Events, Effects>
  | EventReceived<Events>;
