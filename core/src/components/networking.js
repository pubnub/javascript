/* @flow */

const utils = require('../utils');

type commonXDRObject = {data: Object, callback: Function, success: Function, fail: Function};


export default class {

  xdr: Function;
  subscribeKey: string;
  publishKey: string;

  constructor(xdr: Function, subscribeKey: string, publishKey: string) {
    this.xdr = xdr;
    this.subscribeKey = subscribeKey;
    this.publishKey = publishKey;
  }

  // method based URL's
  fetchHistory(STD_ORIGIN: string, channel: string, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      STD_ORIGIN, 'v2', 'history', 'sub-key', this.getSubscribeKey(), 'channel', utils.encode(channel)
    ];

    this.xdr({ data, callback, success, fail, url });
  }

  fetchReplay(STD_ORIGIN: string, source: string, destination: string, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      STD_ORIGIN, 'v1', 'replay', this.getPublishKey(), this.getSubscribeKey(), source, destination
    ];

    this.xdr({ data, callback, success, fail, url });
  }

  fetchTime(STD_ORIGIN: string, jsonp: string, { data, callback, success, fail }: commonXDRObject) {
    let url = [
      STD_ORIGIN, 'time', jsonp
    ];

    this.xdr({ data, callback, success, fail, url });
  }

  // getters
  getSubscribeKey(): string {
    return this.subscribeKey;
  }

  getPublishKey(): string {
    return this.publishKey;
  }
}
