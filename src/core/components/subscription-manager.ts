/**
 * Subscription manager module.
 */

import { Payload, ResultCallback, Status, StatusCallback, StatusEvent } from '../types/api';
import { RequestParameters as SubscribeRequestParameters } from '../endpoints/subscribe';
import { PrivateClientConfiguration } from '../interfaces/configuration';
import { HeartbeatRequest } from '../endpoints/presence/heartbeat';
import { ReconnectionManager } from './reconnection_manager';
import * as Subscription from '../types/api/subscription';
import { ListenerManager } from './listener_manager';
import StatusCategory from '../constants/categories';
import * as Presence from '../types/api/presence';
import DedupingManager from './deduping_manager';
import Categories from '../constants/categories';
import { PubNubCore } from '../pubnub-common';
import EventEmitter from './eventEmitter';

/**
 * Subscription loop manager.
 */
export class SubscriptionManager {
  /**
   * Connection availability check manager.
   */
  private readonly reconnectionManager: ReconnectionManager;

  /**
   * Real-time events deduplication manager.
   */
  private readonly dedupingManager: DedupingManager;

  /**
   * Map between channel / group name and `state` associated with `uuid` there.
   */
  private readonly presenceState: Record<string, Payload>;

  /**
   * List of channel groups for which heartbeat calls should be performed.
   */
  private readonly heartbeatChannelGroups: Record<string, Record<string, unknown>>;

  /**
   * List of channels for which heartbeat calls should be performed.
   */
  private readonly heartbeatChannels: Record<string, Record<string, unknown>>;

  /**
   * List of channel groups for which real-time presence change events should be observed.
   */
  private readonly presenceChannelGroups: Record<string, Record<string, unknown>>;

  /**
   * List of channels for which real-time presence change events should be observed.
   */
  private readonly presenceChannels: Record<string, Record<string, unknown>>;

  /**
   * New list of channel groups to which manager will try to subscribe,
   */
  private pendingChannelGroupSubscriptions: string[];

  /**
   * New list of channels to which manager will try to subscribe,
   */
  private pendingChannelSubscriptions: string[];

  /**
   * List of channel groups for which real-time events should be observed.
   */
  private readonly channelGroups: Record<string, Record<string, unknown>>;

  /**
   * List of channels for which real-time events should be observed.
   */
  private readonly channels: Record<string, Record<string, unknown>>;

  /**
   * Timetoken which is used by the current subscription loop.
   */
  private currentTimetoken: string | number;

  /**
   * Timetoken which has been used with previous subscription loop.
   */
  private lastTimetoken: string | number;

  /**
   * User-provided timetoken or timetoken for catch up.
   */
  private storedTimetoken: string | number | null;

  /**
   * Timetoken's region.
   */
  private region?: number | null;

  private heartbeatTimer: number | null;

  /**
   * Whether subscription status change has been announced or not.
   */
  private subscriptionStatusAnnounced: boolean;

  /**
   * Whether PubNub client is online right now.
   */
  private isOnline: boolean;

  /**
   * Active subscription request abort method.
   *
   * **Note:** Reference updated with each subscribe call.
   */
  private _subscribeAbort?: (() => void) | null;

  constructor(
    private readonly configuration: PrivateClientConfiguration,
    private readonly listenerManager: ListenerManager,
    private readonly eventEmitter: EventEmitter,
    private readonly subscribeCall: (
      parameters: Omit<SubscribeRequestParameters, 'crypto' | 'timeout' | 'keySet' | 'getFileUrl'>,
      callback: ResultCallback<Subscription.SubscriptionResponse>,
    ) => void,
    private readonly heartbeatCall: (
      parameters: Presence.PresenceHeartbeatParameters,
      callback: StatusCallback,
    ) => void,
    private readonly leaveCall: (parameters: Presence.PresenceLeaveParameters, callback: StatusCallback) => void,
    time: typeof PubNubCore.prototype.time,
  ) {
    this.reconnectionManager = new ReconnectionManager(time);
    this.dedupingManager = new DedupingManager({ config: this.configuration });
    this.heartbeatChannelGroups = {};
    this.heartbeatChannels = {};
    this.presenceChannelGroups = {};
    this.presenceChannels = {};
    this.heartbeatTimer = null;
    this.presenceState = {};
    this.pendingChannelGroupSubscriptions = [];
    this.pendingChannelSubscriptions = [];
    this.channelGroups = {};
    this.channels = {};

    this.currentTimetoken = '0';
    this.lastTimetoken = '0';
    this.storedTimetoken = null;

    this.subscriptionStatusAnnounced = false;
    this.isOnline = true;
  }

