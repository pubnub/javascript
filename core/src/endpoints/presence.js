/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Keychain from '../components/keychain';
import State from '../components/state';
import Responders from '../presenters/responders';

import utils from '../utils';

type presenceConstruct = {
  networking: Networking,
  config: Config,
  state: State,
  keychain: Keychain,
  error: Function
};

export default class {
  _networking: Networking;
  _config: Config;
  _state: State;
  _keychain: Keychain;
  _error: Function;

  constructor({ networking, config, keychain, state, error }: presenceConstruct) {
    this._networking = networking;
    this._config = config;
    this._keychain = keychain;
    this._state = state;
    this._error = error;
  }

  hereNow(args: Object, argumentCallback: Function) {
    let callback = args.callback || argumentCallback;
    let err = args.error || function () {};
    let auth_key = args.auth_key || this._keychain.getAuthKey();
    let channel = args.channel;
    let channel_group = args.channel_group;
    let uuids = ('uuids' in args) ? args.uuids : true;
    let state = args.state;
    let data: Object = { uuid: this._keychain.getUUID(), auth: auth_key };

    if (!uuids) data.disable_uuids = 1;
    if (state) data.state = 1;

    // Make sure we have a Channel
    if (!callback) return this._error('Missing Callback');
    if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

    if (channel_group) {
      data['channel-group'] = channel_group;
    }

    if (this._config.isInstanceIdEnabled()) {
      data.instanceid = this._keychain.getInstanceId();
    }

    this._networking.fetchHereNow(channel, channel_group, {
      data: this._networking.prepareParams(data),
      success: function (response) {
        Responders.callback(response, callback, err);
      },
      fail: function (response) {
        Responders.error(response, err);
      },
    });
  }

  whereNow(args: Object, argumentCallback: Function) {
    let callback = args.callback || argumentCallback;
    let err = args.error || function () {};
    let auth_key = args.auth_key || this._keychain.getAuthKey();
    let uuid = args.uuid || this._keychain.getUUID();
    let data: Object = { auth: auth_key };

    // Make sure we have a Channel
    if (!callback) return this._error('Missing Callback');
    if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

    if (this._config.isInstanceIdEnabled()) {
      data.instanceid = this._keychain.getInstanceId();
    }

    this._networking.fetchWhereNow(uuid, {
      data: this._networking.prepareParams(data),
      success: function (response) {
        Responders.callback(response, callback, err);
      },
      fail: function (response) {
        Responders.error(response, err);
      },
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
    let channel_groups = this._state.generate_channel_group_list(true).join(',');

    if (!channels) channels = ',';
    if (channel_groups) data['channel-group'] = channel_groups;

    if (this._config.isInstanceIdEnabled()) {
      data.instanceid = this._keychain.getInstanceId();
    }

    if (this._config.isRequestIdEnabled()) {
      data.requestid = utils.generateUUID();
    }

    this._networking.performHeartbeat(channels, {
      data: this._networking.prepareParams(data),
      success: function (response) {
        Responders.callback(response, callback, err);
      },
      fail: function (response) {
        Responders.error(response, err);
      },
    });
  }

  performState(args: Object, argumentCallback: Function) {
    let callback = args.callback || argumentCallback || function () {};
    let err = args.error || function () {};
    let auth_key = args.auth_key || this._keychain.getAuthKey();
    let state = args.state;
    let uuid = args.uuid || this._keychain.getUUID();
    let channel = args.channel;
    let channel_group = args.channel_group;
    let data = this._networking.prepareParams({ auth: auth_key });

    // Make sure we have a Channel
    if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
    if (!uuid) return this._error('Missing UUID');
    if (!channel && !channel_group) return this._error('Missing Channel');

    if (typeof channel !== 'undefined'
      && this._state.getChannel(channel)
      && this._state.getChannel(channel).subscribed) {
      if (state) {
        this._state.addToPresenceState(channel, state);
      }
    }

    if (typeof channel_group !== 'undefined'
      && this._state.getChannelGroup(channel_group)
      && this._state.getChannelGroup(channel_group).subscribed
    ) {
      if (state) {
        this._state.addToPresenceState(channel_group, state);
      }
      data['channel-group'] = channel_group;

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
      success: function (response) {
        Responders.callback(response, callback, err);
      },
      fail: function (response) {
        Responders.error(response, err);
      },
    });
  }

}
