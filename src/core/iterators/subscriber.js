/* @flow */

import Networking from '../components/networking';
import State from '../components/state';
import Logger from '../components/logger';
import superagent from 'superagent';
import consts from '../../../defaults';

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
    this._l = Logger.getLogger('#endpoints/publish');

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
      console.log('subscribe error', err);
      return;
    }

    let { onMessage, onPresence } = this._callbacks;
    let [payload, timetoken, firstOrigins, secondOrigins] = response;

    firstOrigins = firstOrigins ? firstOrigins.split(',') : []
    secondOrigins = secondOrigins ? secondOrigins.split(',') : []

    payload.forEach((message, index) => {
      let firstOrigin = firstOrigins[index];
      let secondOrigin = secondOrigins[index];

      // we need to determine if the message originated from a channel or
      // channel group
      let envelope: Object = {message};


      console.log('sub callback', message, index, firstOrigin, secondOrigin);
      console.log('\n\n\n');
    })

    this._state.setSubscribeTimeToken(timetoken);
    this.start();
  }

  __decideChannelAndG

  stop() {
    if (this._runningSuperagent) {
      this._runningSuperagent.abort();
      this._runningSuperagent = null;
    }
  }

}
