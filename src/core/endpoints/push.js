/* @flow */

import Networking from '../components/networking';
import Responders from '../presenters/responders';

type pushConstruct = {
  networking: Networking
};

type provisionDeviceArgs = {
  operation: 'add' | 'remove',
  pushGateway: 'gcm' | 'apns',
  device: string,
  channel: string
};

type modifyDeviceArgs = {
  pushGateway: 'gcm' | 'apns',
  device: string,
  channel: string
};

export default class {
  _networking: Networking;
  _r: Responders;

  constructor({ networking }: pushConstruct) {
    this._networking = networking;
    this._r = new Responders('endpoints/push');
  }

  addDeviceToPushChannel(args: modifyDeviceArgs, callback: Function) {
    let { pushGateway, device, channel } = args;
    const payload = { operation: 'add', pushGateway, device, channel };
    this.__provisionDevice(payload, callback);
  }

  removeDeviceFromPushChannel(args: modifyDeviceArgs, callback: Function) {
    let { pushGateway, device, channel } = args;
    const payload = { operation: 'remove', pushGateway, device, channel };
    this.__provisionDevice(payload, callback);
  }

  __provisionDevice(args: provisionDeviceArgs, callback: Function) {
    let { operation, pushGateway, device, channel } = args;

    if (!device) {
      return callback(this._r.validationError('Missing Device ID (device)'));
    }

    if (!pushGateway) {
      return callback(this._r.validationError('Missing GW Type (pushGateway: gcm or apns)'));
    }

    if (!operation) {
      return callback(this._r.validationError('Missing GW Operation (operation: add or remove)'));
    }

    if (!channel) {
      return callback(this._r.validationError('Missing gw destination Channel (channel)'));
    }

    let data: Object = {
      type: pushGateway
    };

    if (operation === 'add') {
      data.add = channel;
    } else if (operation === 'remove') {
      data.remove = channel;
    }

    this._networking.provisionDeviceForPush(device, data, callback);
  }

}
