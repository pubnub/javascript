
import SubscribeEndpoints from '../endpoints/subscribe';
import PresenceEndpoints from '../endpoints/presence';
import Crypto from '../components/cryptography';
import Config from '../components/config';
import utils from '../utils';
import { SubscribeMetadata, MessageAnnouncement,
  SubscribeEnvelope, statusStruct, callbackStruct, PresenceAnnouncement } from '../flow_interfaces';

type subscribeArgs = {
  channels: Array<string>,
  channelGroups: Array<string>,
  withPresence: ?boolean,
  timetoken: ?number
}

type unsubscribeArgs = {
  channels: Array<string>,
  channelGroups: Array<string>
}

type stateArgs = {
  channels: Array<string>,
  channelGroups: Array<string>,
  state: Object
}

type subscriptionManagerConsturct = {
    subscribeEndpoints: SubscribeEndpoints,
    presenceEndpoints: PresenceEndpoints,
    config: Config,
    crypto: Crypto
}

export default class {

  _channels: Object;
  _presenceChannels: Object;

  _channelGroups: Object;
  _presenceChannelGroups: Object;

  _timetoken: number;
  _region: number;

  _subscribeCall: Object;

  _subscribeEndpoints: SubscribeEndpoints;
  _presenceEndpoints: PresenceEndpoints;

  _listeners: Array<callbackStruct>;

  constructor({ subscribeEndpoints, presenceEndpoints, config, crypto }: subscriptionManagerConsturct) {
    this._channels = {};
    this._presenceChannels = {};

    this._channelGroups = {};
    this._presenceChannelGroups = {};

    this._config = config;
    this._subscribeEndpoints = subscribeEndpoints;
    this._presenceEndpoints = presenceEndpoints;
    this._crypto = crypto;

    this._timetoken = 0;

    this._listeners = [];
  }

  adaptStateChange(args: stateArgs, callback: Function) {
    const { state, channels = [], channelGroups = [] } = args;
    this._presenceEndpoints.setState({ state, channels, channelGroups }, callback);
  }

  adaptSubscribeChange(args: subscribeArgs) {
    const { timetoken, channels = [], channelGroups = [], withPresence = false } = args;

    if (timetoken) this._timetoken = timetoken;

    channels.forEach((channel) => {
      this._channels[channel] = true;
      if (withPresence) this._presenceChannels[channel] = true;
    });

    channelGroups.forEach((channelGroup) => {
      this._channelGroups[channelGroup] = true;
      if (withPresence) this._presenceChannelGroups[channelGroup] = true;
    });

    this.reconnect();
  }

  adaptUnsubscribeChange(args: unsubscribeArgs) {
    const { channels = [], channelGroups = [] } = args;

    channels.forEach((channel) => {
      if (channel in this._channels) delete this._channels[channel];
      if (channel in this._presenceChannels) delete this._presenceChannels[channel];
    });

    channelGroups.forEach((channelGroup) => {
      if (channelGroup in this._channelGroups) delete this._channelGroups[channelGroup];
      if (channelGroup in this._presenceChannelGroups) delete this._channelGroups[channelGroup];
    });

    this._presenceEndpoints.leave({ channels, channelGroups }, (status) => {
      this._announceStatus(status);
    });

    this.reconnect();
  }

  addListener(newListeners: callbackStruct) {
    this._listeners.push(newListeners);
  }

  removeListener(deprecatedListeners: callbackStruct) {
    const listenerPosition = this._listeners.indexOf(deprecatedListeners);
    if (listenerPosition > -1) this._listeners = this._listeners.splice(listenerPosition, 1);
  }

  reconnect() {
    this._startSubscribeLoop();
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

    this._subscribeCall = this._subscribeEndpoints.subscribe({ channels, channelGroups,
      timetoken: this._timetoken,
      filterExpression: this._config.filterExpression,
      region: this._region
    }, (status: statusStruct, payload: SubscribeEnvelope) => {
      if (status.error) {
        // TODO handle failure
        console.log("subscribe tanked");
        this._startSubscribeLoop();
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
          this._announcePresence(announce);
        } else {
          let announce: MessageAnnouncement = {};
          announce.actualChannel = (subscriptionMatch != null) ? channel : null;
          announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
          announce.timetoken = publishMetaData.publishTimetoken;

          if (this._config.cipherKey) {
            announce.message = this._crypto.decrypt(message.payload);
            // TODO decipher the message
          } else {
            announce.message = message.payload;
          }

          this._announceMessage(announce);
        }
      });

      this._region = payload.metadata.region;
      this._timetoken = payload.metadata.timetoken;
      this._startSubscribeLoop();
    });
  }

  _stopSubscribeLoop() {
    // TODO
  }

  _announcePresence(announce: PresenceAnnouncement) {
    this._listeners.forEach((listener) => {
      if (listener.presence) listener.presence(announce);
    });
  }

  _announceStatus(announce) {
    this._listeners.forEach((listener) => {
      if (listener.status) listener.status(announce);
    });
  }

  _announceMessage(announce: MessageAnnouncement) {
    this._listeners.forEach((listener) => {
      if (listener.message) listener.message(announce);
    });
  }

}
