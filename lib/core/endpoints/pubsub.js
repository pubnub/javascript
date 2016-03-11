'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _responders = require('./presenters/responders');

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
    key: '__publish',
    value: function __publish(next) {
      if (NO_WAIT_FOR_PENDING) {
        if (!PUB_QUEUE.length) return;
      } else {
        if (next) PUB_QUEUE.sending = 0;
        if (PUB_QUEUE.sending || !PUB_QUEUE.length) return;
        PUB_QUEUE.sending = 1;
      }

      xdr(PUB_QUEUE.shift());
    }
  }, {
    key: 'performPublish',
    value: function performPublish(args, argCallback) {
      var _this = this;

      var msg = args.message;
      if (!msg) return this._error('Missing Message');

      var callback = argCallback || args.callback || function () {};
      var channel = args.channel;
      var authKey = args.auth_key || this._keychain.getAuthKey();
      var cipher_key = args.cipher_key;
      var err = args.error || function () {};
      var post = args.post || false;
      var store = args.store_in_history || true;
      var params = {
        uuid: this._keychain.getUUID(),
        auth: authKey
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

      var publishItem = this._publishQueue.createQueueable();
      publishItem.channel = channel;
      publishItem.params = params;
      publishItem.httpMethod = post ? 'POST' : 'GET';
      publishItem.onFail = function (response) {
        _responders2.default.error(response, err);
        _this.__publish(true);
      };
      publishItem.onSuccess = function (response) {
        _responders2.default.callback(response, callback, err);
        _this.__publish(true);
      };

      // Queue Message Send
      this._publishQueue.queuePublishItem(publishItem);

      // Send Message
      this.__publish(false);
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

        this._presence.performChannelLeave(existingChannels.join(','), authKey, callback, err);
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

        this._presence.performChannelGroupLeave(existingChannelGroups.join(','), authKey, callback, err);
      }
    }
  }]);

  return _class;
}();

exports.default = _class;