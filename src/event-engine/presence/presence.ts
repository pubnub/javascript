/**
 * Presence Event Engine module.
 *
 * @internal
 */

import { Dependencies, PresenceEventEngineDispatcher } from './dispatcher';
import { HeartbeatInactiveState } from './states/heartbeat_inactive';
import { Dispatcher, Engine } from '../core';
import * as effects from './effects';
import * as events from './events';

/**
 * Presence Event Engine Core.
 *
 * @internal
 */
export class PresenceEventEngine {
  private readonly engine: Engine<events.Events, effects.Effects>;
  private dispatcher: Dispatcher<effects.Effects, Dependencies>;

  get _engine() {
    return this.engine;
  }

  private _unsubscribeEngine!: () => void;

  constructor(private dependencies: Dependencies) {
    this.engine = new Engine(dependencies.config.logger());
    this.dispatcher = new PresenceEventEngineDispatcher(this.engine, dependencies);

    dependencies.config.logger().debug('PresenceEventEngine', 'Create presence event engine.');

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
    this.channels = [...this.channels, ...(channels ?? []).filter((channel) => !this.channels.includes(channel))];
    this.groups = [...this.groups, ...(groups ?? []).filter((group) => !this.groups.includes(group))];

    // Don't make any transitions if there is no channels and groups.
    if (this.channels.length === 0 && this.groups.length === 0) return;

    this.engine.transition(events.joined(this.channels.slice(0), this.groups.slice(0)));
  }

  leave({ channels, groups }: { channels?: string[]; groups?: string[] }) {
    // Update internal channel tracking to prevent stale heartbeat requests
    this.channels = this.channels.filter((channel) => !(channels ?? []).includes(channel));
    this.groups = this.groups.filter((group) => !(groups ?? []).includes(group));

    if (this.dependencies.presenceState) {
      channels?.forEach((c) => delete this.dependencies.presenceState[c]);
      groups?.forEach((g) => delete this.dependencies.presenceState[g]);
    }
    this.engine.transition(events.left(channels ?? [], groups ?? []));
  }

  leaveAll(isOffline: boolean = false) {
    // Clear presence state for all current channels and groups
    if (this.dependencies.presenceState) {
      this.channels.forEach((c) => delete this.dependencies.presenceState[c]);
      this.groups.forEach((g) => delete this.dependencies.presenceState[g]);
    }

    // Reset internal channel and group tracking
    this.channels = [];
    this.groups = [];

    this.engine.transition(events.leftAll(isOffline));
  }

  reconnect() {
    this.engine.transition(events.reconnect());
  }

  disconnect(isOffline: boolean = false) {
    this.engine.transition(events.disconnect(isOffline));
  }

  dispose() {
    this.disconnect(true);
    this._unsubscribeEngine();
    this.dispatcher.dispose();
  }
}
