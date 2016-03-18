/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import State from '../components/state';

import Responders from '../presenters/responders';
import Logger from '../components/logger';

import { callbackStruct } from '../flow_interfaces';

type pubSubConstruct = {
  networking: Networking,
  state: State,
  config: Config,
};

type unsubscribeArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
}

type subscribeArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  enablePresence: boolean
}

export default class {
  _networking: Networking;
  _config: Config;
  _state: State;
  _callbacks: callbackStruct;

  _r: Responders;
  _l: Logger;

  _subscribeIntervalId: number | null;

  constructor({ networking, config, state, callbacks }: pubSubConstruct) {
    this._networking = networking;
    this._config = config;
    this._state = state;
    this._callbacks = callbacks;

    this._r = new Responders('#endpoints/subscribe');
    this._l = Logger.getLogger('#endpoints/subscribe');
  }

  unsubscribe(args: unsubscribeArguments) {
    let { onStatus } = this._callbacks;
    let { channels = [], channelGroups = [] } = args;
    let existingChannels = []; // matching channels to unsubscribe
    let existingChannelGroups = []; // matching channel groups to unsubscribe
    let data = {};

    // Make sure we have a Channel
    if (!onStatus) {
      return this._l.error('Missing onStatus Callback');
    }

    if (channels.length === 0 && channelGroups.length === 0) {
      return onStatus(this._r.validationError('Missing Channel or Channel Group'));
    }

    if (channels) {
      channels.forEach((channel) => {
        if (this._state.containsChannel(channel)) {
          existingChannels.push(channel);
        }
      });
    }

    if (channelGroups) {
      channelGroups.forEach((channelGroup) => {
        if (this._state.containsChannelGroup(channelGroup)) {
          existingChannelGroups.push(channelGroup);
        }
      });
    }

    // if NO channels && channel groups to unsubscribe, trigger a callback
    if (existingChannels.length === 0 && existingChannelGroups.length === 0) {
      return onStatus(this._r.validationError('already unsubscribed from all channel / channel groups'));
    }

    let stringifiedChannelParam = existingChannels.length > 0 ? existingChannels.join(',') : ',';

    if (existingChannelGroups.length > 0) {
      data['channel-group'] = existingChannelGroups.join(',');
    }

    this._networking.performLeave(stringifiedChannelParam, data, (err, response) => {
      if (err) return onStatus(err, null);

      this._postUnsubscribeCleanup(existingChannels, existingChannelGroups);
      this._state.setSubscribeTimeToken(0);
      this._state.announceSubscriptionChange();
      onStatus(null, { action: 'unsubscribe', status: 'finished', response });
    });
  }

  _postUnsubscribeCleanup(channels: Array<string>, channelGroups: Array<string>) {
    channels.forEach((channel) => {
      this._state.removeChannel(channel);
      this._state.removeFromPresenceState(channel);
    });

    channelGroups.forEach((channelGroup) => {
      this._state.removeChannelGroup(channelGroup);
      this._state.removeFromPresenceState(channelGroup);
    });
  }

  subscribe(args: subscribeArguments) {
    let { channels = [], channelGroups = [], enablePresence = false } = args;
    let { onStatus } = this._callbacks;

    if (channels.length === 0 && channelGroups.length === 0) {
      return onStatus(this._r.validationError('Missing Channel or Channel Group'));
    }

    channels.forEach((channel) => {
      this._state.addChannel(channel, { name: channel, enablePresence });
    });

    channelGroups.forEach((channelGroup) => {
      this._state.addChannelGroup(channelGroup, { name: channelGroup, enablePresence });
    });

    this._state.announceSubscriptionChange();
  }
}
