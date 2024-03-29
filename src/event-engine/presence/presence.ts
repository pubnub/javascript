import { Dispatcher, Engine } from '../core';
import * as events from './events';
import * as effects from './effects';
import { Dependencies, PresenceEventEngineDispatcher } from './dispatcher';

import { HeartbeatInactiveState } from './states/heartbeat_inactive';

export class PresenceEventEngine {
  private engine: Engine<events.Events, effects.Effects> = new Engine();
  private dispatcher: Dispatcher<effects.Effects, Dependencies>;

  get _engine() {
    return this.engine;
  }

  private _unsubscribeEngine!: () => void;

  constructor(private dependencies: Dependencies) {
    this.dispatcher = new PresenceEventEngineDispatcher(this.engine, dependencies);

    this._unsubscribeEngine = this.engine.subscribe((change) => {
      if (change.type === 'invocationDispatched') {
        this.dispatcher.dispatch(change.invocation);
      }
    });

    this.engine.start(HeartbeatInactiveState, undefined);
  }
  channels: string[] = [];
  groups: string[] = [];

  join({ channels, groups }: { channels?: string[]; groups?: string[] }) {
    this.channels = [...this.channels, ...(channels ?? [])];
    this.groups = [...this.groups, ...(groups ?? [])];

    this.engine.transition(events.joined(this.channels.slice(0), this.groups.slice(0)));
  }

  leave({ channels, groups }: { channels?: string[]; groups?: string[] }) {
    if (this.dependencies.presenceState) {
      channels?.forEach((c) => delete this.dependencies.presenceState[c]);
      groups?.forEach((g) => delete this.dependencies.presenceState[g]);
    }
    this.engine.transition(events.left(channels ?? [], groups ?? []));
  }

  leaveAll() {
    this.engine.transition(events.leftAll());
  }

  dispose() {
    this._unsubscribeEngine();
    this.dispatcher.dispose();
  }
}