  // region Information
  get subscribedChannels(): string[] {
    return Object.keys(this.channels);
  }

  get subscribedChannelGroups(): string[] {
    return Object.keys(this.channelGroups);
  }

  set abort(call: (() => void) | null) {
    this._subscribeAbort = call;
  }
  // endregion

  // region Subscription

  public disconnect() {
    this.stopSubscribeLoop();
    this.stopHeartbeatTimer();
    this.reconnectionManager.stopPolling();
  }

  public reconnect() {
    this.startSubscribeLoop();
    this.startHeartbeatTimer();
  }

  /**
   * Update channels and groups used in subscription loop.
   *
   * @param parameters - Subscribe configuration parameters.
   */
  public subscribe(parameters: Subscription.SubscribeParameters) {
    const { channels, channelGroups, timetoken, withPresence = false, withHeartbeats = false } = parameters;

    if (timetoken) {
      this.lastTimetoken = this.currentTimetoken;
      this.currentTimetoken = timetoken;
    }

    if (this.currentTimetoken !== '0' && this.currentTimetoken !== 0) {
      this.storedTimetoken = this.currentTimetoken;
      this.currentTimetoken = 0;
    }

    channels?.forEach((channel) => {
      this.pendingChannelSubscriptions.push(channel);
      this.channels[channel] = {};

      if (withPresence) this.presenceChannels[channel] = {};
      if (withHeartbeats || this.configuration.getHeartbeatInterval()) this.heartbeatChannels[channel] = {};
    });

    channelGroups?.forEach((group) => {
      this.pendingChannelGroupSubscriptions.push(group);
      this.channelGroups[group] = {};

      if (withPresence) this.presenceChannelGroups[group] = {};
      if (withHeartbeats || this.configuration.getHeartbeatInterval()) this.heartbeatChannelGroups[group] = {};
    });

    this.subscriptionStatusAnnounced = false;
    this.reconnect();
  }

  public unsubscribe(parameters: Presence.PresenceLeaveParameters, isOffline?: boolean) {
    const { channels, channelGroups } = parameters;

    const actualChannelGroups: string[] = [];
    const actualChannels: string[] = [];

    channels?.forEach((channel) => {
      if (channel in this.channels) {
        delete this.channels[channel];
        actualChannels.push(channel);

        if (channel in this.heartbeatChannels) delete this.heartbeatChannels[channel];
      }

      if (channel in this.presenceState) delete this.presenceState[channel];
      if (channel in this.presenceChannels) {
        delete this.presenceChannels[channel];
        actualChannels.push(channel);
      }
    });

    channelGroups?.forEach((group) => {
      if (group in this.channelGroups) {
        delete this.channelGroups[group];
        actualChannelGroups.push(group);

        if (group in this.heartbeatChannelGroups) delete this.heartbeatChannelGroups[group];
      }

      if (group in this.presenceState) delete this.presenceState[group];
      if (group in this.presenceChannelGroups) {
        delete this.presenceChannelGroups[group];
        actualChannelGroups.push(group);
      }
    });

    // There is no need to unsubscribe to empty list of data sources.
    if (actualChannels.length === 0 && actualChannelGroups.length === 0) return;

    if (this.configuration.suppressLeaveEvents === false && !isOffline) {
      this.leaveCall({ channels: actualChannels, channelGroups: actualChannelGroups }, (status) => {
        this.listenerManager.announceStatus({
          ...status,
          affectedChannels: actualChannels,
          affectedChannelGroups: actualChannelGroups,
          currentTimetoken: this.currentTimetoken,
          lastTimetoken: this.lastTimetoken,
        } as StatusEvent);
      });
    }

    if (
      Object.keys(this.channels).length === 0 &&
      Object.keys(this.presenceChannels).length === 0 &&
      Object.keys(this.channelGroups).length === 0 &&
      Object.keys(this.presenceChannelGroups).length === 0
    ) {
      this.lastTimetoken = 0;
      this.currentTimetoken = 0;
      this.storedTimetoken = null;
      this.region = null;
      this.reconnectionManager.stopPolling();
    }

    this.reconnect();
  }

