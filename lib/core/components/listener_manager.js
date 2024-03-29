"use strict";
/**
 * Events listener manager module.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerManager = void 0;
var categories_1 = __importDefault(require("../constants/categories"));
/**
 * Real-time listeners' manager.
 */
var ListenerManager = /** @class */ (function () {
    function ListenerManager() {
        /**
         * List of registered event listeners.
         */
        this.listeners = [];
        // endregion
    }
    /**
     * Register new real-time events listener.
     *
     * @param listener - Listener with event callbacks to handle different types of events.
     */
    ListenerManager.prototype.addListener = function (listener) {
        if (this.listeners.includes(listener))
            return;
        this.listeners.push(listener);
    };
    /**
     * Remove real-time event listener.
     *
     * @param listener - Event listeners which should be removed.
     */
    ListenerManager.prototype.removeListener = function (listener) {
        this.listeners = this.listeners.filter(function (storedListener) { return storedListener !== listener; });
    };
    /**
     * Clear all real-time event listeners.
     */
    ListenerManager.prototype.removeAllListeners = function () {
        this.listeners = [];
    };
    /**
     * Announce PubNub client status change event.
     *
     * @param status - PubNub client status.
     */
    ListenerManager.prototype.announceStatus = function (status) {
        this.listeners.forEach(function (listener) {
            if (listener.status)
                listener.status(status);
        });
    };
    /**
     * Announce channel presence change event.
     *
     * @param presence - Channel presence change information.
     */
    ListenerManager.prototype.announcePresence = function (presence) {
        this.listeners.forEach(function (listener) {
            if (listener.presence)
                listener.presence(presence);
        });
    };
    /**
     * Announce real-time message event.
     *
     * @param message - Received real-time message.
     */
    ListenerManager.prototype.announceMessage = function (message) {
        this.listeners.forEach(function (listener) {
            if (listener.message)
                listener.message(message);
        });
    };
    /**
     * Announce real-time signal event.
     *
     * @param signal - Received real-time signal.
     */
    ListenerManager.prototype.announceSignal = function (signal) {
        this.listeners.forEach(function (listener) {
            if (listener.signal)
                listener.signal(signal);
        });
    };
    /**
     * Announce message actions change event.
     *
     * @param messageAction - Message action change information.
     */
    ListenerManager.prototype.announceMessageAction = function (messageAction) {
        this.listeners.forEach(function (listener) {
            if (listener.messageAction)
                listener.messageAction(messageAction);
        });
    };
    /**
     * Announce fie share event.
     *
     * @param file - Shared file information.
     */
    ListenerManager.prototype.announceFile = function (file) {
        this.listeners.forEach(function (listener) {
            if (listener.file)
                listener.file(file);
        });
    };
    /**
     * Announce App Context Object change event.
     *
     * @param object - App Context change information.
     */
    ListenerManager.prototype.announceObjects = function (object) {
        this.listeners.forEach(function (listener) {
            if (listener.objects)
                listener.objects(object);
        });
    };
    /**
     * Announce network up status.
     */
    ListenerManager.prototype.announceNetworkUp = function () {
        this.listeners.forEach(function (listener) {
            if (listener.status) {
                listener.status({
                    category: categories_1.default.PNNetworkUpCategory,
                });
            }
        });
    };
    /**
     * Announce network down status.
     */
    ListenerManager.prototype.announceNetworkDown = function () {
        this.listeners.forEach(function (listener) {
            if (listener.status) {
                listener.status({
                    category: categories_1.default.PNNetworkDownCategory,
                });
            }
        });
    };
    // --------------------------------------------------------
    // ---------------------- Deprecated ----------------------
    // --------------------------------------------------------
    // region Deprecated
    /**
     * Announce User App Context Object change event.
     *
     * @param user - User App Context change information.
     *
     * @deprecated Use {@link announceObjects} method instead.
     */
    ListenerManager.prototype.announceUser = function (user) {
        this.listeners.forEach(function (listener) {
            if (listener.user)
                listener.user(user);
        });
    };
    /**
     * Announce Space App Context Object change event.
     *
     * @param space - Space App Context change information.
     *
     * @deprecated Use {@link announceObjects} method instead.
     */
    ListenerManager.prototype.announceSpace = function (space) {
        this.listeners.forEach(function (listener) {
            if (listener.space)
                listener.space(space);
        });
    };
    /**
     * Announce VSP Membership App Context Object change event.
     *
     * @param membership - VSP Membership App Context change information.
     *
     * @deprecated Use {@link announceObjects} method instead.
     */
    ListenerManager.prototype.announceMembership = function (membership) {
        this.listeners.forEach(function (listener) {
            if (listener.membership)
                listener.membership(membership);
        });
    };
    return ListenerManager;
}());
exports.ListenerManager = ListenerManager;
