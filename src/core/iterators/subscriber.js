/* @flow */

import Networking from '../components/networking';
import State from '../components/state';
import Logger from '../components/logger';
import superagent from 'superagent';
import consts from '../../../defaults';
import utils from '../utils';

import _endsWith from 'lodash/endsWith';

import { callbackStruct } from '../flow_interfaces';

type subscriberConstruct = {
  networking: Networking,
  state: State,
  callbacks: callbackStruct
};

export default class {

  _networking: Networking;
  _state: State;
  _callbacks: callbackStruct;
  _l: Logger;

  _runningSuperagent: superagent;

  constructor({ networking, state, callbacks }: subscriberConstruct) {
    this._networking = networking;
    this._state = state;
    this._callbacks = callbacks;
    this._l = Logger.getLogger('#iterator/subscriber');

    this._state.onPresenceConfigChange(this.start.bind(this));
    this._state.onSubscriptionChange(this.start.bind(this));
    this._state.onStateChange(this.start.bind(this));
  }

  start() {
    // we can have only one operation on subscribe, cancel previous call.
    this.stop();

    let channels = [];
    let channelGroups = [];
    let data: Object = {};

    this._state.getSubscribedChannels().forEach((channelName) => {
      let channel = this._state.getChannel(channelName);

      channels.push(channel.name);

      if (channel.enablePresence) {
        channels.push(channel.name + consts.PRESENCE_SUFFIX);
      }
    });

    this._state.getSubscribedChannelGroups().forEach((channelGroupName) => {
      let channelGroup = this._state.getChannelGroup(channelGroupName);

      channelGroups.push(channelGroup.name);

      if (channelGroup.enablePresence) {
        channelGroups.push(channelGroup.name + consts.PRESENCE_SUFFIX);
      }
    });

    if (channels.length === 0 && channelGroups.length === 0) {
      this._l.debug('channelList and channelGroupList is empty, aborting');
      return;
    }

    let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    let callback = this.__handleSubscribeResponse.bind(this);

    data.tt = this._state.getSubscribeTimeToken();

    if (channelGroups.length > 0) {
      data['channel-group'] = channelGroups.join(',');
    }

    if (this._state.filterExpression && this._state.filterExpression !== '') {
      data['filter-expr'] = this._state.filterExpression;
    }

    if (this._state.subscribeRegion && this._state.subscribeRegion !== '') {
      data.tr = this._state.subscribeRegion;
    }

    // include state if we have any state present
    if (this._state.getChannelsWithPresence().length > 0 || this._state.getChannelGroupsWithPresence().length > 0) {
      data.state = JSON.stringify(this._state.getPresenceState());
      data.heartbeat = this._state.getPresenceTimeout();
    }

    this._runningSuperagent = this._networking.performSubscribe(stringifiedChannels, data, callback);
  }

  __handleSubscribeResponse(err: Object, response: Object) {
    if (err) {
      this.start();
      return;
    }

    let { onMessage, onPresence } = this._callbacks;

    let payload = response.m ? response.m : [];
    let timetoken = response.t.t;
    let region = response.t.r;

    payload.forEach((message) => {
      let isPresence = false;
      let envelope = utils.v2ExpandKeys(message);


      if (envelope.channel && _endsWith(envelope.channel, consts.PRESENCE_SUFFIX)) {
        isPresence = true;
        envelope.channel = envelope.channel.replace(consts.PRESENCE_SUFFIX, '');
      }

      if (envelope.subscriptionMatch && _endsWith(envelope.subscriptionMatch, consts.PRESENCE_SUFFIX)) {
        isPresence = true;
        envelope.subscriptionMatch = envelope.subscriptionMatch.replace(consts.PRESENCE_SUFFIX, '');
      }

      if (isPresence) {
        onPresence(envelope);
      } else {
        onMessage(envelope);
      }
    });

    this._state.setSubscribeTimeToken(timetoken);
    this._state.subscribeRegion = region;
    this.start();
  }

  stop() {
    if (this._runningSuperagent) {
      this._runningSuperagent.abort();
      this._runningSuperagent = null;
    }
  }

}
