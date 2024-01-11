import { Dispatcher, Engine } from './core';
import { Dependencies, EventEngineDispatcher } from './dispatcher';
import * as effects from './effects';
import * as events from './events';

import { UnsubscribedState } from './states/unsubscribed';

export class EventEngine {
  private engine: Engine<events.Events, effects.Effects> = new Engine();
  private dispatcher: Dispatcher<effects.Effects, Dependencies>;
  private dependencies: any;

  get _engine() {
    return this.engine;
  }

  private _unsubscribeEngine!: () => void;

  constructor(dependencies: Dependencies) {
    this.dependencies = dependencies;
    this.dispatcher = new EventEngineDispatcher(this.engine, dependencies);

    this._unsubscribeEngine = this.engine.subscribe((change) => {
      if (change.type === 'invocationDispatched') {
        this.dispatcher.dispatch(change.invocation);
      }
    });

    this.engine.start(UnsubscribedState, undefined);
  }

  channels: string[] = [];
  groups: string[] = [];

  subscribe({
    channels,
    channelGroups,
    timetoken,
    withPresence,
  }: {
    channels?: string[];
    channelGroups?: string[];
    timetoken?: string;
    withPresence?: boolean;
  }) {
    this.channels = [...this.channels, ...(channels ?? [])];
    this.groups = [...this.groups, ...(channelGroups ?? [])];
    if (withPresence) {
      this.channels.map((c) => this.channels.push(`${c}-pnpres`));
      this.groups.map((g) => this.groups.push(`${g}-pnpres`));
    }
    if (timetoken) {
      this.engine.transition(events.restore(this.channels, this.groups, timetoken));
    } else {
      this.engine.transition(events.subscriptionChange(this.channels, this.groups));
    }
    if (this.dependencies.join) {
      this.dependencies.join({
        channels: this.channels.filter((c) => !c.endsWith('-pnpres')),
        groups: this.groups.filter((g) => !g.endsWith('-pnpres')),
      });
    }
  }

  unsubscribe({ channels, groups }: { channels?: string[]; groups?: string[] }) {
    const channlesWithPres: any = channels?.slice(0);
    channels?.map((c) => channlesWithPres.push(`${c}-pnpres`));
    this.channels = this.channels.filter((channel) => !channlesWithPres?.includes(channel));

    const groupsWithPres: any = groups?.slice(0);
    groups?.map((g) => groupsWithPres.push(`${g}-pnpres`));
    this.groups = this.groups.filter((group) => !groupsWithPres?.includes(group));

    if (this.dependencies.presenceState) {
      channels?.forEach((c) => delete this.dependencies.presenceState[c]);
      groups?.forEach((g) => delete this.dependencies.presenceState[g]);
    }
    this.engine.transition(events.subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
    if (this.dependencies.leave) {
      this.dependencies.leave({
        channels: channels,
        groups: groups,
      });
    }
  }

  unsubscribeAll() {
    this.channels = [];
    this.groups = [];

    if (this.dependencies.presenceState) {
      this.dependencies.presenceState = {};
    }
    this.engine.transition(events.subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
    if (this.dependencies.leaveAll) {
      this.dependencies.leaveAll();
    }
  }

  reconnect({ timetoken, region }: { timetoken?: string; region?: number }) {
    this.engine.transition(events.reconnect(timetoken, region));
  }

  disconnect() {
    this.engine.transition(events.disconnect());
    if (this.dependencies.leaveAll) {
      this.dependencies.leaveAll();
    }
  }

  dispose() {
    this.disconnect();
    this._unsubscribeEngine();
    this.dispatcher.dispose();
  }
}
