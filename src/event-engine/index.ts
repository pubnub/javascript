/**
 * Subscribe Event Engine module.
 *
 * @internal
 */

import { ReceivingState, ReceivingStateContext } from './states/receiving';
import { Dependencies, EventEngineDispatcher } from './dispatcher';
import { subscriptionTimetokenFromReference } from '../core/utils';
import { UnsubscribedState } from './states/unsubscribed';
import { Dispatcher, Engine } from './core';
import * as utils from '../core/utils';
import * as effects from './effects';
import * as events from './events';

/**
 * Subscribe Event Engine Core.
 *
 * @internal
 */
export class EventEngine {
  private readonly engine: Engine<events.Events, effects.Effects>;
  private dispatcher: Dispatcher<effects.Effects, Dependencies>;
  private dependencies: Dependencies;

  channels: string[] = [];
  groups: string[] = [];

  get _engine() {
    return this.engine;
  }

  private readonly _unsubscribeEngine!: () => void;

  constructor(dependencies: Dependencies) {
    this.dependencies = dependencies;
    this.engine = new Engine(dependencies.config.logger());
    this.dispatcher = new EventEngineDispatcher(this.engine, dependencies);

    dependencies.config.logger().debug('EventEngine', 'Create subscribe event engine.');

    this._unsubscribeEngine = this.engine.subscribe((change) => {
      if (change.type === 'invocationDispatched') {
        this.dispatcher.dispatch(change.invocation);
      }
    });

    this.engine.start(UnsubscribedState, undefined);
  }

  /**
   * Subscription-based current timetoken.
   *
   * @returns Timetoken based on current timetoken plus diff between current and loop start time.
   */
  get subscriptionTimetoken(): string | undefined {
    const currentState = this.engine.currentState;
    if (!currentState) return undefined;
    let referenceTimetoken: string | undefined;
    let currentTimetoken = '0';

    if (currentState.label === ReceivingState.label) {
      const context: ReceivingStateContext = this.engine.currentContext;
      currentTimetoken = context.cursor.timetoken;
      referenceTimetoken = context.referenceTimetoken;
    }

    return subscriptionTimetokenFromReference(currentTimetoken, referenceTimetoken ?? '0');
  }

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
      const groupsToLeave = utils.findUniqueCommonElements(this.groups, channelGroups);
      if (this.dependencies.presenceState) {
        channelsToLeave?.forEach((c) => delete this.dependencies.presenceState[c]);
        groupsToLeave?.forEach((g) => delete this.dependencies.presenceState[g]);
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
          groups: groupsToLeave.slice(0),
        });
      }
    }
  }

  unsubscribeAll(isOffline: boolean = false): void {
    const channelGroups = this.getSubscribedChannels();
    const channels = this.getSubscribedChannels();

    this.channels = [];
    this.groups = [];

    if (this.dependencies.presenceState) {
      Object.keys(this.dependencies.presenceState).forEach((objectName) => {
        delete this.dependencies.presenceState[objectName];
      });
    }
    this.engine.transition(events.subscriptionChange(this.channels.slice(0), this.groups.slice(0), isOffline));
    if (this.dependencies.leaveAll) this.dependencies.leaveAll({ channels, groups: channelGroups, isOffline });
  }

  reconnect({ timetoken, region }: { timetoken?: string; region?: number }): void {
    const channelGroups = this.getSubscribedChannels();
    const channels = this.getSubscribedChannels();

    this.engine.transition(events.reconnect(timetoken, region));

    if (this.dependencies.presenceReconnect) this.dependencies.presenceReconnect({ channels, groups: channelGroups });
  }

  disconnect(isOffline: boolean = false): void {
    const channelGroups = this.getSubscribedChannels();
    const channels = this.getSubscribedChannels();

    this.engine.transition(events.disconnect(isOffline));

    if (this.dependencies.presenceDisconnect)
      this.dependencies.presenceDisconnect({ channels, groups: channelGroups, isOffline });
  }

  getSubscribedChannels(): string[] {
    return Array.from(new Set(this.channels.slice(0)));
  }

  getSubscribedChannelGroups(): string[] {
    return Array.from(new Set(this.groups.slice(0)));
  }

  dispose(): void {
    this.disconnect(true);
    this._unsubscribeEngine();
    this.dispatcher.dispose();
  }
}
