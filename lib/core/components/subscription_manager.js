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
    value: function adaptStateChange(args, callback) {
      var _this = this;

      var state = args.state;
      var _args$channels = args.channels;
      var channels = _args$channels === undefined ? [] : _args$channels;
      var _args$channelGroups = args.channelGroups;
      var channelGroups = _args$channelGroups === undefined ? [] : _args$channelGroups;


      channels.forEach(function (channel) {
        if (channel in _this._channels) _this._channels[channel].state = state;
      });

      channelGroups.forEach(function (channelGroup) {
        if (channelGroup in _this._channelGroups) _this._channelGroups[channelGroup].state = state;
      });

      this._presenceEndpoints.setState({ state: state, channels: channels, channelGroups: channelGroups }, callback);
    }
  }, {
    key: 'adaptSubscribeChange',
    value: function adaptSubscribeChange(args) {
      var _this2 = this;

      var timetoken = args.timetoken;
      var _args$channels2 = args.channels;
      var channels = _args$channels2 === undefined ? [] : _args$channels2;
      var _args$channelGroups2 = args.channelGroups;
      var channelGroups = _args$channelGroups2 === undefined ? [] : _args$channelGroups2;
      var _args$withPresence = args.withPresence;
      var withPresence = _args$withPresence === undefined ? false : _args$withPresence;


      if (timetoken) this._timetoken = timetoken;

      channels.forEach(function (channel) {
        _this2._channels[channel] = { state: {} };
        if (withPresence) _this2._presenceChannels[channel] = {};
      });

      channelGroups.forEach(function (channelGroup) {
        _this2._channelGroups[channelGroup] = { state: {} };
        if (withPresence) _this2._presenceChannelGroups[channelGroup] = {};
      });

      this.reconnect();
    }
  }, {
    key: 'adaptUnsubscribeChange',
    value: function adaptUnsubscribeChange(args) {
      var _this3 = this;

      var _args$channels3 = args.channels;
      var channels = _args$channels3 === undefined ? [] : _args$channels3;
      var _args$channelGroups3 = args.channelGroups;
      var channelGroups = _args$channelGroups3 === undefined ? [] : _args$channelGroups3;


      channels.forEach(function (channel) {
        if (channel in _this3._channels) delete _this3._channels[channel];
        if (channel in _this3._presenceChannels) delete _this3._presenceChannels[channel];
      });

      channelGroups.forEach(function (channelGroup) {
        if (channelGroup in _this3._channelGroups) delete _this3._channelGroups[channelGroup];
        if (channelGroup in _this3._presenceChannelGroups) delete _this3._channelGroups[channelGroup];
      });

      this._presenceEndpoints.leave({ channels: channels, channelGroups: channelGroups }, function (status) {
        _this3._announceStatus(status);
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
      this._registerHeartbeatTimer();
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this._stopSubscribeLoop();
      this._stopHeartbeatTimer();
    }
  }, {
    key: '_registerHeartbeatTimer',
    value: function _registerHeartbeatTimer() {
      this._stopHeartbeatTimer();
      this._heartbeatTimer = setInterval(this._performHeartbeatLoop.bind(this), this._config.getPresenceAnnounceInterval() * 1000);
    }
  }, {
    key: '_stopHeartbeatTimer',
    value: function _stopHeartbeatTimer() {
      if (this._heartbeatTimer) {
        clearInterval(this._heartbeatTimer);
        this._heartbeatTimer = null;
      }
    }
  }, {
    key: '_performHeartbeatLoop',
    value: function _performHeartbeatLoop() {
      var _this4 = this;

      var presenceChannels = Object.keys(this._channels);
      var presenceChannelGroups = Object.keys(this._channelGroups);
      var presenceState = {};

      if (presenceChannels.length === 0 && presenceChannelGroups.length === 0) {
        return;
      }

      presenceChannels.forEach(function (channel) {
        var channelState = _this4._channels[channel].state;
        if (channelState) presenceState[channel] = channelState;
      });

      presenceChannelGroups.forEach(function (channelGroup) {
        var channelGroupState = _this4.channelGroup[channelGroup].state;
        if (channelGroupState) presenceState[channelGroup] = channelGroupState;
      });

      this._presenceEndpoints.heartbeat({
        channels: presenceChannels,
        channelGroups: presenceChannelGroups,
        state: presenceState }, function (status) {
        console.log(status);
      });
    }
  }, {
    key: '_startSubscribeLoop',
    value: function _startSubscribeLoop() {
      var _this5 = this;

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

      if (channels.length === 0 && channelGroups.length === 0) {
        return;
      }

      this._subscribeCall = this._subscribeEndpoints.subscribe({ channels: channels, channelGroups: channelGroups,
        timetoken: this._timetoken,
        filterExpression: this._config.filterExpression,
        region: this._region
      }, function (status, payload) {
        if (status.error) {
          _this5._startSubscribeLoop();
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
            _this5._announcePresence(announce);
          } else {
            var _announce = {};
            _announce.actualChannel = subscriptionMatch != null ? channel : null;
            _announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
            _announce.timetoken = publishMetaData.publishTimetoken;

            if (_this5._config.cipherKey) {
              _announce.message = _this5._crypto.decrypt(message.payload);
            } else {
                _announce.message = message.payload;
              }

            _this5._announceMessage(_announce);
          }
        });

        _this5._region = payload.metadata.region;
        _this5._timetoken = payload.metadata.timetoken;
        _this5._startSubscribeLoop();
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