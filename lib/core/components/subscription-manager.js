"use strict";
/**
 * Subscription manager module.
 *
 * @internal
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
const subscribe_1 = require("../endpoints/subscribe");
const utils_1 = require("../utils");
const reconnection_manager_1 = require("./reconnection_manager");
const categories_1 = __importDefault(require("../constants/categories"));
const deduping_manager_1 = require("./deduping_manager");
/**
 * Subscription loop manager.
 *
 * @internal
 */
class SubscriptionManager {
    constructor(configuration, emitEvent, emitStatus, subscribeCall, heartbeatCall, leaveCall, time) {
        this.configuration = configuration;
        this.emitEvent = emitEvent;
        this.emitStatus = emitStatus;
        this.subscribeCall = subscribeCall;
        this.heartbeatCall = heartbeatCall;
        this.leaveCall = leaveCall;
        /**
         * Whether user code in event handlers requested disconnection or not.
         *
         * Won't continue subscription loop if user requested disconnection/unsubscribe from all in response to received
         * event.
         */
        this.disconnectedWhileHandledEvent = false;
        configuration.logger().trace('SubscriptionManager', 'Create manager.');
        this.reconnectionManager = new reconnection_manager_1.ReconnectionManager(time);
        this.dedupingManager = new deduping_manager_1.DedupingManager(this.configuration);
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
        this.referenceTimetoken = null;
        this.subscriptionStatusAnnounced = false;
        this.isOnline = true;
    }
    // region Information
    /**
     * Subscription-based current timetoken.
     *
     * @returns Timetoken based on current timetoken plus diff between current and loop start time.
     */
    get subscriptionTimetoken() {
        var _a;
        return (0, utils_1.subscriptionTimetokenFromReference)(this.currentTimetoken, (_a = this.referenceTimetoken) !== null && _a !== void 0 ? _a : '0');
    }
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
        // Potentially called during received events handling.
        // Mark to prevent subscription loop continuation in subscribe response handler.
        this.disconnectedWhileHandledEvent = true;
        this.stopSubscribeLoop();
        this.stopHeartbeatTimer();
        this.reconnectionManager.stopPolling();
    }
    /**
     * Restart subscription loop with current state.
     *
     * @param forUnsubscribe - Whether restarting subscription loop as part of channels list change on
     * unsubscribe or not.
     */
    reconnect(forUnsubscribe = false) {
        this.startSubscribeLoop(forUnsubscribe);
        // Starting heartbeat loop for provided channels and groups.
        if (!forUnsubscribe && !this.configuration.useSmartHeartbeat)
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
            this.currentTimetoken = `${timetoken}`;
        }
        if (this.currentTimetoken !== '0') {
            this.storedTimetoken = this.currentTimetoken;
            this.currentTimetoken = '0';
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
    unsubscribe(parameters, isOffline = false) {
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
        const lastTimetoken = this.lastTimetoken;
        const currentTimetoken = this.currentTimetoken;
        if (Object.keys(this.channels).length === 0 &&
            Object.keys(this.presenceChannels).length === 0 &&
            Object.keys(this.channelGroups).length === 0 &&
            Object.keys(this.presenceChannelGroups).length === 0) {
            this.lastTimetoken = '0';
            this.currentTimetoken = '0';
            this.referenceTimetoken = null;
            this.storedTimetoken = null;
            this.region = null;
            this.reconnectionManager.stopPolling();
        }
        this.reconnect(true);
        // Send leave request after long-poll connection closed and loop restarted (the same way as it happens in new
        // subscription flow).
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
                this.emitStatus(Object.assign(Object.assign({}, restOfStatus), { error: errorMessage !== null && errorMessage !== void 0 ? errorMessage : false, affectedChannels: channels, affectedChannelGroups: channelGroups, currentTimetoken,
                    lastTimetoken }));
            });
        }
    }
    unsubscribeAll(isOffline = false) {
        this.disconnectedWhileHandledEvent = true;
        this.unsubscribe({
            channels: this.subscribedChannels,
            channelGroups: this.subscribedChannelGroups,
        }, isOffline);
    }
    /**
     * Start next subscription loop.
     *
     * @param restartOnUnsubscribe - Whether restarting subscription loop as part of channels list change on
     * unsubscribe or not.
     *
     * @internal
     */
    startSubscribeLoop(restartOnUnsubscribe = false) {
        this.disconnectedWhileHandledEvent = false;
        this.stopSubscribeLoop();
        const channelGroups = [...Object.keys(this.channelGroups)];
        const channels = [...Object.keys(this.channels)];
        Object.keys(this.presenceChannelGroups).forEach((group) => channelGroups.push(`${group}-pnpres`));
        Object.keys(this.presenceChannels).forEach((channel) => channels.push(`${channel}-pnpres`));
        // There is no need to start subscription loop for an empty list of data sources.
        if (channels.length === 0 && channelGroups.length === 0)
            return;
        this.subscribeCall(Object.assign(Object.assign(Object.assign({ channels,
            channelGroups, state: this.presenceState, heartbeat: this.configuration.getPresenceTimeout(), timetoken: this.currentTimetoken }, (this.region !== null ? { region: this.region } : {})), (this.configuration.filterExpression ? { filterExpression: this.configuration.filterExpression } : {})), { onDemand: !this.subscriptionStatusAnnounced || restartOnUnsubscribe }), (status, result) => {
            this.processSubscribeResponse(status, result);
        });
        if (!restartOnUnsubscribe && this.configuration.useSmartHeartbeat)
            this.startHeartbeatTimer();
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
            if (status.category === categories_1.default.PNTimeoutCategory) {
                this.startSubscribeLoop();
            }
            else if (status.category === categories_1.default.PNNetworkIssuesCategory ||
                status.category === categories_1.default.PNMalformedResponseCategory) {
                this.disconnect();
                if (status.error && this.configuration.autoNetworkDetection && this.isOnline) {
                    this.isOnline = false;
                    this.emitStatus({ category: categories_1.default.PNNetworkDownCategory });
                }
                this.reconnectionManager.onReconnect(() => {
                    if (this.configuration.autoNetworkDetection && !this.isOnline) {
                        this.isOnline = true;
                        this.emitStatus({ category: categories_1.default.PNNetworkUpCategory });
                    }
                    this.reconnect();
                    this.subscriptionStatusAnnounced = true;
                    const reconnectedAnnounce = {
                        category: categories_1.default.PNReconnectedCategory,
                        operation: status.operation,
                        lastTimetoken: this.lastTimetoken,
                        currentTimetoken: this.currentTimetoken,
                    };
                    this.emitStatus(reconnectedAnnounce);
                });
                this.reconnectionManager.startPolling();
                this.emitStatus(Object.assign(Object.assign({}, status), { category: categories_1.default.PNNetworkIssuesCategory }));
            }
            else if (status.category === categories_1.default.PNBadRequestCategory) {
                this.stopHeartbeatTimer();
                this.emitStatus(status);
            }
            else
                this.emitStatus(status);
            return;
        }
        this.referenceTimetoken = (0, utils_1.referenceSubscribeTimetoken)(result.cursor.timetoken, this.storedTimetoken);
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
            this.emitStatus(connected);
            // Clear pending channels and groups.
            this.pendingChannelGroupSubscriptions.clear();
            this.pendingChannelSubscriptions.clear();
        }
        const { messages } = result;
        const { requestMessageCountThreshold, dedupeOnSubscribe } = this.configuration;
        if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
            this.emitStatus({
                category: categories_1.default.PNRequestMessageCountExceededCategory,
                operation: status.operation,
            });
        }
        try {
            const cursor = {
                timetoken: this.currentTimetoken,
                region: this.region ? this.region : undefined,
            };
            this.configuration.logger().debug('SubscriptionManager', () => {
                const hashedEvents = messages.map((event) => {
                    const pn_mfp = event.type === subscribe_1.PubNubEventType.Message || event.type === subscribe_1.PubNubEventType.Signal
                        ? (0, utils_1.messageFingerprint)(event.data.message)
                        : undefined;
                    return pn_mfp ? { type: event.type, data: Object.assign(Object.assign({}, event.data), { pn_mfp }) } : event;
                });
                return { messageType: 'object', message: hashedEvents, details: 'Received events:' };
            });
            messages.forEach((message) => {
                if (dedupeOnSubscribe && 'message' in message.data && 'timetoken' in message.data) {
                    if (this.dedupingManager.isDuplicate(message.data)) {
                        this.configuration.logger().warn('SubscriptionManager', () => ({
                            messageType: 'object',
                            message: message.data,
                            details: 'Duplicate message detected (skipped):',
                        }));
                        return;
                    }
                    this.dedupingManager.addEntry(message.data);
                }
                this.emitEvent(cursor, message);
            });
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
        this.region = result.cursor.region;
        if (!this.disconnectedWhileHandledEvent)
            this.startSubscribeLoop();
        else
            this.disconnectedWhileHandledEvent = false;
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
                this.leaveCall({ channels, channelGroups }, (status) => this.emitStatus(status));
            }
        }
        this.reconnect();
    }
    startHeartbeatTimer() {
        this.stopHeartbeatTimer();
        const heartbeatInterval = this.configuration.getHeartbeatInterval();
        if (!heartbeatInterval || heartbeatInterval === 0)
            return;
        // Sending immediate heartbeat only if not working as a smart heartbeat.
        if (!this.configuration.useSmartHeartbeat)
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
                this.emitStatus(status);
            if (status.error && this.configuration.autoNetworkDetection && this.isOnline) {
                this.isOnline = false;
                this.disconnect();
                this.emitStatus({ category: categories_1.default.PNNetworkDownCategory });
                this.reconnect();
            }
            if (!status.error && this.configuration.announceSuccessfulHeartbeats)
                this.emitStatus(status);
        });
    }
}
exports.SubscriptionManager = SubscriptionManager;
