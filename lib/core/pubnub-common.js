"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./components/config");
var index_1 = require("./components/cryptography/index");
var subscription_manager_1 = require("./components/subscription_manager");
var telemetry_manager_1 = require("./components/telemetry_manager");
var push_payload_1 = require("./components/push_payload");
var listener_manager_1 = require("./components/listener_manager");
var token_manager_1 = require("./components/token_manager");
var endpoint_1 = require("./components/endpoint");
var utils_1 = require("./utils");
var addChannelsChannelGroupConfig = require("./endpoints/channel_groups/add_channels");
var removeChannelsChannelGroupConfig = require("./endpoints/channel_groups/remove_channels");
var deleteChannelGroupConfig = require("./endpoints/channel_groups/delete_group");
var listChannelGroupsConfig = require("./endpoints/channel_groups/list_groups");
var listChannelsInChannelGroupConfig = require("./endpoints/channel_groups/list_channels");
var addPushChannelsConfig = require("./endpoints/push/add_push_channels");
var removePushChannelsConfig = require("./endpoints/push/remove_push_channels");
var listPushChannelsConfig = require("./endpoints/push/list_push_channels");
var removeDevicePushConfig = require("./endpoints/push/remove_device");
var presenceLeaveEndpointConfig = require("./endpoints/presence/leave");
var presenceWhereNowEndpointConfig = require("./endpoints/presence/where_now");
var presenceHeartbeatEndpointConfig = require("./endpoints/presence/heartbeat");
var presenceGetStateConfig = require("./endpoints/presence/get_state");
var presenceSetStateConfig = require("./endpoints/presence/set_state");
var presenceHereNowConfig = require("./endpoints/presence/here_now");
// Actions API
var addMessageActionEndpointConfig = require("./endpoints/actions/add_message_action");
var removeMessageActionEndpointConfig = require("./endpoints/actions/remove_message_action");
var getMessageActionEndpointConfig = require("./endpoints/actions/get_message_actions");
// File Upload API v1
var list_files_1 = require("./endpoints/file_upload/list_files");
var generate_upload_url_1 = require("./endpoints/file_upload/generate_upload_url");
var publish_file_1 = require("./endpoints/file_upload/publish_file");
var send_file_1 = require("./endpoints/file_upload/send_file");
var get_file_url_1 = require("./endpoints/file_upload/get_file_url");
var download_file_1 = require("./endpoints/file_upload/download_file");
var delete_file_1 = require("./endpoints/file_upload/delete_file");
// Object API v2
var get_all_1 = require("./endpoints/objects/uuid/get_all");
var get_1 = require("./endpoints/objects/uuid/get");
var set_1 = require("./endpoints/objects/uuid/set");
var remove_1 = require("./endpoints/objects/uuid/remove");
var get_all_2 = require("./endpoints/objects/channel/get_all");
var get_2 = require("./endpoints/objects/channel/get");
var set_2 = require("./endpoints/objects/channel/set");
var remove_2 = require("./endpoints/objects/channel/remove");
var get_3 = require("./endpoints/objects/member/get");
var set_3 = require("./endpoints/objects/member/set");
var get_4 = require("./endpoints/objects/membership/get");
var set_4 = require("./endpoints/objects/membership/set");
// Objects API
var createUserEndpointConfig = require("./endpoints/users/create_user");
var updateUserEndpointConfig = require("./endpoints/users/update_user");
var deleteUserEndpointConfig = require("./endpoints/users/delete_user");
var getUserEndpointConfig = require("./endpoints/users/get_user");
var getUsersEndpointConfig = require("./endpoints/users/get_users");
var createSpaceEndpointConfig = require("./endpoints/spaces/create_space");
var updateSpaceEndpointConfig = require("./endpoints/spaces/update_space");
var deleteSpaceEndpointConfig = require("./endpoints/spaces/delete_space");
var getSpacesEndpointConfig = require("./endpoints/spaces/get_spaces");
var getSpaceEndpointConfig = require("./endpoints/spaces/get_space");
var getMembersEndpointConfig = require("./endpoints/memberships/get_members");
var addMembersEndpointConfig = require("./endpoints/memberships/add_members");
var updateMembersEndpointConfig = require("./endpoints/memberships/update_members");
var removeMembersEndpointConfig = require("./endpoints/memberships/remove_members");
var getMembershipsEndpointConfig = require("./endpoints/memberships/get_memberships");
var updateMembershipsEndpointConfig = require("./endpoints/memberships/update_memberships");
var joinSpacesEndpointConfig = require("./endpoints/memberships/join_spaces");
var leaveSpacesEndpointConfig = require("./endpoints/memberships/leave_spaces");
var auditEndpointConfig = require("./endpoints/access_manager/audit");
var grantEndpointConfig = require("./endpoints/access_manager/grant");
var grantTokenEndpointConfig = require("./endpoints/access_manager/grant_token");
var revoke_token_1 = require("./endpoints/access_manager/revoke_token");
var publishEndpointConfig = require("./endpoints/publish");
var signalEndpointConfig = require("./endpoints/signal");
var historyEndpointConfig = require("./endpoints/history/get_history");
var deleteMessagesEndpointConfig = require("./endpoints/history/delete_messages");
var messageCountsEndpointConfig = require("./endpoints/history/message_counts");
var fetchMessagesEndpointConfig = require("./endpoints/fetch_messages");
var timeEndpointConfig = require("./endpoints/time");
var subscribeEndpointConfig = require("./endpoints/subscribe");
// subscription utilities
var handshake_1 = require("./endpoints/subscriptionUtils/handshake");
var receiveMessages_1 = require("./endpoints/subscriptionUtils/receiveMessages");
var operations_1 = require("./constants/operations");
var categories_1 = require("./constants/categories");
var uuid_1 = require("./components/uuid");
var event_engine_1 = require("../event-engine");
var default_1 = /** @class */ (function () {
    //
    function default_1(setup) {
        var _this = this;
        var networking = setup.networking, cbor = setup.cbor;
        var config = new config_1.default({ setup: setup });
        this._config = config;
        var crypto = new index_1.default({ config: config }); // LEGACY
        var cryptography = setup.cryptography;
        networking.init(config);
        var tokenManager = new token_manager_1.default(config, cbor);
        this._tokenManager = tokenManager;
        var telemetryManager = new telemetry_manager_1.default({
            maximumSamplesCount: 60000,
        });
        this._telemetryManager = telemetryManager;
        var modules = {
            config: config,
            networking: networking,
            crypto: crypto,
            cryptography: cryptography,
            tokenManager: tokenManager,
            telemetryManager: telemetryManager,
            PubNubFile: setup.PubNubFile,
        };
        this.File = setup.PubNubFile;
        this.encryptFile = function (key, file) { return cryptography.encryptFile(key, file, _this.File); };
        this.decryptFile = function (key, file) { return cryptography.decryptFile(key, file, _this.File); };
        var timeEndpoint = endpoint_1.default.bind(this, modules, timeEndpointConfig);
        var leaveEndpoint = endpoint_1.default.bind(this, modules, presenceLeaveEndpointConfig);
        var heartbeatEndpoint = endpoint_1.default.bind(this, modules, presenceHeartbeatEndpointConfig);
        var setStateEndpoint = endpoint_1.default.bind(this, modules, presenceSetStateConfig);
        var subscribeEndpoint = endpoint_1.default.bind(this, modules, subscribeEndpointConfig);
        // managers
        var listenerManager = new listener_manager_1.default();
        this._listenerManager = listenerManager;
        this.iAmHere = endpoint_1.default.bind(this, modules, presenceHeartbeatEndpointConfig);
        this.iAmAway = endpoint_1.default.bind(this, modules, presenceLeaveEndpointConfig);
        this.setPresenceState = endpoint_1.default.bind(this, modules, presenceSetStateConfig);
        this.handshake = endpoint_1.default.bind(this, modules, handshake_1.default);
        this.receiveMessages = endpoint_1.default.bind(this, modules, receiveMessages_1.default);
        if (config.enableSubscribeBeta === true) {
            var eventEngine = new event_engine_1.EventEngine({ handshake: this.handshake, receiveEvents: this.receiveMessages });
            this.subscribe = eventEngine.subscribe.bind(eventEngine);
            this.unsubscribe = eventEngine.unsubscribe.bind(eventEngine);
            this.eventEngine = eventEngine;
        }
        else {
            var subscriptionManager_1 = new subscription_manager_1.default({
                timeEndpoint: timeEndpoint,
                leaveEndpoint: leaveEndpoint,
                heartbeatEndpoint: heartbeatEndpoint,
                setStateEndpoint: setStateEndpoint,
                subscribeEndpoint: subscribeEndpoint,
                crypto: modules.crypto,
                config: modules.config,
                listenerManager: listenerManager,
                getFileUrl: function (params) { return (0, get_file_url_1.default)(modules, params); },
            });
            this.subscribe = subscriptionManager_1.adaptSubscribeChange.bind(subscriptionManager_1);
            this.unsubscribe = subscriptionManager_1.adaptUnsubscribeChange.bind(subscriptionManager_1);
            this.disconnect = subscriptionManager_1.disconnect.bind(subscriptionManager_1);
            this.reconnect = subscriptionManager_1.reconnect.bind(subscriptionManager_1);
            this.unsubscribeAll = subscriptionManager_1.unsubscribeAll.bind(subscriptionManager_1);
            this.getSubscribedChannels = subscriptionManager_1.getSubscribedChannels.bind(subscriptionManager_1);
            this.getSubscribedChannelGroups = subscriptionManager_1.getSubscribedChannelGroups.bind(subscriptionManager_1);
            this.setState = subscriptionManager_1.adaptStateChange.bind(subscriptionManager_1);
            this.presence = subscriptionManager_1.adaptPresenceChange.bind(subscriptionManager_1);
            this.destroy = function (isOffline) {
                subscriptionManager_1.unsubscribeAll(isOffline);
                subscriptionManager_1.disconnect();
            };
        }
        this.addListener = listenerManager.addListener.bind(listenerManager);
        this.removeListener = listenerManager.removeListener.bind(listenerManager);
        this.removeAllListeners = listenerManager.removeAllListeners.bind(listenerManager);
        this.parseToken = tokenManager.parseToken.bind(tokenManager);
        this.setToken = tokenManager.setToken.bind(tokenManager);
        this.getToken = tokenManager.getToken.bind(tokenManager);
        /* channel groups */
        this.channelGroups = {
            listGroups: endpoint_1.default.bind(this, modules, listChannelGroupsConfig),
            listChannels: endpoint_1.default.bind(this, modules, listChannelsInChannelGroupConfig),
            addChannels: endpoint_1.default.bind(this, modules, addChannelsChannelGroupConfig),
            removeChannels: endpoint_1.default.bind(this, modules, removeChannelsChannelGroupConfig),
            deleteGroup: endpoint_1.default.bind(this, modules, deleteChannelGroupConfig),
        };
        /* push */
        this.push = {
            addChannels: endpoint_1.default.bind(this, modules, addPushChannelsConfig),
            removeChannels: endpoint_1.default.bind(this, modules, removePushChannelsConfig),
            deleteDevice: endpoint_1.default.bind(this, modules, removeDevicePushConfig),
            listChannels: endpoint_1.default.bind(this, modules, listPushChannelsConfig),
        };
        /* presence */
        this.hereNow = endpoint_1.default.bind(this, modules, presenceHereNowConfig);
        this.whereNow = endpoint_1.default.bind(this, modules, presenceWhereNowEndpointConfig);
        this.getState = endpoint_1.default.bind(this, modules, presenceGetStateConfig);
        /* PAM */
        this.grant = endpoint_1.default.bind(this, modules, grantEndpointConfig);
        this.grantToken = endpoint_1.default.bind(this, modules, grantTokenEndpointConfig);
        this.audit = endpoint_1.default.bind(this, modules, auditEndpointConfig);
        this.revokeToken = endpoint_1.default.bind(this, modules, revoke_token_1.default);
        this.publish = endpoint_1.default.bind(this, modules, publishEndpointConfig);
        this.fire = function (args, callback) {
            args.replicate = false;
            args.storeInHistory = false;
            return _this.publish(args, callback);
        };
        this.signal = endpoint_1.default.bind(this, modules, signalEndpointConfig);
        this.history = endpoint_1.default.bind(this, modules, historyEndpointConfig);
        this.deleteMessages = endpoint_1.default.bind(this, modules, deleteMessagesEndpointConfig);
        this.messageCounts = endpoint_1.default.bind(this, modules, messageCountsEndpointConfig);
        this.fetchMessages = endpoint_1.default.bind(this, modules, fetchMessagesEndpointConfig);
        // Actions API
        this.addMessageAction = endpoint_1.default.bind(this, modules, addMessageActionEndpointConfig);
        this.removeMessageAction = endpoint_1.default.bind(this, modules, removeMessageActionEndpointConfig);
        this.getMessageActions = endpoint_1.default.bind(this, modules, getMessageActionEndpointConfig);
        // File Upload API v1
        this.listFiles = endpoint_1.default.bind(this, modules, list_files_1.default);
        var generateUploadUrl = endpoint_1.default.bind(this, modules, generate_upload_url_1.default);
        this.publishFile = endpoint_1.default.bind(this, modules, publish_file_1.default);
        this.sendFile = (0, send_file_1.default)({
            generateUploadUrl: generateUploadUrl,
            publishFile: this.publishFile,
            modules: modules,
        });
        this.getFileUrl = function (params) { return (0, get_file_url_1.default)(modules, params); };
        this.downloadFile = endpoint_1.default.bind(this, modules, download_file_1.default);
        this.deleteFile = endpoint_1.default.bind(this, modules, delete_file_1.default);
        // Objects API v2
        this.objects = {
            getAllUUIDMetadata: endpoint_1.default.bind(this, modules, get_all_1.default),
            getUUIDMetadata: endpoint_1.default.bind(this, modules, get_1.default),
            setUUIDMetadata: endpoint_1.default.bind(this, modules, set_1.default),
            removeUUIDMetadata: endpoint_1.default.bind(this, modules, remove_1.default),
            getAllChannelMetadata: endpoint_1.default.bind(this, modules, get_all_2.default),
            getChannelMetadata: endpoint_1.default.bind(this, modules, get_2.default),
            setChannelMetadata: endpoint_1.default.bind(this, modules, set_2.default),
            removeChannelMetadata: endpoint_1.default.bind(this, modules, remove_2.default),
            getChannelMembers: endpoint_1.default.bind(this, modules, get_3.default),
            setChannelMembers: function (parameters) {
                var rest = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    rest[_i - 1] = arguments[_i];
                }
                return endpoint_1.default.call.apply(endpoint_1.default, __spreadArray([_this,
                    modules,
                    set_3.default, __assign({ type: 'set' }, parameters)], __read(rest), false));
            },
            removeChannelMembers: function (parameters) {
                var rest = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    rest[_i - 1] = arguments[_i];
                }
                return endpoint_1.default.call.apply(endpoint_1.default, __spreadArray([_this,
                    modules,
                    set_3.default, __assign({ type: 'delete' }, parameters)], __read(rest), false));
            },
            getMemberships: endpoint_1.default.bind(this, modules, get_4.default),
            setMemberships: function (parameters) {
                var rest = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    rest[_i - 1] = arguments[_i];
                }
                return endpoint_1.default.call.apply(endpoint_1.default, __spreadArray([_this,
                    modules,
                    set_4.default, __assign({ type: 'set' }, parameters)], __read(rest), false));
            },
            removeMemberships: function (parameters) {
                var rest = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    rest[_i - 1] = arguments[_i];
                }
                return endpoint_1.default.call.apply(endpoint_1.default, __spreadArray([_this,
                    modules,
                    set_4.default, __assign({ type: 'delete' }, parameters)], __read(rest), false));
            },
        };
        // Objects API
        this.createUser = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, createUserEndpointConfig));
        this.updateUser = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, updateUserEndpointConfig));
        this.deleteUser = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, deleteUserEndpointConfig));
        this.getUser = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, getUserEndpointConfig));
        this.getUsers = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, getUsersEndpointConfig));
        this.createSpace = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, createSpaceEndpointConfig));
        this.updateSpace = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, updateSpaceEndpointConfig));
        this.deleteSpace = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, deleteSpaceEndpointConfig));
        this.getSpaces = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, getSpacesEndpointConfig));
        this.getSpace = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, getSpaceEndpointConfig));
        this.addMembers = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, addMembersEndpointConfig));
        this.updateMembers = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, updateMembersEndpointConfig));
        this.removeMembers = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, removeMembersEndpointConfig));
        this.getMembers = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, getMembersEndpointConfig));
        this.getMemberships = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, getMembershipsEndpointConfig));
        this.joinSpaces = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, joinSpacesEndpointConfig));
        this.updateMemberships = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, updateMembershipsEndpointConfig));
        this.leaveSpaces = (0, utils_1.deprecated)(endpoint_1.default.bind(this, modules, leaveSpacesEndpointConfig));
        this.time = timeEndpoint;
        // --- deprecated  ------------------
        this.stop = this.destroy; // --------
        // --- deprecated  ------------------
        // mount crypto
        this.encrypt = crypto.encrypt.bind(crypto);
        this.decrypt = crypto.decrypt.bind(crypto);
        /* config */
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
    default_1.prototype.getVersion = function () {
        return this._config.getVersion();
    };
    default_1.prototype._addPnsdkSuffix = function (name, suffix) {
        this._config._addPnsdkSuffix(name, suffix);
    };
    // network hooks to indicate network changes
    default_1.prototype.networkDownDetected = function () {
        this._listenerManager.announceNetworkDown();
        if (this._config.restore) {
            this.disconnect();
        }
        else {
            this.destroy(true);
        }
    };
    default_1.prototype.networkUpDetected = function () {
        this._listenerManager.announceNetworkUp();
        this.reconnect();
    };
    default_1.notificationPayload = function (title, body) {
        return new push_payload_1.default(title, body);
    };
    default_1.generateUUID = function () {
        return uuid_1.default.createUUID();
    };
    default_1.OPERATIONS = operations_1.default;
    default_1.CATEGORIES = categories_1.default;
    return default_1;
}());
exports.default = default_1;
