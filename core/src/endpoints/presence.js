/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Keychain from '../components/keychain';
import Responders from '../presenters/responders';

type presenceConstruct = {
  networking: Networking,
  config: Config,
  keychain: Keychain,
  jsonp_cb: Function,
  error: Function
};

export default class {
  _networking: Networking;
  _config: Config;
  _keychain: Keychain;
  _jsonp_cb: Function;
  _error: Function;

  constructor({ networking, config, keychain, jsonp_cb, error }: presenceConstruct) {
    this._networking = networking;
    this._config = config;
    this._keychain = keychain;
    this._jsonp_cb = jsonp_cb;
    this._error = error;
  }

  hereNow(args: Object, argumentCallback: Function) {
    let callback = args.callback || argumentCallback;
    let err = args.error || function () {};
    let auth_key = args.auth_key || this._keychain.getAuthKey();
    let channel = args.channel;
    let channel_group = args.channel_group;
    let jsonp = this._jsonp_cb();
    let uuids = ('uuids' in args) ? args.uuids : true;
    let state = args.state;
    let data: Object = { uuid: this._keychain.getUUID(), auth: auth_key };

    if (!uuids) data.disable_uuids = 1;
    if (state) data.state = 1;

    // Make sure we have a Channel
    if (!callback) return this._error('Missing Callback');
    if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

    if (jsonp !== 0) {
      data.callback = jsonp;
    }

    if (channel_group) {
      data['channel-group'] = channel_group;
    }

    if (this._config.isInstanceIdEnabled()) {
      data.instanceid = this._keychain.getInstanceId();
    }

    this._networking.fetchHereNow(channel, channel_group, {
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

  whereNow(args: Object, argumentCallback: Function) {
    let callback = args.callback || argumentCallback;
    let err = args.error || function () {};
    let auth_key = args.auth_key || this._keychain.getAuthKey();
    let jsonp = this._jsonp_cb();
    let uuid = args.uuid || this._keychain.getUUID();
    let data: Object = { auth: auth_key };

    // Make sure we have a Channel
    if (!callback) return this._error('Missing Callback');
    if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

    if (jsonp !== 0) {
      data['callback'] = jsonp;
    }

    if (this._config.isInstanceIdEnabled()) {
      data['instanceid'] = this._keychain.getInstanceId();
    }

    this._networking.fetchWhereNow(uuid, {
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

}
