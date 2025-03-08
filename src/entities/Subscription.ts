import type { PubNubCore as PubNub } from '../core/pubnub-common';
import { Listener } from '../core/components/listener_manager';
import EventEmitter from '../core/components/eventEmitter';
import { SubscribeCapable } from './SubscribeCapable';
import { SubscriptionOptions } from './commonTypes';
import { SubscriptionSet } from './SubscriptionSet';

/**
 * Single-entity subscription object which can be used to receive and handle real-time updates.
 */
export class Subscription extends SubscribeCapable {
  /**
   * List of channel names for subscription loop.
   *
   * Entity may have few because of subscription configuration options. Presence events observing
   * adds additional name to be used along with entity name.
   *
   * **Note:** Depending on from the entity type, it may provide a list of channels which are used
   * to receive real-time updates for it.
   *
   * @internal
   */
  protected channelNames: string[] = [];

  /**
   * List of channel group names for subscription loop.
   *
   * Entity may have few because of subscription configuration options. Presence events observing
   * adds additional name to be used along with entity name.
   *
   * **Note:** Depending on from the entity type, it may provide a list of channel groups which is
   * sed to receive real-time updates for it.
   *
   * @internal
   */
  protected groupNames: string[] = [];

  /**
   * Per-entity subscription object configuration.
   *
   * @internal
   */
  protected options?: SubscriptionOptions;

  /**
   * PubNub instance which will perform subscribe / unsubscribe requests for entity.
   *
   * @internal
   */
  protected pubnub: PubNub<unknown, unknown>;

  /**
   * Event emitter, which will notify listeners about updates received for entity channels / groups.
   *
   * @internal
   */
  protected eventEmitter: EventEmitter;

  /**
   * Real-time events listener object associated with entity subscription object.
   *
   * Listener will be used to notify about updates received from the entity channels / groups.
   *
   * @internal
   */
  protected listener: Listener;

  /**
   * Whether subscribed ({@link SubscribeCapable#subscribe}) automatically during subscription
   * object / sets manipulation or not.
   *
   * @internal
   */
  protected subscribedAutomatically: boolean = false;

  /**
   * Whether subscribable object subscribed ({@link SubscribeCapable#subscribe}) or not.
   *
   * @internal
   */
  protected subscribed: boolean = false;

  /**
   * Create entity's subscription object.
   *
   * @param channels - List of channels which should be used in subscription loop.
   * @param channelGroups - List of channel groups which should be used in subscription loop.
   * @param subscriptionOptions - Per-entity subscription object configuration.
   * @param eventEmitter - Event emitter, which will notify listeners about updates received for
   * entity channels / groups.
   * @param pubnub - PubNub instance which will perform subscribe / unsubscribe requests for entity.
   *
   * @returns Ready to use entity's subscription object.
   *
   * @internal
   */
  constructor({
    channels,
    channelGroups,
    subscriptionOptions,
    eventEmitter,
    pubnub,
  }: {
    channels: string[];
    channelGroups: string[];
    subscriptionOptions?: SubscriptionOptions;
    eventEmitter: EventEmitter;
    pubnub: PubNub<unknown, unknown>;
  }) {
    super();
    this.channelNames = channels;
    this.groupNames = channelGroups;
    this.options = subscriptionOptions;
    this.pubnub = pubnub;
    this.eventEmitter = eventEmitter;
    this.listener = {};
    eventEmitter.addListener(this.listener, this.channelNames, this.groupNames);
  }

  /**
   * Merge entities' subscription objects into subscription set.
   *
   * @param subscription - Other entity's subscription object to be merged with receiver.
   * @return Subscription set which contains both receiver and other entities' subscription objects.
   */
  addSubscription(subscription: Subscription) {
    const subscriptionSet = new SubscriptionSet({
      channels: [...this.channelNames, ...subscription.channels],
      channelGroups: [...this.groupNames, ...subscription.channelGroups],
      subscriptionOptions: { ...this.options, ...subscription?.options },
      eventEmitter: this.eventEmitter,
      pubnub: this.pubnub,
    });

    // Subscribe whole subscription set if it has been created with receiving subscription object
    // which is already subscribed.
    console.log(`~~~~> SUBSCRIPTION SUBSCRIBED? ${this.subscribed ? 'Yes' : 'No'}`);
    if (this.subscribed) {
      subscription.subscribe();
      subscription.subscribedAutomatically = true; // should be placed after .subscribe() call.

      this.pubnub.registerSubscribeCapable(subscriptionSet);
      // @ts-expect-error: Required modification of protected field.
      subscriptionSet.subscribed = true;
    }

    return subscriptionSet;
  }
}
