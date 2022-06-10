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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var reconnection_manager_1 = __importDefault(require("./reconnection_manager"));
var deduping_manager_1 = __importDefault(require("./deduping_manager"));
var utils_1 = __importDefault(require("../utils"));
var categories_1 = __importDefault(require("../constants/categories"));
var default_1 = /** @class */ (function () {
    function default_1(_a) {
        var subscribeEndpoint = _a.subscribeEndpoint, leaveEndpoint = _a.leaveEndpoint, heartbeatEndpoint = _a.heartbeatEndpoint, setStateEndpoint = _a.setStateEndpoint, timeEndpoint = _a.timeEndpoint, getFileUrl = _a.getFileUrl, config = _a.config, crypto = _a.crypto, listenerManager = _a.listenerManager;
        this._listenerManager = listenerManager;
        this._config = config;
        this._leaveEndpoint = leaveEndpoint;
        this._heartbeatEndpoint = heartbeatEndpoint;
        this._setStateEndpoint = setStateEndpoint;
        this._subscribeEndpoint = subscribeEndpoint;
        this._getFileUrl = getFileUrl;
        this._crypto = crypto;
        this._channels = {};
        this._presenceChannels = {};
        this._heartbeatChannels = {};
        this._heartbeatChannelGroups = {};
        this._channelGroups = {};
        this._presenceChannelGroups = {};
        this._pendingChannelSubscriptions = [];
        this._pendingChannelGroupSubscriptions = [];
        this._currentTimetoken = 0;
        this._lastTimetoken = 0;
        this._storedTimetoken = null;
        this._subscriptionStatusAnnounced = false;
        this._isOnline = true;
        this._reconnectionManager = new reconnection_manager_1.default({ timeEndpoint: timeEndpoint });
        this._dedupingManager = new deduping_manager_1.default({ config: config });
    }
    default_1.prototype.adaptStateChange = function (args, callback) {
        var _this = this;
        var state = args.state, _a = args.channels, channels = _a === void 0 ? [] : _a, _b = args.channelGroups, channelGroups = _b === void 0 ? [] : _b;
        channels.forEach(function (channel) {
            if (channel in _this._channels)
                _this._channels[channel].state = state;
        });
        channelGroups.forEach(function (channelGroup) {
            if (channelGroup in _this._channelGroups) {
                _this._channelGroups[channelGroup].state = state;
            }
        });
        return this._setStateEndpoint({ state: state, channels: channels, channelGroups: channelGroups }, callback);
    };
    default_1.prototype.adaptPresenceChange = function (args) {
        var _this = this;
        var connected = args.connected, _a = args.channels, channels = _a === void 0 ? [] : _a, _b = args.channelGroups, channelGroups = _b === void 0 ? [] : _b;
        if (connected) {
            channels.forEach(function (channel) {
                _this._heartbeatChannels[channel] = { state: {} };
            });
            channelGroups.forEach(function (channelGroup) {
                _this._heartbeatChannelGroups[channelGroup] = { state: {} };
            });
        }
        else {
            channels.forEach(function (channel) {
                if (channel in _this._heartbeatChannels) {
                    delete _this._heartbeatChannels[channel];
                }
            });
            channelGroups.forEach(function (channelGroup) {
                if (channelGroup in _this._heartbeatChannelGroups) {
                    delete _this._heartbeatChannelGroups[channelGroup];
                }
            });
            if (this._config.suppressLeaveEvents === false) {
                this._leaveEndpoint({ channels: channels, channelGroups: channelGroups }, function (status) {
                    _this._listenerManager.announceStatus(status);
                });
            }
        }
        this.reconnect();
    };
    default_1.prototype.adaptSubscribeChange = function (args) {
        var _this = this;
        var timetoken = args.timetoken, _a = args.channels, channels = _a === void 0 ? [] : _a, _b = args.channelGroups, channelGroups = _b === void 0 ? [] : _b, _c = args.withPresence, withPresence = _c === void 0 ? false : _c, _d = args.withHeartbeats, withHeartbeats = _d === void 0 ? false : _d;
        if (!this._config.subscribeKey || this._config.subscribeKey === '') {
            // eslint-disable-next-line
            if (console && console.log) {
                console.log('subscribe key missing; aborting subscribe'); //eslint-disable-line
            }
            return;
        }
        if (timetoken) {
            this._lastTimetoken = this._currentTimetoken;
            this._currentTimetoken = timetoken;
        }
        // reset the current timetoken to get a connect event.
        // $FlowFixMe
        if (this._currentTimetoken !== '0' && this._currentTimetoken !== 0) {
            this._storedTimetoken = this._currentTimetoken;
            this._currentTimetoken = 0;
        }
        channels.forEach(function (channel) {
            _this._channels[channel] = { state: {} };
            if (withPresence)
                _this._presenceChannels[channel] = {};
            if (withHeartbeats || _this._config.getHeartbeatInterval())
                _this._heartbeatChannels[channel] = {};
            _this._pendingChannelSubscriptions.push(channel);
        });
        channelGroups.forEach(function (channelGroup) {
            _this._channelGroups[channelGroup] = { state: {} };
            if (withPresence)
                _this._presenceChannelGroups[channelGroup] = {};
            if (withHeartbeats || _this._config.getHeartbeatInterval())
                _this._heartbeatChannelGroups[channelGroup] = {};
            _this._pendingChannelGroupSubscriptions.push(channelGroup);
        });
        this._subscriptionStatusAnnounced = false;
        this.reconnect();
    };
    default_1.prototype.adaptUnsubscribeChange = function (args, isOffline) {
        var _this = this;
        var _a = args.channels, channels = _a === void 0 ? [] : _a, _b = args.channelGroups, channelGroups = _b === void 0 ? [] : _b;
        // keep track of which channels and channel groups
        // we are going to unsubscribe from.
        var actualChannels = [];
        var actualChannelGroups = [];
        //
        channels.forEach(function (channel) {
            if (channel in _this._channels) {
                delete _this._channels[channel];
                actualChannels.push(channel);
                if (channel in _this._heartbeatChannels) {
                    delete _this._heartbeatChannels[channel];
                }
            }
            if (channel in _this._presenceChannels) {
                delete _this._presenceChannels[channel];
                actualChannels.push(channel);
            }
        });
        channelGroups.forEach(function (channelGroup) {
            if (channelGroup in _this._channelGroups) {
                delete _this._channelGroups[channelGroup];
                actualChannelGroups.push(channelGroup);
                if (channelGroup in _this._heartbeatChannelGroups) {
                    delete _this._heartbeatChannelGroups[channelGroup];
                }
            }
            if (channelGroup in _this._presenceChannelGroups) {
                delete _this._presenceChannelGroups[channelGroup];
                actualChannelGroups.push(channelGroup);
            }
        });
        // no-op if there are no channels and cg's to unsubscribe from.
        if (actualChannels.length === 0 && actualChannelGroups.length === 0) {
            return;
        }
        if (this._config.suppressLeaveEvents === false && !isOffline) {
            this._leaveEndpoint({ channels: actualChannels, channelGroups: actualChannelGroups }, function (status) {
                status.affectedChannels = actualChannels;
                status.affectedChannelGroups = actualChannelGroups;
                status.currentTimetoken = _this._currentTimetoken;
                status.lastTimetoken = _this._lastTimetoken;
                _this._listenerManager.announceStatus(status);
            });
        }
        // if we have nothing to subscribe to, reset the timetoken.
        if (Object.keys(this._channels).length === 0 &&
            Object.keys(this._presenceChannels).length === 0 &&
            Object.keys(this._channelGroups).length === 0 &&
            Object.keys(this._presenceChannelGroups).length === 0) {
            this._lastTimetoken = 0;
            this._currentTimetoken = 0;
            this._storedTimetoken = null;
            this._region = null;
            this._reconnectionManager.stopPolling();
        }
        this.reconnect();
    };
    default_1.prototype.unsubscribeAll = function (isOffline) {
        this.adaptUnsubscribeChange({
            channels: this.getSubscribedChannels(),
            channelGroups: this.getSubscribedChannelGroups(),
        }, isOffline);
    };
    default_1.prototype.getHeartbeatChannels = function () {
        return Object.keys(this._heartbeatChannels);
    };
    default_1.prototype.getHeartbeatChannelGroups = function () {
        return Object.keys(this._heartbeatChannelGroups);
    };
    default_1.prototype.getSubscribedChannels = function () {
        return Object.keys(this._channels);
    };
    default_1.prototype.getSubscribedChannelGroups = function () {
        return Object.keys(this._channelGroups);
    };
    default_1.prototype.reconnect = function () {
        this._startSubscribeLoop();
        this._registerHeartbeatTimer();
    };
    default_1.prototype.disconnect = function () {
        this._stopSubscribeLoop();
        this._stopHeartbeatTimer();
        this._reconnectionManager.stopPolling();
    };
    default_1.prototype._registerHeartbeatTimer = function () {
        this._stopHeartbeatTimer();
        // if the interval is 0 or undefined, do not queue up heartbeating
        if (this._config.getHeartbeatInterval() === 0 || this._config.getHeartbeatInterval() === undefined) {
            return;
        }
        this._performHeartbeatLoop();
        // $FlowFixMe
        this._heartbeatTimer = setInterval(this._performHeartbeatLoop.bind(this), this._config.getHeartbeatInterval() * 1000);
    };
    default_1.prototype._stopHeartbeatTimer = function () {
        if (this._heartbeatTimer) {
            // $FlowFixMe
            clearInterval(this._heartbeatTimer);
            this._heartbeatTimer = null;
        }
    };
    default_1.prototype._performHeartbeatLoop = function () {
        var _this = this;
        var heartbeatChannels = this.getHeartbeatChannels();
        var heartbeatChannelGroups = this.getHeartbeatChannelGroups();
        var presenceState = {};
        if (heartbeatChannels.length === 0 && heartbeatChannelGroups.length === 0) {
            return;
        }
        this.getSubscribedChannels().forEach(function (channel) {
            var channelState = _this._channels[channel].state;
            if (Object.keys(channelState).length) {
                presenceState[channel] = channelState;
            }
        });
        this.getSubscribedChannelGroups().forEach(function (channelGroup) {
            var channelGroupState = _this._channelGroups[channelGroup].state;
            if (Object.keys(channelGroupState).length) {
                presenceState[channelGroup] = channelGroupState;
            }
        });
        var onHeartbeat = function (status) {
            if (status.error && _this._config.announceFailedHeartbeats) {
                _this._listenerManager.announceStatus(status);
            }
            if (status.error && _this._config.autoNetworkDetection && _this._isOnline) {
                _this._isOnline = false;
                _this.disconnect();
                _this._listenerManager.announceNetworkDown();
                _this.reconnect();
            }
            if (!status.error && _this._config.announceSuccessfulHeartbeats) {
                _this._listenerManager.announceStatus(status);
            }
        };
        this._heartbeatEndpoint({
            channels: heartbeatChannels,
            channelGroups: heartbeatChannelGroups,
            state: presenceState,
        }, onHeartbeat.bind(this));
    };
    default_1.prototype._startSubscribeLoop = function () {
        var _this = this;
        this._stopSubscribeLoop();
        var presenceState = {};
        var channels = [];
        var channelGroups = [];
        Object.keys(this._channels).forEach(function (channel) {
            var channelState = _this._channels[channel].state;
            if (Object.keys(channelState).length) {
                presenceState[channel] = channelState;
            }
            channels.push(channel);
        });
        Object.keys(this._presenceChannels).forEach(function (channel) {
            channels.push("".concat(channel, "-pnpres"));
        });
        Object.keys(this._channelGroups).forEach(function (channelGroup) {
            var channelGroupState = _this._channelGroups[channelGroup].state;
            if (Object.keys(channelGroupState).length) {
                presenceState[channelGroup] = channelGroupState;
            }
            channelGroups.push(channelGroup);
        });
        Object.keys(this._presenceChannelGroups).forEach(function (channelGroup) {
            channelGroups.push("".concat(channelGroup, "-pnpres"));
        });
        if (channels.length === 0 && channelGroups.length === 0) {
            return;
        }
        var subscribeArgs = {
            channels: channels,
            channelGroups: channelGroups,
            state: presenceState,
            timetoken: this._currentTimetoken,
            filterExpression: this._config.filterExpression,
            region: this._region,
        };
        this._subscribeCall = this._subscribeEndpoint(subscribeArgs, this._processSubscribeResponse.bind(this));
    };
    default_1.prototype._processSubscribeResponse = function (status, payload) {
        var _this = this;
        if (status.error) {
            // if error comes from request abort, ignore
            if (status.errorData && status.errorData.message === 'Aborted') {
                return;
            }
            // if we timeout from server, restart the loop.
            if (status.category === categories_1.default.PNTimeoutCategory) {
                this._startSubscribeLoop();
            }
            else if (status.category === categories_1.default.PNNetworkIssuesCategory) {
                // we lost internet connection, alert the reconnection manager and terminate all loops
                this.disconnect();
                if (status.error && this._config.autoNetworkDetection && this._isOnline) {
                    this._isOnline = false;
                    this._listenerManager.announceNetworkDown();
                }
                this._reconnectionManager.onReconnection(function () {
                    if (_this._config.autoNetworkDetection && !_this._isOnline) {
                        _this._isOnline = true;
                        _this._listenerManager.announceNetworkUp();
                    }
                    _this.reconnect();
                    _this._subscriptionStatusAnnounced = true;
                    var reconnectedAnnounce = {
                        category: categories_1.default.PNReconnectedCategory,
                        operation: status.operation,
                        lastTimetoken: _this._lastTimetoken,
                        currentTimetoken: _this._currentTimetoken,
                    };
                    _this._listenerManager.announceStatus(reconnectedAnnounce);
                });
                this._reconnectionManager.startPolling();
                this._listenerManager.announceStatus(status);
            }
            else if (status.category === categories_1.default.PNBadRequestCategory) {
                this._stopHeartbeatTimer();
                this._listenerManager.announceStatus(status);
            }
            else {
                this._listenerManager.announceStatus(status);
            }
            return;
        }
        if (this._storedTimetoken) {
            this._currentTimetoken = this._storedTimetoken;
            this._storedTimetoken = null;
        }
        else {
            this._lastTimetoken = this._currentTimetoken;
            this._currentTimetoken = payload.metadata.timetoken;
        }
        if (!this._subscriptionStatusAnnounced) {
            var connectedAnnounce = {};
            connectedAnnounce.category = categories_1.default.PNConnectedCategory;
            connectedAnnounce.operation = status.operation;
            connectedAnnounce.affectedChannels = this._pendingChannelSubscriptions;
            connectedAnnounce.subscribedChannels = this.getSubscribedChannels();
            connectedAnnounce.affectedChannelGroups = this._pendingChannelGroupSubscriptions;
            connectedAnnounce.lastTimetoken = this._lastTimetoken;
            connectedAnnounce.currentTimetoken = this._currentTimetoken;
            this._subscriptionStatusAnnounced = true;
            this._listenerManager.announceStatus(connectedAnnounce);
            // clear the pending connections list
            this._pendingChannelSubscriptions = [];
            this._pendingChannelGroupSubscriptions = [];
        }
        var messages = payload.messages || [];
        var _a = this._config, requestMessageCountThreshold = _a.requestMessageCountThreshold, dedupeOnSubscribe = _a.dedupeOnSubscribe;
        if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
            var countAnnouncement = {};
            countAnnouncement.category = categories_1.default.PNRequestMessageCountExceededCategory;
            countAnnouncement.operation = status.operation;
            this._listenerManager.announceStatus(countAnnouncement);
        }
        messages.forEach(function (message) {
            var channel = message.channel;
            var subscriptionMatch = message.subscriptionMatch;
            var publishMetaData = message.publishMetaData;
            if (channel === subscriptionMatch) {
                subscriptionMatch = null;
            }
            if (dedupeOnSubscribe) {
                if (_this._dedupingManager.isDuplicate(message)) {
                    return;
                }
                _this._dedupingManager.addEntry(message);
            }
            if (utils_1.default.endsWith(message.channel, '-pnpres')) {
                var announce = {};
                announce.channel = null;
                announce.subscription = null;
                // deprecated -->
                announce.actualChannel = subscriptionMatch != null ? channel : null;
                announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
                // <-- deprecated
                if (channel) {
                    announce.channel = channel.substring(0, channel.lastIndexOf('-pnpres'));
                }
                if (subscriptionMatch) {
                    announce.subscription = subscriptionMatch.substring(0, subscriptionMatch.lastIndexOf('-pnpres'));
                }
                announce.action = message.payload.action;
                announce.state = message.payload.data;
                announce.timetoken = publishMetaData.publishTimetoken;
                announce.occupancy = message.payload.occupancy;
                announce.uuid = message.payload.uuid;
                announce.timestamp = message.payload.timestamp;
                if (message.payload.join) {
                    announce.join = message.payload.join;
                }
                if (message.payload.leave) {
                    announce.leave = message.payload.leave;
                }
                if (message.payload.timeout) {
                    announce.timeout = message.payload.timeout;
                }
                _this._listenerManager.announcePresence(announce);
            }
            else if (message.messageType === 1) {
                // this is a signal message
                var announce = {};
                announce.channel = null;
                announce.subscription = null;
                announce.channel = channel;
                announce.subscription = subscriptionMatch;
                announce.timetoken = publishMetaData.publishTimetoken;
                announce.publisher = message.issuingClientId;
                if (message.userMetadata) {
                    announce.userMetadata = message.userMetadata;
                }
                announce.message = message.payload;
                _this._listenerManager.announceSignal(announce);
            }
            else if (message.messageType === 2) {
                // this is an object message
                var announce = {};
                announce.channel = null;
                announce.subscription = null;
                announce.channel = channel;
                announce.subscription = subscriptionMatch;
                announce.timetoken = publishMetaData.publishTimetoken;
                announce.publisher = message.issuingClientId;
                if (message.userMetadata) {
                    announce.userMetadata = message.userMetadata;
                }
                announce.message = {
                    event: message.payload.event,
                    type: message.payload.type,
                    data: message.payload.data,
                };
                _this._listenerManager.announceObjects(announce);
                if (message.payload.type === 'uuid') {
                    var eventData = _this._renameChannelField(announce);
                    _this._listenerManager.announceUser(__assign(__assign({}, eventData), { message: __assign(__assign({}, eventData.message), { event: _this._renameEvent(eventData.message.event), type: 'user' }) }));
                }
                else if (message.payload.type === 'channel') {
                    var eventData = _this._renameChannelField(announce);
                    _this._listenerManager.announceSpace(__assign(__assign({}, eventData), { message: __assign(__assign({}, eventData.message), { event: _this._renameEvent(eventData.message.event), type: 'space' }) }));
                }
                else if (message.payload.type === 'membership') {
                    var eventData = _this._renameChannelField(announce);
                    var _a = eventData.message.data, user = _a.uuid, space = _a.channel, membershipData = __rest(_a, ["uuid", "channel"]);
                    membershipData.user = user;
                    membershipData.space = space;
                    _this._listenerManager.announceMembership(__assign(__assign({}, eventData), { message: __assign(__assign({}, eventData.message), { event: _this._renameEvent(eventData.message.event), data: membershipData }) }));
                }
            }
            else if (message.messageType === 3) {
                // this is a message action
                var announce = {};
                announce.channel = channel;
                announce.subscription = subscriptionMatch;
                announce.timetoken = publishMetaData.publishTimetoken;
                announce.publisher = message.issuingClientId;
                announce.data = {
                    messageTimetoken: message.payload.data.messageTimetoken,
                    actionTimetoken: message.payload.data.actionTimetoken,
                    type: message.payload.data.type,
                    uuid: message.issuingClientId,
                    value: message.payload.data.value,
                };
                announce.event = message.payload.event;
                _this._listenerManager.announceMessageAction(announce);
            }
            else if (message.messageType === 4) {
                // this is a file message
                var announce = {};
                announce.channel = channel;
                announce.subscription = subscriptionMatch;
                announce.timetoken = publishMetaData.publishTimetoken;
                announce.publisher = message.issuingClientId;
                var msgPayload = message.payload;
                if (_this._config.cipherKey) {
                    var decryptedPayload = _this._crypto.decrypt(message.payload);
                    if (typeof decryptedPayload === 'object' && decryptedPayload !== null) {
                        msgPayload = decryptedPayload;
                    }
                }
                if (message.userMetadata) {
                    announce.userMetadata = message.userMetadata;
                }
                announce.message = msgPayload.message;
                announce.file = {
                    id: msgPayload.file.id,
                    name: msgPayload.file.name,
                    url: _this._getFileUrl({
                        id: msgPayload.file.id,
                        name: msgPayload.file.name,
                        channel: channel,
                    }),
                };
                _this._listenerManager.announceFile(announce);
            }
            else {
                var announce = {};
                announce.channel = null;
                announce.subscription = null;
                // deprecated -->
                announce.actualChannel = subscriptionMatch != null ? channel : null;
                announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
                // <-- deprecated
                announce.channel = channel;
                announce.subscription = subscriptionMatch;
                announce.timetoken = publishMetaData.publishTimetoken;
                announce.publisher = message.issuingClientId;
                if (message.userMetadata) {
                    announce.userMetadata = message.userMetadata;
                }
                if (_this._config.cipherKey) {
                    announce.message = _this._crypto.decrypt(message.payload);
                }
                else {
                    announce.message = message.payload;
                }
                _this._listenerManager.announceMessage(announce);
            }
        });
        this._region = payload.metadata.region;
        this._startSubscribeLoop();
    };
    default_1.prototype._stopSubscribeLoop = function () {
        if (this._subscribeCall) {
            if (typeof this._subscribeCall.abort === 'function') {
                this._subscribeCall.abort();
            }
            this._subscribeCall = null;
        }
    };
    default_1.prototype._renameEvent = function (e) {
        return e === 'set' ? 'updated' : 'removed';
    };
    default_1.prototype._renameChannelField = function (announce) {
        var channel = announce.channel, eventData = __rest(announce, ["channel"]);
        eventData.spaceId = channel;
        return eventData;
    };
    return default_1;
}());
exports.default = default_1;
