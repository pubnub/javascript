/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Keychain from '../components/keychain';
import Responders from '../presenters/responders';

import utils from '../utils';

type accessConstruct = {
  networking: Networking,
  config: Config,
  keychain: Keychain,
  error: Function,
  hmac_SHA256: Function
};

export default class {
  _networking: Networking;
  _config: Config;
  _keychain: Keychain;
  _error: Function;
  _hmac_SHA256: Function;

  constructor({ networking, config, keychain, error, hmac_SHA256 }: accessConstruct) {
    this._networking = networking;
    this._keychain = keychain;
    this._config = config;
    this._error = error;
    this._hmac_SHA256 = hmac_SHA256;
  }

  performGrant(args: Object, argumentCallback: Function) {
    let callback = args.callback || argumentCallback;
    let err = args.error || function () {};
    let channel = args.channel || args.channels;
    let channel_group = args.channel_group;
    let ttl = args.ttl;
    let r = (args.read) ? '1' : '0';
    let w = (args.write) ? '1' : '0';
    let m = (args.manage) ? '1' : '0';
    let auth_key = args.auth_key || args.auth_keys;

    if (!callback) return this._error('Missing Callback');
    if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
    if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
    if (!this._keychain.getSecretKey()) return this._error('Missing Secret Key');

    let timestamp = Math.floor(new Date().getTime() / 1000);
    let sign_input = this._keychain.getSubscribeKey() + '\n' +
      this._keychain.getPublishKey() + '\n' +
      'grant' + '\n';

    let data: Object = { w: w, r: r, timestamp: timestamp };

    if (args.manage) {
      data.m = m;
    }
    if (utils.isArray(channel)) {
      channel = channel.join(',');
    }
    if (utils.isArray(auth_key)) {
      auth_key = auth_key.join(',');
    }

    if (typeof channel !== 'undefined' && channel !== null && channel.length > 0) {
      data.channel = channel;
    }

    if (typeof channel_group !== 'undefined' && channel_group !== null && channel_group.length > 0) {
      data['channel-group'] = channel_group;
    }

    if (ttl || ttl === 0) data.ttl = ttl;

    if (auth_key) data.auth = auth_key;

    data = this._networking.prepareParams(data);

    if (!auth_key) delete data.auth;

    sign_input += utils._get_pam_sign_input_from_params(data);

    let signature = this._hmac_SHA256(sign_input, this._keychain.getSecretKey());

    signature = signature.replace(/\+/g, '-');
    signature = signature.replace(/\//g, '_');

    data.signature = signature;

    this._networking.performGrant({
      data: data,
      success: function (response) {
        Responders.callback(response, callback, err);
      },
      fail: function (response) {
        Responders.error(response, err);
      },
    });
  }

  performAudit(args: Object, argumentCallback: Function) {
    let callback = args.callback || argumentCallback;
    let err = args.error || function () {};
    let channel = args.channel;
    let channel_group = args.channel_group;
    let auth_key = args.auth_key;

    // Make sure we have a Channel
    if (!callback) return this._error('Missing Callback');
    if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
    if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
    if (!this._keychain.getSecretKey()) return this._error('Missing Secret Key');

    let timestamp = Math.floor(new Date().getTime() / 1000);
    let sign_input = this._keychain.getSubscribeKey() + '\n' +
      this._keychain.getPublishKey() + '\n' +
      'audit' + '\n';

    let data: Object = { timestamp: timestamp };

    if (typeof channel !== 'undefined' && channel !== null && channel.length > 0) {
      data.channel = channel;
    }

    if (typeof channel_group !== 'undefined' && channel_group !== null && channel_group.length > 0) {
      data['channel-group'] = channel_group;
    }

    if (auth_key) data.auth = auth_key;

    data = this._networking.prepareParams(data);

    if (!auth_key) delete data.auth;

    sign_input += utils._get_pam_sign_input_from_params(data);

    let signature = this._hmac_SHA256(sign_input, this._keychain.getSecretKey());

    signature = signature.replace(/\+/g, '-');
    signature = signature.replace(/\//g, '_');

    data.signature = signature;
    this._networking.performAudit({
      data: data,
      success: function (response) {
        Responders.callback(response, callback, err);
      },
      fail: function (response) {
        Responders.error(response, err);
      },
    });
  }

}
