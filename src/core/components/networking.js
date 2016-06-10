/* @flow */

import superagent from 'superagent';
// import axios from 'axios';

import Crypto from './cryptography/index';
import Responders from '../presenters/responders';
import Config from './config.js';
import utils from '../utils';

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

  _r: Responders;

  constructor({ config, crypto, sendBeacon }: networkingModules) {
    this._config = config;
    this._crypto = crypto;
    this._sendBeacon = sendBeacon;

    this._r = new Responders('#networking');

    this._maxSubDomain = 20;
    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);

    this._providedFQDN = (config.isSslEnabled() ? 'https://' : 'http://') + config.getOrigin();
    this._coreParams = {};

    // create initial origins
    this.shiftStandardOrigin(false);
    this.shiftSubscribeOrigin(false);
  }

  nextOrigin(failover: boolean): string {
    // if a custom origin is supplied, use do not bother with shuffling subdomains
    if (this._providedFQDN.indexOf('pubsub.') === -1) {
      return this._providedFQDN;
    }

    let newSubDomain: string;

    if (failover) {
      newSubDomain = utils.generateUUID().split('-')[0];
    } else {
      this._currentSubDomain = this._currentSubDomain + 1;

      if (this._currentSubDomain >= this._maxSubDomain) { this._currentSubDomain = 1; }

      newSubDomain = this._currentSubDomain.toString();
    }

    return this._providedFQDN.replace('pubsub', 'ps' + newSubDomain);
  }

  // origin operations
  shiftStandardOrigin(failover: boolean = false): string {
    this._standardOrigin = this.nextOrigin(failover);

    return this._standardOrigin;
  }

  shiftSubscribeOrigin(failover: boolean = false): string {
    this._subscribeOrigin = this.nextOrigin(failover);

    return this._subscribeOrigin;
  }

  performGrant(authKey: string, data: Object, callback: Function) {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    if (!this._config.getPublishKey()) {
      return callback(this._r.validationError('Missing Publish Key'));
    }

    if (!this._config.getSecretKey()) {
      return callback(this._r.validationError('Missing Secret Key'));
    }

    let signInput = this._config.getSubscribeKey() +
      '\n' +
      this._config._publishKeyD +
      '\n' +
      'grant' +
      '\n';

    let url = [
      this.getStandardOrigin(), 'v1', 'auth', 'grant',
      'sub-key', this._config.getSubscribeKey(),
    ];

    data.auth = authKey;

    data = this.prepareParams(data);
    signInput += utils._get_pam_sign_input_from_params(data);

    let signature = this._crypto.HMACSHA256(signInput, this._config.getSecretKey());

    signature = signature.replace(/\+/g, '-');
    signature = signature.replace(/\//g, '_');

    data.signature = signature;

    this._xdr({ data, callback, url });
  }

  performAudit(authKey: string, data: Object, callback: Function) {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    if (!this._config.getPublishKey()) {
      return callback(this._r.validationError('Missing Publish Key'));
    }

    if (!this._config.getSecretKey()) {
      return callback(this._r.validationError('Missing Secret Key'));
    }

    let signInput = this._config.getSubscribeKey() +
      '\n' +
      this._config.getPublishKey() +
      '\n' +
      'audit' +
      '\n';

    data.auth = authKey;
    data = this.prepareParams(data);
    signInput += utils._get_pam_sign_input_from_params(data);

    let signature = this._crypto.HMACSHA256(signInput, this._config.getSecretKey());

    signature = signature.replace(/\+/g, '-');
    signature = signature.replace(/\//g, '_');

    data.signature = signature;

    let url = [
      this.getStandardOrigin(), 'v1', 'auth', 'audit',
      'sub-key', this._config.getSubscribeKey(),
    ];

    this._xdr({ data, callback, url });
  }

  performHeartbeat(channels: string, incomingData: Object, callback: Function) {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let data = this.prepareParams(incomingData);

    let url = [
      this.getStandardOrigin(), 'v2', 'presence',
      'sub-key', this._config.getSubscribeKey(),
      'channel', channels,
      'heartbeat',
    ];

    if (this._config.getAuthKey()) {
      data.auth = this._config.getAuthKey();
    }

    if (this._config.getUUID()) {
      data.uuid = this._config.getUUID();
    }

    if (this._config.isRequestIdEnabled()) {
      data.requestid = utils.generateUUID();
    }

    this._xdr({ data, callback, url });
  }

  performLeave(channel: string, incomingData: Object, callback: Function) {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let data = this.prepareParams(incomingData);
    let origin = this.nextOrigin(false);
    let url = [
      origin, 'v2', 'presence', 'sub_key',
      this._config.getSubscribeKey(), 'channel', utils.encode(channel), 'leave',
    ];

    if (this._config.getAuthKey()) {
      data.auth = this._config.getAuthKey();
    }

    if (this._config.getUUID()) {
      data.uuid = this._config.getUUID();
    }

    if (this._config.useSendBeacon && this._sendBeacon) {
      this._sendBeacon(utils.buildURL(url, data));
    } else {
      this._xdr({ data, callback, url });
    }
  }

  fetchHereNow(channel: string, channelGroup: string, incomingData: Object, callback: Function) {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let data = this.prepareParams(incomingData);

    if (this._config.getUUID()) {
      data.uuid = this._config.getUUID();
    }

    if (this._config.getAuthKey()) {
      data.auth = this._config.getAuthKey();
    }

    let url = [
      this.getStandardOrigin(), 'v2', 'presence',
      'sub-key', this._config.getSubscribeKey(),
    ];

    if (channel) {
      url.push('channel');
      url.push(utils.encode(channel));
    }

    if (channelGroup && !channel) {
      url.push('channel');
      url.push(',');
    }

    this._xdr({ data, callback, url });
  }

  setState(channel: string, incomingData: Object, callback: Function) {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let data: Object = this.prepareParams(incomingData);

    let url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key',
      this._config.getSubscribeKey(), 'channel', channel, 'uuid', this._config.getUUID(), 'data'];

    if (this._config.getAuthKey()) {
      data.auth = this._config.getAuthKey();
    }

    data.state = JSON.stringify(data.state);

    this._xdr({ data, callback, url });
  }

  performSubscribe(channels: string, incomingData: Object, callback: Function): superagent {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let url = [
      this.getSubscribeOrigin(), 'v2', 'subscribe',
      this._config.getSubscribeKey(), utils.encode(channels),
      0
    ];

    let data = this.prepareParams(incomingData);

    if (this._config.getUUID()) {
      data.uuid = this._config.getUUID();
    }

    if (this._config.getAuthKey()) {
      data.auth = this._config.getAuthKey();
    }

    const timeout = this._config.getSubscribeTimeout();

    return this._xdr({ data, callback, url, timeout });
  }

  getStandardOrigin(): string {
    return this._standardOrigin;
  }

  getSubscribeOrigin(): string {
    return this._subscribeOrigin;
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

  _abstractedXDR(superagentConstruct: superagent, timeout: number | null | void, callback: Function): superagent {
    return superagentConstruct
      .type('json')
      .timeout(timeout || this._config.getTransactionTimeout())
      .end((err, resp) => {
        let status: statusStruct = {};
        status.error = err;

        // console.log(err);

        if (err) {
          return callback(status, null);
        }

        let parsedResponse = JSON.parse(resp.text);
        return callback(status, parsedResponse);
      });
  }
}
