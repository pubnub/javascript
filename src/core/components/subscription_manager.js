
import SubscribeEndpoints from '../endpoints/subscribe';
import PresenceEndpoints from '../endpoints/presence';
import TimeEndpoints from '../endpoints/time';
import Crypto from '../components/cryptography';
import Config from '../components/config';
import ListenerManager from '../components/listener_manager';
import ReconnectionManager from '../components/reconnection_manager';
import utils from '../utils';
import { MessageAnnouncement, SubscribeEnvelope, StatusAnnouncement, PresenceAnnouncement } from '../flow_interfaces';

type SubscribeArgs = {
  channels: Array<string>,
  channelGroups: Array<string>,
  withPresence: ?boolean,
  timetoken: ?number
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
    subscribeEndpoints: SubscribeEndpoints,
    presenceEndpoints: PresenceEndpoints,
    timeEndpoints: TimeEndpoints,
    config: Config,
    crypto: Crypto,
    listenerManager: ListenerManager
}

export default class {

  _crypto: Crypto;
  _config: Config;
  _listenerManager: ListenerManager;
  _reconnectionManager: ReconnectionManager;
  _subscribeEndpoints: SubscribeEndpoints;
  _presenceEndpoints: PresenceEndpoints;

  _channels: Object;
  _presenceChannels: Object;

  _channelGroups: Object;
  _presenceChannelGroups: Object;

  _timetoken: number;
  _region: number;

  _subscribeCall: Object;

  _heartbeatTimer: number;

  constructor({ subscribeEndpoints, presenceEndpoints, timeEndpoints, config, crypto, listenerManager }: SubscriptionManagerConsturct) {
    this._listenerManager = listenerManager;
    this._config = config;
    this._subscribeEndpoints = subscribeEndpoints;
    this._presenceEndpoints = presenceEndpoints;
    this._timeEndpoints = timeEndpoints;
    this._crypto = crypto;

    this._channels = {};
    this._presenceChannels = {};

    this._channelGroups = {};
    this._presenceChannelGroups = {};

    this._timetoken = 0;

    this._reconnectionManager = new ReconnectionManager({ timeEndpoints });
    this._reconnectionManager.onReconnection(() => {
      this.reconnect();
    });
  }

  adaptStateChange(args: StateArgs, callback: Function) {
    const { state, channels = [], channelGroups = [] } = args;

    channels.forEach((channel) => {
      if (channel in this._channels) this._channels[channel].state = state;
    });

    channelGroups.forEach((channelGroup) => {
      if (channelGroup in this._channelGroups) this._channelGroups[channelGroup].state = state;
    });

    this._presenceEndpoints.setState({ state, channels, channelGroups }, callback);
  }

  adaptSubscribeChange(args: SubscribeArgs) {
    const { timetoken, channels = [], channelGroups = [], withPresence = false } = args;

    if (timetoken) this._timetoken = timetoken;

    channels.forEach((channel) => {
      this._channels[channel] = { state: {} };
      if (withPresence) this._presenceChannels[channel] = {};
    });

    channelGroups.forEach((channelGroup) => {
      this._channelGroups[channelGroup] = { state: {} };
      if (withPresence) this._presenceChannelGroups[channelGroup] = {};
    });

    this.reconnect();
  }

  adaptUnsubscribeChange(args: UnsubscribeArgs) {
    const { channels = [], channelGroups = [] } = args;

    channels.forEach((channel) => {
      if (channel in this._channels) delete this._channels[channel];
      if (channel in this._presenceChannels) delete this._presenceChannels[channel];
    });

    channelGroups.forEach((channelGroup) => {
      if (channelGroup in this._channelGroups) delete this._channelGroups[channelGroup];
      if (channelGroup in this._presenceChannelGroups) delete this._channelGroups[channelGroup];
    });

    if (this._config.suppressLeaveEvents === false) {
      this._presenceEndpoints.leave({ channels, channelGroups }, (status) => {
        this._listenerManager.announceStatus(status);
      });
    }

    this.reconnect();
  }

  reconnect() {
    this._startSubscribeLoop();
    this._registerHeartbeatTimer();
  }

  disconnect() {
    this._stopSubscribeLoop();
    this._stopHeartbeatTimer();
  }

