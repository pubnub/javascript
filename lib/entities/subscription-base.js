"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionBase = exports.SubscriptionBaseState = void 0;
const event_dispatcher_1 = require("../core/components/event-dispatcher");
const uuid_1 = __importDefault(require("../core/components/uuid"));
/**
 * Subscription state object.
 *
 * State object used across multiple subscription object clones.
 *
 * @internal
 */
class SubscriptionBaseState {
    /**
     * Create a base subscription state object.
     *
     * @param client - PubNub client which will work with a subscription object.
     * @param subscriptionInput - User's input to be used with subscribe REST API.
     * @param options - Subscription behavior options.
     * @param referenceTimetoken - High-precision timetoken of the moment when subscription was created for entity.
     */
    constructor(client, subscriptionInput, options, referenceTimetoken) {
        /**
         * Whether a subscribable object subscribed or not.
         */
        this._isSubscribed = false;
        /**
         * The list of references to all {@link SubscriptionBase} clones created for this reference.
         */
        this.clones = {};
        /**
         * List of a parent subscription state objects list.
         *
         * List is used to track usage of a subscription object in other subscription object sets.
         *
         * **Important:** Tracking is required to prevent unexpected unsubscriptions if an object still has a parent.
         */
        this.parents = [];
        /**
         * Unique subscription object identifier.
         */
        this._id = uuid_1.default.createUUID();
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
    get isSubscribed() {
        if (this._isSubscribed)
            return true;
        // Checking whether any of "parents" is subscribed.
        return this.parents.length > 0 && this.parents.some((state) => state.isSubscribed);
    }
    /**
     * Update active subscription state.
     *
     * @param value - New subscription state.
     */
    set isSubscribed(value) {
        if (this.isSubscribed === value)
            return;
        this._isSubscribed = value;
    }
    /**
     * Add a parent subscription state object to mark the linkage.
     *
     * @param parent - Parent subscription state object.
     *
     * @internal
     */
    addParentState(parent) {
        if (!this.parents.includes(parent))
            this.parents.push(parent);
    }
    /**
     * Remove a parent subscription state object.
     *
     * @param parent - Parent object for which linkage should be broken.
     *
     * @internal
     */
    removeParentState(parent) {
        const parentStateIndex = this.parents.indexOf(parent);
        if (parentStateIndex !== -1)
            this.parents.splice(parentStateIndex, 1);
    }
    /**
     * Store a clone of a {@link SubscriptionBase} instance with a given instance ID.
     *
     * @param id - The instance ID to associate with clone.
     * @param instance - Reference to the subscription instance to store as a clone.
     */
    storeClone(id, instance) {
        if (!this.clones[id])
            this.clones[id] = instance;
    }
}
exports.SubscriptionBaseState = SubscriptionBaseState;
/**
 * Base subscribe object.
 *
 * Implementation of base functionality used by {@link SubscriptionObject Subscription} and {@link SubscriptionSet}.
 */
class SubscriptionBase {
    /**
     * Create a subscription object from the state.
     *
     * @param state - Subscription state object.
     *
     * @internal
     */
    constructor(state) {
        /**
         * Unique subscription object identifier.
         *
         * @internal
         */
        this.id = uuid_1.default.createUUID();
        /**
         * Event emitter, which will notify listeners about updates received for channels / groups.
         *
         * @internal
         */
        this.eventDispatcher = new event_dispatcher_1.EventDispatcher();
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
    get subscriptionType() {
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
    get channels() {
        return this.state.subscriptionInput.channels.slice(0);
    }
    /**
     * Get a list of channel groups which is used for subscription.
     *
     * @returns List of channel group names.
     */
    get channelGroups() {
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
    set onMessage(listener) {
        this.eventDispatcher.onMessage = listener;
    }
    /**
     * Set a new presence events handler.
     *
     * @param listener - Listener function, which will be called each time when a new
     * presence event is received from the real-time network.
     */
    set onPresence(listener) {
        this.eventDispatcher.onPresence = listener;
    }
    /**
     * Set a new signal handler.
     *
     * @param listener - Listener function, which will be called each time when a new signal
     * is received from the real-time network.
     */
    set onSignal(listener) {
        this.eventDispatcher.onSignal = listener;
    }
    /**
     * Set a new app context event handler.
     *
     * @param listener - Listener function, which will be called each time when a new
     * app context event is received from the real-time network.
     */
    set onObjects(listener) {
        this.eventDispatcher.onObjects = listener;
    }
    /**
     * Set a new message reaction event handler.
     *
     * @param listener - Listener function, which will be called each time when a
     * new message reaction event is received from the real-time network.
     */
    set onMessageAction(listener) {
        this.eventDispatcher.onMessageAction = listener;
    }
    /**
     * Set a new file handler.
     *
     * @param listener - Listener function, which will be called each time when a new file
     * is received from the real-time network.
     */
    set onFile(listener) {
        this.eventDispatcher.onFile = listener;
    }
    /**
     * Set events handler.
     *
     * @param listener - Events listener configuration object, which lets specify handlers for multiple
     * types of events.
     */
    addListener(listener) {
        this.eventDispatcher.addListener(listener);
    }
    /**
     * Remove events handler.
     *
     * @param listener - Event listener configuration, which should be removed from the list of notified
     * listeners. **Important:** Should be the same object which has been passed to the {@link addListener}.
     */
    removeListener(listener) {
        this.eventDispatcher.removeListener(listener);
    }
    /**
     * Remove all events listeners.
     */
    removeAllListeners() {
        this.eventDispatcher.removeAllListeners();
    }
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
    handleEvent(cursor, event) {
        var _a;
        if (!this.state.cursor || cursor > this.state.cursor)
            this.state.cursor = cursor;
        // Check whether this is an old `old` event and it should be ignored or not.
        if (this.state.referenceTimetoken && event.data.timetoken < this.state.referenceTimetoken) {
            this.state.client.logger.trace(this.subscriptionType, () => ({
                messageType: 'text',
                message: `Event timetoken (${event.data.timetoken}) is older than reference timetoken (${this.state.referenceTimetoken}) for ${this.id} subscription object. Ignoring event.`,
            }));
            return;
        }
        // Don't pass events which are filtered out by the user-provided function.
        if (((_a = this.state.options) === null || _a === void 0 ? void 0 : _a.filter) && !this.state.options.filter(event)) {
            this.state.client.logger.trace(this.subscriptionType, `Event filtered out by filter function for ${this.id} subscription object. Ignoring event.`);
            return;
        }
        const clones = Object.values(this.state.clones);
        if (clones.length > 0) {
            this.state.client.logger.trace(this.subscriptionType, `Notify ${this.id} subscription object clones (count: ${clones.length}) about received event.`);
        }
        clones.forEach((subscription) => subscription.eventDispatcher.handleEvent(event));
    }
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
    dispose() {
        const keys = Object.keys(this.state.clones);
        if (keys.length > 1) {
            this.state.client.logger.debug(this.subscriptionType, `Remove subscription object clone on dispose: ${this.id}`);
            delete this.state.clones[this.id];
        }
        else if (keys.length === 1 && this.state.clones[this.id]) {
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
    invalidate(forDestroy = false) {
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
    subscribe(parameters) {
        if (this.state.isSubscribed) {
            this.state.client.logger.trace(this.subscriptionType, 'Already subscribed. Ignoring subscribe request.');
            return;
        }
        this.state.client.logger.debug(this.subscriptionType, () => {
            if (!parameters)
                return { messageType: 'text', message: 'Subscribe' };
            return { messageType: 'object', message: parameters, details: 'Subscribe with parameters:' };
        });
        this.state.isSubscribed = true;
        this.updateSubscription({ subscribing: true, timetoken: parameters === null || parameters === void 0 ? void 0 : parameters.timetoken });
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
            }
            else if (!this.state._isSubscribed) {
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
    updateSubscription(parameters) {
        var _a, _b;
        if (parameters === null || parameters === void 0 ? void 0 : parameters.timetoken) {
            if (((_a = this.state.cursor) === null || _a === void 0 ? void 0 : _a.timetoken) && ((_b = this.state.cursor) === null || _b === void 0 ? void 0 : _b.timetoken) !== '0') {
                if (parameters.timetoken !== '0' && parameters.timetoken > this.state.cursor.timetoken)
                    this.state.cursor.timetoken = parameters.timetoken;
            }
            else
                this.state.cursor = { timetoken: parameters.timetoken };
        }
        const subscriptions = parameters.subscriptions && parameters.subscriptions.length > 0 ? parameters.subscriptions : undefined;
        if (parameters.subscribing) {
            this.register(Object.assign(Object.assign({}, (parameters.timetoken ? { cursor: this.state.cursor } : {})), (subscriptions ? { subscriptions } : {})));
        }
        else
            this.unregister(subscriptions);
    }
}
exports.SubscriptionBase = SubscriptionBase;
