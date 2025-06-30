import { EventDispatcher, Listener } from '../core/components/event-dispatcher';
import { SubscriptionOptions } from './interfaces/subscription-capable';
import { EventHandleCapable } from './interfaces/event-handle-capable';
import { EventEmitCapable } from './interfaces/event-emit-capable';
import type { PubNubCore as PubNub } from '../core/pubnub-common';
import * as Subscription from '../core/types/api/subscription';
import uuidGenerator from '../core/components/uuid';

/**
 * Subscription state object.
 *
 * State object used across multiple subscription object clones.
 *
 * @internal
 */
export abstract class SubscriptionBaseState {
  /**
   * PubNub instance which will perform subscribe / unsubscribe requests.
   */
  client: PubNub<unknown, unknown>;

  /**
   * Whether a subscribable object subscribed or not.
   */
  _isSubscribed: boolean = false;

  /**
   * User-provided a subscription input object.
   */
  readonly subscriptionInput: Subscription.SubscriptionInput;

  /**
   * High-precision timetoken of the moment when subscription was created for entity.
   *
   * **Note:** This value can be set only if recently there were active subscription loop.
   */
  readonly referenceTimetoken?: string;

  /**
   * Subscription time cursor.
   */
  cursor?: Subscription.SubscriptionCursor;

  /**
   * SubscriptionCapable object configuration.
   */
  options?: SubscriptionOptions;

  /**
   * The list of references to all {@link SubscriptionBase} clones created for this reference.
   */
  clones: Record<string, SubscriptionBase> = {};

  /**
   * List of a parent subscription state objects list.
   *
   * List is used to track usage of a subscription object in other subscription object sets.
   *
   * **Important:** Tracking is required to prevent unexpected unsubscriptions if an object still has a parent.
   */
  parents: SubscriptionBaseState[] = [];

  /**
   * Unique subscription object identifier.
   */
  protected _id: string = uuidGenerator.createUUID();

  /**
   * Create a base subscription state object.
   *
   * @param client - PubNub client which will work with a subscription object.
   * @param subscriptionInput - User's input to be used with subscribe REST API.
   * @param options - Subscription behavior options.
   * @param referenceTimetoken - High-precision timetoken of the moment when subscription was created for entity.
   */
  protected constructor(
    client: SubscriptionBaseState['client'],
    subscriptionInput: SubscriptionBaseState['subscriptionInput'],
    options: SubscriptionBaseState['options'],
    referenceTimetoken: SubscriptionBaseState['referenceTimetoken'],
  ) {
    this.referenceTimetoken = referenceTimetoken;
    this.subscriptionInput = subscriptionInput;
    this.options = options;
    this.client = client;
  }

  /**
   * Get unique subscription object identifier.
   *
   * @returns Unique subscription object identifier.
   */
  get id() {
    return this._id;
  }

  /**
   * Check whether a subscription object is the last clone or not.
   *
   * @returns `true` if a subscription object is the last clone.
   */
  get isLastClone() {
    return Object.keys(this.clones).length === 1;
  }

  /**
   * Get whether a subscribable object subscribed or not.
   *
   * **Warning:** This method shouldn't be overridden by {@link SubscriptionSet}.
   *
   * @returns Whether a subscribable object subscribed or not.
   */
  get isSubscribed(): boolean {
    if (this._isSubscribed) return true;

    // Checking whether any of "parents" is subscribed.
    return this.parents.length > 0 && this.parents.some((state) => state.isSubscribed);
  }

  /**
   * Update active subscription state.
   *
   * @param value - New subscription state.
   */
  set isSubscribed(value: boolean) {
    if (this.isSubscribed === value) return;
    this._isSubscribed = value;
  }

  /**
   * Add a parent subscription state object to mark the linkage.
   *
   * @param parent - Parent subscription state object.
   *
   * @internal
   */
  addParentState(parent: SubscriptionBaseState) {
    if (!this.parents.includes(parent)) this.parents.push(parent);
  }

  /**
   * Remove a parent subscription state object.
   *
   * @param parent - Parent object for which linkage should be broken.
   *
   * @internal
   */
  removeParentState(parent: SubscriptionBaseState) {
    const parentStateIndex = this.parents.indexOf(parent);
    if (parentStateIndex !== -1) this.parents.splice(parentStateIndex, 1);
  }

