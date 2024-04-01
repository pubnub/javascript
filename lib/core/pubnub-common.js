var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// region Imports
// region Components
import { ListenerManager } from './components/listener_manager';
import { SubscriptionManager } from './components/subscription-manager';
import NotificationsPayload from './components/push_payload';
import EventEmitter from './components/eventEmitter';
import { encode } from './components/base64_codec';
import uuidGenerator from './components/uuid';
// endregion
// region Constants
import RequestOperation from './constants/operations';
import StatusCategory from './constants/categories';
// endregion
import { createValidationError, PubnubError } from '../errors/pubnub-error';
// region Event Engine
import { PresenceEventEngine } from '../event-engine/presence/presence';
import { RetryPolicy } from '../event-engine/core/retryPolicy';
import { EventEngine } from '../event-engine';
// endregion
// region Publish & Signal
import * as Publish from './endpoints/publish';
import * as Signal from './endpoints/signal';
// endregion
// region Subscription
import { SubscribeRequest } from './endpoints/subscribe';
import { ReceiveMessagesSubscribeRequest } from './endpoints/subscriptionUtils/receiveMessages';
import { HandshakeSubscribeRequest } from './endpoints/subscriptionUtils/handshake';
// endregion
// region Presence
import { GetPresenceStateRequest } from './endpoints/presence/get_state';
import { SetPresenceStateRequest } from './endpoints/presence/set_state';
import { HeartbeatRequest } from './endpoints/presence/heartbeat';
import { PresenceLeaveRequest } from './endpoints/presence/leave';
import { WhereNowRequest } from './endpoints/presence/where_now';
import { HereNowRequest } from './endpoints/presence/here_now';
// endregion
// region Message Storage
import { DeleteMessageRequest } from './endpoints/history/delete_messages';
import { MessageCountRequest } from './endpoints/history/message_counts';
import { GetHistoryRequest } from './endpoints/history/get_history';
import { FetchMessagesRequest } from './endpoints/fetch_messages';
// endregion
// region Message Actions
import { GetMessageActionsRequest } from './endpoints/actions/get_message_actions';
import { AddMessageActionRequest } from './endpoints/actions/add_message_action';
import { RemoveMessageAction } from './endpoints/actions/remove_message_action';
// endregion
// region File sharing
import { PublishFileMessageRequest } from './endpoints/file_upload/publish_file';
import { GetFileDownloadUrlRequest } from './endpoints/file_upload/get_file_url';
import { DeleteFileRequest } from './endpoints/file_upload/delete_file';
import { FilesListRequest } from './endpoints/file_upload/list_files';
import { SendFileRequest } from './endpoints/file_upload/send_file';
// endregion
// region PubNub Access Manager
import { RevokeTokenRequest } from './endpoints/access_manager/revoke_token';
import { GrantTokenRequest } from './endpoints/access_manager/grant_token';
import { GrantRequest } from './endpoints/access_manager/grant';
import { AuditRequest } from './endpoints/access_manager/audit';
import { ChannelMetadata } from '../entities/ChannelMetadata';
import { SubscriptionSet } from '../entities/SubscriptionSet';
import { ChannelGroup } from '../entities/ChannelGroup';
import { UserMetadata } from '../entities/UserMetadata';
import { Channel } from '../entities/Channel';
// endregion
// region Channel Groups
import PubNubChannelGroups from './pubnub-channel-groups';
// endregion
// region Push Notifications
import PubNubPushNotifications from './pubnub-push';
import PubNubObjects from './pubnub-objects';
// endregion
// region Time
import * as Time from './endpoints/time';
// endregion
import { encodeString } from './utils';
import { DownloadFileRequest } from './endpoints/file_upload/download_file';
// endregion
/**
 * Platform-agnostic PubNub client core.
 */
