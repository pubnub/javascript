import { SubscriptionCapable, SubscriptionOptions } from './interfaces/subscription-capable';
import { SubscriptionBase, SubscriptionBaseState } from './subscription-base';
import { EventHandleCapable } from './interfaces/event-handle-capable';
import { Subscription as SubscriptionObject } from './subscription';
import type { PubNubCore as PubNub } from '../core/pubnub-common';
import { EntityInterface } from './interfaces/entity-interface';
import * as Subscription from '../core/types/api/subscription';

/**
 * {@link SubscriptionSet} state object.
 *
 * State object used across multiple {@link SubscriptionSet} object clones.
 *
 * @internal
 */
class SubscriptionSetState extends SubscriptionBaseState {
  /**
   * Subscription-capable entities' subscription objects.
   */
  readonly subscriptions: SubscriptionObject[];

  /**
   * Create a subscription state object.
   *
   * @param parameters - State configuration options
   * @param parameters.client - PubNub client which will work with a subscription object.
   * @param parameters.subscriptions - List of subscriptions managed by set.
   * @param [parameters.options] - Subscription behavior options.
   */
  constructor(parameters: {
    client: PubNub<unknown, unknown>;
    subscriptions: SubscriptionObject[];
    options?: SubscriptionOptions;
  }) {
    const subscriptionInput = new Subscription.SubscriptionInput({});
    parameters.subscriptions.forEach((subscription) => subscriptionInput.add(subscription.state.subscriptionInput));

    super(parameters.client, subscriptionInput, parameters.options, parameters.client.subscriptionTimetoken);
    this.subscriptions = parameters.subscriptions;
  }

  /**
   * Add a single subscription object to the set.
   *
   * @param subscription - Another entity's subscription object, which should be added.
   */
  addSubscription(subscription: SubscriptionObject) {
    if (this.subscriptions.includes(subscription)) return;

    subscription.state.addParentState(this);
    this.subscriptions.push(subscription);

    // Update subscription input.
    this.subscriptionInput.add(subscription.state.subscriptionInput);
  }

  /**
   * Remove a single subscription object from the set.
   *
   * @param subscription - Another entity's subscription object, which should be removed.
   * @param clone - Whether a target subscription is a clone.
   */
  removeSubscription(subscription: SubscriptionObject, clone: boolean) {
    const index = this.subscriptions.indexOf(subscription);
    if (index === -1) return;

    this.subscriptions.splice(index, 1);
    if (!clone) subscription.state.removeParentState(this);

    // Update subscription input.
    this.subscriptionInput.remove(subscription.state.subscriptionInput);
  }

  /**
   * Remove any registered subscription object.
   */
  removeAllSubscriptions() {
    this.subscriptions.forEach((subscription) => subscription.state.removeParentState(this));
    this.subscriptions.splice(0, this.subscriptions.length);
    this.subscriptionInput.removeAll();
  }
}

/**
 * Multiple entities subscription set object which can be used to receive and handle real-time
 * updates.
 *
 * Subscription set object represents a collection of per-entity subscription objects and allows
 * processing them at once for subscription loop and events handling.
 */
export class SubscriptionSet extends SubscriptionBase {
  /**
   * Create entities' subscription set object.
   *
   * Subscription set object represents a collection of per-entity subscription objects and allows
   * processing them at once for subscription loop and events handling.
   *
   * @param parameters - Subscription set object configuration.
   *
   * @returns Ready to use entities' subscription set object.
   *
   * @internal
   */
  constructor(
    parameters:
      | {
          client: PubNub<unknown, unknown>;
          subscriptions?: SubscriptionObject[];
          entities?: (EntityInterface & SubscriptionCapable)[];
          options?: SubscriptionOptions;
        }
      | { state: SubscriptionSetState },
  ) {
    let state: SubscriptionSetState;

    if ('client' in parameters) {
      let subscriptions: SubscriptionObject[] = [];

      if (!parameters.subscriptions && parameters.entities) {
        parameters.entities.forEach((entity) =>
          subscriptions.push(entity.subscription(parameters.options) as SubscriptionObject),
        );
      } else if (parameters.subscriptions) subscriptions = parameters.subscriptions;

      state = new SubscriptionSetState({ client: parameters.client, subscriptions, options: parameters.options });
      subscriptions.forEach((subscription) => subscription.state.addParentState(state));

      state.client.logger.debug('SubscriptionSet', () => ({
        messageType: 'object',
        details: 'Create subscription set with parameters:',
        message: { subscriptions: state.subscriptions, ...(parameters.options ? parameters.options : {}) },
      }));
    } else {
      state = parameters.state;
      state.client.logger.debug('SubscriptionSet', 'Create subscription set clone');
    }

    super(state, 'SubscriptionSet');

    this.state.storeClone(this.id, this);

    // Update a parent sets list for original set subscriptions.
    state.subscriptions.forEach((subscription) => subscription.addParentSet(this));
  }

