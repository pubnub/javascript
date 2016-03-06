/* @flow */

import Keychain from './keychain.js';
const utils = require('../utils');


type commonXDRObject = {data: Object, callback: Function, success: Function, fail: Function};

export default class {

  _xdr: Function;
  _keychain: Keychain;

  _maxSubDomain: number;
  _currentSubDomain: number;

  _standardOrigin: string;
  _subscribeOrigin: string;

  _providedFQDN: string;

  _coreParams: Object; /* items that must be passed with each request. */

  constructor(xdr: Function, keychain: Keychain, ssl: boolean = false, origin: string = 'pubsub.pubnub.com') {
    this._xdr = xdr;
    this._keychain = keychain;

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

  /*
    Fuses the provided endpoint specific params (from data) with instance params
  */
  prepareParams(data: Object): Object {
    if (!data) data = {};
    utils.each(this._coreParams, function (key, value) {
      if (!(key in data)) data[key] = value;
    });
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
  fetchHistory(channel: string, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      this.getStandardOrigin(), 'v2', 'history', 'sub-key',
      this._keychain.getSubscribeKey(), 'channel', utils.encode(channel)
    ];

    this._xdr({ data, callback, success, fail, url });
  }

  provisionDeviceForPush(deviceId: String, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      this.getStandardOrigin(), 'v1', 'push', 'sub-key',
      this._keychain.getSubscribeKey(), 'devices', deviceId
    ];

    this._xdr({ data, callback, success, fail, url });
  }

  performGrant({ data, callback, success, fail }: commonXDRObject) {
    let url = [
      this.getStandardOrigin(), 'v1', 'auth', 'grant',
      'sub-key', this._keychain.getSubscribeKey()
    ];

    this._xdr({ data, callback, success, fail, url });
  }

  performAudit({ data, callback, success, fail }: commonXDRObject) {
    let url = [
      this.getStandardOrigin(), 'v1', 'auth', 'audit',
      'sub-key', this._keychain.getSubscribeKey()
    ];

    this._xdr({ data, callback, success, fail, url });
  }

  fetchReplay(source: string, destination: string, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      this.getStandardOrigin(), 'v1', 'replay',
      this._keychain.getPublishKey(), this._keychain.getSubscribeKey(), source, destination
    ];

    this._xdr({ data, callback, success, fail, url });
  }

  fetchTime(jsonp: string, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      this.getStandardOrigin(), 'time', jsonp
    ];

    this._xdr({ data, callback, success, fail, url });
  }

  fetchWhereNow(uuid: string, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      this.getStandardOrigin(), 'v2', 'presence',
      'sub_key', this._keychain.getSubscribeKey(),
      'uuid', utils.encode(uuid)
    ];

    this._xdr({ data, callback, success, fail, url });
  }

  fetchHereNow(channel: string, channel_group: string, { data, callback, success, fail }: commonXDRObject) {
    var url = [
      this.getStandardOrigin(), 'v2', 'presence',
      'sub_key', this._keychain.getSubscribeKey()
    ];

    if (channel) {
      url.push('channel');
      url.push(utils.encode(channel));
    }

    if (channel_group && !channel) {
      url.push('channel');
      url.push(',');
    }

    this._xdr({ data, callback, success, fail, url });
  }

  getOrigin(): string {
    return this._providedFQDN;
  }

  getStandardOrigin(): string {
    return this._standardOrigin;
  }

  getSubscribeOrigin(): string {
    return this._subscribeOrigin;
  }

}
