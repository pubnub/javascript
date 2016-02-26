/* @flow */

const utils = require('../utils');

type commonXDRObject = {data: Object, callback: Function, success: Function, fail: Function};

export default class {

  _xdr: Function;
  _subscribeKey: string;
  _publishKey: string;

  _maxSubDomain: number;
  _currentSubDomain: number;

  _standardOrigin: string;
  _subscribeOrigin: string;

  _providedFQDN: string;

  constructor(xdr: Function, ssl: boolean = false, origin: string = 'pubsub.pubnub.com') {
    this._xdr = xdr;

    this._maxSubDomain = 20;
    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);

    this._providedFQDN = (ssl ? 'https://' : 'http://') + origin;

    // create initial origins
    this.shiftStandardOrigin(false);
    this.shiftSubscribeOrigin(false);
  }


  nextOrigin(failover: boolean): string {
    // if a custom origin is supplied, use do not bother with shuffling subdomains
    if (this._providedFQDN.indexOf('pubsub.') === -1) {
      return this._providedFQDN;
    }

    let newSubdomain: string;

    if (failover) {
      newSubdomain = utils.generateUUID().split('-')[0];
    } else {
      this._currentSubDomain = this._currentSubDomain + 1;

      if (this._currentSubDomain >= this._maxSubDomain) { this._currentSubDomain = 1; }

      newSubdomain = this._currentSubDomain.toString();
    }

    return this._providedFQDN.replace('pubsub', 'ps' + newSubdomain);
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
      this.getStandardOrigin(), 'v2', 'history', 'sub-key', this.getSubscribeKey(), 'channel', utils.encode(channel)
    ];

    this._xdr({ data, callback, success, fail, url });
  }

  fetchReplay(source: string, destination: string, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      this.getStandardOrigin(), 'v1', 'replay', this.getPublishKey(), this.getSubscribeKey(), source, destination
    ];

    this._xdr({ data, callback, success, fail, url });
  }

  fetchTime(jsonp: string, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      this.getStandardOrigin(), 'time', jsonp
    ];

    this._xdr({ data, callback, success, fail, url });
  }

  // setters
  setSubscribeKey(subscribeKey: string): void {
    this._subscribeKey = subscribeKey;
  }

  setPublishKey(publishKey: string): void {
    this._publishKey = publishKey;
  }

  getOrigin(): string {
    return this._providedFQDN;
  }

  // getters
  getSubscribeKey(): string {
    return this._subscribeKey;
  }

  getPublishKey(): string {
    return this._publishKey;
  }

  getStandardOrigin(): string {
    return this._standardOrigin;
  }

  getSubscribeOrigin(): string {
    return this._subscribeOrigin;
  }

}
