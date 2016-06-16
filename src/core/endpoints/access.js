/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Crypto from '../components/cryptography';
import BaseEndoint from './base.js';
import utils from '../utils.js';

import { endpointDefinition, statusStruct } from '../flow_interfaces';

type accessConstruct = {
  networking: Networking,
  config: Config,
  crypto: Crypto
};

type auditArguments = {
  channel: string,
  channelGroup: string,
  authKeys: Array<string>,
}

type grantArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  ttl: number,
  read: boolean,
  write: boolean,
  manage: boolean,
  authKeys: Array<string>
}

export default class extends BaseEndoint {
  networking: Networking;
  config: Config;

  constructor({ networking, config, crypto }: accessConstruct) {
    super({ config });
    this.networking = networking;
    this.config = config;
    this.crypto = crypto;
  }

  grant(args: grantArguments, callback: Function) {
    const { channels = [], channelGroups = [], ttl, read = false, write = false, manage = false, authKeys = [] } = args;
    const endpointConfig: endpointDefinition = {
      params: {
        subscribeKey: { required: true },
        publishKey: { required: true },
        uuid: { required: true }
      },
      url: '/v1/auth/grant/sub-key/' + this.config.subscribeKey
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

    let signInput = this.config.subscribeKey + '\n' + this.config.publishKey + '\ngrant\n';
    signInput += utils.signPamFromParams(params);

    params.signature = this.crypto.HMACSHA256(signInput);

    this.networking.GET(params, endpointConfig, (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);
      callback(status, payload.payload);
    });
  }

  audit(args: auditArguments, callback: Function) {
    const { channel, channelGroup, authKeys = [] } = args;
    const endpointConfig: endpointDefinition = {
      params: {
        subscribeKey: { required: true },
        publishKey: { required: true },
        uuid: { required: true }
      },
      url: '/v1/auth/audit/sub-key/' + this.config.subscribeKey
    };

    // Make sure we have a Channel
    if (!callback) return this._l.error('Missing Callback');

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

    let signInput = this.config.subscribeKey + '\n' + this.config.publishKey + '\naudit\n';
    signInput += utils.signPamFromParams(params);

    params.signature = this.crypto.HMACSHA256(signInput);

    this.networking.GET(params, endpointConfig, (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);
      callback(status, payload.payload);
    });
  }
}
