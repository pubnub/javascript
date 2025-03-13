import type { PubNubCore as PubNub } from '../core/pubnub-common';
import { Listener } from '../core/components/listener_manager';
import * as Subscription from '../core/types/api/subscription';
import EventEmitter from '../core/components/eventEmitter';
import { SubscriptionOptions } from './commonTypes';

export abstract class SubscribeCapable {
  /**
   * List of channel names for subscription loop.
   *
   * @internal
   */
  protected abstract channelNames: string[];

  /**
   * List of channel group names for subscription loop.
   *
   * @internal
   */
  protected abstract groupNames: string[];

  /**
   * Subscribable object configuration.
   *
   * @internal
   */
  protected abstract options?: SubscriptionOptions;

  /**
   * Event emitter, which will notify listeners about updates received for channels / groups.
   *
   * @internal
   */
  protected abstract eventEmitter: EventEmitter;

  /**
   * Real-time events listener object associated with channels and groups of subscription object.
   *
   * Listener will be used to notify about updates received from the channels / groups.
   *
   * **Note:** this is different from {@link typeBasedListener} because it is passed as aggregated
   * listener using {@link addListener} and {@link removeListener}. This listener will be passed to
   * the added {@link Subscription} and {@link SubscriptionSet} if they will be added into already
   * subscribed object.
   *
   * @internal
   */
  protected abstract aggregatedListener?: Listener;

  /**
   * Unique identifier of aggregated listener registered for subscribe capable object.
   *
   * @internal.
   */
  protected abstract aggregatedListenerId?: string;

  /**
   * Real-time events listener object associated with entity subscription object.
   *
   * Listener will be used to notify about updates received from the channels / groups.
   *
   * @internal
   */
  protected abstract typeBasedListener: Listener;

  /**
   * PubNub instance which will perform subscribe / unsubscribe requests.
   *
   * @internal
   */
  protected abstract pubnub: PubNub<unknown, unknown>;

  /**
   * Whether subscribed ({@link SubscribeCapable#subscribe}) automatically during subscription
   * object / sets manipulation or not.
   *
   * @internal
   */
  protected abstract subscribedAutomatically: boolean;

  /**
   * Whether subscribable object subscribed ({@link SubscribeCapable#subscribe}) or not.
   *
   * @internal
   */
  protected abstract subscribed: boolean;

  /**
   * Start receiving real-time updates.
   *
   * @param subscribeParameters - Additional subscription configuration options which should be used
   * for request.
   */
  subscribe(subscribeParameters?: { timetoken?: string }) {
    const timetoken = subscribeParameters?.timetoken;
    this.pubnub.registerSubscribeCapable(this);
    this.subscribedAutomatically = false;
    this.subscribed = true;

    this.pubnub.subscribe({
      channels: this.channelNames,
      channelGroups: this.groupNames,
      ...(timetoken !== null && timetoken !== '' && { timetoken: timetoken }),
    });
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

    if (filteredChannels.length === 0 && filteredChannelGroups.length === 0) return;

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
  set onMessage(onMessageListener: (messageEvent: Subscription.Message) => void) {
    this.typeBasedListener.message = onMessageListener;
  }

  /**
   * Set new presence events handler.
   *
   * @param onPresenceListener - Listener function, which will be called each time when a new
   * presence event is received from the real-time network.
   */
  set onPresence(onPresenceListener: (presenceEvent: Subscription.Presence) => void) {
    this.typeBasedListener.presence = onPresenceListener;
  }

  /**
   * Set new signal handler.
   *
   * @param onSignalListener - Listener function, which will be called each time when a new signal
   * is received from the real-time network.
   */
  set onSignal(onSignalListener: (signalEvent: Subscription.Signal) => void) {
    this.typeBasedListener.signal = onSignalListener;
  }

  /**
   * Set new app context event handler.
   *
   * @param onObjectsListener - Listener function, which will be called each time when a new
   * app context event is received from the real-time network.
   */
  set onObjects(onObjectsListener: (objectsEvent: Subscription.AppContextObject) => void) {
    this.typeBasedListener.objects = onObjectsListener;
  }

  /**
   * Set new message reaction event handler.
   *
   * @param messageActionEventListener - Listener function, which will be called each time when a
   * new message reaction event is received from the real-time network.
   */
  set onMessageAction(messageActionEventListener: (messageActionEvent: Subscription.MessageAction) => void) {
    this.typeBasedListener.messageAction = messageActionEventListener;
  }

  /**
   * Set new file handler.
   *
   * @param fileEventListener - Listener function, which will be called each time when a new file
   * is received from the real-time network.
   */
  set onFile(fileEventListener: (fileEvent: Subscription.File) => void) {
    this.typeBasedListener.file = fileEventListener;
  }

  /**
   * Set events handler.
   *
   * @param listener - Events listener configuration object, which lets specify handlers for multiple
   * types of events.
   */
  addListener(listener: Listener) {
    if (this.aggregatedListener && this.aggregatedListener !== listener) this.removeListener(this.aggregatedListener);
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
  removeListener(listener: Listener) {
    if (!this.aggregatedListener) return;

    this.eventEmitter.removeListener(listener, this.aggregatedListenerId, this.channelNames, this.groupNames);
    this.aggregatedListenerId = undefined;
    this.aggregatedListener = undefined;
  }

  /**
   * Get list of channels which is used for subscription.
   *
   * @returns List of channel names.
   */
  get channels(): string[] {
    return this.channelNames.slice(0);
  }

  /**
   * Get list of channel groups which is used for subscription.
   *
   * @returns List of channel group names.
   */
  get channelGroups(): string[] {
    return this.groupNames.slice(0);
  }
}
