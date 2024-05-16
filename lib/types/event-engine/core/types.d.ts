export type Event<T, P> = {
    type: T;
    payload: P;
};
export type Invocation<T, P> = {
    type: T;
    payload: P;
    managed: boolean;
};
export type GenericEvent = Event<string, any>;
export type GenericInvocation = Invocation<string, any>;
export type GenericMap = Record<string, any>;
export type EventTypeFromMap<Map extends GenericMap> = {
    [T in keyof Map & string]: Event<T, Map[T]>;
}[keyof Map & string];
export type InvocationTypeFromMap<Map extends GenericMap> = {
    [T in keyof Map & string]: Invocation<T, Map[T]>;
}[keyof Map & string];
export type EventOfType<Map extends GenericMap, T extends keyof Map> = Event<T, Map[T]>;
export type InvocationOfType<Map extends GenericMap, T extends keyof Map> = Invocation<T, Map[T]>;
type EventCreator<K, P, S extends any[]> = {
    (...args: S): Event<K, P>;
    type: K;
};
export declare function createEvent<K extends string | number | symbol, P, S extends any[]>(type: K, fn: (...args: S) => P): EventCreator<K, P, S>;
export type MapOf<S extends (...args: any[]) => {
    type: string | number | symbol;
    payload: any;
}> = {
    [K in ReturnType<S>['type']]: (ReturnType<S> & {
        type: K;
    })['payload'];
};
type EffectCreator<K, P, S extends any[]> = {
    (...args: S): Invocation<K, P>;
    type: K;
};
type ManagedEffectCreator<K, P, S extends any[]> = {
    (...args: S): Invocation<K, P>;
    type: K;
    cancel: Invocation<'CANCEL', K>;
};
export declare function createEffect<K extends string | number | symbol, P, S extends any[]>(type: K, fn: (...args: S) => P): EffectCreator<K, P, S>;
export declare function createManagedEffect<K extends string | number | symbol, P, S extends any[]>(type: K, fn: (...args: S) => P): ManagedEffectCreator<K, P, S>;
export {};
