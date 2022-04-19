/* eslint-disable @typescript-eslint/no-explicit-any */

import { Event, EventOfType, GenericInvocation, GenericMap, InvocationTypeFromMap } from './types';

export type TransitionFunction<
  Context,
  Events extends GenericMap,
  Effects extends GenericMap,
  EventType extends Event<keyof Events, Events[keyof Events]>,
> = {
  (context: Context, event: EventType): Transition<any, Events, Effects> | void;
};

export type Transition<Context, Events extends GenericMap, Effects extends GenericMap> = [
  State<Context, Events, Effects>,
  Context,
  InvocationTypeFromMap<Effects>[],
];

export class State<Context, Events extends GenericMap, Effects extends GenericMap> {
  private transitionMap: Map<keyof Events, TransitionFunction<Context, Events, Effects, any>> = new Map();

  transition<K extends keyof Events>(context: Context, event: EventOfType<Events, K>) {
    if (this.transitionMap.has(event.type)) {
      return this.transitionMap.get(event.type)?.(context, event);
    }

    return undefined;
  }

  constructor(public label: string) {}

  on<K extends keyof Events>(
    eventType: K,
    transition: TransitionFunction<Context, Events, Effects, EventOfType<Events, K>>,
  ) {
    this.transitionMap.set(eventType, transition);

    return this;
  }

  with(context: Context, effects?: InvocationTypeFromMap<Effects>[]): Transition<Context, Events, Effects> {
    return [this, context, effects ?? []];
  }

  enterEffects: ((context: Context) => InvocationTypeFromMap<Effects>)[] = [];
  exitEffects: ((context: Context) => InvocationTypeFromMap<Effects>)[] = [];

  onEnter(effect: (context: Context) => GenericInvocation) {
    this.enterEffects.push(effect);

    return this;
  }

  onExit(effect: (context: Context) => GenericInvocation) {
    this.exitEffects.push(effect);

    return this;
  }
}
