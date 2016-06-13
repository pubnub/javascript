'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _subscribe = require('../endpoints/subscribe');

var _subscribe2 = _interopRequireDefault(_subscribe);

var _presence = require('../endpoints/presence');

var _presence2 = _interopRequireDefault(_presence);

var _cryptography = require('../components/cryptography');

var _cryptography2 = _interopRequireDefault(_cryptography);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _flow_interfaces = require('../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var subscribeEndpoints = _ref.subscribeEndpoints;
    var presenceEndpoints = _ref.presenceEndpoints;
    var config = _ref.config;
    var crypto = _ref.crypto;

    _classCallCheck(this, _class);

    this._channels = {};
    this._presenceChannels = {};

    this._channelGroups = {};
    this._presenceChannelGroups = {};

    this._config = config;
    this._subscribeEndpoints = subscribeEndpoints;
    this._presenceEndpoints = presenceEndpoints;
    this._crypto = crypto;

    this._timetoken = 0;

    this._listeners = [];
  }

  _createClass(_class, [{
    key: 'adaptStateChange',
    value: function adaptStateChange() {}
  }, {
    key: 'adaptSubscribeChange',
    value: function adaptSubscribeChange(args) {
      var _this = this;

      var timetoken = args.timetoken;
      var _args$channels = args.channels;
      var channels = _args$channels === undefined ? [] : _args$channels;
      var _args$channelGroups = args.channelGroups;
      var channelGroups = _args$channelGroups === undefined ? [] : _args$channelGroups;
      var _args$withPresence = args.withPresence;
      var withPresence = _args$withPresence === undefined ? false : _args$withPresence;


      if (timetoken) this._timetoken = timetoken;

      channels.forEach(function (channel) {
        _this._channels[channel] = true;
        if (withPresence) _this._presenceChannels[channel] = true;
      });

      channelGroups.forEach(function (channelGroup) {
        _this._channelGroups[channelGroup] = true;
        if (withPresence) _this._presenceChannelGroups[channelGroup] = true;
      });

      this.reconnect();
    }
  }, {
    key: 'adaptUnsubscribeChange',
    value: function adaptUnsubscribeChange(args) {
      var _this2 = this;

      var _args$channels2 = args.channels;
      var channels = _args$channels2 === undefined ? [] : _args$channels2;
      var _args$channelGroups2 = args.channelGroups;
      var channelGroups = _args$channelGroups2 === undefined ? [] : _args$channelGroups2;


      channels.forEach(function (channel) {
        if (channel in _this2._channels) delete _this2._channels[channel];
        if (channel in _this2._presenceChannels) delete _this2._presenceChannels[channel];
      });

      channelGroups.forEach(function (channelGroup) {
        if (channelGroup in _this2._channelGroups) delete _this2._channelGroups[channelGroup];
        if (channelGroup in _this2._presenceChannelGroups) delete _this2._channelGroups[channelGroup];
      });

      this._presenceEndpoints.leave({ channels: channels, channelGroups: channelGroups }, function (status, payload) {
        console.log('unsubscribe result', status, payload);
      });

      this.reconnect();
    }
  }, {
    key: 'addListener',
    value: function addListener(newListeners) {
      this._listeners.push(newListeners);
    }
  }, {
    key: 'removeListener',
    value: function removeListener(deprecatedListeners) {
      var listenerPosition = this._listeners.indexOf(deprecatedListeners);
      if (listenerPosition > -1) this._listeners = this._listeners.splice(listenerPosition, 1);
    }
  }, {
    key: 'reconnect',
    value: function reconnect() {
      this._startSubscribeLoop();
    }
  }, {
    key: '_startSubscribeLoop',
    value: function _startSubscribeLoop() {
      var _this3 = this;

      this._stopSubscribeLoop();
      var channels = [];
      var channelGroups = [];

      Object.keys(this._channels).forEach(function (channel) {
        return channels.push(channel);
      });
      Object.keys(this._presenceChannels).forEach(function (channel) {
        return channels.push(channel + '-pnpres');
      });

      Object.keys(this._channelGroups).forEach(function (channelGroup) {
        return channelGroups.push(channelGroup);
      });
      Object.keys(this._presenceChannelGroups).forEach(function (channelGroup) {
        return channelGroups.push(channelGroup + '-pnpres');
      });

      this._subscribeCall = this._subscribeEndpoints.subscribe({ channels: channels, channelGroups: channelGroups,
        timetoken: this._timetoken,
        filterExpression: this._config.filterExpression,
        region: this._region
      }, function (status, payload) {
        if (status.error) {
          console.log("subscribe tanked");
          _this3._startSubscribeLoop();
          return;
        }

        payload.messages.forEach(function (message) {
          var channel = message.channel;
          var subscriptionMatch = message.subscriptionMatch;
          var publishMetaData = message.publishMetaData;

          if (channel === subscriptionMatch) {
            subscriptionMatch = null;
          }

          if (_utils2.default.endsWith(message.channel, '-pnpres')) {
            var announce = {};
            announce.actualChannel = subscriptionMatch != null ? channel : null;
            announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;

            announce.timetoken = publishMetaData.publishTimetoken;
            announce.occupancy = message.payload.occupancy;
            announce.uuid = message.payload.uuid;
            announce.timestamp = message.payload.timestamp;
            _this3._announcePresence(announce);
          } else {
            var _announce = {};
            _announce.actualChannel = subscriptionMatch != null ? channel : null;
            _announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
            _announce.timetoken = publishMetaData.publishTimetoken;

            if (_this3._config.cipherKey) {
              _announce.message = _this3._crypto.decrypt(message.payload);
            } else {
                _announce.message = message.payload;
              }

            _this3._announceMessage(_announce);
          }
        });

        _this3._region = payload.metadata.region;
        _this3._timetoken = payload.metadata.timetoken;
        _this3._startSubscribeLoop();
      });
    }
  }, {
    key: '_stopSubscribeLoop',
    value: function _stopSubscribeLoop() {}
  }, {
    key: '_announcePresence',
    value: function _announcePresence(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.presence) listener.presence(announce);
      });
    }
  }, {
    key: '_announceStatus',
    value: function _announceStatus(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.status) listener.status(announce);
      });
    }
  }, {
    key: '_announceMessage',
    value: function _announceMessage(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.message) listener.message(announce);
      });
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];