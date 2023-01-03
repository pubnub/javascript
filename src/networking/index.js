/*       */

import Config from '../core/components/config';
import categoryConstants from '../core/constants/categories';

import { EndpointDefinition, NetworkingModules } from '../core/flow_interfaces';

export default class {
  _modules;

  _config;

  _currentSubDomain;

  _standardOrigin;

  _subscribeOrigin;

  _requestTimeout;

  _coreParams; /* items that must be passed with each request. */

  constructor(modules) {
    this._modules = {};

    Object.keys(modules).forEach((key) => {
      this._modules[key] = modules[key].bind(this);
    });
  }

  init(config) {
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

  nextOrigin() {
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

  hasModule(name) {
    return name in this._modules;
  }

  // origin operations
  shiftStandardOrigin() {
    this._standardOrigin = this.nextOrigin();

    return this._standardOrigin;
  }

  getStandardOrigin() {
    return this._standardOrigin;
  }

  POSTFILE(url, fields, file) {
    return this._modules.postfile(url, fields, file);
  }

  GETFILE(params, endpoint, callback) {
    return this._modules.getfile(params, endpoint, callback);
  }

  POST(params, body, endpoint, callback) {
    return this._modules.post(params, body, endpoint, callback);
  }

  PATCH(params, body, endpoint, callback) {
    return this._modules.patch(params, body, endpoint, callback);
  }

  GET(params, endpoint, callback) {
    return this._modules.get(params, endpoint, callback);
  }

  DELETE(params, endpoint, callback) {
    return this._modules.del(params, endpoint, callback);
  }

  _detectErrorCategory(err) {
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
