import { Dispatcher, Engine } from './core';
import { Dependencies, EventEngineDispatcher } from './dispatcher';
import * as effects from './effects';
import * as events from './events';

import { UnsubscribedState } from './states/unsubscribed';

export class EventEngine {
  private engine: Engine<events.Events, effects.Effects> = new Engine();
  private dispatcher: Dispatcher<effects.Effects, Dependencies>;

  get _engine() {
    return this.engine;
  }

  constructor(dependencies: Dependencies) {
    this.dispatcher = new EventEngineDispatcher(this.engine, dependencies);

    this.engine.subscribe((change) => {
      if (change.type === 'invocationDispatched') {
        this.dispatcher.dispatch(change.invocation);
      }
    });

    this.engine.start(UnsubscribedState, undefined);
  }

  channels: string[] = [];
  groups: string[] = [];

  subscribe({ channels, groups }: { channels?: string[]; groups?: string[] }) {
    this.channels = [...this.channels, ...(channels ?? [])];
    this.groups = [...this.groups, ...(groups ?? [])];

    this.engine.transition(events.subscriptionChange(this.channels, this.groups));
  }

  unsubscribe({ channels, groups }: { channels?: string[]; groups?: string[] }) {
    this.channels = this.channels.filter((channel) => !channels?.includes(channel) ?? true);
    this.groups = this.groups.filter((group) => !groups?.includes(group) ?? true);

    this.engine.transition(events.subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
  }

  unsubscribeAll() {
    this.channels = [];
    this.groups = [];

    this.engine.transition(events.subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
  }

  reconnect() {
    this.engine.transition(events.reconnect());
  }

  disconnect() {
    this.engine.transition(events.disconnect());
  }
}
