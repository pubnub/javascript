/**
 * Events listener manager module.
 */
import StatusCategory from '../constants/categories';
/**
 * Real-time listeners' manager.
 */
export class ListenerManager {
    constructor() {
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
    addListener(listener) {
        if (this.listeners.includes(listener))
            return;
        this.listeners.push(listener);
    }
    /**
     * Remove real-time event listener.
     *
     * @param listener - Event listeners which should be removed.
     */
    removeListener(listener) {
        this.listeners = this.listeners.filter((storedListener) => storedListener !== listener);
    }
    /**
     * Clear all real-time event listeners.
     */
    removeAllListeners() {
        this.listeners = [];
    }
    /**
     * Announce PubNub client status change event.
     *
     * @param status - PubNub client status.
     */
    announceStatus(status) {
        this.listeners.forEach((listener) => {
            if (listener.status)
                listener.status(status);
        });
    }
    /**
     * Announce channel presence change event.
     *
     * @param presence - Channel presence change information.
     */
    announcePresence(presence) {
        this.listeners.forEach((listener) => {
            if (listener.presence)
                listener.presence(presence);
        });
    }
    /**
     * Announce real-time message event.
     *
     * @param message - Received real-time message.
     */
    announceMessage(message) {
        this.listeners.forEach((listener) => {
            if (listener.message)
                listener.message(message);
        });
    }
    /**
     * Announce real-time signal event.
     *
     * @param signal - Received real-time signal.
     */
    announceSignal(signal) {
        this.listeners.forEach((listener) => {
            if (listener.signal)
                listener.signal(signal);
        });
    }
    /**
     * Announce message actions change event.
     *
     * @param messageAction - Message action change information.
     */
    announceMessageAction(messageAction) {
        this.listeners.forEach((listener) => {
            if (listener.messageAction)
                listener.messageAction(messageAction);
        });
    }
    /**
     * Announce fie share event.
     *
     * @param file - Shared file information.
     */
    announceFile(file) {
        this.listeners.forEach((listener) => {
            if (listener.file)
                listener.file(file);
        });
    }
    /**
     * Announce App Context Object change event.
     *
     * @param object - App Context change information.
     */
    announceObjects(object) {
        this.listeners.forEach((listener) => {
            if (listener.objects)
                listener.objects(object);
        });
    }
    /**
     * Announce network up status.
     */
    announceNetworkUp() {
        this.listeners.forEach((listener) => {
            if (listener.status) {
                listener.status({
                    category: StatusCategory.PNNetworkUpCategory,
                });
            }
        });
    }
    /**
     * Announce network down status.
     */
    announceNetworkDown() {
        this.listeners.forEach((listener) => {
            if (listener.status) {
                listener.status({
                    category: StatusCategory.PNNetworkDownCategory,
                });
            }
        });
    }
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
    announceUser(user) {
        this.listeners.forEach((listener) => {
            if (listener.user)
                listener.user(user);
        });
    }
    /**
     * Announce Space App Context Object change event.
     *
     * @param space - Space App Context change information.
     *
     * @deprecated Use {@link announceObjects} method instead.
     */
    announceSpace(space) {
        this.listeners.forEach((listener) => {
            if (listener.space)
                listener.space(space);
        });
    }
    /**
     * Announce VSP Membership App Context Object change event.
     *
     * @param membership - VSP Membership App Context change information.
     *
     * @deprecated Use {@link announceObjects} method instead.
     */
    announceMembership(membership) {
        this.listeners.forEach((listener) => {
            if (listener.membership)
                listener.membership(membership);
        });
    }
}