  /**
   * Get a {@link SubscriptionSet} object state.
   *
   * @returns: {@link SubscriptionSet} object state.
   *
   * @internal
   */
  override get state(): SubscriptionSetState {
    return super.state as SubscriptionSetState;
  }

  /**
   * Get a list of entities' subscription objects registered in a subscription set.
   *
   * @returns Entities' subscription objects list.
   */
  get subscriptions(): SubscriptionObject[] {
    return this.state.subscriptions.slice(0);
  }

  // --------------------------------------------------------
  // -------------------- Event handler ---------------------
  // --------------------------------------------------------
  // region Event handler

  /**
   * Dispatch received a real-time update.
   *
   * @param cursor - A time cursor for the next portion of events.
   * @param event - A real-time event from multiplexed subscription.
   *
   * @return `true` if receiver has consumed event.
   *
   * @internal
   */
  override handleEvent(
    cursor: Subscription.SubscriptionCursor,
    event: Subscription.SubscriptionResponse['messages'][0],
  ): void {
    // Check whether an event is not designated for this subscription set.
    if (!this.state.subscriptionInput.contains(event.data.subscription ?? event.data.channel)) return;

    // Check whether `event` can be processed or not.
    if (!this.state._isSubscribed) {
      this.state.client.logger.trace(
        this.subscriptionType,
        `Subscription set ${this.id} is not subscribed. Ignoring event.`,
      );
      return;
    }
    super.handleEvent(cursor, event);

    if (this.state.subscriptions.length > 0) {
      this.state.client.logger.trace(
        this.subscriptionType,
        `Notify ${this.id} subscription set subscriptions (count: ${
          this.state.subscriptions.length
        }) about received event.`,
      );
    }

    this.state.subscriptions.forEach((subscription) => subscription.handleEvent(cursor, event));
  }
  // endregion

  /**
   User-provided subscription input associated with this {@link SubscriptionSet} object.
   *
   * @param forUnsubscribe - Whether list subscription input created for unsubscription (means entity should be free).
   *
   * @returns Subscription input object.
   *
   * @internal
   */
  override subscriptionInput(forUnsubscribe: boolean = false) {
    let subscriptionInput = this.state.subscriptionInput;
    this.state.subscriptions.forEach((subscription) => {
      if (forUnsubscribe && subscription.state.entity.subscriptionsCount > 0)
        subscriptionInput = subscriptionInput.without(subscription.state.subscriptionInput);
    });

    return subscriptionInput;
  }

  /**
   * Make a bare copy of the {@link SubscriptionSet} object.
   *
   * Copy won't have any type-specific listeners or added listener objects but will have the same internal state as
   * the source object.
   *
   * @returns Bare copy of a {@link SubscriptionSet} object.
   */
  override cloneEmpty(): SubscriptionSet {
    return new SubscriptionSet({ state: this.state });
  }

  /**
   * Graceful {@link SubscriptionSet} destruction.
   *
   * This is an instance destructor, which will properly deinitialize it:
   * - remove and unset all listeners,
   * - try to unsubscribe (if subscribed and there are no more instances interested in the same data stream).
   *
   * **Note:** Disposed instance won't call the dispatcher to deliver updates to the listeners.
   */
  override dispose(): void {
    const isLastClone = this.state.isLastClone;

    this.state.subscriptions.forEach((subscription) => {
      subscription.removeParentSet(this);
      if (isLastClone) subscription.state.removeParentState(this.state);
    });

    super.dispose();
  }