export class PubNubCore {
    /**
     * Construct notification payload which will trigger push notification.
     *
     * @param title - Title which will be shown on notification.
     * @param body - Payload which will be sent as part of notification.
     *
     * @returns Pre-formatted message payload which will trigger push notification.
     */
    static notificationPayload(title, body) {
        return new NotificationsPayload(title, body);
    }
    /**
     * Generate unique identifier.
     *
     * @returns Unique identifier.
     */
    static generateUUID() {
        return uuidGenerator.createUUID();
    }
    // endregion
    constructor(configuration) {
        var _a, _b, _c;
        this._configuration = configuration.configuration;
        this.cryptography = configuration.cryptography;
        this.tokenManager = configuration.tokenManager;
        this.transport = configuration.transport;
        this.crypto = configuration.crypto;
        // API group entry points initialization.
        this._objects = new PubNubObjects(this._configuration, this.sendRequest.bind(this));
        this._channelGroups = new PubNubChannelGroups(this._configuration.keySet, this.sendRequest.bind(this));
        this._push = new PubNubPushNotifications(this._configuration.keySet, this.sendRequest.bind(this));
        // Prepare for real-time events announcement.
        this.listenerManager = new ListenerManager();
        this.eventEmitter = new EventEmitter(this.listenerManager);
        if (this._configuration.enableEventEngine) {
            let heartbeatInterval = this._configuration.getHeartbeatInterval();
            this.presenceState = {};
            if (heartbeatInterval) {
                this.presenceEventEngine = new PresenceEventEngine({
                    heartbeat: this.heartbeat.bind(this),
                    leave: this.unsubscribe.bind(this),
                    heartbeatDelay: () => new Promise((resolve, reject) => {
                        heartbeatInterval = this._configuration.getHeartbeatInterval();
                        if (!heartbeatInterval)
                            reject(new PubnubError('Heartbeat interval has been reset.'));
                        else
                            setTimeout(resolve, heartbeatInterval * 1000);
                    }),
                    retryDelay: (amount) => new Promise((resolve) => setTimeout(resolve, amount)),
                    emitStatus: (status) => this.listenerManager.announceStatus(status),
                    config: this._configuration,
                    presenceState: this.presenceState,
                });
            }
            this.eventEngine = new EventEngine({
                handshake: this.subscribeHandshake.bind(this),
                receiveMessages: this.subscribeReceiveMessages.bind(this),
                delay: (amount) => new Promise((resolve) => setTimeout(resolve, amount)),
                join: (_a = this.presenceEventEngine) === null || _a === void 0 ? void 0 : _a.join.bind(this.presenceEventEngine),
                leave: (_b = this.presenceEventEngine) === null || _b === void 0 ? void 0 : _b.leave.bind(this.presenceEventEngine),
                leaveAll: (_c = this.presenceEventEngine) === null || _c === void 0 ? void 0 : _c.leaveAll.bind(this.presenceEventEngine),
                presenceState: this.presenceState,
                config: this._configuration,
                emitMessages: (events) => events.forEach((event) => this.eventEmitter.emitEvent(event)),
                emitStatus: (status) => this.listenerManager.announceStatus(status),
            });
        }
        else {
            this.subscriptionManager = new SubscriptionManager(this._configuration, this.listenerManager, this.eventEmitter, this.makeSubscribe.bind(this), this.heartbeat.bind(this), this.makeUnsubscribe.bind(this), this.time.bind(this));
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
        return this._configuration.cipherKey;
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
        return this._configuration.version;
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
        return this._configuration.customEncrypt;
    }
    /**
     * Custom data decryption method.
     *
     * @deprecated Instead use {@link cryptoModule} for data decryption.
     */
    get customDecrypt() {
        return this._configuration.customDecrypt;
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
        return new Channel(name, this.eventEmitter, this);
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
        return new ChannelGroup(name, this.eventEmitter, this);
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
        return new ChannelMetadata(id, this.eventEmitter, this);
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
        return new UserMetadata(id, this.eventEmitter, this);
    }
    /**
     * Create subscriptions set object.
     *
     * @param parameters - Subscriptions set configuration parameters.
     */
    subscriptionSet(parameters) {
        return new SubscriptionSet(Object.assign(Object.assign({}, parameters), { eventEmitter: this.eventEmitter, pubnub: this }));
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
     * @throws PubnubError in case of request processing error.
     */
    sendRequest(request, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate user-input.
            const validationResult = request.validate();
            if (validationResult) {
                if (callback)
                    return callback(createValidationError(validationResult), null);
                throw new PubnubError('Validation failed, check status for details', createValidationError(validationResult));
            }
            // Complete request configuration.
            const transportRequest = request.request();
            if (transportRequest.body &&
                typeof transportRequest.body === 'object' &&
                'toArrayBuffer' in transportRequest.body) {
                // Set 300 seconds file upload request delay.
                transportRequest.timeout = 300;
            }
            else {
                if (request.operation() === RequestOperation.PNSubscribeOperation)
                    transportRequest.timeout = this._configuration.getSubscribeTimeout();
                else
                    transportRequest.timeout = this._configuration.getTransactionTimeout();
            }
            // API request processing status.
            const status = {
                error: false,
                operation: request.operation(),
                category: StatusCategory.PNAcknowledgmentCategory,
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
                return request.parse(response);
            })
                .then((parsed) => {
                // Notify callback (if possible).
                if (callback)
                    return callback(status, parsed);
                return parsed;
            })
                .catch((error) => {
                // Notify callback (if possible).
                if (callback)
                    callback(error.toStatus(request.operation()), null);
                throw error.toPubNubError(request.operation(), 'REST API request processing error, check status for details');
            });
        });
    }
    /**
     * Unsubscribe from all channels and groups.
     *
     * @param isOffline - Whether `offline` presence should be notified or not.
     */
    destroy(isOffline) {
        if (this.subscriptionManager) {
            this.subscriptionManager.unsubscribeAll(isOffline);
            this.subscriptionManager.disconnect();
        }
        else if (this.eventEngine)
            this.eventEngine.dispose();
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
        this.listenerManager.addListener(listener);
    }
    /**
     * Remove real-time event listener.
     *
     * @param listener - Event listeners which should be removed.
     */
    removeListener(listener) {
        this.listenerManager.removeListener(listener);
    }
    /**
     * Clear all real-time event listeners.
     */
    removeAllListeners() {
        this.listenerManager.removeAllListeners();
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
            const request = new Publish.PublishRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new Signal.SignalRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
        if (this.subscriptionManager)
            return this.subscriptionManager.subscribedChannels;
        else if (this.eventEngine)
            return this.eventEngine.getSubscribedChannels();
        return [];
    }
    /**
     * Get list of channel groups on which PubNub client currently subscribed.
     *
     * @returns List of active channel groups.
     */
    getSubscribedChannelGroups() {
        if (this.subscriptionManager)
            return this.subscriptionManager.subscribedChannelGroups;
        else if (this.eventEngine)
            return this.eventEngine.getSubscribedChannelGroups();
        return [];
    }
    /**
     * Subscribe to specified channels and groups real-time events.
     *
     * @param parameters - Request configuration parameters.
     */
    subscribe(parameters) {
        if (this.subscriptionManager)
            this.subscriptionManager.subscribe(parameters);
        else if (this.eventEngine)
            this.eventEngine.subscribe(parameters);
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
        const request = new SubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, getFileUrl: this.getFileUrl }));
        this.sendRequest(request, (status, result) => {
            if (this.subscriptionManager && this.subscriptionManager.abort === request.abort)
                this.subscriptionManager.abort = null;
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
    }
    /**
     * Unsubscribe from specified channels and groups real-time events.
     *
     * @param parameters - Request configuration parameters.
     */
    unsubscribe(parameters) {
        if (this.subscriptionManager)
            this.subscriptionManager.unsubscribe(parameters);
        else if (this.eventEngine)
            this.eventEngine.unsubscribe(parameters);
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
        this.sendRequest(new PresenceLeaveRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet })), callback);
    }
    /**
     * Unsubscribe from all channels and groups.
     */
    unsubscribeAll() {
        if (this.subscriptionManager)
            this.subscriptionManager.unsubscribeAll();
        else if (this.eventEngine)
            this.eventEngine.unsubscribeAll();
    }
    /**
     * Temporarily disconnect from real-time events stream.
     */
    disconnect() {
        if (this.subscriptionManager)
            this.subscriptionManager.disconnect();
        else if (this.eventEngine)
            this.eventEngine.disconnect();
    }
    /**
     * Restore connection to the real-time events stream.
     *
     * @param parameters - Reconnection catch up configuration. **Note:** available only with
     * enabled event engine.
     */
    reconnect(parameters) {
        if (this.subscriptionManager)
            this.subscriptionManager.reconnect();
        else if (this.eventEngine)
            this.eventEngine.reconnect(parameters !== null && parameters !== void 0 ? parameters : {});
    }
    /**
     * Event engine handshake subscribe.
     *
     * @param parameters - Request configuration parameters.
     */
    subscribeHandshake(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new HandshakeSubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule, getFileUrl: this.getFileUrl }));
            const abortUnsubscribe = parameters.abortSignal.subscribe(request.abort);
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
        });
    }
    /**
     * Event engine receive messages subscribe.
     *
     * @param parameters - Request configuration parameters.
     */
    subscribeReceiveMessages(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new ReceiveMessagesSubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule, getFileUrl: this.getFileUrl }));
            const abortUnsubscribe = parameters.abortSignal.subscribe(request.abort);
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
            const request = new GetMessageActionsRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new AddMessageActionRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new RemoveMessageAction(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
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
    fetchMessages(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new FetchMessagesRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule, getFileUrl: this.getFileUrl }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new DeleteMessageRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
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
    messageCounts(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new MessageCountRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new GetHistoryRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new HereNowRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new WhereNowRequest({
                uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId,
                keySet: this._configuration.keySet,
            });
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new GetPresenceStateRequest(Object.assign(Object.assign({}, parameters), { uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId, keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const { keySet, userId: uuid } = this._configuration;
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
                request = new HeartbeatRequest(Object.assign(Object.assign({}, parameters), { keySet, heartbeat }));
            }
            else {
                request = new SetPresenceStateRequest(Object.assign(Object.assign({}, parameters), { keySet, uuid }));
            }
            // Update state used by subscription manager.
            if (this.subscriptionManager)
                this.subscriptionManager.setState(parameters);
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
        (_a = this.subscriptionManager) === null || _a === void 0 ? void 0 : _a.changePresence(parameters);
    }
    // endregion
    // region Heartbeat
    /**
     * Announce user presence
     *
     * @param parameters - Desired presence state for provided list of channels and groups.
     */
    heartbeat(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            // Manual presence management possible only with subscription manager.
            if (!this.subscriptionManager)
                return;
            const request = new HeartbeatRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            return this.sendRequest(request);
        });
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
            const request = new GrantTokenRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Revoke token permission.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous revoke token response or `void` in case if `callback` provided.
     */
    revokeToken(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new RevokeTokenRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
        return this.tokenManager.getToken();
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
        return this.tokenManager.parseToken(token);
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
            const request = new GrantRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new AuditRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            return this.objects._getAllUUIDMetadata(parametersOrCallback, callback);
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
            return this.objects._getUUIDMetadata(parametersOrCallback, callback);
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
            return this.objects._setUUIDMetadata(parameters, callback);
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
            return this.objects._setUUIDMetadata(parameters, callback);
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
            return this.objects._removeUUIDMetadata(parametersOrCallback, callback);
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
            return this.objects._getAllChannelMetadata(parametersOrCallback, callback);
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
            return this.objects._getChannelMetadata(parameters, callback);
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
            return this.objects._setChannelMetadata(parameters, callback);
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
            return this.objects._setChannelMetadata(parameters, callback);
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
            return this.objects._removeChannelMetadata(parameters, callback);
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
            return this.objects.fetchMemberships(parameters, callback);
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
            return this.objects.addMemberships(parameters, callback);
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
            return this.objects.addMemberships(parameters, callback);
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
            var _a;
            if (!this._configuration.PubNubFile)
                throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
            const sendFileRequest = new SendFileRequest(Object.assign(Object.assign({}, parameters), { cipherKey: (_a = parameters.cipherKey) !== null && _a !== void 0 ? _a : this._configuration.cipherKey, keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, fileUploadPublishRetryLimit: this._configuration.fileUploadPublishRetryLimit, file: parameters.file, sendRequest: this.sendRequest, publishFile: this.publishFile, crypto: this._configuration.cryptoModule, cryptography: this.cryptography ? this.cryptography : undefined }));
            const status = {
                error: false,
                operation: RequestOperation.PNPublishFileOperation,
                category: StatusCategory.PNAcknowledgmentCategory,
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
                const errorStatus = error.toStatus(status.operation);
                // Notify callback (if possible).
                if (callback)
                    callback(errorStatus, null);
                throw new PubnubError('REST API request processing error, check status for details', errorStatus);
            });
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
            if (!this._configuration.PubNubFile)
                throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
            const request = new PublishFileMessageRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new FilesListRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
        const request = this.transport.request(new GetFileDownloadUrlRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet })).request());
        const query = (_a = request.queryParameters) !== null && _a !== void 0 ? _a : {};
        const queryString = Object.keys(query)
            .map((key) => {
            const queryValue = query[key];
            if (!Array.isArray(queryValue))
                return `${key}=${encodeString(queryValue)}`;
            return queryValue.map((value) => `${key}=${encodeString(value)}`).join('&');
        })
            .join('&');
        return `${request.origin}${request.path}?${queryString}`;
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
            var _a;
            if (!this._configuration.PubNubFile)
                throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
            const request = new DownloadFileRequest(Object.assign(Object.assign({}, parameters), { cipherKey: (_a = parameters.cipherKey) !== null && _a !== void 0 ? _a : this._configuration.cipherKey, keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, cryptography: this.cryptography ? this.cryptography : undefined, crypto: this._configuration.cryptoModule }));
            if (callback)
                return this.sendRequest(request, callback);
            return (yield this.sendRequest(request));
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
            const request = new DeleteFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
        if (typeof customCipherKey === 'undefined' && this._configuration.cryptoModule) {
            const encrypted = this._configuration.cryptoModule.encrypt(data);
            return typeof encrypted === 'string' ? encrypted : encode(encrypted);
        }
        if (!this.crypto)
            throw new Error('Encryption error: cypher key not set');
        return this.crypto.encrypt(data, customCipherKey);
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
        if (typeof customCipherKey === 'undefined' && this._configuration.cryptoModule) {
            const decrypted = this._configuration.cryptoModule.decrypt(data);
            return decrypted instanceof ArrayBuffer ? JSON.parse(new TextDecoder().decode(decrypted)) : decrypted;
        }
        if (!this.crypto)
            throw new Error('Decryption error: cypher key not set');
        return this.crypto.decrypt(data, customCipherKey);
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
            if (typeof keyOrFile !== 'string' && !this._configuration.cryptoModule)
                throw new Error('File encryption error. Crypto module not configured.');
            if (typeof keyOrFile === 'string') {
                if (!this.cryptography)
                    throw new Error('File encryption error. File encryption not available');
                return this.cryptography.encryptFile(keyOrFile, file, this._configuration.PubNubFile);
            }
            return (_a = this._configuration.cryptoModule) === null || _a === void 0 ? void 0 : _a.encryptFile(file, this._configuration.PubNubFile);
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
            if (typeof keyOrFile === 'string' && !this._configuration.cryptoModule)
                throw new Error('File decryption error. Crypto module not configured.');
            if (typeof keyOrFile === 'string') {
                if (!this.cryptography)
                    throw new Error('File decryption error. File decryption not available');
                return this.cryptography.decryptFile(keyOrFile, file, this._configuration.PubNubFile);
            }
            return (_a = this._configuration.cryptoModule) === null || _a === void 0 ? void 0 : _a.decryptFile(file, this._configuration.PubNubFile);
        });
    }
}
// --------------------------------------------------------
// ----------------------- Static -------------------------
// --------------------------------------------------------
// region Static
/**
 * Type of REST API endpoint which reported status.
 */
PubNubCore.OPERATIONS = RequestOperation;
/**
 * API call status category.
 */
PubNubCore.CATEGORIES = StatusCategory;
/**
 * Exponential retry policy constructor.
 */
PubNubCore.ExponentialRetryPolicy = RetryPolicy.ExponentialRetryPolicy;
/**
 * Linear retry policy constructor.
 */
PubNubCore.LinearRetryPolicy = RetryPolicy.LinearRetryPolicy;
