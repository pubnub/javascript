"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _config = _interopRequireDefault(require("./components/config"));

var _index = _interopRequireDefault(require("./components/cryptography/index"));

var _subscription_manager = _interopRequireDefault(require("./components/subscription_manager"));

var _telemetry_manager = _interopRequireDefault(require("./components/telemetry_manager"));

var _push_payload = _interopRequireDefault(require("./components/push_payload"));

var _listener_manager = _interopRequireDefault(require("./components/listener_manager"));

var _token_manager = _interopRequireDefault(require("./components/token_manager"));

var _endpoint = _interopRequireDefault(require("./components/endpoint"));

var _utils = require("./utils");

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

var _file = require("../file");

var fileUploadTypes = _interopRequireWildcard(require("./endpoints/file_upload/types"));

var _list_files = _interopRequireDefault(require("./endpoints/file_upload/list_files"));

var _generate_upload_url = _interopRequireDefault(require("./endpoints/file_upload/generate_upload_url"));

var _publish_file = _interopRequireDefault(require("./endpoints/file_upload/publish_file"));

var _send_file = _interopRequireDefault(require("./endpoints/file_upload/send_file"));

var _get_file_url = _interopRequireDefault(require("./endpoints/file_upload/get_file_url"));

var _download_file = _interopRequireDefault(require("./endpoints/file_upload/download_file"));

var _delete_file = _interopRequireDefault(require("./endpoints/file_upload/delete_file"));

var _get_all = _interopRequireDefault(require("./endpoints/objects/uuid/get_all"));

var _get = _interopRequireDefault(require("./endpoints/objects/uuid/get"));

var _set = _interopRequireDefault(require("./endpoints/objects/uuid/set"));

var _remove = _interopRequireDefault(require("./endpoints/objects/uuid/remove"));

var _get_all2 = _interopRequireDefault(require("./endpoints/objects/channel/get_all"));

var _get2 = _interopRequireDefault(require("./endpoints/objects/channel/get"));

var _set2 = _interopRequireDefault(require("./endpoints/objects/channel/set"));

var _remove2 = _interopRequireDefault(require("./endpoints/objects/channel/remove"));

var _get3 = _interopRequireDefault(require("./endpoints/objects/member/get"));

var _set3 = _interopRequireDefault(require("./endpoints/objects/member/set"));

var _get4 = _interopRequireDefault(require("./endpoints/objects/membership/get"));

var _set4 = _interopRequireDefault(require("./endpoints/objects/membership/set"));

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

