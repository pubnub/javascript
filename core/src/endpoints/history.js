/* @flow */

import Networking from '../components/networking';
import Keychain from '../components/keychain';
import Responders from '../presenters/responders';

type historyConstruct = {
  networking: Networking,
  keychain: Keychain,
  error: Function,
  decrypt: Function
};

export default class {
  _networking: Networking;
  _keychain: Keychain;
  _error: Function;
  _decrypt: Function;

  constructor({ networking, keychain, error, decrypt }: historyConstruct) {
    this._networking = networking;
    this._keychain = keychain;
    this._error = error;
    this._decrypt = decrypt;
  }

  fetchHistory(args: Object, argumentCallback: Function) {
    let callback = args.callback || argumentCallback;
    let count = args.count || args.limit || 100;
    let reverse = args.reverse || 'false';
    let err = args.error || function () {};
    let auth_key = args.auth_key || this._keychain.getAuthKey();
    let cipher_key = args.cipher_key;
    let channel = args.channel;
    let channel_group = args.channel_group;
    let start = args.start;
    let end = args.end;
    let include_token = args.include_token;
    let string_msg_token = args.string_message_token || false;

    // Make sure we have a Channel
    if (!channel && !channel_group) return this._error('Missing Channel');
    if (!callback) return this._error('Missing Callback');
    if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

    let params: Object = {
      stringtoken: 'true',
      count: count,
      reverse: reverse,
      auth: auth_key,
    };

    if (channel_group) {
      params['channel-group'] = channel_group;
      if (!channel) {
        channel = ',';
      }
    }

    if (start) params.start = start;
    if (end) params.end = end;
    if (include_token) params.include_token = 'true';
    if (string_msg_token) params.string_message_token = 'true';

    // Send Message
    this._networking.fetchHistory(channel, {
      data: this._networking.prepareParams(params),
      success: (response) => {
        this._handleHistoryResponse(response, err, callback, include_token, cipher_key);
      },
      fail: (response) => {
        Responders.error(response, err);
      },
    });
  }

  _handleHistoryResponse(response: Object, err: Function, callback: Function, include_token: boolean, cipher_key: string) {
    if (typeof response === 'object' && response.error) {
      err({ message: response.message, payload: response.payload });
      return;
    }
    let messages = response[0];
    let decrypted_messages = [];
    for (let a = 0; a < messages.length; a++) {
      if (include_token) {
        let new_message = this._decrypt(messages[a].message, cipher_key);
        let timetoken = messages[a].timetoken;
        try {
          decrypted_messages.push({ message: JSON.parse(new_message), timetoken: timetoken });
        } catch (e) {
          decrypted_messages.push(({ message: new_message, timetoken: timetoken }));
        }
      } else {
        let new_message = this._decrypt(messages[a], cipher_key);
        try {
          decrypted_messages.push(JSON.parse(new_message));
        } catch (e) {
          decrypted_messages.push((new_message));
        }
      }
    }
    callback([decrypted_messages, response[1], response[2]]);
  }

}
