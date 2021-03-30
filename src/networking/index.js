/* @flow */

import Config from '../core/components/config';
import categoryConstants from '../core/constants/categories';

import { EndpointDefinition, NetworkingModules } from '../core/flow_interfaces';

export default class {
  _modules: NetworkingModules;
  _config: Config;

  _maxSubDomain: number;
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

    this._maxSubDomain = 10;
    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);
    this._coreParams = {};

    // create initial origins
    this.shiftStandardOrigin();
  }

  nextOrigin(): string {
    this._currentSubDomain += 1;

    if (this._currentSubDomain >= this._maxSubDomain) {
      this._currentSubDomain = 0;
    }

    const canonicalOrigin = this._config.origin;
    const [thirdLevelDomain, ...restDomains] = canonicalOrigin.split('.');

    const protocol = this._config.secure ? 'https://' : 'http://';
    const separator = this._config.hasCustomOrigin() ? '-' : '';
    const shard = this._config.hasCustomOrigin() ? this._currentSubDomain : this._currentSubDomain + 1;

    return `${protocol}${thirdLevelDomain}${separator}${shard}.${restDomains.join('.')}`;
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
