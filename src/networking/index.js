/* @flow */

import Config from '../core/components/config';
import categoryConstants from '../core/constants/categories';

import { EndpointDefinition, NetworkingModules } from '../core/flow_interfaces';

export default class {
  _modules: NetworkingModules;
  _config: Config;

  _currentSubDomain: number;

  _standardOrigin: string;
  _subscribeOrigin: string;

  _requestTimeout: number;

  _coreParams: Object; /* items that must be passed with each request. */

  constructor(modules: NetworkingModules) {
    this._modules = {};

    Object.keys(modules).forEach((key) => {
      this._modules[key] = modules[key].bind(this);
    });
  }

  init(config: Config) {
    this._config = config;

    if (Array.isArray(this._config.origin)) {
      this._currentSubDomain = Math.floor(Math.random() * this._config.origin.length);
    } else {
      this._currentSubDomain = 0;
    }

    this._coreParams = {};

    // create initial origins
    this.shiftStandardOrigin();
  }

  nextOrigin(): string {
    const protocol = this._config.secure ? 'https://' : 'http://';

    if (typeof this._config.origin === 'string') {
      return `${protocol}${this._config.origin}`;
    }

    this._currentSubDomain += 1;

    if (this._currentSubDomain >= this._config.origin.length) {
      this._currentSubDomain = 0;
    }

    const origin = this._config.origin[this._currentSubDomain];

    return `${protocol}${origin}`;
  }

  hasModule(name: string) {
    return name in this._modules;
  }

  // origin operations
  shiftStandardOrigin(): string {
    this._standardOrigin = this.nextOrigin();

    return this._standardOrigin;
  }

  getStandardOrigin(): string {
    return this._standardOrigin;
  }

  POSTFILE(url: string, fields: $ReadOnlyArray<{ key: string, value: string }>, file: any) {
    return this._modules.postfile(url, fields, file);
  }

  GETFILE(params: Object, endpoint: EndpointDefinition, callback: Function) {
    return this._modules.getfile(params, endpoint, callback);
  }

  POST(params: Object, body: string, endpoint: EndpointDefinition, callback: Function) {
    return this._modules.post(params, body, endpoint, callback);
  }

  PATCH(params: Object, body: string, endpoint: EndpointDefinition, callback: Function) {
    return this._modules.patch(params, body, endpoint, callback);
  }

  GET(params: Object, endpoint: EndpointDefinition, callback: Function) {
    return this._modules.get(params, endpoint, callback);
  }

  DELETE(params: Object, endpoint: EndpointDefinition, callback: Function) {
    return this._modules.del(params, endpoint, callback);
  }

  _detectErrorCategory(err: Object): string {
    if (err.code === 'ENOTFOUND') {
      return categoryConstants.PNNetworkIssuesCategory;
    }
    if (err.code === 'ECONNREFUSED') {
      return categoryConstants.PNNetworkIssuesCategory;
    }
    if (err.code === 'ECONNRESET') {
      return categoryConstants.PNNetworkIssuesCategory;
    }
    if (err.code === 'EAI_AGAIN') {
      return categoryConstants.PNNetworkIssuesCategory;
    }

    if (err.status === 0 || (err.hasOwnProperty('status') && typeof err.status === 'undefined')) {
      return categoryConstants.PNNetworkIssuesCategory;
    }
    if (err.timeout) return categoryConstants.PNTimeoutCategory;

    if (err.code === 'ETIMEDOUT') {
      return categoryConstants.PNNetworkIssuesCategory;
    }

    if (err.response) {
      if (err.response.badRequest) {
        return categoryConstants.PNBadRequestCategory;
      }
      if (err.response.forbidden) {
        return categoryConstants.PNAccessDeniedCategory;
      }
    }

    return categoryConstants.PNUnknownCategory;
  }
}
