/* @flow */
import Crypto from '../components/cryptography';
import Config from '../components/config';
import ListenerManager from '../components/listener_manager';
import ReconnectionManager from '../components/reconnection_manager';
import DedupingManager from '../components/deduping_manager';
import utils from '../utils';
import { MessageAnnouncement, SubscribeEnvelope, StatusAnnouncement, PresenceAnnouncement } from '../flow_interfaces';
import categoryConstants from '../constants/categories';

type SubscribeArgs = {
  channels: Array<string>,
  channelGroups: Array<string>,
  withPresence: ?boolean,
  timetoken: ?number,
  withHeartbeats: ?boolean
}

type PresenceArgs = {
  channels: Array<string>,
  channelGroups: Array<string>,
  connected: boolean
}

type UnsubscribeArgs = {
  channels: Array<string>,
  channelGroups: Array<string>
}

type StateArgs = {
  channels: Array<string>,
  channelGroups: Array<string>,
  state: Object
}

type SubscriptionManagerConsturct = {
    leaveEndpoint: Function,
    subscribeEndpoint: Function,
    timeEndpoint: Function,
    heartbeatEndpoint: Function,
    setStateEndpoint: Function,
    config: Config,
    crypto: Crypto,
    listenerManager: ListenerManager
}

export default class {

  _crypto: Crypto;
  _config: Config;
  _listenerManager: ListenerManager;
  _reconnectionManager: ReconnectionManager;

  _leaveEndpoint: Function;
  _heartbeatEndpoint: Function;
  _setStateEndpoint: Function;
  _subscribeEndpoint: Function;

  _channels: Object;
  _presenceChannels: Object;

  _heartbeatChannels: Object;
  _heartbeatChannelGroups: Object;

  _channelGroups: Object;
  _presenceChannelGroups: Object;

  _currentTimetoken: number;
  _lastTimetoken: number;
  _storedTimetoken: ?number;

  _region: ?number;

  _subscribeCall: ?Object;
  _heartbeatTimer: ?number;

  _subscriptionStatusAnnounced: boolean;

  _autoNetworkDetection: boolean;
  _isOnline: boolean;

  // store pending connection elements
  _pendingChannelSubscriptions: Array<string>;
  _pendingChannelGroupSubscriptions: Array<string>;
  //

  _dedupingManager: DedupingManager;

  constructor({ subscribeEndpoint, leaveEndpoint, heartbeatEndpoint, setStateEndpoint, timeEndpoint, config, crypto, listenerManager }: SubscriptionManagerConsturct) {
    this._listenerManager = listenerManager;
    this._config = config;

    this._leaveEndpoint = leaveEndpoint;
    this._heartbeatEndpoint = heartbeatEndpoint;
    this._setStateEndpoint = setStateEndpoint;
    this._subscribeEndpoint = subscribeEndpoint;

    this._crypto = crypto;

    this._channels = {};
    this._presenceChannels = {};

    this._heartbeatChannels = {};
    this._heartbeatChannelGroups = {};

    this._channelGroups = {};
    this._presenceChannelGroups = {};

    this._pendingChannelSubscriptions = [];
    this._pendingChannelGroupSubscriptions = [];

    this._currentTimetoken = 0;
    this._lastTimetoken = 0;
    this._storedTimetoken = null;

    this._subscriptionStatusAnnounced = false;

    this._isOnline = true;

    this._reconnectionManager = new ReconnectionManager({ timeEndpoint });
    this._dedupingManager = new DedupingManager({ config });
  }

  adaptStateChange(args: StateArgs, callback: Function) {
    const { state, channels = [], channelGroups = [] } = args;

    channels.forEach((channel) => {
      if (channel in this._channels) this._channels[channel].state = state;
    });

    channelGroups.forEach((channelGroup) => {
      if (channelGroup in this._channelGroups) this._channelGroups[channelGroup].state = state;
    });

    return this._setStateEndpoint({ state, channels, channelGroups }, callback);
  }

  adaptPresenceChange(args: PresenceArgs) {
    const { connected, channels = [], channelGroups = [] } = args;

    if (connected) {
      channels.forEach((channel: string) => {
        this._heartbeatChannels[channel] = { state: {} };
      });

      channelGroups.forEach((channelGroup: string) => {
        this._heartbeatChannelGroups[channelGroup] = { state: {} };
      });
    } else {
      channels.forEach((channel) => {
        if (channel in this._heartbeatChannels) {
          delete this._heartbeatChannels[channel];
        }
      });

      channelGroups.forEach((channelGroup) => {
        if (channelGroup in this._heartbeatChannelGroups) {
          delete this._heartbeatChannelGroups[channelGroup];
        }
      });

      if (this._config.suppressLeaveEvents === false) {
        this._leaveEndpoint({ channels, channelGroups }, (status) => {
          this._listenerManager.announceStatus(status);
        });
      }
    }

    this.reconnect();
  }

