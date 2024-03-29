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
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubNubCore = void 0;
// region Imports
// region Components
var listener_manager_1 = require("./components/listener_manager");
var subscription_manager_1 = require("./components/subscription-manager");
var push_payload_1 = __importDefault(require("./components/push_payload"));
var eventEmitter_1 = __importDefault(require("./components/eventEmitter"));
var base64_codec_1 = require("./components/base64_codec");
var uuid_1 = __importDefault(require("./components/uuid"));
// endregion
// region Constants
var operations_1 = __importDefault(require("./constants/operations"));
var categories_1 = __importDefault(require("./constants/categories"));
// endregion
var PubNubError_1 = require("../models/PubNubError");
// region Event Engine
var presence_1 = require("../event-engine/presence/presence");
var retryPolicy_1 = require("../event-engine/core/retryPolicy");
var event_engine_1 = require("../event-engine");
// endregion
// region Publish & Signal
var Publish = __importStar(require("./endpoints/publish"));
var Signal = __importStar(require("./endpoints/signal"));
// endregion
// region Subscription
var subscribe_1 = require("./endpoints/subscribe");
var receiveMessages_1 = require("./endpoints/subscriptionUtils/receiveMessages");
var handshake_1 = require("./endpoints/subscriptionUtils/handshake");
// endregion
// region Presence
var get_state_1 = require("./endpoints/presence/get_state");
var set_state_1 = require("./endpoints/presence/set_state");
var heartbeat_1 = require("./endpoints/presence/heartbeat");
var leave_1 = require("./endpoints/presence/leave");
var where_now_1 = require("./endpoints/presence/where_now");
var here_now_1 = require("./endpoints/presence/here_now");
// endregion
// region Message Storage
var delete_messages_1 = require("./endpoints/history/delete_messages");
var message_counts_1 = require("./endpoints/history/message_counts");
var get_history_1 = require("./endpoints/history/get_history");
var fetch_messages_1 = require("./endpoints/fetch_messages");
// endregion
// region Message Actions
var get_message_actions_1 = require("./endpoints/actions/get_message_actions");
var add_message_action_1 = require("./endpoints/actions/add_message_action");
var remove_message_action_1 = require("./endpoints/actions/remove_message_action");
// endregion
// region File sharing
var publish_file_1 = require("./endpoints/file_upload/publish_file");
var get_file_url_1 = require("./endpoints/file_upload/get_file_url");
var delete_file_1 = require("./endpoints/file_upload/delete_file");
var list_files_1 = require("./endpoints/file_upload/list_files");
var send_file_1 = require("./endpoints/file_upload/send_file");
// endregion
// region PubNub Access Manager
var revoke_token_1 = require("./endpoints/access_manager/revoke_token");
var grant_token_1 = require("./endpoints/access_manager/grant_token");
var grant_1 = require("./endpoints/access_manager/grant");
var audit_1 = require("./endpoints/access_manager/audit");
var ChannelMetadata_1 = require("../entities/ChannelMetadata");
var SubscriptionSet_1 = require("../entities/SubscriptionSet");
var ChannelGroup_1 = require("../entities/ChannelGroup");
var UserMetadata_1 = require("../entities/UserMetadata");
var Channel_1 = require("../entities/Channel");
// endregion
// region Channel Groups
var pubnub_channel_groups_1 = __importDefault(require("./pubnub-channel-groups"));
// endregion
// region Push Notifications
var pubnub_push_1 = __importDefault(require("./pubnub-push"));
var pubnub_objects_1 = __importDefault(require("./pubnub-objects"));
// endregion
// region Time
var Time = __importStar(require("./endpoints/time"));
// endregion
var utils_1 = require("./utils");
var download_file_1 = require("./endpoints/file_upload/download_file");
// endregion
/**
 * Platform-agnostic PubNub client core.
 */
