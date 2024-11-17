"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribeCapable = void 0;
class SubscribeCapable {
    /**
     * Start receiving real-time updates.
     *
     * @param subscribeParameters - Additional subscription configuration options which should be used
     * for request.
     */
    subscribe(subscribeParameters) {
        const timetoken = subscribeParameters === null || subscribeParameters === void 0 ? void 0 : subscribeParameters.timetoken;
        this.pubnub.subscribe(Object.assign({ channels: this.channelNames, channelGroups: this.groupNames }, (timetoken !== null && timetoken !== '' && { timetoken: timetoken })));
    }
    /**
     * Stop real-time events processing.
     */
    unsubscribe() {
        this.pubnub.unsubscribe({
            channels: this.channelNames,
            channelGroups: this.groupNames,
        });
    }
    /**
     * Set new message handler.
     *
     * @param onMessageListener - Listener function, which will be called each time when a new message
     * is received from the real-time network.
     */
    set onMessage(onMessageListener) {
        this.listener.message = onMessageListener;
    }
    /**
     * Set new presence events handler.
     *
     * @param onPresenceListener - Listener function, which will be called each time when a new
     * presence event is received from the real-time network.
     */
    set onPresence(onPresenceListener) {
        this.listener.presence = onPresenceListener;
    }
    /**
     * Set new signal handler.
     *
     * @param onSignalListener - Listener function, which will be called each time when a new signal
     * is received from the real-time network.
     */
    set onSignal(onSignalListener) {
        this.listener.signal = onSignalListener;
    }
    /**
     * Set new app context event handler.
     *
     * @param onObjectsListener - Listener function, which will be called each time when a new
     * app context event is received from the real-time network.
     */
    set onObjects(onObjectsListener) {
        this.listener.objects = onObjectsListener;
    }
    /**
     * Set new message reaction event handler.
     *
     * @param messageActionEventListener - Listener function, which will be called each time when a
     * new message reaction event is received from the real-time network.
     */
    set onMessageAction(messageActionEventListener) {
        this.listener.messageAction = messageActionEventListener;
    }
    /**
     * Set new file handler.
     *
     * @param fileEventListener - Listener function, which will be called each time when a new file
     * is received from the real-time network.
     */
    set onFile(fileEventListener) {
        this.listener.file = fileEventListener;
    }
    /**
     * Set events handler.
     *
     * @param listener - Events listener configuration object, which lets specify handlers for multiple
     * types of events.
     */
    addListener(listener) {
        this.eventEmitter.addListener(listener, this.channelNames, this.groupNames);
    }
    /**
     * Remove events handler.
     *
     * @param listener - Event listener configuration, which should be removed from the list of notified
     * listeners. **Important:** Should be the same object which has been passed to the
     * {@link addListener}.
     */
    removeListener(listener) {
        this.eventEmitter.removeListener(listener, this.channelNames, this.groupNames);
    }
    /**
     * Get list of channels which is used for subscription.
     *
     * @returns List of channel names.
     */
    get channels() {
        return this.channelNames.slice(0);
    }
    /**
     * Get list of channel groups which is used for subscription.
     *
     * @returns List of channel group names.
     */
    get channelGroups() {
        return this.groupNames.slice(0);
    }
}
exports.SubscribeCapable = SubscribeCapable;