  adaptSubscribeChange(args: SubscribeArgs) {
    const { timetoken, channels = [], channelGroups = [], withPresence = false, withHeartbeats = true } = args;

    if (!this._config.subscribeKey || this._config.subscribeKey === '') {
      if (console && console.log) console.log('subscribe key missing; aborting subscribe') //eslint-disable-line
      return;
    }

    if (timetoken) {
      this._lastTimetoken = this._currentTimetoken;
      this._currentTimetoken = timetoken;
    }

    // reset the current timetoken to get a connect event.
    if (this._currentTimetoken !== '0' && this._currentTimetoken !== 0) {
      this._storedTimetoken = this._currentTimetoken;
      this._currentTimetoken = 0;
    }

    channels.forEach((channel: string) => {
      this._channels[channel] = { state: {} };
      if (withPresence) this._presenceChannels[channel] = {};
      if (withHeartbeats) this._heartbeatChannels[channel] = {};

      this._pendingChannelSubscriptions.push(channel);
    });

    channelGroups.forEach((channelGroup: string) => {
      this._channelGroups[channelGroup] = { state: {} };
      if (withPresence) this._presenceChannelGroups[channelGroup] = {};
      if (withHeartbeats) this._heartbeatChannelGroups[channelGroup] = {};

      this._pendingChannelGroupSubscriptions.push(channelGroup);
    });

    this._subscriptionStatusAnnounced = false;
    this.reconnect();
  }

  adaptUnsubscribeChange(args: UnsubscribeArgs, isOffline: boolean) {
    const { channels = [], channelGroups = [] } = args;

    // keep track of which channels and channel groups
    // we are going to unsubscribe from.
    const actualChannels = [];
    const actualChannelGroups = [];
    //

    channels.forEach((channel) => {
      if (channel in this._channels) {
        delete this._channels[channel];
        actualChannels.push(channel);

        if (channel in this._heartbeatChannels) {
          delete this._heartbeatChannels[channel];
        }
      }
      if (channel in this._presenceChannels) {
        delete this._presenceChannels[channel];
        actualChannels.push(channel);
      }
    });

    channelGroups.forEach((channelGroup) => {
      if (channelGroup in this._channelGroups) {
        delete this._channelGroups[channelGroup];
        actualChannelGroups.push(channelGroup);

        if (channelGroup in this._heartbeatChannelGroups) {
          delete this._heartbeatChannelGroups[channelGroup];
        }
      }
      if (channelGroup in this._presenceChannelGroups) {
        delete this._channelGroups[channelGroup];
        actualChannelGroups.push(channelGroup);
      }
    });

    // no-op if there are no channels and cg's to unsubscribe from.
    if (actualChannels.length === 0 && actualChannelGroups.length === 0) {
      return;
    }

    if (this._config.suppressLeaveEvents === false && !isOffline) {
      this._leaveEndpoint({ channels: actualChannels, channelGroups: actualChannelGroups }, (status) => {
        status.affectedChannels = actualChannels;
        status.affectedChannelGroups = actualChannelGroups;
        status.currentTimetoken = this._currentTimetoken;
        status.lastTimetoken = this._lastTimetoken;
        this._listenerManager.announceStatus(status);
      });
    }

    // if we have nothing to subscribe to, reset the timetoken.
    if (Object.keys(this._channels).length === 0 &&
      Object.keys(this._presenceChannels).length === 0 &&
      Object.keys(this._channelGroups).length === 0 &&
      Object.keys(this._presenceChannelGroups).length === 0) {
      this._lastTimetoken = 0;
      this._currentTimetoken = 0;
      this._storedTimetoken = null;
      this._region = null;
      this._reconnectionManager.stopPolling();
    }

    this.reconnect();
  }

  unsubscribeAll(isOffline: boolean) {
    this.adaptUnsubscribeChange({ channels: this.getSubscribedChannels(), channelGroups: this.getSubscribedChannelGroups() }, isOffline);
  }

  getHeartbeatChannels(): Array<string> {
    return Object.keys(this._heartbeatChannels);
  }

