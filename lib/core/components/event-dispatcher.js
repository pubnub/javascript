"use strict";
/**
 * Events dispatcher module.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = void 0;
const subscribe_1 = require("../endpoints/subscribe");
/**
 * Real-time events dispatcher.
 *
 * Class responsible for listener management and invocation.
 *
 * @internal
 */
class EventDispatcher {
    constructor() {
        /**
         * Whether listeners has been added or not.
         */
        this.hasListeners = false;
        /**
         * List of registered event handlers.
         *
         * **Note:** the First element is reserved for type-based event handlers.
         */
        this.listeners = [{ count: -1, listener: {} }];
    }
    /**
     * Set a connection status change event handler.
     *
     * @param listener - Listener function, which will be called each time when the connection status changes.
     */
    set onStatus(listener) {
        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'status' });
    }
    /**
     * Set a new message handler.
     *
     * @param listener - Listener function, which will be called each time when a new message
     * is received from the real-time network.
     */
    set onMessage(listener) {
        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'message' });
    }
    /**
     * Set a new presence events handler.
     *
     * @param listener - Listener function, which will be called each time when a new
     * presence event is received from the real-time network.
     */
    set onPresence(listener) {
        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'presence' });
    }
    /**
     * Set a new signal handler.
     *
     * @param listener - Listener function, which will be called each time when a new signal
     * is received from the real-time network.
     */
    set onSignal(listener) {
        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'signal' });
    }
    /**
     * Set a new app context event handler.
     *
     * @param listener - Listener function, which will be called each time when a new
     * app context event is received from the real-time network.
     */
    set onObjects(listener) {
        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'objects' });
    }
    /**
     * Set a new message reaction event handler.
     *
     * @param listener - Listener function, which will be called each time when a
     * new message reaction event is received from the real-time network.
     */
    set onMessageAction(listener) {
        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'messageAction' });
    }
    /**
     * Set a new file handler.
     *
     * @param listener - Listener function, which will be called each time when a new file
     * is received from the real-time network.
     */
    set onFile(listener) {
        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'file' });
    }
    /**
     * Dispatch received a real-time update.
     *
     * @param event - A real-time event from multiplexed subscription.
     */
    handleEvent(event) {
        if (!this.hasListeners)
            return;
        if (event.type === subscribe_1.PubNubEventType.Message)
            this.announce('message', event.data);
        else if (event.type === subscribe_1.PubNubEventType.Signal)
            this.announce('signal', event.data);
        else if (event.type === subscribe_1.PubNubEventType.Presence)
            this.announce('presence', event.data);
        else if (event.type === subscribe_1.PubNubEventType.AppContext) {
            const { data: objectEvent } = event;
            const { message: object } = objectEvent;
            this.announce('objects', objectEvent);
            if (object.type === 'uuid') {
                const { message, channel } = objectEvent, restEvent = __rest(objectEvent, ["message", "channel"]);
                const { event, type } = object, restObject = __rest(object, ["event", "type"]);
                const userEvent = Object.assign(Object.assign({}, restEvent), { spaceId: channel, message: Object.assign(Object.assign({}, restObject), { event: event === 'set' ? 'updated' : 'removed', type: 'user' }) });
                this.announce('user', userEvent);
            }
            else if (object.type === 'channel') {
                const { message, channel } = objectEvent, restEvent = __rest(objectEvent, ["message", "channel"]);
                const { event, type } = object, restObject = __rest(object, ["event", "type"]);
                const spaceEvent = Object.assign(Object.assign({}, restEvent), { spaceId: channel, message: Object.assign(Object.assign({}, restObject), { event: event === 'set' ? 'updated' : 'removed', type: 'space' }) });
                this.announce('space', spaceEvent);
            }
            else if (object.type === 'membership') {
                const { message, channel } = objectEvent, restEvent = __rest(objectEvent, ["message", "channel"]);
                const { event, data } = object, restObject = __rest(object, ["event", "data"]);
                const { uuid, channel: channelMeta } = data, restData = __rest(data, ["uuid", "channel"]);
                const membershipEvent = Object.assign(Object.assign({}, restEvent), { spaceId: channel, message: Object.assign(Object.assign({}, restObject), { event: event === 'set' ? 'updated' : 'removed', data: Object.assign(Object.assign({}, restData), { user: uuid, space: channelMeta }) }) });
                this.announce('membership', membershipEvent);
            }
        }
        else if (event.type === subscribe_1.PubNubEventType.MessageAction)
            this.announce('messageAction', event.data);
        else if (event.type === subscribe_1.PubNubEventType.Files)
            this.announce('file', event.data);
    }
    /**
     * Dispatch received connection status change.
     *
     * @param status - Status object which should be emitter for all status listeners.
     */
    handleStatus(status) {
        if (!this.hasListeners)
            return;
        this.announce('status', status);
    }
    /**
     * Add events handler.
     *
     * @param listener - Events listener configuration object, which lets specify handlers for multiple types of events.
     */
    addListener(listener) {
        this.updateTypeOrObjectListener({ add: true, listener });
    }
    removeListener(listener) {
        this.updateTypeOrObjectListener({ add: false, listener });
    }
    removeAllListeners() {
        this.listeners = [{ count: -1, listener: {} }];
        this.hasListeners = false;
    }
    updateTypeOrObjectListener(parameters) {
        if (parameters.type) {
            if (typeof parameters.listener === 'function')
                this.listeners[0].listener[parameters.type] = parameters.listener;
            else
                delete this.listeners[0].listener[parameters.type];
        }
        else if (parameters.listener && typeof parameters.listener !== 'function') {
            let listenerObject;
            let listenerExists = false;
            for (listenerObject of this.listeners) {
                if (listenerObject.listener === parameters.listener) {
                    if (parameters.add) {
                        listenerObject.count++;
                        listenerExists = true;
                    }
                    else {
                        listenerObject.count--;
                        if (listenerObject.count === 0)
                            this.listeners.splice(this.listeners.indexOf(listenerObject), 1);
                    }
                    break;
                }
            }
            if (parameters.add && !listenerExists)
                this.listeners.push({ count: 1, listener: parameters.listener });
        }
        this.hasListeners = this.listeners.length > 1 || Object.keys(this.listeners[0]).length > 0;
    }
    /**
     * Announce a real-time event to all listeners.
     *
     * @param type - Type of event which should be announced.
     * @param event - Announced real-time event payload.
     */
    announce(type, event) {
        this.listeners.forEach(({ listener }) => {
            const typedListener = listener[type];
            // @ts-expect-error Dynamic events mapping.
            if (typedListener)
                typedListener(event);
        });
    }
}
exports.EventDispatcher = EventDispatcher;
