
import SubscribeEndpoints from '../endpoints/subscribe';
import Config from '../components/config';
import { SubscribeMetadata, SubscribeMessage, SubscribeEnvelope, statusStruct } from '../flow_interfaces';

type subscribeArgs = {
  channels: Array<string>,
  channelGroups: Array<string>,
  withPresence: ?boolean,
  timetoken: ?number
}

type subscriptionManagerConsturct = {
    subscribeEndpoints: SubscribeEndpoints,
    config: Config
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

  constructor({ subscribeEndpoints, config }: subscriptionManagerConsturct) {
    this._channels = {};
    this._presenceChannels = {};

    this._channelGroups = {};
    this._presenceChannelGroups = {};

    this._config = config;
    this._subscribeEndpoints = subscribeEndpoints;

    this._timetoken = 0;
  }

  adaptStateChange() {
    // TODO
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
    // TODO
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

      console.log(payload);
      this._region = payload.metadata.region;
      this._timetoken = payload.metadata.timetoken;
        this._startSubscribeLoop();
    });
  }

  _stopSubscribeLoop() {
    // TODO
  }

}