  /**
   * Store a clone of a {@link SubscriptionBase} instance with a given instance ID.
   *
   * @param id - The instance ID to associate with clone.
   * @param instance - Reference to the subscription instance to store as a clone.
   */
  storeClone(id: string, instance: SubscriptionBase): void {
    if (!this.clones[id]) this.clones[id] = instance;
  }
}

/**
 * Base subscribe object.
 *
 * Implementation of base functionality used by {@link SubscriptionObject Subscription} and {@link SubscriptionSet}.
 */
export abstract class SubscriptionBase implements EventEmitCapable, EventHandleCapable {
  /**
   * Unique subscription object identifier.
   *
   * @internal
   */
  id: string = uuidGenerator.createUUID();

  /**
   * Subscription state.
   *
   * State which can be shared between multiple subscription object clones.
   *
   * @internal
   */
  private readonly _state: SubscriptionBaseState;

  /**
   * Event emitter, which will notify listeners about updates received for channels / groups.
   *
   * @internal
   */
  private eventDispatcher: EventDispatcher = new EventDispatcher();

  /**
   * Create a subscription object from the state.
   *
   * @param state - Subscription state object.
   *
   * @internal
   */
  protected constructor(state: SubscriptionBaseState) {
    this._state = state;
  }

  /**
   * Retrieve subscription type.
   *
   * There is two types:
   * - Subscription
   * - SubscriptionSet
   *
   * @returns One of subscription types.
   *
   * @internal
   */
  get subscriptionType(): 'Subscription' | 'SubscriptionSet' {
    return 'Subscription';
  }

  /**
   * Subscription state.
   *
   * @returns Subscription state object.
   *
   * @internal
   */
  get state() {
    return this._state;
  }

  /**
   * Get a list of channels which is used for subscription.
   *
   * @returns List of channel names.
   */
  get channels(): string[] {
    return this.state.subscriptionInput.channels.slice(0);
  }

  /**
   * Get a list of channel groups which is used for subscription.
   *
   * @returns List of channel group names.
   */
  get channelGroups(): string[] {
    return this.state.subscriptionInput.channelGroups.slice(0);
  }

  // --------------------------------------------------------
  // -------------------- Event emitter ---------------------
  // --------------------------------------------------------
  // region Event emitter

  /**
   * Set a new message handler.
   *
   * @param listener - Listener function, which will be called each time when a new message
   * is received from the real-time network.
   */
  set onMessage(listener: ((event: Subscription.Message) => void) | undefined) {
    this.eventDispatcher.onMessage = listener;
  }

  /**
   * Set a new presence events handler.
   *
   * @param listener - Listener function, which will be called each time when a new
   * presence event is received from the real-time network.
   */
  set onPresence(listener: ((event: Subscription.Presence) => void) | undefined) {
    this.eventDispatcher.onPresence = listener;
  }

  /**
   * Set a new signal handler.
   *
   * @param listener - Listener function, which will be called each time when a new signal
   * is received from the real-time network.
   */
  set onSignal(listener: ((event: Subscription.Signal) => void) | undefined) {
    this.eventDispatcher.onSignal = listener;
  }

  /**
   * Set a new app context event handler.
   *
   * @param listener - Listener function, which will be called each time when a new
   * app context event is received from the real-time network.
   */
  set onObjects(listener: ((event: Subscription.AppContextObject) => void) | undefined) {
    this.eventDispatcher.onObjects = listener;
  }

  /**
   * Set a new message reaction event handler.
   *
   * @param listener - Listener function, which will be called each time when a
   * new message reaction event is received from the real-time network.
   */
  set onMessageAction(listener: ((event: Subscription.MessageAction) => void) | undefined) {
    this.eventDispatcher.onMessageAction = listener;
  }

  /**
   * Set a new file handler.
   *
   * @param listener - Listener function, which will be called each time when a new file
   * is received from the real-time network.
   */
  set onFile(listener: ((event: Subscription.File) => void) | undefined) {
    this.eventDispatcher.onFile = listener;
  }

  /**
   * Set events handler.
   *
   * @param listener - Events listener configuration object, which lets specify handlers for multiple
   * types of events.
   */
  addListener(listener: Listener) {
    this.eventDispatcher.addListener(listener);
  }

