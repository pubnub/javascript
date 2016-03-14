'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _keychain = require('../components/keychain');

var _keychain2 = _interopRequireDefault(_keychain);

var _state = require('../components/state');

var _state2 = _interopRequireDefault(_state);

var _publish_queue = require('../components/publish_queue');

var _publish_queue2 = _interopRequireDefault(_publish_queue);

var _presence = require('./presence');

var _presence2 = _interopRequireDefault(_presence);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _defaults = require('../../../defaults.json');

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var config = _ref.config;
    var keychain = _ref.keychain;
    var presenceEndpoints = _ref.presenceEndpoints;
    var publishQueue = _ref.publishQueue;
    var state = _ref.state;
    var error = _ref.error;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._config = config;
    this._keychain = keychain;
    this._state = state;
    this._error = error;
    this._presence = presenceEndpoints;
    this._publishQueue = publishQueue;
  }

  _createClass(_class, [{
    key: 'subscribe',
    value: function subscribe(args, subscribeCallback, presenceCallback) {
      var _this = this;

      var channel = args.channel;
      var channelGroup = args.channel_group;
      var timetoken = args.timetoken || 0;
      var cipherKey = args.cipher_key;

      var sub_timeout = args.timeout || SUB_TIMEOUT;
      var windowing = args.windowing || SUB_WINDOWING;

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
        var channelList = (channel.join ? channel.join(',') : '' + channel).split(',');
        _utils2.default.each(channelList, function (channel) {
          _this.__subscribeToChannel(channel, cipherKey, subscribeCallback, presenceCallback);
        });
      }

      // Setup Channel Groups
      if (channelGroup) {
        var ChannelGroupList = (channelGroup.join ? channelGroup.join(',') : '' + channelGroup).split(',');
        _utils2.default.each(ChannelGroupList, function (channelGroup) {
          _this.__subscribeToChannelGroup(channelGroup, cipherKey, subscribeCallback, presenceCallback);
        });
      }
    }
  }, {
    key: '__restartSubscribeLoop',
    value: function __restartSubscribeLoop() {
      var channels = this._state.generate_channel_list().join(',');
      var channel_groups = stateStorage.generate_channel_group_list().join(',');

      // Stop Connection
      if (!channels && !channel_groups) return;

      if (!channels) channels = ',';

      // Connect to PubNub Subscribe Servers
      _reset_offline();

      var data = networking.prepareParams({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() });

      if (channel_groups) {
        data['channel-group'] = channel_groups;
      }

      var st = JSON.stringify(stateStorage.getPresenceState());
      if (st.length > 2) data['state'] = JSON.stringify(stateStorage.getPresenceState());

      if (config.getPresenceTimeout()) {
        data['heartbeat'] = config.getPresenceTimeout();
      }

      if (config.isInstanceIdEnabled()) {
        data['instanceid'] = keychain.getInstanceId();
      }

      SUB_RECEIVER = xdr({
        timeout: sub_timeout,
        fail: function fail(response) {
          if (response && response['error'] && response['service']) {
            _responders2.default.error(response, SUB_ERROR);
            _test_connection(false);
          } else {
            SELF['time'](function (success) {
              !success && _responders2.default.error(response, SUB_ERROR);
              _test_connection(success);
            });
          }
        },
        data: networking.prepareParams(data),
        url: [networking.getSubscribeOrigin(), 'subscribe', keychain.getSubscribeKey(), _utils2.default.encode(channels), 0, TIMETOKEN],
        success: function success(messages) {
          // Check for Errors
          if (!messages || (typeof messages === 'undefined' ? 'undefined' : _typeof(messages)) == 'object' && 'error' in messages && messages['error']) {
            SUB_ERROR(messages);
            return _utils2.default.timeout(CONNECT, _defaults2.default.SECOND);
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

          var latency = _utils2.default.detect_latency(+messages[1]);
          _utils2.default.each(messages[0], function (msg) {
            var next = next_callback();
            var decrypted_msg = decrypt(msg, stateStorage.getChannel(next[1]) ? stateStorage.getChannel(next[1])['cipher_key'] : null);
            next[0] && next[0](decrypted_msg, messages, next[2] || next[1], latency, next[1]);
          });

          _utils2.default.timeout(_connect, windowing);
        }
      });
    }
  }, {
    key: '__subscribeToChannel',
    value: function __subscribeToChannel(channelName, cipherKey, subscribeCallback, presenceCallback) {
      this._state.addChannel(channelName, {
        name: channelName,
        subscribed: 1,
        callback: subscribeCallback,
        cipher_key: cipherKey
      });

      // Presence Enabled?
      if (!presenceCallback) {
        return;
      }

      this._state.addChannel(channelName, {
        name: channelName + _defaults2.default.PRESENCE_SUFFIX,
        subscribed: 1,
        callback: presenceCallback
      });
    }
  }, {
    key: '__subscribeToChannelGroup',
    value: function __subscribeToChannelGroup(channelGroupName, cipherKey, subscribeCallback, presenceCallback) {
      this._state.addChannelGroup(channelGroupName, {
        name: channelGroupName,
        subscribed: 1,
        callback: subscribeCallback,
        cipher_key: cipherKey
      });

      // Presence Enabled?
      if (!presenceCallback) {
        return;
      }

      this._state.addChannel(channelGroupName, {
        name: channelGroupName + _defaults2.default.PRESENCE_SUFFIX,
        subscribed: 1,
        callback: presenceCallback
      });
    }
  }, {
    key: 'performUnsubscribe',
    value: function performUnsubscribe(args, argCallback) {
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
        var channels = _utils2.default.isArray(channelArg) ? channelArg : ('' + channelArg).split(',');
        var existingChannels = [];
        var presenceChannels = [];

        _utils2.default.each(channels, function (channel) {
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
        _utils2.default.each(existingChannels, function (channel) {
          presenceChannels.push(channel + _defaults2.default.PRESENCE_SUFFIX);
        });

        _utils2.default.each(existingChannels.concat(presenceChannels), function (channel) {
          if (this._state.containsChannel(channel)) {
            this._state.removeChannel(channel);
          }

          if (this._state.isInPresenceState(channel)) {
            this._state.removeFromPresenceState(channel);
          }
        });

        this._presence.announceChannelLeave(existingChannels.join(','), authKey, callback, err);
      }

      if (channelGroupArg) {
        var channelGroups = _utils2.default.isArray(channelGroupArg) ? channelGroupArg : ('' + channelGroupArg).split(',');
        var existingChannelGroups = [];
        var presenceChannelGroups = [];

        _utils2.default.each(channelGroups, function (channelGroup) {
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
        _utils2.default.each(existingChannelGroups, function (channelGroup) {
          presenceChannelGroups.push(channelGroup + _defaults2.default.PRESENCE_SUFFIX);
        });

        _utils2.default.each(existingChannelGroups.concat(presenceChannelGroups), function (channelGroup) {
          if (this._state.containsChannelGroup(channelGroup)) {
            this._state.removeChannelGroup(channelGroup);
          }
          if (this._state.isInPresenceState(channelGroup)) {
            this._state.removeFromPresenceState(channelGroup);
          }
        });

        this._presence.announceChannelGroupLeave(existingChannelGroups.join(','), authKey, callback, err);
      }
    }
  }]);

  return _class;
}();

exports.default = _class;