/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Crypto from '../components/cryptography';
import Logger from '../components/logger';
import Responders from '../presenters/responders';
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

type auditResponse = {
  channels: Object,
  channelGroups: Object
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

type grantResponse = {
  ttl: number,
  level: string,
  subscribeKey: string,
  channels: Object,
  channelGroups: Object
}


export default class extends BaseEndoint {
  networking: Networking;
  config: Config;
  _r: Responders;
  _l: Logger;

  constructor({ networking, config, crypto }: accessConstruct) {
    super({ config });
    this.networking = networking;
    this.config = config;
    this.crypto = crypto;
    this._r = new Responders('#endpoints/PAM');
    this._l = Logger.getLogger('#endpoints/PAM');
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

    if (!callback) return this._l.error('Missing Callback');

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
    signInput += utils._get_pam_sign_input_from_params(params);

    params.signature = this.crypto.HMACSHA256(signInput);

    this.networking.GET(params, endpointConfig, (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);

      let channelsResponse = {};
      let channelGroupsResponse = {};

      // grant to singular channel
      if (channels.length === 1 && channelGroups.length === 0) {
        channelsResponse[payload.payload.channel] = payload.payload.auths;
      }

      // grant to singular channel groups
      if (channelGroups.length === 1 && channels.length === 0) {
        channelGroupsResponse[payload.payload['channel-groups']] = payload.payload.auths;
      }

      if (channels.length > 1) {
        Object.keys(payload.payload.channels).forEach((channelName) => {
          channelsResponse[channelName] = payload.payload.channels[channelName].auths;
        });
      }

      if (channelGroups.length > 1) {
        Object.keys(payload.payload['channel-groups']).forEach((channelGroupName) => {
          channelGroupsResponse[channelGroupName] = payload.payload['channel-groups'][channelGroupName].auths;
        });
      }

      const response: grantResponse = {
        ttl: payload.payload.ttl,
        level: payload.payload.level,
        subscribeKey: payload.payload.subscribe_key,
        channels: channelsResponse,
        channelGroups: channelGroupsResponse
      };

      callback(status, response);
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
    signInput += utils._get_pam_sign_input_from_params(params);

    params.signature = this.crypto.HMACSHA256(signInput);

    this.networking.GET(params, endpointConfig, (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);

      const response: auditResponse = {

      };

      callback(status, response);
    });
  }

}