  /**
   * Remove events handler.
   *
   * @param listener - Event listener configuration, which should be removed from the list of notified
   * listeners. **Important:** Should be the same object which has been passed to the {@link addListener}.
   */
  removeListener(listener: Listener) {
    this.eventDispatcher.removeListener(listener);
  }

  /**
   * Remove all events listeners.
   */
  removeAllListeners() {
    this.eventDispatcher.removeAllListeners();
  }
  // endregion

  // --------------------------------------------------------
  // -------------------- Event handler ---------------------
  // --------------------------------------------------------
  // region Event handler

  /**
   * Subscription input associated with this subscribe capable object
   *
   * @param forUnsubscribe - Whether list subscription input created for unsubscription (means entity should be free).
   *
   * @returns Subscription input object.
   *
   * @internal
   */
  abstract subscriptionInput(forUnsubscribe: boolean): Subscription.SubscriptionInput;

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
  handleEvent(cursor: Subscription.SubscriptionCursor, event: Subscription.SubscriptionResponse['messages'][0]) {
    if (!this.state.cursor || cursor > this.state.cursor) this.state.cursor = cursor;

    // Check whether this is an old `old` event and it should be ignored or not.
    if (this.state.referenceTimetoken && event.data.timetoken < this.state.referenceTimetoken) {
      this.state.client.logger.trace(this.subscriptionType, () => ({
        messageType: 'text',
        message: `Event timetoken (${event.data.timetoken}) is older than reference timetoken (${
          this.state.referenceTimetoken
        }) for ${this.id} subscription object. Ignoring event.`,
      }));

      return;
    }

    // Don't pass events which are filtered out by the user-provided function.
    if (this.state.options?.filter && !this.state.options.filter(event)) {
      this.state.client.logger.trace(
        this.subscriptionType,
        `Event filtered out by filter function for ${this.id} subscription object. Ignoring event.`,
      );

      return;
    }

    const clones = Object.values(this.state.clones);
    if (clones.length > 0) {
      this.state.client.logger.trace(
        this.subscriptionType,
        `Notify ${this.id} subscription object clones (count: ${clones.length}) about received event.`,
      );
    }

    clones.forEach((subscription) => subscription.eventDispatcher.handleEvent(event));
  }
  // endregion

  /**
   * Make a bare copy of the subscription object.
   *
   * Copy won't have any type-specific listeners or added listener objects but will have the same internal state as
   * the source object.
   *
   * @returns Bare copy of a subscription object.
   */
  abstract cloneEmpty(): SubscriptionBase;

