"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerManager = void 0;
const categories_1 = __importDefault(require("../constants/categories"));
class ListenerManager {
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
                    category: categories_1.default.PNNetworkUpCategory,
                });
            }
        });
    }
    announceNetworkDown() {
        this.listeners.forEach((listener) => {
            if (listener.status) {
                listener.status({
                    category: categories_1.default.PNNetworkDownCategory,
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
exports.ListenerManager = ListenerManager;
