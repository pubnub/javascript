import { State } from './state';
import { EventTypeFromMap, GenericMap, InvocationTypeFromMap } from './types';
export type EngineStarted<Events extends GenericMap, Effects extends GenericMap> = {
    type: 'engineStarted';
    state: State<any, Events, Effects>;
    context: any;
};
export type EventReceived<Events extends GenericMap> = {
    type: 'eventReceived';
    event: EventTypeFromMap<Events>;
};
export type TransitionDone<Events extends GenericMap, Effects extends GenericMap> = {
    type: 'transitionDone';
    event: EventTypeFromMap<Events>;
    fromState: State<any, Events, Effects>;
    toState: State<any, Events, Effects>;
    fromContext: any;
    toContext: any;
};
export type InvocationDispatched<Effects extends GenericMap> = {
    type: 'invocationDispatched';
    invocation: InvocationTypeFromMap<Effects>;
};
export type Change<Events extends GenericMap, Effects extends GenericMap> = TransitionDone<Events, Effects> | InvocationDispatched<Effects> | EngineStarted<Events, Effects> | EventReceived<Events>;
