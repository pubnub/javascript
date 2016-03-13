/* @flow */

import Networking from '../components/networking';
import Responders from '../presenters/responders';
import Logger from '../components/logger';

type historyConstruct = {
  networking: Networking,
  decrypt: Function
};

type fetchHistoryArguments = {
  channel: string, // fetch history from a channel
  channelGroup: string, // fetch history from channel groups
  cipherKey: string, // key required to decrypt history.
  start: number, // start timetoken for history fetching
  end: number, // end timetoken for history feting
  includeToken: boolean, // include time token for each history call
  stringMessageToken: boolean // TODO:
}

export default class {
  _networking: Networking;
  _decrypt: Function;
  _r: Responders;
  _l: Logger;

  constructor({ networking, decrypt }: historyConstruct) {
    this._networking = networking;
    this._decrypt = decrypt;
    this._r = new Responders('#endpoints/history');
    this._l = Logger.getLogger('#endpoints/history');
  }

  fetch(args: fetchHistoryArguments, callback: Function) {
    let { channel } = args;
    const { channelGroup, cipherKey, start, end, includeToken } = args;

    const count = args.count || args.limit || 100;
    const reverse = args.reverse || 'false';
    const stringMessageToken = args.stringMessageToken || false;

    if (!channel && !channelGroup) {
      return callback(this._r.validationError('Missing channel and/or channel group'));
    }

    if (!callback) {
      return this._l.error('Missing Callback');
    }

    const params: Object = { count, reverse, stringtoken: 'true' };

    if (channelGroup) {
      params['channel-group'] = channelGroup;
      if (!channel) {
        channel = ',';
      }
    }

    if (start) params.start = start;
    if (end) params.end = end;
    if (includeToken) params.include_token = 'true';
    if (stringMessageToken) params.string_message_token = 'true';

    // Send Message
    this._networking.fetchHistory(channel, params, (err, resp) => {
      if (err) return callback(err, null);
      callback(null, this._parseResponse(resp, includeToken, cipherKey));
    });
  }

  _parseResponse(response: Object, includeToken: boolean, cipherKey: string): Array<any> {
    const messages = response[0];
    const decryptedMessages = [];
    messages.forEach((payload) => {
      if (includeToken) {
        const decryptedMessage = this._decrypt(payload.message, cipherKey);
        const { timetoken } = payload;
        try {
          decryptedMessages.push({ timetoken, message: JSON.parse(decryptedMessage) });
        } catch (e) {
          decryptedMessages.push(({ timetoken, message: decryptedMessage }));
        }
      } else {
        const decryptedMessage = this._decrypt(payload, cipherKey);
        try {
          decryptedMessages.push(JSON.parse(decryptedMessage));
        } catch (e) {
          decryptedMessages.push((decryptedMessage));
        }
      }
    });
    return [decryptedMessages, response[1], response[2]];
  }
}
