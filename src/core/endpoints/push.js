/* @flow */

import Networking from '../components/networking';
import Keychain from '../components/keychain';
import Config from '../components/config';
import Responders from '../presenters/responders';

type pushConstruct = {
  networking: Networking,
  config: Config,
  keychain: Keychain,
  error: Function
};

type provisionDeviceArgs = {
  operation: 'add' | 'remove',
  pushGateway: 'gcm' | 'apns',
  device: string,
  channel: string
};

type createNotificationArgs = {
  operation: 'add' | 'remove',
  pushGateway: 'gcm' | 'apns',
  device: string,
  channel: string
};

export default class {
  _networking: Networking;
  _keychain: Keychain;
  _config: Config;
  _responders: Responders;

  constructor({ networking, keychain, config }: pushConstruct) {
    this._networking = networking;
    this._keychain = keychain;
    this._config = config;
    this._responders = new Responders('endpoints/push');
  }

  provisionDevice(args: provisionDeviceArgs, callback: Function) {
    let { operation, pushGateway, device, channel } = args;

    if (!device) {
      return this._responders.validationError(callback, 'Missing Device ID (device)');
    }

    if (!pushGateway) {
      return this._responders.validationError(callback, 'Missing GW Type (pushGateway: gcm or apns)');
    }

    if (!operation) {
      return this._responders.validationError(callback, 'Missing GW Operation (operation: add or remove)');
    }

    if (!channel) {
      return this._responders.validationError(callback, 'Missing gw destination Channel (channel)');
    }

    if (!this._keychain.getPublishKey()) {
      return this._responders.validationError(callback, 'Missing Publish Key');
    }

    if (!this._keychain.getSubscribeKey()) {
      return this._responders.validationError(callback, 'Missing Subscribe Key');
    }

    let params: Object = {
      uuid: this._keychain.getUUID(),
      auth: this._keychain.getAuthKey(),
      type: pushGateway
    };

    if (operation === 'add') {
      params.add = channel;
    } else if (operation === 'remove') {
      params.remove = channel;
    }

    if (this._config.isInstanceIdEnabled()) {
      params.instanceid = this._keychain.getInstanceId();
    }

    this._networking.provisionDeviceForPush(device, {
      data: params,
      success: (response) => {
        this._responders.callback(response, callback);
      },
      fail: (response) => {
        this._responders.error(response, callback);
      },
    });
  }

  createNotification(args: createNotificationArgs, callback: Function) {

  }

}
