/* @flow */

import superagent from 'superagent';

import Crypto from './cryptography/index';
import Config from './config.js';

import { EndpointDefinition, StatusAnnouncement } from '../flow_interfaces';

type NetworkingModules = {
  crypto: Crypto,
  config: Config,
  sendBeacon: Function
}

export default class {
  _sendBeacon: Function;

  _config: Config;
  _crypto: Crypto;

  _maxSubDomain: number;
  _currentSubDomain: number;

  _standardOrigin: string;
  _subscribeOrigin: string;

  _providedFQDN: string;

  _requestTimeout: number;

  _coreParams: Object; /* items that must be passed with each request. */

  constructor({ config, crypto, sendBeacon }: NetworkingModules) {
    this._config = config;
    this._crypto = crypto;
    this._sendBeacon = sendBeacon;

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

    return this._providedFQDN.replace('pubsub', 'ps' + newSubDomain);
  }

  // origin operations
  shiftStandardOrigin(failover: boolean = false): string {
    this._standardOrigin = this.nextOrigin(failover);

    return this._standardOrigin;
  }

  getStandardOrigin(): string {
    return this._standardOrigin;
  }

  POST(params : Object, body: string, endpoint: EndpointDefinition, callback: Function): superagent {
    let superagentConstruct = superagent
      .post(this.getStandardOrigin() + endpoint.url)
      .query(params)
      .send(body);
    return this._abstractedXDR(superagentConstruct, endpoint, callback);
  }

  GET(params : Object, endpoint: EndpointDefinition, callback: Function): superagent {
    let superagentConstruct = superagent
      .get(this.getStandardOrigin() + endpoint.url)
      .query(params);
    return this._abstractedXDR(superagentConstruct, endpoint, callback);
  }

  _abstractedXDR(superagentConstruct: superagent, endpoint: EndpointDefinition, callback: Function): Object {
    // attach a logger
    if (this._config.logVerbosity) {
      superagentConstruct = superagentConstruct.use(this._attachSuperagentLogger);
    }

    return superagentConstruct
      .timeout(endpoint.timeout)
      .end((err, resp) => {
        let status: StatusAnnouncement = {};
        status.error = err !== null;
        status.operation = endpoint.operation;

        if (resp && resp.status) {
          status.statusCode = resp.status;
        }

        if (err) {
          status.errorData = err;
          status.category = this._detectErrorCategory(err);
          return callback(status, null);
        }

        let parsedResponse = JSON.parse(resp.text);
        return callback(status, parsedResponse);
      });
  }

  _detectErrorCategory(err: Object): string {
    if (err.code === 'ENOTFOUND') return 'PNNetworkIssuesCategory';
    if (err.status === 0 || (err.hasOwnProperty('status') && typeof err.status === 'undefined')) return 'PNNetworkIssuesCategory';
    if (err.timeout) return 'PNTimeoutCategory';

    if (err.response) {
      if (err.response.badRequest) return 'PNBadRequestCategory';
      if (err.response.forbidden) return 'PNAccessDeniedCategory';
    }

    return 'PNUnknownCategory';
  }

  _attachSuperagentLogger(req: Object) {
    let _pickLogger = () => {
      if (console && console.log) return console; // eslint-disable-line no-console
      if (window && window.console && window.console.log) return window.console;
      return console;
    };

    let start = new Date().getTime();
    let timestamp = new Date().toISOString();
    let logger = _pickLogger();
    logger.log('<<<<<');                                               // eslint-disable-line no-console
    logger.log('[' + timestamp + ']', '\n', req.url, '\n', req.qs);    // eslint-disable-line no-console
    logger.log('-----');                                               // eslint-disable-line no-console

    req.on('response', (res) => {
      let now = new Date().getTime();
      let elapsed = now - start;
      let timestampDone = new Date().toISOString();

      logger.log('>>>>>>');                                                                                  // eslint-disable-line no-console
      logger.log('[' + timestampDone + ' / ' + elapsed + ']', '\n', req.url, '\n', req.qs, '\n', res.text);  // eslint-disable-line no-console
      logger.log('-----');                                                                                   // eslint-disable-line no-console
    });
  }
}
