/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import { EndpointDefinition } from '../flow_interfaces';
import uuidGenerator from 'uuid';

type BaseConstruct = {
  config: Config
};

export default class {

  _networking: Networking;
  _config: Config;
  _componentName: string;

  constructor({ config }: BaseConstruct) {
    this._config = config;
  }

  validateEndpointConfig(endpointConfig: EndpointDefinition): boolean {
    if (!endpointConfig) {
      return false;
    }
    return true;
  }

  createBaseParams(endpointConfig: EndpointDefinition): Object {
    let data: Object = {
      uuid: this._config.UUID
    };

    Object.keys(this._config.baseParams).forEach((key) => {
      let value = this._config.baseParams[key];
      if (!(key in data)) data[key] = value;
    });

    if (this._config.useInstanceId) {
      data.instanceid = this._config.instanceId;
    }

    if (this._config.useRequestId) {
      data.requestid = uuidGenerator.v4();
    }

    if (endpointConfig.params && endpointConfig.params.authKey && this._config.authKey) {
      data.auth = this._config.authKey;
    }

    return data;
  }

  createValidationError(message: string): Object {
    return this._createError({ message }, 'validationError');
  }

  _createError(errorPayload: Object, type: string): Object {
    errorPayload.type = type;
    return errorPayload;
  }

  log(...params: any) {
    console.log.apply(console, params); // eslint-disable-line no-console
  }

}
