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
Object.defineProperty(exports, "__esModule", { value: true });
var subscribe_1 = require("../endpoints/subscribe");
var EventEmitter = /** @class */ (function () {
    function EventEmitter(listenerManager) {
        this.listenerManager = listenerManager;
        /**
         * Map of channels to listener callbacks for them.
         */
        this.channelListenerMap = new Map();
        /**
         * Map of channel group names to the listener callbacks for them.
         */
        this.groupListenerMap = new Map();
    }
    /**
     * Emit specific real-time event.
     *
     * Proper listener will be notified basing on event `type`.
     *
     * @param event - Received real-time event.
     */
    EventEmitter.prototype.emitEvent = function (event) {
        if (event.type === subscribe_1.PubNubEventType.Message) {
            this.listenerManager.announceMessage(event.data);
            this.announce('message', event.data, event.data.channel, event.data.subscription);
        }
        else if (event.type === subscribe_1.PubNubEventType.Signal) {
            this.listenerManager.announceSignal(event.data);
            this.announce('signal', event.data, event.data.channel, event.data.subscription);
        }
        else if (event.type === subscribe_1.PubNubEventType.Presence) {
            this.listenerManager.announcePresence(event.data);
            this.announce('presence', event.data, event.data.channel, event.data.subscription);
        }
        else if (event.type === subscribe_1.PubNubEventType.AppContext) {
            var objectEvent = event.data;
            var object = objectEvent.message;
            this.listenerManager.announceObjects(objectEvent);
            this.announce('objects', objectEvent, objectEvent.channel, objectEvent.subscription);
            if (object.type === 'uuid') {
                var message = objectEvent.message, channel = objectEvent.channel, restEvent = __rest(objectEvent, ["message", "channel"]);
                var event_1 = object.event, type = object.type, restObject = __rest(object, ["event", "type"]);
                var userEvent = __assign(__assign({}, restEvent), { spaceId: channel, message: __assign(__assign({}, restObject), { event: event_1 === 'set' ? 'updated' : 'removed', type: 'user' }) });
                this.listenerManager.announceUser(userEvent);
                this.announce('user', userEvent, userEvent.spaceId, userEvent.subscription);
            }
            else if (object.type === 'channel') {
                var message = objectEvent.message, channel = objectEvent.channel, restEvent = __rest(objectEvent, ["message", "channel"]);
                var event_2 = object.event, type = object.type, restObject = __rest(object, ["event", "type"]);
                var spaceEvent = __assign(__assign({}, restEvent), { spaceId: channel, message: __assign(__assign({}, restObject), { event: event_2 === 'set' ? 'updated' : 'removed', type: 'space' }) });
                this.listenerManager.announceSpace(spaceEvent);
                this.announce('space', spaceEvent, spaceEvent.spaceId, spaceEvent.subscription);
            }
            else if (object.type === 'membership') {
                var message = objectEvent.message, channel = objectEvent.channel, restEvent = __rest(objectEvent, ["message", "channel"]);
                var event_3 = object.event, data = object.data, restObject = __rest(object, ["event", "data"]);
                var uuid = data.uuid, channelMeta = data.channel, restData = __rest(data, ["uuid", "channel"]);
                var membershipEvent = __assign(__assign({}, restEvent), { spaceId: channel, message: __assign(__assign({}, restObject), { event: event_3 === 'set' ? 'updated' : 'removed', data: __assign(__assign({}, restData), { user: uuid, space: channelMeta }) }) });
                this.listenerManager.announceMembership(membershipEvent);
                this.announce('membership', membershipEvent, membershipEvent.spaceId, membershipEvent.subscription);
            }
        }
        else if (event.type === subscribe_1.PubNubEventType.MessageAction) {
            this.listenerManager.announceMessageAction(event.data);
            this.announce('messageAction', event.data, event.data.channel, event.data.subscription);
        }
        else if (event.type === subscribe_1.PubNubEventType.Files) {
            this.listenerManager.announceFile(event.data);
            this.announce('file', event.data, event.data.channel, event.data.subscription);
        }
    };
    /**
     * Register real-time event listener for specific channels and groups.
     *
     * @param listener - Listener with event callbacks to handle different types of events.
     * @param channels - List of channels for which listener should be registered.
     * @param groups - List of channel groups for which listener should be registered.
     */
    EventEmitter.prototype.addListener = function (listener, channels, groups) {
        var _this = this;
        // Register event-listener listener globally.
        if (!(channels && groups)) {
            this.listenerManager.addListener(listener);
        }
        else {
            channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) {
                if (_this.channelListenerMap.has(channel)) {
                    var channelListeners = _this.channelListenerMap.get(channel);
                    if (!channelListeners.includes(listener))
                        channelListeners.push(listener);
                }
                else
                    _this.channelListenerMap.set(channel, [listener]);
            });
            groups === null || groups === void 0 ? void 0 : groups.forEach(function (group) {
                if (_this.groupListenerMap.has(group)) {
                    var groupListeners = _this.groupListenerMap.get(group);
                    if (!groupListeners.includes(listener))
                        groupListeners.push(listener);
                }
                else
                    _this.groupListenerMap.set(group, [listener]);
            });
        }
    };
    /**
     * Remove real-time event listener.
     *
     * @param listener - Event listeners which should be removed.
     * @param channels - List of channels for which listener should be removed.
     * @param groups - List of channel groups for which listener should be removed.
     */
    EventEmitter.prototype.removeListener = function (listener, channels, groups) {
        var _this = this;
        if (!(channels && groups)) {
            this.listenerManager.removeListener(listener);
        }
        else {
            channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) {
                if (_this.channelListenerMap.has(channel)) {
                    _this.channelListenerMap.set(channel, _this.channelListenerMap.get(channel).filter(function (channelListener) { return channelListener !== listener; }));
                }
            });
            groups === null || groups === void 0 ? void 0 : groups.forEach(function (group) {
                if (_this.groupListenerMap.has(group)) {
                    _this.groupListenerMap.set(group, _this.groupListenerMap.get(group).filter(function (groupListener) { return groupListener !== listener; }));
                }
            });
        }
    };
    /**
     * Clear all real-time event listeners.
     */
    EventEmitter.prototype.removeAllListeners = function () {
        this.listenerManager.removeAllListeners();
        this.channelListenerMap.clear();
        this.groupListenerMap.clear();
    };
    /**
     * Announce real-time event to all listeners.
     *
     * @param type - Type of event which should be announced.
     * @param event - Announced real-time event payload.
     * @param channel - Name of the channel for which registered listeners should be notified.
     * @param group - Name of the channel group for which registered listeners should be notified.
     */
    EventEmitter.prototype.announce = function (type, event, channel, group) {
        if (event && this.channelListenerMap.has(channel))
            this.channelListenerMap.get(channel).forEach(function (listener) {
                var typedListener = listener[type];
                // @ts-expect-error Dynamic events mapping.
                if (typedListener)
                    typedListener(event);
            });
        if (group && this.groupListenerMap.has(group))
            this.groupListenerMap.get(group).forEach(function (listener) {
                var typedListener = listener[type];
                // @ts-expect-error Dynamic events mapping.
                if (typedListener)
                    typedListener(event);
            });
    };
    return EventEmitter;
}());
exports.default = EventEmitter;
