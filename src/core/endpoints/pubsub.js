/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import Keychain from '../components/keychain';
import State from '../components/state';
import PublishQueue from '../components/publish_queue';

import PresenceEndpoints from './presence';

import Responders from './presenters/responders';

import utils from '../utils';
import constants from '../../../defaults.json';

type pubSubConstruct = {
  networking: Networking,
  state: State,
  keychain: Keychain,
  error: Function,
  config: Config,
  publishQueue: PublishQueue,
  presenceEndpoints: PresenceEndpoints,
};

export default class {
  _networking: Networking;
  _config: Config;
  _state: State;
  _keychain: Keychain;
  _presence: PresenceEndpoints;
  _error: Function;
  _publishQueue: PublishQueue;

  constructor({ networking, config, keychain, presenceEndpoints, publishQueue, state, error }: pubSubConstruct) {
    this._networking = networking;
    this._config = config;
    this._keychain = keychain;
    this._state = state;
    this._error = error;
    this._presence = presenceEndpoints;
    this._publishQueue = publishQueue;
  }

  __publish(next: boolean) {
    if (NO_WAIT_FOR_PENDING) {
      if (!PUB_QUEUE.length) return;
    } else {
      if (next) PUB_QUEUE.sending = 0;
      if (PUB_QUEUE.sending || !PUB_QUEUE.length) return;
      PUB_QUEUE.sending = 1;
    }

    xdr(PUB_QUEUE.shift());
  }

  performPublish(args:Object, argCallback: Function) {
    var msg = args.message;
    if (!msg) return this._error('Missing Message');

    var callback = argCallback || args.callback || function () {};
    var channel = args.channel;
    var authKey = args.auth_key || this._keychain.getAuthKey();
    var cipher_key = args.cipher_key;
    var err = args.error || function () {};
    var post = args.post || false;
    var store = args.store_in_history || true;
    var params: Object = {
      uuid: this._keychain.getUUID(),
      auth: authKey,
    };

    if (!channel) return this._error('Missing Channel');
    if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
    if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

    if (msg['getPubnubMessage']) {
      msg = msg['getPubnubMessage']();
    }

    // If trying to send Object
    msg = JSON.stringify(encrypt(msg, cipher_key));

    if (!store) {
      params.store = '0';
    }

    if (this._config.isInstanceIdEnabled()) {
      params.instanceid = this._keychain.getInstanceId();
    }

    let publishItem = this._publishQueue.createQueueable();
    publishItem.channel = channel;
    publishItem.params = params;
    publishItem.httpMethod = (post) ? 'POST' : 'GET';
    publishItem.onFail = (response) => {
      Responders.error(response, err);
      this.__publish(true);
    };
    publishItem.onSuccess = (response) => {
      Responders.callback(response, callback, err);
      this.__publish(true);
    };

    // Queue Message Send
    this._publishQueue.queuePublishItem(publishItem);

    // Send Message
    this.__publish(false);
  }

  performUnsubscribe(args: Object, argCallback: Function) {
    var channelArg = args['channel'];
    var channelGroupArg = args['channel_group'];
    var authKey = args.auth_key || this._keychain.getAuthKey();
    var callback = argCallback || args.callback || function () {};
    var err = args.error || function () {};

    if (!channelArg && !channelGroupArg) {
      return this._error('Missing Channel or Channel Group');
    }

    if (!this._keychain.getSubscribeKey()) {
      return this._error('Missing Subscribe Key');
    }

    if (channelArg) {
      var channels = utils.isArray(channelArg) ? channelArg : ('' + channelArg).split(',');
      var existingChannels = [];
      var presenceChannels = [];

      utils.each(channels, function (channel) {
        if (this._state.getChannel(channel)) {
          existingChannels.push(channel);
        }
      });

      // if we do not have any channels to unsubscribe from, trigger a callback.
      if (existingChannels.length === 0) {
        callback({ action: 'leave' });
        return;
      }

      // Prepare presence channels
      utils.each(existingChannels, function (channel) {
        presenceChannels.push(channel + constants.PRESENCE_SUFFIX);
      });

      utils.each(existingChannels.concat(presenceChannels), function (channel) {
        if (this._state.containsChannel(channel)) {
          this._state.removeChannel(channel);
        }

        if (this._state.isInPresenceState(channel)) {
          this._state.removeFromPresenceState(channel);
        }
      });

      this._presence.performChannelLeave(existingChannels.join(','), authKey, callback, err);
    }

    if (channelGroupArg) {
      var channelGroups = utils.isArray(channelGroupArg) ? channelGroupArg : ('' + channelGroupArg).split(',');
      var existingChannelGroups = [];
      var presenceChannelGroups = [];

      utils.each(channelGroups, function (channelGroup) {
        if (this._state.getChannelGroup(channelGroup)) {
          existingChannelGroups.push(channelGroup);
        }
      });

      // if we do not have any channel groups to unsubscribe from, trigger a callback.
      if (existingChannelGroups.length === 0) {
        callback({ action: 'leave' });
        return;
      }

      // Prepare presence channels
      utils.each(existingChannelGroups, function (channelGroup) {
        presenceChannelGroups.push(channelGroup + constants.PRESENCE_SUFFIX);
      });

      utils.each(existingChannelGroups.concat(presenceChannelGroups), function (channelGroup) {
        if (this._state.containsChannelGroup(channelGroup)) {
          this._state.removeChannelGroup(channelGroup);
        }
        if (this._state.isInPresenceState(channelGroup)) {
          this._state.removeFromPresenceState(channelGroup);
        }
      });

      this._presence.performChannelGroupLeave(existingChannelGroups.join(','), authKey, callback, err);
    }
  }

}