var _revoke_token = _interopRequireDefault(require("./endpoints/access_manager/revoke_token"));

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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _default = function () {
  function _default(setup) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_config", void 0);
    (0, _defineProperty2["default"])(this, "_telemetryManager", void 0);
    (0, _defineProperty2["default"])(this, "_listenerManager", void 0);
    (0, _defineProperty2["default"])(this, "_tokenManager", void 0);
    (0, _defineProperty2["default"])(this, "time", void 0);
    (0, _defineProperty2["default"])(this, "publish", void 0);
    (0, _defineProperty2["default"])(this, "fire", void 0);
    (0, _defineProperty2["default"])(this, "history", void 0);
    (0, _defineProperty2["default"])(this, "deleteMessages", void 0);
    (0, _defineProperty2["default"])(this, "messageCounts", void 0);
    (0, _defineProperty2["default"])(this, "fetchMessages", void 0);
    (0, _defineProperty2["default"])(this, "channelGroups", void 0);
    (0, _defineProperty2["default"])(this, "push", void 0);
    (0, _defineProperty2["default"])(this, "hereNow", void 0);
    (0, _defineProperty2["default"])(this, "whereNow", void 0);
    (0, _defineProperty2["default"])(this, "getState", void 0);
    (0, _defineProperty2["default"])(this, "setState", void 0);
    (0, _defineProperty2["default"])(this, "grant", void 0);
    (0, _defineProperty2["default"])(this, "grantToken", void 0);
    (0, _defineProperty2["default"])(this, "audit", void 0);
    (0, _defineProperty2["default"])(this, "revokeToken", void 0);
    (0, _defineProperty2["default"])(this, "subscribe", void 0);
    (0, _defineProperty2["default"])(this, "signal", void 0);
    (0, _defineProperty2["default"])(this, "presence", void 0);
    (0, _defineProperty2["default"])(this, "unsubscribe", void 0);
    (0, _defineProperty2["default"])(this, "unsubscribeAll", void 0);
    (0, _defineProperty2["default"])(this, "addMessageAction", void 0);
    (0, _defineProperty2["default"])(this, "removeMessageAction", void 0);
    (0, _defineProperty2["default"])(this, "getMessageActions", void 0);
    (0, _defineProperty2["default"])(this, "File", void 0);
    (0, _defineProperty2["default"])(this, "encryptFile", void 0);
    (0, _defineProperty2["default"])(this, "decryptFile", void 0);
    (0, _defineProperty2["default"])(this, "listFiles", void 0);
    (0, _defineProperty2["default"])(this, "sendFile", void 0);
    (0, _defineProperty2["default"])(this, "downloadFile", void 0);
    (0, _defineProperty2["default"])(this, "getFileUrl", void 0);
    (0, _defineProperty2["default"])(this, "deleteFile", void 0);
    (0, _defineProperty2["default"])(this, "publishFile", void 0);
    (0, _defineProperty2["default"])(this, "objects", void 0);
    (0, _defineProperty2["default"])(this, "createUser", void 0);
    (0, _defineProperty2["default"])(this, "updateUser", void 0);
    (0, _defineProperty2["default"])(this, "deleteUser", void 0);
    (0, _defineProperty2["default"])(this, "getUser", void 0);
    (0, _defineProperty2["default"])(this, "getUsers", void 0);
    (0, _defineProperty2["default"])(this, "createSpace", void 0);
    (0, _defineProperty2["default"])(this, "updateSpace", void 0);
    (0, _defineProperty2["default"])(this, "deleteSpace", void 0);
    (0, _defineProperty2["default"])(this, "getSpaces", void 0);
    (0, _defineProperty2["default"])(this, "getSpace", void 0);
    (0, _defineProperty2["default"])(this, "getMembers", void 0);
    (0, _defineProperty2["default"])(this, "addMembers", void 0);
    (0, _defineProperty2["default"])(this, "updateMembers", void 0);
    (0, _defineProperty2["default"])(this, "removeMembers", void 0);
    (0, _defineProperty2["default"])(this, "getMemberships", void 0);
    (0, _defineProperty2["default"])(this, "joinSpaces", void 0);
    (0, _defineProperty2["default"])(this, "updateMemberships", void 0);
    (0, _defineProperty2["default"])(this, "leaveSpaces", void 0);
    (0, _defineProperty2["default"])(this, "disconnect", void 0);
    (0, _defineProperty2["default"])(this, "reconnect", void 0);
    (0, _defineProperty2["default"])(this, "destroy", void 0);
    (0, _defineProperty2["default"])(this, "stop", void 0);
    (0, _defineProperty2["default"])(this, "getSubscribedChannels", void 0);
    (0, _defineProperty2["default"])(this, "getSubscribedChannelGroups", void 0);
    (0, _defineProperty2["default"])(this, "addListener", void 0);
    (0, _defineProperty2["default"])(this, "removeListener", void 0);
    (0, _defineProperty2["default"])(this, "removeAllListeners", void 0);
    (0, _defineProperty2["default"])(this, "parseToken", void 0);
    (0, _defineProperty2["default"])(this, "setToken", void 0);
    (0, _defineProperty2["default"])(this, "getToken", void 0);
    (0, _defineProperty2["default"])(this, "getAuthKey", void 0);
    (0, _defineProperty2["default"])(this, "setAuthKey", void 0);
    (0, _defineProperty2["default"])(this, "setCipherKey", void 0);
    (0, _defineProperty2["default"])(this, "setUUID", void 0);
    (0, _defineProperty2["default"])(this, "getUUID", void 0);
    (0, _defineProperty2["default"])(this, "getFilterExpression", void 0);
    (0, _defineProperty2["default"])(this, "setFilterExpression", void 0);
    (0, _defineProperty2["default"])(this, "setHeartbeatInterval", void 0);
    (0, _defineProperty2["default"])(this, "setProxy", void 0);
    (0, _defineProperty2["default"])(this, "encrypt", void 0);
    (0, _defineProperty2["default"])(this, "decrypt", void 0);
    var networking = setup.networking,
        cbor = setup.cbor;
    var config = this._config = new _config["default"]({
      setup: setup
    });
    var crypto = new _index["default"]({
      config: config
    });
    var cryptography = setup.cryptography;
    networking.init(config);
    var tokenManager = this._tokenManager = new _token_manager["default"](config, cbor);
    var telemetryManager = this._telemetryManager = new _telemetry_manager["default"]({
      maximumSamplesCount: 60000
    });
    var modules = {
      config: config,
      networking: networking,
      crypto: crypto,
      cryptography: cryptography,
      tokenManager: tokenManager,
      telemetryManager: telemetryManager,
      PubNubFile: setup.PubNubFile
    };
    this.File = setup.PubNubFile;

    this.encryptFile = function (key, file) {
      return cryptography.encryptFile(key, file, _this.File);
    };

    this.decryptFile = function (key, file) {
      return cryptography.decryptFile(key, file, _this.File);
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
      listenerManager: listenerManager,
      getFileUrl: function getFileUrl(params) {
        return (0, _get_file_url["default"])(modules, params);
      }
    });
    this.addListener = listenerManager.addListener.bind(listenerManager);
    this.removeListener = listenerManager.removeListener.bind(listenerManager);
    this.removeAllListeners = listenerManager.removeAllListeners.bind(listenerManager);
    this.parseToken = tokenManager.parseToken.bind(tokenManager);
    this.setToken = tokenManager.setToken.bind(tokenManager);
    this.getToken = tokenManager.getToken.bind(tokenManager);
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
    this.revokeToken = _endpoint["default"].bind(this, modules, _revoke_token["default"]);
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
    this.listFiles = _endpoint["default"].bind(this, modules, _list_files["default"]);

    var generateUploadUrl = _endpoint["default"].bind(this, modules, _generate_upload_url["default"]);

    this.publishFile = _endpoint["default"].bind(this, modules, _publish_file["default"]);
    this.sendFile = (0, _send_file["default"])({
      generateUploadUrl: generateUploadUrl,
      publishFile: this.publishFile,
      modules: modules
    });

    this.getFileUrl = function (params) {
      return (0, _get_file_url["default"])(modules, params);
    };

    this.downloadFile = _endpoint["default"].bind(this, modules, _download_file["default"]);
    this.deleteFile = _endpoint["default"].bind(this, modules, _delete_file["default"]);
    this.objects = {
      getAllUUIDMetadata: _endpoint["default"].bind(this, modules, _get_all["default"]),
      getUUIDMetadata: _endpoint["default"].bind(this, modules, _get["default"]),
      setUUIDMetadata: _endpoint["default"].bind(this, modules, _set["default"]),
      removeUUIDMetadata: _endpoint["default"].bind(this, modules, _remove["default"]),
      getAllChannelMetadata: _endpoint["default"].bind(this, modules, _get_all2["default"]),
      getChannelMetadata: _endpoint["default"].bind(this, modules, _get2["default"]),
      setChannelMetadata: _endpoint["default"].bind(this, modules, _set2["default"]),
      removeChannelMetadata: _endpoint["default"].bind(this, modules, _remove2["default"]),
      getChannelMembers: _endpoint["default"].bind(this, modules, _get3["default"]),
      setChannelMembers: function setChannelMembers(parameters) {
        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }

        return _endpoint["default"].call.apply(_endpoint["default"], [_this, modules, _set3["default"], _objectSpread({
          type: 'set'
        }, parameters)].concat(rest));
      },
      removeChannelMembers: function removeChannelMembers(parameters) {
        for (var _len2 = arguments.length, rest = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          rest[_key2 - 1] = arguments[_key2];
        }

        return _endpoint["default"].call.apply(_endpoint["default"], [_this, modules, _set3["default"], _objectSpread({
          type: 'delete'
        }, parameters)].concat(rest));
      },
      getMemberships: _endpoint["default"].bind(this, modules, _get4["default"]),
      setMemberships: function setMemberships(parameters) {
        for (var _len3 = arguments.length, rest = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          rest[_key3 - 1] = arguments[_key3];
        }

        return _endpoint["default"].call.apply(_endpoint["default"], [_this, modules, _set4["default"], _objectSpread({
          type: 'set'
        }, parameters)].concat(rest));
      },
      removeMemberships: function removeMemberships(parameters) {
        for (var _len4 = arguments.length, rest = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          rest[_key4 - 1] = arguments[_key4];
        }

        return _endpoint["default"].call.apply(_endpoint["default"], [_this, modules, _set4["default"], _objectSpread({
          type: 'delete'
        }, parameters)].concat(rest));
      }
    };
    this.createUser = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, createUserEndpointConfig));
    this.updateUser = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, updateUserEndpointConfig));
    this.deleteUser = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, deleteUserEndpointConfig));
    this.getUser = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, getUserEndpointConfig));
    this.getUsers = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, getUsersEndpointConfig));
    this.createSpace = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, createSpaceEndpointConfig));
    this.updateSpace = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, updateSpaceEndpointConfig));
    this.deleteSpace = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, deleteSpaceEndpointConfig));
    this.getSpaces = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, getSpacesEndpointConfig));
    this.getSpace = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, getSpaceEndpointConfig));
    this.addMembers = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, addMembersEndpointConfig));
    this.updateMembers = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, updateMembersEndpointConfig));
    this.removeMembers = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, removeMembersEndpointConfig));
    this.getMembers = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, getMembersEndpointConfig));
    this.getMemberships = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, getMembershipsEndpointConfig));
    this.joinSpaces = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, joinSpacesEndpointConfig));
    this.updateMemberships = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, updateMembershipsEndpointConfig));
    this.leaveSpaces = (0, _utils.deprecated)(_endpoint["default"].bind(this, modules, leaveSpacesEndpointConfig));
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

  (0, _createClass2["default"])(_default, [{
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
(0, _defineProperty2["default"])(_default, "OPERATIONS", _operations["default"]);
(0, _defineProperty2["default"])(_default, "CATEGORIES", _categories["default"]);
module.exports = exports.default;
//# sourceMappingURL=pubnub-common.js.map
