/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import State from '../components/state';

import Responders from '../presenters/responders';
import Logger from '../components/logger';

import utils from '../utils';
import constants from '../../../defaults.json';

import { callbackStruct } from '../../../flow_interfaces';

type pubSubConstruct = {
  networking: Networking,
  state: State,
  config: Config,
};

type unsubscribeArguments = {
  channels: Array<string>,
  channelGroups: Array<string>;
}

export default class {
  _networking: Networking;
  _config: Config;
  _state: State;
  _callbacksConstruct: callbackStruct;

  _r: Responders;
  _l: Logger;

  _subscribeIntervalId: number | null;

  constructor({ networking, config, state, callbacks }: pubSubConstruct) {
    this._networking = networking;
    this._config = config;
    this._state = state;
    this._callbacks = callbacks;

    this._r = new Responders('#endpoints/subscribe');
    this._l = Logger.getLogger('#endpoints/subscribe');
  }

  unsubscribe(args: unsubscribeArguments) {
    let { onStatus } = this._callbacks;
    let { channels = [], channelGroups = [] } = args;
    let existingChannels = []; // matching channels to unsubscribe
    let existingChannelGroups = []; // matching channel groups to unsubscribe
    let data = {};

    // Make sure we have a Channel
    if (!onStatus) {
      return this._l.error('Missing onStatus Callback');
    }

    if (channels.length === 0 && channelGroups.length === 0) {
      return onStatus(this._r.validationError('Missing Channel or Channel Group'));
    }

    if (channels) {
      channels.forEach((channel) => {
        if (this._state.containsChannel(channel)) {
          existingChannels.push(channel);
        }
      });
    }

    if (channelGroups) {
      channelGroups.forEach((channelGroup) => {
        if (this._state.containsChannelGroup(channelGroup)) {
          existingChannelGroups.push(channelGroup);
        }
      });
    }

    // if NO channels && channel groups to unsubscribe, trigger a callback
    if (existingChannels.length === 0 && existingChannelGroups.length === 0) {
      return onStatus(this._r.validationError('already unsubscribed from all channel / channel groups'));
    }

    let stringifiedChannelParam = existingChannels.length > 0 ? existingChannels.join(',') : ',';

    if (existingChannelGroups.length > 0) {
      data['channel-group'] = existingChannelGroups.join(',');
    }

    this._networking.performLeave(stringifiedChannelParam, data, (err, response) => {
      if (err) return onStatus(err, null);

      this._postUnsubscribeCleanup(existingChannels, existingChannelGroups);
      this._state.setSubscribeTimeToken(0);
      this._state.announceSubscriptionChange();
      onStatus(null, { action: 'unsubscribe', status: 'finished', response });
    });
  }

  _postUnsubscribeCleanup(channels: Array<string>, channelGroups: Array<string>) {
    channels.forEach((channel) => {
      this._state.removeChannel(channel);
      this._state.removeFromPresenceState(channel + constants.PRESENCE_SUFFIX);
    });

    channelGroups.forEach((channelGroup) => {
      this._state.removeChannelGroup(channelGroup);
      this._state.removeFromPresenceState(channelGroup + constants.PRESENCE_SUFFIX);
    });
  }

  subscribe() {
    // NO-OP
  }

  /*
  subscribe(args: subscribeArguments, callback: Function) {
    let channel = args.channel;
    let channelGroup = args.channel_group;
    let timetoken = args.timetoken || 0;
    let cipherKey = args.cipher_key;

    let sub_timeout = args.timeout || SUB_TIMEOUT;
    let windowing = args.windowing || SUB_WINDOWING;

    // Make sure we have a Channel
    if (!channel && !channelGroup) {
      return this._error('Missing Channel');
    }

    if (!subscribeCallback) {
      return this._error('Missing Callback');
    }
    if (!this._keychain.getSubscribeKey()) {
      return this._error('Missing Subscribe Key');
    }

    // Setup Channel(s)
    if (channel) {
      let channelList = (channel.join ? channel.join(',') : '' + channel).split(',');
      utils.each(channelList, (channel) => {
        this.__subscribeToChannel(channel, cipherKey, subscribeCallback, presenceCallback);
      });
    }

    // Setup Channel Groups
    if (channelGroup) {
      let ChannelGroupList = (channelGroup.join ? channelGroup.join(',') : '' + channelGroup).split(',');
      utils.each(ChannelGroupList, (channelGroup) => {
        this.__subscribeToChannelGroup(channelGroup, cipherKey, subscribeCallback, presenceCallback);
      });
    }
  }
  */

