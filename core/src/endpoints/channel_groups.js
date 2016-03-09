/* @flow */

import Networking from '../components/networking';
import Keychain from '../components/keychain';
import Config from '../components/config';
import Responders from '../presenters/responders';

import utils from '../utils';

type channelGroupConstruct = {
  networking: Networking,
  config: Config,
  keychain: Keychain,
  jsonp_cb: Function,
  error: Function,
};

export default class {
  _networking: Networking;
  _keychain: Keychain;
  _config: Config;
  _jsonp_cb: Function;
  _error: Function;

  constructor({ networking, keychain, config, jsonp_cb, error}: channelGroupConstruct) {
    this._networking = networking;
    this._keychain = keychain;
    this._config = config;
    this._jsonp_cb = jsonp_cb;
    this._error = error;
  }

  // generic function to handle all channel group operations
  channelGroup(args: Object, argumentCallback: Function) {
    let ns_ch = args.channel_group;
    let callback = args.callback || argumentCallback;
    let channels = args.channels || args.channel;
    let channel_group = '';

    let data = {};
    let mode = args.mode || 'add';
    let err = args.error || this._error;
    let jsonp = this._jsonp_cb();

    if (ns_ch) {
      let ns_ch_a = ns_ch.split(':');

      if (ns_ch_a.length > 1) {
        channel_group = ns_ch_a[1];
      } else {
        channel_group = ns_ch_a[0];
      }
    }

    if (channels) {
      if (utils.isArray(channels)) {
        channels = channels.join(',');
      }
      data[mode] = channels;
    }

    if (!data.auth) {
      data.auth = args.auth_key || this._keychain.getAuthKey();
    }

    if (jsonp) data.callback = jsonp;

    this._networking.performChannelGroupOperation(channel_group, mode, {
      callback: jsonp,
      data: this._networking.prepareParams(data),
      success: function (response) {
        Responders.callback(response, callback, err);
      },
      fail: function (response) {
        Responders.error(response, err);
      }
    });
  }

  listChannels(args: Object, callback: Function) {
    if (!args.channel_group) return this._error('Missing Channel Group');
    this.channelGroup(args, callback);
  }

  removeGroup(args: Object, callback: Function) {
    const errorMessage = 'Use channel_group_remove_channel if you want to remove a channel from a group.';
    if (!args.channel_group) return this._error('Missing Channel Group');
    if (args.channel) return this._error(errorMessage);

    args.mode = 'remove';
    this.channelGroup(args, callback);
  }

  listGroups(args: Object, callback: Function) {
    this.channelGroup(args, callback);
  }

  addChannel(args: Object, callback: Function) {
    if (!args.channel_group) return this._error('Missing Channel Group');
    if (!args.channel && !args.channels) return this._error('Missing Channel');
    this.channelGroup(args, callback);
  }

  removeChannel(args: Object, callback: Function) {
    if (!args.channel_group) return this._error('Missing Channel Group');
    if (!args.channel && !args.channels) return this._error('Missing Channel');

    args.mode = 'remove';
    this.channelGroup(args, callback);
  }
}
