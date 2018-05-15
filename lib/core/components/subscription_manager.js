'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cryptography = require('../components/cryptography');

var _cryptography2 = _interopRequireDefault(_cryptography);

var _config2 = require('../components/config');

var _config3 = _interopRequireDefault(_config2);

var _listener_manager = require('../components/listener_manager');

var _listener_manager2 = _interopRequireDefault(_listener_manager);

var _reconnection_manager = require('../components/reconnection_manager');

var _reconnection_manager2 = _interopRequireDefault(_reconnection_manager);

var _deduping_manager = require('../components/deduping_manager');

var _deduping_manager2 = _interopRequireDefault(_deduping_manager);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _flow_interfaces = require('../flow_interfaces');

var _categories = require('../constants/categories');

var _categories2 = _interopRequireDefault(_categories);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var subscribeEndpoint = _ref.subscribeEndpoint,
        leaveEndpoint = _ref.leaveEndpoint,
        heartbeatEndpoint = _ref.heartbeatEndpoint,
        setStateEndpoint = _ref.setStateEndpoint,
        timeEndpoint = _ref.timeEndpoint,
        config = _ref.config,
        crypto = _ref.crypto,
        listenerManager = _ref.listenerManager;

    _classCallCheck(this, _class);

    this._listenerManager = listenerManager;
    this._config = config;

    this._leaveEndpoint = leaveEndpoint;
    this._heartbeatEndpoint = heartbeatEndpoint;
    this._setStateEndpoint = setStateEndpoint;
    this._subscribeEndpoint = subscribeEndpoint;

    this._crypto = crypto;

    this._channels = {};
    this._presenceChannels = {};

    this._heartbeatChannels = {};
    this._heartbeatChannelGroups = {};

    this._channelGroups = {};
    this._presenceChannelGroups = {};

    this._pendingChannelSubscriptions = [];
    this._pendingChannelGroupSubscriptions = [];

    this._currentTimetoken = 0;
    this._lastTimetoken = 0;
    this._storedTimetoken = null;

    this._subscriptionStatusAnnounced = false;

    this._isOnline = true;

    this._reconnectionManager = new _reconnection_manager2.default({ timeEndpoint: timeEndpoint });
    this._dedupingManager = new _deduping_manager2.default({ config: config });
  }

  _createClass(_class, [{
    key: 'adaptStateChange',
    value: function adaptStateChange(args, callback) {
      var _this = this;

      var state = args.state,
          _args$channels = args.channels,
          channels = _args$channels === undefined ? [] : _args$channels,
          _args$channelGroups = args.channelGroups,
          channelGroups = _args$channelGroups === undefined ? [] : _args$channelGroups;


      channels.forEach(function (channel) {
        if (channel in _this._channels) _this._channels[channel].state = state;
      });

      channelGroups.forEach(function (channelGroup) {
        if (channelGroup in _this._channelGroups) _this._channelGroups[channelGroup].state = state;
      });

      return this._setStateEndpoint({ state: state, channels: channels, channelGroups: channelGroups }, callback);
    }
  }, {
    key: 'adaptPresenceChange',
    value: function adaptPresenceChange(args) {
      var _this2 = this;

      var connected = args.connected,
          _args$channels2 = args.channels,
          channels = _args$channels2 === undefined ? [] : _args$channels2,
          _args$channelGroups2 = args.channelGroups,
          channelGroups = _args$channelGroups2 === undefined ? [] : _args$channelGroups2;


      if (connected) {
        channels.forEach(function (channel) {
          _this2._heartbeatChannels[channel] = { state: {} };
        });

        channelGroups.forEach(function (channelGroup) {
          _this2._heartbeatChannelGroups[channelGroup] = { state: {} };
        });
      } else {
        channels.forEach(function (channel) {
          if (channel in _this2._heartbeatChannels) {
            delete _this2._heartbeatChannels[channel];
          }
        });

        channelGroups.forEach(function (channelGroup) {
          if (channelGroup in _this2._heartbeatChannelGroups) {
            delete _this2._heartbeatChannelGroups[channelGroup];
          }
        });

        if (this._config.suppressLeaveEvents === false) {
          this._leaveEndpoint({ channels: channels, channelGroups: channelGroups }, function (status) {
            _this2._listenerManager.announceStatus(status);
          });
        }
      }

      this.reconnect();
    }
  }, {
    key: 'adaptSubscribeChange',
    value: function adaptSubscribeChange(args) {
      var _this3 = this;

      var timetoken = args.timetoken,
          _args$channels3 = args.channels,
          channels = _args$channels3 === undefined ? [] : _args$channels3,
          _args$channelGroups3 = args.channelGroups,
          channelGroups = _args$channelGroups3 === undefined ? [] : _args$channelGroups3,
          _args$withPresence = args.withPresence,
          withPresence = _args$withPresence === undefined ? false : _args$withPresence,
          _args$withHeartbeats = args.withHeartbeats,
          withHeartbeats = _args$withHeartbeats === undefined ? true : _args$withHeartbeats;


      if (!this._config.subscribeKey || this._config.subscribeKey === '') {
        if (console && console.log) console.log('subscribe key missing; aborting subscribe');
        return;
      }

      if (timetoken) {
        this._lastTimetoken = this._currentTimetoken;
        this._currentTimetoken = timetoken;
      }

      if (this._currentTimetoken !== '0' && this._currentTimetoken !== 0) {
        this._storedTimetoken = this._currentTimetoken;
        this._currentTimetoken = 0;
      }

      channels.forEach(function (channel) {
        _this3._channels[channel] = { state: {} };
        if (withPresence) _this3._presenceChannels[channel] = {};
        if (withHeartbeats) _this3._heartbeatChannels[channel] = {};

        _this3._pendingChannelSubscriptions.push(channel);
      });

      channelGroups.forEach(function (channelGroup) {
        _this3._channelGroups[channelGroup] = { state: {} };
        if (withPresence) _this3._presenceChannelGroups[channelGroup] = {};
        if (withHeartbeats) _this3._heartbeatChannelGroups[channelGroup] = {};

        _this3._pendingChannelGroupSubscriptions.push(channelGroup);
      });

      this._subscriptionStatusAnnounced = false;
      this.reconnect();
    }
  }, {
    key: 'adaptUnsubscribeChange',
    value: function adaptUnsubscribeChange(args, isOffline) {
      var _this4 = this;

      var _args$channels4 = args.channels,
          channels = _args$channels4 === undefined ? [] : _args$channels4,
          _args$channelGroups4 = args.channelGroups,
          channelGroups = _args$channelGroups4 === undefined ? [] : _args$channelGroups4;

      var actualChannels = [];
      var actualChannelGroups = [];


      channels.forEach(function (channel) {
        if (channel in _this4._channels) {
          delete _this4._channels[channel];
          actualChannels.push(channel);

          if (channel in _this4._heartbeatChannels) {
            delete _this4._heartbeatChannels[channel];
          }
        }
        if (channel in _this4._presenceChannels) {
          delete _this4._presenceChannels[channel];
          actualChannels.push(channel);
        }
      });

      channelGroups.forEach(function (channelGroup) {
        if (channelGroup in _this4._channelGroups) {
          delete _this4._channelGroups[channelGroup];
          actualChannelGroups.push(channelGroup);

          if (channelGroup in _this4._heartbeatChannelGroups) {
            delete _this4._heartbeatChannelGroups[channelGroup];
          }
        }
        if (channelGroup in _this4._presenceChannelGroups) {
          delete _this4._channelGroups[channelGroup];
          actualChannelGroups.push(channelGroup);
        }
      });

      if (actualChannels.length === 0 && actualChannelGroups.length === 0) {
        return;
      }

      if (this._config.suppressLeaveEvents === false && !isOffline) {
        this._leaveEndpoint({ channels: actualChannels, channelGroups: actualChannelGroups }, function (status) {
          status.affectedChannels = actualChannels;
          status.affectedChannelGroups = actualChannelGroups;
          status.currentTimetoken = _this4._currentTimetoken;
          status.lastTimetoken = _this4._lastTimetoken;
          _this4._listenerManager.announceStatus(status);
        });
      }

      if (Object.keys(this._channels).length === 0 && Object.keys(this._presenceChannels).length === 0 && Object.keys(this._channelGroups).length === 0 && Object.keys(this._presenceChannelGroups).length === 0) {
        this._lastTimetoken = 0;
        this._currentTimetoken = 0;
        this._storedTimetoken = null;
        this._region = null;
        this._reconnectionManager.stopPolling();
      }

      this.reconnect();
    }
  }, {
    key: 'unsubscribeAll',
    value: function unsubscribeAll(isOffline) {
      this.adaptUnsubscribeChange({ channels: this.getSubscribedChannels(), channelGroups: this.getSubscribedChannelGroups() }, isOffline);
    }
  }, {
    key: 'getHeartbeatChannels',
    value: function getHeartbeatChannels() {
      return Object.keys(this._heartbeatChannels);
    }
  }, {
    key: 'getHeartbeatChannelGroups',
    value: function getHeartbeatChannelGroups() {
      return Object.keys(this._heartbeatChannelGroups);
    }
  }, {
    key: 'getSubscribedChannels',
    value: function getSubscribedChannels() {
      return Object.keys(this._channels);
    }
  }, {
    key: 'getSubscribedChannelGroups',
    value: function getSubscribedChannelGroups() {
      return Object.keys(this._channelGroups);
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
      this._reconnectionManager.stopPolling();
    }
  }, {
    key: '_registerHeartbeatTimer',
    value: function _registerHeartbeatTimer() {
      this._stopHeartbeatTimer();

      if (this._config.getHeartbeatInterval() === 0) {
        return;
      }

      this._performHeartbeatLoop();
      this._heartbeatTimer = setInterval(this._performHeartbeatLoop.bind(this), this._config.getHeartbeatInterval() * 1000);
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
      var _this5 = this;

      var heartbeatChannels = this.getHeartbeatChannels();

      var heartbeatChannelGroups = this.getHeartbeatChannelGroups();

      var presenceState = {};

      if (heartbeatChannels.length === 0 && heartbeatChannelGroups.length === 0) {
        return;
      }

      this.getSubscribedChannels().forEach(function (channel) {
        var channelState = _this5._channels[channel].state;
        if (Object.keys(channelState).length) presenceState[channel] = channelState;
      });

      this.getSubscribedChannelGroups().forEach(function (channelGroup) {
        var channelGroupState = _this5._channelGroups[channelGroup].state;
        if (Object.keys(channelGroupState).length) presenceState[channelGroup] = channelGroupState;
      });

      var onHeartbeat = function onHeartbeat(status) {
        if (status.error && _this5._config.announceFailedHeartbeats) {
          _this5._listenerManager.announceStatus(status);
        }

        if (status.error && _this5._config.autoNetworkDetection && _this5._isOnline) {
          _this5._isOnline = false;
          _this5.disconnect();
          _this5._listenerManager.announceNetworkDown();
          _this5.reconnect();
        }

        if (!status.error && _this5._config.announceSuccessfulHeartbeats) {
          _this5._listenerManager.announceStatus(status);
        }
      };

      this._heartbeatEndpoint({
        channels: heartbeatChannels,
        channelGroups: heartbeatChannelGroups,
        state: presenceState }, onHeartbeat.bind(this));
    }
  }, {
    key: '_startSubscribeLoop',
    value: function _startSubscribeLoop() {
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

      var subscribeArgs = {
        channels: channels,
        channelGroups: channelGroups,
        timetoken: this._currentTimetoken,
        filterExpression: this._config.filterExpression,
        region: this._region
      };

      this._subscribeCall = this._subscribeEndpoint(subscribeArgs, this._processSubscribeResponse.bind(this));
    }
  }, {
    key: '_processSubscribeResponse',
    value: function _processSubscribeResponse(status, payload) {
      var _this6 = this;

      if (status.error) {
        if (status.category === _categories2.default.PNTimeoutCategory) {
          this._startSubscribeLoop();
        } else if (status.category === _categories2.default.PNNetworkIssuesCategory) {
          this.disconnect();

          if (status.error && this._config.autoNetworkDetection && this._isOnline) {
            this._isOnline = false;
            this._listenerManager.announceNetworkDown();
          }

          this._reconnectionManager.onReconnection(function () {
            if (_this6._config.autoNetworkDetection && !_this6._isOnline) {
              _this6._isOnline = true;
              _this6._listenerManager.announceNetworkUp();
            }
            _this6.reconnect();
            _this6._subscriptionStatusAnnounced = true;
            var reconnectedAnnounce = {
              category: _categories2.default.PNReconnectedCategory,
              operation: status.operation,
              lastTimetoken: _this6._lastTimetoken,
              currentTimetoken: _this6._currentTimetoken
            };
            _this6._listenerManager.announceStatus(reconnectedAnnounce);
          });

          this._reconnectionManager.startPolling();
          this._listenerManager.announceStatus(status);
        } else if (status.category === _categories2.default.PNBadRequestCategory) {
          this._stopHeartbeatTimer();
          this._listenerManager.announceStatus(status);
        } else {
          this._listenerManager.announceStatus(status);
        }

        return;
      }

      if (this._storedTimetoken) {
        this._currentTimetoken = this._storedTimetoken;
        this._storedTimetoken = null;
      } else {
        this._lastTimetoken = this._currentTimetoken;
        this._currentTimetoken = payload.metadata.timetoken;
      }

      if (!this._subscriptionStatusAnnounced) {
        var connectedAnnounce = {};
        connectedAnnounce.category = _categories2.default.PNConnectedCategory;
        connectedAnnounce.operation = status.operation;
        connectedAnnounce.affectedChannels = this._pendingChannelSubscriptions;
        connectedAnnounce.subscribedChannels = this.getSubscribedChannels();
        connectedAnnounce.affectedChannelGroups = this._pendingChannelGroupSubscriptions;
        connectedAnnounce.lastTimetoken = this._lastTimetoken;
        connectedAnnounce.currentTimetoken = this._currentTimetoken;
        this._subscriptionStatusAnnounced = true;
        this._listenerManager.announceStatus(connectedAnnounce);

        this._pendingChannelSubscriptions = [];
        this._pendingChannelGroupSubscriptions = [];
      }

      var messages = payload.messages || [];
      var _config = this._config,
          requestMessageCountThreshold = _config.requestMessageCountThreshold,
          dedupeOnSubscribe = _config.dedupeOnSubscribe;


      if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
        var countAnnouncement = {};
        countAnnouncement.category = _categories2.default.PNRequestMessageCountExceededCategory;
        countAnnouncement.operation = status.operation;
        this._listenerManager.announceStatus(countAnnouncement);
      }

      messages.forEach(function (message) {
        var channel = message.channel;
        var subscriptionMatch = message.subscriptionMatch;
        var publishMetaData = message.publishMetaData;

        if (channel === subscriptionMatch) {
          subscriptionMatch = null;
        }

        if (dedupeOnSubscribe) {
          if (_this6._dedupingManager.isDuplicate(message)) {
            return;
          } else {
            _this6._dedupingManager.addEntry(message);
          }
        }

        if (_utils2.default.endsWith(message.channel, '-pnpres')) {
          var announce = {};
          announce.channel = null;
          announce.subscription = null;

          announce.actualChannel = subscriptionMatch != null ? channel : null;
          announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;


          if (channel) {
            announce.channel = channel.substring(0, channel.lastIndexOf('-pnpres'));
          }

          if (subscriptionMatch) {
            announce.subscription = subscriptionMatch.substring(0, subscriptionMatch.lastIndexOf('-pnpres'));
          }

          announce.action = message.payload.action;
          announce.state = message.payload.data;
          announce.timetoken = publishMetaData.publishTimetoken;
          announce.occupancy = message.payload.occupancy;
          announce.uuid = message.payload.uuid;
          announce.timestamp = message.payload.timestamp;

          if (message.payload.join) {
            announce.join = message.payload.join;
          }

          if (message.payload.leave) {
            announce.leave = message.payload.leave;
          }

          if (message.payload.timeout) {
            announce.timeout = message.payload.timeout;
          }

          _this6._listenerManager.announcePresence(announce);
        } else {
          var _announce = {};
          _announce.channel = null;
          _announce.subscription = null;

          _announce.actualChannel = subscriptionMatch != null ? channel : null;
          _announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;


          _announce.channel = channel;
          _announce.subscription = subscriptionMatch;
          _announce.timetoken = publishMetaData.publishTimetoken;
          _announce.publisher = message.issuingClientId;

          if (message.userMetadata) {
            _announce.userMetadata = message.userMetadata;
          }

          if (_this6._config.cipherKey) {
            _announce.message = _this6._crypto.decrypt(message.payload);
          } else {
            _announce.message = message.payload;
          }

          _this6._listenerManager.announceMessage(_announce);
        }
      });

      this._region = payload.metadata.region;
      this._startSubscribeLoop();
    }
  }, {
    key: '_stopSubscribeLoop',
    value: function _stopSubscribeLoop() {
      if (this._subscribeCall) {
        if (typeof this._subscribeCall.abort === 'function') {
          this._subscribeCall.abort();
        }
        this._subscribeCall = null;
      }
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=subscription_manager.js.map
