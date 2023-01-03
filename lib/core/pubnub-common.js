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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = __importDefault(require("./components/config"));
var index_1 = __importDefault(require("./components/cryptography/index"));
var subscription_manager_1 = __importDefault(require("./components/subscription_manager"));
var telemetry_manager_1 = __importDefault(require("./components/telemetry_manager"));
var push_payload_1 = __importDefault(require("./components/push_payload"));
var listener_manager_1 = __importDefault(require("./components/listener_manager"));
var token_manager_1 = __importDefault(require("./components/token_manager"));
var endpoint_1 = __importDefault(require("./components/endpoint"));
var addChannelsChannelGroupConfig = __importStar(require("./endpoints/channel_groups/add_channels"));
var removeChannelsChannelGroupConfig = __importStar(require("./endpoints/channel_groups/remove_channels"));
var deleteChannelGroupConfig = __importStar(require("./endpoints/channel_groups/delete_group"));
var listChannelGroupsConfig = __importStar(require("./endpoints/channel_groups/list_groups"));
var listChannelsInChannelGroupConfig = __importStar(require("./endpoints/channel_groups/list_channels"));
var addPushChannelsConfig = __importStar(require("./endpoints/push/add_push_channels"));
var removePushChannelsConfig = __importStar(require("./endpoints/push/remove_push_channels"));
var listPushChannelsConfig = __importStar(require("./endpoints/push/list_push_channels"));
var removeDevicePushConfig = __importStar(require("./endpoints/push/remove_device"));
var presenceLeaveEndpointConfig = __importStar(require("./endpoints/presence/leave"));
var presenceWhereNowEndpointConfig = __importStar(require("./endpoints/presence/where_now"));
var presenceHeartbeatEndpointConfig = __importStar(require("./endpoints/presence/heartbeat"));
var presenceGetStateConfig = __importStar(require("./endpoints/presence/get_state"));
var presenceSetStateConfig = __importStar(require("./endpoints/presence/set_state"));
var presenceHereNowConfig = __importStar(require("./endpoints/presence/here_now"));
// Actions API
var addMessageActionEndpointConfig = __importStar(require("./endpoints/actions/add_message_action"));
var removeMessageActionEndpointConfig = __importStar(require("./endpoints/actions/remove_message_action"));
var getMessageActionEndpointConfig = __importStar(require("./endpoints/actions/get_message_actions"));
// File Upload API v1
var list_files_1 = __importDefault(require("./endpoints/file_upload/list_files"));
var generate_upload_url_1 = __importDefault(require("./endpoints/file_upload/generate_upload_url"));
var publish_file_1 = __importDefault(require("./endpoints/file_upload/publish_file"));
var send_file_1 = __importDefault(require("./endpoints/file_upload/send_file"));
var get_file_url_1 = __importDefault(require("./endpoints/file_upload/get_file_url"));
var download_file_1 = __importDefault(require("./endpoints/file_upload/download_file"));
var delete_file_1 = __importDefault(require("./endpoints/file_upload/delete_file"));
// Object API v2
var get_all_1 = __importDefault(require("./endpoints/objects/uuid/get_all"));
var get_1 = __importDefault(require("./endpoints/objects/uuid/get"));
var set_1 = __importDefault(require("./endpoints/objects/uuid/set"));
var remove_1 = __importDefault(require("./endpoints/objects/uuid/remove"));
var get_all_2 = __importDefault(require("./endpoints/objects/channel/get_all"));
var get_2 = __importDefault(require("./endpoints/objects/channel/get"));
var set_2 = __importDefault(require("./endpoints/objects/channel/set"));
var remove_2 = __importDefault(require("./endpoints/objects/channel/remove"));
var get_3 = __importDefault(require("./endpoints/objects/member/get"));
var set_3 = __importDefault(require("./endpoints/objects/member/set"));
var get_4 = __importDefault(require("./endpoints/objects/membership/get"));
var set_4 = __importDefault(require("./endpoints/objects/membership/set"));
var auditEndpointConfig = __importStar(require("./endpoints/access_manager/audit"));
var grantEndpointConfig = __importStar(require("./endpoints/access_manager/grant"));
var grantTokenEndpointConfig = __importStar(require("./endpoints/access_manager/grant_token"));
var revoke_token_1 = __importDefault(require("./endpoints/access_manager/revoke_token"));
var publishEndpointConfig = __importStar(require("./endpoints/publish"));
var signalEndpointConfig = __importStar(require("./endpoints/signal"));
var historyEndpointConfig = __importStar(require("./endpoints/history/get_history"));
var deleteMessagesEndpointConfig = __importStar(require("./endpoints/history/delete_messages"));
var messageCountsEndpointConfig = __importStar(require("./endpoints/history/message_counts"));
var fetchMessagesEndpointConfig = __importStar(require("./endpoints/fetch_messages"));
var timeEndpointConfig = __importStar(require("./endpoints/time"));
var subscribeEndpointConfig = __importStar(require("./endpoints/subscribe"));
// subscription utilities
var handshake_1 = __importDefault(require("./endpoints/subscriptionUtils/handshake"));
var receiveMessages_1 = __importDefault(require("./endpoints/subscriptionUtils/receiveMessages"));
var operations_1 = __importDefault(require("./constants/operations"));
var categories_1 = __importDefault(require("./constants/categories"));
var uuid_1 = __importDefault(require("./components/uuid"));
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
        // User Apis
        this.createUser = function (args) {
            return _this.objects.setUUIDMetadata({
                uuid: args.userId,
                data: args.data,
                include: args.include,
            });
        };
        this.updateUser = this.createUser;
        this.removeUser = function (args) {
            return _this.objects.removeUUIDMetadata({
                uuid: args === null || args === void 0 ? void 0 : args.userId,
            });
        };
        this.fetchUser = function (args) {
            return _this.objects.getUUIDMetadata({
                uuid: args === null || args === void 0 ? void 0 : args.userId,
                include: args === null || args === void 0 ? void 0 : args.include,
            });
        };
        this.fetchUsers = this.objects.getAllUUIDMetadata;
        // Space apis
        this.createSpace = function (args) {
            return _this.objects.setChannelMetadata({
                channel: args.spaceId,
                data: args.data,
                include: args.include,
            });
        };
        this.updateSpace = this.createSpace;
        this.removeSpace = function (args) {
            return _this.objects.removeChannelMetadata({
                channel: args.spaceId,
            });
        };
        this.fetchSpace = function (args) {
            return _this.objects.getChannelMetadata({
                channel: args.spaceId,
                include: args.include,
            });
        };
        this.fetchSpaces = this.objects.getAllChannelMetadata;
        // Membership apis
        this.addMemberships = function (parameters) {
            var _a, _b;
            if (typeof parameters.spaceId === 'string') {
                return _this.objects.setChannelMembers({
                    channel: parameters.spaceId,
                    uuids: (_a = parameters.users) === null || _a === void 0 ? void 0 : _a.map(function (user) {
                        if (typeof user === 'string') {
                            return user;
                        }
                        return {
                            id: user.userId,
                            custom: user.custom,
                            status: user.status,
                        };
                    }),
                    limit: 0,
                });
            }
            else {
                return _this.objects.setMemberships({
                    uuid: parameters.userId,
                    channels: (_b = parameters.spaces) === null || _b === void 0 ? void 0 : _b.map(function (space) {
                        if (typeof space === 'string') {
                            return space;
                        }
                        return {
                            id: space.spaceId,
                            custom: space.custom,
                            status: space.status,
                        };
                    }),
                    limit: 0,
                });
            }
        };
        this.updateMemberships = this.addMemberships;
        this.removeMemberships = function (parameters) {
            if (typeof parameters.spaceId === 'string') {
                return _this.objects.removeChannelMembers({
                    channel: parameters.spaceId,
                    uuids: parameters.userIds,
                    limit: 0,
                });
            }
            else {
                return _this.objects.removeMemberships({
                    uuid: parameters.userId,
                    channels: parameters.spaceIds,
                    limit: 0,
                });
            }
        };
        this.fetchMemberships = function (params) {
            if (typeof params.spaceId === 'string') {
                return _this.objects
                    .getChannelMembers({
                    channel: params.spaceId,
                    filter: params.filter,
                    limit: params.limit,
                    page: params.page,
                    include: {
                        customFields: params.include.customFields,
                        UUIDFields: params.include.userFields,
                        customUUIDFields: params.include.customUserFields,
                        totalCount: params.include.totalCount,
                    },
                    sort: params.sort != null
                        ? Object.fromEntries(Object.entries(params.sort).map(function (_a) {
                            var _b = __read(_a, 2), k = _b[0], v = _b[1];
                            return [k.replace('user', 'uuid'), v];
                        }))
                        : null,
                })
                    .then(function (res) {
                    var _a;
                    res.data = (_a = res.data) === null || _a === void 0 ? void 0 : _a.map(function (m) {
                        return {
                            user: m.uuid,
                            custom: m.custom,
                            updated: m.updated,
                            eTag: m.eTag,
                        };
                    });
                    return res;
                });
            }
            else {
                return _this.objects
                    .getMemberships({
                    uuid: params.userId,
                    filter: params.filter,
                    limit: params.limit,
                    page: params.page,
                    include: {
                        customFields: params.include.customFields,
                        channelFields: params.include.spaceFields,
                        customChannelFields: params.include.customSpaceFields,
                        totalCount: params.include.totalCount,
                    },
                    sort: params.sort != null
                        ? Object.fromEntries(Object.entries(params.sort).map(function (_a) {
                            var _b = __read(_a, 2), k = _b[0], v = _b[1];
                            return [k.replace('space', 'channel'), v];
                        }))
                        : null,
                })
                    .then(function (res) {
                    var _a;
                    res.data = (_a = res.data) === null || _a === void 0 ? void 0 : _a.map(function (m) {
                        return {
                            space: m.channel,
                            custom: m.custom,
                            updated: m.updated,
                            eTag: m.eTag,
                        };
                    });
                    return res;
                });
            }
        };
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
