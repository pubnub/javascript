"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(require("./components/config"));

var _index = _interopRequireDefault(require("./components/cryptography/index"));

var _subscription_manager = _interopRequireDefault(require("./components/subscription_manager"));

var _listener_manager = _interopRequireDefault(require("./components/listener_manager"));

var _endpoint = _interopRequireDefault(require("./components/endpoint"));

var addChannelsChannelGroupConfig = _interopRequireWildcard(require("./endpoints/channel_groups/add_channels"));

var removeChannelsChannelGroupConfig = _interopRequireWildcard(require("./endpoints/channel_groups/remove_channels"));

var deleteChannelGroupConfig = _interopRequireWildcard(require("./endpoints/channel_groups/delete_group"));

var listChannelGroupsConfig = _interopRequireWildcard(require("./endpoints/channel_groups/list_groups"));

var listChannelsInChannelGroupConfig = _interopRequireWildcard(require("./endpoints/channel_groups/list_channels"));

var addPushChannelsConfig = _interopRequireWildcard(require("./endpoints/push/add_push_channels"));

var removePushChannelsConfig = _interopRequireWildcard(require("./endpoints/push/remove_push_channels"));

var listPushChannelsConfig = _interopRequireWildcard(require("./endpoints/push/list_push_channels"));

var removeDevicePushConfig = _interopRequireWildcard(require("./endpoints/push/remove_device"));

var presenceLeaveEndpointConfig = _interopRequireWildcard(require("./endpoints/presence/leave"));

var presenceWhereNowEndpointConfig = _interopRequireWildcard(require("./endpoints/presence/where_now"));

var presenceHeartbeatEndpointConfig = _interopRequireWildcard(require("./endpoints/presence/heartbeat"));

var presenceGetStateConfig = _interopRequireWildcard(require("./endpoints/presence/get_state"));

var presenceSetStateConfig = _interopRequireWildcard(require("./endpoints/presence/set_state"));

var presenceHereNowConfig = _interopRequireWildcard(require("./endpoints/presence/here_now"));

var auditEndpointConfig = _interopRequireWildcard(require("./endpoints/access_manager/audit"));

var grantEndpointConfig = _interopRequireWildcard(require("./endpoints/access_manager/grant"));

var publishEndpointConfig = _interopRequireWildcard(require("./endpoints/publish"));

var signalEndpointConfig = _interopRequireWildcard(require("./endpoints/signal"));

var historyEndpointConfig = _interopRequireWildcard(require("./endpoints/history/get_history"));

var deleteMessagesEndpointConfig = _interopRequireWildcard(require("./endpoints/history/delete_messages"));

var messageCountsEndpointConfig = _interopRequireWildcard(require("./endpoints/history/message_counts"));

var fetchMessagesEndpointConfig = _interopRequireWildcard(require("./endpoints/fetch_messages"));

var timeEndpointConfig = _interopRequireWildcard(require("./endpoints/time"));

var subscribeEndpointConfig = _interopRequireWildcard(require("./endpoints/subscribe"));

var _operations = _interopRequireDefault(require("./constants/operations"));

var _categories = _interopRequireDefault(require("./constants/categories"));

var _flow_interfaces = require("./flow_interfaces");

