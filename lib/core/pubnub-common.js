"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubNubCore = void 0;
// region Imports
// region Components
const listener_manager_1 = require("./components/listener_manager");
const subscription_manager_1 = require("./components/subscription-manager");
const push_payload_1 = __importDefault(require("./components/push_payload"));
const eventEmitter_1 = __importDefault(require("./components/eventEmitter"));
const base64_codec_1 = require("./components/base64_codec");
const uuid_1 = __importDefault(require("./components/uuid"));
// endregion
// region Constants
const operations_1 = __importDefault(require("./constants/operations"));
const categories_1 = __importDefault(require("./constants/categories"));
// endregion
const pubnub_error_1 = require("../errors/pubnub-error");
const pubnub_api_error_1 = require("../errors/pubnub-api-error");
// region Event Engine
const presence_1 = require("../event-engine/presence/presence");
const retryPolicy_1 = require("../event-engine/core/retryPolicy");
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
const ChannelMetadata_1 = require("../entities/ChannelMetadata");
const SubscriptionSet_1 = require("../entities/SubscriptionSet");
const ChannelGroup_1 = require("../entities/ChannelGroup");
const UserMetadata_1 = require("../entities/UserMetadata");
const Channel_1 = require("../entities/Channel");
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
// endregion
const utils_1 = require("./utils");
const download_file_1 = require("./endpoints/file_upload/download_file");
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
    constructor(configuration) {
        this._configuration = configuration.configuration;
        this.cryptography = configuration.cryptography;
        this.tokenManager = configuration.tokenManager;
        this.transport = configuration.transport;
        this.crypto = configuration.crypto;
        // API group entry points initialization.
        if (process.env.APP_CONTEXT_MODULE !== 'disabled')
            this._objects = new pubnub_objects_1.default(this._configuration, this.sendRequest.bind(this));
        if (process.env.CHANNEL_GROUPS_MODULE !== 'disabled')
            this._channelGroups = new pubnub_channel_groups_1.default(this._configuration.keySet, this.sendRequest.bind(this));
        if (process.env.MOBILE_PUSH_MODULE !== 'disabled')
            this._push = new pubnub_push_1.default(this._configuration.keySet, this.sendRequest.bind(this));
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            // Prepare for real-time events announcement.
            this.listenerManager = new listener_manager_1.ListenerManager();
            this.eventEmitter = new eventEmitter_1.default(this.listenerManager);
            if (this._configuration.enableEventEngine) {
                if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
                    let heartbeatInterval = this._configuration.getHeartbeatInterval();
                    this.presenceState = {};
                    if (process.env.PRESENCE_MODULE !== 'disabled') {
                        if (heartbeatInterval) {
                            this.presenceEventEngine = new presence_1.PresenceEventEngine({
                                heartbeat: this.heartbeat.bind(this),
                                leave: (parameters) => this.makeUnsubscribe(parameters, () => { }),
                                heartbeatDelay: () => new Promise((resolve, reject) => {
                                    heartbeatInterval = this._configuration.getHeartbeatInterval();
                                    if (!heartbeatInterval)
                                        reject(new pubnub_error_1.PubNubError('Heartbeat interval has been reset.'));
                                    else
                                        setTimeout(resolve, heartbeatInterval * 1000);
                                }),
                                retryDelay: (amount) => new Promise((resolve) => setTimeout(resolve, amount)),
                                emitStatus: (status) => this.listenerManager.announceStatus(status),
                                config: this._configuration,
                                presenceState: this.presenceState,
                            });
                        }
                    }
                    this.eventEngine = new event_engine_1.EventEngine({
                        handshake: this.subscribeHandshake.bind(this),
                        receiveMessages: this.subscribeReceiveMessages.bind(this),
                        delay: (amount) => new Promise((resolve) => setTimeout(resolve, amount)),
                        join: this.join.bind(this),
                        leave: this.leave.bind(this),
                        leaveAll: this.leaveAll.bind(this),
                        presenceState: this.presenceState,
                        config: this._configuration,
                        emitMessages: (events) => {
                            try {
                                events.forEach((event) => this.eventEmitter.emitEvent(event));
                            }
                            catch (e) {
                                const errorStatus = {
                                    error: true,
                                    category: categories_1.default.PNUnknownCategory,
                                    errorData: e,
                                    statusCode: 0,
                                };
                                this.listenerManager.announceStatus(errorStatus);
                            }
                        },
                        emitStatus: (status) => this.listenerManager.announceStatus(status),
                    });
                }
                else
                    throw new Error('Event Engine error: subscription event engine module disabled');
            }
            else {
                if (process.env.SUBSCRIBE_MANAGER_MODULE !== 'disabled') {
                    this.subscriptionManager = new subscription_manager_1.SubscriptionManager(this._configuration, this.listenerManager, this.eventEmitter, this.makeSubscribe.bind(this), this.heartbeat.bind(this), this.makeUnsubscribe.bind(this), this.time.bind(this));
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
        this._configuration.setAuthKey(authKey);
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
     *
     * @param value - New PubNub client user identifier.
     *
     * @throws Error empty user identifier has been provided.
     */
    set userId(value) {
        if (!value || typeof value !== 'string' || value.trim().length === 0)
            throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
        this._configuration.userId = value;
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
        if (!value || typeof value !== 'string' || value.trim().length === 0)
            throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
        this._configuration.userId = value;
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
        this._configuration.setFilterExpression(expression);
    }
    /**
     * Update real-time updates filtering expression.
     *
     * @param expression - New expression which should be used or `undefined` to disable filtering.
     */
    setFilterExpression(expression) {
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
        this.cipherKey = key;
    }
    /**
     * Change heartbeat requests interval.
     *
     * @param interval - New presence request heartbeat intervals.
     */
    set heartbeatInterval(interval) {
        this._configuration.setHeartbeatInterval(interval);
    }
    /**
     * Change heartbeat requests interval.
     *
     * @param interval - New presence request heartbeat intervals.
     */
    setHeartbeatInterval(interval) {
        this.heartbeatInterval = interval;
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
     * @param suffix - Suffix with information about framework.
     */
    _addPnsdkSuffix(name, suffix) {
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
     * @deprecated Use the {@link PubNubCore#setUserId} or {@link PubNubCore#userId} setter instead.
     */
    setUUID(value) {
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
        return new Channel_1.Channel(name, this.eventEmitter, this);
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
        return new ChannelGroup_1.ChannelGroup(name, this.eventEmitter, this);
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
        return new ChannelMetadata_1.ChannelMetadata(id, this.eventEmitter, this);
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
        return new UserMetadata_1.UserMetadata(id, this.eventEmitter, this);
    }
    /**
     * Create subscriptions set object.
     *
     * @param parameters - Subscriptions set configuration parameters.
     */
    subscriptionSet(parameters) {
        if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
            return new SubscriptionSet_1.SubscriptionSet(Object.assign(Object.assign({}, parameters), { eventEmitter: this.eventEmitter, pubnub: this }));
        }
        else
            throw new Error('Subscription error: subscription event engine module disabled');
    }
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
    sendRequest(request, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate user-input.
            const validationResult = request.validate();
            if (validationResult) {
                if (callback)
                    return callback((0, pubnub_error_1.createValidationError)(validationResult), null);
                throw new pubnub_error_1.PubNubError('Validation failed, check status for details', (0, pubnub_error_1.createValidationError)(validationResult));
            }
            // Complete request configuration.
            const transportRequest = request.request();
            if (transportRequest.formData && transportRequest.formData.length > 0) {
                // Set 300 seconds file upload request delay.
                transportRequest.timeout = 300;
            }
            else {
                if (request.operation() === operations_1.default.PNSubscribeOperation)
                    transportRequest.timeout = this._configuration.getSubscribeTimeout();
                else
                    transportRequest.timeout = this._configuration.getTransactionTimeout();
            }
            // API request processing status.
            const status = {
                error: false,
                operation: request.operation(),
                category: categories_1.default.PNAcknowledgmentCategory,
                statusCode: 0,
            };
            const [sendableRequest, cancellationController] = this.transport.makeSendable(transportRequest);
            /**
             * **Important:** Because of multiple environments where JS SDK can be used control over
             * cancellation had to be inverted to let transport provider solve request cancellation task
             * more efficiently. As result, cancellation controller can be retrieved and used only after
             * request will be scheduled by transport provider.
             */
            request.cancellationController = cancellationController ? cancellationController : null;
            return sendableRequest
                .then((response) => {
                status.statusCode = response.status;
                // Handle special case when request completed but not fully processed by PubNub service.
                if (response.status !== 200 && response.status !== 204) {
                    const contentType = response.headers['content-type'];
                    if (contentType || contentType.indexOf('javascript') !== -1 || contentType.indexOf('json') !== -1) {
                        const json = JSON.parse(PubNubCore.decoder.decode(response.body));
                        if (typeof json === 'object' && 'error' in json && json.error && typeof json.error === 'object')
                            status.errorData = json.error;
                    }
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
                if (callback)
                    return callback(apiError.toStatus(request.operation()), null);
                throw apiError.toPubNubError(request.operation(), 'REST API request processing error, check status for details');
            });
        });
    }
    /**
     * Unsubscribe from all channels and groups.
     *
     * @param [isOffline] - Whether `offline` presence should be notified or not.
     */
    destroy(isOffline) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.subscriptionManager) {
                this.subscriptionManager.unsubscribeAll(isOffline);
                this.subscriptionManager.disconnect();
            }
            else if (this.eventEngine)
                this.eventEngine.dispose();
        }
    }
    /**
     * Unsubscribe from all channels and groups.
     *
     * @deprecated Use {@link destroy} method instead.
     */
    stop() {
        this.destroy();
    }
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
    addListener(listener) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled')
            this.listenerManager.addListener(listener);
        else
            throw new Error('Subscription error: subscription module disabled');
    }
    /**
     * Remove real-time event listener.
     *
     * @param listener - Event listeners which should be removed.
     */
    removeListener(listener) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled')
            this.listenerManager.removeListener(listener);
        else
            throw new Error('Subscription error: subscription module disabled');
    }
    /**
     * Clear all real-time event listeners.
     */
    removeAllListeners() {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled')
            this.listenerManager.removeAllListeners();
        else
            throw new Error('Subscription error: subscription module disabled');
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
                const request = new Publish.PublishRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                const request = new Signal.SignalRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
     * Subscribe to specified channels and groups real-time events.
     *
     * @param parameters - Request configuration parameters.
     */
    subscribe(parameters) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.subscriptionManager)
                this.subscriptionManager.subscribe(parameters);
            else if (this.eventEngine)
                this.eventEngine.subscribe(parameters);
        }
        else
            throw new Error('Subscription error: subscription module disabled');
    }
    /**
     * Perform subscribe request.
     *
     * **Note:** Method passed into managers to let them use it when required.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    makeSubscribe(parameters, callback) {
        if (process.env.SUBSCRIBE_MANAGER_MODULE !== 'disabled') {
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
             * **Note:** Had to be done after scheduling because transport provider return cancellation
             * controller only when schedule new request.
             */
            if (this.subscriptionManager) {
                // Creating identifiable abort caller.
                const callableAbort = () => request.abort();
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
            if (this.subscriptionManager)
                this.subscriptionManager.unsubscribe(parameters);
            else if (this.eventEngine)
                this.eventEngine.unsubscribe(parameters);
        }
        else
            throw new Error('Unsubscription error: subscription module disabled');
    }
    /**
     * Perform unsubscribe request.
     *
     * **Note:** Method passed into managers to let them use it when required.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    makeUnsubscribe(parameters, callback) {
        if (process.env.PRESENCE_MODULE !== 'disabled') {
            this.sendRequest(new leave_1.PresenceLeaveRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet })), callback);
        }
        else
            throw new Error('Unsubscription error: presence module disabled');
    }
    /**
     * Unsubscribe from all channels and groups.
     */
    unsubscribeAll() {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.subscriptionManager)
                this.subscriptionManager.unsubscribeAll();
            else if (this.eventEngine)
                this.eventEngine.unsubscribeAll();
        }
        else
            throw new Error('Unsubscription error: subscription module disabled');
    }
    /**
     * Temporarily disconnect from real-time events stream.
     */
    disconnect() {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (this.subscriptionManager)
                this.subscriptionManager.disconnect();
            else if (this.eventEngine)
                this.eventEngine.disconnect();
        }
        else
            throw new Error('Disconnection error: subscription module disabled');
    }
    /**
     * Restore connection to the real-time events stream.
     *
     * @param parameters - Reconnection catch up configuration. **Note:** available only with
     * enabled event engine.
     */
    reconnect(parameters) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
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
     * @param parameters - Request configuration parameters.
     */
    subscribeHandshake(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
                const request = new handshake_1.HandshakeSubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
                const abortUnsubscribe = parameters.abortSignal.subscribe((err) => {
                    request.abort();
                });
                /**
                 * Allow subscription cancellation.
                 *
                 * **Note:** Had to be done after scheduling because transport provider return cancellation
                 * controller only when schedule new request.
                 */
                const handshakeResponse = this.sendRequest(request);
                return handshakeResponse.then((response) => {
                    abortUnsubscribe();
                    return response.cursor;
                });
            }
            else
                throw new Error('Subscription error: subscription event engine module disabled');
        });
    }
    /**
     * Event engine receive messages subscribe.
     *
     * @param parameters - Request configuration parameters.
     */
    subscribeReceiveMessages(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
                const request = new receiveMessages_1.ReceiveMessagesSubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
                const abortUnsubscribe = parameters.abortSignal.subscribe((err) => {
                    request.abort();
                });
                /**
                 * Allow subscription cancellation.
                 *
                 * **Note:** Had to be done after scheduling because transport provider return cancellation
                 * controller only when schedule new request.
                 */
                const handshakeResponse = this.sendRequest(request);
                return handshakeResponse.then((response) => {
                    abortUnsubscribe();
                    return response;
                });
            }
            else
                throw new Error('Subscription error: subscription event engine module disabled');
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
                const request = new get_message_actions_1.GetMessageActionsRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                const request = new add_message_action_1.AddMessageActionRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                const request = new remove_message_action_1.RemoveMessageAction(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                const request = new fetch_messages_1.FetchMessagesRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
     * @deprecated
     */
    deleteMessages(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.MESSAGE_PERSISTENCE_MODULE !== 'disabled') {
                const request = new delete_messages_1.DeleteMessageRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                const request = new message_counts_1.MessageCountRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                const request = new get_history_1.GetHistoryRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                const request = new here_now_1.HereNowRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                const request = new where_now_1.WhereNowRequest({
                    uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId,
                    keySet: this._configuration.keySet,
                });
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                const request = new get_state_1.GetPresenceStateRequest(Object.assign(Object.assign({}, parameters), { uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId, keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                }
                // Check whether state should be set with heartbeat or not.
                if ('withHeartbeat' in parameters) {
                    request = new heartbeat_1.HeartbeatRequest(Object.assign(Object.assign({}, parameters), { keySet, heartbeat }));
                }
                else {
                    request = new set_state_1.SetPresenceStateRequest(Object.assign(Object.assign({}, parameters), { keySet, uuid: userId }));
                }
                // Update state used by subscription manager.
                if (this.subscriptionManager)
                    this.subscriptionManager.setState(parameters);
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
     * @param parameters - Desired presence state for provided list of channels and groups.
     */
    presence(parameters) {
        var _a;
        if (process.env.SUBSCRIBE_MANAGER_MODULE !== 'disabled')
            (_a = this.subscriptionManager) === null || _a === void 0 ? void 0 : _a.changePresence(parameters);
        else
            throw new Error('Change UUID presence error: subscription manager module disabled');
    }
    // endregion
    // region Heartbeat
    /**
     * Announce user presence
     *
     * @param parameters - Desired presence state for provided list of channels and groups.
     * @param callback - Request completion handler callback.
     */
    heartbeat(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.PRESENCE_MODULE !== 'disabled') {
                const request = new heartbeat_1.HeartbeatRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
     * @param parameters - List of channels and groups where `join` event should be sent.
     */
    join(parameters) {
        var _a;
        if (process.env.PRESENCE_MODULE !== 'disabled')
            (_a = this.presenceEventEngine) === null || _a === void 0 ? void 0 : _a.join(parameters);
        else
            throw new Error('Announce UUID Presence error: presence module disabled');
    }
    // endregion
    // region Leave
    /**
     * Announce user `leave` on specified list of channels and groups.
     *
     * @param parameters - List of channels and groups where `leave` event should be sent.
     */
    leave(parameters) {
        var _a;
        if (process.env.PRESENCE_MODULE !== 'disabled')
            (_a = this.presenceEventEngine) === null || _a === void 0 ? void 0 : _a.leave(parameters);
        else
            throw new Error('Announce UUID Leave error: presence module disabled');
    }
    /**
     * Announce user `leave` on all subscribed channels.
     */
    leaveAll() {
        var _a;
        if (process.env.PRESENCE_MODULE !== 'disabled')
            (_a = this.presenceEventEngine) === null || _a === void 0 ? void 0 : _a.leaveAll();
        else
            throw new Error('Announce UUID Leave error: presence module disabled');
    }
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
    grantToken(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.PAM_MODULE !== 'disabled') {
                const request = new grant_token_1.GrantTokenRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                const request = new revoke_token_1.RevokeTokenRequest({ token, keySet: this._configuration.keySet });
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
            }
            else
                throw new Error('Revoke Token error: PAM module disabled');
        });
    }
    // endregion
    // region Token Manipulation
    /**
     * Get current access token.
     *
     * @returns Previously configured access token using {@link setToken} method.
     */
    get token() {
        return this.tokenManager && this.tokenManager.getToken();
    }
    /**
     * Get current access token.
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
                const request = new grant_1.GrantRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                const request = new audit_1.AuditRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
     * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata} method instead.
     */
    fetchUsers(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects._getAllUUIDMetadata(parametersOrCallback, callback);
            else
                throw new Error('Fetch Users Metadata error: App Context module disabled');
        });
    }
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
    fetchUser(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects._getUUIDMetadata(parametersOrCallback, callback);
            else
                throw new Error('Fetch User Metadata error: App Context module disabled');
        });
    }
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
    createUser(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects._setUUIDMetadata(parameters, callback);
            else
                throw new Error('Create User Metadata error: App Context module disabled');
        });
    }
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
    updateUser(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects._setUUIDMetadata(parameters, callback);
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
     * @returns Asynchronous User object remove response or `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata} method instead.
     */
    removeUser(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects._removeUUIDMetadata(parametersOrCallback, callback);
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
     * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata} method instead.
     */
    fetchSpaces(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects._getAllChannelMetadata(parametersOrCallback, callback);
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
     * @deprecated Use {@link PubNubCore#objects.getChannelMetadata} method instead.
     */
    fetchSpace(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects._getChannelMetadata(parameters, callback);
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
     * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
     */
    createSpace(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects._setChannelMetadata(parameters, callback);
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
     * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
     */
    updateSpace(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects._setChannelMetadata(parameters, callback);
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
     * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata} method instead.
     */
    removeSpace(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects._removeChannelMetadata(parameters, callback);
            else
                throw new Error('Remove Space Metadata error: App Context module disabled');
        });
    }
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
     * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
     * methods instead.
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
     * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
     * methods instead.
     */
    updateMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.APP_CONTEXT_MODULE !== 'disabled')
                return this.objects.addMemberships(parameters, callback);
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
     * @deprecated Use {@link PubNubCore#objects.removeMemberships} or {@link PubNubCore#objects.removeChannelMembers}
     * methods instead
     * from `objects` API group..
     */
    removeMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
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
                const sendFileRequest = new send_file_1.SendFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, fileUploadPublishRetryLimit: this._configuration.fileUploadPublishRetryLimit, file: parameters.file, sendRequest: this.sendRequest.bind(this), publishFile: this.publishFile.bind(this), crypto: this._configuration.getCryptoModule(), cryptography: this.cryptography ? this.cryptography : undefined }));
                const status = {
                    error: false,
                    operation: operations_1.default.PNPublishFileOperation,
                    category: categories_1.default.PNAcknowledgmentCategory,
                    statusCode: 0,
                };
                return sendFileRequest
                    .process()
                    .then((response) => {
                    status.statusCode = response.status;
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
                    // Notify callback (if possible).
                    if (callback && errorStatus)
                        callback(errorStatus, null);
                    throw new pubnub_error_1.PubNubError('REST API request processing error, check status for details', errorStatus);
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
                const request = new publish_file_1.PublishFileMessageRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
                const request = new list_files_1.FilesListRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
     * Download shared file from specific channel.
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
                const request = new download_file_1.DownloadFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, cryptography: this.cryptography ? this.cryptography : undefined, crypto: this._configuration.getCryptoModule() }));
                if (callback)
                    return this.sendRequest(request, callback);
                return (yield this.sendRequest(request));
            }
            else
                throw new Error('Download File error: file sharing module disabled');
        });
    }
    /**
     * Delete shared file from specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous delete shared file response or `void` in case if `callback` provided.
     */
    deleteFile(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.FILE_SHARING_MODULE !== 'disabled') {
                const request = new delete_file_1.DeleteFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
                if (callback)
                    return this.sendRequest(request, callback);
                return this.sendRequest(request);
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
            const request = new Time.TimeRequest();
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
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
     * @deprecated
     * @param [customCipherKey] - Cipher key which should be used to encrypt data. **Deprecated:**
     * use {@link Configuration#cryptoModule|cryptoModule} instead.
     *
     * @returns Data encryption result as a string.
     */
    encrypt(data, customCipherKey) {
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
     */
    decrypt(data, customCipherKey) {
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
     * @throws Error if source file not provided.
     * @throws File constructor not provided.
     * @throws Crypto module is missing (if non-legacy flow used).
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
     * @throws Error if source file not provided.
     * @throws File constructor not provided.
     * @throws Crypto module is missing (if non-legacy flow used).
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
 * Exponential retry policy constructor.
 */
PubNubCore.ExponentialRetryPolicy = retryPolicy_1.RetryPolicy.ExponentialRetryPolicy;
/**
 * Linear retry policy constructor.
 */
PubNubCore.LinearRetryPolicy = retryPolicy_1.RetryPolicy.LinearRetryPolicy;
