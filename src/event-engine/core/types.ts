/* eslint-disable @typescript-eslint/no-explicit-any */

export type Event<T, P> = { type: T; payload: P };
export type Invocation<T, P> = { type: T; payload: P; managed: boolean };

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

export function createEvent<K extends string | number | symbol, P, S extends any[]>(
  type: K,
  fn: (...args: S) => P,
): EventCreator<K, P, S> {
  const creator: EventCreator<K, P, S> = function (...args: S) {
    return {
      type,
      payload: fn?.(...args),
    };
  };

  creator.type = type;

  return creator;
}

export type MapOf<S extends (...args: any[]) => { type: string | number | symbol; payload: any }> = {
  [K in ReturnType<S>['type']]: (ReturnType<S> & { type: K })['payload'];
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

export function createEffect<K extends string | number | symbol, P, S extends any[]>(
  type: K,
  fn: (...args: S) => P,
): EffectCreator<K, P, S> {
  const creator: EffectCreator<K, P, S> = (...args: S) => {
    return { type, payload: fn(...args), managed: false };
  };

  creator.type = type;

  return creator;
}

export function createManagedEffect<K extends string | number | symbol, P, S extends any[]>(
  type: K,
  fn: (...args: S) => P,
): ManagedEffectCreator<K, P, S> {
  const creator: ManagedEffectCreator<K, P, S> = (...args: S) => {
    return { type, payload: fn(...args), managed: true };
  };

  creator.type = type;
  creator.cancel = { type: 'CANCEL', payload: type, managed: false };

  return creator;
}
