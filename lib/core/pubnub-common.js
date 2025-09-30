"use strict";
/**
 * Core PubNub API module.
 */
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubNubCore = void 0;
// region Imports
// region Components
const event_dispatcher_1 = require("./components/event-dispatcher");
const subscription_manager_1 = require("./components/subscription-manager");
const push_payload_1 = __importDefault(require("./components/push_payload"));
const base64_codec_1 = require("./components/base64_codec");
const uuid_1 = __importDefault(require("./components/uuid"));
// endregion
// region Constants
const operations_1 = __importDefault(require("./constants/operations"));
const categories_1 = __importDefault(require("./constants/categories"));
// endregion
const pubnub_error_1 = require("../errors/pubnub-error");
const pubnub_api_error_1 = require("../errors/pubnub-api-error");
const retry_policy_1 = require("./components/retry-policy");
// region Event Engine
const presence_1 = require("../event-engine/presence/presence");
const event_engine_1 = require("../event-engine");
// endregion
// region Publish & Signal
const Publish = __importStar(require("./endpoints/publish"));
const Signal = __importStar(require("./endpoints/signal"));
// endregion
// region Subscription
const subscribe_1 = require("./endpoints/subscribe");
const receiveMessages_1 = require("./endpoints/subscriptionUtils/receiveMessages");
const handshake_1 = require("./endpoints/subscriptionUtils/handshake");
const subscription_1 = require("../entities/subscription");
// endregion
// region Presence
const get_state_1 = require("./endpoints/presence/get_state");
const set_state_1 = require("./endpoints/presence/set_state");
const heartbeat_1 = require("./endpoints/presence/heartbeat");
const leave_1 = require("./endpoints/presence/leave");
const where_now_1 = require("./endpoints/presence/where_now");
const here_now_1 = require("./endpoints/presence/here_now");
// endregion
// region Message Storage
const delete_messages_1 = require("./endpoints/history/delete_messages");
const message_counts_1 = require("./endpoints/history/message_counts");
const get_history_1 = require("./endpoints/history/get_history");
const fetch_messages_1 = require("./endpoints/fetch_messages");
// endregion
// region Message Actions
const get_message_actions_1 = require("./endpoints/actions/get_message_actions");
const add_message_action_1 = require("./endpoints/actions/add_message_action");
const remove_message_action_1 = require("./endpoints/actions/remove_message_action");
// endregion
// region File sharing
const publish_file_1 = require("./endpoints/file_upload/publish_file");
const get_file_url_1 = require("./endpoints/file_upload/get_file_url");
const delete_file_1 = require("./endpoints/file_upload/delete_file");
const list_files_1 = require("./endpoints/file_upload/list_files");
const send_file_1 = require("./endpoints/file_upload/send_file");
// endregion
// region PubNub Access Manager
const revoke_token_1 = require("./endpoints/access_manager/revoke_token");
const grant_token_1 = require("./endpoints/access_manager/grant_token");
const grant_1 = require("./endpoints/access_manager/grant");
const audit_1 = require("./endpoints/access_manager/audit");
// endregion
// region Entities
const subscription_capable_1 = require("../entities/interfaces/subscription-capable");
const channel_metadata_1 = require("../entities/channel-metadata");
const subscription_set_1 = require("../entities/subscription-set");
const channel_group_1 = require("../entities/channel-group");
const user_metadata_1 = require("../entities/user-metadata");
const channel_1 = require("../entities/channel");
// endregion
// region Channel Groups
const pubnub_channel_groups_1 = __importDefault(require("./pubnub-channel-groups"));
// endregion
// region Push Notifications
const pubnub_push_1 = __importDefault(require("./pubnub-push"));
const pubnub_objects_1 = __importDefault(require("./pubnub-objects"));
// endregion
// region Time
const Time = __importStar(require("./endpoints/time"));
const download_file_1 = require("./endpoints/file_upload/download_file");
const subscription_2 = require("./types/api/subscription");
const logger_1 = require("./interfaces/logger");
const utils_1 = require("./utils");
const categories_2 = __importDefault(require("./constants/categories"));
// endregion
/**
 * Platform-agnostic PubNub client core.
 */
