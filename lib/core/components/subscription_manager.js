"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _cryptography = _interopRequireDefault(require("../components/cryptography"));

var _config = _interopRequireDefault(require("../components/config"));

var _listener_manager = _interopRequireDefault(require("../components/listener_manager"));

var _reconnection_manager = _interopRequireDefault(require("../components/reconnection_manager"));

var _deduping_manager = _interopRequireDefault(require("../components/deduping_manager"));

var _utils = _interopRequireDefault(require("../utils"));

var _flow_interfaces = require("../flow_interfaces");

var _categories = _interopRequireDefault(require("../constants/categories"));

var _default = function () {
  function _default(_ref) {
    var subscribeEndpoint = _ref.subscribeEndpoint,
        leaveEndpoint = _ref.leaveEndpoint,
        heartbeatEndpoint = _ref.heartbeatEndpoint,
        setStateEndpoint = _ref.setStateEndpoint,
        timeEndpoint = _ref.timeEndpoint,
        getFileUrl = _ref.getFileUrl,
        config = _ref.config,
        crypto = _ref.crypto,
        listenerManager = _ref.listenerManager;
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_crypto", void 0);
    (0, _defineProperty2["default"])(this, "_config", void 0);
    (0, _defineProperty2["default"])(this, "_listenerManager", void 0);
    (0, _defineProperty2["default"])(this, "_reconnectionManager", void 0);
    (0, _defineProperty2["default"])(this, "_leaveEndpoint", void 0);
    (0, _defineProperty2["default"])(this, "_heartbeatEndpoint", void 0);
    (0, _defineProperty2["default"])(this, "_setStateEndpoint", void 0);
    (0, _defineProperty2["default"])(this, "_subscribeEndpoint", void 0);
    (0, _defineProperty2["default"])(this, "_getFileUrl", void 0);
    (0, _defineProperty2["default"])(this, "_channels", void 0);
    (0, _defineProperty2["default"])(this, "_presenceChannels", void 0);
    (0, _defineProperty2["default"])(this, "_heartbeatChannels", void 0);
    (0, _defineProperty2["default"])(this, "_heartbeatChannelGroups", void 0);
    (0, _defineProperty2["default"])(this, "_channelGroups", void 0);
    (0, _defineProperty2["default"])(this, "_presenceChannelGroups", void 0);
    (0, _defineProperty2["default"])(this, "_currentTimetoken", void 0);
    (0, _defineProperty2["default"])(this, "_lastTimetoken", void 0);
    (0, _defineProperty2["default"])(this, "_storedTimetoken", void 0);
    (0, _defineProperty2["default"])(this, "_region", void 0);
    (0, _defineProperty2["default"])(this, "_subscribeCall", void 0);
    (0, _defineProperty2["default"])(this, "_heartbeatTimer", void 0);
    (0, _defineProperty2["default"])(this, "_subscriptionStatusAnnounced", void 0);
    (0, _defineProperty2["default"])(this, "_autoNetworkDetection", void 0);
    (0, _defineProperty2["default"])(this, "_isOnline", void 0);
    (0, _defineProperty2["default"])(this, "_pendingChannelSubscriptions", void 0);
    (0, _defineProperty2["default"])(this, "_pendingChannelGroupSubscriptions", void 0);
    (0, _defineProperty2["default"])(this, "_dedupingManager", void 0);
    this._listenerManager = listenerManager;
    this._config = config;
    this._leaveEndpoint = leaveEndpoint;
    this._heartbeatEndpoint = heartbeatEndpoint;
    this._setStateEndpoint = setStateEndpoint;
    this._subscribeEndpoint = subscribeEndpoint;
    this._getFileUrl = getFileUrl;
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
    this._reconnectionManager = new _reconnection_manager["default"]({
      timeEndpoint: timeEndpoint
    });
    this._dedupingManager = new _deduping_manager["default"]({
      config: config
    });
  }

  (0, _createClass2["default"])(_default, [{
    key: "adaptStateChange",
    value: function adaptStateChange(args, callback) {
      var _this = this;

      var state = args.state,
          _args$channels = args.channels,
          channels = _args$channels === void 0 ? [] : _args$channels,
          _args$channelGroups = args.channelGroups,
          channelGroups = _args$channelGroups === void 0 ? [] : _args$channelGroups;
      channels.forEach(function (channel) {
        if (channel in _this._channels) _this._channels[channel].state = state;
      });
      channelGroups.forEach(function (channelGroup) {
        if (channelGroup in _this._channelGroups) {
          _this._channelGroups[channelGroup].state = state;
        }
      });
      return this._setStateEndpoint({
        state: state,
        channels: channels,
        channelGroups: channelGroups
      }, callback);
    }
  }, {
    key: "adaptPresenceChange",
    value: function adaptPresenceChange(args) {
      var _this2 = this;

      var connected = args.connected,
          _args$channels2 = args.channels,
          channels = _args$channels2 === void 0 ? [] : _args$channels2,
          _args$channelGroups2 = args.channelGroups,
          channelGroups = _args$channelGroups2 === void 0 ? [] : _args$channelGroups2;

      if (connected) {
        channels.forEach(function (channel) {
          _this2._heartbeatChannels[channel] = {
            state: {}
          };
        });
        channelGroups.forEach(function (channelGroup) {
          _this2._heartbeatChannelGroups[channelGroup] = {
            state: {}
          };
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
          this._leaveEndpoint({
            channels: channels,
            channelGroups: channelGroups
          }, function (status) {
            _this2._listenerManager.announceStatus(status);
          });
        }
      }

      this.reconnect();
    }
  }, {
    key: "adaptSubscribeChange",
    value: function adaptSubscribeChange(args) {
      var _this3 = this;

      var timetoken = args.timetoken,
          _args$channels3 = args.channels,
          channels = _args$channels3 === void 0 ? [] : _args$channels3,
          _args$channelGroups3 = args.channelGroups,
          channelGroups = _args$channelGroups3 === void 0 ? [] : _args$channelGroups3,
          _args$withPresence = args.withPresence,
          withPresence = _args$withPresence === void 0 ? false : _args$withPresence,
          _args$withHeartbeats = args.withHeartbeats,
          withHeartbeats = _args$withHeartbeats === void 0 ? false : _args$withHeartbeats;

      if (!this._config.subscribeKey || this._config.subscribeKey === '') {
        if (console && console.log) {
          console.log('subscribe key missing; aborting subscribe');
        }

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
        _this3._channels[channel] = {
          state: {}
        };
        if (withPresence) _this3._presenceChannels[channel] = {};
        if (withHeartbeats || _this3._config.getHeartbeatInterval()) _this3._heartbeatChannels[channel] = {};

        _this3._pendingChannelSubscriptions.push(channel);
      });
      channelGroups.forEach(function (channelGroup) {
        _this3._channelGroups[channelGroup] = {
          state: {}
        };
        if (withPresence) _this3._presenceChannelGroups[channelGroup] = {};
        if (withHeartbeats || _this3._config.getHeartbeatInterval()) _this3._heartbeatChannelGroups[channelGroup] = {};

        _this3._pendingChannelGroupSubscriptions.push(channelGroup);
      });
      this._subscriptionStatusAnnounced = false;
      this.reconnect();
    }
  }, {
    key: "adaptUnsubscribeChange",
    value: function adaptUnsubscribeChange(args, isOffline) {
      var _this4 = this;

      var _args$channels4 = args.channels,
          channels = _args$channels4 === void 0 ? [] : _args$channels4,
          _args$channelGroups4 = args.channelGroups,
          channelGroups = _args$channelGroups4 === void 0 ? [] : _args$channelGroups4;
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
        this._leaveEndpoint({
          channels: actualChannels,
          channelGroups: actualChannelGroups
        }, function (status) {
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
    key: "unsubscribeAll",
    value: function unsubscribeAll(isOffline) {
      this.adaptUnsubscribeChange({
        channels: this.getSubscribedChannels(),
        channelGroups: this.getSubscribedChannelGroups()
      }, isOffline);
    }
  }, {
    key: "getHeartbeatChannels",
    value: function getHeartbeatChannels() {
      return Object.keys(this._heartbeatChannels);
    }
  }, {
    key: "getHeartbeatChannelGroups",
    value: function getHeartbeatChannelGroups() {
      return Object.keys(this._heartbeatChannelGroups);
    }
  }, {
    key: "getSubscribedChannels",
    value: function getSubscribedChannels() {
      return Object.keys(this._channels);
    }
  }, {
    key: "getSubscribedChannelGroups",
    value: function getSubscribedChannelGroups() {
      return Object.keys(this._channelGroups);
    }
  }, {
    key: "reconnect",
    value: function reconnect() {
      this._startSubscribeLoop();

      this._registerHeartbeatTimer();
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this._stopSubscribeLoop();

      this._stopHeartbeatTimer();

      this._reconnectionManager.stopPolling();
    }
  }, {
    key: "_registerHeartbeatTimer",
    value: function _registerHeartbeatTimer() {
      this._stopHeartbeatTimer();

      if (this._config.getHeartbeatInterval() === 0 || this._config.getHeartbeatInterval() === undefined) {
        return;
      }

      this._performHeartbeatLoop();

      this._heartbeatTimer = setInterval(this._performHeartbeatLoop.bind(this), this._config.getHeartbeatInterval() * 1000);
    }
  }, {
    key: "_stopHeartbeatTimer",
    value: function _stopHeartbeatTimer() {
      if (this._heartbeatTimer) {
        clearInterval(this._heartbeatTimer);
        this._heartbeatTimer = null;
      }
    }
  }, {
    key: "_performHeartbeatLoop",
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

        if (Object.keys(channelState).length) {
          presenceState[channel] = channelState;
        }
      });
      this.getSubscribedChannelGroups().forEach(function (channelGroup) {
        var channelGroupState = _this5._channelGroups[channelGroup].state;

        if (Object.keys(channelGroupState).length) {
          presenceState[channelGroup] = channelGroupState;
        }
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
        state: presenceState
      }, onHeartbeat.bind(this));
    }
  }, {
    key: "_startSubscribeLoop",
    value: function _startSubscribeLoop() {
      var _this6 = this;

      this._stopSubscribeLoop();

      var presenceState = {};
      var channels = [];
      var channelGroups = [];
      Object.keys(this._channels).forEach(function (channel) {
        var channelState = _this6._channels[channel].state;

        if (Object.keys(channelState).length) {
          presenceState[channel] = channelState;
        }

        channels.push(channel);
      });
      Object.keys(this._presenceChannels).forEach(function (channel) {
        channels.push("".concat(channel, "-pnpres"));
      });
      Object.keys(this._channelGroups).forEach(function (channelGroup) {
        var channelGroupState = _this6._channelGroups[channelGroup].state;

        if (Object.keys(channelGroupState).length) {
          presenceState[channelGroup] = channelGroupState;
        }

        channelGroups.push(channelGroup);
      });
      Object.keys(this._presenceChannelGroups).forEach(function (channelGroup) {
        channelGroups.push("".concat(channelGroup, "-pnpres"));
      });

      if (channels.length === 0 && channelGroups.length === 0) {
        return;
      }

      var subscribeArgs = {
        channels: channels,
        channelGroups: channelGroups,
        state: presenceState,
        timetoken: this._currentTimetoken,
        filterExpression: this._config.filterExpression,
        region: this._region
      };
      this._subscribeCall = this._subscribeEndpoint(subscribeArgs, this._processSubscribeResponse.bind(this));
    }
  }, {
    key: "_processSubscribeResponse",
    value: function _processSubscribeResponse(status, payload) {
      var _this7 = this;

      if (status.error) {
        if (status.category === _categories["default"].PNTimeoutCategory) {
          this._startSubscribeLoop();
        } else if (status.category === _categories["default"].PNNetworkIssuesCategory) {
          this.disconnect();

          if (status.error && this._config.autoNetworkDetection && this._isOnline) {
            this._isOnline = false;

            this._listenerManager.announceNetworkDown();
          }

          this._reconnectionManager.onReconnection(function () {
            if (_this7._config.autoNetworkDetection && !_this7._isOnline) {
              _this7._isOnline = true;

              _this7._listenerManager.announceNetworkUp();
            }

            _this7.reconnect();

            _this7._subscriptionStatusAnnounced = true;
            var reconnectedAnnounce = {
              category: _categories["default"].PNReconnectedCategory,
              operation: status.operation,
              lastTimetoken: _this7._lastTimetoken,
              currentTimetoken: _this7._currentTimetoken
            };

            _this7._listenerManager.announceStatus(reconnectedAnnounce);
          });

          this._reconnectionManager.startPolling();

          this._listenerManager.announceStatus(status);
        } else if (status.category === _categories["default"].PNBadRequestCategory) {
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
        connectedAnnounce.category = _categories["default"].PNConnectedCategory;
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
      var _this$_config = this._config,
          requestMessageCountThreshold = _this$_config.requestMessageCountThreshold,
          dedupeOnSubscribe = _this$_config.dedupeOnSubscribe;

      if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
        var countAnnouncement = {};
        countAnnouncement.category = _categories["default"].PNRequestMessageCountExceededCategory;
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
          if (_this7._dedupingManager.isDuplicate(message)) {
            return;
          } else {
            _this7._dedupingManager.addEntry(message);
          }
        }

        if (_utils["default"].endsWith(message.channel, '-pnpres')) {
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

          _this7._listenerManager.announcePresence(announce);
        } else if (message.messageType === 1) {
          var _announce = {};
          _announce.channel = null;
          _announce.subscription = null;
          _announce.channel = channel;
          _announce.subscription = subscriptionMatch;
          _announce.timetoken = publishMetaData.publishTimetoken;
          _announce.publisher = message.issuingClientId;

          if (message.userMetadata) {
            _announce.userMetadata = message.userMetadata;
          }

          _announce.message = message.payload;

          _this7._listenerManager.announceSignal(_announce);
        } else if (message.messageType === 2) {
          var _announce2 = {};
          _announce2.channel = null;
          _announce2.subscription = null;
          _announce2.channel = channel;
          _announce2.subscription = subscriptionMatch;
          _announce2.timetoken = publishMetaData.publishTimetoken;
          _announce2.publisher = message.issuingClientId;

          if (message.userMetadata) {
            _announce2.userMetadata = message.userMetadata;
          }

          _announce2.message = {
            event: message.payload.event,
            type: message.payload.type,
            data: message.payload.data
          };

          _this7._listenerManager.announceObjects(_announce2);

          if (message.payload.type === 'user') {
            _this7._listenerManager.announceUser(_announce2);
          } else if (message.payload.type === 'space') {
            _this7._listenerManager.announceSpace(_announce2);
          } else if (message.payload.type === 'membership') {
            _this7._listenerManager.announceMembership(_announce2);
          }
        } else if (message.messageType === 3) {
          var _announce3 = {};
          _announce3.channel = channel;
          _announce3.subscription = subscriptionMatch;
          _announce3.timetoken = publishMetaData.publishTimetoken;
          _announce3.publisher = message.issuingClientId;
          _announce3.data = {
            messageTimetoken: message.payload.data.messageTimetoken,
            actionTimetoken: message.payload.data.actionTimetoken,
            type: message.payload.data.type,
            uuid: message.issuingClientId,
            value: message.payload.data.value
          };
          _announce3.event = message.payload.event;

          _this7._listenerManager.announceMessageAction(_announce3);
        } else if (message.messageType === 4) {
          var _announce4 = {};
          _announce4.channel = channel;
          _announce4.subscription = subscriptionMatch;
          _announce4.timetoken = publishMetaData.publishTimetoken;
          _announce4.publisher = message.issuingClientId;
          var msgPayload = message.payload;

          if (_this7._config.cipherKey) {
            var decryptedPayload = _this7._crypto.decrypt(message.payload);

            if ((0, _typeof2["default"])(decryptedPayload) === 'object' && decryptedPayload !== null) {
              msgPayload = decryptedPayload;
            }
          }

          if (message.userMetadata) {
            _announce4.userMetadata = message.userMetadata;
          }

          _announce4.message = msgPayload.message;
          _announce4.file = {
            id: msgPayload.file.id,
            name: msgPayload.file.name,
            url: _this7._getFileUrl({
              id: msgPayload.file.id,
              name: msgPayload.file.name,
              channel: channel
            })
          };

          _this7._listenerManager.announceFile(_announce4);
        } else {
          var _announce5 = {};
          _announce5.channel = null;
          _announce5.subscription = null;
          _announce5.actualChannel = subscriptionMatch != null ? channel : null;
          _announce5.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
          _announce5.channel = channel;
          _announce5.subscription = subscriptionMatch;
          _announce5.timetoken = publishMetaData.publishTimetoken;
          _announce5.publisher = message.issuingClientId;

          if (message.userMetadata) {
            _announce5.userMetadata = message.userMetadata;
          }

          if (_this7._config.cipherKey) {
            _announce5.message = _this7._crypto.decrypt(message.payload);
          } else {
            _announce5.message = message.payload;
          }

          _this7._listenerManager.announceMessage(_announce5);
        }
      });
      this._region = payload.metadata.region;

      this._startSubscribeLoop();
    }
  }, {
    key: "_stopSubscribeLoop",
    value: function _stopSubscribeLoop() {
      if (this._subscribeCall) {
        if (typeof this._subscribeCall.abort === 'function') {
          this._subscribeCall.abort();
        }

        this._subscribeCall = null;
      }
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=subscription_manager.js.map
