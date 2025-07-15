import { SubscriptionCapable, SubscriptionType, SubscriptionOptions } from './interfaces/subscription-capable';
import { SubscriptionCursor, SubscriptionInput, SubscriptionResponse } from '../core/types/api/subscription';
import { SubscriptionBase, SubscriptionBaseState } from './subscription-base';
import { EventHandleCapable } from './interfaces/event-handle-capable';
import type { PubNubCore as PubNub } from '../core/pubnub-common';
import { EntityInterface } from './interfaces/entity-interface';
import { SubscriptionSet } from './subscription-set';
import { messageFingerprint } from '../core/utils';

/**
 * {@link Subscription} state object.
 *
 * State object used across multiple {@link Subscription} object clones.
 *
 * @internal
 */
class SubscriptionState extends SubscriptionBaseState {
  /**
   * Subscription-capable entity.
   *
   * EntityInterface with information that is required to receive real-time updates for it.
   */
  entity: EntityInterface & SubscriptionCapable;

  /**
   * Create a subscription state object.
   *
   * @param parameters - State configuration options
   * @param parameters.client - PubNub client which will work with a subscription object.
   * @param parameters.entity - Entity for which a subscription object has been created.
   * @param [parameters.options] - Subscription behavior options.
   */
  constructor(parameters: {
    client: PubNub<unknown, unknown>;
    entity: EntityInterface & SubscriptionCapable;
    options?: SubscriptionOptions;
  }) {
    const names = parameters.entity.subscriptionNames(parameters.options?.receivePresenceEvents ?? false);
    const subscriptionInput = new SubscriptionInput({
      [parameters.entity.subscriptionType == SubscriptionType.Channel ? 'channels' : 'channelGroups']: names,
    });

    super(parameters.client, subscriptionInput, parameters.options, parameters.client.subscriptionTimetoken);
    this.entity = parameters.entity;
  }
}

/**
 * Single-entity subscription object which can be used to receive and handle real-time updates.
 */
export class Subscription extends SubscriptionBase {
  /**
   * List of subscription {@link SubscriptionSet sets} which contains {@link Subscription subscription}.
   *
   * List if used to track usage of a specific {@link Subscription subscription} in other subscription
   * {@link SubscriptionSet sets}.
   *
   * **Important:** Tracking is required to prevent cloned instance dispose if there are sets that still use it.
   *
   * @internal
   */
  private parents: SubscriptionSet[] = [];

  /**
   * List of fingerprints from updates which has been handled already.
   *
   * **Important:** Tracking is required to avoid repetitive call of the subscription object's listener when the object
   * is part of multiple subscribed sets. Handler will be called once, and then the fingerprint will be stored in this
   * list to avoid another listener call for it.
   *
   * @internal
   */
  private handledUpdates: string[] = [];

  /**
   * Create a subscribing capable object for entity.
   *
   * @param parameters - Subscription object configuration.
   *
   * @internal
   */
  constructor(
    parameters:
      | {
          client: PubNub<unknown, unknown>;
          entity: EntityInterface & SubscriptionCapable;
          options: SubscriptionOptions | undefined;
        }
      | { state: SubscriptionState },
  ) {
    if ('client' in parameters) {
      parameters.client.logger.debug('Subscription', () => ({
        messageType: 'object',
        details: 'Create subscription with parameters:',
        message: { entity: parameters.entity, ...(parameters.options ? parameters.options : {}) },
      }));
    } else parameters.state.client.logger.debug('Subscription', 'Create subscription clone');

    super('state' in parameters ? parameters.state : new SubscriptionState(parameters));

    this.state.storeClone(this.id, this);
  }

  /**
   * Get a {@link Subscription} object state.
   *
   * @returns: {@link Subscription} object state.
   *
   * @internal
   */
  override get state(): SubscriptionState {
    return super.state as SubscriptionState;
  }