class PubNubCore {
    /**
     * Construct notification payload which will trigger push notification.
     *
     * @param title - Title which will be shown on notification.
     * @param body - Payload which will be sent as part of notification.
     *
     * @returns Pre-formatted message payload which will trigger push notification.
     */
    static notificationPayload(title, body) {
        if (process.env.PUBLISH_MODULE !== 'disabled') {
            return new push_payload_1.default(title, body);
        }
        else
            throw new Error('Notification Payload error: publish module disabled');
    }
    /**
     * Generate unique identifier.
     *
     * @returns Unique identifier.
     */
    static generateUUID() {
        return uuid_1.default.createUUID();
    }
    // endregion
    /**
     * Create and configure PubNub client core.
     *
     * @param configuration - PubNub client core configuration.
     * @returns Configured and ready to use PubNub client.
     *
     * @internal
     */
    constructor(configuration) {
        /**
         * List of subscribe capable objects with active subscriptions.
         *
         * Track list of {@link Subscription} and {@link SubscriptionSet} objects with active
         * subscription.
         *
         * @internal
         */
        this.eventHandleCapable = {};
        /**
         * Created entities.
         *
         * Map of entities which have been created to access.
         *
         * @internal
         */
        this.entities = {};
        this._configuration = configuration.configuration;
        this.cryptography = configuration.cryptography;
        this.tokenManager = configuration.tokenManager;
        this.transport = configuration.transport;
        this.crypto = configuration.crypto;
        this.logger.debug('PubNub', () => ({
            messageType: 'object',
            message: configuration.configuration,
            details: 'Create with configuration:',
            ignoredKeys(key, obj) {
                return typeof obj[key] === 'function' || key.startsWith('_');
            },
        }));
        // API group entry points initialization.
        if (process.env.APP_CONTEXT_MODULE !== 'disabled')
            this._objects = new pubnub_objects_1.default(this._configuration, this.sendRequest.bind(this));
        if (process.env.CHANNEL_GROUPS_MODULE !== 'disabled')
            this._channelGroups = new pubnub_channel_groups_1.default(this._configuration.logger(), this._configuration.keySet, this.sendRequest.bind(this));
        if (process.env.MOBILE_PUSH_MODULE !== 'disabled')
            this._push = new pubnub_push_1.default(this._configuration.logger(), this._configuration.keySet, this.sendRequest.bind(this));
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            // Prepare for a real-time events announcement.
            this.eventDispatcher = new event_dispatcher_1.EventDispatcher();
            if (this._configuration.enableEventEngine) {
                if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
                    this.logger.debug('PubNub', 'Using new subscription loop management.');
                    let heartbeatInterval = this._configuration.getHeartbeatInterval();
                    this.presenceState = {};
                    if (process.env.PRESENCE_MODULE !== 'disabled') {
                        if (heartbeatInterval) {
                            this.presenceEventEngine = new presence_1.PresenceEventEngine({
                                heartbeat: (parameters, callback) => {
                                    this.logger.trace('PresenceEventEngine', () => ({
                                        messageType: 'object',
                                        message: Object.assign({}, parameters),
                                        details: 'Heartbeat with parameters:',
                                    }));
                                    return this.heartbeat(parameters, callback);
                                },
                                leave: (parameters) => {
                                    this.logger.trace('PresenceEventEngine', () => ({
                                        messageType: 'object',
                                        message: Object.assign({}, parameters),
                                        details: 'Leave with parameters:',
                                    }));
                                    this.makeUnsubscribe(parameters, () => { });
                                },
                                heartbeatDelay: () => new Promise((resolve, reject) => {
                                    heartbeatInterval = this._configuration.getHeartbeatInterval();
                                    if (!heartbeatInterval)
                                        reject(new pubnub_error_1.PubNubError('Heartbeat interval has been reset.'));
                                    else
                                        setTimeout(resolve, heartbeatInterval * 1000);
                                }),
                                emitStatus: (status) => this.emitStatus(status),
                                config: this._configuration,
                                presenceState: this.presenceState,
                            });
                        }
                    }
                    this.eventEngine = new event_engine_1.EventEngine({
                        handshake: (parameters) => {
                            this.logger.trace('EventEngine', () => ({
                                messageType: 'object',
                                message: Object.assign({}, parameters),
                                details: 'Handshake with parameters:',
                                ignoredKeys: ['abortSignal', 'crypto', 'timeout', 'keySet', 'getFileUrl'],
                            }));
                            return this.subscribeHandshake(parameters);
                        },
                        receiveMessages: (parameters) => {
                            this.logger.trace('EventEngine', () => ({
                                messageType: 'object',
                                message: Object.assign({}, parameters),
                                details: 'Receive messages with parameters:',
                                ignoredKeys: ['abortSignal', 'crypto', 'timeout', 'keySet', 'getFileUrl'],
                            }));
                            return this.subscribeReceiveMessages(parameters);
                        },
                        delay: (amount) => new Promise((resolve) => setTimeout(resolve, amount)),
                        join: (parameters) => {
                            var _a, _b;
                            this.logger.trace('EventEngine', () => ({
                                messageType: 'object',
                                message: Object.assign({}, parameters),
                                details: 'Join with parameters:',
                            }));
                            if (parameters && ((_a = parameters.channels) !== null && _a !== void 0 ? _a : []).length === 0 && ((_b = parameters.groups) !== null && _b !== void 0 ? _b : []).length === 0) {
                                this.logger.trace('EventEngine', "Ignoring 'join' announcement request.");
                                return;
                            }
                            this.join(parameters);
                        },
                        leave: (parameters) => {
                            var _a, _b;
                            this.logger.trace('EventEngine', () => ({
                                messageType: 'object',
                                message: Object.assign({}, parameters),
                                details: 'Leave with parameters:',
                            }));
                            if (parameters && ((_a = parameters.channels) !== null && _a !== void 0 ? _a : []).length === 0 && ((_b = parameters.groups) !== null && _b !== void 0 ? _b : []).length === 0) {
                                this.logger.trace('EventEngine', "Ignoring 'leave' announcement request.");
                                return;
                            }
                            this.leave(parameters);
                        },
                        leaveAll: (parameters) => {
                            this.logger.trace('EventEngine', () => ({
                                messageType: 'object',
                                message: Object.assign({}, parameters),
                                details: 'Leave all with parameters:',
                            }));
                            this.leaveAll(parameters);
                        },
                        presenceReconnect: (parameters) => {
                            this.logger.trace('EventEngine', () => ({
                                messageType: 'object',
                                message: Object.assign({}, parameters),
                                details: 'Reconnect with parameters:',
                            }));
                            this.presenceReconnect(parameters);
                        },
                        presenceDisconnect: (parameters) => {
                            this.logger.trace('EventEngine', () => ({
                                messageType: 'object',
                                message: Object.assign({}, parameters),
                                details: 'Disconnect with parameters:',
                            }));
                            this.presenceDisconnect(parameters);
                        },
                        presenceState: this.presenceState,
                        config: this._configuration,
                        emitMessages: (cursor, events) => {
                            try {
                                this.logger.debug('EventEngine', () => {
                                    const hashedEvents = events.map((event) => {
                                        const pn_mfp = event.type === subscribe_1.PubNubEventType.Message || event.type === subscribe_1.PubNubEventType.Signal
                                            ? (0, utils_1.messageFingerprint)(event.data.message)
                                            : undefined;
                                        return pn_mfp ? { type: event.type, data: Object.assign(Object.assign({}, event.data), { pn_mfp }) } : event;
                                    });
                                    return { messageType: 'object', message: hashedEvents, details: 'Received events:' };
                                });
                                events.forEach((event) => this.emitEvent(cursor, event));
                            }
                            catch (e) {
                                const errorStatus = {
                                    error: true,
                                    category: categories_1.default.PNUnknownCategory,
                                    errorData: e,
                                    statusCode: 0,
                                };
                                this.emitStatus(errorStatus);
                            }
                        },
                        emitStatus: (status) => this.emitStatus(status),
                    });
                }
                else
                    throw new Error('Event Engine error: subscription event engine module disabled');
            }
            else {
                if (process.env.SUBSCRIBE_MANAGER_MODULE !== 'disabled') {
                    this.logger.debug('PubNub', 'Using legacy subscription loop management.');
                    this.subscriptionManager = new subscription_manager_1.SubscriptionManager(this._configuration, (cursor, event) => {
                        try {
                            this.emitEvent(cursor, event);
                        }
                        catch (e) {
                            const errorStatus = {
                                error: true,
                                category: categories_1.default.PNUnknownCategory,
                                errorData: e,
                                statusCode: 0,
                            };
                            this.emitStatus(errorStatus);
                        }
                    }, this.emitStatus.bind(this), (parameters, callback) => {
                        this.logger.trace('SubscriptionManager', () => ({
                            messageType: 'object',
                            message: Object.assign({}, parameters),
                            details: 'Subscribe with parameters:',
                            ignoredKeys: ['crypto', 'timeout', 'keySet', 'getFileUrl'],
                        }));
                        this.makeSubscribe(parameters, callback);
                    }, (parameters, callback) => {
                        this.logger.trace('SubscriptionManager', () => ({
                            messageType: 'object',
                            message: Object.assign({}, parameters),
                            details: 'Heartbeat with parameters:',
                            ignoredKeys: ['crypto', 'timeout', 'keySet', 'getFileUrl'],
                        }));
                        return this.heartbeat(parameters, callback);
                    }, (parameters, callback) => {
                        this.logger.trace('SubscriptionManager', () => ({
                            messageType: 'object',
                            message: Object.assign({}, parameters),
                            details: 'Leave with parameters:',
                        }));
                        this.makeUnsubscribe(parameters, callback);
                    }, this.time.bind(this));
                }
                else
                    throw new Error('Subscription Manager error: subscription manager module disabled');
            }
        }
    }
    // --------------------------------------------------------
    // -------------------- Configuration ----------------------
    // --------------------------------------------------------
    // region Configuration
    /**
     * PubNub client configuration.
     *
     * @returns Currently user PubNub client configuration.
     */
    get configuration() {
        return this._configuration;
    }
    /**
     * Current PubNub client configuration.
     *
     * @returns Currently user PubNub client configuration.
     *
     * @deprecated Use {@link configuration} getter instead.
     */
    get _config() {
        return this.configuration;
    }
    /**
     * REST API endpoint access authorization key.
     *
     * It is required to have `authorization key` with required permissions to access REST API
     * endpoints when `PAM` enabled for user key set.
     */
    get authKey() {
        var _a;
        return (_a = this._configuration.authKey) !== null && _a !== void 0 ? _a : undefined;
    }
    /**
     * REST API endpoint access authorization key.
     *
     * It is required to have `authorization key` with required permissions to access REST API
     * endpoints when `PAM` enabled for user key set.
     */
    getAuthKey() {
        return this.authKey;
    }
    /**
     * Change REST API endpoint access authorization key.
     *
     * @param authKey - New authorization key which should be used with new requests.
     */
    setAuthKey(authKey) {
        this.logger.debug('PubNub', `Set auth key: ${authKey}`);
        this._configuration.setAuthKey(authKey);
        if (this.onAuthenticationChange)
            this.onAuthenticationChange(authKey);
    }
    /**
     * Get a PubNub client user identifier.
     *
     * @returns Current PubNub client user identifier.
     */
    get userId() {
        return this._configuration.userId;
    }
    /**
     * Change the current PubNub client user identifier.
     *
     * **Important:** Change won't affect ongoing REST API calls.
     * **Warning:** Because ongoing REST API calls won't be canceled there could happen unexpected events like implicit
     * `join` event for the previous `userId` after a long-poll subscribe request will receive a response. To avoid this
     * it is advised to unsubscribe from all/disconnect before changing `userId`.
     *
     * @param value - New PubNub client user identifier.
     *
     * @throws Error empty user identifier has been provided.
     */
    set userId(value) {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
            const error = new Error('Missing or invalid userId parameter. Provide a valid string userId');
            this.logger.error('PubNub', () => ({ messageType: 'error', message: error }));
            throw error;
        }
        this.logger.debug('PubNub', `Set user ID: ${value}`);
        this._configuration.userId = value;
        if (this.onUserIdChange)
            this.onUserIdChange(this._configuration.userId);
    }
    /**
     * Get a PubNub client user identifier.
     *
     * @returns Current PubNub client user identifier.
     */
    getUserId() {
        return this._configuration.userId;
    }
    /**
     * Change the current PubNub client user identifier.
     *
     * **Important:** Change won't affect ongoing REST API calls.
     *
     * @param value - New PubNub client user identifier.
     *
     * @throws Error empty user identifier has been provided.
     */
    setUserId(value) {
        this.userId = value;
    }
    /**
     * Real-time updates filtering expression.
     *
     * @returns Filtering expression.
     */
    get filterExpression() {
        var _a;
        return (_a = this._configuration.getFilterExpression()) !== null && _a !== void 0 ? _a : undefined;
    }
    /**
     * Real-time updates filtering expression.
     *
     * @returns Filtering expression.
     */
    getFilterExpression() {
        return this.filterExpression;
    }
    /**
     * Update real-time updates filtering expression.
     *
     * @param expression - New expression which should be used or `undefined` to disable filtering.
     */
    set filterExpression(expression) {
        this.logger.debug('PubNub', `Set filter expression: ${expression}`);
        this._configuration.setFilterExpression(expression);
    }
    /**
     * Update real-time updates filtering expression.
     *
     * @param expression - New expression which should be used or `undefined` to disable filtering.
     */
    setFilterExpression(expression) {
        this.logger.debug('PubNub', `Set filter expression: ${expression}`);
        this.filterExpression = expression;
    }
    /**
     * Dta encryption / decryption key.
     *
     * @returns Currently used key for data encryption / decryption.
     */
    get cipherKey() {
        return this._configuration.getCipherKey();
    }
    /**
     * Change data encryption / decryption key.
     *
     * @param key - New key which should be used for data encryption / decryption.
     */
    set cipherKey(key) {
        this._configuration.setCipherKey(key);
    }
    /**
     * Change data encryption / decryption key.
     *
     * @param key - New key which should be used for data encryption / decryption.
     */
    setCipherKey(key) {
        this.logger.debug('PubNub', `Set cipher key: ${key}`);
        this.cipherKey = key;
    }
    /**
     * Change a heartbeat requests interval.
     *
     * @param interval - New presence request heartbeat intervals.
     */
    set heartbeatInterval(interval) {
        var _a;
        this.logger.debug('PubNub', `Set heartbeat interval: ${interval}`);
        this._configuration.setHeartbeatInterval(interval);
        if (this.onHeartbeatIntervalChange)
            this.onHeartbeatIntervalChange((_a = this._configuration.getHeartbeatInterval()) !== null && _a !== void 0 ? _a : 0);
    }
    /**
     * Change a heartbeat requests interval.
     *
     * @param interval - New presence request heartbeat intervals.
     */
    setHeartbeatInterval(interval) {
        this.heartbeatInterval = interval;
    }
    /**
     * Get registered loggers' manager.
     *
     * @returns Registered loggers' manager.
     */
    get logger() {
        return this._configuration.logger();
    }
    /**
     * Get PubNub SDK version.
     *
     * @returns Current SDK version.
     */
    getVersion() {
        return this._configuration.getVersion();
    }
    /**
     * Add framework's prefix.
     *
     * @param name - Name of the framework which would want to add own data into `pnsdk` suffix.
     * @param suffix - Suffix with information about a framework.
     */
    _addPnsdkSuffix(name, suffix) {
        this.logger.debug('PubNub', `Add '${name}' 'pnsdk' suffix: ${suffix}`);
        this._configuration._addPnsdkSuffix(name, suffix);
    }
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
    getUUID() {
        return this.userId;
    }
    /**
     * Change the current PubNub client user identifier.
     *
     * **Important:** Change won't affect ongoing REST API calls.
     *
     * @param value - New PubNub client user identifier.
     *
     * @throws Error empty user identifier has been provided.
     *
     * @deprecated Use the {@link PubNubCore#setUserId setUserId} or {@link PubNubCore#userId userId} setter instead.
     */
    setUUID(value) {
        this.logger.warn('PubNub', "'setUserId` is deprecated, please use 'setUserId' or 'userId' setter instead.");
        this.logger.debug('PubNub', `Set UUID: ${value}`);
        this.userId = value;
    }
    /**
     * Custom data encryption method.
     *
     * @deprecated Instead use {@link cryptoModule} for data encryption.
     */
    get customEncrypt() {
        return this._configuration.getCustomEncrypt();
    }
    /**
     * Custom data decryption method.
     *
     * @deprecated Instead use {@link cryptoModule} for data decryption.
     */
    get customDecrypt() {
        return this._configuration.getCustomDecrypt();
    }
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
    channel(name) {
        let channel = this.entities[`${name}_ch`];
        if (!channel)
            channel = this.entities[`${name}_ch`] = new channel_1.Channel(name, this);
        return channel;
    }
    /**
     * Create a `ChannelGroup` entity.
     *
     * Entity can be used for the interaction with the following API:
     * - `subscribe`
     *
     * @param name - Unique channel group name.
     * @returns `ChannelGroup` entity.
     */
    channelGroup(name) {
        let channelGroup = this.entities[`${name}_chg`];
        if (!channelGroup)
            channelGroup = this.entities[`${name}_chg`] = new channel_group_1.ChannelGroup(name, this);
        return channelGroup;
    }
    /**
     * Create a `ChannelMetadata` entity.
     *
     * Entity can be used for the interaction with the following API:
     * - `subscribe`
     *
     * @param id - Unique channel metadata object identifier.
     * @returns `ChannelMetadata` entity.
     */
    channelMetadata(id) {
        let metadata = this.entities[`${id}_chm`];
        if (!metadata)
            metadata = this.entities[`${id}_chm`] = new channel_metadata_1.ChannelMetadata(id, this);
        return metadata;
    }
    /**
     * Create a `UserMetadata` entity.
     *
     * Entity can be used for the interaction with the following API:
     * - `subscribe`
     *
     * @param id - Unique user metadata object identifier.
     * @returns `UserMetadata` entity.
     */
    userMetadata(id) {
        let metadata = this.entities[`${id}_um`];
        if (!metadata)
            metadata = this.entities[`${id}_um`] = new user_metadata_1.UserMetadata(id, this);
        return metadata;
    }
    /**
     * Create subscriptions set object.
     *
     * @param parameters - Subscriptions set configuration parameters.
     */
    subscriptionSet(parameters) {
        var _a, _b;
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            // Prepare a list of entities for a set.
            const entities = [];
            (_a = parameters.channels) === null || _a === void 0 ? void 0 : _a.forEach((name) => entities.push(this.channel(name)));
            (_b = parameters.channelGroups) === null || _b === void 0 ? void 0 : _b.forEach((name) => entities.push(this.channelGroup(name)));
            return new subscription_set_1.SubscriptionSet({ client: this, entities, options: parameters.subscriptionOptions });
        }
        else
            throw new Error('Subscription set error: subscription module disabled');
    }
    /**
     * Schedule request execution.
     *
     * @internal
     *
     * @param request - REST API request.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous request execution and response parsing result or `void` in case if
     * `callback` provided.
     *
     * @throws PubNubError in case of request processing error.
     */
    sendRequest(request, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate user-input.
            const validationResult = request.validate();
            if (validationResult) {
                const validationError = (0, pubnub_error_1.createValidationError)(validationResult);
                this.logger.error('PubNub', () => ({ messageType: 'error', message: validationError }));
                if (callback)
                    return callback(validationError, null);
                throw new pubnub_error_1.PubNubError('Validation failed, check status for details', validationError);
            }
            // Complete request configuration.
            const transportRequest = request.request();
            const operation = request.operation();
            if ((transportRequest.formData && transportRequest.formData.length > 0) ||
                operation === operations_1.default.PNDownloadFileOperation) {
                // Set file upload / download request delay.
                transportRequest.timeout = this._configuration.getFileTimeout();
            }
            else {
                if (operation === operations_1.default.PNSubscribeOperation ||
                    operation === operations_1.default.PNReceiveMessagesOperation)
                    transportRequest.timeout = this._configuration.getSubscribeTimeout();
                else
                    transportRequest.timeout = this._configuration.getTransactionTimeout();
            }
            // API request processing status.
            const status = {
                error: false,
                operation,
                category: categories_1.default.PNAcknowledgmentCategory,
                statusCode: 0,
            };
            const [sendableRequest, cancellationController] = this.transport.makeSendable(transportRequest);
            /**
             * **Important:** Because of multiple environments where JS SDK can be used, control over
             * cancellation had to be inverted to let the transport provider solve a request cancellation task
             * more efficiently. As a result, cancellation controller can be retrieved and used only after
             *  the request will be scheduled by the transport provider.
             */
            request.cancellationController = cancellationController ? cancellationController : null;
            return sendableRequest
                .then((response) => {
                status.statusCode = response.status;
                // Handle a special case when request completed but not fully processed by PubNub service.
                if (response.status !== 200 && response.status !== 204) {
                    const responseText = PubNubCore.decoder.decode(response.body);
                    const contentType = response.headers['content-type'];
                    if (contentType || contentType.indexOf('javascript') !== -1 || contentType.indexOf('json') !== -1) {
                        const json = JSON.parse(responseText);
                        if (typeof json === 'object' && 'error' in json && json.error && typeof json.error === 'object')
                            status.errorData = json.error;
                    }
                    else
                        status.responseText = responseText;
                }
                return request.parse(response);
            })
                .then((parsed) => {
                // Notify callback (if possible).
                if (callback)
                    return callback(status, parsed);
                return parsed;
            })
                .catch((error) => {
                const apiError = !(error instanceof pubnub_api_error_1.PubNubAPIError) ? pubnub_api_error_1.PubNubAPIError.create(error) : error;
                // Notify callback (if possible).
                if (callback) {
                    if (apiError.category !== categories_2.default.PNCancelledCategory) {
                        this.logger.error('PubNub', () => ({
                            messageType: 'error',
                            message: apiError.toPubNubError(operation, 'REST API request processing error, check status for details'),
                        }));
                    }
                    return callback(apiError.toStatus(operation), null);
                }
                const pubNubError = apiError.toPubNubError(operation, 'REST API request processing error, check status for details');
                if (apiError.category !== categories_2.default.PNCancelledCategory)
                    this.logger.error('PubNub', () => ({ messageType: 'error', message: pubNubError }));
                throw pubNubError;
            });
        });
    }
    /**
     * Unsubscribe from all channels and groups.
     *
     * @param [isOffline] - Whether `offline` presence should be notified or not.
     */
    destroy(isOffline = false) {
        this.logger.info('PubNub', 'Destroying PubNub client.');
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this._globalSubscriptionSet) {
                this._globalSubscriptionSet.invalidate(true);
                this._globalSubscriptionSet = undefined;
            }
            Object.values(this.eventHandleCapable).forEach((subscription) => subscription.invalidate(true));
            this.eventHandleCapable = {};
            if (this.subscriptionManager) {
                this.subscriptionManager.unsubscribeAll(isOffline);
                this.subscriptionManager.disconnect();
            }
            else if (this.eventEngine)
                this.eventEngine.unsubscribeAll(isOffline);
        }
        if (process.env.PRESENCE_MODULE !== 'disabled') {
            if (this.presenceEventEngine)
                this.presenceEventEngine.leaveAll(isOffline);
        }
    }
    /**
     * Unsubscribe from all channels and groups.
     *
     * @deprecated Use {@link destroy} method instead.
     */
    stop() {
        this.logger.warn('PubNub', "'stop' is deprecated, please use 'destroy' instead.");
        this.destroy();
    }
    /**
     * Publish data to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous publish data response or `void` in case if `callback` provided.
     */
    publish(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.PUBLISH_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Publish with parameters:',
                }));
                const isFireRequest = parameters.replicate === false && parameters.storeInHistory === false;
                const request = new Publish.PublishRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `${isFireRequest ? 'Fire' : 'Publish'} success with timetoken: ${response.timetoken}`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Publish error: publish module disabled');
        });
    }
    /**
     * Signal data to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous signal data response or `void` in case if `callback` provided.
     */
    signal(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.PUBLISH_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Signal with parameters:',
                }));
                const request = new Signal.SignalRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Publish success with timetoken: ${response.timetoken}`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Publish error: publish module disabled');
        });
    }
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
    fire(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Fire with parameters:',
            }));
            callback !== null && callback !== void 0 ? callback : (callback = () => { });
            return this.publish(Object.assign(Object.assign({}, parameters), { replicate: false, storeInHistory: false }), callback);
        });
    }
    // endregion
    // --------------------------------------------------------
    // -------------------- Subscribe API ---------------------
    // --------------------------------------------------------
    // region Subscribe API
    /**
     * Global subscription set which supports legacy subscription interface.
     *
     * @returns Global subscription set.
     *
     * @internal
     */
    get globalSubscriptionSet() {
        if (!this._globalSubscriptionSet)
            this._globalSubscriptionSet = this.subscriptionSet({});
        return this._globalSubscriptionSet;
    }
    /**
     * Subscription-based current timetoken.
     *
     * @returns Timetoken based on current timetoken plus diff between current and loop start time.
     *
     * @internal
     */
    get subscriptionTimetoken() {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.subscriptionManager)
                return this.subscriptionManager.subscriptionTimetoken;
            else if (this.eventEngine)
                return this.eventEngine.subscriptionTimetoken;
        }
        return undefined;
    }
    /**
     * Get list of channels on which PubNub client currently subscribed.
     *
     * @returns List of active channels.
     */
    getSubscribedChannels() {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.subscriptionManager)
                return this.subscriptionManager.subscribedChannels;
            else if (this.eventEngine)
                return this.eventEngine.getSubscribedChannels();
        }
        else
            throw new Error('Subscription error: subscription module disabled');
        return [];
    }
    /**
     * Get list of channel groups on which PubNub client currently subscribed.
     *
     * @returns List of active channel groups.
     */
    getSubscribedChannelGroups() {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.subscriptionManager)
                return this.subscriptionManager.subscribedChannelGroups;
            else if (this.eventEngine)
                return this.eventEngine.getSubscribedChannelGroups();
        }
        else
            throw new Error('Subscription error: subscription module disabled');
        return [];
    }
    /**
     * Register an events handler object ({@link Subscription} or {@link SubscriptionSet}) with an active subscription.
     *
     * @param subscription - {@link Subscription} or {@link SubscriptionSet} object.
     * @param [cursor] - Subscription catchup timetoken.
     * @param [subscriptions] - List of subscriptions for partial subscription loop update.
     *
     * @internal
     */
    registerEventHandleCapable(subscription, cursor, subscriptions) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            this.logger.trace('PubNub', () => ({
                messageType: 'object',
                message: Object.assign(Object.assign({ subscription: subscription }, (cursor ? { cursor } : [])), (subscriptions ? { subscriptions } : {})),
                details: `Register event handle capable:`,
            }));
            if (!this.eventHandleCapable[subscription.state.id])
                this.eventHandleCapable[subscription.state.id] = subscription;
            let subscriptionInput;
            if (!subscriptions || subscriptions.length === 0)
                subscriptionInput = subscription.subscriptionInput(false);
            else {
                subscriptionInput = new subscription_2.SubscriptionInput({});
                subscriptions.forEach((subscription) => subscriptionInput.add(subscription.subscriptionInput(false)));
            }
            const parameters = {};
            parameters.channels = subscriptionInput.channels;
            parameters.channelGroups = subscriptionInput.channelGroups;
            if (cursor)
                parameters.timetoken = cursor.timetoken;
            if (this.subscriptionManager)
                this.subscriptionManager.subscribe(parameters);
            else if (this.eventEngine)
                this.eventEngine.subscribe(parameters);
        }
    }
    /**
     * Unregister an events handler object ({@link Subscription} or {@link SubscriptionSet}) with inactive subscription.
     *
     * @param subscription - {@link Subscription} or {@link SubscriptionSet} object.
     * @param [subscriptions] - List of subscriptions for partial subscription loop update.
     *
     * @internal
     */
    unregisterEventHandleCapable(subscription, subscriptions) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (!this.eventHandleCapable[subscription.state.id])
                return;
            const inUseSubscriptions = [];
            this.logger.trace('PubNub', () => ({
                messageType: 'object',
                message: { subscription: subscription, subscriptions },
                details: `Unregister event handle capable:`,
            }));
            // Check whether only subscription object has been passed to be unregistered.
            let shouldDeleteEventHandler = !subscriptions || subscriptions.length === 0;
            // Check whether subscription set is unregistering with all managed Subscription objects,
            if (!shouldDeleteEventHandler &&
                subscription instanceof subscription_set_1.SubscriptionSet &&
                subscription.subscriptions.length === (subscriptions === null || subscriptions === void 0 ? void 0 : subscriptions.length))
                shouldDeleteEventHandler = subscription.subscriptions.every((sub) => subscriptions.includes(sub));
            if (shouldDeleteEventHandler)
                delete this.eventHandleCapable[subscription.state.id];
            let subscriptionInput;
            if (!subscriptions || subscriptions.length === 0) {
                subscriptionInput = subscription.subscriptionInput(true);
                if (subscriptionInput.isEmpty)
                    inUseSubscriptions.push(subscription);
            }
            else {
                subscriptionInput = new subscription_2.SubscriptionInput({});
                subscriptions.forEach((subscription) => {
                    const input = subscription.subscriptionInput(true);
                    if (input.isEmpty)
                        inUseSubscriptions.push(subscription);
                    else
                        subscriptionInput.add(input);
                });
            }
            if (inUseSubscriptions.length > 0) {
                this.logger.trace('PubNub', () => {
                    const entities = [];
                    if (inUseSubscriptions[0] instanceof subscription_set_1.SubscriptionSet) {
                        inUseSubscriptions[0].subscriptions.forEach((subscription) => entities.push(subscription.state.entity));
                    }
                    else
                        inUseSubscriptions.forEach((subscription) => entities.push(subscription.state.entity));
                    return {
                        messageType: 'object',
                        message: { entities },
                        details: `Can't unregister event handle capable because entities still in use:`,
                    };
                });
            }
            if (subscriptionInput.isEmpty)
                return;
            else {
                const _channelGroupsInUse = [];
                const _channelsInUse = [];
                Object.values(this.eventHandleCapable).forEach((_subscription) => {
                    const _subscriptionInput = _subscription.subscriptionInput(false);
                    const _subscriptionChannelGroups = _subscriptionInput.channelGroups;
                    const _subscriptionChannels = _subscriptionInput.channels;
                    _channelGroupsInUse.push(...subscriptionInput.channelGroups.filter((channel) => _subscriptionChannelGroups.includes(channel)));
                    _channelsInUse.push(...subscriptionInput.channels.filter((channel) => _subscriptionChannels.includes(channel)));
                });
                if (_channelsInUse.length > 0 || _channelGroupsInUse.length > 0) {
                    this.logger.trace('PubNub', () => {
                        const _entitiesInUse = [];
                        const addEntityIfInUse = (entity) => {
                            const namesOrIds = entity.subscriptionNames(true);
                            const checkList = entity.subscriptionType === subscription_capable_1.SubscriptionType.Channel ? _channelsInUse : _channelGroupsInUse;
                            if (namesOrIds.some((id) => checkList.includes(id)))
                                _entitiesInUse.push(entity);
                        };
                        Object.values(this.eventHandleCapable).forEach((_subscription) => {
                            if (_subscription instanceof subscription_set_1.SubscriptionSet) {
                                _subscription.subscriptions.forEach((_subscriptionInSet) => {
                                    addEntityIfInUse(_subscriptionInSet.state.entity);
                                });
                            }
                            else if (_subscription instanceof subscription_1.Subscription)
                                addEntityIfInUse(_subscription.state.entity);
                        });
                        let details = 'Some entities still in use:';
                        if (_channelsInUse.length + _channelGroupsInUse.length === subscriptionInput.length)
                            details = "Can't unregister event handle capable because entities still in use:";
                        return { messageType: 'object', message: { entities: _entitiesInUse }, details };
                    });
                    subscriptionInput.remove(new subscription_2.SubscriptionInput({ channels: _channelsInUse, channelGroups: _channelGroupsInUse }));
                    if (subscriptionInput.isEmpty)
                        return;
                }
            }
            const parameters = {};
            parameters.channels = subscriptionInput.channels;
            parameters.channelGroups = subscriptionInput.channelGroups;
            if (this.subscriptionManager)
                this.subscriptionManager.unsubscribe(parameters);
            else if (this.eventEngine)
                this.eventEngine.unsubscribe(parameters);
        }
    }
    /**
     * Subscribe to specified channels and groups real-time events.
     *
     * @param parameters - Request configuration parameters.
     */
    subscribe(parameters) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Subscribe with parameters:',
            }));
            // The addition of a new subscription set into the subscribed global subscription set will update the active
            // subscription loop with new channels and groups.
            const subscriptionSet = this.subscriptionSet(Object.assign(Object.assign({}, parameters), { subscriptionOptions: { receivePresenceEvents: parameters.withPresence } }));
            this.globalSubscriptionSet.addSubscriptionSet(subscriptionSet);
            subscriptionSet.dispose();
            const timetoken = typeof parameters.timetoken === 'number' ? `${parameters.timetoken}` : parameters.timetoken;
            this.globalSubscriptionSet.subscribe({ timetoken });
        }
        else
            throw new Error('Subscription error: subscription module disabled');
    }
    /**
     * Perform subscribe request.
     *
     * **Note:** Method passed into managers to let them use it when required.
     *
     * @internal
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    makeSubscribe(parameters, callback) {
        if (process.env.SUBSCRIBE_MANAGER_MODULE !== 'disabled') {
            // `on-demand` query parameter not required for non-SharedWorker environment.
            if (!this._configuration.isSharedWorkerEnabled())
                parameters.onDemand = false;
            const request = new subscribe_1.SubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
            this.sendRequest(request, (status, result) => {
                var _a;
                if (this.subscriptionManager && ((_a = this.subscriptionManager.abort) === null || _a === void 0 ? void 0 : _a.identifier) === request.requestIdentifier)
                    this.subscriptionManager.abort = null;
                callback(status, result);
            });
            /**
             * Allow subscription cancellation.
             *
             * **Note:** Had to be done after scheduling because the transport provider returns the cancellation
             * controller only when schedule new request.
             */
            if (this.subscriptionManager) {
                // Creating an identifiable abort caller.
                const callableAbort = () => request.abort('Cancel long-poll subscribe request');
                callableAbort.identifier = request.requestIdentifier;
                this.subscriptionManager.abort = callableAbort;
            }
        }
        else
            throw new Error('Subscription error: subscription manager module disabled');
    }
    /**
     * Unsubscribe from specified channels and groups real-time events.
     *
     * @param parameters - Request configuration parameters.
     */
    unsubscribe(parameters) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Unsubscribe with parameters:',
            }));
            if (!this._globalSubscriptionSet) {
                this.logger.debug('PubNub', 'There are no active subscriptions. Ignore.');
                return;
            }
            const subscriptions = this.globalSubscriptionSet.subscriptions.filter((subscription) => {
                var _a, _b;
                const subscriptionInput = subscription.subscriptionInput(false);
                if (subscriptionInput.isEmpty)
                    return false;
                for (const channel of (_a = parameters.channels) !== null && _a !== void 0 ? _a : [])
                    if (subscriptionInput.contains(channel))
                        return true;
                for (const group of (_b = parameters.channelGroups) !== null && _b !== void 0 ? _b : [])
                    if (subscriptionInput.contains(group))
                        return true;
            });
            // Removal from the active subscription also will cause `unsubscribe`.
            if (subscriptions.length > 0)
                this.globalSubscriptionSet.removeSubscriptions(subscriptions);
        }
        else
            throw new Error('Unsubscription error: subscription module disabled');
    }
    /**
     * Perform unsubscribe request.
     *
     * **Note:** Method passed into managers to let them use it when required.
     *
     * @internal
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    makeUnsubscribe(parameters, callback) {
        if (process.env.PRESENCE_MODULE !== 'disabled') {
            // Filtering out presence channels and groups.
            let { channels, channelGroups } = parameters;
            // Remove `-pnpres` channels / groups if they not acceptable in the current PubNub client configuration.
            if (!this._configuration.getKeepPresenceChannelsInPresenceRequests()) {
                if (channelGroups)
                    channelGroups = channelGroups.filter((channelGroup) => !channelGroup.endsWith('-pnpres'));
                if (channels)
                    channels = channels.filter((channel) => !channel.endsWith('-pnpres'));
            }
            // Complete immediately request only for presence channels.
            if ((channelGroups !== null && channelGroups !== void 0 ? channelGroups : []).length === 0 && (channels !== null && channels !== void 0 ? channels : []).length === 0) {
                return callback({
                    error: false,
                    operation: operations_1.default.PNUnsubscribeOperation,
                    category: categories_1.default.PNAcknowledgmentCategory,
                    statusCode: 200,
                });
            }
            this.sendRequest(new leave_1.PresenceLeaveRequest({ channels, channelGroups, keySet: this._configuration.keySet }), callback);
        }
        else
            throw new Error('Unsubscription error: presence module disabled');
    }
    /**
     * Unsubscribe from all channels and groups.
     */
    unsubscribeAll() {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            this.logger.debug('PubNub', 'Unsubscribe all channels and groups');
            // Keeping a subscription set instance after invalidation so to make it possible to deliver the expected
            // disconnection status.
            if (this._globalSubscriptionSet)
                this._globalSubscriptionSet.invalidate(false);
            Object.values(this.eventHandleCapable).forEach((subscription) => subscription.invalidate(false));
            this.eventHandleCapable = {};
            if (this.subscriptionManager)
                this.subscriptionManager.unsubscribeAll();
            else if (this.eventEngine)
                this.eventEngine.unsubscribeAll();
        }
        else
            throw new Error('Unsubscription error: subscription module disabled');
    }
    /**
     * Temporarily disconnect from the real-time events stream.
     *
     * **Note:** `isOffline` is set to `true` only when a client experiences network issues.
     *
     * @param [isOffline] - Whether `offline` presence should be notified or not.
     */
    disconnect(isOffline = false) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            this.logger.debug('PubNub', `Disconnect (while offline? ${!!isOffline ? 'yes' : 'no'})`);
            if (this.subscriptionManager)
                this.subscriptionManager.disconnect();
            else if (this.eventEngine)
                this.eventEngine.disconnect(isOffline);
        }
        else
            throw new Error('Disconnection error: subscription module disabled');
    }
    /**
     * Restore connection to the real-time events stream.
     *
     * @param parameters - Reconnection catch-up configuration. **Note:** available only with the enabled event engine.
     */
    reconnect(parameters) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Reconnect with parameters:',
            }));
            if (this.subscriptionManager)
                this.subscriptionManager.reconnect();
            else if (this.eventEngine)
                this.eventEngine.reconnect(parameters !== null && parameters !== void 0 ? parameters : {});
        }
        else
            throw new Error('Reconnection error: subscription module disabled');
    }
    /**
     * Event engine handshake subscribe.
     *
     * @internal
     *
     * @param parameters - Request configuration parameters.
     */
    subscribeHandshake(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
                // `on-demand` query parameter not required for non-SharedWorker environment.
                if (!this._configuration.isSharedWorkerEnabled())
                    parameters.onDemand = false;
                const request = new handshake_1.HandshakeSubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
                const abortUnsubscribe = parameters.abortSignal.subscribe((err) => {
                    request.abort('Cancel subscribe handshake request');
                });
                /**
                 * Allow subscription cancellation.
                 *
                 * **Note:** Had to be done after scheduling because the transport provider returns the cancellation
                 * controller only when schedule new request.
                 */
                const handshakeResponse = this.sendRequest(request);
                return handshakeResponse.then((response) => {
                    abortUnsubscribe();
                    return response.cursor;
                });
            }
            else
                throw new Error('Handshake subscription error: subscription event engine module disabled');
        });
    }
    /**
     * Event engine receive messages subscribe.
     *
     * @internal
     *
     * @param parameters - Request configuration parameters.
     */
    subscribeReceiveMessages(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
                // `on-demand` query parameter not required for non-SharedWorker environment.
                if (!this._configuration.isSharedWorkerEnabled())
                    parameters.onDemand = false;
                const request = new receiveMessages_1.ReceiveMessagesSubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
                const abortUnsubscribe = parameters.abortSignal.subscribe((err) => {
                    request.abort('Cancel long-poll subscribe request');
                });
                /**
                 * Allow subscription cancellation.
                 *
                 * **Note:** Had to be done after scheduling because the transport provider returns the cancellation
                 * controller only when schedule new request.
                 */
                const receiveResponse = this.sendRequest(request);
                return receiveResponse.then((response) => {
                    abortUnsubscribe();
                    return response;
                });
            }
            else
                throw new Error('Subscription receive error: subscription event engine module disabled');
        });
    }
    /**
     * Get reactions to a specific message.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get reactions response or `void` in case if `callback` provided.
     */
    getMessageActions(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.MESSAGE_REACTIONS_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Get message actions with parameters:',
                }));
                const request = new get_message_actions_1.GetMessageActionsRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Get message actions success. Received ${response.data.length} message actions.`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Get Message Actions error: message reactions module disabled');
        });
    }
    /**
     * Add a reaction to a specific message.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous add a reaction response or `void` in case if `callback` provided.
     */
    addMessageAction(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.MESSAGE_REACTIONS_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Add message action with parameters:',
                }));
                const request = new add_message_action_1.AddMessageActionRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Message action add success. Message action added with timetoken: ${response.data.actionTimetoken}`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Add Message Action error: message reactions module disabled');
        });
    }
    /**
     * Remove a reaction from a specific message.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous remove a reaction response or `void` in case if `callback` provided.
     */
    removeMessageAction(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.MESSAGE_REACTIONS_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Remove message action with parameters:',
                }));
                const request = new remove_message_action_1.RemoveMessageAction(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Message action remove success. Removed message action with ${parameters.actionTimetoken} timetoken.`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Remove Message Action error: message reactions module disabled');
        });
    }
    /**
     * Fetch messages history for channels.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous fetch messages response or `void` in case if `callback` provided.
     */
    fetchMessages(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.MESSAGE_PERSISTENCE_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Fetch messages with parameters:',
                }));
                const request = new fetch_messages_1.FetchMessagesRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    const messagesCount = Object.values(response.channels).reduce((acc, message) => acc + message.length, 0);
                    this.logger.debug('PubNub', `Fetch messages success. Received ${messagesCount} messages.`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Fetch Messages History error: message persistence module disabled');
        });
    }
    /**
     * Delete messages from the channel history.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous delete messages response or `void` in case if `callback` provided.
     *
     */
    deleteMessages(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.MESSAGE_PERSISTENCE_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Delete messages with parameters:',
                }));
                const request = new delete_messages_1.DeleteMessageRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Delete messages success.`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Delete Messages error: message persistence module disabled');
        });
    }
    /**
     * Count messages from the channels' history.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous count messages response or `void` in case if `callback` provided.
     */
    messageCounts(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.MESSAGE_PERSISTENCE_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Get messages count with parameters:',
                }));
                const request = new message_counts_1.MessageCountRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    const messagesCount = Object.values(response.channels).reduce((acc, messagesCount) => acc + messagesCount, 0);
                    this.logger.debug('PubNub', `Get messages count success. There are ${messagesCount} messages since provided reference timetoken${parameters.channelTimetokens ? parameters.channelTimetokens.join(',') : ''.length > 1 ? 's' : ''}.`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Get Messages Count error: message persistence module disabled');
        });
    }
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
    history(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.MESSAGE_PERSISTENCE_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Fetch history with parameters:',
                }));
                const request = new get_history_1.GetHistoryRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Fetch history success. Received ${response.messages.length} messages.`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Get Messages History error: message persistence module disabled');
        });
    }
    /**
     * Get channel's presence information.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get channel's presence response or `void` in case if `callback` provided.
     */
    hereNow(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.PRESENCE_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Here now with parameters:',
                }));
                const request = new here_now_1.HereNowRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Here now success. There are ${response.totalOccupancy} participants in ${response.totalChannels} channels.`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Get Channel Here Now error: presence module disabled');
        });
    }
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
    whereNow(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (process.env.PRESENCE_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Where now with parameters:',
                }));
                const request = new where_now_1.WhereNowRequest({
                    uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId,
                    keySet: this._configuration.keySet,
                });
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Where now success. Currently present in ${response.channels.length} channels.`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Get UUID Here Now error: presence module disabled');
        });
    }
    /**
     * Get associated user's data for channels and groups.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get user's data response or `void` in case if `callback` provided.
     */
    getState(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (process.env.PRESENCE_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Get presence state with parameters:',
                }));
                const request = new get_state_1.GetPresenceStateRequest(Object.assign(Object.assign({}, parameters), { uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId, keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Get presence state success. Received presence state for ${Object.keys(response.channels).length} channels.`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Get UUID State error: presence module disabled');
        });
    }
    /**
     * Set associated user's data for channels and groups.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set user's data response or `void` in case if `callback` provided.
     */
    setState(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (process.env.PRESENCE_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Set presence state with parameters:',
                }));
                const { keySet, userId: userId } = this._configuration;
                const heartbeat = this._configuration.getPresenceTimeout();
                let request;
                // Maintain presence information (if required).
                if (this._configuration.enableEventEngine && this.presenceState) {
                    const presenceState = this.presenceState;
                    (_a = parameters.channels) === null || _a === void 0 ? void 0 : _a.forEach((channel) => (presenceState[channel] = parameters.state));
                    if ('channelGroups' in parameters) {
                        (_b = parameters.channelGroups) === null || _b === void 0 ? void 0 : _b.forEach((group) => (presenceState[group] = parameters.state));
                    }
                    if (this.onPresenceStateChange)
                        this.onPresenceStateChange(this.presenceState);
                }
                // Check whether the state should be set with heartbeat or not.
                if ('withHeartbeat' in parameters && parameters.withHeartbeat) {
                    request = new heartbeat_1.HeartbeatRequest(Object.assign(Object.assign({}, parameters), { keySet, heartbeat }));
                }
                else {
                    request = new set_state_1.SetPresenceStateRequest(Object.assign(Object.assign({}, parameters), { keySet, uuid: userId }));
                }
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Set presence state success.${request instanceof heartbeat_1.HeartbeatRequest ? ' Presence state has been set using heartbeat endpoint.' : ''}`);
                };
                // Update state used by subscription manager.
                if (this.subscriptionManager) {
                    this.subscriptionManager.setState(parameters);
                    if (this.onPresenceStateChange)
                        this.onPresenceStateChange(this.subscriptionManager.presenceState);
                }
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Set UUID State error: presence module disabled');
        });
    }
    // endregion
    // region Change presence state
    /**
     * Manual presence management.
     *
     * @param parameters - Desired presence state for a provided list of channels and groups.
     */
    presence(parameters) {
        var _a;
        if (process.env.SUBSCRIBE_MANAGER_MODULE !== 'disabled') {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Change presence with parameters:',
            }));
            (_a = this.subscriptionManager) === null || _a === void 0 ? void 0 : _a.changePresence(parameters);
        }
        else
            throw new Error('Change UUID presence error: subscription manager module disabled');
    }
    // endregion
    // region Heartbeat
    /**
     * Announce user presence
     *
     * @internal
     *
     * @param parameters - Desired presence state for provided list of channels and groups.
     * @param callback - Request completion handler callback.
     */
    heartbeat(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (process.env.PRESENCE_MODULE !== 'disabled') {
                this.logger.trace('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Heartbeat with parameters:',
                }));
                // Filtering out presence channels and groups.
                let { channels, channelGroups } = parameters;
                // Remove `-pnpres` channels / groups if they not acceptable in the current PubNub client configuration.
                if (channelGroups)
                    channelGroups = channelGroups.filter((channelGroup) => !channelGroup.endsWith('-pnpres'));
                if (channels)
                    channels = channels.filter((channel) => !channel.endsWith('-pnpres'));
                // Complete immediately request only for presence channels.
                if ((channelGroups !== null && channelGroups !== void 0 ? channelGroups : []).length === 0 && (channels !== null && channels !== void 0 ? channels : []).length === 0) {
                    const responseStatus = {
                        error: false,
                        operation: operations_1.default.PNHeartbeatOperation,
                        category: categories_1.default.PNAcknowledgmentCategory,
                        statusCode: 200,
                    };
                    this.logger.trace('PubNub', 'There are no active subscriptions. Ignore.');
                    if (callback)
                        return callback(responseStatus, {});
                    return Promise.resolve(responseStatus);
                }
                const request = new heartbeat_1.HeartbeatRequest(Object.assign(Object.assign({}, parameters), { channels: [...new Set(channels)], channelGroups: [...new Set(channelGroups)], keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.trace('PubNub', 'Heartbeat success.');
                };
                const abortUnsubscribe = (_a = parameters.abortSignal) === null || _a === void 0 ? void 0 : _a.subscribe((err) => {
                    request.abort('Cancel long-poll subscribe request');
                });
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        if (abortUnsubscribe)
                            abortUnsubscribe();
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    if (abortUnsubscribe)
                        abortUnsubscribe();
                    return response;
                });
            }
            else
                throw new Error('Announce UUID Presence error: presence module disabled');
        });
    }
    // endregion
    // region Join
    /**
     * Announce user `join` on specified list of channels and groups.
     *
     * @internal
     *
     * @param parameters - List of channels and groups where `join` event should be sent.
     */
    join(parameters) {
        var _a, _b;
        if (process.env.PRESENCE_MODULE !== 'disabled') {
            this.logger.trace('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Join with parameters:',
            }));
            if (parameters && ((_a = parameters.channels) !== null && _a !== void 0 ? _a : []).length === 0 && ((_b = parameters.groups) !== null && _b !== void 0 ? _b : []).length === 0) {
                this.logger.trace('PubNub', "Ignoring 'join' announcement request.");
                return;
            }
            if (this.presenceEventEngine)
                this.presenceEventEngine.join(parameters);
            else {
                this.heartbeat(Object.assign(Object.assign({ channels: parameters.channels, channelGroups: parameters.groups }, (this._configuration.maintainPresenceState &&
                    this.presenceState &&
                    Object.keys(this.presenceState).length > 0 && { state: this.presenceState })), { heartbeat: this._configuration.getPresenceTimeout() }), () => { });
            }
        }
        else
            throw new Error('Announce UUID Presence error: presence module disabled');
    }
    /**
     * Reconnect presence event engine after network issues.
     *
     * @param parameters - List of channels and groups where `join` event should be sent.
     *
     * @internal
     */
    presenceReconnect(parameters) {
        if (process.env.PRESENCE_MODULE !== 'disabled') {
            this.logger.trace('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Presence reconnect with parameters:',
            }));
            if (this.presenceEventEngine)
                this.presenceEventEngine.reconnect();
            else {
                this.heartbeat(Object.assign(Object.assign({ channels: parameters.channels, channelGroups: parameters.groups }, (this._configuration.maintainPresenceState && { state: this.presenceState })), { heartbeat: this._configuration.getPresenceTimeout() }), () => { });
            }
        }
        else
            throw new Error('Announce UUID Presence error: presence module disabled');
    }
    // endregion
    // region Leave
    /**
     * Announce user `leave` on specified list of channels and groups.
     *
     * @internal
     *
     * @param parameters - List of channels and groups where `leave` event should be sent.
     */
    leave(parameters) {
        var _a, _b, _c;
        if (process.env.PRESENCE_MODULE !== 'disabled') {
            this.logger.trace('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Leave with parameters:',
            }));
            if (parameters && ((_a = parameters.channels) !== null && _a !== void 0 ? _a : []).length === 0 && ((_b = parameters.groups) !== null && _b !== void 0 ? _b : []).length === 0) {
                this.logger.trace('PubNub', "Ignoring 'leave' announcement request.");
                return;
            }
            if (this.presenceEventEngine)
                (_c = this.presenceEventEngine) === null || _c === void 0 ? void 0 : _c.leave(parameters);
            else
                this.makeUnsubscribe({ channels: parameters.channels, channelGroups: parameters.groups }, () => { });
        }
        else
            throw new Error('Announce UUID Leave error: presence module disabled');
    }
    /**
     * Announce user `leave` on all subscribed channels.
     *
     * @internal
     *
     * @param parameters - List of channels and groups where `leave` event should be sent.
     */
    leaveAll(parameters = {}) {
        if (process.env.PRESENCE_MODULE !== 'disabled') {
            this.logger.trace('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Leave all with parameters:',
            }));
            if (this.presenceEventEngine)
                this.presenceEventEngine.leaveAll(!!parameters.isOffline);
            else if (!parameters.isOffline)
                this.makeUnsubscribe({ channels: parameters.channels, channelGroups: parameters.groups }, () => { });
        }
        else
            throw new Error('Announce UUID Leave error: presence module disabled');
    }
    /**
     * Announce user `leave` on disconnection.
     *
     * @internal
     *
     * @param parameters - List of channels and groups where `leave` event should be sent.
     */
    presenceDisconnect(parameters) {
        if (process.env.PRESENCE_MODULE !== 'disabled') {
            this.logger.trace('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Presence disconnect parameters:',
            }));
            if (this.presenceEventEngine)
                this.presenceEventEngine.disconnect(!!parameters.isOffline);
            else if (!parameters.isOffline)
                this.makeUnsubscribe({ channels: parameters.channels, channelGroups: parameters.groups }, () => { });
        }
        else
            throw new Error('Announce UUID Leave error: presence module disabled');
    }
    /**
     * Grant token permission.
     *
     * Generate an access token with requested permissions.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous grant token response or `void` in case if `callback` provided.
     */
    grantToken(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.PAM_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Grant token permissions with parameters:',
                }));
                const request = new grant_token_1.GrantTokenRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Grant token permissions success. Received token with requested permissions: ${response}`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Grant Token error: PAM module disabled');
        });
    }
    /**
     * Revoke token permission.
     *
     * @param token - Access token for which permissions should be revoked.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous revoke token response or `void` in case if `callback` provided.
     */
    revokeToken(token, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.PAM_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: { token },
                    details: 'Revoke token permissions with parameters:',
                }));
                const request = new revoke_token_1.RevokeTokenRequest({ token, keySet: this._configuration.keySet });
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', 'Revoke token permissions success.');
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Revoke Token error: PAM module disabled');
        });
    }
    // endregion
    // region Token Manipulation
    /**
     * Get a current access token.
     *
     * @returns Previously configured access token using {@link setToken} method.
     */
    get token() {
        return this.tokenManager && this.tokenManager.getToken();
    }
    /**
     * Get a current access token.
     *
     * @returns Previously configured access token using {@link setToken} method.
     */
    getToken() {
        return this.token;
    }
    /**
     * Set current access token.
     *
     * @param token - New access token which should be used with next REST API endpoint calls.
     */
    set token(token) {
        if (this.tokenManager)
            this.tokenManager.setToken(token);
        if (this.onAuthenticationChange)
            this.onAuthenticationChange(token);
    }
    /**
     * Set current access token.
     *
     * @param token - New access token which should be used with next REST API endpoint calls.
     */
    setToken(token) {
        this.token = token;
    }
    /**
     * Parse access token.
     *
     * Parse token to see what permissions token owner has.
     *
     * @param token - Token which should be parsed.
     *
     * @returns Token's permissions information for the resources.
     */
    parseToken(token) {
        return this.tokenManager && this.tokenManager.parseToken(token);
    }
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
    grant(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.PAM_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Grant auth key(s) permissions with parameters:',
                }));
                const request = new grant_1.GrantRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', 'Grant auth key(s) permissions success.');
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Grant error: PAM module disabled');
        });
    }
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
    audit(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.PAM_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: 'Audit auth key(s) permissions with parameters:',
                }));
                const request = new audit_1.AuditRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', 'Audit auth key(s) permissions success.');
                };
                if (callback) {
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        return callback(status, response);
                    });
                }
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Grant Permissions error: PAM module disabled');
        });
    }
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
    get objects() {
        return this._objects;
    }
    /**
     Fetch a paginated list of User objects.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all User objects response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata getAllUUIDMetadata} method instead.
     */
    fetchUsers(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
                this.logger.warn('PubNub', "'fetchUsers' is deprecated. Use 'pubnub.objects.getAllUUIDMetadata' instead.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: !parametersOrCallback || typeof parametersOrCallback === 'function' ? {} : parametersOrCallback,
                    details: `Fetch all User objects with parameters:`,
                }));
                return this.objects._getAllUUIDMetadata(parametersOrCallback, callback);
            }
            else
                throw new Error('Fetch Users Metadata error: App Context module disabled');
        });
    }
    /**
     * Fetch User object for a currently configured PubNub client `uuid`.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get User object response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata getUUIDMetadata} method instead.
     */
    fetchUser(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
                this.logger.warn('PubNub', "'fetchUser' is deprecated. Use 'pubnub.objects.getUUIDMetadata' instead.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: !parametersOrCallback || typeof parametersOrCallback === 'function'
                        ? { uuid: this.userId }
                        : parametersOrCallback,
                    details: `Fetch${!parametersOrCallback || typeof parametersOrCallback === 'function' ? ' current' : ''} User object with parameters:`,
                }));
                return this.objects._getUUIDMetadata(parametersOrCallback, callback);
            }
            else
                throw new Error('Fetch User Metadata error: App Context module disabled');
        });
    }
    /**
     * Create a User object.
     *
     * @param parameters - Request configuration parameters. Will create a User object for a currently
     * configured PubNub client `uuid` if not set.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous create User object response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata setUUIDMetadata} method instead.
     */
    createUser(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
                this.logger.warn('PubNub', "'createUser' is deprecated. Use 'pubnub.objects.setUUIDMetadata' instead.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `Create User object with parameters:`,
                }));
                return this.objects._setUUIDMetadata(parameters, callback);
            }
            else
                throw new Error('Create User Metadata error: App Context module disabled');
        });
    }
    /**
     * Update a User object.
     *
     * @param parameters - Request configuration parameters. Will update a User object for a currently
     * configured PubNub client `uuid` if not set.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update User object response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata setUUIDMetadata} method instead.
     */
    updateUser(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.warn('PubNub', "'updateUser' is deprecated. Use 'pubnub.objects.setUUIDMetadata' instead.");
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `Update User object with parameters:`,
                }));
                return this.objects._setUUIDMetadata(parameters, callback);
            }
            else
                throw new Error('Update User Metadata error: App Context module disabled');
        });
    }
    /**
     * Remove a specific User object.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous User object removes response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata removeUUIDMetadata} method instead.
     */
    removeUser(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
                this.logger.warn('PubNub', "'removeUser' is deprecated. Use 'pubnub.objects.removeUUIDMetadata' instead.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: !parametersOrCallback || typeof parametersOrCallback === 'function'
                        ? { uuid: this.userId }
                        : parametersOrCallback,
                    details: `Remove${!parametersOrCallback || typeof parametersOrCallback === 'function' ? ' current' : ''} User object with parameters:`,
                }));
                return this.objects._removeUUIDMetadata(parametersOrCallback, callback);
            }
            else
                throw new Error('Remove User Metadata error: App Context module disabled');
        });
    }
    /**
     * Fetch a paginated list of Space objects.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all Space objects response or `void` in case if `callback`
     * provided.
     *
     * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata getAllChannelMetadata} method instead.
     */
    fetchSpaces(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
                this.logger.warn('PubNub', "'fetchSpaces' is deprecated. Use 'pubnub.objects.getAllChannelMetadata' instead.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: !parametersOrCallback || typeof parametersOrCallback === 'function' ? {} : parametersOrCallback,
                    details: `Fetch all Space objects with parameters:`,
                }));
                return this.objects._getAllChannelMetadata(parametersOrCallback, callback);
            }
            else
                throw new Error('Fetch Spaces Metadata error: App Context module disabled');
        });
    }
    /**
     * Fetch a specific Space object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get Space object response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.getChannelMetadata getChannelMetadata} method instead.
     */
    fetchSpace(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
                this.logger.warn('PubNub', "'fetchSpace' is deprecated. Use 'pubnub.objects.getChannelMetadata' instead.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `Fetch Space object with parameters:`,
                }));
                return this.objects._getChannelMetadata(parameters, callback);
            }
            else
                throw new Error('Fetch Space Metadata error: App Context module disabled');
        });
    }
    /**
     * Create specific Space object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous create Space object response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMetadata setChannelMetadata} method instead.
     */
    createSpace(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
                this.logger.warn('PubNub', "'createSpace' is deprecated. Use 'pubnub.objects.setChannelMetadata' instead.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `Create Space object with parameters:`,
                }));
                return this.objects._setChannelMetadata(parameters, callback);
            }
            else
                throw new Error('Create Space Metadata error: App Context module disabled');
        });
    }
    /**
     * Update specific Space object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update Space object response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMetadata setChannelMetadata} method instead.
     */
    updateSpace(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
                this.logger.warn('PubNub', "'updateSpace' is deprecated. Use 'pubnub.objects.setChannelMetadata' instead.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `Update Space object with parameters:`,
                }));
                return this.objects._setChannelMetadata(parameters, callback);
            }
            else
                throw new Error('Update Space Metadata error: App Context module disabled');
        });
    }
    /**
     * Remove a specific Space object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous Space object remove response or `void` in case if `callback`
     * provided.
     *
     * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata removeChannelMetadata} method instead.
     */
    removeSpace(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
                this.logger.warn('PubNub', "'removeSpace' is deprecated. Use 'pubnub.objects.removeChannelMetadata' instead.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `Remove Space object with parameters:`,
                }));
                return this.objects._removeChannelMetadata(parameters, callback);
            }
            else
                throw new Error('Remove Space Metadata error: App Context module disabled');
        });
    }
    /**
     * Fetch a paginated list of specific Space members or specific User memberships.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get specific Space members or specific User memberships response or
     * `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.getChannelMembers getChannelMembers} or
     * {@link PubNubCore#objects.getMemberships getMemberships} methods instead.
     */
    fetchMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects.fetchMemberships(parameters, callback);
            else
                throw new Error('Fetch Memberships error: App Context module disabled');
        });
    }
    /**
     * Add members to specific Space or memberships specific User.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous add members to specific Space or memberships specific User response or
     * `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMembers setChannelMembers} or
     * {@link PubNubCore#objects.setMemberships setMemberships} methods instead.
     */
    addMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects.addMemberships(parameters, callback);
            else
                throw new Error('Add Memberships error: App Context module disabled');
        });
    }
    /**
     * Update specific Space members or User memberships.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update Space members or User memberships response or `void` in case
     * if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMembers setChannelMembers} or
     * {@link PubNubCore#objects.setMemberships setMemberships} methods instead.
     */
    updateMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
                this.logger.warn('PubNub', "'addMemberships' is deprecated. Use 'pubnub.objects.setChannelMembers' or 'pubnub.objects.setMemberships'" +
                    ' instead.');
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `Update memberships with parameters:`,
                }));
                return this.objects.addMemberships(parameters, callback);
            }
            else
                throw new Error('Update Memberships error: App Context module disabled');
        });
    }
    /**
     * Remove User membership.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous memberships modification response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.removeMemberships removeMemberships} or
     * {@link PubNubCore#objects.removeChannelMembers removeChannelMembers} methods instead from `objects` API group.
     */
    removeMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
                this.logger.warn('PubNub', "'removeMemberships' is deprecated. Use 'pubnub.objects.removeMemberships' or" +
                    " 'pubnub.objects.removeChannelMembers' instead.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `Remove memberships with parameters:`,
                }));
                if ('spaceId' in parameters) {
                    const spaceParameters = parameters;
                    const requestParameters = {
                        channel: (_a = spaceParameters.spaceId) !== null && _a !== void 0 ? _a : spaceParameters.channel,
                        uuids: (_b = spaceParameters.userIds) !== null && _b !== void 0 ? _b : spaceParameters.uuids,
                        limit: 0,
                    };
                    if (callback)
                        return this.objects.removeChannelMembers(requestParameters, callback);
                    return this.objects.removeChannelMembers(requestParameters);
                }
                const userParameters = parameters;
                const requestParameters = {
                    uuid: userParameters.userId,
                    channels: (_c = userParameters.spaceIds) !== null && _c !== void 0 ? _c : userParameters.channels,
                    limit: 0,
                };
                if (callback)
                    return this.objects.removeMemberships(requestParameters, callback);
                return this.objects.removeMemberships(requestParameters);
            }
            else
                throw new Error('Remove Memberships error: App Context module disabled');
        });
    }
    // endregion
    // endregion
    // --------------------------------------------------------
    // ----------------- Channel Groups API -------------------
    // --------------------------------------------------------
    // region Channel Groups API
    /**
     * PubNub Channel Groups API group.
     */
    get channelGroups() {
        return this._channelGroups;
    }
    // endregion
    // --------------------------------------------------------
    // ---------------- Push Notifications API -----------------
    // --------------------------------------------------------
    // region Push Notifications API
    /**
     * PubNub Push Notifications API group.
     */
    get push() {
        return this._push;
    }
    /**
     * Share file to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous file sharing response or `void` in case if `callback` provided.
     */
    sendFile(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.FILE_SHARING_MODULE !== 'disabled') {
                if (!this._configuration.PubNubFile)
                    throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `Send file with parameters:`,
                }));
                const sendFileRequest = new send_file_1.SendFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, fileUploadPublishRetryLimit: this._configuration.fileUploadPublishRetryLimit, file: parameters.file, sendRequest: this.sendRequest.bind(this), publishFile: this.publishFile.bind(this), crypto: this._configuration.getCryptoModule(), cryptography: this.cryptography ? this.cryptography : undefined }));
                const status = {
                    error: false,
                    operation: operations_1.default.PNPublishFileOperation,
                    category: categories_1.default.PNAcknowledgmentCategory,
                    statusCode: 0,
                };
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Send file success. File shared with ${response.id} ID.`);
                };
                return sendFileRequest
                    .process()
                    .then((response) => {
                    status.statusCode = response.status;
                    logResponse(response);
                    if (callback)
                        return callback(status, response);
                    return response;
                })
                    .catch((error) => {
                    let errorStatus;
                    if (error instanceof pubnub_error_1.PubNubError)
                        errorStatus = error.status;
                    else if (error instanceof pubnub_api_error_1.PubNubAPIError)
                        errorStatus = error.toStatus(status.operation);
                    this.logger.error('PubNub', () => ({
                        messageType: 'error',
                        message: new pubnub_error_1.PubNubError('File sending error. Check status for details', errorStatus),
                    }));
                    // Notify callback (if possible).
                    if (callback && errorStatus)
                        callback(errorStatus, null);
                    throw new pubnub_error_1.PubNubError('REST API request processing error. Check status for details', errorStatus);
                });
            }
            else
                throw new Error('Send File error: file sharing module disabled');
        });
    }
    /**
     * Publish file message to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous publish file message response or `void` in case if `callback` provided.
     */
    publishFile(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.FILE_SHARING_MODULE !== 'disabled') {
                if (!this._configuration.PubNubFile)
                    throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `Publish file message with parameters:`,
                }));
                const request = new publish_file_1.PublishFileMessageRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Publish file message success. File message published with timetoken: ${response.timetoken}`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Publish File error: file sharing module disabled');
        });
    }
    /**
     * Retrieve list of shared files in specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous shared files list response or `void` in case if `callback` provided.
     */
    listFiles(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.FILE_SHARING_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `List files with parameters:`,
                }));
                const request = new list_files_1.FilesListRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `List files success. There are ${response.count} uploaded files.`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('List Files error: file sharing module disabled');
        });
    }
    // endregion
    // region Get Download Url
    /**
     * Get file download Url.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns File download Url.
     */
    getFileUrl(parameters) {
        var _a;
        if (process.env.FILE_SHARING_MODULE !== 'disabled') {
            const request = this.transport.request(new get_file_url_1.GetFileDownloadUrlRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet })).request());
            const query = (_a = request.queryParameters) !== null && _a !== void 0 ? _a : {};
            const queryString = Object.keys(query)
                .map((key) => {
                const queryValue = query[key];
                if (!Array.isArray(queryValue))
                    return `${key}=${(0, utils_1.encodeString)(queryValue)}`;
                return queryValue.map((value) => `${key}=${(0, utils_1.encodeString)(value)}`).join('&');
            })
                .join('&');
            return `${request.origin}${request.path}?${queryString}`;
        }
        else
            throw new Error('Generate File Download Url error: file sharing module disabled');
    }
    /**
     * Download a shared file from a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous download shared file response or `void` in case if `callback` provided.
     */
    downloadFile(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.FILE_SHARING_MODULE !== 'disabled') {
                if (!this._configuration.PubNubFile)
                    throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `Download file with parameters:`,
                }));
                const request = new download_file_1.DownloadFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, cryptography: this.cryptography ? this.cryptography : undefined, crypto: this._configuration.getCryptoModule() }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Download file success.`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return (yield this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                }));
            }
            else
                throw new Error('Download File error: file sharing module disabled');
        });
    }
    /**
     * Delete a shared file from a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous delete shared file response or `void` in case if `callback` provided.
     */
    deleteFile(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.FILE_SHARING_MODULE !== 'disabled') {
                this.logger.debug('PubNub', () => ({
                    messageType: 'object',
                    message: Object.assign({}, parameters),
                    details: `Delete file with parameters:`,
                }));
                const request = new delete_file_1.DeleteFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                const logResponse = (response) => {
                    if (!response)
                        return;
                    this.logger.debug('PubNub', `Delete file success. Deleted file with ${parameters.id} ID.`);
                };
                if (callback)
                    return this.sendRequest(request, (status, response) => {
                        logResponse(response);
                        callback(status, response);
                    });
                return this.sendRequest(request).then((response) => {
                    logResponse(response);
                    return response;
                });
            }
            else
                throw new Error('Delete File error: file sharing module disabled');
        });
    }
    /**
     Get current high-precision timetoken.
     *
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get current timetoken response or `void` in case if `callback` provided.
     */
    time(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', 'Get service time.');
            const request = new Time.TimeRequest();
            const logResponse = (response) => {
                if (!response)
                    return;
                this.logger.debug('PubNub', `Get service time success. Current timetoken: ${response.timetoken}`);
            };
            if (callback)
                return this.sendRequest(request, (status, response) => {
                    logResponse(response);
                    callback(status, response);
                });
            return this.sendRequest(request).then((response) => {
                logResponse(response);
                return response;
            });
        });
    }
    // endregion
    // --------------------------------------------------------
    // -------------------- Event emitter ---------------------
    // --------------------------------------------------------
    // region Event emitter
    /**
     * Emit received a status update.
     *
     * Use global and local event dispatchers to deliver a status object.
     *
     * @param status - Status object which should be emitted through the listeners.
     *
     * @internal
     */
    emitStatus(status) {
        var _a;
        if (process.env.SUBSCRIBE_MODULE !== 'disabled')
            (_a = this.eventDispatcher) === null || _a === void 0 ? void 0 : _a.handleStatus(status);
    }
    /**
     * Emit receiver real-time event.
     *
     * Use global and local event dispatchers to deliver an event object.
     *
     * @param cursor - Next subscription loop timetoken.
     * @param event - Event object which should be emitted through the listeners.
     *
     * @internal
     */
    emitEvent(cursor, event) {
        var _a;
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this._globalSubscriptionSet)
                this._globalSubscriptionSet.handleEvent(cursor, event);
            (_a = this.eventDispatcher) === null || _a === void 0 ? void 0 : _a.handleEvent(event);
            Object.values(this.eventHandleCapable).forEach((eventHandleCapable) => {
                if (eventHandleCapable !== this._globalSubscriptionSet)
                    eventHandleCapable.handleEvent(cursor, event);
            });
        }
    }
    /**
     * Set a connection status change event handler.
     *
     * @param listener - Listener function, which will be called each time when the connection status changes.
     */
    set onStatus(listener) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.eventDispatcher)
                this.eventDispatcher.onStatus = listener;
        }
        else
            throw new Error('Listener error: subscription module disabled');
    }
    /**
     * Set a new message handler.
     *
     * @param listener - Listener function, which will be called each time when a new message
     * is received from the real-time network.
     */
    set onMessage(listener) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.eventDispatcher)
                this.eventDispatcher.onMessage = listener;
        }
        else
            throw new Error('Listener error: subscription module disabled');
    }
    /**
     * Set a new presence events handler.
     *
     * @param listener - Listener function, which will be called each time when a new
     * presence event is received from the real-time network.
     */
    set onPresence(listener) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.eventDispatcher)
                this.eventDispatcher.onPresence = listener;
        }
        else
            throw new Error('Listener error: subscription module disabled');
    }
    /**
     * Set a new signal handler.
     *
     * @param listener - Listener function, which will be called each time when a new signal
     * is received from the real-time network.
     */
    set onSignal(listener) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.eventDispatcher)
                this.eventDispatcher.onSignal = listener;
        }
        else
            throw new Error('Listener error: subscription module disabled');
    }
    /**
     * Set a new app context event handler.
     *
     * @param listener - Listener function, which will be called each time when a new
     * app context event is received from the real-time network.
     */
    set onObjects(listener) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.eventDispatcher)
                this.eventDispatcher.onObjects = listener;
        }
        else
            throw new Error('Listener error: subscription module disabled');
    }
    /**
     * Set a new message reaction event handler.
     *
     * @param listener - Listener function, which will be called each time when a
     * new message reaction event is received from the real-time network.
     */
    set onMessageAction(listener) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.eventDispatcher)
                this.eventDispatcher.onMessageAction = listener;
        }
        else
            throw new Error('Listener error: subscription module disabled');
    }
    /**
     * Set a new file handler.
     *
     * @param listener - Listener function, which will be called each time when a new file
     * is received from the real-time network.
     */
    set onFile(listener) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.eventDispatcher)
                this.eventDispatcher.onFile = listener;
        }
        else
            throw new Error('Listener error: subscription module disabled');
    }
    /**
     * Set events handler.
     *
     * @param listener - Events listener configuration object, which lets specify handlers for multiple
     * types of events.
     */
    addListener(listener) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.eventDispatcher) {
                this.eventDispatcher.addListener(listener);
            }
        }
        else
            throw new Error('Listener error: subscription module disabled');
    }
    /**
     * Remove real-time event listener.
     *
     * @param listener - Event listener configuration, which should be removed from the list of notified
     * listeners. **Important:** Should be the same object which has been passed to the
     * {@link addListener}.
     */
    removeListener(listener) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.eventDispatcher)
                this.eventDispatcher.removeListener(listener);
        }
        else
            throw new Error('Listener error: subscription module disabled');
    }
    /**
     * Clear all real-time event listeners.
     */
    removeAllListeners() {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.eventDispatcher)
                this.eventDispatcher.removeAllListeners();
        }
        else
            throw new Error('Listener error: subscription module disabled');
    }
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
     * @param [customCipherKey] - Cipher key which should be used to encrypt data. **Deprecated:**
     * use {@link Configuration#cryptoModule|cryptoModule} instead.
     *
     * @returns Data encryption result as a string.
     *
     * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
     */
    encrypt(data, customCipherKey) {
        this.logger.warn('PubNub', "'encrypt' is deprecated. Use cryptoModule instead.");
        const cryptoModule = this._configuration.getCryptoModule();
        if (!customCipherKey && cryptoModule && typeof data === 'string') {
            const encrypted = cryptoModule.encrypt(data);
            return typeof encrypted === 'string' ? encrypted : (0, base64_codec_1.encode)(encrypted);
        }
        if (!this.crypto)
            throw new Error('Encryption error: cypher key not set');
        if (process.env.CRYPTO_MODULE !== 'disabled') {
            return this.crypto.encrypt(data, customCipherKey);
        }
        else
            throw new Error('Encryption error: crypto module disabled');
    }
    /**
     * Decrypt data.
     *
     * @param data - Stringified data which should be encrypted using `CryptoModule`.
     * @param [customCipherKey] - Cipher key which should be used to decrypt data. **Deprecated:**
     * use {@link Configuration#cryptoModule|cryptoModule} instead.
     *
     * @returns Data decryption result as an object.
     *
     * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
     */
    decrypt(data, customCipherKey) {
        this.logger.warn('PubNub', "'decrypt' is deprecated. Use cryptoModule instead.");
        const cryptoModule = this._configuration.getCryptoModule();
        if (!customCipherKey && cryptoModule) {
            const decrypted = cryptoModule.decrypt(data);
            return decrypted instanceof ArrayBuffer ? JSON.parse(new TextDecoder().decode(decrypted)) : decrypted;
        }
        if (!this.crypto)
            throw new Error('Decryption error: cypher key not set');
        if (process.env.CRYPTO_MODULE !== 'disabled') {
            return this.crypto.decrypt(data, customCipherKey);
        }
        else
            throw new Error('Decryption error: crypto module disabled');
    }
    /**
     * Encrypt file content.
     *
     * @param keyOrFile - Cipher key which should be used to encrypt data or file which should be
     * encrypted using `CryptoModule`.
     * @param [file] - File which should be encrypted using legacy cryptography.
     *
     * @returns Asynchronous file encryption result.
     *
     * @throws Error if a source file isn't provided.
     * @throws File constructor not provided.
     * @throws Crypto module is missing (if non-legacy flow used).
     *
     * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
     */
    encryptFile(keyOrFile, file) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (typeof keyOrFile !== 'string')
                file = keyOrFile;
            if (!file)
                throw new Error('File encryption error. Source file is missing.');
            if (!this._configuration.PubNubFile)
                throw new Error('File encryption error. File constructor not configured.');
            if (typeof keyOrFile !== 'string' && !this._configuration.getCryptoModule())
                throw new Error('File encryption error. Crypto module not configured.');
            if (typeof keyOrFile === 'string') {
                if (!this.cryptography)
                    throw new Error('File encryption error. File encryption not available');
                if (process.env.FILE_SHARING_MODULE !== 'disabled')
                    return this.cryptography.encryptFile(keyOrFile, file, this._configuration.PubNubFile);
                else
                    throw new Error('Encryption error: file sharing module disabled');
            }
            if (process.env.FILE_SHARING_MODULE !== 'disabled')
                return (_a = this._configuration.getCryptoModule()) === null || _a === void 0 ? void 0 : _a.encryptFile(file, this._configuration.PubNubFile);
            else
                throw new Error('Encryption error: file sharing module disabled');
        });
    }
    /**
     * Decrypt file content.
     *
     * @param keyOrFile - Cipher key which should be used to decrypt data or file which should be
     * decrypted using `CryptoModule`.
     * @param [file] - File which should be decrypted using legacy cryptography.
     *
     * @returns Asynchronous file decryption result.
     *
     * @throws Error if source file isn't provided.
     * @throws File constructor not provided.
     * @throws Crypto module is missing (if non-legacy flow used).
     *
     * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
     */
    decryptFile(keyOrFile, file) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (typeof keyOrFile !== 'string')
                file = keyOrFile;
            if (!file)
                throw new Error('File encryption error. Source file is missing.');
            if (!this._configuration.PubNubFile)
                throw new Error('File decryption error. File constructor' + ' not configured.');
            if (typeof keyOrFile === 'string' && !this._configuration.getCryptoModule())
                throw new Error('File decryption error. Crypto module not configured.');
            if (typeof keyOrFile === 'string') {
                if (!this.cryptography)
                    throw new Error('File decryption error. File decryption not available');
                if (process.env.FILE_SHARING_MODULE !== 'disabled')
                    return this.cryptography.decryptFile(keyOrFile, file, this._configuration.PubNubFile);
                else
                    throw new Error('Decryption error: file sharing module disabled');
            }
            if (process.env.FILE_SHARING_MODULE !== 'disabled')
                return (_a = this._configuration.getCryptoModule()) === null || _a === void 0 ? void 0 : _a.decryptFile(file, this._configuration.PubNubFile);
            else
                throw new Error('Decryption error: file sharing module disabled');
        });
    }
}
exports.PubNubCore = PubNubCore;
/**
 * {@link ArrayBuffer} to {@link string} decoder.
 *
 * @internal
 */
PubNubCore.decoder = new TextDecoder();
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
 * Enum with API endpoint groups which can be used with retry policy to set up exclusions (which shouldn't be
 * retried).
 */
PubNubCore.Endpoint = retry_policy_1.Endpoint;
/**
 * Exponential retry policy constructor.
 */
PubNubCore.ExponentialRetryPolicy = retry_policy_1.RetryPolicy.ExponentialRetryPolicy;
/**
 * Linear retry policy constructor.
 */
PubNubCore.LinearRetryPolicy = retry_policy_1.RetryPolicy.LinearRetryPolicy;
/**
 * Disabled / inactive retry policy.
 *
 * **Note:** By default `ExponentialRetryPolicy` is set for subscribe requests and this one can be used to disable
 * retry policy for all requests (setting `undefined` for retry configuration will set default policy).
 */
PubNubCore.NoneRetryPolicy = retry_policy_1.RetryPolicy.None;
/**
 * Available minimum log levels.
 */
PubNubCore.LogLevel = logger_1.LogLevel;
