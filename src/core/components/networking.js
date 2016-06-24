/* @flow */

import superagent from 'superagent';

import Crypto from './cryptography/index';
import Config from './config.js';

import { endpointDefinition, statusStruct } from '../flow_interfaces';

type networkingModules = {
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

  constructor({ config, crypto, sendBeacon }: networkingModules) {
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

  POST(params : Object, body: string, endpoint: endpointDefinition, callback: Function): superagent {
    let superagentConstruct = superagent
      .post(this.getStandardOrigin() + endpoint.url)
      .query(params)
      .send(body);
    return this._abstractedXDR(superagentConstruct, endpoint.timeout, callback);
  }

  GET(params : Object, endpoint: endpointDefinition, callback: Function): superagent {
    let superagentConstruct = superagent
      .get(this.getStandardOrigin() + endpoint.url)
      .query(params);
    return this._abstractedXDR(superagentConstruct, endpoint.timeout, callback);
  }

  _abstractedXDR(superagentConstruct: superagent, timeout: number | null | void, callback: Function): Object {
    // attach a logger
    if (this._config.logVerbosity) {
      superagentConstruct = superagentConstruct.use(this._logger());
    }

    return superagentConstruct
      .type('json')
      .timeout(timeout || this._config.getTransactionTimeout())
      .end((err, resp) => {
        let status: statusStruct = {};
        status.error = err;

        if (err) {
          return callback(status, null);
        }

        status.statusCode = resp.status;
        let parsedResponse = JSON.parse(resp.text);
        return callback(status, parsedResponse);
      });
  }

  _logger(options: ?Object): Function {
    if (!options) options = {};
    return this._attachSuperagentLogger.bind(null, options);
  }

  _attachSuperagentLogger(options: Object, req: Object) {
    let start = new Date().getTime();
    let timestamp = new Date().toISOString();
    console.log('<<<<<');                                               // eslint-disable-line no-console
    console.log('[' + timestamp + ']', '\n', req.url, '\n', req.qs);    // eslint-disable-line no-console
    console.log('-----');                                               // eslint-disable-line no-console

    req.on('response', (res) => {
      let now = new Date().getTime();
      let elapsed = now - start;
      let timestampDone = new Date().toISOString();

      console.log('>>>>>>');                                                                                  // eslint-disable-line no-console
      console.log('[' + timestampDone + ' / ' + elapsed + ']', '\n', req.url, '\n', req.qs, '\n', res.text);  // eslint-disable-line no-console
      console.log('-----');                                                                                   // eslint-disable-line no-console
    });
  }
}