  /**
   * Invalidate {@link SubscriptionSet} object.
   *
   * Clean up resources used by a subscription object. All {@link SubscriptionObject subscription} objects will be
   * removed.
   *
   * **Important:** This method is used only when a global subscription set is used (backward compatibility).
   *
   * **Note:** An invalidated instance won't call the dispatcher to deliver updates to the listeners.
   *
   * @param forDestroy - Whether subscription object invalidated as part of PubNub client destroy process or not.
   *
   * @internal
   */
  override invalidate(forDestroy: boolean = false) {
    const subscriptions = forDestroy ? this.state.subscriptions.slice(0) : this.state.subscriptions;

    subscriptions.forEach((subscription) => {
      if (forDestroy) {
        subscription.state.entity.decreaseSubscriptionCount(this.state.id);
        subscription.removeParentSet(this);
      }

      subscription.invalidate(forDestroy);
    });

    if (forDestroy) this.state.removeAllSubscriptions();

    super.invalidate();
  }

  /**
   * Add an entity's subscription to the subscription set.
   *
   * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
   *
   * @param subscription - Another entity's subscription object, which should be added.
   */
  addSubscription(subscription: SubscriptionObject) {
    this.addSubscriptions([subscription]);
  }

  /**
   * Add an entity's subscriptions to the subscription set.
   *
   * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
   *
   * @param subscriptions - List of entity's subscription objects, which should be added.
   */
  addSubscriptions(subscriptions: SubscriptionObject[]) {
    const inactiveSubscriptions: SubscriptionObject[] = [];
    const activeSubscriptions: SubscriptionObject[] = [];

    this.state.client.logger.debug(this.subscriptionType, () => {
      const ignoredSubscriptions: SubscriptionObject[] = [];
      const subscriptionsToAdd: SubscriptionObject[] = [];

      subscriptions.forEach((subscription) => {
        if (!this.state.subscriptions.includes(subscription)) subscriptionsToAdd.push(subscription);
        else ignoredSubscriptions.push(subscription);
      });

      return {
        messageType: 'object',
        details: `Add subscriptions to ${this.id} (subscriptions count: ${
          this.state.subscriptions.length + subscriptionsToAdd.length
        }):`,
        message: { addedSubscriptions: subscriptionsToAdd, ignoredSubscriptions },
      };
    });

    subscriptions
      .filter((subscription) => !this.state.subscriptions.includes(subscription))
      .forEach((subscription) => {
        if (subscription.state.isSubscribed) activeSubscriptions.push(subscription);
        else inactiveSubscriptions.push(subscription);

        subscription.addParentSet(this);
        this.state.addSubscription(subscription);
      });

    // Check whether there are any subscriptions for which the subscription loop should be changed or not.
    if ((activeSubscriptions.length === 0 && inactiveSubscriptions.length === 0) || !this.state.isSubscribed) return;

    activeSubscriptions.forEach(({ state }) => state.entity.increaseSubscriptionCount(this.state.id));
    if (inactiveSubscriptions.length > 0)
      this.updateSubscription({ subscribing: true, subscriptions: inactiveSubscriptions });
  }

  /**
   * Remove an entity's subscription object from the set.
   *
   * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
   *
   * @param subscription - Another entity's subscription object, which should be removed.
   */
  removeSubscription(subscription: SubscriptionObject) {
    this.removeSubscriptions([subscription]);
  }

