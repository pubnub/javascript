/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Crypto from '../components/cryptography/index';
import BaseEndpoint from './base.js';

import { endpointDefinition, statusStruct } from '../flow_interfaces';

type publishConstruct = {
  networking: Networking,
  config: Config,
  crypto: Crypto
};

type publishResponse = {
  timetoken: number
};

type publishArguments = {
  message: Object | string | number | boolean, // the contents of the dispatch
  channel: string, // the destination of our dispatch
  sendByPost: boolean | null, // use POST when dispatching the message
  storeInHistory: boolean | null, // store the published message in remote history
  meta: Object, // psv2 supports filtering by metadata
  replicate: boolean | null // indicates to server on replication status to other data centers.
}

export default class extends BaseEndpoint {
  networking: Networking;
  config: Config;
  crypto: Crypto;

  constructor({ networking, config, crypto }: publishConstruct) {
    super({ config });
    this.networking = networking;
    this.config = config;
    this.crypto = crypto;
  }

  fire(args: publishArguments, callback: Function) {
    args.replicate = false;
    args.storeInHistory = false;
    this.publish(args, callback);
  }

  publish(args: publishArguments, callback: Function) {
    const { message, channel, meta, sendByPost = false, replicate = true, storeInHistory } = args;
    const endpointConfig: endpointDefinition = {
      params: {
        authKey: { required: false },
        subscribeKey: { required: true },
        publishKey: { required: true },
        uuid: { required: false }
      },
      url: '/publish/' + this.config.publishKey + '/' + this.config.subscribeKey + '/0/' + encodeURIComponent(channel) + '/0'
    };

    if (!message) return callback(this.createValidationError('Missing Message'));
    if (!channel) return callback(this.createValidationError('Missing Channel'));

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }
    // create base params
    const params = this.createBaseParams(endpointConfig);

    if (storeInHistory != null) {
      if (storeInHistory) {
        params.store = '1';
      } else {
        params.store = '0';
      }
    }

    if (replicate === false) {
      params.norep = 'true';
    }

    if (meta && typeof meta === 'object') {
      params.meta = JSON.stringify(meta);
    }

    let onCallback = (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);

      let response: publishResponse = {
        timetoken: payload[2]
      };

      callback(status, response);
    };

    let stringifiedPayload = JSON.stringify(message);

    if (this.config.cipherKey) {
      stringifiedPayload = this.crypto.encrypt(stringifiedPayload);
      stringifiedPayload = JSON.stringify(stringifiedPayload);
    }

    if (sendByPost) {
      this.networking.POST(params, stringifiedPayload, endpointConfig, onCallback);
    } else {
      endpointConfig.url += '/' + encodeURIComponent(stringifiedPayload);
      this.networking.GET(params, endpointConfig, onCallback);
    }
  }
}
