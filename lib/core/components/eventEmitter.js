"use strict";
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
const subscribe_1 = require("../endpoints/subscribe");
/**
 * Real-time events' emitter.
 *
 * Emitter responsible for forwarding received real-time events to the closures which has been
 * registered for specific events handling.
 *
 * @internal
 */
class EventEmitter {
    constructor(listenerManager) {
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
    emitEvent(event) {
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
            const { data: objectEvent } = event;
            const { message: object } = objectEvent;
            this.listenerManager.announceObjects(objectEvent);
            this.announce('objects', objectEvent, objectEvent.channel, objectEvent.subscription);
            if (object.type === 'uuid') {
                const { message, channel } = objectEvent, restEvent = __rest(objectEvent, ["message", "channel"]);
                const { event, type } = object, restObject = __rest(object, ["event", "type"]);
                const userEvent = Object.assign(Object.assign({}, restEvent), { spaceId: channel, message: Object.assign(Object.assign({}, restObject), { event: event === 'set' ? 'updated' : 'removed', type: 'user' }) });
                this.listenerManager.announceUser(userEvent);
                this.announce('user', userEvent, userEvent.spaceId, userEvent.subscription);
            }
            else if (object.type === 'channel') {
                const { message, channel } = objectEvent, restEvent = __rest(objectEvent, ["message", "channel"]);
                const { event, type } = object, restObject = __rest(object, ["event", "type"]);
                const spaceEvent = Object.assign(Object.assign({}, restEvent), { spaceId: channel, message: Object.assign(Object.assign({}, restObject), { event: event === 'set' ? 'updated' : 'removed', type: 'space' }) });
                this.listenerManager.announceSpace(spaceEvent);
                this.announce('space', spaceEvent, spaceEvent.spaceId, spaceEvent.subscription);
            }
            else if (object.type === 'membership') {
                const { message, channel } = objectEvent, restEvent = __rest(objectEvent, ["message", "channel"]);
                const { event, data } = object, restObject = __rest(object, ["event", "data"]);
                const { uuid, channel: channelMeta } = data, restData = __rest(data, ["uuid", "channel"]);
                const membershipEvent = Object.assign(Object.assign({}, restEvent), { spaceId: channel, message: Object.assign(Object.assign({}, restObject), { event: event === 'set' ? 'updated' : 'removed', data: Object.assign(Object.assign({}, restData), { user: uuid, space: channelMeta }) }) });
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
    }
    /**
     * Register real-time event listener for specific channels and groups.
     *
     * @param listener - Listener with event callbacks to handle different types of events.
     * @param channels - List of channels for which listener should be registered.
     * @param groups - List of channel groups for which listener should be registered.
     */
    addListener(listener, channels, groups) {
        // Register event-listener listener globally.
        if (!(channels && groups)) {
            this.listenerManager.addListener(listener);
        }
        else {
            channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => {
                if (this.channelListenerMap.has(channel)) {
                    const channelListeners = this.channelListenerMap.get(channel);
                    if (!channelListeners.includes(listener))
                        channelListeners.push(listener);
                }
                else
                    this.channelListenerMap.set(channel, [listener]);
            });
            groups === null || groups === void 0 ? void 0 : groups.forEach((group) => {
                if (this.groupListenerMap.has(group)) {
                    const groupListeners = this.groupListenerMap.get(group);
                    if (!groupListeners.includes(listener))
                        groupListeners.push(listener);
                }
                else
                    this.groupListenerMap.set(group, [listener]);
            });
        }
    }
    /**
     * Remove real-time event listener.
     *
     * @param listener - Event listeners which should be removed.
     * @param channels - List of channels for which listener should be removed.
     * @param groups - List of channel groups for which listener should be removed.
     */
    removeListener(listener, channels, groups) {
        if (!(channels && groups)) {
            this.listenerManager.removeListener(listener);
        }
        else {
            channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => {
                if (this.channelListenerMap.has(channel)) {
                    this.channelListenerMap.set(channel, this.channelListenerMap.get(channel).filter((channelListener) => channelListener !== listener));
                }
            });
            groups === null || groups === void 0 ? void 0 : groups.forEach((group) => {
                if (this.groupListenerMap.has(group)) {
                    this.groupListenerMap.set(group, this.groupListenerMap.get(group).filter((groupListener) => groupListener !== listener));
                }
            });
        }
    }
    /**
     * Clear all real-time event listeners.
     */
    removeAllListeners() {
        this.listenerManager.removeAllListeners();
        this.channelListenerMap.clear();
        this.groupListenerMap.clear();
    }
    /**
     * Announce real-time event to all listeners.
     *
     * @param type - Type of event which should be announced.
     * @param event - Announced real-time event payload.
     * @param channel - Name of the channel for which registered listeners should be notified.
     * @param group - Name of the channel group for which registered listeners should be notified.
     */
    announce(type, event, channel, group) {
        if (event && this.channelListenerMap.has(channel))
            this.channelListenerMap.get(channel).forEach((listener) => {
                const typedListener = listener[type];
                // @ts-expect-error Dynamic events mapping.
                if (typedListener)
                    typedListener(event);
            });
        if (group && this.groupListenerMap.has(group))
            this.groupListenerMap.get(group).forEach((listener) => {
                const typedListener = listener[type];
                // @ts-expect-error Dynamic events mapping.
                if (typedListener)
                    typedListener(event);
            });
    }
}
exports.default = EventEmitter;
