/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Crypto from '../components/cryptography/index';
import BaseEndoint from './base.js';
import { endpointDefinition, statusStruct } from '../flow_interfaces';

type historyConstruct = {
  networking: Networking,
  crypto: Crypto,
  config: Config
};

type fetchHistoryArguments = {
  channel: string, // fetch history from a channel
  channelGroup: string, // fetch history from channel groups
  start: number, // start timetoken for history fetching
  end: number, // end timetoken for history feting
  includeTimetoken: boolean, // include time token for each history call
  reverse: boolean,
  count: number
}

type historyItem = {
  timetoken: number,
  entry: any,
}

type historyResponse = {
  messages: Array<historyItem>,
  startTimeToken: number,
  endTimeToken: number,
}

export default class extends BaseEndoint {
  networking: Networking;
  crypto: Crypto;
  config: Config;

  constructor({ networking, crypto, config }: historyConstruct) {
    super({ config });
    this.networking = networking;
    this.crypto = crypto;
    this.config = config;
  }

  fetch(args: fetchHistoryArguments, callback: Function) {
    const { channel, start, end, includeTimetoken, reverse, count = 100 } = args;

    const endpointConfig: endpointDefinition = {
      params: {
        authKey: { required: false },
        uuid: { required: false },
        subscribeKey: { required: true }
      },
      url: '/v2/history/sub-key/' + this.config.subscribeKey + '/channel/' + encodeURIComponent(channel)
    };

    if (!channel) return callback(this.createValidationError('Missing channel'));
    if (!callback) return this.log('Missing Callback');

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }
    // create base params
    const params = this.createBaseParams(endpointConfig);
    params.count = count;

    if (start) params.start = start;
    if (end) params.end = end;
    if (includeTimetoken != null) params.include_token = includeTimetoken.toString();
    if (reverse != null) params.reverse = reverse.toString();

    // Send Message
    this.networking.GET(params, endpointConfig, (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);

      callback(status, this._parseResponse(payload, includeTimetoken));
    });
  }

  _parseResponse(payload: Object, includeTimetoken: boolean): historyResponse {
    const response: historyResponse = {
      messages: [],
      startTimeToken: parseInt(payload[1], 10),
      endTimeToken: parseInt(payload[2], 10),
    };

    payload[0].forEach((serverHistoryItem) => {
      const item: historyItem = {
        timetoken: null,
        entry: null
      };

      if (includeTimetoken) {
        item.timetoken = serverHistoryItem.timetoken;
        item.entry = this.__processMessage(serverHistoryItem.message);
      } else {
        item.entry = this.__processMessage(serverHistoryItem);
      }

      response.messages.push(item);
    });

    return response;
  }

  __processMessage(message) {
    if (!this.config.cipherKey) return message;

    try {
      return this.crypto.decrypt(message);
    } catch (e) {
      return message;
    }
  }

}