var _uuid = _interopRequireDefault(require("./components/uuid"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default(setup) {
    var _this = this;

    _classCallCheck(this, _default);

    _defineProperty(this, "_config", void 0);

    _defineProperty(this, "_listenerManager", void 0);

    _defineProperty(this, "time", void 0);

    _defineProperty(this, "publish", void 0);

    _defineProperty(this, "fire", void 0);

    _defineProperty(this, "history", void 0);

    _defineProperty(this, "deleteMessages", void 0);

    _defineProperty(this, "messageCounts", void 0);

    _defineProperty(this, "fetchMessages", void 0);

    _defineProperty(this, "channelGroups", void 0);

    _defineProperty(this, "push", void 0);

    _defineProperty(this, "hereNow", void 0);

    _defineProperty(this, "whereNow", void 0);

    _defineProperty(this, "getState", void 0);

    _defineProperty(this, "setState", void 0);

    _defineProperty(this, "grant", void 0);

    _defineProperty(this, "audit", void 0);

    _defineProperty(this, "subscribe", void 0);

    _defineProperty(this, "signal", void 0);

    _defineProperty(this, "presence", void 0);

    _defineProperty(this, "unsubscribe", void 0);

    _defineProperty(this, "unsubscribeAll", void 0);

    _defineProperty(this, "disconnect", void 0);

    _defineProperty(this, "reconnect", void 0);

    _defineProperty(this, "destroy", void 0);

    _defineProperty(this, "stop", void 0);

    _defineProperty(this, "getSubscribedChannels", void 0);

    _defineProperty(this, "getSubscribedChannelGroups", void 0);

    _defineProperty(this, "addListener", void 0);

    _defineProperty(this, "removeListener", void 0);

    _defineProperty(this, "removeAllListeners", void 0);

    _defineProperty(this, "getAuthKey", void 0);

    _defineProperty(this, "setAuthKey", void 0);

    _defineProperty(this, "setCipherKey", void 0);

    _defineProperty(this, "setUUID", void 0);

    _defineProperty(this, "getUUID", void 0);

    _defineProperty(this, "getFilterExpression", void 0);

    _defineProperty(this, "setFilterExpression", void 0);

    _defineProperty(this, "setHeartbeatInterval", void 0);

    _defineProperty(this, "setProxy", void 0);

    _defineProperty(this, "encrypt", void 0);

    _defineProperty(this, "decrypt", void 0);

    var db = setup.db,
        networking = setup.networking;
    var config = this._config = new _config["default"]({
      setup: setup,
      db: db
    });
    var crypto = new _index["default"]({
      config: config
    });
    networking.init(config);
    var modules = {
      config: config,
      networking: networking,
      crypto: crypto
    };

    var timeEndpoint = _endpoint["default"].bind(this, modules, timeEndpointConfig);

    var leaveEndpoint = _endpoint["default"].bind(this, modules, presenceLeaveEndpointConfig);

    var heartbeatEndpoint = _endpoint["default"].bind(this, modules, presenceHeartbeatEndpointConfig);

    var setStateEndpoint = _endpoint["default"].bind(this, modules, presenceSetStateConfig);

    var subscribeEndpoint = _endpoint["default"].bind(this, modules, subscribeEndpointConfig);

    var listenerManager = this._listenerManager = new _listener_manager["default"]();
    var subscriptionManager = new _subscription_manager["default"]({
      timeEndpoint: timeEndpoint,
      leaveEndpoint: leaveEndpoint,
      heartbeatEndpoint: heartbeatEndpoint,
      setStateEndpoint: setStateEndpoint,
      subscribeEndpoint: subscribeEndpoint,
      crypto: modules.crypto,
      config: modules.config,
      listenerManager: listenerManager
    });
    this.addListener = listenerManager.addListener.bind(listenerManager);
    this.removeListener = listenerManager.removeListener.bind(listenerManager);
    this.removeAllListeners = listenerManager.removeAllListeners.bind(listenerManager);
    this.channelGroups = {
      listGroups: _endpoint["default"].bind(this, modules, listChannelGroupsConfig),
      listChannels: _endpoint["default"].bind(this, modules, listChannelsInChannelGroupConfig),
      addChannels: _endpoint["default"].bind(this, modules, addChannelsChannelGroupConfig),
      removeChannels: _endpoint["default"].bind(this, modules, removeChannelsChannelGroupConfig),
      deleteGroup: _endpoint["default"].bind(this, modules, deleteChannelGroupConfig)
    };
    this.push = {
      addChannels: _endpoint["default"].bind(this, modules, addPushChannelsConfig),
      removeChannels: _endpoint["default"].bind(this, modules, removePushChannelsConfig),
      deleteDevice: _endpoint["default"].bind(this, modules, removeDevicePushConfig),
      listChannels: _endpoint["default"].bind(this, modules, listPushChannelsConfig)
    };
    this.hereNow = _endpoint["default"].bind(this, modules, presenceHereNowConfig);
    this.whereNow = _endpoint["default"].bind(this, modules, presenceWhereNowEndpointConfig);
    this.getState = _endpoint["default"].bind(this, modules, presenceGetStateConfig);
    this.setState = subscriptionManager.adaptStateChange.bind(subscriptionManager);
    this.grant = _endpoint["default"].bind(this, modules, grantEndpointConfig);
    this.audit = _endpoint["default"].bind(this, modules, auditEndpointConfig);
    this.publish = _endpoint["default"].bind(this, modules, publishEndpointConfig);

    this.fire = function (args, callback) {
      args.replicate = false;
      args.storeInHistory = false;
      return _this.publish(args, callback);
    };

    this.signal = _endpoint["default"].bind(this, modules, signalEndpointConfig);
    this.history = _endpoint["default"].bind(this, modules, historyEndpointConfig);
    this.deleteMessages = _endpoint["default"].bind(this, modules, deleteMessagesEndpointConfig);
    this.messageCounts = _endpoint["default"].bind(this, modules, messageCountsEndpointConfig);
    this.fetchMessages = _endpoint["default"].bind(this, modules, fetchMessagesEndpointConfig);
    this.time = timeEndpoint;
    this.subscribe = subscriptionManager.adaptSubscribeChange.bind(subscriptionManager);
    this.presence = subscriptionManager.adaptPresenceChange.bind(subscriptionManager);
    this.unsubscribe = subscriptionManager.adaptUnsubscribeChange.bind(subscriptionManager);
    this.disconnect = subscriptionManager.disconnect.bind(subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(subscriptionManager);

    this.destroy = function (isOffline) {
      subscriptionManager.unsubscribeAll(isOffline);
      subscriptionManager.disconnect();
    };

    this.stop = this.destroy;
    this.unsubscribeAll = subscriptionManager.unsubscribeAll.bind(subscriptionManager);
    this.getSubscribedChannels = subscriptionManager.getSubscribedChannels.bind(subscriptionManager);
    this.getSubscribedChannelGroups = subscriptionManager.getSubscribedChannelGroups.bind(subscriptionManager);
    this.encrypt = crypto.encrypt.bind(crypto);
    this.decrypt = crypto.decrypt.bind(crypto);
    this.getAuthKey = modules.config.getAuthKey.bind(modules.config);
    this.setAuthKey = modules.config.setAuthKey.bind(modules.config);
    this.setCipherKey = modules.config.setCipherKey.bind(modules.config);
    this.getUUID = modules.config.getUUID.bind(modules.config);
    this.setUUID = modules.config.setUUID.bind(modules.config);
    this.getFilterExpression = modules.config.getFilterExpression.bind(modules.config);
    this.setFilterExpression = modules.config.setFilterExpression.bind(modules.config);
    this.setHeartbeatInterval = modules.config.setHeartbeatInterval.bind(modules.config);

    if (networking.hasModule('proxy')) {
      this.setProxy = function (proxy) {
        modules.config.setProxy(proxy);

        _this.reconnect();
      };
    }
  }

  _createClass(_default, [{
    key: "getVersion",
    value: function getVersion() {
      return this._config.getVersion();
    }
  }, {
    key: "networkDownDetected",
    value: function networkDownDetected() {
      this._listenerManager.announceNetworkDown();

      if (this._config.restore) {
        this.disconnect();
      } else {
        this.destroy(true);
      }
    }
  }, {
    key: "networkUpDetected",
    value: function networkUpDetected() {
      this._listenerManager.announceNetworkUp();

      this.reconnect();
    }
  }], [{
    key: "generateUUID",
    value: function generateUUID() {
      return _uuid["default"].createUUID();
    }
  }]);

  return _default;
}();

exports["default"] = _default;

_defineProperty(_default, "OPERATIONS", _operations["default"]);

_defineProperty(_default, "CATEGORIES", _categories["default"]);

module.exports = exports.default;
//# sourceMappingURL=pubnub-common.js.map