  public unsubscribeAll(isOffline?: boolean) {
    this.unsubscribe(
      {
        channels: this.subscribedChannels,
        channelGroups: this.subscribedChannelGroups,
      },
      isOffline,
    );
  }

  private startSubscribeLoop() {
    this.stopSubscribeLoop();
    const channelGroups = [...Object.keys(this.channelGroups)];
    const channels = [...Object.keys(this.channels)];

    Object.keys(this.presenceChannelGroups).forEach((group) => channelGroups.push(`${group}-pnpres`));
    Object.keys(this.presenceChannels).forEach((channel) => channels.push(`${channel}-pnpres`));

    // There is no need to start subscription loop for empty list of data sources.
    if (channels.length === 0 && channelGroups.length === 0) return;

    this.subscribeCall(
      {
        channels,
        channelGroups,
        state: this.presenceState,
        timetoken: this.currentTimetoken,
        region: this.region !== null ? this.region : undefined,
        filterExpression: this.configuration.filterExpression,
      },
      (status, result) => {
        this.processSubscribeResponse(status, result);
      },
    );
  }

  private stopSubscribeLoop() {
    if (this._subscribeAbort) {
      this._subscribeAbort();
      this._subscribeAbort = null;
    }
  }

  /**
   * Process subscribe REST API endpoint response.
   */
  private processSubscribeResponse(status: Status, result: Subscription.SubscriptionResponse | null) {
    if (status.error) {
      // Ignore aborted request.
      if (typeof status.errorData === 'object' && 'name' in status.errorData && status.errorData.name === 'AbortError')
        return;

      if (status.category === Categories.PNTimeoutCategory) {
        this.startSubscribeLoop();
      } else if (status.category === Categories.PNNetworkIssuesCategory) {
        this.disconnect();

        if (status.error && this.configuration.autoNetworkDetection && this.isOnline) {
          this.isOnline = false;
          this.listenerManager.announceNetworkDown();
        }

        this.reconnectionManager.onReconnect(() => {
          if (this.configuration.autoNetworkDetection && !this.isOnline) {
            this.isOnline = true;
            this.listenerManager.announceNetworkUp();
          }

          this.reconnect();
          this.subscriptionStatusAnnounced = true;

          const reconnectedAnnounce = {
            category: Categories.PNReconnectedCategory,
            operation: status.operation,
            lastTimetoken: this.lastTimetoken,
            currentTimetoken: this.currentTimetoken,
          };
          this.listenerManager.announceStatus(reconnectedAnnounce);
        });

        this.reconnectionManager.startPolling();
        this.listenerManager.announceStatus(status);
      } else if (status.category === Categories.PNBadRequestCategory) {
        this.stopHeartbeatTimer();
        this.listenerManager.announceStatus(status);
      } else {
        this.listenerManager.announceStatus(status);
      }

      return;
    }

    if (this.storedTimetoken) {
      this.currentTimetoken = this.storedTimetoken;
      this.storedTimetoken = null;
    } else {
      this.lastTimetoken = this.currentTimetoken;
      this.currentTimetoken = result!.cursor.timetoken;
    }

    if (!this.subscriptionStatusAnnounced) {
      const connected: StatusEvent = {
        category: StatusCategory.PNConnectedCategory,
        operation: status.operation,
        affectedChannels: this.pendingChannelSubscriptions,
        subscribedChannels: this.subscribedChannels,
        affectedChannelGroups: this.pendingChannelGroupSubscriptions,
        lastTimetoken: this.lastTimetoken,
        currentTimetoken: this.currentTimetoken,
      };

      this.subscriptionStatusAnnounced = true;
      this.listenerManager.announceStatus(connected);

      // Clear pending channels and groups.
      this.pendingChannelGroupSubscriptions = [];
      this.pendingChannelSubscriptions = [];
    }

    const { messages } = result!;
    const { requestMessageCountThreshold, dedupeOnSubscribe } = this.configuration;

    if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
      this.listenerManager.announceStatus({
        category: StatusCategory.PNRequestMessageCountExceededCategory,
        operation: status.operation,
      });
    }

