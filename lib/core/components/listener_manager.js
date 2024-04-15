import StatusCategory from '../constants/categories';
export class ListenerManager {
    constructor() {
        this.listeners = [];
    }
    addListener(listener) {
        if (this.listeners.includes(listener))
            return;
        this.listeners.push(listener);
    }
    removeListener(listener) {
        this.listeners = this.listeners.filter((storedListener) => storedListener !== listener);
    }
    removeAllListeners() {
        this.listeners = [];
    }
    announceStatus(status) {
        this.listeners.forEach((listener) => {
            if (listener.status)
                listener.status(status);
        });
    }
    announcePresence(presence) {
        this.listeners.forEach((listener) => {
            if (listener.presence)
                listener.presence(presence);
        });
    }
    announceMessage(message) {
        this.listeners.forEach((listener) => {
            if (listener.message)
                listener.message(message);
        });
    }
    announceSignal(signal) {
        this.listeners.forEach((listener) => {
            if (listener.signal)
                listener.signal(signal);
        });
    }
    announceMessageAction(messageAction) {
        this.listeners.forEach((listener) => {
            if (listener.messageAction)
                listener.messageAction(messageAction);
        });
    }
    announceFile(file) {
        this.listeners.forEach((listener) => {
            if (listener.file)
                listener.file(file);
        });
    }
    announceObjects(object) {
        this.listeners.forEach((listener) => {
            if (listener.objects)
                listener.objects(object);
        });
    }
    announceNetworkUp() {
        this.listeners.forEach((listener) => {
            if (listener.status) {
                listener.status({
                    category: StatusCategory.PNNetworkUpCategory,
                });
            }
        });
    }
    announceNetworkDown() {
        this.listeners.forEach((listener) => {
            if (listener.status) {
                listener.status({
                    category: StatusCategory.PNNetworkDownCategory,
                });
            }
        });
    }
    announceUser(user) {
        this.listeners.forEach((listener) => {
            if (listener.user)
                listener.user(user);
        });
    }
    announceSpace(space) {
        this.listeners.forEach((listener) => {
            if (listener.space)
                listener.space(space);
        });
    }
    announceMembership(membership) {
        this.listeners.forEach((listener) => {
            if (listener.membership)
                listener.membership(membership);
        });
    }
}
