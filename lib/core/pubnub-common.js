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
const listener_manager_1 = require("./components/listener_manager");
const subscription_manager_1 = require("./components/subscription-manager");
const push_payload_1 = __importDefault(require("./components/push_payload"));
const eventEmitter_1 = __importDefault(require("./components/eventEmitter"));
const base64_codec_1 = require("./components/base64_codec");
const uuid_1 = __importDefault(require("./components/uuid"));
const operations_1 = __importDefault(require("./constants/operations"));
const categories_1 = __importDefault(require("./constants/categories"));
const pubnub_error_1 = require("../errors/pubnub-error");
const pubnub_api_error_1 = require("../errors/pubnub-api-error");
const presence_1 = require("../event-engine/presence/presence");
const retryPolicy_1 = require("../event-engine/core/retryPolicy");
const event_engine_1 = require("../event-engine");
const Publish = __importStar(require("./endpoints/publish"));
const Signal = __importStar(require("./endpoints/signal"));
const subscribe_1 = require("./endpoints/subscribe");
const receiveMessages_1 = require("./endpoints/subscriptionUtils/receiveMessages");
const handshake_1 = require("./endpoints/subscriptionUtils/handshake");
const get_state_1 = require("./endpoints/presence/get_state");
const set_state_1 = require("./endpoints/presence/set_state");
const heartbeat_1 = require("./endpoints/presence/heartbeat");
const leave_1 = require("./endpoints/presence/leave");
const where_now_1 = require("./endpoints/presence/where_now");
const here_now_1 = require("./endpoints/presence/here_now");
const delete_messages_1 = require("./endpoints/history/delete_messages");
const message_counts_1 = require("./endpoints/history/message_counts");
const get_history_1 = require("./endpoints/history/get_history");
const fetch_messages_1 = require("./endpoints/fetch_messages");
const get_message_actions_1 = require("./endpoints/actions/get_message_actions");
const add_message_action_1 = require("./endpoints/actions/add_message_action");
const remove_message_action_1 = require("./endpoints/actions/remove_message_action");
const publish_file_1 = require("./endpoints/file_upload/publish_file");
const get_file_url_1 = require("./endpoints/file_upload/get_file_url");
const delete_file_1 = require("./endpoints/file_upload/delete_file");
const list_files_1 = require("./endpoints/file_upload/list_files");
const send_file_1 = require("./endpoints/file_upload/send_file");
const revoke_token_1 = require("./endpoints/access_manager/revoke_token");
const grant_token_1 = require("./endpoints/access_manager/grant_token");
const grant_1 = require("./endpoints/access_manager/grant");
const audit_1 = require("./endpoints/access_manager/audit");
const ChannelMetadata_1 = require("../entities/ChannelMetadata");
const SubscriptionSet_1 = require("../entities/SubscriptionSet");
const ChannelGroup_1 = require("../entities/ChannelGroup");
const UserMetadata_1 = require("../entities/UserMetadata");
const Channel_1 = require("../entities/Channel");
const pubnub_channel_groups_1 = __importDefault(require("./pubnub-channel-groups"));
const pubnub_push_1 = __importDefault(require("./pubnub-push"));
const pubnub_objects_1 = __importDefault(require("./pubnub-objects"));
const Time = __importStar(require("./endpoints/time"));
const utils_1 = require("./utils");
const download_file_1 = require("./endpoints/file_upload/download_file");
class PubNubCore {
    static notificationPayload(title, body) {
        return new push_payload_1.default(title, body);
    }
    static generateUUID() {
        return uuid_1.default.createUUID();
    }
    constructor(configuration) {
        this._configuration = configuration.configuration;
        this.cryptography = configuration.cryptography;
        this.tokenManager = configuration.tokenManager;
        this.transport = configuration.transport;
        this.crypto = configuration.crypto;
        this._objects = new pubnub_objects_1.default(this._configuration, this.sendRequest.bind(this));
        this._channelGroups = new pubnub_channel_groups_1.default(this._configuration.keySet, this.sendRequest.bind(this));
        this._push = new pubnub_push_1.default(this._configuration.keySet, this.sendRequest.bind(this));
        this.listenerManager = new listener_manager_1.ListenerManager();
        this.eventEmitter = new eventEmitter_1.default(this.listenerManager);
        if (this._configuration.enableEventEngine) {
            let heartbeatInterval = this._configuration.getHeartbeatInterval();
            this.presenceState = {};
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
        else {
            this.subscriptionManager = new subscription_manager_1.SubscriptionManager(this._configuration, this.listenerManager, this.eventEmitter, this.makeSubscribe.bind(this), this.heartbeat.bind(this), this.makeUnsubscribe.bind(this), this.time.bind(this));
        }
    }
    get configuration() {
        return this._configuration;
    }
    get _config() {
        return this.configuration;
    }
    get authKey() {
        var _a;
        return (_a = this._configuration.authKey) !== null && _a !== void 0 ? _a : undefined;
    }
    getAuthKey() {
        return this.authKey;
    }
    setAuthKey(authKey) {
        this._configuration.setAuthKey(authKey);
    }
    get userId() {
        return this._configuration.userId;
    }
    set userId(value) {
        if (!value || typeof value !== 'string' || value.trim().length === 0)
            throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
        this._configuration.userId = value;
    }
    getUserId() {
        return this._configuration.userId;
    }
    setUserId(value) {
        if (!value || typeof value !== 'string' || value.trim().length === 0)
            throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
        this._configuration.userId = value;
    }
    get filterExpression() {
        var _a;
        return (_a = this._configuration.getFilterExpression()) !== null && _a !== void 0 ? _a : undefined;
    }
    getFilterExpression() {
        return this.filterExpression;
    }
    set filterExpression(expression) {
        this._configuration.setFilterExpression(expression);
    }
    setFilterExpression(expression) {
        this.filterExpression = expression;
    }
    get cipherKey() {
        return this._configuration.getCipherKey();
    }
    set cipherKey(key) {
        this._configuration.setCipherKey(key);
    }
    setCipherKey(key) {
        this.cipherKey = key;
    }
    set heartbeatInterval(interval) {
        this._configuration.setHeartbeatInterval(interval);
    }
    setHeartbeatInterval(interval) {
        this.heartbeatInterval = interval;
    }
    getVersion() {
        return this._configuration.getVersion();
    }
    _addPnsdkSuffix(name, suffix) {
        this._configuration._addPnsdkSuffix(name, suffix);
    }
    getUUID() {
        return this.userId;
    }
    setUUID(value) {
        this.userId = value;
    }
    get customEncrypt() {
        return this._configuration.getCustomEncrypt();
    }
    get customDecrypt() {
        return this._configuration.getCustomDecrypt();
    }
    channel(name) {
        return new Channel_1.Channel(name, this.eventEmitter, this);
    }
    channelGroup(name) {
        return new ChannelGroup_1.ChannelGroup(name, this.eventEmitter, this);
    }
    channelMetadata(id) {
        return new ChannelMetadata_1.ChannelMetadata(id, this.eventEmitter, this);
    }
    userMetadata(id) {
        return new UserMetadata_1.UserMetadata(id, this.eventEmitter, this);
    }
    subscriptionSet(parameters) {
        return new SubscriptionSet_1.SubscriptionSet(Object.assign(Object.assign({}, parameters), { eventEmitter: this.eventEmitter, pubnub: this }));
    }
    sendRequest(request, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationResult = request.validate();
            if (validationResult) {
                if (callback)
                    return callback((0, pubnub_error_1.createValidationError)(validationResult), null);
                throw new pubnub_error_1.PubNubError('Validation failed, check status for details', (0, pubnub_error_1.createValidationError)(validationResult));
            }
            const transportRequest = request.request();
            if (transportRequest.formData && transportRequest.formData.length > 0) {
                transportRequest.timeout = 300;
            }
            else {
                if (request.operation() === operations_1.default.PNSubscribeOperation)
                    transportRequest.timeout = this._configuration.getSubscribeTimeout();
                else
                    transportRequest.timeout = this._configuration.getTransactionTimeout();
            }
            const status = {
                error: false,
                operation: request.operation(),
                category: categories_1.default.PNAcknowledgmentCategory,
                statusCode: 0,
            };
            const [sendableRequest, cancellationController] = this.transport.makeSendable(transportRequest);
            request.cancellationController = cancellationController ? cancellationController : null;
            return sendableRequest
                .then((response) => {
                status.statusCode = response.status;
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
                if (callback)
                    return callback(status, parsed);
                return parsed;
            })
                .catch((error) => {
                const apiError = !(error instanceof pubnub_api_error_1.PubNubAPIError) ? pubnub_api_error_1.PubNubAPIError.create(error) : error;
                if (callback)
                    return callback(apiError.toStatus(request.operation()), null);
                throw apiError.toPubNubError(request.operation(), 'REST API request processing error, check status for details');
            });
        });
    }
    destroy(isOffline) {
        if (this.subscriptionManager) {
            this.subscriptionManager.unsubscribeAll(isOffline);
            this.subscriptionManager.disconnect();
        }
        else if (this.eventEngine)
            this.eventEngine.dispose();
    }
    stop() {
        this.destroy();
    }
    addListener(listener) {
        this.listenerManager.addListener(listener);
    }
    removeListener(listener) {
        this.listenerManager.removeListener(listener);
    }
    removeAllListeners() {
        this.listenerManager.removeAllListeners();
    }
    publish(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new Publish.PublishRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    signal(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new Signal.SignalRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    fire(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            callback !== null && callback !== void 0 ? callback : (callback = () => { });
            return this.publish(Object.assign(Object.assign({}, parameters), { replicate: false, storeInHistory: false }), callback);
        });
    }
    getSubscribedChannels() {
        if (this.subscriptionManager)
            return this.subscriptionManager.subscribedChannels;
        else if (this.eventEngine)
            return this.eventEngine.getSubscribedChannels();
        return [];
    }
    getSubscribedChannelGroups() {
        if (this.subscriptionManager)
            return this.subscriptionManager.subscribedChannelGroups;
        else if (this.eventEngine)
            return this.eventEngine.getSubscribedChannelGroups();
        return [];
    }
    subscribe(parameters) {
        if (this.subscriptionManager)
            this.subscriptionManager.subscribe(parameters);
        else if (this.eventEngine)
            this.eventEngine.subscribe(parameters);
    }
    makeSubscribe(parameters, callback) {
        const request = new subscribe_1.SubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
        this.sendRequest(request, (status, result) => {
            var _a;
            if (this.subscriptionManager && ((_a = this.subscriptionManager.abort) === null || _a === void 0 ? void 0 : _a.identifier) === request.requestIdentifier)
                this.subscriptionManager.abort = null;
            callback(status, result);
        });
        if (this.subscriptionManager) {
            const callableAbort = () => request.abort();
            callableAbort.identifier = request.requestIdentifier;
            this.subscriptionManager.abort = callableAbort;
        }
    }
    unsubscribe(parameters) {
        if (this.subscriptionManager)
            this.subscriptionManager.unsubscribe(parameters);
        else if (this.eventEngine)
            this.eventEngine.unsubscribe(parameters);
    }
    makeUnsubscribe(parameters, callback) {
        this.sendRequest(new leave_1.PresenceLeaveRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet })), callback);
    }
    unsubscribeAll() {
        if (this.subscriptionManager)
            this.subscriptionManager.unsubscribeAll();
        else if (this.eventEngine)
            this.eventEngine.unsubscribeAll();
    }
    disconnect() {
        if (this.subscriptionManager)
            this.subscriptionManager.disconnect();
        else if (this.eventEngine)
            this.eventEngine.disconnect();
    }
    reconnect(parameters) {
        if (this.subscriptionManager)
            this.subscriptionManager.reconnect();
        else if (this.eventEngine)
            this.eventEngine.reconnect(parameters !== null && parameters !== void 0 ? parameters : {});
    }
    subscribeHandshake(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new handshake_1.HandshakeSubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
            const abortUnsubscribe = parameters.abortSignal.subscribe((err) => {
                request.abort();
            });
            const handshakeResponse = this.sendRequest(request);
            return handshakeResponse.then((response) => {
                abortUnsubscribe();
                return response.cursor;
            });
        });
    }
    subscribeReceiveMessages(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new receiveMessages_1.ReceiveMessagesSubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
            const abortUnsubscribe = parameters.abortSignal.subscribe((err) => {
                request.abort();
            });
            const handshakeResponse = this.sendRequest(request);
            return handshakeResponse.then((response) => {
                abortUnsubscribe();
                return response;
            });
        });
    }
    getMessageActions(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new get_message_actions_1.GetMessageActionsRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    addMessageAction(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new add_message_action_1.AddMessageActionRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    removeMessageAction(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new remove_message_action_1.RemoveMessageAction(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    fetchMessages(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new fetch_messages_1.FetchMessagesRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    deleteMessages(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new delete_messages_1.DeleteMessageRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    messageCounts(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new message_counts_1.MessageCountRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    history(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new get_history_1.GetHistoryRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    hereNow(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new here_now_1.HereNowRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    whereNow(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const request = new where_now_1.WhereNowRequest({
                uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId,
                keySet: this._configuration.keySet,
            });
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    getState(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const request = new get_state_1.GetPresenceStateRequest(Object.assign(Object.assign({}, parameters), { uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId, keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    setState(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { keySet, userId: userId } = this._configuration;
            const heartbeat = this._configuration.getPresenceTimeout();
            let request;
            if (this._configuration.enableEventEngine && this.presenceState) {
                const presenceState = this.presenceState;
                (_a = parameters.channels) === null || _a === void 0 ? void 0 : _a.forEach((channel) => (presenceState[channel] = parameters.state));
                if ('channelGroups' in parameters) {
                    (_b = parameters.channelGroups) === null || _b === void 0 ? void 0 : _b.forEach((group) => (presenceState[group] = parameters.state));
                }
            }
            if ('withHeartbeat' in parameters) {
                request = new heartbeat_1.HeartbeatRequest(Object.assign(Object.assign({}, parameters), { keySet, heartbeat }));
            }
            else {
                request = new set_state_1.SetPresenceStateRequest(Object.assign(Object.assign({}, parameters), { keySet, uuid: userId }));
            }
            if (this.subscriptionManager)
                this.subscriptionManager.setState(parameters);
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    presence(parameters) {
        var _a;
        (_a = this.subscriptionManager) === null || _a === void 0 ? void 0 : _a.changePresence(parameters);
    }
    heartbeat(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new heartbeat_1.HeartbeatRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    join(parameters) {
        var _a;
        (_a = this.presenceEventEngine) === null || _a === void 0 ? void 0 : _a.join(parameters);
    }
    leave(parameters) {
        var _a;
        (_a = this.presenceEventEngine) === null || _a === void 0 ? void 0 : _a.leave(parameters);
    }
    leaveAll() {
        var _a;
        (_a = this.presenceEventEngine) === null || _a === void 0 ? void 0 : _a.leaveAll();
    }
    grantToken(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new grant_token_1.GrantTokenRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    revokeToken(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new revoke_token_1.RevokeTokenRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    get token() {
        return this.tokenManager.getToken();
    }
    getToken() {
        return this.token;
    }
    set token(token) {
        this.tokenManager.setToken(token);
    }
    setToken(token) {
        this.token = token;
    }
    parseToken(token) {
        return this.tokenManager.parseToken(token);
    }
    grant(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new grant_1.GrantRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    audit(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new audit_1.AuditRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    get objects() {
        return this._objects;
    }
    fetchUsers(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects._getAllUUIDMetadata(parametersOrCallback, callback);
        });
    }
    fetchUser(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects._getUUIDMetadata(parametersOrCallback, callback);
        });
    }
    createUser(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects._setUUIDMetadata(parameters, callback);
        });
    }
    updateUser(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects._setUUIDMetadata(parameters, callback);
        });
    }
    removeUser(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects._removeUUIDMetadata(parametersOrCallback, callback);
        });
    }
    fetchSpaces(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects._getAllChannelMetadata(parametersOrCallback, callback);
        });
    }
    fetchSpace(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects._getChannelMetadata(parameters, callback);
        });
    }
    createSpace(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects._setChannelMetadata(parameters, callback);
        });
    }
    updateSpace(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects._setChannelMetadata(parameters, callback);
        });
    }
    removeSpace(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects._removeChannelMetadata(parameters, callback);
        });
    }
    fetchMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects.fetchMemberships(parameters, callback);
        });
    }
    addMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects.addMemberships(parameters, callback);
        });
    }
    updateMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.objects.addMemberships(parameters, callback);
        });
    }
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
    get channelGroups() {
        return this._channelGroups;
    }
    get push() {
        return this._push;
    }
    sendFile(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
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
                if (callback && errorStatus)
                    callback(errorStatus, null);
                throw new pubnub_error_1.PubNubError('REST API request processing error, check status for details', errorStatus);
            });
        });
    }
    publishFile(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._configuration.PubNubFile)
                throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
            const request = new publish_file_1.PublishFileMessageRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    listFiles(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new list_files_1.FilesListRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    getFileUrl(parameters) {
        var _a;
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
    downloadFile(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._configuration.PubNubFile)
                throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
            const request = new download_file_1.DownloadFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, cryptography: this.cryptography ? this.cryptography : undefined, crypto: this._configuration.getCryptoModule() }));
            if (callback)
                return this.sendRequest(request, callback);
            return (yield this.sendRequest(request));
        });
    }
    deleteFile(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new delete_file_1.DeleteFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    time(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new Time.TimeRequest();
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    encrypt(data, customCipherKey) {
        const cryptoModule = this._configuration.getCryptoModule();
        if (!customCipherKey && cryptoModule && typeof data === 'string') {
            const encrypted = cryptoModule.encrypt(data);
            return typeof encrypted === 'string' ? encrypted : (0, base64_codec_1.encode)(encrypted);
        }
        if (!this.crypto)
            throw new Error('Encryption error: cypher key not set');
        return this.crypto.encrypt(data, customCipherKey);
    }
    decrypt(data, customCipherKey) {
        const cryptoModule = this._configuration.getCryptoModule();
        if (!customCipherKey && cryptoModule) {
            const decrypted = cryptoModule.decrypt(data);
            return decrypted instanceof ArrayBuffer ? JSON.parse(new TextDecoder().decode(decrypted)) : decrypted;
        }
        if (!this.crypto)
            throw new Error('Decryption error: cypher key not set');
        return this.crypto.decrypt(data, customCipherKey);
    }
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
                return this.cryptography.encryptFile(keyOrFile, file, this._configuration.PubNubFile);
            }
            return (_a = this._configuration.getCryptoModule()) === null || _a === void 0 ? void 0 : _a.encryptFile(file, this._configuration.PubNubFile);
        });
    }
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
                return this.cryptography.decryptFile(keyOrFile, file, this._configuration.PubNubFile);
            }
            return (_a = this._configuration.getCryptoModule()) === null || _a === void 0 ? void 0 : _a.decryptFile(file, this._configuration.PubNubFile);
        });
    }
}
exports.PubNubCore = PubNubCore;
PubNubCore.decoder = new TextDecoder();
PubNubCore.OPERATIONS = operations_1.default;
PubNubCore.CATEGORIES = categories_1.default;
PubNubCore.ExponentialRetryPolicy = retryPolicy_1.RetryPolicy.ExponentialRetryPolicy;
PubNubCore.LinearRetryPolicy = retryPolicy_1.RetryPolicy.LinearRetryPolicy;