  getHeartbeatChannelGroups(): Array<string> {
    return Object.keys(this._heartbeatChannelGroups);
  }

  getSubscribedChannels(): Array<string> {
    return Object.keys(this._channels);
  }

  getSubscribedChannelGroups(): Array<string> {
    return Object.keys(this._channelGroups);
  }

  reconnect() {
    this._startSubscribeLoop();
    this._registerHeartbeatTimer();
  }

  disconnect() {
    this._stopSubscribeLoop();
    this._stopHeartbeatTimer();
    this._reconnectionManager.stopPolling();
  }

  _registerHeartbeatTimer() {
    this._stopHeartbeatTimer();

    // if the interval is 0, do not queue up heartbeating
    if (this._config.getHeartbeatInterval() === 0) {
      return;
    }

    this._performHeartbeatLoop();
    this._heartbeatTimer = setInterval(this._performHeartbeatLoop.bind(this), this._config.getHeartbeatInterval() * 1000);
  }

  _stopHeartbeatTimer() {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }

  _performHeartbeatLoop() {
    const heartbeatChannels = this.getHeartbeatChannels();

    const heartbeatChannelGroups = this.getHeartbeatChannelGroups();

    let presenceState = {};

    if (heartbeatChannels.length === 0 && heartbeatChannelGroups.length === 0) {
      return;
    }

    this.getSubscribedChannels().forEach((channel) => {
      let channelState = this._channels[channel].state;
      if (Object.keys(channelState).length) presenceState[channel] = channelState;
    });

    this.getSubscribedChannelGroups().forEach((channelGroup) => {
      let channelGroupState = this._channelGroups[channelGroup].state;
      if (Object.keys(channelGroupState).length) presenceState[channelGroup] = channelGroupState;
    });

    let onHeartbeat = (status: StatusAnnouncement) => {
      if (status.error && this._config.announceFailedHeartbeats) {
        this._listenerManager.announceStatus(status);
      }

      if (status.error && this._config.autoNetworkDetection && this._isOnline) {
        this._isOnline = false;
        this.disconnect();
        this._listenerManager.announceNetworkDown();
        this.reconnect();
      }

      if (!status.error && this._config.announceSuccessfulHeartbeats) {
        this._listenerManager.announceStatus(status);
      }
    };

    this._heartbeatEndpoint({
      channels: heartbeatChannels,
      channelGroups: heartbeatChannelGroups,
      state: presenceState }, onHeartbeat.bind(this));
  }

  _startSubscribeLoop() {
    this._stopSubscribeLoop();
    let channels = [];
    let channelGroups = [];

    Object.keys(this._channels).forEach(channel => channels.push(channel));
    Object.keys(this._presenceChannels).forEach(channel => channels.push(`${channel}-pnpres`));

    Object.keys(this._channelGroups).forEach(channelGroup => channelGroups.push(channelGroup));
    Object.keys(this._presenceChannelGroups).forEach(channelGroup => channelGroups.push(`${channelGroup}-pnpres`));

    if (channels.length === 0 && channelGroups.length === 0) {
      return;
    }

    const subscribeArgs = {
      channels,
      channelGroups,
      timetoken: this._currentTimetoken,
      filterExpression: this._config.filterExpression,
      region: this._region
    };

    this._subscribeCall = this._subscribeEndpoint(subscribeArgs, this._processSubscribeResponse.bind(this));
  }

