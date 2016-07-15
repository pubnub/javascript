/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Crypto from '../components/cryptography/index';
import BaseEndpoint from './base.js';

import { EndpointDefinition, StatusAnnouncement } from '../flow_interfaces';

type PublishConstruct = {
  networking: Networking,
  config: Config,
  crypto: Crypto
};

type PublishResponse = {
  timetoken: number
};

type PublishArguments = {
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

  constructor({ networking, config, crypto }: PublishConstruct) {
    super({ config });
    this.networking = networking;
    this.config = config;
    this.crypto = crypto;
  }

  fire(args: PublishArguments, callback: Function) {
    args.replicate = false;
    args.storeInHistory = false;
    this.publish(args, callback);
  }

  publish(args: PublishArguments, callback: Function) {
    const { message, channel, meta, sendByPost = false, replicate = true, storeInHistory } = args;
    const endpointConfig: EndpointDefinition = {
      params: {
        authKey: { required: false },
        subscribeKey: { required: true },
        publishKey: { required: true }
      },
      url: '/publish/' + this.config.publishKey + '/' + this.config.subscribeKey + '/0/' + encodeURIComponent(channel) + '/0',
      operation: 'PNPublishOperation'
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

    let onCallback = (status: StatusAnnouncement, payload: Object) => {
      if (status.error) return callback(status);

      let response: PublishResponse = {
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
