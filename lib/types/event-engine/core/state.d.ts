import { Event, EventOfType, GenericInvocation, GenericMap, InvocationTypeFromMap } from './types';
export type TransitionFunction<Context, Events extends GenericMap, Effects extends GenericMap, EventType extends Event<keyof Events, Events[keyof Events]>> = {
    (context: Context, event: EventType): Transition<any, Events, Effects> | void;
};
export type Transition<Context, Events extends GenericMap, Effects extends GenericMap> = [
    State<Context, Events, Effects>,
    Context,
    InvocationTypeFromMap<Effects>[]
];
export declare class State<Context, Events extends GenericMap, Effects extends GenericMap> {
    label: string;
    private transitionMap;
    transition<K extends keyof Events>(context: Context, event: EventOfType<Events, K>): void | Transition<any, Events, Effects>;
    constructor(label: string);
    on<K extends keyof Events>(eventType: K, transition: TransitionFunction<Context, Events, Effects, EventOfType<Events, K>>): this;
    with(context: Context, effects?: InvocationTypeFromMap<Effects>[]): Transition<Context, Events, Effects>;
    enterEffects: ((context: Context) => InvocationTypeFromMap<Effects>)[];
    exitEffects: ((context: Context) => InvocationTypeFromMap<Effects>)[];
    onEnter(effect: (context: Context) => GenericInvocation): this;
    onExit(effect: (context: Context) => GenericInvocation): this;
}