var PubNubCore = /** @class */ (function () {
    // endregion
    function PubNubCore(configuration) {
        var _this = this;
        var _a, _b, _c;
        this._configuration = configuration.configuration;
        this.cryptography = configuration.cryptography;
        this.tokenManager = configuration.tokenManager;
        this.transport = configuration.transport;
        this.crypto = configuration.crypto;
        // API group entry points initialization.
        this._objects = new pubnub_objects_1.default(this._configuration, this.sendRequest);
        this._channelGroups = new pubnub_channel_groups_1.default(this._configuration.keySet, this.sendRequest);
        this._push = new pubnub_push_1.default(this._configuration.keySet, this.sendRequest);
        // Prepare for real-time events announcement.
        this.listenerManager = new listener_manager_1.ListenerManager();
        this.eventEmitter = new eventEmitter_1.default(this.listenerManager);
        if (this._configuration.enableEventEngine) {
            var heartbeatInterval_1 = this._configuration.getHeartbeatInterval();
            this.presenceState = {};
            if (heartbeatInterval_1) {
                this.presenceEventEngine = new presence_1.PresenceEventEngine({
                    heartbeat: this.heartbeat,
                    leave: this.unsubscribe,
                    heartbeatDelay: function () {
                        return new Promise(function (resolve, reject) {
                            heartbeatInterval_1 = _this._configuration.getHeartbeatInterval();
                            if (!heartbeatInterval_1)
                                reject(new PubNubError_1.PubNubError('Heartbeat interval has been reset.'));
                            else
                                setTimeout(resolve, heartbeatInterval_1 * 1000);
                        });
                    },
                    retryDelay: function (amount) { return new Promise(function (resolve) { return setTimeout(resolve, amount); }); },
                    emitStatus: function (status) { return _this.listenerManager.announceStatus(status); },
                    config: this._configuration,
                    presenceState: this.presenceState,
                });
            }
            this.eventEngine = new event_engine_1.EventEngine({
                handshake: this.subscribeHandshake,
                receiveMessages: this.subscribeReceiveMessages,
                delay: function (amount) { return new Promise(function (resolve) { return setTimeout(resolve, amount); }); },
                join: (_a = this.presenceEventEngine) === null || _a === void 0 ? void 0 : _a.join,
                leave: (_b = this.presenceEventEngine) === null || _b === void 0 ? void 0 : _b.leave,
                leaveAll: (_c = this.presenceEventEngine) === null || _c === void 0 ? void 0 : _c.leaveAll,
                presenceState: this.presenceState,
                config: this._configuration,
                emitMessages: function (events) { return events.forEach(function (event) { return _this.eventEmitter.emitEvent(event); }); },
                emitStatus: function (status) { return _this.listenerManager.announceStatus(status); },
            });
        }
        else {
            this.subscriptionManager = new subscription_manager_1.SubscriptionManager(this._configuration, this.listenerManager, this.eventEmitter, this.makeSubscribe, this.heartbeat, this.makeUnsubscribe, this.time);
        }
    }
    /**
     * Construct notification payload which will trigger push notification.
     *
     * @param title - Title which will be shown on notification.
     * @param body - Payload which will be sent as part of notification.
     *
     * @returns Pre-formatted message payload which will trigger push notification.
     */
    PubNubCore.notificationPayload = function (title, body) {
        return new push_payload_1.default(title, body);
    };
    /**
     * Generate unique identifier.
     *
     * @returns Unique identifier.
     */
    PubNubCore.generateUUID = function () {
        return uuid_1.default.createUUID();
    };
    Object.defineProperty(PubNubCore.prototype, "configuration", {
        // --------------------------------------------------------
        // -------------------- Configuration ----------------------
        // --------------------------------------------------------
        // region Configuration
        /**
         * PubNub client configuration.
         *
         * @returns Currently user PubNub client configuration.
         */
        get: function () {
            return this._configuration;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PubNubCore.prototype, "_config", {
        /**
         * Current PubNub client configuration.
         *
         * @returns Currently user PubNub client configuration.
         *
         * @deprecated Use {@link configuration} getter instead.
         */
        get: function () {
            return this.configuration;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PubNubCore.prototype, "authKey", {
        /**
         * REST API endpoint access authorization key.
         *
         * It is required to have `authorization key` with required permissions to access REST API
         * endpoints when `PAM` enabled for user key set.
         */
        get: function () {
            var _a;
            return (_a = this._configuration.authKey) !== null && _a !== void 0 ? _a : undefined;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * REST API endpoint access authorization key.
     *
     * It is required to have `authorization key` with required permissions to access REST API
     * endpoints when `PAM` enabled for user key set.
     */
    PubNubCore.prototype.getAuthKey = function () {
        return this.authKey;
    };
    /**
     * Change REST API endpoint access authorization key.
     *
     * @param authKey - New authorization key which should be used with new requests.
     */
    PubNubCore.prototype.setAuthKey = function (authKey) {
        this._configuration.setAuthKey(authKey);
    };
    Object.defineProperty(PubNubCore.prototype, "userId", {
        /**
         * Get a PubNub client user identifier.
         *
         * @returns Current PubNub client user identifier.
         */
        get: function () {
            return this._configuration.userId;
        },
        /**
         * Change the current PubNub client user identifier.
         *
         * **Important:** Change won't affect ongoing REST API calls.
         *
         * @param value - New PubNub client user identifier.
         *
         * @throws Error empty user identifier has been provided.
         */
        set: function (value) {
            this._configuration.userId = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get a PubNub client user identifier.
     *
     * @returns Current PubNub client user identifier.
     */
    PubNubCore.prototype.getUserId = function () {
        return this._configuration.userId;
    };
    /**
     * Change the current PubNub client user identifier.
     *
     * **Important:** Change won't affect ongoing REST API calls.
     *
     * @param value - New PubNub client user identifier.
     *
     * @throws Error empty user identifier has been provided.
     */
    PubNubCore.prototype.setUserId = function (value) {
        this._configuration.userId = value;
    };
    Object.defineProperty(PubNubCore.prototype, "filterExpression", {
        /**
         * Real-time updates filtering expression.
         *
         * @returns Filtering expression.
         */
        get: function () {
            var _a;
            return (_a = this._configuration.getFilterExpression()) !== null && _a !== void 0 ? _a : undefined;
        },
        /**
         * Update real-time updates filtering expression.
         *
         * @param expression - New expression which should be used or `undefined` to disable filtering.
         */
        set: function (expression) {
            this._configuration.setFilterExpression(expression);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Real-time updates filtering expression.
     *
     * @returns Filtering expression.
     */
    PubNubCore.prototype.getFilterExpression = function () {
        return this.filterExpression;
    };
    /**
     * Update real-time updates filtering expression.
     *
     * @param expression - New expression which should be used or `undefined` to disable filtering.
     */
    PubNubCore.prototype.setFilterExpression = function (expression) {
        this.filterExpression = expression;
    };
    Object.defineProperty(PubNubCore.prototype, "cipherKey", {
        /**
         * Dta encryption / decryption key.
         *
         * @returns Currently used key for data encryption / decryption.
         */
        get: function () {
            return this._configuration.cipherKey;
        },
        /**
         * Change data encryption / decryption key.
         *
         * @param key - New key which should be used for data encryption / decryption.
         */
        set: function (key) {
            this._configuration.setCipherKey(key);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Change data encryption / decryption key.
     *
     * @param key - New key which should be used for data encryption / decryption.
     */
    PubNubCore.prototype.setCipherKey = function (key) {
        this.cipherKey = key;
    };
    Object.defineProperty(PubNubCore.prototype, "heartbeatInterval", {
        /**
         * Change heartbeat requests interval.
         *
         * @param interval - New presence request heartbeat intervals.
         */
        set: function (interval) {
            this._configuration.setHeartbeatInterval(interval);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Change heartbeat requests interval.
     *
     * @param interval - New presence request heartbeat intervals.
     */
    PubNubCore.prototype.setHeartbeatInterval = function (interval) {
        this.heartbeatInterval = interval;
    };
    /**
     * Get PubNub SDK version.
     *
     * @returns Current SDK version.
     */
    PubNubCore.prototype.getVersion = function () {
        return this._configuration.version;
    };
    /**
     * Add framework's prefix.
     *
     * @param name - Name of the framework which would want to add own data into `pnsdk` suffix.
     * @param suffix - Suffix with information about framework.
     */
    PubNubCore.prototype._addPnsdkSuffix = function (name, suffix) {
        this._configuration._addPnsdkSuffix(name, suffix);
    };
    // --------------------------------------------------------
    // ---------------------- Deprecated ----------------------
    // --------------------------------------------------------
    // region Deprecated
    /**
     * Get a PubNub client user identifier.
     *
     * @returns Current PubNub client user identifier.
     *
     * @deprecated Use the {@link getUserId} or {@link userId} getter instead.
     */
    PubNubCore.prototype.getUUID = function () {
        return this.userId;
    };
    /**
     * Change the current PubNub client user identifier.
     *
     * **Important:** Change won't affect ongoing REST API calls.
     *
     * @param value - New PubNub client user identifier.
     *
     * @throws Error empty user identifier has been provided.
     *
     * @deprecated Use the {@link PubNubCore#setUserId} or {@link PubNubCore#userId} setter instead.
     */
    PubNubCore.prototype.setUUID = function (value) {
        this.userId = value;
    };
    Object.defineProperty(PubNubCore.prototype, "customEncrypt", {
        /**
         * Custom data encryption method.
         *
         * @deprecated Instead use {@link cryptoModule} for data encryption.
         */
        get: function () {
            return this._configuration.customEncrypt;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PubNubCore.prototype, "customDecrypt", {
        /**
         * Custom data decryption method.
         *
         * @deprecated Instead use {@link cryptoModule} for data decryption.
         */
        get: function () {
            return this._configuration.customDecrypt;
        },
        enumerable: false,
        configurable: true
    });
    // endregion
    // endregion
    // --------------------------------------------------------
    // ---------------------- Entities ------------------------
    // --------------------------------------------------------
    // region Entities
    /**
     * Create a `Channel` entity.
     *
     * Entity can be used for the interaction with the following API:
     * - `subscribe`
     *
     * @param name - Unique channel name.
     * @returns `Channel` entity.
     */
    PubNubCore.prototype.channel = function (name) {
        return new Channel_1.Channel(name, this.eventEmitter, this);
    };
    /**
     * Create a `ChannelGroup` entity.
     *
     * Entity can be used for the interaction with the following API:
     * - `subscribe`
     *
     * @param name - Unique channel group name.
     * @returns `ChannelGroup` entity.
     */
    PubNubCore.prototype.channelGroup = function (name) {
        return new ChannelGroup_1.ChannelGroup(name, this.eventEmitter, this);
    };
    /**
     * Create a `ChannelMetadata` entity.
     *
     * Entity can be used for the interaction with the following API:
     * - `subscribe`
     *
     * @param id - Unique channel metadata object identifier.
     * @returns `ChannelMetadata` entity.
     */
    PubNubCore.prototype.channelMetadata = function (id) {
        return new ChannelMetadata_1.ChannelMetadata(id, this.eventEmitter, this);
    };
    /**
     * Create a `UserMetadata` entity.
     *
     * Entity can be used for the interaction with the following API:
     * - `subscribe`
     *
     * @param id - Unique user metadata object identifier.
     * @returns `UserMetadata` entity.
     */
    PubNubCore.prototype.userMetadata = function (id) {
        return new UserMetadata_1.UserMetadata(id, this.eventEmitter, this);
    };
    /**
     * Create subscriptions set object.
     *
     * @param parameters - Subscriptions set configuration parameters.
     */
    PubNubCore.prototype.subscriptionSet = function (parameters) {
        return new SubscriptionSet_1.SubscriptionSet(__assign(__assign({}, parameters), { eventEmitter: this.eventEmitter, pubnub: this }));
    };
    /**
     * Schedule request execution.
     *
     * @param request - REST API request.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous request execution and response parsing result or `void` in case if
     * `callback` provided.
     *
     * @throws PubNubError in case of request processing error.
     */
    PubNubCore.prototype.sendRequest = function (request, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var validationResult, transportRequest, status, _a, sendableRequest, cancellationController;
            return __generator(this, function (_b) {
                validationResult = request.validate();
                if (validationResult) {
                    if (callback)
                        return [2 /*return*/, callback((0, PubNubError_1.createValidationError)(validationResult), null)];
                    throw new PubNubError_1.PubNubError('Validation failed, check status for details', (0, PubNubError_1.createValidationError)(validationResult));
                }
                transportRequest = request.request();
                if (transportRequest.body &&
                    typeof transportRequest.body === 'object' &&
                    'toArrayBuffer' in transportRequest.body) {
                    // Set 300 seconds file upload request delay.
                    transportRequest.timeout = 300;
                }
                else {
                    if (request.operation() === operations_1.default.PNSubscribeOperation)
                        transportRequest.timeout = this._configuration.getSubscribeTimeout();
                    else
                        transportRequest.timeout = this._configuration.getTransactionTimeout();
                }
                status = {
                    error: false,
                    operation: request.operation(),
                    statusCode: 0,
                };
                _a = __read(this.transport.makeSendable(transportRequest), 2), sendableRequest = _a[0], cancellationController = _a[1];
                /**
                 * **Important:** Because of multiple environments where JS SDK can be used control over
                 * cancellation had to be inverted to let transport provider solve request cancellation task
                 * more efficiently. As result, cancellation controller can be retrieved and used only after
                 * request will be scheduled by transport provider.
                 */
                request.cancellationController = cancellationController ? cancellationController : null;
                return [2 /*return*/, sendableRequest
                        .then(function (response) {
                        status.statusCode = response.status;
                        return request.parse(response);
                    })
                        .then(function (parsed) {
                        // Notify callback (if possible).
                        if (callback)
                            return callback(status, parsed);
                        return parsed;
                    })
                        .catch(function (error) {
                        var errorStatus = error.toStatus(request.operation());
                        // Notify callback (if possible).
                        if (callback)
                            callback(errorStatus, null);
                        throw new PubNubError_1.PubNubError('REST API request processing error, check status for details', errorStatus);
                    })];
            });
        });
    };
    /**
     * Unsubscribe from all channels and groups.
     *
     * @param isOffline - Whether `offline` presence should be notified or not.
     */
    PubNubCore.prototype.destroy = function (isOffline) {
        if (this.subscriptionManager) {
            this.subscriptionManager.unsubscribeAll(isOffline);
            this.subscriptionManager.disconnect();
        }
        else if (this.eventEngine)
            this.eventEngine.dispose();
    };
    // endregion
    // --------------------------------------------------------
    // ----------------------- Listener -----------------------
    // --------------------------------------------------------
    // region Listener
    /**
     * Register real-time events listener.
     *
     * @param listener - Listener with event callbacks to handle different types of events.
     */
    PubNubCore.prototype.addListener = function (listener) {
        this.listenerManager.addListener(listener);
    };
    /**
     * Remove real-time event listener.
     *
     * @param listener - Event listeners which should be removed.
     */
    PubNubCore.prototype.removeListener = function (listener) {
        this.listenerManager.removeListener(listener);
    };
    /**
     * Clear all real-time event listeners.
     */
    PubNubCore.prototype.removeAllListeners = function () {
        this.listenerManager.removeAllListeners();
    };
    /**
     * Publish data to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous publish data response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.publish = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new Publish.PublishRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Signal data to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous signal data response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.signal = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new Signal.SignalRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * `Fire` a data to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous signal data response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link publish} method instead.
     */
    PubNubCore.prototype.fire = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                callback !== null && callback !== void 0 ? callback : (callback = function () { });
                return [2 /*return*/, this.publish(__assign(__assign({}, parameters), { replicate: false, storeInHistory: false }), callback)];
            });
        });
    };
    // endregion
    // --------------------------------------------------------
    // -------------------- Subscribe API ---------------------
    // --------------------------------------------------------
    // region Subscribe API
    /**
     * Get list of channels on which PubNub client currently subscribed.
     *
     * @returns List of active channels.
     */
    PubNubCore.prototype.getSubscribedChannels = function () {
        if (this.subscriptionManager)
            return this.subscriptionManager.subscribedChannels;
        else if (this.eventEngine)
            return this.eventEngine.getSubscribedChannels();
        return [];
    };
    /**
     * Get list of channel groups on which PubNub client currently subscribed.
     *
     * @returns List of active channel groups.
     */
    PubNubCore.prototype.getSubscribedChannelGroups = function () {
        if (this.subscriptionManager)
            return this.subscriptionManager.subscribedChannelGroups;
        else if (this.eventEngine)
            return this.eventEngine.getSubscribedChannelGroups();
        return [];
    };
    /**
     * Subscribe to specified channels and groups real-time events.
     *
     * @param parameters - Request configuration parameters.
     */
    PubNubCore.prototype.subscribe = function (parameters) {
        if (this.subscriptionManager)
            this.subscriptionManager.subscribe(parameters);
        else if (this.eventEngine)
            this.eventEngine.subscribe(parameters);
    };
    /**
     * Perform subscribe request.
     *
     * **Note:** Method passed into managers to let them use it when required.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    PubNubCore.prototype.makeSubscribe = function (parameters, callback) {
        var _this = this;
        var request = new subscribe_1.SubscribeRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, getFileUrl: this.getFileUrl }));
        this.sendRequest(request, function (status, result) {
            if (_this.subscriptionManager && _this.subscriptionManager.abort === request.abort)
                _this.subscriptionManager.abort = null;
            callback(status, result);
        });
        /**
         * Allow subscription cancellation.
         *
         * **Note:** Had to be done after scheduling because transport provider return cancellation
         * controller only when schedule new request.
         */
        if (this.subscriptionManager)
            this.subscriptionManager.abort = request.abort;
    };
    /**
     * Unsubscribe from specified channels and groups real-time events.
     *
     * @param parameters - Request configuration parameters.
     */
    PubNubCore.prototype.unsubscribe = function (parameters) {
        if (this.subscriptionManager)
            this.subscriptionManager.unsubscribe(parameters);
        else if (this.eventEngine)
            this.eventEngine.unsubscribe(parameters);
    };
    /**
     * Perform unsubscribe request.
     *
     * **Note:** Method passed into managers to let them use it when required.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    PubNubCore.prototype.makeUnsubscribe = function (parameters, callback) {
        this.sendRequest(new leave_1.PresenceLeaveRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet })), callback);
    };
    /**
     * Unsubscribe from all channels and groups.
     */
    PubNubCore.prototype.unsubscribeAll = function () {
        if (this.subscriptionManager)
            this.subscriptionManager.unsubscribeAll();
        else if (this.eventEngine)
            this.eventEngine.unsubscribeAll();
    };
    /**
     * Temporarily disconnect from real-time events stream.
     */
    PubNubCore.prototype.disconnect = function () {
        if (this.subscriptionManager)
            this.subscriptionManager.disconnect();
        else if (this.eventEngine)
            this.eventEngine.disconnect();
    };
    /**
     * Restore connection to the real-time events stream.
     *
     * @param parameters - Reconnection catch up configuration. **Note:** available only with
     * enabled event engine.
     */
    PubNubCore.prototype.reconnect = function (parameters) {
        if (this.subscriptionManager)
            this.subscriptionManager.reconnect();
        else if (this.eventEngine)
            this.eventEngine.reconnect(parameters !== null && parameters !== void 0 ? parameters : {});
    };
    /**
     * Event engine handshake subscribe.
     *
     * @param parameters - Request configuration parameters.
     */
    PubNubCore.prototype.subscribeHandshake = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var request, abortUnsubscribe, handshakeResponse;
            return __generator(this, function (_a) {
                request = new handshake_1.HandshakeSubscribeRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule, getFileUrl: this.getFileUrl }));
                abortUnsubscribe = parameters.abortSignal.subscribe(request.abort);
                handshakeResponse = this.sendRequest(request);
                return [2 /*return*/, handshakeResponse.then(function (response) {
                        abortUnsubscribe();
                        return response.cursor;
                    })];
            });
        });
    };
    /**
     * Event engine receive messages subscribe.
     *
     * @param parameters - Request configuration parameters.
     */
    PubNubCore.prototype.subscribeReceiveMessages = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var request, abortUnsubscribe, handshakeResponse;
            return __generator(this, function (_a) {
                request = new receiveMessages_1.ReceiveMessagesSubscribeRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule, getFileUrl: this.getFileUrl }));
                abortUnsubscribe = parameters.abortSignal.subscribe(request.abort);
                handshakeResponse = this.sendRequest(request);
                return [2 /*return*/, handshakeResponse.then(function (response) {
                        abortUnsubscribe();
                        return response;
                    })];
            });
        });
    };
    /**
     * Get reactions to a specific message.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get reactions response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.getMessageActions = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new get_message_actions_1.GetMessageActionsRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Add a reaction to a specific message.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous add a reaction response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.addMessageAction = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new add_message_action_1.AddMessageActionRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Remove a reaction from a specific message.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous remove a reaction response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.removeMessageAction = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new remove_message_action_1.RemoveMessageAction(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Fetch messages history for channels.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous fetch messages response or `void` in case if `callback` provided.
     *
     * @deprecated
     */
    PubNubCore.prototype.fetchMessages = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new fetch_messages_1.FetchMessagesRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule, getFileUrl: this.getFileUrl }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Delete messages from the channel history.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous delete messages response or `void` in case if `callback` provided.
     *
     * @deprecated
     */
    PubNubCore.prototype.deleteMessages = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new delete_messages_1.DeleteMessageRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Count messages from the channels' history.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous count messages response or `void` in case if `callback` provided.
     *
     * @deprecated
     */
    PubNubCore.prototype.messageCounts = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new message_counts_1.MessageCountRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Fetch single channel history.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous fetch channel history response or `void` in case if `callback` provided.
     *
     * @deprecated
     */
    PubNubCore.prototype.history = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new get_history_1.GetHistoryRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Get channel's presence information.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get channel's presence response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.hereNow = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new here_now_1.HereNowRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Get user's presence information.
     *
     * Get list of channels to which `uuid` currently subscribed.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get user's presence response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.whereNow = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            var _a;
            return __generator(this, function (_b) {
                request = new where_now_1.WhereNowRequest({
                    uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId,
                    keySet: this._configuration.keySet,
                });
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Get associated user's data for channels and groups.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get user's data response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.getState = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            var _a;
            return __generator(this, function (_b) {
                request = new get_state_1.GetPresenceStateRequest(__assign(__assign({}, parameters), { uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId, keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Set associated user's data for channels and groups.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set user's data response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.setState = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, keySet, uuid, heartbeat, request, presenceState_1;
            var _b, _c;
            return __generator(this, function (_d) {
                _a = this._configuration, keySet = _a.keySet, uuid = _a.userId;
                heartbeat = this._configuration.getPresenceTimeout();
                // Maintain presence information (if required).
                if (this._configuration.enableEventEngine && this.presenceState) {
                    presenceState_1 = this.presenceState;
                    (_b = parameters.channels) === null || _b === void 0 ? void 0 : _b.forEach(function (channel) { return (presenceState_1[channel] = parameters.state); });
                    if ('channelGroups' in parameters) {
                        (_c = parameters.channelGroups) === null || _c === void 0 ? void 0 : _c.forEach(function (group) { return (presenceState_1[group] = parameters.state); });
                    }
                }
                // Check whether state should be set with heartbeat or not.
                if ('withHeartbeat' in parameters) {
                    request = new heartbeat_1.HeartbeatRequest(__assign(__assign({}, parameters), { keySet: keySet, heartbeat: heartbeat }));
                }
                else {
                    request = new set_state_1.SetPresenceStateRequest(__assign(__assign({}, parameters), { keySet: keySet, uuid: uuid }));
                }
                // Update state used by subscription manager.
                if (this.subscriptionManager)
                    this.subscriptionManager.setState(parameters);
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    // endregion
    // region Change presence state
    /**
     * Manual presence management.
     *
     * @param parameters - Desired presence state for provided list of channels and groups.
     */
    PubNubCore.prototype.presence = function (parameters) {
        var _a;
        (_a = this.subscriptionManager) === null || _a === void 0 ? void 0 : _a.changePresence(parameters);
    };
    // endregion
    // region Heartbeat
    /**
     * Announce user presence
     *
     * @param parameters - Desired presence state for provided list of channels and groups.
     */
    PubNubCore.prototype.heartbeat = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                // Manual presence management possible only with subscription manager.
                if (!this.subscriptionManager)
                    return [2 /*return*/];
                request = new heartbeat_1.HeartbeatRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Grant token permission.
     *
     * Generate access token with requested permissions.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous grant token response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.grantToken = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new grant_token_1.GrantTokenRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Revoke token permission.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous revoke token response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.revokeToken = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new revoke_token_1.RevokeTokenRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    Object.defineProperty(PubNubCore.prototype, "token", {
        // endregion
        // region Token Manipulation
        /**
         * Get current access token.
         *
         * @returns Previously configured access token using {@link setToken} method.
         */
        get: function () {
            return this.tokenManager.getToken();
        },
        /**
         * Set current access token.
         *
         * @param token - New access token which should be used with next REST API endpoint calls.
         */
        set: function (token) {
            this.tokenManager.setToken(token);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get current access token.
     *
     * @returns Previously configured access token using {@link setToken} method.
     */
    PubNubCore.prototype.getToken = function () {
        return this.token;
    };
    /**
     * Set current access token.
     *
     * @param token - New access token which should be used with next REST API endpoint calls.
     */
    PubNubCore.prototype.setToken = function (token) {
        this.token = token;
    };
    /**
     * Parse access token.
     *
     * Parse token to see what permissions token owner has.
     *
     * @param token - Token which should be parsed.
     *
     * @returns Token's permissions information for the resources.
     */
    PubNubCore.prototype.parseToken = function (token) {
        return this.tokenManager.parseToken(token);
    };
    /**
     * Grant auth key(s) permission.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous grant auth key(s) permissions or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link grantToken} and {@link setToken} methods instead.
     */
    PubNubCore.prototype.grant = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new grant_1.GrantRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Audit auth key(s) permission.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @deprecated
     *
     * @deprecated Use {@link grantToken} and {@link setToken} methods instead.
     */
    PubNubCore.prototype.audit = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new audit_1.AuditRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    Object.defineProperty(PubNubCore.prototype, "objects", {
        // endregion
        // endregion
        // endregion
        // --------------------------------------------------------
        // ------------------- App Context API --------------------
        // --------------------------------------------------------
        // region App Context API
        /**
         * PubNub App Context API group.
         */
        get: function () {
            return this._objects;
        },
        enumerable: false,
        configurable: true
    });
    /**
     Fetch a paginated list of User objects.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all User objects response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata} method instead.
     */
    PubNubCore.prototype.fetchUsers = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects._getAllUUIDMetadata(parametersOrCallback, callback)];
            });
        });
    };
    /**
     * Fetch User object for currently configured PubNub client `uuid`.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get User object response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata} method instead.
     */
    PubNubCore.prototype.fetchUser = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects._getUUIDMetadata(parametersOrCallback, callback)];
            });
        });
    };
    /**
     * Create User object.
     *
     * @param parameters - Request configuration parameters. Will create User object for currently
     * configured PubNub client `uuid` if not set.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous create User object response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata} method instead.
     */
    PubNubCore.prototype.createUser = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects._setUUIDMetadata(parameters, callback)];
            });
        });
    };
    /**
     * Update User object.
     *
     * @param parameters - Request configuration parameters. Will update User object for currently
     * configured PubNub client `uuid` if not set.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update User object response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata} method instead.
     */
    PubNubCore.prototype.updateUser = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects._setUUIDMetadata(parameters, callback)];
            });
        });
    };
    /**
     * Remove a specific User object.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous User object remove response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata} method instead.
     */
    PubNubCore.prototype.removeUser = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects._removeUUIDMetadata(parametersOrCallback, callback)];
            });
        });
    };
    /**
     * Fetch a paginated list of Space objects.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all Space objects response or `void` in case if `callback`
     * provided.
     *
     * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata} method instead.
     */
    PubNubCore.prototype.fetchSpaces = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects._getAllChannelMetadata(parametersOrCallback, callback)];
            });
        });
    };
    /**
     * Fetch a specific Space object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get Space object response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.getChannelMetadata} method instead.
     */
    PubNubCore.prototype.fetchSpace = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects._getChannelMetadata(parameters, callback)];
            });
        });
    };
    /**
     * Create specific Space object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous create Space object response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
     */
    PubNubCore.prototype.createSpace = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects._setChannelMetadata(parameters, callback)];
            });
        });
    };
    /**
     * Update specific Space object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update Space object response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
     */
    PubNubCore.prototype.updateSpace = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects._setChannelMetadata(parameters, callback)];
            });
        });
    };
    /**
     * Remove a specific Space object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous Space object remove response or `void` in case if `callback`
     * provided.
     *
     * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata} method instead.
     */
    PubNubCore.prototype.removeSpace = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects._removeChannelMetadata(parameters, callback)];
            });
        });
    };
    /**
     * Fetch paginated list of specific Space members or specific User memberships.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get specific Space members or specific User memberships response or
     * `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.getChannelMembers} or {@link PubNubCore#objects.getMemberships}
     * methods instead.
     */
    PubNubCore.prototype.fetchMemberships = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects.fetchMemberships(parameters, callback)];
            });
        });
    };
    /**
     * Add members to specific Space or memberships specific User.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous add members to specific Space or memberships specific User response or
     * `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
     * methods instead.
     */
    PubNubCore.prototype.addMemberships = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects.addMemberships(parameters, callback)];
            });
        });
    };
    /**
     * Update specific Space members or User memberships.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update Space members or User memberships response or `void` in case
     * if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
     * methods instead.
     */
    PubNubCore.prototype.updateMemberships = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objects.addMemberships(parameters, callback)];
            });
        });
    };
    /**
     * Remove User membership.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous memberships modification response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.removeMemberships} or {@link PubNubCore#objects.removeChannelMembers}
     * methods instead
     * from `objects` API group..
     */
    PubNubCore.prototype.removeMemberships = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var spaceParameters, requestParameters_1, userParameters, requestParameters;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                if ('spaceId' in parameters) {
                    spaceParameters = parameters;
                    requestParameters_1 = {
                        channel: (_a = spaceParameters.spaceId) !== null && _a !== void 0 ? _a : spaceParameters.channel,
                        uuids: (_b = spaceParameters.userIds) !== null && _b !== void 0 ? _b : spaceParameters.uuids,
                        limit: 0,
                    };
                    if (callback)
                        return [2 /*return*/, this.objects.removeChannelMembers(requestParameters_1, callback)];
                    return [2 /*return*/, this.objects.removeChannelMembers(requestParameters_1)];
                }
                userParameters = parameters;
                requestParameters = {
                    uuid: userParameters.userId,
                    channels: (_c = userParameters.spaceIds) !== null && _c !== void 0 ? _c : userParameters.channels,
                    limit: 0,
                };
                if (callback)
                    return [2 /*return*/, this.objects.removeMemberships(requestParameters, callback)];
                return [2 /*return*/, this.objects.removeMemberships(requestParameters)];
            });
        });
    };
    Object.defineProperty(PubNubCore.prototype, "channelGroups", {
        // endregion
        // endregion
        // --------------------------------------------------------
        // ----------------- Channel Groups API -------------------
        // --------------------------------------------------------
        // region Channel Groups API
        /**
         * PubNub Channel Groups API group.
         */
        get: function () {
            return this._channelGroups;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PubNubCore.prototype, "push", {
        // endregion
        // --------------------------------------------------------
        // ---------------- Push Notifications API -----------------
        // --------------------------------------------------------
        // region Push Notifications API
        /**
         * PubNub Push Notifications API group.
         */
        get: function () {
            return this._push;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Share file to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous file sharing response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.sendFile = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var sendFileRequest, status;
            var _a;
            return __generator(this, function (_b) {
                if (!this._configuration.PubNubFile)
                    throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
                sendFileRequest = new send_file_1.SendFileRequest(__assign(__assign({}, parameters), { cipherKey: (_a = parameters.cipherKey) !== null && _a !== void 0 ? _a : this._configuration.cipherKey, keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, fileUploadPublishRetryLimit: this._configuration.fileUploadPublishRetryLimit, file: parameters.file, sendRequest: this.sendRequest, publishFile: this.publishFile, crypto: this._configuration.cryptoModule, cryptography: this.cryptography ? this.cryptography : undefined }));
                status = {
                    error: false,
                    operation: operations_1.default.PNPublishFileOperation,
                    statusCode: 0,
                };
                return [2 /*return*/, sendFileRequest
                        .process()
                        .then(function (response) {
                        status.statusCode = response.status;
                        if (callback)
                            return callback(status, response);
                        return response;
                    })
                        .catch(function (error) {
                        var errorStatus = error.toStatus(status.operation);
                        // Notify callback (if possible).
                        if (callback)
                            callback(errorStatus, null);
                        throw new PubNubError_1.PubNubError('REST API request processing error, check status for details', errorStatus);
                    })];
            });
        });
    };
    /**
     * Publish file message to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous publish file message response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.publishFile = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                if (!this._configuration.PubNubFile)
                    throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
                request = new publish_file_1.PublishFileMessageRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Retrieve list of shared files in specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous shared files list response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.listFiles = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new list_files_1.FilesListRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    // endregion
    // region Get Download Url
    /**
     * Get file download Url.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns File download Url.
     */
    PubNubCore.prototype.getFileUrl = function (parameters) {
        var _a;
        var request = this.transport.request(new get_file_url_1.GetFileDownloadUrlRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet })).request());
        var query = (_a = request.queryParameters) !== null && _a !== void 0 ? _a : {};
        var queryString = Object.keys(query)
            .map(function (key) {
            var queryValue = query[key];
            if (!Array.isArray(queryValue))
                return "".concat(key, "=").concat((0, utils_1.encodeString)(queryValue));
            return queryValue.map(function (value) { return "".concat(key, "=").concat((0, utils_1.encodeString)(value)); }).join('&');
        })
            .join('&');
        return "".concat(request.origin).concat(request.path, "?").concat(queryString);
    };
    /**
     * Download shared file from specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous download shared file response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.downloadFile = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this._configuration.PubNubFile)
                            throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
                        request = new download_file_1.DownloadFileRequest(__assign(__assign({}, parameters), { cipherKey: (_a = parameters.cipherKey) !== null && _a !== void 0 ? _a : this._configuration.cipherKey, keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, cryptography: this.cryptography ? this.cryptography : undefined, crypto: this._configuration.cryptoModule }));
                        if (callback)
                            return [2 /*return*/, this.sendRequest(request, callback)];
                        return [4 /*yield*/, this.sendRequest(request)];
                    case 1: return [2 /*return*/, (_b.sent())];
                }
            });
        });
    };
    /**
     * Delete shared file from specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous delete shared file response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.deleteFile = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new delete_file_1.DeleteFileRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     Get current high-precision timetoken.
     *
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get current timetoken response or `void` in case if `callback` provided.
     */
    PubNubCore.prototype.time = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new Time.TimeRequest();
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    // endregion
    // --------------------------------------------------------
    // ------------------ Cryptography API --------------------
    // --------------------------------------------------------
    // region Cryptography
    // region Common
    /**
     * Encrypt data.
     *
     * @param data - Stringified data which should be encrypted using `CryptoModule`.
     * @deprecated
     * @param [customCipherKey] - Cipher key which should be used to encrypt data. **Deprecated:**
     * use {@link Configuration#cryptoModule|cryptoModule} instead.
     *
     * @returns Data encryption result as a string.
     */
    PubNubCore.prototype.encrypt = function (data, customCipherKey) {
        if (typeof customCipherKey === 'undefined' && this._configuration.cryptoModule) {
            var encrypted = this._configuration.cryptoModule.encrypt(data);
            return typeof encrypted === 'string' ? encrypted : (0, base64_codec_1.encode)(encrypted);
        }
        if (!this.crypto)
            throw new Error('Encryption error: cypher key not set');
        return this.crypto.encrypt(data, customCipherKey);
    };
    /**
     * Decrypt data.
     *
     * @param data - Stringified data which should be encrypted using `CryptoModule`.
     * @param [customCipherKey] - Cipher key which should be used to decrypt data. **Deprecated:**
     * use {@link Configuration#cryptoModule|cryptoModule} instead.
     *
     * @returns Data decryption result as an object.
     */
    PubNubCore.prototype.decrypt = function (data, customCipherKey) {
        if (typeof customCipherKey === 'undefined' && this._configuration.cryptoModule) {
            var decrypted = this._configuration.cryptoModule.decrypt(data);
            return decrypted instanceof ArrayBuffer ? JSON.parse(new TextDecoder().decode(decrypted)) : decrypted;
        }
        if (!this.crypto)
            throw new Error('Decryption error: cypher key not set');
        return this.crypto.decrypt(data, customCipherKey);
    };
    /**
     * Encrypt file content.
     *
     * @param keyOrFile - Cipher key which should be used to encrypt data or file which should be
     * encrypted using `CryptoModule`.
     * @param [file] - File which should be encrypted using legacy cryptography.
     *
     * @returns Asynchronous file encryption result.
     *
     * @throws Error if source file not provided.
     * @throws File constructor not provided.
     * @throws Crypto module is missing (if non-legacy flow used).
     */
    PubNubCore.prototype.encryptFile = function (keyOrFile, file) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                if (typeof keyOrFile !== 'string')
                    file = keyOrFile;
                if (!file)
                    throw new Error('File encryption error. Source file is missing.');
                if (!this._configuration.PubNubFile)
                    throw new Error('File encryption error. File constructor not configured.');
                if (typeof keyOrFile !== 'string' && !this._configuration.cryptoModule)
                    throw new Error('File encryption error. Crypto module not configured.');
                if (typeof keyOrFile === 'string') {
                    if (!this.cryptography)
                        throw new Error('File encryption error. File encryption not available');
                    return [2 /*return*/, this.cryptography.encryptFile(keyOrFile, file, this._configuration.PubNubFile)];
                }
                return [2 /*return*/, (_a = this._configuration.cryptoModule) === null || _a === void 0 ? void 0 : _a.encryptFile(file, this._configuration.PubNubFile)];
            });
        });
    };
    /**
     * Decrypt file content.
     *
     * @param keyOrFile - Cipher key which should be used to decrypt data or file which should be
     * decrypted using `CryptoModule`.
     * @param [file] - File which should be decrypted using legacy cryptography.
     *
     * @returns Asynchronous file decryption result.
     *
     * @throws Error if source file not provided.
     * @throws File constructor not provided.
     * @throws Crypto module is missing (if non-legacy flow used).
     */
    PubNubCore.prototype.decryptFile = function (keyOrFile, file) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                if (typeof keyOrFile !== 'string')
                    file = keyOrFile;
                if (!file)
                    throw new Error('File encryption error. Source file is missing.');
                if (!this._configuration.PubNubFile)
                    throw new Error('File decryption error. File constructor' + ' not configured.');
                if (typeof keyOrFile === 'string' && !this._configuration.cryptoModule)
                    throw new Error('File decryption error. Crypto module not configured.');
                if (typeof keyOrFile === 'string') {
                    if (!this.cryptography)
                        throw new Error('File decryption error. File decryption not available');
                    return [2 /*return*/, this.cryptography.decryptFile(keyOrFile, file, this._configuration.PubNubFile)];
                }
                return [2 /*return*/, (_a = this._configuration.cryptoModule) === null || _a === void 0 ? void 0 : _a.decryptFile(file, this._configuration.PubNubFile)];
            });
        });
    };
    // --------------------------------------------------------
    // ----------------------- Static -------------------------
    // --------------------------------------------------------
    // region Static
    /**
     * Type of REST API endpoint which reported status.
     */
    PubNubCore.OPERATIONS = operations_1.default;
    /**
     * API call status category.
     */
    PubNubCore.CATEGORIES = categories_1.default;
    /**
     * Exponential retry policy constructor.
     */
    PubNubCore.ExponentialRetryPolicy = retryPolicy_1.RetryPolicy.ExponentialRetryPolicy;
    /**
     * Linear retry policy constructor.
     */
    PubNubCore.LinearRetryPolicy = retryPolicy_1.RetryPolicy.LinearRetryPolicy;
    return PubNubCore;
}());
exports.PubNubCore = PubNubCore;
