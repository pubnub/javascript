/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import BaseEndoint from './base.js';
import { endpointDefinition } from '../flow_interfaces';

type timeConstruct = {
  networking: Networking,
  config: Config
};

export default class extends BaseEndoint {

  constructor({ networking, config }: timeConstruct) {
    super({ config });
    this._networking = networking;
  }

  fetch(callback: Function) {
    const endpointConfig: endpointDefinition = {
      params: {
        authKey: { required: false },
        uuid: { required: false }
      },
      url: '/time/0'
    };

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    this._networking.XDR(params, endpointConfig, (err, response) => {
      if (err) return callback(err);
      callback(null, response[0]);
    });
  }
}
