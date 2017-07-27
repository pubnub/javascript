/* @flow */
/* global window */

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

  _providedFQDN: string;

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

    this._maxSubDomain = 20;
    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);
    this._providedFQDN = (this._config.secure ? 'https://' : 'http://') + this._config.origin;
    this._coreParams = {};

    // create initial origins
    this.shiftStandardOrigin();
  }

  nextOrigin(): string {
    // if a custom origin is supplied, use do not bother with shuffling subdomains
    if (this._providedFQDN.indexOf('pubsub.') === -1) {
      return this._providedFQDN;
    }

    let newSubDomain: string;

    this._currentSubDomain = this._currentSubDomain + 1;

    if (this._currentSubDomain >= this._maxSubDomain) {
      this._currentSubDomain = 1;
    }

    newSubDomain = this._currentSubDomain.toString();

    return this._providedFQDN.replace('pubsub', `ps${newSubDomain}`);
  }

  // origin operations
  shiftStandardOrigin(failover: boolean = false): string {
    this._standardOrigin = this.nextOrigin(failover);

    return this._standardOrigin;
  }

  getStandardOrigin(): string {
    return this._standardOrigin;
  }

  POST(params: Object, body: string, endpoint: EndpointDefinition, callback: Function) {
    return this._modules.post(params, body, endpoint, callback);
  }

  GET(params: Object, endpoint: EndpointDefinition, callback: Function) {
    return this._modules.get(params, endpoint, callback);
  }

  _detectErrorCategory(err: Object): string {
    if (err.code === 'ENOTFOUND') return categoryConstants.PNNetworkIssuesCategory;
    if (err.code === 'ECONNREFUSED') return categoryConstants.PNNetworkIssuesCategory;
    if (err.code === 'ECONNRESET') return categoryConstants.PNNetworkIssuesCategory;
    if (err.code === 'EAI_AGAIN') return categoryConstants.PNNetworkIssuesCategory;

    if (err.status === 0 || (err.hasOwnProperty('status') && typeof err.status === 'undefined')) return categoryConstants.PNNetworkIssuesCategory;
    if (err.timeout) return categoryConstants.PNTimeoutCategory;

    if (err.response) {
      if (err.response.badRequest) return categoryConstants.PNBadRequestCategory;
      if (err.response.forbidden) return categoryConstants.PNAccessDeniedCategory;
    }

    return categoryConstants.PNUnknownCategory;
  }
}
