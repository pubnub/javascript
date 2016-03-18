/* @flow */

import Networking from '../components/networking';
import State from '../components/state';
import Logger from '../components/logger';
import superagent from 'superagent';
import consts from '../../../defaults';

type subscriberConstruct = {
  networking: Networking,
  state: State
};

export default class {

  _networking: Networking;
  _state: State;
  _l: Logger;

  _runningSuperagent: superagent;

  constructor({ networking, state}: subscriberConstruct) {
    this._networking = networking;
    this._state = state;
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
    let timetoken = this._state.getSubscribeTimeToken()
    let callback = this.__handleSubscribeResponse.bind(this);

    this._networking.performSubscribe(stringifiedChannels, timetoken, data, callback);
  }

  __handleSubscribeResponse(err: Object, response: Object) {
    if (err) {
      console.log(err);
      return;
    }

    let [payload, timetoken] = response;

    console.log('subscribe callback' , payload, timetoken);
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
