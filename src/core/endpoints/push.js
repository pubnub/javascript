/* @flow */

import Networking from '../components/networking';
import Keychain from '../components/keychain';
import Responders from '../presenters/responders';
import Q from 'Q';

type pushConstruct = {
  networking: Networking,
  keychain: Keychain
};

type provisionDeviceArgs = {
  operation: 'add' | 'remove',
  pushGateway: 'gcm' | 'apns',
  device: string,
  channel: string
};

type addDeviceArgs = {
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

let checkParam = function (checkParam: string | boolean, message: string) {
  const q = Q.defer();

  if (checkParam) {
    q.resolve();
  } else {
    q.reject(message);
  }

  return q.promise;
};

export default class {
  _networking: Networking;
  _r: Responders;

  constructor({ networking }: pushConstruct) {
    this._networking = networking;
    this._r = new Responders('endpoints/push');
  }

  addDevice({ pushGateway, device, channel }: addDeviceArgs): Q.Promise {
    const payload = { operation: 'add', pushGateway, device, channel };
    return this.__provisionDevice(payload);
  }

  removeDevice({ pushGateway, device, channel }: addDeviceArgs): Q.Promise {
    const payload = { operation: 'remove', pushGateway, device, channel };
    return this.__provisionDevice(payload);
  }

  __provisionDevice({ operation, pushGateway, device, channel }: provisionDeviceArgs): Q.Promise {
    const q = Q.defer();

    checkParam(device, 'Missing Device ID (device)')
      .then(checkParam(pushGateway, 'Missing GW Type (pushGateway: gcm or apns)'))
      .then(checkParam(operation, 'Missing GW Operation (operation: add or remove)'))
      .then(checkParam(channel, 'Missing gw destination Channel (channel)'))
      .then(checkParam(this._networking.validateSubscribeKey(), 'Missing Subscribe Key'))
      .then(checkParam(this._networking.validatePublishKey(), 'Missing Publish Key'))
      .fail((error) => { q.reject(this._r.validationError(error)); })

    return q.promise;

    /*
    let data: Object = {
      type: pushGateway
    };

    switch (operation) {
      case 'add': data.add = channel; break;
      case 'remove': data.remove = channel; break;
      default:
    }

    this._networking.provisionDeviceForPush(device, data)
      .then((response) => q.resolve(this._r.callback(response)))
      .fail((response) => q.fail(this._r.error(response)));
  });
  */
  }

  createNotification() {
    // return callback;
  }

}
