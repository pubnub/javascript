/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import BaseEndpoint from './base.js';
import { EndpointDefinition, StatusStruct } from '../flow_interfaces';

type TimeConstruct = {
  networking: Networking,
  config: Config
};

type TimeResponse = {
  timetoken: number
};

export default class extends BaseEndpoint {

  _networking: Networking;

  constructor({ networking, config }: TimeConstruct) {
    super({ config });
    this._networking = networking;
  }

  fetch(callback: Function) {
    const endpointConfig: EndpointDefinition = {
      params: {
        uuid: { required: false }
      },
      url: '/time/0'
    };

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    this._networking.GET(params, endpointConfig, (status: StatusStruct, payload: Object) => {
      if (status.error) return callback(status);

      let response: TimeResponse = {
        timetoken: payload[0]
      };

      callback(status, response);
    });
  }
}
