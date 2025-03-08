import type { PubNubCore as PubNub } from '../core/pubnub-common';
import { Listener } from '../core/components/listener_manager';
import EventEmitter from '../core/components/eventEmitter';
import { SubscribeCapable } from './SubscribeCapable';
import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';

/**
 * Multiple entities subscription set object which can be used to receive and handle real-time
 * updates.
 *
 * Subscription set object represent collection of per-entity subscription objects and allow
 * processing them at once for subscription loop and events handling.
 */
export class SubscriptionSet extends SubscribeCapable {
  /**
   * List of channel names for subscription loop.
   *
   * List of entities' names which can have additional entries depending on from configuration
   * options. Presence events observing adds additional name to be used along with entity name.
   *
   * **Note:** Depending on from the entities' type, they may provide a list of channels which are
   * used to receive real-time updates for it.
   *
   * @internal
   */
  protected channelNames: string[] = [];

  /**
   * List of channel group names for subscription loop.
   *
   * List of entities' names which can have additional entries depending on from configuration
   * options. Presence events observing adds additional name to be used along with entity name.
   *
   * **Note:** Depending on from the entities' type, they may provide a list of channels which are
   * used to receive real-time updates for it.
   *
   * @internal
   */
  protected groupNames: string[] = [];

  /**
   * Entities' subscription object configuration.
   *
   * @internal
   */
  protected options?: SubscriptionOptions;

  /**
   * PubNub instance which will perform subscribe / unsubscribe requests for entities.
   *
   * @internal
   */
  protected pubnub: PubNub<unknown, unknown>;

  /**
   * Event emitter, which will notify listeners about updates received for entities
   * channels / groups.
   *
   * @internal
   */
  protected eventEmitter: EventEmitter;

  /**
   * List of per-entity subscription objects.
   *
   * @internal
   */
  protected subscriptionList: Subscription[] = [];

  /**
   * Real-time events listener object associated with entities' subscription objects.
   *
   * Listener will be used to notify about updates received from the entities' channels / groups.
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
   * Create entities' subscription set object.
   *
   * Subscription set object represent collection of per-entity subscription objects and allow
   * processing them at once for subscription loop and events handling.
   *
   * @param channels - List of channels which should be used in subscription loop.
   * @param channelGroups - List of channel groups which should be used in subscription loop.
   * @param subscriptionOptions - Entities' subscription object configuration.
   * @param eventEmitter - Event emitter, which will notify listeners about updates received for
   * entities' channels / groups.
   * @param pubnub - PubNub instance which will perform subscribe / unsubscribe requests for
   * entities.
   *
   * @returns Ready to use entities' subscription set object.
   *
   * @internal
   */
  constructor({
    channels = [],
    channelGroups = [],
    subscriptionOptions,
    eventEmitter,
    pubnub,
  }: {
    channels?: string[];
    channelGroups?: string[];
    subscriptionOptions?: SubscriptionOptions;
    eventEmitter: EventEmitter;
    pubnub: PubNub<unknown, unknown>;
  }) {
    super();
    this.options = subscriptionOptions;
    this.eventEmitter = eventEmitter;
    this.pubnub = pubnub;
    channels.forEach((c) => {
      const subscription = this.pubnub.channel(c).subscription(this.options);
      this.channelNames = [...this.channelNames, ...subscription.channels];
      this.subscriptionList.push(subscription);
    });
    channelGroups.forEach((cg) => {
      const subscription = this.pubnub.channelGroup(cg).subscription(this.options);
      this.groupNames = [...this.groupNames, ...subscription.channelGroups];
      this.subscriptionList.push(subscription);
    });
    this.listener = {};
    eventEmitter.addListener(this.listener, this.channelNames, this.groupNames);
  }

