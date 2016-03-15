/* @flow */

import superagent from 'superagent';

import Keychain from './keychain.js';
import Responders from '../presenters/responders';
import Config from './config.js';
import utils from '../utils';

type commonXDR = { data: Object, callback: Function };
type superagentPayload = {
  data: Object,
  url: Array<string | number>,
  callback: Function,
};

type networkingModules = {
  encrypt: Function,
  keychain: Keychain,
  config: Config
}

type publishPayload = Object | string | number | boolean;

export default class {
  _sendBeacon: Function;

  _keychain: Keychain;
  _config: Config;
  _encrypt: Function;

  _maxSubDomain: number;
  _currentSubDomain: number;

  _standardOrigin: string;
  _subscribeOrigin: string;

  _providedFQDN: string;

  _requestTimeout: number;

  _coreParams: Object; /* items that must be passed with each request. */

  _r: Responders;

  constructor({ config, keychain, encrypt }: networkingModules, ssl: boolean = false, origin: ?string = 'pubsub.pubnub.com') {
    this._config = config;
    this._keychain = keychain;
    this._encrypt = encrypt
    this._r = new Responders('#networking');

    this._maxSubDomain = 20;
    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);

    this._providedFQDN = (ssl ? 'https://' : 'http://') + origin;
    this._coreParams = {};

