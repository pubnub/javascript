/* @flow */

import Networking from '../components/networking';
import State from '../components/state';
import Logger from '../components/logger';
import Responders from '../presenters/responders';

import utils from '../utils';
import constants from '../../../defaults.json';

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
  channel: string,
  channelGroup: string,
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
    let { state, channel, channelGroup } = args;
    let data: Object = {};
    let channelsWithPresence: Array<string> = [];
    let channelGroupsWithPresence: Array<string> = [];

    if (!callback) {
      return this._l.error('Missing Callback');
    }

    if (!channel && !channelGroup) {
      return callback(this._r.validationError('Channel or Channel Group must be supplied'));
    }

    if (!state) {
      return callback(this._r.validationError('State must be supplied'));
    }

    data.state = state;

    if (channel) {
      let channelList = (channel.join ? channel.join(',') : '' + channel).split(',');
      channelList.forEach((channel) => {
        if (this._state.getChannel(channel)) {
          this._state.addToPresenceState(channel, state);
          channelsWithPresence.push(channel);
        }
      });
    }

    if (channelGroup) {
      let channelGroupList = (channelGroup.join ? channelGroup.join(',') : '' + channelGroup).split(',');
      channelGroupList.forEach((channel) => {
        if (this._state.getChannelGroup(channel)) {
          this._state.addToPresenceState(channel, state);
          channelGroupsWithPresence.push(channel);
        }
      });
    }

    if (channelsWithPresence.length === 0 && channelGroupsWithPresence.length === 0) {
      return callback(this._r.validationError('No subscriptions exists for the states'));
    }

    if (channelGroupsWithPresence.length > 0) {
      data['channel-group'] = channelGroupsWithPresence.join(',');
    }

    if (channelsWithPresence.length === 0) {
      channel = ',';
    } else {
      channel = channelsWithPresence.join(',');
    }

    this._networking.setState(channel, data, (err: Object, response: Object) => {
      if (err) return callback(err, response);
      this._state.announceStateChange();
      return callback(err, response);
    });
  }

  heartbeat(args: Object) {
    let callback = args.callback || function () {};
    let err = args.error || function () {};
    let data: Object = {
      uuid: this._keychain.getUUID(),
      auth: this._keychain.getAuthKey(),
    };

    let st = JSON.stringify(this._state.getPresenceState());
    if (st.length > 2) {
      data.state = JSON.stringify(this._state.getPresenceState());
    }

    if (this._config.getPresenceTimeout() > 0 && this._config.getPresenceTimeout() < 320) {
      data.heartbeat = this._config.getPresenceTimeout();
    }

    let channels = utils.encode(this._state.generate_channel_list(true).join(','));
    let channelGroups = this._state.generate_channel_group_list(true).join(',');

    if (!channels) channels = ',';
    if (channelGroups) data['channel-group'] = channelGroups;

    if (this._config.isInstanceIdEnabled()) {
      data.instanceid = this._keychain.getInstanceId();
    }

    if (this._config.isRequestIdEnabled()) {
      data.requestid = utils.generateUUID();
    }

    this._networking.performHeartbeat(channels, {
      data: this._networking.prepareParams(data),
      success(response) {
        Responders.callback(response, callback, err);
      },
      fail(response) {
        Responders.error(response, err);
      },
    });
  }

}
