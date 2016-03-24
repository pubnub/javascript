/* @flow */

import Networking from '../components/networking';
import State from '../components/state';
import Logger from '../components/logger';
import Responders from '../presenters/responders';

type presenceConstruct = {
  networking: Networking,
  state: State,
};

type hereNowArguments = {
  channel: string,
  channelGroup: string,
  uuids: ?boolean,
  state: ?boolean
}

type whereNowArguments = {
  uuid: string,
}

type getStateArguments = {
  uuid: string,
  channel: string,
  channelGroup: string
}

type setStateArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  state: Object | string | number | boolean
}

export default class {
  _networking: Networking;
  _state: State;
  _r: Responders;
  _l: Logger;

  constructor({ networking, state }: presenceConstruct) {
    this._networking = networking;
    this._state = state;
    this._r = new Responders('#endpoints/presence');
    this._l = Logger.getLogger('#endpoints/presence');
  }

  hereNow(args: hereNowArguments, callback: Function) {
    let { channel, channelGroup, uuids = true, state } = args;
    let data = {};

    if (!uuids) data.disable_uuids = 1;
    if (state) data.state = 1;

    // Make sure we have a Channel
    if (!callback) {
      return this._l.error('Missing Callback');
    }

    if (channelGroup) {
      data['channel-group'] = channelGroup;
    }

    this._networking.fetchHereNow(channel, channelGroup, data, callback);
  }

  whereNow(args: whereNowArguments, callback: Function) {
    let { uuid } = args;

    if (!callback) {
      return this._l.error('Missing Callback');
    }

    this._networking.fetchWhereNow(uuid, callback);
  }

  getState(args: getStateArguments, callback: Function) {
    let { uuid, channel, channelGroup } = args;
    let data: Object = {};

    if (!callback) {
      return this._l.error('Missing Callback');
    }

    if (!channel && !channelGroup) {
      return callback(this._r.validationError('Channel or Channel Group must be supplied'));
    }

    if (channelGroup) {
      data['channel-group'] = channelGroup;
    }

    if (!channel) {
      channel = ',';
    }

    this._networking.fetchState(uuid, channel, data, callback);
  }

  setState(args: setStateArguments, callback: Function) {
    let { state, channels = [], channelGroups = [] } = args;
    let data: Object = {};
    let channelsWithPresence: Array<string> = [];
    let channelGroupsWithPresence: Array<string> = [];

    if (!callback) {
      return this._l.error('Missing Callback');
    }

    if (channels.length === 0 && channelGroups.length === 0) {
      return callback(this._r.validationError('Channel or Channel Group must be supplied'));
    }

    if (!state) {
      return callback(this._r.validationError('State must be supplied'));
    }

    data.state = state;

    channels.forEach((channel) => {
      if (this._state.getChannel(channel)) {
        this._state.addToPresenceState(channel, state);
        channelsWithPresence.push(channel);
      }
    });

    channelGroups.forEach((channel) => {
      if (this._state.getChannelGroup(channel)) {
        this._state.addToPresenceState(channel, state);
        channelGroupsWithPresence.push(channel);
      }
    });

    if (channelsWithPresence.length === 0 && channelGroupsWithPresence.length === 0) {
      return callback(this._r.validationError('No subscriptions exists for the states'));
    }

    if (channelGroupsWithPresence.length > 0) {
      data['channel-group'] = channelGroupsWithPresence.join(',');
    }

    let stringifiedChannels = channelsWithPresence.length > 0 ? channelsWithPresence.join(',') : ',';

    this._networking.setState(stringifiedChannels, data, (err: Object, response: Object) => {
      if (err) return callback(err, response);
      this._state.announceStateChange();
      return callback(err, response);
    });
  }

  heartbeat(callback: Function) {
    let data: Object = {
      state: JSON.stringify(this._state.getPresenceState()),
      heartbeat: this._state.getPresenceTimeout()
    };

    let channels = this._state.getSubscribedChannels();
    let channelGroups = this._state.getSubscribedChannelGroups();

    if (channelGroups.length > 0) {
      data['channel-group'] = channelGroups.join(',');
    }

    let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';

    this._networking.performHeartbeat(stringifiedChannels, data, callback);
  }

}
