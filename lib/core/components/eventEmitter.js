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
import { PubNubEventType } from '../endpoints/subscribe';
export default class EventEmitter {
    constructor(listenerManager) {
        this.listenerManager = listenerManager;
        this.channelListenerMap = new Map();
        this.groupListenerMap = new Map();
    }
    emitEvent(event) {
        if (event.type === PubNubEventType.Message) {
            this.listenerManager.announceMessage(event.data);
            this.announce('message', event.data, event.data.channel, event.data.subscription);
        }
        else if (event.type === PubNubEventType.Signal) {
            this.listenerManager.announceSignal(event.data);
            this.announce('signal', event.data, event.data.channel, event.data.subscription);
        }
        else if (event.type === PubNubEventType.Presence) {
            this.listenerManager.announcePresence(event.data);
            this.announce('presence', event.data, event.data.channel, event.data.subscription);
        }
        else if (event.type === PubNubEventType.AppContext) {
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
        else if (event.type === PubNubEventType.MessageAction) {
            this.listenerManager.announceMessageAction(event.data);
            this.announce('messageAction', event.data, event.data.channel, event.data.subscription);
        }
        else if (event.type === PubNubEventType.Files) {
            this.listenerManager.announceFile(event.data);
            this.announce('file', event.data, event.data.channel, event.data.subscription);
        }
    }
    addListener(listener, channels, groups) {
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
    removeAllListeners() {
        this.listenerManager.removeAllListeners();
        this.channelListenerMap.clear();
        this.groupListenerMap.clear();
    }
    announce(type, event, channel, group) {
        if (event && this.channelListenerMap.has(channel))
            this.channelListenerMap.get(channel).forEach((listener) => {
                const typedListener = listener[type];
                if (typedListener)
                    typedListener(event);
            });
        if (group && this.groupListenerMap.has(group))
            this.groupListenerMap.get(group).forEach((listener) => {
                const typedListener = listener[type];
                if (typedListener)
                    typedListener(event);
            });
    }
}