  __restartSubscribeLoop() {
    let channels = this._state.generate_channel_list().join(',');
    let channel_groups = stateStorage.generate_channel_group_list().join(',');

    // Stop Connection
    if (!channels && !channel_groups) return;

    if (!channels) channels = ',';

    // Connect to PubNub Subscribe Servers
    _reset_offline();

    let data = networking.prepareParams({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() });

    if (channel_groups) {
      data['channel-group'] = channel_groups;
    }


    let st = JSON.stringify(stateStorage.getPresenceState());
    if (st.length > 2) data['state'] = JSON.stringify(stateStorage.getPresenceState());

    if (config.getPresenceTimeout()) {
      data['heartbeat'] = config.getPresenceTimeout();
    }

    if (config.isInstanceIdEnabled()) {
      data['instanceid'] = keychain.getInstanceId();
    }

    SUB_RECEIVER = xdr({
      timeout: sub_timeout,
      fail: function (response) {
        if (response && response['error'] && response['service']) {
          Responders.error(response, SUB_ERROR);
          _test_connection(false);
        } else {
          SELF['time'](function (success) {
            !success && (Responders.error(response, SUB_ERROR));
            _test_connection(success);
          });
        }
      },
      data: networking.prepareParams(data),
      url: [
        networking.getSubscribeOrigin(), 'subscribe',
        keychain.getSubscribeKey(), utils.encode(channels),
        0, TIMETOKEN
      ],
      success: function (messages) {
        // Check for Errors
        if (!messages || (typeof messages == 'object' && 'error' in messages && messages['error'])) {
          SUB_ERROR(messages);
          return utils.timeout(CONNECT, constants.SECOND);
        }

        // Restore Previous Connection Point if Needed
        TIMETOKEN = !TIMETOKEN && SUB_RESTORE && db['get'](keychain.getSubscribeKey()) || messages[1];

        /*
         // Connect
         each_channel_registry(function(registry){
         if (registry.connected) return;
         registry.connected = 1;
         registry.connect(channel.name);
         });
         */

        // Route Channel <---> Callback for Message
        /*
        var next_callback = (function () {
          var channels = '';
          var channels2 = '';

          if (messages.length > 3) {
            channels = messages[3];
            channels2 = messages[2];
          } else if (messages.length > 2) {
            channels = messages[2];
          } else {
            channels = utils.map(
              this._state.getChannels(), function (chan) {
                return utils.map(
                  Array(messages[0].length)
                    .join(',').split(','),
                  function () {
                    return chan;
                  }
                );
              }).join(',');
          }

          var list = channels.split(',');
          var list2 = (channels2) ? channels2.split(',') : [];

          return function () {
            var channel = list.shift() || SUB_CHANNEL;
            var channel2 = list2.shift();

            var chobj = {};

            if (channel2) {
              if (channel && channel.indexOf('-pnpres') >= 0
                && channel2.indexOf('-pnpres') < 0) {
                channel2 += '-pnpres';
              }
              chobj = stateStorage.getChannelGroup(channel2) || stateStorage.getChannel(channel2) || { callback: function () {} };
            } else {
              chobj = stateStorage.getChannel(channel);
            }

            var r = [
              chobj
                .callback || SUB_CALLBACK,
              channel.split(constants.PRESENCE_SUFFIX)[0],
            ];
            channel2 && r.push(channel2.split(constants.PRESENCE_SUFFIX)[0]);
            return r;
          };
        })();
        */

        let latency = utils.detect_latency(+messages[1]);
        utils.each(messages[0], function (msg) {
          var next = next_callback();
          var decrypted_msg = decrypt(msg,
            (stateStorage.getChannel(next[1])) ? stateStorage.getChannel(next[1])['cipher_key'] : null);
          next[0] && next[0](decrypted_msg, messages, next[2] || next[1], latency, next[1]);
        });

        utils.timeout(_connect, windowing);
      },
    });
  }

  __subscribeToChannel(channelName: string, cipherKey: string, subscribeCallback: Function, presenceCallback: Function) {
    this._state.addChannel(channelName, {
      name: channelName,
      subscribed: 1,
      callback: subscribeCallback,
      cipher_key: cipherKey,
    });

    // Presence Enabled?
    if (!presenceCallback) {
      return;
    }

    this._state.addChannel(channelName, {
      name: channelName + constants.PRESENCE_SUFFIX,
      subscribed: 1,
      callback: presenceCallback,
    });
  }

  __subscribeToChannelGroup(channelGroupName: string, cipherKey: string, subscribeCallback: Function, presenceCallback: Function) {
    this._state.addChannelGroup(channelGroupName, {
      name: channelGroupName,
      subscribed: 1,
      callback: subscribeCallback,
      cipher_key: cipherKey,
    });

    // Presence Enabled?
    if (!presenceCallback) {
      return;
    }

    this._state.addChannel(channelGroupName, {
      name: channelGroupName + constants.PRESENCE_SUFFIX,
      subscribed: 1,
      callback: presenceCallback,
    });
  }

}