    messages.forEach((message) => {
      if (dedupeOnSubscribe) {
        if (this.dedupingManager.isDuplicate(message)) return;
        this.dedupingManager.addEntry(message);
      }

      this.eventEmitter.emitEvent(message);
    });

    this.region = result!.cursor.region;
    this.startSubscribeLoop();
  }
  // endregion

  // region Presence
  /**
   * Update `uuid` state which should be sent with subscribe request.
   *
   * @param parameters - Channels and groups with state which should be associated to `uuid`.
   */
  public setState(parameters: { state: Payload; channels?: string[]; channelGroups?: string[] }) {
    const { state, channels, channelGroups } = parameters;
    channels?.forEach((channel) => channel in this.channels && (this.presenceState[channel] = state));
    channelGroups?.forEach((group) => group in this.channelGroups && (this.presenceState[group] = state));
  }

  /**
   * Manual presence management.
   *
   * @param parameters - Desired presence state for provided list of channels and groups.
   */
  public changePresence(parameters: { connected: boolean; channels?: string[]; channelGroups?: string[] }) {
    const { connected, channels, channelGroups } = parameters;

    if (connected) {
      channels?.forEach((channel) => (this.heartbeatChannels[channel] = {}));
      channelGroups?.forEach((group) => (this.heartbeatChannelGroups[group] = {}));
    } else {
      channels?.forEach((channel) => {
        if (channel in this.heartbeatChannels) delete this.heartbeatChannels[channel];
      });

      channelGroups?.forEach((group) => {
        if (group in this.heartbeatChannelGroups) delete this.heartbeatChannelGroups[group];
      });

      if (this.configuration.suppressLeaveEvents === false) {
        this.leaveCall({ channels, channelGroups }, (status) => this.listenerManager.announceStatus(status));
      }
    }

    this.reconnect();
  }

  private startHeartbeatTimer() {
    this.stopHeartbeatTimer();

    const heartbeatInterval = this.configuration.getHeartbeatInterval();
    if (!heartbeatInterval || heartbeatInterval === 0) return;

    this.sendHeartbeat();
    this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), heartbeatInterval * 1000) as unknown as number;
  }

  /**
   * Stop heartbeat.
   *
   * Stop timer which trigger {@link HeartbeatRequest} sending with configured presence intervals.
   */
  private stopHeartbeatTimer() {
    if (!this.heartbeatTimer) return;

    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  /**
   * Send heartbeat request.
   */
  private sendHeartbeat() {
    const heartbeatChannelGroups = Object.keys(this.heartbeatChannelGroups);
    const heartbeatChannels = Object.keys(this.heartbeatChannels);

    // There is no need to start heartbeat loop if there is no channels and groups to use.
    if (heartbeatChannels.length === 0 && heartbeatChannelGroups.length === 0) return;

    this.heartbeatCall(
      {
        channels: heartbeatChannels,
        channelGroups: heartbeatChannelGroups,
        heartbeat: this.configuration.getPresenceTimeout(),
        state: this.presenceState,
      },
      (status) => {
        if (status.error && this.configuration.announceFailedHeartbeats) this.listenerManager.announceStatus(status);
        if (status.error && this.configuration.autoNetworkDetection && this.isOnline) {
          this.isOnline = false;
          this.disconnect();
          this.listenerManager.announceNetworkDown();
          this.reconnect();
        }

        if (!status.error && this.configuration.announceSuccessfulHeartbeats) this.listenerManager.announceNetworkUp();
      },
    );
  }
  // endregion
}
