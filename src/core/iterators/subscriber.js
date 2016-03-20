/* @flow */

import Networking from '../components/networking';
import State from '../components/state';
import Logger from '../components/logger';
import superagent from 'superagent';
import consts from '../../../defaults';

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

    this._state.onSubscriptionChange(this.start.bind(this));
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
    let timetoken = this._state.getSubscribeTimeToken();
    let callback = this.__handleSubscribeResponse.bind(this);

    this._networking.performSubscribe(stringifiedChannels, timetoken, data, callback);
  }

  __handleSubscribeResponse(err: Object, response: Object) {
    if (err) {
      return;
    }

    let { onMessage, onPresence } = this._callbacks;
    let [payload, timetoken, firstOrigins, secondOrigins] = response;

    /*
      the subscribe endpoint is slightly confusing, it contains upto three elements
      1) an array of messages, those always exists.
      2) an array of channels OR channel groups, they align in their position to the messages,
         only exists if there is more than one channel or at least one channel group
      3) an array of channels OF channel groups, they align with messages and exist as long as
         one channel group exists.
    */
    firstOrigins = firstOrigins ? firstOrigins.split(',') : [];
    secondOrigins = secondOrigins ? secondOrigins.split(',') : [];

    payload.forEach((message, index) => {
      let firstOrigin = firstOrigins[index];
      let secondOrigin = secondOrigins[index];
      let isPresence = false;

      // we need to determine if the message originated from a channel or
      // channel group
      let envelope: Object = { message };

      // if a channel of a channel group exists, we must be in a channel group mode..
      if (secondOrigin) {
        envelope.channel = secondOrigin;
        envelope.channelGroup = firstOrigin;
      // otherwise, we are only in channel mode
      } else if (firstOrigin) {
        envelope.channel = firstOrigin;
      // otherwise, we must be subscribed to just one channel.
      } else {
        envelope.channel = this._state.getSubscribedChannels()[0];
      }

      if (envelope.channel && _endsWith(envelope.channel, consts.PRESENCE_SUFFIX)) {
        isPresence = true;
        envelope.channel = envelope.channel.replace(consts.PRESENCE_SUFFIX, '');
      }

      if (envelope.channelGroup && _endsWith(envelope.channelGroup, consts.PRESENCE_SUFFIX)) {
        isPresence = true;
        envelope.channelGroup = envelope.channelGroup.replace(consts.PRESENCE_SUFFIX, '');
      }

      if (isPresence) {
        onPresence(envelope);
      } else {
        onMessage(envelope);
      }
    });

    this._state.setSubscribeTimeToken(timetoken);
    this.start();
  }

  stop() {
    if (this._runningSuperagent) {
      this._runningSuperagent.abort();
      this._runningSuperagent = null;
    }
  }

}