  _registerHeartbeatTimer() {
    this._stopHeartbeatTimer();
    this._heartbeatTimer = setInterval(this._performHeartbeatLoop.bind(this), this._config.getHeartbeatInterval() * 1000);
  }

  _stopHeartbeatTimer() {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }

  _performHeartbeatLoop() {
    let presenceChannels = Object.keys(this._channels);
    let presenceChannelGroups = Object.keys(this._channelGroups);
    let presenceState = {};

    if (presenceChannels.length === 0 && presenceChannelGroups.length === 0) {
      return;
    }

    presenceChannels.forEach((channel) => {
      let channelState = this._channels[channel].state;
      if (channelState) presenceState[channel] = channelState;
    });

    presenceChannelGroups.forEach((channelGroup) => {
      let channelGroupState = this.channelGroup[channelGroup].state;
      if (channelGroupState) presenceState[channelGroup] = channelGroupState;
    });

    let onHeartbeat = (status: StatusAnnouncement) => {
      if (status.error && this._config.announceFailedHeartbeats) {
        this._listenerManager.announceStatus(status);
      }

      if (!status.error && this._config.announceSuccessfulHeartbeats) {
        this._listenerManager.announceStatus(status);
      }
    };

    this._presenceEndpoints.heartbeat({
      channels: presenceChannels,
      channelGroups: presenceChannelGroups,
      state: presenceState }, onHeartbeat.bind(this));
  }

  _startSubscribeLoop() {
    this._stopSubscribeLoop();
    let channels = [];
    let channelGroups = [];

    Object.keys(this._channels).forEach((channel) => channels.push(channel));
    Object.keys(this._presenceChannels).forEach((channel) => channels.push(channel + '-pnpres'));

    Object.keys(this._channelGroups).forEach((channelGroup) => channelGroups.push(channelGroup));
    Object.keys(this._presenceChannelGroups).forEach((channelGroup) => channelGroups.push(channelGroup + '-pnpres'));

    if (channels.length === 0 && channelGroups.length === 0) {
      return;
    }

    const subscribeArgs = {
      channels,
      channelGroups,
      timetoken: this._timetoken,
      filterExpression: this._config.filterExpression,
      region: this._region
    };

    this._subscribeCall = this._subscribeEndpoints.subscribe(subscribeArgs, this._processSubscribeResponse.bind(this));
  }

  _processSubscribeResponse(status: StatusAnnouncement, payload: SubscribeEnvelope) {
    if (status.error) {
      // if we timeout from server, restart the loop.
      if (status.category === 'PNTimeoutCategory') {
        this._startSubscribeLoop();
      }

      // we lost internet connection, alert the reconnection manager and terminate all loops
      if (status.category === 'PNNetworkIssuesCategory') {
        this.disconnect();
        this._reconnectionManager.startPolling();
      }

      return;
    }

    payload.messages.forEach((message) => {
      let channel = message.channel;
      let subscriptionMatch = message.subscriptionMatch;
      let publishMetaData = message.publishMetaData;

      if (channel === subscriptionMatch) {
        subscriptionMatch = null;
      }

      if (utils.endsWith(message.channel, '-pnpres')) {
        let announce: PresenceAnnouncement = {};
        announce.actualChannel = (subscriptionMatch != null) ? channel : null;
        announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
        // announce.state = message.payload.getData())
        announce.timetoken = publishMetaData.publishTimetoken;
        announce.occupancy = message.payload.occupancy;
        announce.uuid = message.payload.uuid;
        announce.timestamp = message.payload.timestamp;
        this._listenerManager.announcePresence(announce);
      } else {
        let announce: MessageAnnouncement = {};
        announce.actualChannel = (subscriptionMatch != null) ? channel : null;
        announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
        announce.timetoken = publishMetaData.publishTimetoken;

        if (this._config.cipherKey) {
          announce.message = this._crypto.decrypt(message.payload);
        } else {
          announce.message = message.payload;
        }

        this._listenerManager.announceMessage(announce);
      }
    });

    this._region = payload.metadata.region;
    this._timetoken = payload.metadata.timetoken;
    this._startSubscribeLoop();
  }

  _stopSubscribeLoop() {
    if (this._subscribeCall) {
      this._subscribeCall.abort();
      this._subscribeCall = null;
    }
  }

}