    // create initial origins
    this.shiftStandardOrigin(false);
    this.shiftSubscribeOrigin(false);
  }

  setCoreParams(params: Object): this {
    this._coreParams = params;
    return this;
  }

  addCoreParam(key: string, value: any) {
    this._coreParams[key] = value;
  }

  addBeaconDispatcher(sendBeacon: Function): this {
    this._sendBeacon = sendBeacon;
    return this;
  }

  /*
    Fuses the provided endpoint specific params (from data) with instance params
  */
  prepareParams(data: Object): Object {
    if (!data) data = {};

    utils.each(this._coreParams, function (key, value) {
      if (!(key in data)) data[key] = value;
    });

    if (this._config.isInstanceIdEnabled()) {
      data.instanceid = this._keychain.getInstanceId();
    }

    return data;
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
    if (!this._keychain.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let url = [
      this.getStandardOrigin(), 'v2', 'history', 'sub-key',
      this._keychain.getSubscribeKey(), 'channel', utils.encode(channel),
    ];

    let data = this.prepareParams(incomingData);

    if (this._keychain.getAuthKey()) {
      data.auth = this._keychain.getAuthKey();
    }

    this._xdr({ data, callback, url });
  }

  performChannelGroupOperation(channelGroup: string, mode: string, incomingData: Object, callback: Function) {
    if (!this._keychain.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let url = [
      this.getStandardOrigin(), 'v1', 'channel-registration',
      'sub-key', this._keychain.getSubscribeKey(), 'channel-group',
    ];

    if (channelGroup && channelGroup !== '*') {
      url.push(channelGroup);
    }

    if (mode === 'remove') {
      url.push('remove');
    }

    let data = this.prepareParams(incomingData);

    if (this._keychain.getAuthKey()) {
      data.auth = this._keychain.getAuthKey();
    }

    this._xdr({ data, callback, url });
  }

  provisionDeviceForPush(deviceId: string, incomingData: Object, callback: Function) {
    if (!this._keychain.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    if (!this._keychain.getPublishKey()) {
      return callback(this._r.validationError('Missing Publish Key'));
    }

    let url = [
      this.getStandardOrigin(), 'v1', 'push', 'sub-key',
      this._keychain.getSubscribeKey(), 'devices', deviceId,
    ];
    let data = this.prepareParams(incomingData);

    data.uuid = this._keychain.getUUID();
    data.auth = this._keychain.getAuthKey();

    this._xdr({ data, url, callback });
  }

  performGrant({ data, success, fail }: commonXDR) {
    let url = [
      this.getStandardOrigin(), 'v1', 'auth', 'grant',
      'sub-key', this._keychain.getSubscribeKey(),
    ];

    this._xdr({ data, success, fail, url });
  }

  performHeartbeat(channels: string, { data, success, fail }: commonXDR) {
    let url = [
      this.getStandardOrigin(), 'v2', 'presence',
      'sub-key', this._keychain.getSubscribeKey(),
      'channel', channels,
      'heartbeat',
    ];

    this._xdr({ data, success, fail, url });
  }

  performState(state: string, channel: string, uuid: string, { data, success, fail }: commonXDR) {
    let url = [
      this.getStandardOrigin(), 'v2', 'presence',
      'sub-key', this._keychain.getSubscribeKey(),
      'channel', channel,
    ];

    if (state) {
      url.push('uuid', uuid, 'data');
    } else {
      url.push('uuid', utils.encode(uuid));
    }

    this._xdr({ data, success, fail, url });
  }

  performAudit({ data, success, fail }: commonXDR) {
    let url = [
      this.getStandardOrigin(), 'v1', 'auth', 'audit',
      'sub-key', this._keychain.getSubscribeKey(),
    ];

    this._xdr({ data, success, fail, url });
  }

  performChannelLeave(channel: string, { data, success, fail }: commonXDR) {
    let origin = this.nextOrigin(false);
    let url = [
      origin, 'v2', 'presence', 'sub_key',
      this._keychain.getSubscribeKey(), 'channel', utils.encode(channel), 'leave',
    ];

    if (this._sendBeacon) {
      if (this._sendBeacon(utils.buildURL(url, data))) {
        success({ status: 200, action: 'leave', message: 'OK', service: 'Presence' });
      }
    } else {
      this._xdr({ data, success, fail, url });
    }
  }

  performChannelGroupLeave({ data, success, fail }: commonXDR) {
    let origin = this.nextOrigin(false);
    let url = [
      origin, 'v2', 'presence', 'sub_key',
      this._keychain.getSubscribeKey(), 'channel', utils.encode(','), 'leave',
    ];

    if (typeof(this._sendBeacon) !== 'undefined') {
      if (this._sendBeacon(utils.buildURL(url, data))) {
        success({ status: 200, action: 'leave', message: 'OK', service: 'Presence' });
      }
    } else {
      this._xdr({ data, success, fail, url });
    }
  }

  fetchTime(callback: Function) {
    let data = this.prepareParams({});
    let url = [this.getStandardOrigin(), 'time', 0];

    if (this._keychain.getUUID()) {
      data.uuid = this._keychain.getUUID();
    }

    if (this._keychain.getAuthKey()) {
      data.auth = this._keychain.getAuthKey();
    }

    this._xdr({ data, callback, url });
  }

  fetchWhereNow(uuid: string | null, callback: Function) {
    if (!this._keychain.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let data: Object = this.prepareParams({});

    if (this._keychain.getAuthKey()) {
      data.auth = this._keychain.getAuthKey();
    }

    if (!uuid) {
      uuid = this._keychain.getUUID();
    }

    let url = [
      this.getStandardOrigin(), 'v2', 'presence',
      'sub-key', this._keychain.getSubscribeKey(),
      'uuid', utils.encode(uuid),
    ];

    this._xdr({ data, callback, url });
  }

  fetchHereNow(channel: string, channelGroup: string, incomingData: Object, callback: Function) {
    if (!this._keychain.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let data = this.prepareParams(incomingData);

    if (this._keychain.getUUID()) {
      data.uuid = this._keychain.getUUID();
    }

    if (this._keychain.getAuthKey()) {
      data.auth = this._keychain.getAuthKey();
    }

    let url = [
      this.getStandardOrigin(), 'v2', 'presence',
      'sub-key', this._keychain.getSubscribeKey(),
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
    if (!this._keychain.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    let data: Object = this.prepareParams(incomingData);
    console.log(incomingData);
    console.log(data);

    let url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key',
      this._keychain.getSubscribeKey(), 'channel', channel, 'uuid', this._keychain.getUUID(), 'data'];

    if (this._keychain.getAuthKey()) {
      data.auth = this._keychain.getAuthKey();
    }

    data.state = JSON.stringify(data.state);

    this._xdr({ data, callback, url });
  }

  fetchState(uuid: string, channel: string, incomingData: Object, callback: Function) {
    if (!this._keychain.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    if (!uuid) {
      uuid = this._keychain.getUUID();
    }

    let data: Object = this.prepareParams(incomingData);
    let url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key',
      this._keychain.getSubscribeKey(), 'channel', channel, 'uuid', uuid];

    if (this._keychain.getAuthKey()) {
      data.auth = this._keychain.getAuthKey();
    }

    this._xdr({ data, callback, url });
  }

  performPublish(channel: string, msg: publishPayload, incomingData: Object, mode: string, callback: Function) {
    if (!this._keychain.getSubscribeKey()) {
      return callback(this._r.validationError('Missing Subscribe Key'));
    }

    if (!this._keychain.getPublishKey()) {
      return callback(this._r.validationError('Missing Publish Key'));
    }

    let encryptedMessage = this._encrypt(msg, this._keychain.getCipherKey());
    encryptedMessage = JSON.stringify(encryptedMessage);

    let url = [
      this.getStandardOrigin(), 'publish',
      this._keychain.getPublishKey(), this._keychain.getSubscribeKey(),
      0, utils.encode(channel),
      0, utils.encode(msg),
    ];

    let data = this.prepareParams(incomingData);

    if (this._keychain.getUUID()) {
      data.uuid = this._keychain.getUUID();
    }

    if (this._keychain.getAuthKey()) {
      data.auth = this._keychain.getAuthKey();
    }

    if (mode === 'POST') {
      this._postXDR({ data, callback, url });
    } else {
      this._xdr({ data, callback, url });
    }
  }

  getStandardOrigin(): string {
    return this._standardOrigin;
  }

  getSubscribeOrigin(): string {
    return this._subscribeOrigin;
  }

  _postXDR({ data, url, callback}: superagentPayload) {
    let superagentConstruct = superagent
      .post(url.join('/'))
      .query(data);
    this._abstractedXDR(superagentConstruct, callback);
  }

  _xdr({ data, url, callback}: superagentPayload) {
    let superagentConstruct = superagent
      .get(url.join('/'))
      .query(data);
    this._abstractedXDR(superagentConstruct, callback);
  }

  _abstractedXDR(superagentConstruct: superagent, callback: Function) {
    superagentConstruct
      .type('json')
      .end(function (err, resp) {
        if (err) return callback(err, null);

        if (typeof resp === 'object' && resp.error) {
          callback(resp.error, null);
          return;
        }

        callback(null, JSON.parse(resp.text));
      });
  }
}