  /**
   * Graceful object destruction.
   *
   * This is an instance destructor, which will properly deinitialize it:
   * - remove and unset all listeners,
   * - try to unsubscribe (if subscribed and there are no more instances interested in the same data stream).
   *
   * **Important:** {@link SubscriptionBase#dispose dispose} won't have any effect if a subscription object is part of
   * set. To gracefully dispose an object, it should be removed from the set using
   * {@link SubscriptionSet#removeSubscription removeSubscription} (in this case call of
   * {@link SubscriptionBase#dispose dispose} not required.
   *
   * **Note:** Disposed instance won't call the dispatcher to deliver updates to the listeners.
   */
  dispose(): void {
    const keys = Object.keys(this.state.clones);

    if (keys.length > 1) {
      this.state.client.logger.debug(this.subscriptionType, `Remove subscription object clone on dispose: ${this.id}`);
      delete this.state.clones[this.id];
    } else if (keys.length === 1 && this.state.clones[this.id]) {
      this.state.client.logger.debug(this.subscriptionType, `Unsubscribe subscription object on dispose: ${this.id}`);
      this.unsubscribe();
    }
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
  invalidate(forDestroy: boolean = false) {
    this.state._isSubscribed = false;

    if (forDestroy) {
      delete this.state.clones[this.id];

      if (Object.keys(this.state.clones).length === 0) {
        this.state.client.logger.trace(this.subscriptionType, 'Last clone removed. Reset shared subscription state.');
        this.state.subscriptionInput.removeAll();
        this.state.parents = [];
      }
    }
  }

  /**
   * Start receiving real-time updates.
   *
   * @param parameters - Additional subscription configuration options which should be used
   * for request.
   */
  subscribe(parameters?: { timetoken?: string }) {
    if (this.state.isSubscribed) {
      this.state.client.logger.trace(this.subscriptionType, 'Already subscribed. Ignoring subscribe request.');
      return;
    }

    this.state.client.logger.debug(this.subscriptionType, () => {
      if (!parameters) return { messageType: 'text', message: 'Subscribe' };
      return { messageType: 'object', message: parameters, details: 'Subscribe with parameters:' };
    });

    this.state.isSubscribed = true;
    this.updateSubscription({ subscribing: true, timetoken: parameters?.timetoken });
  }

  /**
   * Stop real-time events processing.
   *
   * **Important:** {@link SubscriptionBase#unsubscribe unsubscribe} won't have any effect if a subscription object
   * is part of active (subscribed) set. To unsubscribe an object, it should be removed from the set using
   * {@link SubscriptionSet#removeSubscription removeSubscription} (in this case call of
   * {@link SubscriptionBase#unsubscribe unsubscribe} not required.
   *
   * **Note:** Unsubscribed instance won't call the dispatcher to deliver updates to the listeners.
   */
  unsubscribe() {
    // Check whether an instance-level subscription flag not set or parent has active subscription.
    if (!this.state._isSubscribed || this.state.isSubscribed) {
      // Warn if a user tries to unsubscribe using specific subscription which subscribed as part of a subscription set.
      if (!this.state._isSubscribed && this.state.parents.length > 0 && this.state.isSubscribed) {
        this.state.client.logger.warn(this.subscriptionType, () => ({
          messageType: 'object',
          details: 'Subscription is subscribed as part of a subscription set. Remove from active sets to unsubscribe:',
          message: this.state.parents.filter((subscriptionSet) => subscriptionSet.isSubscribed),
        }));
        return;
      } else if (!this.state._isSubscribed) {
        this.state.client.logger.trace(this.subscriptionType, 'Not subscribed. Ignoring unsubscribe request.');
        return;
      }
    }

    this.state.client.logger.debug(this.subscriptionType, 'Unsubscribe');

    this.state.isSubscribed = false;
    delete this.state.cursor;

    this.updateSubscription({ subscribing: false });
  }

  /**
   * Update channels and groups used by subscription loop.
   *
   * @param parameters - Subscription loop update parameters.
   * @param parameters.subscribing - Whether subscription updates as part of subscription or unsubscription.
   * @param [parameters.timetoken] - Subscription catch-up timetoken.
   * @param [parameters.subscriptions] - List of subscriptions which should be used to modify a subscription loop
   * object.
   *
   * @internal
   */
  updateSubscription(parameters: { subscribing: boolean; timetoken?: string; subscriptions?: EventHandleCapable[] }) {
    if (parameters?.timetoken) {
      if (this.state.cursor?.timetoken && this.state.cursor?.timetoken !== '0') {
        if (parameters.timetoken !== '0' && parameters.timetoken > this.state.cursor.timetoken)
          this.state.cursor.timetoken = parameters.timetoken;
      } else this.state.cursor = { timetoken: parameters.timetoken };
    }

    const subscriptions =
      parameters.subscriptions && parameters.subscriptions.length > 0 ? parameters.subscriptions : undefined;
    if (parameters.subscribing) {
      this.register({
        ...(parameters.timetoken ? { cursor: this.state.cursor } : {}),
        ...(subscriptions ? { subscriptions } : {}),
      });
    } else this.unregister(subscriptions);
  }

  /**
   * Register a subscription object for real-time events' retrieval.
   *
   * @param parameters - Object registration parameters.
   * @param [parameters.cursor] - Subscription real-time events catch-up cursor.
   * @param [parameters.subscriptions] - List of subscription objects which should be registered (in case of partial
   * modification).
   *
   * @internal
   */
  protected abstract register(parameters: {
    cursor?: Subscription.SubscriptionCursor;
    subscriptions?: EventHandleCapable[];
  }): void;

  /**
   * Unregister subscription object from real-time events' retrieval.
   *
   * @param [subscriptions] - List of subscription objects which should be unregistered (in case of partial
   * modification).
   *
   * **Note:** Unregistered instance won't call the dispatcher to deliver updates to the listeners.
   *
   * @internal
   */
  protected abstract unregister(subscriptions?: EventHandleCapable[]): void;
}