  /**
   * Get number of {@link SubscriptionSet} which use this subscription object.
   *
   * @returns Number of {@link SubscriptionSet} which use this subscription object.
   *
   * @internal
   */
  get parentSetsCount(): number {
    return this.parents.length;
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
  override handleEvent(cursor: SubscriptionCursor, event: SubscriptionResponse['messages'][0]): void {
    if (
      !this.state.isSubscribed ||
      !this.state.subscriptionInput.contains(event.data.subscription ?? event.data.channel)
    )
      return;

    if (this.parentSetsCount > 0) {
      // Creating from whole payload (not only for published messages).
      const fingerprint = messageFingerprint(event.data);
      if (this.handledUpdates.includes(fingerprint)) {
        this.state.client.logger.trace(
          this.subscriptionType,
          `Event (${fingerprint}) already handled by ${this.id}. Ignoring.`,
        );
        return;
      }

      // Update a list of tracked messages and shrink it if too big.
      this.handledUpdates.push(fingerprint);
      if (this.handledUpdates.length > 10) this.handledUpdates.shift();
    }

    // Check whether an event is not designated for this subscription set.
    if (!this.state.subscriptionInput.contains(event.data.subscription ?? event.data.channel)) return;

    super.handleEvent(cursor, event);
  }
  // endregion

  /**
   * User-provided subscription input associated with this {@link Subscription} object.
   *
   * @param forUnsubscribe - Whether list subscription input created for unsubscription (means entity should be free).
   *
   * @returns Subscription input object.
   *
   * @internal
   */
  override subscriptionInput(forUnsubscribe: boolean = false) {
    if (forUnsubscribe && this.state.entity.subscriptionsCount > 0) return new SubscriptionInput({});

    return this.state.subscriptionInput;
  }

  /**
   * Make a bare copy of the {@link Subscription} object.
   *
   * Copy won't have any type-specific listeners or added listener objects but will have the same internal state as
   * the source object.
   *
   * @returns Bare copy of a {@link Subscription} object.
   */
  override cloneEmpty(): Subscription {
    return new Subscription({ state: this.state });
  }

  /**
   * Graceful {@link Subscription} object destruction.
   *
   * This is an instance destructor, which will properly deinitialize it:
   * - remove and unset all listeners,
   * - try to unsubscribe (if subscribed and there are no more instances interested in the same data stream).
   *
   * **Important:** {@link Subscription#dispose dispose} won't have any effect if a subscription object is part of
   * {@link SubscriptionSet set}. To gracefully dispose an object, it should be removed from the set using
   * {@link SubscriptionSet#removeSubscription removeSubscription} (in this case call of
   * {@link Subscription#dispose dispose} not required).
   *
   * **Note:** Disposed instance won't call the dispatcher to deliver updates to the listeners.
   */
  dispose(): void {
    if (this.parentSetsCount > 0) {
      this.state.client.logger.debug(this.subscriptionType, () => ({
        messageType: 'text',
        message: `'${this.state.entity.subscriptionNames()}' subscription still in use. Ignore dispose request.`,
      }));

      return;
    }

    this.handledUpdates.splice(0, this.handledUpdates.length);
    super.dispose();
  }

  /**
   * Invalidate subscription object.
   *
   * Clean up resources used by a subscription object.
   *
   * **Note:** An invalidated instance won't call the dispatcher to deliver updates to the listeners.
   *
   * @param forDestroy - Whether subscription object invalidated as part of PubNub client destroy process or not.
   *
   * @internal
   */
  override invalidate(forDestroy: boolean = false) {
    if (forDestroy) this.state.entity.decreaseSubscriptionCount(this.state.id);
    this.handledUpdates.splice(0, this.handledUpdates.length);
    super.invalidate(forDestroy);
  }

  /**
   * Add another {@link SubscriptionSet} into which subscription has been added.
   *
   * @param parent - {@link SubscriptionSet} which has been modified.
   *
   * @internal
   */
  addParentSet(parent: SubscriptionSet) {
    if (!this.parents.includes(parent)) {
      this.parents.push(parent);

      this.state.client.logger.trace(
        this.subscriptionType,
        `Add parent subscription set for ${this.id}: ${parent.id}. Parent subscription set count: ${
          this.parentSetsCount
        }`,
      );
    }
  }

  /**
   * Remove {@link SubscriptionSet} upon subscription removal from it.
   *
   * @param parent - {@link SubscriptionSet} which has been modified.
   *
   * @internal
   */
  removeParentSet(parent: SubscriptionSet) {
    const parentIndex = this.parents.indexOf(parent);
    if (parentIndex !== -1) {
      this.parents.splice(parentIndex, 1);

      this.state.client.logger.trace(
        this.subscriptionType,
        `Remove parent subscription set from ${this.id}: ${parent.id}. Parent subscription set count: ${
          this.parentSetsCount
        }`,
      );
    }

    if (this.parentSetsCount === 0) this.handledUpdates.splice(0, this.handledUpdates.length);
  }

  /**
   * Merge entities' subscription objects into {@link SubscriptionSet}.
   *
   * @param subscription - Another entity's subscription object to be merged with receiver.
   *
   * @return {@link SubscriptionSet} which contains both receiver and other entities' subscription objects.
   */
  addSubscription(subscription: Subscription): SubscriptionSet {
    this.state.client.logger.debug(this.subscriptionType, () => ({
      messageType: 'text',
      message: `Create set with subscription: ${subscription}`,
    }));

    const subscriptionSet = new SubscriptionSet({
      client: this.state.client,
      subscriptions: [this, subscription],
      options: this.state.options,
    });

    // Check whether a source subscription is already subscribed or not.
    if (!this.state.isSubscribed && !subscription.state.isSubscribed) return subscriptionSet;

    this.state.client.logger.trace(
      this.subscriptionType,
      'Subscribe resulting set because the receiver is already subscribed.',
    );

    // Subscribing resulting subscription set because source subscription was subscribed.
    subscriptionSet.subscribe();

    return subscriptionSet;
  }

  /**
   * Register {@link Subscription} object for real-time events' retrieval.
   *
   * **Note:** Superclass calls this method only in response to a {@link Subscription.subscribe subscribe} method call.
   *
   * @param parameters - Object registration parameters.
   * @param [parameters.cursor] - Subscription real-time events catch-up cursor.
   * @param [parameters.subscriptions] - List of subscription objects which should be registered (in case of partial
   * modification).
   *
   * @internal
   */
  protected register(parameters: { cursor?: SubscriptionCursor; subscriptions?: EventHandleCapable[] }): void {
    this.state.entity.increaseSubscriptionCount(this.state.id);

    this.state.client.logger.trace(this.subscriptionType, () => ({
      messageType: 'text',
      message: `Register subscription for real-time events: ${this}`,
    }));

    this.state.client.registerEventHandleCapable(this, parameters.cursor);
  }

  /**
   * Unregister {@link Subscription} object from real-time events' retrieval.
   *
   * **Note:** Superclass calls this method only in response to a {@link Subscription.unsubscribe unsubscribe} method
   * call.
   *
   * @param [_subscriptions] - List of subscription objects which should be unregistered (in case of partial
   * modification).
   *
   * @internal
   */
  protected unregister(_subscriptions?: Subscription[]) {
    this.state.entity.decreaseSubscriptionCount(this.state.id);

    this.state.client.logger.trace(this.subscriptionType, () => ({
      messageType: 'text',
      message: `Unregister subscription from real-time events: ${this}`,
    }));

    this.handledUpdates.splice(0, this.handledUpdates.length);
    this.state.client.unregisterEventHandleCapable(this);
  }

  /**
   * Stringify subscription object.
   *
   * @returns Serialized subscription object.
   */
  toString(): string {
    const state = this.state;

    return `${this.subscriptionType} { id: ${this.id}, stateId: ${state.id}, entity: ${state.entity
      .subscriptionNames(false)
      .pop()}, clonesCount: ${
      Object.keys(state.clones).length
    }, isSubscribed: ${state.isSubscribed}, parentSetsCount: ${this.parentSetsCount}, cursor: ${
      state.cursor ? state.cursor.timetoken : 'not set'
    }, referenceTimetoken: ${state.referenceTimetoken ? state.referenceTimetoken : 'not set'} }`;
  }
}
