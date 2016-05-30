/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import { endpointDefinition } from '../flow_interfaces';
import utils from '../utils';

type baseConstruct = {
  config: Config
};

export default class {

  _networking: Networking;
  _config: Config;

  constructor({ config }: baseConstruct) {
    this._config = config;
  }

  validateEndpointConfig(endpointConfig: endpointDefinition) {
    // TODO
    return true;
  }

  createBaseParams(endpointConfig: endpointDefinition) {
    let data = {};

    utils.each(this._config.baseParams, (key, value) => {
      if (!(key in data)) data[key] = value;
    });

    if (this._config.isInstanceIdEnabled()) {
      data.instanceid = this._config.getInstanceId();
    }

    if (endpointConfig.params.authKey && this._config.authKey) {
      data.auth = this._config.authKey;
    }

    if (endpointConfig.params.uuid && this._config.UUID) {
      data.uuid = this._config.UUID;
    }

    return data;
  }

}
