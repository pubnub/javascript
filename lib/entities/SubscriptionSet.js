"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionSet = void 0;
const SubscribeCapable_1 = require("./SubscribeCapable");
/**
 * Multiple entities subscription set object which can be used to receive and handle real-time
 * updates.
 *
 * Subscription set object represent collection of per-entity subscription objects and allow
 * processing them at once for subscription loop and events handling.
 */
class SubscriptionSet extends SubscribeCapable_1.SubscribeCapable {
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
    constructor({ channels = [], channelGroups = [], subscriptionOptions, eventEmitter, pubnub, }) {
        super();
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
        this.channelNames = [];
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
        this.groupNames = [];
        /**
         * List of per-entity subscription objects.
         *
         * @internal
         */
        this.subscriptionList = [];
        /**
         * Whether subscribed ({@link SubscribeCapable#subscribe}) automatically during subscription
         * object / sets manipulation or not.
         *
         * @internal
         */
        this.subscribedAutomatically = false;
        /**
         * Whether subscribable object subscribed ({@link SubscribeCapable#subscribe}) or not.
         *
         * @internal
         */
        this.subscribed = false;
        this.options = subscriptionOptions;
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
        channels.forEach((c) => this.subscriptionList.push(this.pubnub.channel(c).subscription(this.options)));
        channelGroups.forEach((cg) => this.subscriptionList.push(this.pubnub.channelGroup(cg).subscription(this.options)));
        this.typeBasedListener = {};
        this.typeBasedListenerId = eventEmitter.addListener(this.typeBasedListener, this.channelNames, this.groupNames);
        this.updateListeners();
    }
    /**
     * Add additional entity's subscription to the subscription set.
     *
     * **Important:** Changes will be effective only after {@link SubscribeCapable#subscribe} call or
     * next subscription loop.
     *
     * @param subscription - Other entity's subscription object, which should be added.
     */
    addSubscription(subscription) {
        if (!this.subscriptionList.includes(subscription))
            this.subscriptionList.push(subscription);
        // Make sure to listen events on channels / groups added with `subscription`.
        this.updateListeners();
        // Subscribe subscription object if subscription set already subscribed.
        // @ts-expect-error: Required access of protected field.
        if (this.subscribed && !subscription.subscribed) {
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
    removeSubscription(subscription) {
        this.subscriptionList = this.subscriptionList.filter((sub) => sub !== subscription);
        // Make sure to stop listening for events from channels / groups removed with `subscription`.
        this.updateListeners();
        // @ts-expect-error: Required access of protected field.
        if (subscription.subscribedAutomatically)
            subscription.unsubscribe();
    }
    /**
     * Merge with other subscription set object.
     *
     * **Important:** Changes will be effective only after {@link SubscribeCapable#subscribe} call or
     * next subscription loop.
     *
     * @param subscriptionSet - Other entities' subscription set, which should be joined.
     */
    addSubscriptionSet(subscriptionSet) {
        this.subscriptionList = Array.from(new Set([...this.subscriptionList, ...subscriptionSet.subscriptions]));
        // Make sure to listen events on channels / groups added with `subscription set`.
        this.updateListeners();
        // Subscribe subscription object if subscription set already subscribed.
        if (this.subscribed && !subscriptionSet.subscribed) {
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
    removeSubscriptionSet(subscriptionSet) {
        this.subscriptionList = this.subscriptionList.filter((sub) => !subscriptionSet.subscriptions.includes(sub));
        // Make sure to stop listening for events from channels / groups removed with `subscription set`.
        this.updateListeners();
        if (subscriptionSet.subscribedAutomatically)
            subscriptionSet.unsubscribe();
    }
    /**
     * Get list of entities' subscription objects registered in subscription set.
     *
     * @returns Entities' subscription objects list.
     */
    get subscriptions() {
        return this.subscriptionList.slice(0);
    }
    /**
     * Update listeners for current {@link SubscriptionSet} state.
     *
     * When {@link Subscription} or {@link SubscriptionSet} added / removed it is **required** to
     * update mapping of channels / groups (based on current {@link SubscriptionSet} state) to the
     * event listeners.
     *
     * @internal
     */
    updateListeners() {
        // Actual list of channels and groups.
        const channelGroups = [];
        const channels = [];
        // Gather actual information about active channels / groups.
        this.subscriptionList.forEach((subscription) => {
            if (subscription.channelGroups.length)
                channelGroups.push(...subscription.channelGroups);
            if (subscription.channels.length)
                channels.push(...subscription.channels);
        });
        // Identify channels / groups which should be added / removed.
        const channelsToRemove = this.channelNames.filter((channel) => !channels.includes(channel));
        const groupsToRemove = this.groupNames.filter((group) => !channelGroups.includes(group));
        const channelsToAdd = channels.filter((channel) => !this.channelNames.includes(channel));
        const groupsToAdd = channelGroups.filter((group) => !this.groupNames.includes(group));
        // Removing type-based listener for unused channels / groups.
        if (channelsToRemove.length || groupsToRemove.length) {
            this.eventEmitter.removeListener(this.typeBasedListener, this.typeBasedListenerId, channelsToRemove, groupsToRemove);
        }
        // Adding type-based listener for unused channels / groups.
        if (channelsToAdd.length || groupsToAdd.length)
            this.eventEmitter.addListener(this.typeBasedListener, channelsToAdd, groupsToAdd, this.typeBasedListenerId);
        const aggregatedListener = this.aggregatedListener;
        if (aggregatedListener)
            this.removeListener(aggregatedListener);
        // Set actual list of channels and groups.
        this.groupNames = channelGroups;
        this.channelNames = channels;
        if (aggregatedListener)
            this.addListener(aggregatedListener);
    }
}
exports.SubscriptionSet = SubscriptionSet;
