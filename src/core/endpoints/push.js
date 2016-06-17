/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import BaseEndpoint from './base.js';
import { endpointDefinition, statusStruct } from '../flow_interfaces';

type pushConstruct = {
  networking: Networking,
  config: Config
};

type provisionDeviceArgs = {
  operation: 'add' | 'remove',
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
  channels: Array<string>
};

type modifyDeviceArgs = {
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
  channels: Array<string>
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

export default class extends BaseEndpoint {
  networking: Networking;
  config: Config;

  constructor({ networking, config }: pushConstruct) {
    super({ config });
    this.networking = networking;
    this.config = config;
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
      return callback(this.createValidationError('Missing Device ID (device)'));
    }

    if (!pushGateway) {
      return callback(this.createValidationError('Missing GW Type (pushGateway: gcm,apns, mpns)'));
    }

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }
    // create base params
    const params = this.createBaseParams(endpointConfig);
    params.type = pushGateway;

    this.networking.GET(params, endpointConfig, (status: statusStruct, payload: Array<string>) => {
      if (status.error) return callback(status);

      let response: listChannelsResponse = {
        channels: payload
      };

      callback(status, response);
    });
  }

  removeDevice(args: removeDeviceAargs, callback: Function) {
    let { pushGateway, device } = args;
    const endpointConfig: endpointDefinition = {
      params: {
        authKey: { required: false },
        uuid: { required: false }
      },
      url: '/v1/push/sub-key/' + this.config.subscribeKey + '/devices/' + device + '/remove'
    };

    if (!device) {
      return callback(this.createValidationError('Missing Device ID (device)'));
    }

    if (!pushGateway) {
      return callback(this.createValidationError('Missing GW Type (pushGateway: gcm or apns)'));
    }

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }
    // create base params
    const params = this.createBaseParams(endpointConfig);
    params.type = pushGateway;

    this.networking.GET(params, endpointConfig, (status: statusStruct) => {
      callback(status);
    });
  }

  addDeviceToPushChannels(args: modifyDeviceArgs, callback: Function) {
    let { pushGateway, device, channels } = args;
    const payload = { operation: 'add', pushGateway, device, channels };
    this.__provisionDevice(payload, callback);
  }

  removeDeviceFromPushChannels(args: modifyDeviceArgs, callback: Function) {
    let { pushGateway, device, channels } = args;
    const payload = { operation: 'remove', pushGateway, device, channels };
    this.__provisionDevice(payload, callback);
  }

  __provisionDevice(args: provisionDeviceArgs, callback: Function) {
    let { operation, pushGateway, device, channels } = args;
    const endpointConfig: endpointDefinition = {
      params: {
        authKey: { required: false },
        uuid: { required: false }
      },
      url: '/v1/push/sub-key/' + this.config.subscribeKey + '/devices/' + device
    };

    if (!device) {
      return callback(this.createValidationError('Missing Device ID (device)'));
    }

    if (!pushGateway) {
      return callback(this.createValidationError('Missing GW Type (pushGateway: gcm or apns)'));
    }

    if (!operation) {
      return callback(this.createValidationError('Missing GW Operation (operation: add or remove)'));
    }

    if (!channels) {
      return callback(this.createValidationError('Missing gw destination Channel (channel)'));
    }

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }
    // create base params
    const params = this.createBaseParams(endpointConfig);
    params.type = pushGateway;

    if (operation === 'add') params.add = encodeURIComponent(channels.join(','));
    if (operation === 'remove') params.remove = encodeURIComponent(channels.join(','));


    this.networking.GET(params, endpointConfig, (status: statusStruct) => {
      callback(status);
    });
  }

}
