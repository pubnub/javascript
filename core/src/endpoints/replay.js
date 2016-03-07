/* @flow */

import Networking from '../components/networking';
import Keychain from '../components/keychain';
import Responders from '../presenters/responders';

type replayConstruct = {
  networking: Networking,
  keychain: Keychain,
  jsonp_cb: Function,
  error: Function
};

export default class {
  _networking: Networking;
  _keychain: Keychain;
  _jsonp_cb: Function;
  _error: Function;

  constructor({ networking, keychain, jsonp_cb, error }: replayConstruct) {
    this._networking = networking;
    this._keychain = keychain;
    this._jsonp_cb = jsonp_cb;
    this._error = error;
  }

  performReplay(args: Object, argumentCallback: Function) {
    let { stop, start, end, reverse, limit, source } = args;

    var callback = argumentCallback || args.callback || function () {};
    var auth_key = args.auth_key || this._keychain.getAuthKey();
    var destination = args.destination;
    var err = args.error || function () {};
    var jsonp = this._jsonp_cb();
    var data = {};

    // Check User Input
    if (!source) return this._error('Missing Source Channel');
    if (!destination) return this._error('Missing Destination Channel');
    if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
    if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

    // Setup URL Params
    if (jsonp !== 0) data.callback = jsonp;
    if (stop) data.stop = 'all';
    if (reverse) data.reverse = 'true';
    if (start) data.start = start;
    if (end) data.end = end;
    if (limit) data.count = limit;

    data.auth = auth_key;

    // Start (or Stop) Replay!
    this._networking.fetchReplay(source, destination, {
      callback: jsonp,
      success: function (response) {
        Responders.callback(response, callback, err);
      },
      fail: function () {
        callback([0, 'Disconnected']);
      },
      data: this._networking.prepareParams(data)
    });
  }
}
