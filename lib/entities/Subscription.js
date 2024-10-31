"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const SubscribeCapable_1 = require("./SubscribeCapable");
const SubscriptionSet_1 = require("./SubscriptionSet");
/**
 * Single-entity subscription object which can be used to receive and handle real-time updates.
 */
class Subscription extends SubscribeCapable_1.SubscribeCapable {
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
    constructor({ channels, channelGroups, subscriptionOptions, eventEmitter, pubnub, }) {
        super();
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
        this.channelNames = [];
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
        this.groupNames = [];
        this.channelNames = channels;
        this.groupNames = channelGroups;
        this.options = subscriptionOptions;
        this.pubnub = pubnub;
        this.eventEmitter = eventEmitter;
        this.listener = {};
        eventEmitter.addListener(this.listener, this.channelNames.filter((c) => !c.endsWith('-pnpres')), this.groupNames.filter((cg) => !cg.endsWith('-pnpres')));
    }
    /**
     * Merge entities' subscription objects into subscription set.
     *
     * @param subscription - Other entity's subscription object to be merged with receiver.
     * @return Subscription set which contains both receiver and other entities' subscription objects.
     */
    addSubscription(subscription) {
        return new SubscriptionSet_1.SubscriptionSet({
            channels: [...this.channelNames, ...subscription.channels],
            channelGroups: [...this.groupNames, ...subscription.channelGroups],
            subscriptionOptions: Object.assign(Object.assign({}, this.options), subscription === null || subscription === void 0 ? void 0 : subscription.options),
            eventEmitter: this.eventEmitter,
            pubnub: this.pubnub,
        });
    }
}
exports.Subscription = Subscription;