  /**
   * Remove an entity's subscription objects from the set.
   *
   * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
   *
   * @param subscriptions - List entity's subscription objects, which should be removed.
   */
  removeSubscriptions(subscriptions: SubscriptionObject[]) {
    const activeSubscriptions: SubscriptionObject[] = [];

    this.state.client.logger.debug(this.subscriptionType, () => {
      const ignoredSubscriptions: SubscriptionObject[] = [];
      const subscriptionsToRemove: SubscriptionObject[] = [];

      subscriptions.forEach((subscription) => {
        if (this.state.subscriptions.includes(subscription)) subscriptionsToRemove.push(subscription);
        else ignoredSubscriptions.push(subscription);
      });

      return {
        messageType: 'object',
        details: `Remove subscriptions from ${this.id} (subscriptions count: ${this.state.subscriptions.length}):`,
        message: { removedSubscriptions: subscriptionsToRemove, ignoredSubscriptions },
      };
    });

    subscriptions
      .filter((subscription) => this.state.subscriptions.includes(subscription))
      .forEach((subscription) => {
        if (subscription.state.isSubscribed) activeSubscriptions.push(subscription);

        subscription.removeParentSet(this);
        this.state.removeSubscription(subscription, subscription.parentSetsCount > 1);
      });

    // Check whether there are any subscriptions for which the subscription loop should be changed or not.
    if (activeSubscriptions.length === 0 || !this.state.isSubscribed) return;

    this.updateSubscription({ subscribing: false, subscriptions: activeSubscriptions });
  }

  /**
   * Merge with another {@link SubscriptionSet} object.
   *
   * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
   *
   * @param subscriptionSet - Other entities' subscription set, which should be joined.
   */
  addSubscriptionSet(subscriptionSet: SubscriptionSet) {
    this.addSubscriptions(subscriptionSet.subscriptions);
  }

  /**
   * Subtract another {@link SubscriptionSet} object.
   *
   * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
   *
   * @param subscriptionSet - Other entities' subscription set, which should be subtracted.
   */
  removeSubscriptionSet(subscriptionSet: SubscriptionSet) {
    this.removeSubscriptions(subscriptionSet.subscriptions);
  }

  /**
   * Register {@link SubscriptionSet} object for real-time events' retrieval.
   *
   * @param parameters - Object registration parameters.
   * @param [parameters.cursor] - Subscription real-time events catch-up cursor.
   * @param [parameters.subscriptions] - List of subscription objects which should be registered (in case of partial
   * modification).
   *
   * @internal
   */
  protected register(parameters: { cursor?: Subscription.SubscriptionCursor; subscriptions?: EventHandleCapable[] }) {
    const subscriptions: SubscriptionObject[] = (parameters.subscriptions ??
      this.state.subscriptions) as SubscriptionObject[];
    subscriptions.forEach(({ state }) => state.entity.increaseSubscriptionCount(this.state.id));

    this.state.client.logger.trace(this.subscriptionType, () => ({
      messageType: 'text',
      message: `Register subscription for real-time events: ${this}`,
    }));

    this.state.client.registerEventHandleCapable(this, parameters.cursor, subscriptions);
  }

  /**
   * Unregister {@link SubscriptionSet} object from real-time events' retrieval.
   *
   * @param [subscriptions] - List of subscription objects which should be unregistered (in case of partial
   * modification).
   *
   * @internal
   */
  protected unregister(subscriptions?: SubscriptionObject[]) {
    const activeSubscriptions: SubscriptionObject[] = (subscriptions ??
      this.state.subscriptions) as SubscriptionObject[];
    activeSubscriptions.forEach(({ state }) => state.entity.decreaseSubscriptionCount(this.state.id));

    this.state.client.logger.trace(this.subscriptionType, () => {
      if (!subscriptions) {
        return {
          messageType: 'text',
          message: `Unregister subscription from real-time events: ${this}`,
        };
      } else {
        return {
          messageType: 'object',
          message: {
            subscription: this,
            subscriptions,
          },
          details: 'Unregister subscriptions of subscription set from real-time events:',
        };
      }
    });

    this.state.client.unregisterEventHandleCapable(this, activeSubscriptions);
  }

  /**
   * Stringify subscription object.
   *
   * @returns Serialized subscription object.
   */
  toString(): string {
    const state = this.state;

    return `${this.subscriptionType} { id: ${this.id}, stateId: ${state.id}, clonesCount: ${
      Object.keys(this.state.clones).length
    }, isSubscribed: ${state.isSubscribed}, subscriptions: [${state.subscriptions
      .map((sub) => sub.toString())
      .join(', ')}] }`;
  }
}
