/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Keychain from '../components/keychain';

type timeConstruct = {
  networking: Networking,
  config: Config,
  keychain: Keychain,
  jsonp_cb: Function,
  get_url_params: Function
};

export default class {

  _networking: Networking;
  _config: Config;
  _keychain: Keychain;
  _jsonp_cb: Function;
  _get_url_params: Function;

  constructor({ networking, config, keychain, jsonp_cb, get_url_params }: timeConstruct) {
    this._networking = networking;
    this._config = config;
    this._keychain = keychain;
    this._jsonp_cb = jsonp_cb;
    this._get_url_params = get_url_params;
  }

  fetchTime(callback: Function) {
    var jsonp = this._jsonp_cb();

    var data: Object = {
      uuid: this._keychain.getUUID(),
      auth: this._keychain.getAuthKey()
    };

    if (this._config.isInstanceIdEnabled()) {
      data.instanceid = this._keychain.getInstanceId();
    }

    let onSuccess = (response) => {
      callback(response[0]);
    };

    let onFail = () => {
      callback(0);
    };

    this._networking.fetchTime(jsonp, {
      callback: jsonp,
      data: this._get_url_params(data),
      success: onSuccess,
      fail: onFail
    });
  }
}
