"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const subscription_capable_1 = require("./interfaces/subscription-capable");
const subscription_1 = require("../core/types/api/subscription");
const subscription_base_1 = require("./subscription-base");
const subscription_set_1 = require("./subscription-set");
const utils_1 = require("../core/utils");
/**
 * {@link Subscription} state object.
 *
 * State object used across multiple {@link Subscription} object clones.
 *
 * @internal
 */
class SubscriptionState extends subscription_base_1.SubscriptionBaseState {
    /**
     * Create a subscription state object.
     *
     * @param parameters - State configuration options
     * @param parameters.client - PubNub client which will work with a subscription object.
     * @param parameters.entity - Entity for which a subscription object has been created.
     * @param [parameters.options] - Subscription behavior options.
     */
    constructor(parameters) {
        var _a, _b;
        const names = parameters.entity.subscriptionNames((_b = (_a = parameters.options) === null || _a === void 0 ? void 0 : _a.receivePresenceEvents) !== null && _b !== void 0 ? _b : false);
        const subscriptionInput = new subscription_1.SubscriptionInput({
            [parameters.entity.subscriptionType == subscription_capable_1.SubscriptionType.Channel ? 'channels' : 'channelGroups']: names,
        });
        super(parameters.client, subscriptionInput, parameters.options, parameters.client.subscriptionTimetoken);
        this.entity = parameters.entity;
    }
}
/**
 * Single-entity subscription object which can be used to receive and handle real-time updates.
 */
class Subscription extends subscription_base_1.SubscriptionBase {
    /**
     * Create a subscribing capable object for entity.
     *
     * @param parameters - Subscription object configuration.
     *
     * @internal
     */
    constructor(parameters) {
        if ('client' in parameters) {
            parameters.client.logger.debug('Subscription', () => ({
                messageType: 'object',
                details: 'Create subscription with parameters:',
                message: Object.assign({ entity: parameters.entity }, (parameters.options ? parameters.options : {})),
            }));
        }
        else
            parameters.state.client.logger.debug('Subscription', 'Create subscription clone');
        super('state' in parameters ? parameters.state : new SubscriptionState(parameters));
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
        this.parents = [];
        /**
         * List of fingerprints from updates which has been handled already.
         *
         * **Important:** Tracking is required to avoid repetitive call of the subscription object's listener when the object
         * is part of multiple subscribed sets. Handler will be called once, and then the fingerprint will be stored in this
         * list to avoid another listener call for it.
         *
         * @internal
         */
        this.handledUpdates = [];
        this.state.storeClone(this.id, this);
    }
    /**
     * Get a {@link Subscription} object state.
     *
     * @returns: {@link Subscription} object state.
     *
     * @internal
     */
    get state() {
        return super.state;
    }
    /**
     * Get number of {@link SubscriptionSet} which use this subscription object.
     *
     * @returns Number of {@link SubscriptionSet} which use this subscription object.
     *
     * @internal
     */
    get parentSetsCount() {
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
    handleEvent(cursor, event) {
        var _a;
        if (!this.state.isSubscribed)
            return;
        if (this.parentSetsCount > 0) {
            const fingerprint = (0, utils_1.messageFingerprint)(event.data);
            if (this.handledUpdates.includes(fingerprint)) {
                this.state.client.logger.trace(this.constructor.name, `Message (${fingerprint}) already handled. Ignoring.`);
                return;
            }
            // Update a list of tracked messages and shrink it if too big.
            this.handledUpdates.push(fingerprint);
            if (this.handledUpdates.length > 10)
                this.handledUpdates.shift();
        }
        // Check whether an event is not designated for this subscription set.
        if (!this.state.subscriptionInput.contains((_a = event.data.subscription) !== null && _a !== void 0 ? _a : event.data.channel))
            return;
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
    subscriptionInput(forUnsubscribe = false) {
        if (forUnsubscribe && this.state.entity.subscriptionsCount > 0)
            return new subscription_1.SubscriptionInput({});
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
    cloneEmpty() {
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
    dispose() {
        if (this.parentSetsCount > 0) {
            this.state.client.logger.debug(this.constructor.name, () => ({
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
    invalidate(forDestroy = false) {
        if (forDestroy)
            this.state.entity.decreaseSubscriptionCount(this.state.id);
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
    addParentSet(parent) {
        if (!this.parents.includes(parent)) {
            this.parents.push(parent);
            this.state.client.logger.trace(this.constructor.name, `Add parent subscription set for ${this.id}: ${parent.id}. Parent subscription set count: ${this.parentSetsCount}`);
        }
    }
    /**
     * Remove {@link SubscriptionSet} upon subscription removal from it.
     *
     * @param parent - {@link SubscriptionSet} which has been modified.
     *
     * @internal
     */
    removeParentSet(parent) {
        const parentIndex = this.parents.indexOf(parent);
        if (parentIndex !== -1) {
            this.parents.splice(parentIndex, 1);
            this.state.client.logger.trace(this.constructor.name, `Remove parent subscription set from ${this.id}: ${parent.id}. Parent subscription set count: ${this.parentSetsCount}`);
        }
        if (this.parentSetsCount === 0)
            this.handledUpdates.splice(0, this.handledUpdates.length);
    }
    /**
     * Merge entities' subscription objects into {@link SubscriptionSet}.
     *
     * @param subscription - Another entity's subscription object to be merged with receiver.
     *
     * @return {@link SubscriptionSet} which contains both receiver and other entities' subscription objects.
     */
    addSubscription(subscription) {
        this.state.client.logger.debug(this.constructor.name, () => ({
            messageType: 'text',
            message: `Create set with subscription: ${subscription}`,
        }));
        const subscriptionSet = new subscription_set_1.SubscriptionSet({
            client: this.state.client,
            subscriptions: [this, subscription],
            options: this.state.options,
        });
        // Check whether a source subscription is already subscribed or not.
        if (!this.state.isSubscribed && !subscription.state.isSubscribed)
            return subscriptionSet;
        this.state.client.logger.trace(this.constructor.name, 'Subscribe resulting set because the receiver is already subscribed.');
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
    register(parameters) {
        this.state.entity.increaseSubscriptionCount(this.state.id);
        this.state.client.logger.trace(this.constructor.name, () => ({
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
    unregister(_subscriptions) {
        this.state.entity.decreaseSubscriptionCount(this.state.id);
        this.state.client.logger.trace(this.constructor.name, () => ({
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
    toString() {
        const state = this.state;
        return `${this.constructor.name} { id: ${this.id}, stateId: ${state.id}, entity: ${state.entity
            .subscriptionNames(false)
            .pop()}, clonesCount: ${Object.keys(state.clones).length}, isSubscribed: ${state.isSubscribed}, parentSetsCount: ${this.parentSetsCount}, cursor: ${state.cursor ? state.cursor.timetoken : 'not set'}, referenceTimetoken: ${state.referenceTimetoken ? state.referenceTimetoken : 'not set'} }`;
    }
}
exports.Subscription = Subscription;
