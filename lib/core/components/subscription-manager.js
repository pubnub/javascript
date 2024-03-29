"use strict";
/**
 * Subscription manager module.
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionManager = void 0;
var reconnection_manager_1 = require("./reconnection_manager");
var categories_1 = __importDefault(require("../constants/categories"));
var deduping_manager_1 = __importDefault(require("./deduping_manager"));
var categories_2 = __importDefault(require("../constants/categories"));
/**
 * Subscription loop manager.
 */
var SubscriptionManager = /** @class */ (function () {
    function SubscriptionManager(configuration, listenerManager, eventEmitter, subscribeCall, heartbeatCall, leaveCall, time) {
        this.configuration = configuration;
        this.listenerManager = listenerManager;
        this.eventEmitter = eventEmitter;
        this.subscribeCall = subscribeCall;
        this.heartbeatCall = heartbeatCall;
        this.leaveCall = leaveCall;
        this.reconnectionManager = new reconnection_manager_1.ReconnectionManager(time);
        this.dedupingManager = new deduping_manager_1.default({ config: this.configuration });
        this.heartbeatChannelGroups = {};
        this.heartbeatChannels = {};
        this.presenceChannelGroups = {};
        this.presenceChannels = {};
        this.heartbeatTimer = null;
        this.presenceState = {};
        this.pendingChannelGroupSubscriptions = [];
        this.pendingChannelSubscriptions = [];
        this.channelGroups = {};
        this.channels = {};
        this.currentTimetoken = '0';
        this.lastTimetoken = '0';
        this.storedTimetoken = null;
        this.subscriptionStatusAnnounced = false;
        this.isOnline = true;
    }
    Object.defineProperty(SubscriptionManager.prototype, "subscribedChannels", {
        // region Information
        get: function () {
            return Object.keys(this.channels);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubscriptionManager.prototype, "subscribedChannelGroups", {
        get: function () {
            return Object.keys(this.channelGroups);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubscriptionManager.prototype, "abort", {
        set: function (call) {
            this._subscribeAbort = call;
        },
        enumerable: false,
        configurable: true
    });
    // endregion
    // region Subscription
    SubscriptionManager.prototype.disconnect = function () {
        this.stopSubscribeLoop();
        this.stopHeartbeatTimer();
        this.reconnectionManager.stopPolling();
    };
    SubscriptionManager.prototype.reconnect = function () {
        this.startSubscribeLoop();
        this.startHeartbeatTimer();
    };
    /**
     * Update channels and groups used in subscription loop.
     *
     * @param parameters - Subscribe configuration parameters.
     */
    SubscriptionManager.prototype.subscribe = function (parameters) {
        var _this = this;
        var channels = parameters.channels, channelGroups = parameters.channelGroups, timetoken = parameters.timetoken, _a = parameters.withPresence, withPresence = _a === void 0 ? false : _a, _b = parameters.withHeartbeats, withHeartbeats = _b === void 0 ? false : _b;
        if (timetoken) {
            this.lastTimetoken = this.currentTimetoken;
            this.currentTimetoken = timetoken;
        }
        if (this.currentTimetoken !== '0' && this.currentTimetoken !== 0) {
            this.storedTimetoken = this.currentTimetoken;
            this.currentTimetoken = 0;
        }
        channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) {
            _this.pendingChannelSubscriptions.push(channel);
            _this.channels[channel] = {};
            if (withPresence)
                _this.presenceChannels[channel] = {};
            if (withHeartbeats || _this.configuration.getHeartbeatInterval())
                _this.heartbeatChannels[channel] = {};
        });
        channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach(function (group) {
            _this.pendingChannelGroupSubscriptions.push(group);
            _this.channelGroups[group] = {};
            if (withPresence)
                _this.presenceChannelGroups[group] = {};
            if (withHeartbeats || _this.configuration.getHeartbeatInterval())
                _this.heartbeatChannelGroups[group] = {};
        });
        this.subscriptionStatusAnnounced = false;
        this.reconnect();
    };
    SubscriptionManager.prototype.unsubscribe = function (parameters, isOffline) {
        var _this = this;
        var channels = parameters.channels, channelGroups = parameters.channelGroups;
        var actualChannelGroups = [];
        var actualChannels = [];
        channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) {
            if (channel in _this.channels) {
                delete _this.channels[channel];
                actualChannels.push(channel);
                if (channel in _this.heartbeatChannels)
                    delete _this.heartbeatChannels[channel];
            }
            if (channel in _this.presenceState)
                delete _this.presenceState[channel];
            if (channel in _this.presenceChannels) {
                delete _this.presenceChannels[channel];
                actualChannels.push(channel);
            }
        });
        channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach(function (group) {
            if (group in _this.channelGroups) {
                delete _this.channelGroups[group];
                actualChannelGroups.push(group);
                if (group in _this.heartbeatChannelGroups)
                    delete _this.heartbeatChannelGroups[group];
            }
            if (group in _this.presenceState)
                delete _this.presenceState[group];
            if (group in _this.presenceChannelGroups) {
                delete _this.presenceChannelGroups[group];
                actualChannelGroups.push(group);
            }
        });
        // There is no need to unsubscribe to empty list of data sources.
        if (actualChannels.length === 0 && actualChannelGroups.length === 0)
            return;
        if (this.configuration.suppressLeaveEvents === false && !isOffline) {
            this.leaveCall({ channels: actualChannels, channelGroups: actualChannelGroups }, function (status) {
                _this.listenerManager.announceStatus(__assign(__assign({}, status), { affectedChannels: actualChannels, affectedChannelGroups: actualChannelGroups, currentTimetoken: _this.currentTimetoken, lastTimetoken: _this.lastTimetoken }));
            });
        }
        if (Object.keys(this.channels).length === 0 &&
            Object.keys(this.presenceChannels).length === 0 &&
            Object.keys(this.channelGroups).length === 0 &&
            Object.keys(this.presenceChannelGroups).length === 0) {
            this.lastTimetoken = 0;
            this.currentTimetoken = 0;
            this.storedTimetoken = null;
            this.region = null;
            this.reconnectionManager.stopPolling();
        }
        this.reconnect();
    };
    SubscriptionManager.prototype.unsubscribeAll = function (isOffline) {
        this.unsubscribe({
            channels: this.subscribedChannels,
            channelGroups: this.subscribedChannelGroups,
        }, isOffline);
    };
    SubscriptionManager.prototype.startSubscribeLoop = function () {
        var _this = this;
        this.stopSubscribeLoop();
        var channelGroups = __spreadArray([], __read(Object.keys(this.channelGroups)), false);
        var channels = __spreadArray([], __read(Object.keys(this.channels)), false);
        Object.keys(this.presenceChannelGroups).forEach(function (group) { return channelGroups.push("".concat(group, "-pnpres")); });
        Object.keys(this.presenceChannels).forEach(function (channel) { return channels.push("".concat(channel, "-pnpres")); });
        // There is no need to start subscription loop for empty list of data sources.
        if (channels.length === 0 && channelGroups.length === 0)
            return;
        this.subscribeCall({
            channels: channels,
            channelGroups: channelGroups,
            state: this.presenceState,
            timetoken: this.currentTimetoken,
            region: this.region !== null ? this.region : undefined,
            filterExpression: this.configuration.filterExpression,
        }, function (status, result) {
            _this.processSubscribeResponse(status, result);
        });
    };
    SubscriptionManager.prototype.stopSubscribeLoop = function () {
        if (this._subscribeAbort) {
            this._subscribeAbort();
            this._subscribeAbort = null;
        }
    };
    /**
     * Process subscribe REST API endpoint response.
     */
    SubscriptionManager.prototype.processSubscribeResponse = function (status, result) {
        var _this = this;
        if (status.error) {
            // Ignore aborted request.
            if (typeof status.errorData === 'object' && 'name' in status.errorData && status.errorData.name === 'AbortError')
                return;
            if (status.category === categories_2.default.PNTimeoutCategory) {
                this.startSubscribeLoop();
            }
            else if (status.category === categories_2.default.PNNetworkIssuesCategory) {
                this.disconnect();
                if (status.error && this.configuration.autoNetworkDetection && this.isOnline) {
                    this.isOnline = false;
                    this.listenerManager.announceNetworkDown();
                }
                this.reconnectionManager.onReconnect(function () {
                    if (_this.configuration.autoNetworkDetection && !_this.isOnline) {
                        _this.isOnline = true;
                        _this.listenerManager.announceNetworkUp();
                    }
                    _this.reconnect();
                    _this.subscriptionStatusAnnounced = true;
                    var reconnectedAnnounce = {
                        category: categories_2.default.PNReconnectedCategory,
                        operation: status.operation,
                        lastTimetoken: _this.lastTimetoken,
                        currentTimetoken: _this.currentTimetoken,
                    };
                    _this.listenerManager.announceStatus(reconnectedAnnounce);
                });
                this.reconnectionManager.startPolling();
                this.listenerManager.announceStatus(status);
            }
            else if (status.category === categories_2.default.PNBadRequestCategory) {
                this.stopHeartbeatTimer();
                this.listenerManager.announceStatus(status);
            }
            else {
                this.listenerManager.announceStatus(status);
            }
            return;
        }
        if (this.storedTimetoken) {
            this.currentTimetoken = this.storedTimetoken;
            this.storedTimetoken = null;
        }
        else {
            this.lastTimetoken = this.currentTimetoken;
            this.currentTimetoken = result.cursor.timetoken;
        }
        if (!this.subscriptionStatusAnnounced) {
            var connected = {
                category: categories_1.default.PNConnectedCategory,
                operation: status.operation,
                affectedChannels: this.pendingChannelSubscriptions,
                subscribedChannels: this.subscribedChannels,
                affectedChannelGroups: this.pendingChannelGroupSubscriptions,
                lastTimetoken: this.lastTimetoken,
                currentTimetoken: this.currentTimetoken,
            };
            this.subscriptionStatusAnnounced = true;
            this.listenerManager.announceStatus(connected);
            // Clear pending channels and groups.
            this.pendingChannelGroupSubscriptions = [];
            this.pendingChannelSubscriptions = [];
        }
        var messages = result.messages;
        var _a = this.configuration, requestMessageCountThreshold = _a.requestMessageCountThreshold, dedupeOnSubscribe = _a.dedupeOnSubscribe;
        if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
            this.listenerManager.announceStatus({
                category: categories_1.default.PNRequestMessageCountExceededCategory,
                operation: status.operation,
            });
        }
        messages.forEach(function (message) {
            if (dedupeOnSubscribe) {
                if (_this.dedupingManager.isDuplicate(message))
                    return;
                _this.dedupingManager.addEntry(message);
            }
            _this.eventEmitter.emitEvent(message);
        });
        this.region = result.cursor.region;
        this.startSubscribeLoop();
    };
    // endregion
    // region Presence
    /**
     * Update `uuid` state which should be sent with subscribe request.
     *
     * @param parameters - Channels and groups with state which should be associated to `uuid`.
     */
    SubscriptionManager.prototype.setState = function (parameters) {
        var _this = this;
        var state = parameters.state, channels = parameters.channels, channelGroups = parameters.channelGroups;
        channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) { return channel in _this.channels && (_this.presenceState[channel] = state); });
        channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach(function (group) { return group in _this.channelGroups && (_this.presenceState[group] = state); });
    };
    /**
     * Manual presence management.
     *
     * @param parameters - Desired presence state for provided list of channels and groups.
     */
    SubscriptionManager.prototype.changePresence = function (parameters) {
        var _this = this;
        var connected = parameters.connected, channels = parameters.channels, channelGroups = parameters.channelGroups;
        if (connected) {
            channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) { return (_this.heartbeatChannels[channel] = {}); });
            channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach(function (group) { return (_this.heartbeatChannelGroups[group] = {}); });
        }
        else {
            channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) {
                if (channel in _this.heartbeatChannels)
                    delete _this.heartbeatChannels[channel];
            });
            channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach(function (group) {
                if (group in _this.heartbeatChannelGroups)
                    delete _this.heartbeatChannelGroups[group];
            });
            if (this.configuration.suppressLeaveEvents === false) {
                this.leaveCall({ channels: channels, channelGroups: channelGroups }, function (status) { return _this.listenerManager.announceStatus(status); });
            }
        }
        this.reconnect();
    };
    SubscriptionManager.prototype.startHeartbeatTimer = function () {
        var _this = this;
        this.stopHeartbeatTimer();
        var heartbeatInterval = this.configuration.getHeartbeatInterval();
        if (!heartbeatInterval || heartbeatInterval === 0)
            return;
        this.sendHeartbeat();
        this.heartbeatTimer = setInterval(function () { return _this.sendHeartbeat(); }, heartbeatInterval * 1000);
    };
    /**
     * Stop heartbeat.
     *
     * Stop timer which trigger {@link HeartbeatRequest} sending with configured presence intervals.
     */
    SubscriptionManager.prototype.stopHeartbeatTimer = function () {
        if (!this.heartbeatTimer)
            return;
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
    };
    /**
     * Send heartbeat request.
     */
    SubscriptionManager.prototype.sendHeartbeat = function () {
        var _this = this;
        var heartbeatChannelGroups = Object.keys(this.heartbeatChannelGroups);
        var heartbeatChannels = Object.keys(this.heartbeatChannels);
        // There is no need to start heartbeat loop if there is no channels and groups to use.
        if (heartbeatChannels.length === 0 && heartbeatChannelGroups.length === 0)
            return;
        this.heartbeatCall({
            channels: heartbeatChannels,
            channelGroups: heartbeatChannelGroups,
            heartbeat: this.configuration.getPresenceTimeout(),
            state: this.presenceState,
        }, function (status) {
            if (status.error && _this.configuration.announceFailedHeartbeats)
                _this.listenerManager.announceStatus(status);
            if (status.error && _this.configuration.autoNetworkDetection && _this.isOnline) {
                _this.isOnline = false;
                _this.disconnect();
                _this.listenerManager.announceNetworkDown();
                _this.reconnect();
            }
            if (!status.error && _this.configuration.announceSuccessfulHeartbeats)
                _this.listenerManager.announceNetworkUp();
        });
    };
    return SubscriptionManager;
}());
exports.SubscriptionManager = SubscriptionManager;
