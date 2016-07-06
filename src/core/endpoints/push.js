/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import BaseEndpoint from './base.js';
import { EndpointDefinition, StatusAnnouncement } from '../flow_interfaces';

type PushConstruct = {
  networking: Networking,
  config: Config
};

type ProvisionDeviceArgs = {
  operation: 'add' | 'remove',
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
  channels: Array<string>
};

type ModifyDeviceArgs = {
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
  channels: Array<string>
};

type ListChannelsArgs = {
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
};

type RemoveDeviceAargs = {
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
};

type ListChannelsResponse = {
  channels: Array<string>
}

export default class extends BaseEndpoint {
  networking: Networking;
  config: Config;

  constructor({ networking, config }: PushConstruct) {
    super({ config });
    this.networking = networking;
    this.config = config;
  }

  listChannelsForDevice(args: ListChannelsArgs, callback: Function) {
    let { pushGateway, device } = args;
    const endpointConfig: EndpointDefinition = {
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

    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement, payload: Array<string>) => {
      if (status.error) return callback(status);

      let response: ListChannelsResponse = {
        channels: payload
      };

      callback(status, response);
    });
  }

  removeDevice(args: RemoveDeviceAargs, callback: Function) {
    let { pushGateway, device } = args;
    const endpointConfig: EndpointDefinition = {
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

    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement) => {
      callback(status);
    });
  }

  addDeviceToPushChannels(args: ModifyDeviceArgs, callback: Function) {
    let { pushGateway, device, channels } = args;
    const payload = { operation: 'add', pushGateway, device, channels };
    this.__provisionDevice(payload, callback);
  }

  removeDeviceFromPushChannels(args: ModifyDeviceArgs, callback: Function) {
    let { pushGateway, device, channels } = args;
    const payload = { operation: 'remove', pushGateway, device, channels };
    this.__provisionDevice(payload, callback);
  }

  __provisionDevice(args: ProvisionDeviceArgs, callback: Function) {
    let { operation, pushGateway, device, channels } = args;
    const endpointConfig: EndpointDefinition = {
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


    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement) => {
      callback(status);
    });
  }

}
