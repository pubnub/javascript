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
        this.pubnub.registerSubscribeCapable(this);
        this.subscribedAutomatically = false;
        this.subscribed = true;
        this.pubnub.subscribe(Object.assign({ channels: this.channelNames, channelGroups: this.groupNames }, (timetoken !== null && timetoken !== '' && { timetoken: timetoken })));
    }
    /**
     * Stop real-time events processing.
     */
    unsubscribe() {
        this.pubnub.unregisterSubscribeCapable(this);
        this.subscribedAutomatically = false;
        this.subscribed = false;
        const { channels, channelGroups } = this.pubnub.getSubscribeCapableEntities();
        // Identify channels and groups from which PubNub client can safely unsubscribe.
        const filteredChannelGroups = this.groupNames.filter((cg) => !channelGroups.includes(cg));
        const filteredChannels = this.channelNames.filter((ch) => !channels.includes(ch));
        if (filteredChannels.length === 0 && filteredChannelGroups.length === 0)
            return;
        this.pubnub.unsubscribe({
            channels: filteredChannels,
            channelGroups: filteredChannelGroups,
        });
    }
    /**
     * Set new message handler.
     *
     * @param onMessageListener - Listener function, which will be called each time when a new message
     * is received from the real-time network.
     */
    set onMessage(onMessageListener) {
        this.typeBasedListener.message = onMessageListener;
    }
    /**
     * Set new presence events handler.
     *
     * @param onPresenceListener - Listener function, which will be called each time when a new
     * presence event is received from the real-time network.
     */
    set onPresence(onPresenceListener) {
        this.typeBasedListener.presence = onPresenceListener;
    }
    /**
     * Set new signal handler.
     *
     * @param onSignalListener - Listener function, which will be called each time when a new signal
     * is received from the real-time network.
     */
    set onSignal(onSignalListener) {
        this.typeBasedListener.signal = onSignalListener;
    }
    /**
     * Set new app context event handler.
     *
     * @param onObjectsListener - Listener function, which will be called each time when a new
     * app context event is received from the real-time network.
     */
    set onObjects(onObjectsListener) {
        this.typeBasedListener.objects = onObjectsListener;
    }
    /**
     * Set new message reaction event handler.
     *
     * @param messageActionEventListener - Listener function, which will be called each time when a
     * new message reaction event is received from the real-time network.
     */
    set onMessageAction(messageActionEventListener) {
        this.typeBasedListener.messageAction = messageActionEventListener;
    }
    /**
     * Set new file handler.
     *
     * @param fileEventListener - Listener function, which will be called each time when a new file
     * is received from the real-time network.
     */
    set onFile(fileEventListener) {
        this.typeBasedListener.file = fileEventListener;
    }
    /**
     * Set events handler.
     *
     * @param listener - Events listener configuration object, which lets specify handlers for multiple
     * types of events.
     */
    addListener(listener) {
        if (this.aggregatedListener && this.aggregatedListener !== listener)
            this.removeListener(this.aggregatedListener);
        this.aggregatedListenerId = this.eventEmitter.addListener(listener, this.channelNames, this.groupNames);
        this.aggregatedListener = listener;
    }
    /**
     * Remove events handler.
     *
     * @param listener - Event listener configuration, which should be removed from the list of notified
     * listeners. **Important:** Should be the same object which has been passed to the
     * {@link addListener}.
     */
    removeListener(listener) {
        if (!this.aggregatedListener)
            return;
        this.eventEmitter.removeListener(listener, this.aggregatedListenerId, this.channelNames, this.groupNames);
        this.aggregatedListenerId = undefined;
        this.aggregatedListener = undefined;
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
