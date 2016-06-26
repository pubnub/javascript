/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Crypto from '../components/cryptography';
import BaseEndpoint from './base.js';
import utils from '../utils.js';

import { EndpointDefinition, StatusStruct } from '../flow_interfaces';

type AccessConstruct = {
  networking: Networking,
  config: Config,
  crypto: Crypto
};

type AuditArguments = {
  channel: string,
  channelGroup: string,
  authKeys: Array<string>,
}

type GrantArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  ttl: number,
  read: boolean,
  write: boolean,
  manage: boolean,
  authKeys: Array<string>
}

export default class extends BaseEndpoint {
  _networking: Networking;
  _config: Config;
  _crypto: Crypto;

  constructor({ networking, config, crypto }: AccessConstruct) {
    super({ config });
    this._networking = networking;
    this._config = config;
    this._crypto = crypto;
  }

  grant(args: GrantArguments, callback: Function) {
    const { channels = [], channelGroups = [], ttl, read = false, write = false, manage = false, authKeys = [] } = args;
    const endpointConfig: EndpointDefinition = {
      params: {
        subscribeKey: { required: true },
        publishKey: { required: true },
        uuid: { required: true }
      },
      url: '/v1/auth/grant/sub-key/' + this._config.subscribeKey
    };

    if (!callback) return this.log('Missing Callback');

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }
    // create base params
    const params = this.createBaseParams(endpointConfig);

    params.r = (read) ? '1' : '0';
    params.w = (write) ? '1' : '0';
    params.m = (manage) ? '1' : '0';
    params.timestamp = Math.floor(new Date().getTime() / 1000);

    if (channels.length > 0) {
      params.channel = channels.join(',');
    }

    if (channelGroups.length > 0) {
      params['channel-group'] = channelGroups.join(',');
    }

    if (authKeys.length > 0) {
      params.auth = authKeys.join(',');
    }

    if (ttl || ttl === 0) {
      params.ttl = ttl;
    }

    let signInput = this._config.subscribeKey + '\n' + this._config.publishKey + '\ngrant\n';
    signInput += utils.signPamFromParams(params);

    params.signature = this._crypto.HMACSHA256(signInput);

    this._networking.GET(params, endpointConfig, (status: StatusStruct, payload: Object) => {
      if (status.error) return callback(status);
      callback(status, payload.payload);
    });
  }

  audit(args: AuditArguments, callback: Function) {
    const { channel, channelGroup, authKeys = [] } = args;
    const endpointConfig: EndpointDefinition = {
      params: {
        subscribeKey: { required: true },
        publishKey: { required: true },
        uuid: { required: true }
      },
      url: '/v1/auth/audit/sub-key/' + this._config.subscribeKey
    };

    // Make sure we have a Channel
    if (!callback) return this.log('Missing Callback');

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }
    // create base params
    const params = this.createBaseParams(endpointConfig);

    params.timestamp = Math.floor(new Date().getTime() / 1000);

    if (channel) {
      params.channel = channel;
    }

    if (channelGroup) {
      params['channel-group'] = channelGroup;
    }

    if (authKeys.length > 0) {
      params.auth = authKeys.join(',');
    }

    let signInput = this._config.subscribeKey + '\n' + this._config.publishKey + '\naudit\n';
    signInput += utils.signPamFromParams(params);

    params.signature = this._crypto.HMACSHA256(signInput);

    this._networking.GET(params, endpointConfig, (status: StatusStruct, payload: Object) => {
      if (status.error) return callback(status);
      callback(status, payload.payload);
    });
  }
}
