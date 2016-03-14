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

  getState() {
    // no-op
  }

  setState() {
    // no-op
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

  performState(args: Object, argumentCallback: Function) {
    let callback = args.callback || argumentCallback || function () {};
    let err = args.error || function () {};
    let authKey = args.auth_key || this._keychain.getAuthKey();
    let state = args.state;
    let uuid = args.uuid || this._keychain.getUUID();
    let channel = args.channel;
    let channelGroup = args.channel_group;
    let data = this._networking.prepareParams({ auth: authKey });

    // Make sure we have a Channel
    if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
    if (!uuid) return this._error('Missing UUID');
    if (!channel && !channelGroup) return this._error('Missing Channel');

    if (typeof channel !== 'undefined'
      && this._state.getChannel(channel)
      && this._state.getChannel(channel).subscribed) {
      if (state) {
        this._state.addToPresenceState(channel, state);
      }
    }

    if (typeof channelGroup !== 'undefined'
      && this._state.getChannelGroup(channelGroup)
      && this._state.getChannelGroup(channelGroup).subscribed
    ) {
      if (state) {
        this._state.addToPresenceState(channelGroup, state);
      }
      data['channel-group'] = channelGroup;

      if (!channel) {
        channel = ',';
      }
    }

    data.state = JSON.stringify(state);

    if (this._config.isInstanceIdEnabled()) {
      data.instanceid = this._keychain.getInstanceId();
    }

    this._networking.performState(state, channel, uuid, {
      data: this._networking.prepareParams(data),
      success(response) {
        Responders.callback(response, callback, err);
      },
      fail(response) {
        Responders.error(response, err);
      },
    });
  }

  announceChannelLeave(channel: string, authKey: string, argCallback: Function, error: Function) {
    let data = {
      uuid: this._keychain.getUUID(),
      auth: authKey || this._keychain.getAuthKey(),
    };

    let callback = argCallback || function () {};
    let err = error || function () {};

    // Prevent Leaving a Presence Channel
    if (channel.indexOf(constants.PRESENCE_SUFFIX) > 0) {
      return true;
    }

    /* TODO move me to unsubscribe */
    if (this._config.isSuppressingLeaveEvents()) {
      return false;
    }

    if (this._config.isInstanceIdEnabled()) {
      data.instanceid = this._keychain.getInstanceId();
    }
    /* TODO: move me to unsubscribe */

    this._networking.performChannelLeave(channel, {
      data: this._networking.prepareParams(data),
      success(response) {
        Responders.callback(response, callback, err);
      },
      fail(response) {
        Responders.error(response, err);
      },
    });
  }

  announceChannelGroupLeave(channelGroup: string, authKey: string, argCallback: Function, error: Function) {
    let data = {
      uuid: this._keychain.getUUID(),
      auth: authKey || this._keychain.getAuthKey(),
    };

    let callback = argCallback || function () {};
    let err = error || function () {};

    // Prevent Leaving a Presence Channel Group
    if (channelGroup.indexOf(constants.PRESENCE_SUFFIX) > 0) {
      return true;
    }

    if (this._config.isSuppressingLeaveEvents()) {
      return false;
    }

    /* TODO move me to unsubscribe */
    if (channelGroup && channelGroup.length > 0) {
      data['channel-group'] = channelGroup;
    }

    if (this._config.isInstanceIdEnabled()) {
      data.instanceid = this._keychain.getInstanceId();
    }
    /* TODO move me to unsubscribe */

    this._networking.performChannelGroupLeave({
      data: this._networking.prepareParams(data),
      success: (response) => {
        Responders.callback(response, callback, err);
      },
      fail: (response) => {
        Responders.error(response, err);
      },
    });
  }

}
