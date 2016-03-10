/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Keychain from '../components/keychain';

type timeConstruct = {
  networking: Networking,
  config: Config,
  keychain: Keychain,
};

export default class {

  _networking: Networking;
  _config: Config;
  _keychain: Keychain;

  constructor({ networking, config, keychain }: timeConstruct) {
    this._networking = networking;
    this._config = config;
    this._keychain = keychain;
  }

  fetchTime(callback: Function) {
    let data: Object = {
      uuid: this._keychain.getUUID(),
      auth: this._keychain.getAuthKey(),
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

    this._networking.fetchTime({
      data: this._networking.prepareParams(data),
      success: onSuccess,
      fail: onFail,
    });
  }
}
