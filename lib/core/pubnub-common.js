"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(require("./components/config"));

var _index = _interopRequireDefault(require("./components/cryptography/index"));

var _subscription_manager = _interopRequireDefault(require("./components/subscription_manager"));

var _telemetry_manager = _interopRequireDefault(require("./components/telemetry_manager"));

var _push_payload = _interopRequireDefault(require("./components/push_payload"));

var _listener_manager = _interopRequireDefault(require("./components/listener_manager"));

var _token_manager = _interopRequireDefault(require("./components/token_manager"));

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

var addMessageActionEndpointConfig = _interopRequireWildcard(require("./endpoints/actions/add_message_action"));

var removeMessageActionEndpointConfig = _interopRequireWildcard(require("./endpoints/actions/remove_message_action"));

var getMessageActionEndpointConfig = _interopRequireWildcard(require("./endpoints/actions/get_message_actions"));

var createUserEndpointConfig = _interopRequireWildcard(require("./endpoints/users/create_user"));

var updateUserEndpointConfig = _interopRequireWildcard(require("./endpoints/users/update_user"));

var deleteUserEndpointConfig = _interopRequireWildcard(require("./endpoints/users/delete_user"));

var getUserEndpointConfig = _interopRequireWildcard(require("./endpoints/users/get_user"));

var getUsersEndpointConfig = _interopRequireWildcard(require("./endpoints/users/get_users"));

var createSpaceEndpointConfig = _interopRequireWildcard(require("./endpoints/spaces/create_space"));

var updateSpaceEndpointConfig = _interopRequireWildcard(require("./endpoints/spaces/update_space"));

var deleteSpaceEndpointConfig = _interopRequireWildcard(require("./endpoints/spaces/delete_space"));

var getSpacesEndpointConfig = _interopRequireWildcard(require("./endpoints/spaces/get_spaces"));

var getSpaceEndpointConfig = _interopRequireWildcard(require("./endpoints/spaces/get_space"));

var getMembersEndpointConfig = _interopRequireWildcard(require("./endpoints/memberships/get_members"));

var addMembersEndpointConfig = _interopRequireWildcard(require("./endpoints/memberships/add_members"));

var updateMembersEndpointConfig = _interopRequireWildcard(require("./endpoints/memberships/update_members"));

var removeMembersEndpointConfig = _interopRequireWildcard(require("./endpoints/memberships/remove_members"));

var getMembershipsEndpointConfig = _interopRequireWildcard(require("./endpoints/memberships/get_memberships"));

var updateMembershipsEndpointConfig = _interopRequireWildcard(require("./endpoints/memberships/update_memberships"));

var joinSpacesEndpointConfig = _interopRequireWildcard(require("./endpoints/memberships/join_spaces"));

var leaveSpacesEndpointConfig = _interopRequireWildcard(require("./endpoints/memberships/leave_spaces"));

var auditEndpointConfig = _interopRequireWildcard(require("./endpoints/access_manager/audit"));

var grantEndpointConfig = _interopRequireWildcard(require("./endpoints/access_manager/grant"));

