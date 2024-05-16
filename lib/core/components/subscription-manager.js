"use strict";
/**
 * Subscription manager module.
 */
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
exports.SubscriptionManager = void 0;
const reconnection_manager_1 = require("./reconnection_manager");
const categories_1 = __importDefault(require("../constants/categories"));
const categories_2 = __importDefault(require("../constants/categories"));
const deduping_manager_1 = __importDefault(require("./deduping_manager"));
/**
 * Subscription loop manager.
 *
 * @internal
 */
class SubscriptionManager {
    constructor(configuration, listenerManager, eventEmitter, subscribeCall, heartbeatCall, leaveCall, time) {
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
        this.pendingChannelGroupSubscriptions = new Set();
        this.pendingChannelSubscriptions = new Set();
        this.channelGroups = {};
        this.channels = {};
        this.currentTimetoken = '0';
        this.lastTimetoken = '0';
        this.storedTimetoken = null;
        this.subscriptionStatusAnnounced = false;
        this.isOnline = true;
    }
    // region Information
    get subscribedChannels() {
        return Object.keys(this.channels);
    }
    get subscribedChannelGroups() {
        return Object.keys(this.channelGroups);
    }
    get abort() {
        return this._subscribeAbort;
    }
    set abort(call) {
        this._subscribeAbort = call;
    }
    // endregion
    // region Subscription
    disconnect() {
        this.stopSubscribeLoop();
        this.stopHeartbeatTimer();
        this.reconnectionManager.stopPolling();
    }
    reconnect() {
        this.startSubscribeLoop();
        this.startHeartbeatTimer();
    }
    /**
     * Update channels and groups used in subscription loop.
     *
     * @param parameters - Subscribe configuration parameters.
     */
    subscribe(parameters) {
        const { channels, channelGroups, timetoken, withPresence = false, withHeartbeats = false } = parameters;
        if (timetoken) {
            this.lastTimetoken = this.currentTimetoken;
            this.currentTimetoken = timetoken;
        }
        if (this.currentTimetoken !== '0' && this.currentTimetoken !== 0) {
            this.storedTimetoken = this.currentTimetoken;
            this.currentTimetoken = 0;
        }
        channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => {
            this.pendingChannelSubscriptions.add(channel);
            this.channels[channel] = {};
            if (withPresence)
                this.presenceChannels[channel] = {};
            if (withHeartbeats || this.configuration.getHeartbeatInterval())
                this.heartbeatChannels[channel] = {};
        });
        channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach((group) => {
            this.pendingChannelGroupSubscriptions.add(group);
            this.channelGroups[group] = {};
            if (withPresence)
                this.presenceChannelGroups[group] = {};
            if (withHeartbeats || this.configuration.getHeartbeatInterval())
                this.heartbeatChannelGroups[group] = {};
        });
        this.subscriptionStatusAnnounced = false;
        this.reconnect();
    }
    unsubscribe(parameters, isOffline) {
        let { channels, channelGroups } = parameters;
        const actualChannelGroups = new Set();
        const actualChannels = new Set();
        channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => {
            if (channel in this.channels) {
                delete this.channels[channel];
                actualChannels.add(channel);
                if (channel in this.heartbeatChannels)
                    delete this.heartbeatChannels[channel];
            }
            if (channel in this.presenceState)
                delete this.presenceState[channel];
            if (channel in this.presenceChannels) {
                delete this.presenceChannels[channel];
                actualChannels.add(channel);
            }
        });
        channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach((group) => {
            if (group in this.channelGroups) {
                delete this.channelGroups[group];
                actualChannelGroups.add(group);
                if (group in this.heartbeatChannelGroups)
                    delete this.heartbeatChannelGroups[group];
            }
            if (group in this.presenceState)
                delete this.presenceState[group];
            if (group in this.presenceChannelGroups) {
                delete this.presenceChannelGroups[group];
                actualChannelGroups.add(group);
            }
        });
        // There is no need to unsubscribe to empty list of data sources.
        if (actualChannels.size === 0 && actualChannelGroups.size === 0)
            return;
        if (this.configuration.suppressLeaveEvents === false && !isOffline) {
            channelGroups = Array.from(actualChannelGroups);
            channels = Array.from(actualChannels);
            this.leaveCall({ channels, channelGroups }, (status) => {
                const { error } = status, restOfStatus = __rest(status, ["error"]);
                let errorMessage;
                if (error) {
                    if (status.errorData &&
                        typeof status.errorData === 'object' &&
                        'message' in status.errorData &&
                        typeof status.errorData.message === 'string')
                        errorMessage = status.errorData.message;
                    else if ('message' in status && typeof status.message === 'string')
                        errorMessage = status.message;
                }
                this.listenerManager.announceStatus(Object.assign(Object.assign({}, restOfStatus), { error: errorMessage !== null && errorMessage !== void 0 ? errorMessage : false, affectedChannels: channels, affectedChannelGroups: channelGroups, currentTimetoken: this.currentTimetoken, lastTimetoken: this.lastTimetoken }));
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
    }
    unsubscribeAll(isOffline) {
        this.unsubscribe({
            channels: this.subscribedChannels,
            channelGroups: this.subscribedChannelGroups,
        }, isOffline);
    }
    startSubscribeLoop() {
        this.stopSubscribeLoop();
        const channelGroups = [...Object.keys(this.channelGroups)];
        const channels = [...Object.keys(this.channels)];
        Object.keys(this.presenceChannelGroups).forEach((group) => channelGroups.push(`${group}-pnpres`));
        Object.keys(this.presenceChannels).forEach((channel) => channels.push(`${channel}-pnpres`));
        // There is no need to start subscription loop for empty list of data sources.
        if (channels.length === 0 && channelGroups.length === 0)
            return;
        this.subscribeCall({
            channels,
            channelGroups,
            state: this.presenceState,
            heartbeat: this.configuration.getPresenceTimeout(),
            timetoken: this.currentTimetoken,
            region: this.region !== null ? this.region : undefined,
            filterExpression: this.configuration.filterExpression,
        }, (status, result) => {
            this.processSubscribeResponse(status, result);
        });
    }
    stopSubscribeLoop() {
        if (this._subscribeAbort) {
            this._subscribeAbort();
            this._subscribeAbort = null;
        }
    }
    /**
     * Process subscribe REST API endpoint response.
     */
    processSubscribeResponse(status, result) {
        if (status.error) {
            // Ignore aborted request.
            if ((typeof status.errorData === 'object' &&
                'name' in status.errorData &&
                status.errorData.name === 'AbortError') ||
                status.category === categories_1.default.PNCancelledCategory)
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
                this.reconnectionManager.onReconnect(() => {
                    if (this.configuration.autoNetworkDetection && !this.isOnline) {
                        this.isOnline = true;
                        this.listenerManager.announceNetworkUp();
                    }
                    this.reconnect();
                    this.subscriptionStatusAnnounced = true;
                    const reconnectedAnnounce = {
                        category: categories_2.default.PNReconnectedCategory,
                        operation: status.operation,
                        lastTimetoken: this.lastTimetoken,
                        currentTimetoken: this.currentTimetoken,
                    };
                    this.listenerManager.announceStatus(reconnectedAnnounce);
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
            const connected = {
                category: categories_1.default.PNConnectedCategory,
                operation: status.operation,
                affectedChannels: Array.from(this.pendingChannelSubscriptions),
                subscribedChannels: this.subscribedChannels,
                affectedChannelGroups: Array.from(this.pendingChannelGroupSubscriptions),
                lastTimetoken: this.lastTimetoken,
                currentTimetoken: this.currentTimetoken,
            };
            this.subscriptionStatusAnnounced = true;
            this.listenerManager.announceStatus(connected);
            // Clear pending channels and groups.
            this.pendingChannelGroupSubscriptions.clear();
            this.pendingChannelSubscriptions.clear();
        }
        const { messages } = result;
        const { requestMessageCountThreshold, dedupeOnSubscribe } = this.configuration;
        if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
            this.listenerManager.announceStatus({
                category: categories_1.default.PNRequestMessageCountExceededCategory,
                operation: status.operation,
            });
        }
        try {
            messages.forEach((message) => {
                if (dedupeOnSubscribe) {
                    if (this.dedupingManager.isDuplicate(message.data))
                        return;
                    this.dedupingManager.addEntry(message.data);
                }
                this.eventEmitter.emitEvent(message);
            });
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
        this.region = result.cursor.region;
        this.startSubscribeLoop();
    }
    // endregion
    // region Presence
    /**
     * Update `uuid` state which should be sent with subscribe request.
     *
     * @param parameters - Channels and groups with state which should be associated to `uuid`.
     */
    setState(parameters) {
        const { state, channels, channelGroups } = parameters;
        channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => channel in this.channels && (this.presenceState[channel] = state));
        channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach((group) => group in this.channelGroups && (this.presenceState[group] = state));
    }
    /**
     * Manual presence management.
     *
     * @param parameters - Desired presence state for provided list of channels and groups.
     */
    changePresence(parameters) {
        const { connected, channels, channelGroups } = parameters;
        if (connected) {
            channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => (this.heartbeatChannels[channel] = {}));
            channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach((group) => (this.heartbeatChannelGroups[group] = {}));
        }
        else {
            channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => {
                if (channel in this.heartbeatChannels)
                    delete this.heartbeatChannels[channel];
            });
            channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach((group) => {
                if (group in this.heartbeatChannelGroups)
                    delete this.heartbeatChannelGroups[group];
            });
            if (this.configuration.suppressLeaveEvents === false) {
                this.leaveCall({ channels, channelGroups }, (status) => this.listenerManager.announceStatus(status));
            }
        }
        this.reconnect();
    }
    startHeartbeatTimer() {
        this.stopHeartbeatTimer();
        const heartbeatInterval = this.configuration.getHeartbeatInterval();
        if (!heartbeatInterval || heartbeatInterval === 0)
            return;
        this.sendHeartbeat();
        this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), heartbeatInterval * 1000);
    }
    /**
     * Stop heartbeat.
     *
     * Stop timer which trigger {@link HeartbeatRequest} sending with configured presence intervals.
     */
    stopHeartbeatTimer() {
        if (!this.heartbeatTimer)
            return;
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
    }
    /**
     * Send heartbeat request.
     */
    sendHeartbeat() {
        const heartbeatChannelGroups = Object.keys(this.heartbeatChannelGroups);
        const heartbeatChannels = Object.keys(this.heartbeatChannels);
        // There is no need to start heartbeat loop if there is no channels and groups to use.
        if (heartbeatChannels.length === 0 && heartbeatChannelGroups.length === 0)
            return;
        this.heartbeatCall({
            channels: heartbeatChannels,
            channelGroups: heartbeatChannelGroups,
            heartbeat: this.configuration.getPresenceTimeout(),
            state: this.presenceState,
        }, (status) => {
            if (status.error && this.configuration.announceFailedHeartbeats)
                this.listenerManager.announceStatus(status);
            if (status.error && this.configuration.autoNetworkDetection && this.isOnline) {
                this.isOnline = false;
                this.disconnect();
                this.listenerManager.announceNetworkDown();
                this.reconnect();
            }
            if (!status.error && this.configuration.announceSuccessfulHeartbeats)
                this.listenerManager.announceStatus(status);
        });
    }
}
exports.SubscriptionManager = SubscriptionManager;
