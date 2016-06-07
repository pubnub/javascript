/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import BaseEndoint from './base.js';
import { endpointDefinition, statusStruct } from '../flow_interfaces';

type timeConstruct = {
  networking: Networking,
  config: Config
};

type timeResponse = {
  timetoken: number
};

export default class extends BaseEndoint {

  constructor({ networking, config }: timeConstruct) {
    super({ config });
    this.networking = networking;
  }

  fetch(callback: Function) {
    const endpointConfig: endpointDefinition = {
      params: {
        uuid: { required: false }
      },
      url: '/time/0'
    };

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    this.networking.GET(params, endpointConfig, (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);

      let response: timeResponse = {};
      response.timetoken = payload[0];

      callback(status, response);
    });
  }
}