var grantTokenEndpointConfig = _interopRequireWildcard(require("./endpoints/access_manager/grant_token"));

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

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

    _defineProperty(this, "_telemetryManager", void 0);

    _defineProperty(this, "_listenerManager", void 0);

    _defineProperty(this, "_tokenManager", void 0);

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

    _defineProperty(this, "grantToken", void 0);

    _defineProperty(this, "audit", void 0);

    _defineProperty(this, "subscribe", void 0);

    _defineProperty(this, "signal", void 0);

    _defineProperty(this, "presence", void 0);

    _defineProperty(this, "unsubscribe", void 0);

    _defineProperty(this, "unsubscribeAll", void 0);

    _defineProperty(this, "addMessageAction", void 0);

    _defineProperty(this, "removeMessageAction", void 0);

    _defineProperty(this, "getMessageActions", void 0);

    _defineProperty(this, "createUser", void 0);

    _defineProperty(this, "updateUser", void 0);

    _defineProperty(this, "deleteUser", void 0);

    _defineProperty(this, "getUser", void 0);

    _defineProperty(this, "getUsers", void 0);

    _defineProperty(this, "createSpace", void 0);

    _defineProperty(this, "updateSpace", void 0);

    _defineProperty(this, "deleteSpace", void 0);

    _defineProperty(this, "getSpaces", void 0);

    _defineProperty(this, "getSpace", void 0);

    _defineProperty(this, "getMembers", void 0);

    _defineProperty(this, "addMembers", void 0);

    _defineProperty(this, "updateMembers", void 0);

    _defineProperty(this, "removeMembers", void 0);

    _defineProperty(this, "getMemberships", void 0);

    _defineProperty(this, "joinSpaces", void 0);

    _defineProperty(this, "updateMemberships", void 0);

    _defineProperty(this, "leaveSpaces", void 0);

    _defineProperty(this, "disconnect", void 0);

    _defineProperty(this, "reconnect", void 0);

    _defineProperty(this, "destroy", void 0);

    _defineProperty(this, "stop", void 0);

    _defineProperty(this, "getSubscribedChannels", void 0);

    _defineProperty(this, "getSubscribedChannelGroups", void 0);

    _defineProperty(this, "addListener", void 0);

    _defineProperty(this, "removeListener", void 0);

    _defineProperty(this, "removeAllListeners", void 0);

    _defineProperty(this, "parseToken", void 0);

    _defineProperty(this, "setToken", void 0);

    _defineProperty(this, "setTokens", void 0);

    _defineProperty(this, "getToken", void 0);

    _defineProperty(this, "getTokens", void 0);

    _defineProperty(this, "clearTokens", void 0);

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
        networking = setup.networking,
        cbor = setup.cbor;
    var config = this._config = new _config["default"]({
      setup: setup,
      db: db
    });
    var crypto = new _index["default"]({
      config: config
    });
    networking.init(config);
    var tokenManager = this._tokenManager = new _token_manager["default"](config, cbor);
    var telemetryManager = this._telemetryManager = new _telemetry_manager["default"]({
      maximumSamplesCount: 60000
    });
    var modules = {
      config: config,
      networking: networking,
      crypto: crypto,
      tokenManager: tokenManager,
      telemetryManager: telemetryManager
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
    this.parseToken = tokenManager.parseToken.bind(tokenManager);
    this.setToken = tokenManager.setToken.bind(tokenManager);
    this.setTokens = tokenManager.setTokens.bind(tokenManager);
    this.getToken = tokenManager.getToken.bind(tokenManager);
    this.getTokens = tokenManager.getTokens.bind(tokenManager);
    this.clearTokens = tokenManager.clearTokens.bind(tokenManager);
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
    this.grantToken = _endpoint["default"].bind(this, modules, grantTokenEndpointConfig);
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
    this.addMessageAction = _endpoint["default"].bind(this, modules, addMessageActionEndpointConfig);
    this.removeMessageAction = _endpoint["default"].bind(this, modules, removeMessageActionEndpointConfig);
    this.getMessageActions = _endpoint["default"].bind(this, modules, getMessageActionEndpointConfig);
    this.createUser = _endpoint["default"].bind(this, modules, createUserEndpointConfig);
    this.updateUser = _endpoint["default"].bind(this, modules, updateUserEndpointConfig);
    this.deleteUser = _endpoint["default"].bind(this, modules, deleteUserEndpointConfig);
    this.getUser = _endpoint["default"].bind(this, modules, getUserEndpointConfig);
    this.getUsers = _endpoint["default"].bind(this, modules, getUsersEndpointConfig);
    this.createSpace = _endpoint["default"].bind(this, modules, createSpaceEndpointConfig);
    this.updateSpace = _endpoint["default"].bind(this, modules, updateSpaceEndpointConfig);
    this.deleteSpace = _endpoint["default"].bind(this, modules, deleteSpaceEndpointConfig);
    this.getSpaces = _endpoint["default"].bind(this, modules, getSpacesEndpointConfig);
    this.getSpace = _endpoint["default"].bind(this, modules, getSpaceEndpointConfig);
    this.addMembers = _endpoint["default"].bind(this, modules, addMembersEndpointConfig);
    this.updateMembers = _endpoint["default"].bind(this, modules, updateMembersEndpointConfig);
    this.removeMembers = _endpoint["default"].bind(this, modules, removeMembersEndpointConfig);
    this.getMembers = _endpoint["default"].bind(this, modules, getMembersEndpointConfig);
    this.getMemberships = _endpoint["default"].bind(this, modules, getMembershipsEndpointConfig);
    this.joinSpaces = _endpoint["default"].bind(this, modules, joinSpacesEndpointConfig);
    this.updateMemberships = _endpoint["default"].bind(this, modules, updateMembershipsEndpointConfig);
    this.leaveSpaces = _endpoint["default"].bind(this, modules, leaveSpacesEndpointConfig);
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
    key: "_addPnsdkSuffix",
    value: function _addPnsdkSuffix(name, suffix) {
      this._config._addPnsdkSuffix(name, suffix);
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
    key: "notificationPayload",
    value: function notificationPayload(title, body) {
      return new _push_payload["default"](title, body);
    }
  }, {
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
