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
    var ns_ch = args.channel_group;
    var callback = argumentCallback || args.callback;
    var channels = args.channels || args.channel;
    var channel_group;
    var url = [];
    var data = {};
    var mode = args.mode || 'add';


    if (ns_ch) {
      var ns_ch_a = ns_ch.split(':');

      if (ns_ch_a.length > 1) {
        channel_group = ns_ch_a[1];
      } else {
        channel_group = ns_ch_a[0];
      }
    }

    url.push('channel-group');

    if (channel_group && channel_group !== '*') {
      url.push(channel_group);
    }

    if (channels) {
      if (utils.isArray(channels)) {
        channels = channels.join(',');
      }
      data[mode] = channels;
    } else {
      if (mode === 'remove') url.push('remove');
    }

    this.__CR(args, callback, url, data);
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
    let namespace;

    namespace = args.namespace || args.ns || args.channel_group || null;
    if (namespace) {
      args.channel_group = namespace + ':*';
    }

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

  // a private function to do the heavy lifting of channel-group operations
  __CR(args: Object, argumentCallback: Function, url1: Array<string>, data: Object) {
    let callback = args.callback || argumentCallback;
    let err = args.error || this._error;
    let jsonp = this._jsonp_cb();

    data = data || {};

    if (!data.auth) {
      data.auth = args.auth_key || this._keychain.getAuthKey();
    }

    let url = [
      this._networking.getStandardOrigin(), 'v1', 'channel-registration',
      'sub-key', this._keychain.getSubscribeKey()
    ];

    url.push.apply(url, url1);

    if (jsonp) data.callback = jsonp;

    this._networking.abstractXDR({
      callback: jsonp,
      data: this._networking.prepareParams(data),
      success: function (response) {
        Responders.callback(response, callback, err);
      },
      fail: function (response) {
        Responders.error(response, err);
      },
      url: url
    });
  }

}
