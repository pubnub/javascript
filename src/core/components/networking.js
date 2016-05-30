/* @flow */

import superagent from 'superagent';
// import axios from 'axios';

import Crypto from './cryptography/index';
import Responders from '../presenters/responders';
import Config from './config.js';
import utils from '../utils';

import { endpointDefinition } from '../flow_interfaces';

type superagentPayload = {
  data: Object,
  url: Array<string | number>,
  callback: Function,
  timeout: ?number
};

type networkingModules = {
  crypto: Crypto,
  config: Config,
  sendBeacon: Function
}

type publishPayload = Object | string | number | boolean;

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

  // method based URL's
  fetchHistory(channel: string, incomingData: Object, callback: Function) {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let url = [
      this.getStandardOrigin(), 'v2', 'history', 'sub-key',
      this._config.getSubscribeKey(), 'channel', utils.encode(channel),
    ];

    let data = this.prepareParams(incomingData);

    if (this._config.getAuthKey()) {
      data.auth = this._config.getAuthKey();
    }

    this._xdr({ data, callback, url });
  }

  performChannelGroupOperation(channelGroup: string, mode: string, incomingData: Object, callback: Function) {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let url = [
      this.getStandardOrigin(), 'v1', 'channel-registration',
      'sub-key', this._config.getSubscribeKey(), 'channel-group',
    ];

    if (channelGroup && channelGroup !== '*') {
      url.push(channelGroup);
    }

    if (mode === 'remove') {
      url.push('remove');
    }

    let data = this.prepareParams(incomingData);

    if (this._config.getAuthKey()) {
      data.auth = this._config.getAuthKey();
    }

    this._xdr({ data, callback, url });
  }

  provisionDeviceForPush(deviceId: string, incomingData: Object, callback: Function) {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    if (!this._config.getPublishKey()) {
      return callback(this._r.validationError('Missing Publish Key'));
    }

    let url = [
      this.getStandardOrigin(), 'v1', 'push', 'sub-key',
      this._config.getSubscribeKey(), 'devices', deviceId,
    ];
    let data = this.prepareParams(incomingData);

    data.uuid = this._config.getUUID();
    data.auth = this._config.getAuthKey();

    this._xdr({ data, url, callback });
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

  fetchWhereNow(uuid: string | null, callback: Function) {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let data: Object = this.prepareParams({});

    if (this._config.getAuthKey()) {
      data.auth = this._config.getAuthKey();
    }

    if (!uuid) {
      uuid = this._config.getUUID();
    }

    let url = [
      this.getStandardOrigin(), 'v2', 'presence',
      'sub-key', this._config.getSubscribeKey(),
      'uuid', utils.encode(uuid),
    ];

    this._xdr({ data, callback, url });
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

  fetchState(uuid: string, channel: string, incomingData: Object, callback: Function) {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    if (!uuid) {
      uuid = this._config.getUUID();
    }

    let data: Object = this.prepareParams(incomingData);
    let url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key',
      this._config.getSubscribeKey(), 'channel', channel, 'uuid', uuid];

    if (this._config.getAuthKey()) {
      data.auth = this._config.getAuthKey();
    }

    this._xdr({ data, callback, url });
  }

  performPublish(channel: string, msg: publishPayload, incomingData: Object, mode: string, callback: Function) {
    if (!this._config.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    if (!this._config.getPublishKey()) {
      return callback(this._r.validationError('Missing Publish Key'));
    }

    let stringifiedMessage = JSON.stringify(msg);
    let encryptedMessage = this._crypto.encrypt(stringifiedMessage);

    let url = [
      this.getStandardOrigin(), 'publish',
      this._config.getPublishKey(), this._config.getSubscribeKey(),
      0, utils.encode(channel),
      0,
    ];

    let data = this.prepareParams(incomingData);

    if (this._config.getUUID()) {
      data.uuid = this._config.getUUID();
    }

    if (this._config.getAuthKey()) {
      data.auth = this._config.getAuthKey();
    }

    if (mode === 'POST') {
      data.message = utils.encode(encryptedMessage);
      this._postXDR({ data, callback, url });
    } else {
      url.push(utils.encode(encryptedMessage));
      this._xdr({ data, callback, url });
    }
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

  _postXDR({ data, url, timeout, callback}: superagentPayload): superagent {
    let superagentConstruct = superagent
      .post(url.join('/'))
      .send(data);
    return this._abstractedXDR(superagentConstruct, timeout, callback);
  }

  XDR(params : Object, endpoint: endpointDefinition, callback: Function): superagent {
    console.log("----");
    console.log("params", params);
    console.log("endpoint", endpoint);

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
        if (err) return callback(err, null);

        let parsedResponse = JSON.parse(resp.text);

        if (typeof parsedResponse === 'object' && parsedResponse.error) {
          return callback(parsedResponse.error, null);
        }

        if (typeof parsedResponse === 'object' && parsedResponse.payload) {
          return callback(null, parsedResponse.payload);
        }

        callback(null, parsedResponse);
      });
  }
}
