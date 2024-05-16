import { Dispatcher, Engine } from './core';
import { Dependencies, EventEngineDispatcher } from './dispatcher';
import * as effects from './effects';
import * as events from './events';
import { UnsubscribedState } from './states/unsubscribed';

import * as utils from '../core/utils';

export class EventEngine {
  private engine: Engine<events.Events, effects.Effects> = new Engine();
  private dispatcher: Dispatcher<effects.Effects, Dependencies>;
  private dependencies: Dependencies;

  get _engine() {
    return this.engine;
  }

  private readonly _unsubscribeEngine!: () => void;

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
    timetoken?: string | number;
    withPresence?: boolean;
  }): void {
    this.channels = [...this.channels, ...(channels ?? [])];
    this.groups = [...this.groups, ...(channelGroups ?? [])];

    if (withPresence) {
      this.channels.map((c) => this.channels.push(`${c}-pnpres`));
      this.groups.map((g) => this.groups.push(`${g}-pnpres`));
    }
    if (timetoken) {
      this.engine.transition(
        events.restore(
          Array.from(new Set([...this.channels, ...(channels ?? [])])),
          Array.from(new Set([...this.groups, ...(channelGroups ?? [])])),
          timetoken,
        ),
      );
    } else {
      this.engine.transition(
        events.subscriptionChange(
          Array.from(new Set([...this.channels, ...(channels ?? [])])),
          Array.from(new Set([...this.groups, ...(channelGroups ?? [])])),
        ),
      );
    }
    if (this.dependencies.join) {
      this.dependencies.join({
        channels: Array.from(new Set(this.channels.filter((c) => !c.endsWith('-pnpres')))),
        groups: Array.from(new Set(this.groups.filter((g) => !g.endsWith('-pnpres')))),
      });
    }
  }

  unsubscribe({ channels = [], channelGroups = [] }: { channels?: string[]; channelGroups?: string[] }): void {
    const filteredChannels = utils.removeSingleOccurrence(this.channels, [
      ...channels,
      ...channels.map((c) => `${c}-pnpres`),
    ]);

    const filteredGroups = utils.removeSingleOccurrence(this.groups, [
      ...channelGroups,
      ...channelGroups.map((c) => `${c}-pnpres`),
    ]);

    if (
      new Set(this.channels).size !== new Set(filteredChannels).size ||
      new Set(this.groups).size !== new Set(filteredGroups).size
    ) {
      const channelsToLeave = utils.findUniqueCommonElements(this.channels, channels);
      const groupstoLeave = utils.findUniqueCommonElements(this.groups, channelGroups);
      if (this.dependencies.presenceState) {
        channelsToLeave?.forEach((c) => delete this.dependencies.presenceState[c]);
        groupstoLeave?.forEach((g) => delete this.dependencies.presenceState[g]);
      }
      this.channels = filteredChannels;
      this.groups = filteredGroups;
      this.engine.transition(
        events.subscriptionChange(
          Array.from(new Set(this.channels.slice(0))),
          Array.from(new Set(this.groups.slice(0))),
        ),
      );
      if (this.dependencies.leave) {
        this.dependencies.leave({
          channels: channelsToLeave.slice(0),
          groups: groupstoLeave.slice(0),
        });
      }
    }
  }

  unsubscribeAll(): void {
    this.channels = [];
    this.groups = [];

    if (this.dependencies.presenceState) {
      Object.keys(this.dependencies.presenceState).forEach((objectName) => {
        delete this.dependencies.presenceState[objectName];
      });
    }
    this.engine.transition(events.subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
    if (this.dependencies.leaveAll) {
      this.dependencies.leaveAll();
    }
  }

  reconnect({ timetoken, region }: { timetoken?: string; region?: number }): void {
    this.engine.transition(events.reconnect(timetoken, region));
  }

  disconnect(): void {
    this.engine.transition(events.disconnect());
    if (this.dependencies.leaveAll) {
      this.dependencies.leaveAll();
    }
  }

  getSubscribedChannels(): string[] {
    return Array.from(new Set(this.channels.slice(0)));
  }

  getSubscribedChannelGroups(): string[] {
    return Array.from(new Set(this.groups.slice(0)));
  }

  dispose(): void {
    this.disconnect();
    this._unsubscribeEngine();
    this.dispatcher.dispose();
  }
}
