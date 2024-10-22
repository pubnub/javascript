import { Listener } from '../core/components/listener_manager';
import * as Subscription from '../core/types/api/subscription';
export declare abstract class SubscribeCapable {
    /**
     * Start receiving real-time updates.
     *
     * @param subscribeParameters - Additional subscription configuration options which should be used
     * for request.
     */
    subscribe(subscribeParameters?: {
        timetoken?: string;
    }): void;
    /**
     * Stop real-time events processing.
     */
    unsubscribe(): void;
    /**
     * Set new message handler.
     *
     * @param onMessageListener - Listener function, which will be called each time when a new message
     * is received from the real-time network.
     */
    set onMessage(onMessageListener: (messageEvent: Subscription.Message) => void);
    /**
     * Set new presence events handler.
     *
     * @param onPresenceListener - Listener function, which will be called each time when a new
     * presence event is received from the real-time network.
     */
    set onPresence(onPresenceListener: (presenceEvent: Subscription.Presence) => void);
    /**
     * Set new signal handler.
     *
     * @param onSignalListener - Listener function, which will be called each time when a new signal
     * is received from the real-time network.
     */
    set onSignal(onSignalListener: (signalEvent: Subscription.Signal) => void);
    /**
     * Set new app context event handler.
     *
     * @param onObjectsListener - Listener function, which will be called each time when a new
     * app context event is received from the real-time network.
     */
    set onObjects(onObjectsListener: (objectsEvent: Subscription.AppContextObject) => void);
    /**
     * Set new message reaction event handler.
     *
     * @param messageActionEventListener - Listener function, which will be called each time when a
     * new message reaction event is received from the real-time network.
     */
    set onMessageAction(messageActionEventListener: (messageActionEvent: Subscription.MessageAction) => void);
    /**
     * Set new file handler.
     *
     * @param fileEventListener - Listener function, which will be called each time when a new file
     * is received from the real-time network.
     */
    set onFile(fileEventListener: (fileEvent: Subscription.File) => void);
    /**
     * Set events handler.
     *
     * @param listener - Events listener configuration object, which lets specify handlers for multiple
     * types of events.
     */
    addListener(listener: Listener): void;
    /**
     * Remove events handler.
     *
     * @param listener - Event listener configuration, which should be removed from the list of notified
     * listeners. **Important:** Should be the same object which has been passed to the
     * {@link addListener}.
     */
    removeListener(listener: Listener): void;
    /**
     * Get list of channels which is used for subscription.
     *
     * @returns List of channel names.
     */
    get channels(): string[];
    /**
     * Get list of channel groups which is used for subscription.
     *
     * @returns List of channel group names.
     */
    get channelGroups(): string[];
}
