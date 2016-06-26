/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Crypto from '../components/cryptography/index';
import BaseEndpoint from './base.js';
import { EndpointDefinition, StatusStruct } from '../flow_interfaces';

type HistoryConstruct = {
  networking: Networking,
  crypto: Crypto,
  config: Config
};

type FetchHistoryArguments = {
  channel: string, // fetch history from a channel
  channelGroup: string, // fetch history from channel groups
  start: number, // start timetoken for history fetching
  end: number, // end timetoken for history feting
  includeTimetoken: boolean, // include time token for each history call
  reverse: boolean,
  count: number
}

type HistoryItem = {
  timetoken: number | null,
  entry: any,
}

type HistoryResponse = {
  messages: Array<HistoryItem>,
  startTimeToken: number,
  endTimeToken: number,
}

export default class extends BaseEndpoint {
  networking: Networking;
  crypto: Crypto;
  config: Config;

  constructor({ networking, crypto, config }: HistoryConstruct) {
    super({ config });
    this.networking = networking;
    this.crypto = crypto;
    this.config = config;
  }

  fetch(args: FetchHistoryArguments, callback: Function) {
    const { channel, start, end, includeTimetoken, reverse, count = 100 } = args;

    const endpointConfig: EndpointDefinition = {
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
    this.networking.GET(params, endpointConfig, (status: StatusStruct, payload: Object) => {
      if (status.error) return callback(status);

      callback(status, this._parseResponse(payload, includeTimetoken));
    });
  }

  _parseResponse(payload: Object, includeTimetoken: boolean): HistoryResponse {
    const response: HistoryResponse = {
      messages: [],
      startTimeToken: parseInt(payload[1], 10),
      endTimeToken: parseInt(payload[2], 10),
    };

    payload[0].forEach((serverHistoryItem) => {
      const item: HistoryItem = {
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

  __processMessage(message: Object): Object | null {
    if (!this.config.cipherKey) return message;

    try {
      return this.crypto.decrypt(message);
    } catch (e) {
      return message;
    }
  }

}
