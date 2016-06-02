/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Crypto from '../components/cryptography/index';
import Logger from '../components/logger';
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
  includeToken: boolean, // include time token for each history call
}

export default class extends BaseEndoint {
  networking: Networking;
  crypto: Crypto;
  config: Config;
  _l: Logger;

  constructor({ networking, crypto, config }: historyConstruct) {
    super({ config });
    this.networking = networking;
    this.crypto = crypto;
    this.config = config;
    this._l = Logger.getLogger('#endpoints/history');
  }

  fetch(args: fetchHistoryArguments, callback: Function) {
    const { channel, start, end, includeToken, reverse, count = 100 } = args;

    const endpointConfig: endpointDefinition = {
      params: {
        authKey: { required: false },
        uuid: { required: false },
        subscribeKey: { required: true }
      },
      url: '/v2/history/sub-key/' + this.config.subscribeKey + '/channel/' + encodeURIComponent(channel)
    };

    if (!channel) return callback(this._r.validationError('Missing channel'));
    if (!callback) return this._l.error('Missing Callback');

    const params: Object = { count, reverse, stringtoken: 'true' };

    if (start) params.start = start;
    if (end) params.end = end;
    if (includeToken != null) params.include_token = includeToken.toString();
    if (reverse != null) params.reverse = reverse.toString();

    // Send Message
    this.networking.GET(params, endpointConfig, (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);

      console.log(status, payload);

      // callback(null, this._parseResponse(resp, includeToken));
    });
  }

  _parseResponse(response: Object, includeToken: boolean): Array<any> {
    const messages = response[0];
    const decryptedMessages = [];
    messages.forEach((payload) => {
      if (includeToken) {
        const decryptedMessage = this._crypto.decrypt(payload.message);
        const { timetoken } = payload;
        try {
          decryptedMessages.push({ timetoken, message: JSON.parse(decryptedMessage) });
        } catch (e) {
          decryptedMessages.push(({ timetoken, message: decryptedMessage }));
        }
      } else {
        const decryptedMessage = this._crypto.decrypt(payload);
        try {
          decryptedMessages.push(JSON.parse(decryptedMessage));
        } catch (e) {
          decryptedMessages.push(decryptedMessage);
        }
      }
    });
    return [decryptedMessages, response[1], response[2]];
  }
}