  _processSubscribeResponse(status: StatusAnnouncement, payload: SubscribeEnvelope) {
    if (status.error) {
      // if we timeout from server, restart the loop.
      if (status.category === categoryConstants.PNTimeoutCategory) {
        this._startSubscribeLoop();
      } else if (status.category === categoryConstants.PNNetworkIssuesCategory) {
        // we lost internet connection, alert the reconnection manager and terminate all loops
        this.disconnect();

        if (status.error && this._config.autoNetworkDetection && this._isOnline) {
          this._isOnline = false;
          this._listenerManager.announceNetworkDown();
        }

        this._reconnectionManager.onReconnection(() => {
          if (this._config.autoNetworkDetection && !this._isOnline) {
            this._isOnline = true;
            this._listenerManager.announceNetworkUp();
          }
          this.reconnect();
          this._subscriptionStatusAnnounced = true;
          let reconnectedAnnounce: StatusAnnouncement = {
            category: categoryConstants.PNReconnectedCategory,
            operation: status.operation,
            lastTimetoken: this._lastTimetoken,
            currentTimetoken: this._currentTimetoken
          };
          this._listenerManager.announceStatus(reconnectedAnnounce);
        });

        this._reconnectionManager.startPolling();
        this._listenerManager.announceStatus(status);
      } else if (status.category === categoryConstants.PNBadRequestCategory) {
        this._stopHeartbeatTimer();
        this._listenerManager.announceStatus(status);
      } else {
        this._listenerManager.announceStatus(status);
      }

      return;
    }

    if (this._storedTimetoken) {
      this._currentTimetoken = this._storedTimetoken;
      this._storedTimetoken = null;
    } else {
      this._lastTimetoken = this._currentTimetoken;
      this._currentTimetoken = payload.metadata.timetoken;
    }

    if (!this._subscriptionStatusAnnounced) {
      let connectedAnnounce: StatusAnnouncement = {};
      connectedAnnounce.category = categoryConstants.PNConnectedCategory;
      connectedAnnounce.operation = status.operation;
      connectedAnnounce.affectedChannels = this._pendingChannelSubscriptions;
      connectedAnnounce.subscribedChannels = this.getSubscribedChannels();
      connectedAnnounce.affectedChannelGroups = this._pendingChannelGroupSubscriptions;
      connectedAnnounce.lastTimetoken = this._lastTimetoken;
      connectedAnnounce.currentTimetoken = this._currentTimetoken;
      this._subscriptionStatusAnnounced = true;
      this._listenerManager.announceStatus(connectedAnnounce);

      // clear the pending connections list
      this._pendingChannelSubscriptions = [];
      this._pendingChannelGroupSubscriptions = [];
    }

    let messages = payload.messages || [];
    let { requestMessageCountThreshold, dedupeOnSubscribe } = this._config;

    if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
      let countAnnouncement: StatusAnnouncement = {};
      countAnnouncement.category = categoryConstants.PNRequestMessageCountExceededCategory;
      countAnnouncement.operation = status.operation;
      this._listenerManager.announceStatus(countAnnouncement);
    }

    messages.forEach((message) => {
      let channel = message.channel;
      let subscriptionMatch = message.subscriptionMatch;
      let publishMetaData = message.publishMetaData;

      if (channel === subscriptionMatch) {
        subscriptionMatch = null;
      }

      if (dedupeOnSubscribe) {
        if (this._dedupingManager.isDuplicate(message)) {
          return;
        } else {
          this._dedupingManager.addEntry(message);
        }
      }

      if (utils.endsWith(message.channel, '-pnpres')) {
        let announce: PresenceAnnouncement = {};
        announce.channel = null;
        announce.subscription = null;

        // deprecated -->
        announce.actualChannel = (subscriptionMatch != null) ? channel : null;
        announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
        // <-- deprecated

        if (channel) {
          announce.channel = channel.substring(0, channel.lastIndexOf('-pnpres'));
        }

        if (subscriptionMatch) {
          announce.subscription = subscriptionMatch.substring(0, subscriptionMatch.lastIndexOf('-pnpres'));
        }

        announce.action = message.payload.action;
        announce.state = message.payload.data;
        announce.timetoken = publishMetaData.publishTimetoken;
        announce.occupancy = message.payload.occupancy;
        announce.uuid = message.payload.uuid;
        announce.timestamp = message.payload.timestamp;

        if (message.payload.join) {
          announce.join = message.payload.join;
        }

        if (message.payload.leave) {
          announce.leave = message.payload.leave;
        }

        if (message.payload.timeout) {
          announce.timeout = message.payload.timeout;
        }

        this._listenerManager.announcePresence(announce);
      } else {
        let announce: MessageAnnouncement = {};
        announce.channel = null;
        announce.subscription = null;

        // deprecated -->
        announce.actualChannel = (subscriptionMatch != null) ? channel : null;
        announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
        // <-- deprecated

        announce.channel = channel;
        announce.subscription = subscriptionMatch;
        announce.timetoken = publishMetaData.publishTimetoken;
        announce.publisher = message.issuingClientId;

        if (message.userMetadata) {
          announce.userMetadata = message.userMetadata;
        }

        if (this._config.cipherKey) {
          announce.message = this._crypto.decrypt(message.payload);
        } else {
          announce.message = message.payload;
        }

        this._listenerManager.announceMessage(announce);
      }
    });

    this._region = payload.metadata.region;
    this._startSubscribeLoop();
  }

  _stopSubscribeLoop() {
    if (this._subscribeCall) {
      if (typeof this._subscribeCall.abort === 'function') {
        this._subscribeCall.abort();
      }
      this._subscribeCall = null;
    }
  }

}
