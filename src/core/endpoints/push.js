/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Responders from '../presenters/responders';
import BaseEndoint from './base.js';
import { endpointDefinition, statusStruct } from '../flow_interfaces';

type pushConstruct = {
  networking: Networking,
  config: Config
};

type provisionDeviceArgs = {
  operation: 'add' | 'remove',
  pushGateway: 'gcm' | 'apns',
  device: string,
  channel: string
};

type modifyDeviceArgs = {
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
  channel: string
};

type listChannelsArgs = {
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
};

type removeDeviceAargs = {
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
};

type listChannelsResponse = {
  channels: Array<string>
}

export default class extends BaseEndoint {
  networking: Networking;
  config: Config;
  _r: Responders;

  constructor({ networking, config }: pushConstruct) {
    super({ config });
    this.networking = networking;
    this.config = config;
    this._r = new Responders('endpoints/push');
  }

  listChannelsForDevice(args: listChannelsArgs, callback: Function) {
    let { pushGateway, device } = args;
    const endpointConfig: endpointDefinition = {
      params: {
        authKey: { required: false },
        uuid: { required: false }
      },
      url: '/v1/push/sub-key/' + this.config.subscribeKey + '/devices/' + device
    };

    if (!device) {
      return callback(this._r.validationError('Missing Device ID (device)'));
    }

    if (!pushGateway) {
      return callback(this._r.validationError('Missing GW Type (pushGateway: gcm,apns, mpns)'));
    }

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }
    // create base params
    const params = this.createBaseParams(endpointConfig);
    params.type = pushGateway;

    this.networking.XDR(params, endpointConfig, (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);

      let response: listChannelsResponse = {};
      response.channels = payload;

      callback(status, response);
    });
  }

  removeDeviceFromPushChannel(args: removeDeviceAargs, callback: Function) {
    // TODO
  }

  addDeviceToPushChannels(args: modifyDeviceArgs, callback: Function) {
    let { pushGateway, device, channel } = args;
    const payload = { operation: 'add', pushGateway, device, channel };
    this.__provisionDevice(payload, callback);
  }

  removeDeviceFromPushChannels(args: modifyDeviceArgs, callback: Function) {
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
