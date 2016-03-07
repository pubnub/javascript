/* @flow */

import Networking from '../components/networking';
import Keychain from '../components/keychain';
import Config from '../components/config';
import Responders from '../presenters/responders';

type pushConstruct = {
  networking: Networking,
  config: Config,
  keychain: Keychain,
  jsonp_cb: Function,
  error: Function
};

export default class {
  _networking: Networking;
  _keychain: Keychain;
  _config: Config;
  _jsonp_cb: Function;
  _error: Function;

  constructor({ networking, keychain, jsonp_cb, error, config }: pushConstruct) {
    this._networking = networking;
    this._keychain = keychain;
    this._jsonp_cb = jsonp_cb;
    this._error = error;
    this._config = config;
  }

  provisionDevice(args: Object) {
    let { op, gw_type, device_id, channel } = args;

    let callback = args.callback || function () {};
    let auth_key = args.auth_key || this._keychain.getAuthKey();
    let err = args.error || function () {};
    let jsonp = this._jsonp_cb();

    if (!device_id) return this._error('Missing Device ID (device_id)');
    if (!gw_type) return this._error('Missing GW Type (gw_type: gcm or apns)');
    if (!op) return this._error('Missing GW Operation (op: add or remove)');
    if (!channel) return this._error('Missing gw destination Channel (channel)');
    if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
    if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

    let params: Object = { uuid: this._keychain.getUUID(), auth: auth_key, type: gw_type };

    if (op === 'add') {
      params.add = channel;
    } else if (op === 'remove') {
      params.remove = channel;
    }

    if (this._config.isInstanceIdEnabled()) {
      params.instanceid = this._keychain.getInstanceId();
    }

    this._networking.provisionDeviceForPush(device_id, {
      callback: jsonp,
      data: params,
      success: function (response) {
        Responders.callback(response, callback, err);
      },
      fail: function (response) {
        Responders.error(response, err);
      }
    });
  }
}
