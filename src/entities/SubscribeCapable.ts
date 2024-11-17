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
   * Real-time events listener object associated with entity subscription object.
   *
   * Listener will be used to notify about updates received from the channels / groups.
   *
   * @internal
   */
  protected abstract listener: Listener;

  /**
   * PubNub instance which will perform subscribe / unsubscribe requests.
   *
   * @internal
   */
  protected abstract pubnub: PubNub<unknown, unknown>;

  /**
   * Start receiving real-time updates.
   *
   * @param subscribeParameters - Additional subscription configuration options which should be used
   * for request.
   */
  subscribe(subscribeParameters?: { timetoken?: string }) {
    const timetoken = subscribeParameters?.timetoken;
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
  set onMessage(onMessageListener: (messageEvent: Subscription.Message) => void) {
    this.listener.message = onMessageListener;
  }

  /**
   * Set new presence events handler.
   *
   * @param onPresenceListener - Listener function, which will be called each time when a new
   * presence event is received from the real-time network.
   */
  set onPresence(onPresenceListener: (presenceEvent: Subscription.Presence) => void) {
    this.listener.presence = onPresenceListener;
  }

  /**
   * Set new signal handler.
   *
   * @param onSignalListener - Listener function, which will be called each time when a new signal
   * is received from the real-time network.
   */
  set onSignal(onSignalListener: (signalEvent: Subscription.Signal) => void) {
    this.listener.signal = onSignalListener;
  }

  /**
   * Set new app context event handler.
   *
   * @param onObjectsListener - Listener function, which will be called each time when a new
   * app context event is received from the real-time network.
   */
  set onObjects(onObjectsListener: (objectsEvent: Subscription.AppContextObject) => void) {
    this.listener.objects = onObjectsListener;
  }

  /**
   * Set new message reaction event handler.
   *
   * @param messageActionEventListener - Listener function, which will be called each time when a
   * new message reaction event is received from the real-time network.
   */
  set onMessageAction(messageActionEventListener: (messageActionEvent: Subscription.MessageAction) => void) {
    this.listener.messageAction = messageActionEventListener;
  }

  /**
   * Set new file handler.
   *
   * @param fileEventListener - Listener function, which will be called each time when a new file
   * is received from the real-time network.
   */
  set onFile(fileEventListener: (fileEvent: Subscription.File) => void) {
    this.listener.file = fileEventListener;
  }

  /**
   * Set events handler.
   *
   * @param listener - Events listener configuration object, which lets specify handlers for multiple
   * types of events.
   */
  addListener(listener: Listener) {
    this.eventEmitter.addListener(listener, this.channelNames, this.groupNames);
  }

  /**
   * Remove events handler.
   *
   * @param listener - Event listener configuration, which should be removed from the list of notified
   * listeners. **Important:** Should be the same object which has been passed to the
   * {@link addListener}.
   */
  removeListener(listener: Listener) {
    this.eventEmitter.removeListener(listener, this.channelNames, this.groupNames);
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