  /**
   * Add additional entity's subscription to the subscription set.
   *
   * **Important:** Changes will be effective only after {@link SubscribeCapable#subscribe} call or
   * next subscription loop.
   *
   * @param subscription - Other entity's subscription object, which should be added.
   */
  addSubscription(subscription: Subscription) {
    this.subscriptionList.push(subscription);
    this.channelNames = [...this.channelNames, ...subscription.channels];
    this.groupNames = [...this.groupNames, ...subscription.channelGroups];
    this.eventEmitter.addListener(this.listener, subscription.channels, subscription.channelGroups);

    // Subscribe subscription object if subscription set already subscribed.
    console.log(`~~~~> SET SUBSCRIBED? ${this.subscribed ? 'Yes' : 'No'}`);
    if (this.subscribed) {
      subscription.subscribe();
      // @ts-expect-error: Required modification of protected field.
      subscription.subscribedAutomatically = true; // should be placed after .subscribe() call.
    }
  }

  /**
   * Remove entity's subscription object from the set.
   *
   * **Important:** Changes will be effective only after {@link SubscribeCapable#unsubscribe} call or
   * next subscription loop.
   *
   * @param subscription - Other entity's subscription object, which should be removed.
   */
  removeSubscription(subscription: Subscription) {
    const channelsToRemove = subscription.channels;
    const groupsToRemove = subscription.channelGroups;
    this.channelNames = this.channelNames.filter((c) => !channelsToRemove.includes(c));
    this.groupNames = this.groupNames.filter((cg) => !groupsToRemove.includes(cg));
    this.subscriptionList = this.subscriptionList.filter((s) => s !== subscription);
    this.eventEmitter.removeListener(this.listener, channelsToRemove, groupsToRemove);

    // @ts-expect-error: Required access of protected field.
    if (subscription.subscribedAutomatically) subscription.unsubscribe();
  }

  /**
   * Merge with other subscription set object.
   *
   * **Important:** Changes will be effective only after {@link SubscribeCapable#subscribe} call or
   * next subscription loop.
   *
   * @param subscriptionSet - Other entities' subscription set, which should be joined.
   */
  addSubscriptionSet(subscriptionSet: SubscriptionSet) {
    this.subscriptionList = [...this.subscriptionList, ...subscriptionSet.subscriptions];
    this.channelNames = [...this.channelNames, ...subscriptionSet.channels];
    this.groupNames = [...this.groupNames, ...subscriptionSet.channelGroups];
    this.eventEmitter.addListener(this.listener, subscriptionSet.channels, subscriptionSet.channelGroups);

    // Subscribe subscription object if subscription set already subscribed.
    console.log(`~~~~> SET SUBSCRIBED? ${this.subscribed ? 'Yes' : 'No'}`);
    if (this.subscribed) {
      subscriptionSet.subscribe();
      subscriptionSet.subscribedAutomatically = true; // should be placed after .subscribe() call.
    }
  }

  /**
   * Subtract other subscription set object.
   *
   * **Important:** Changes will be effective only after {@link SubscribeCapable#unsubscribe} call or
   * next subscription loop.
   *
   * @param subscriptionSet - Other entities' subscription set, which should be subtracted.
   */
  removeSubscriptionSet(subscriptionSet: SubscriptionSet) {
    const channelsToRemove = subscriptionSet.channels;
    const groupsToRemove = subscriptionSet.channelGroups;
    this.channelNames = this.channelNames.filter((c) => !channelsToRemove.includes(c));
    this.groupNames = this.groupNames.filter((cg) => !groupsToRemove.includes(cg));
    this.subscriptionList = this.subscriptionList.filter((s) => !subscriptionSet.subscriptions.includes(s));
    this.eventEmitter.removeListener(this.listener, channelsToRemove, groupsToRemove);

    if (subscriptionSet.subscribedAutomatically) subscriptionSet.unsubscribe();
  }

  /**
   * Get list of entities' subscription objects registered in subscription set.
   *
   * @returns Entities' subscription objects list.
   */
  get subscriptions(): Subscription[] {
    return this.subscriptionList.slice(0);
  }
}
