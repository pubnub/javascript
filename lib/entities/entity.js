"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
const subscription_capable_1 = require("./interfaces/subscription-capable");
const subscription_1 = require("./subscription");
/**
 * Common entity interface.
 */
class Entity {
    /**
     * Create an entity instance.
     *
     * @param nameOrId - Identifier which will be used with subscription loop.
     * @param client - PubNub instance which has been used to create this entity.
     *
     * @internal
     */
    constructor(nameOrId, client) {
        /**
         * List of subscription state object IDs which are using this entity.
         *
         * @internal
         */
        this.subscriptionStateIds = [];
        this.client = client;
        this._nameOrId = nameOrId;
    }
    /**
     * Type of subscription entity.
     *
     * Type defines where it will be used with multiplexed subscribe REST API calls.
     *
     * @retuerns One of {@link SubscriptionType} enum fields.
     *
     * @internal
     */
    get subscriptionType() {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled')
            return subscription_capable_1.SubscriptionType.Channel;
        else
            throw new Error('Subscription type error: subscription module disabled');
    }
    /**
     * Names for an object to be used in subscription.
     *
     * Provided strings will be used with multiplexed subscribe REST API calls.
     *
     * @param receivePresenceEvents - Whether presence events should be observed or not.
     *
     * @returns List of names with multiplexed subscribe REST API calls (may include additional names to receive presence
     * updates).
     *
     * @internal
     */
    subscriptionNames(receivePresenceEvents) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            return [
                this._nameOrId,
                ...(receivePresenceEvents && !this._nameOrId.endsWith('-pnpres') ? [`${this._nameOrId}-pnpres`] : []),
            ];
        }
        else
            throw new Error('Subscription names error: subscription module disabled');
    }
    /**
     * Create a subscribable's subscription object for real-time updates.
     *
     * Create a subscription object which can be used to subscribe to the real-time updates sent to the specific data
     * stream.
     *
     * @param [subscriptionOptions] - Subscription object behavior customization options.
     *
     * @returns Configured and ready to use subscribable's subscription object.
     */
    subscription(subscriptionOptions) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            return new subscription_1.Subscription({
                client: this.client,
                entity: this,
                options: subscriptionOptions,
            });
        }
        else
            throw new Error('Subscription error: subscription module disabled');
    }
    /**
     * How many active subscriptions use this entity.
     *
     * @internal
     */
    get subscriptionsCount() {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled')
            return this.subscriptionStateIds.length;
        else
            throw new Error('Subscriptions count error: subscription module disabled');
    }
    /**
     * Increase the number of active subscriptions.
     *
     * @param subscriptionStateId - Unique identifier of the subscription state object which doesn't use entity anymore.
     *
     * @internal
     */
    increaseSubscriptionCount(subscriptionStateId) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            if (!this.subscriptionStateIds.includes(subscriptionStateId))
                this.subscriptionStateIds.push(subscriptionStateId);
        }
        else
            throw new Error('Subscriptions count error: subscription module disabled');
    }
    /**
     * Decrease the number of active subscriptions.
     *
     * **Note:** As long as the entity is used by at least one subscription, it can't be removed from the subscription.
     *
     * @param subscriptionStateId - Unique identifier of the subscription state object which doesn't use entity anymore.
     *
     * @internal
     */
    decreaseSubscriptionCount(subscriptionStateId) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
            const index = this.subscriptionStateIds.indexOf(subscriptionStateId);
            if (index >= 0)
                this.subscriptionStateIds.splice(index, 1);
        }
        else
            throw new Error('Subscriptions count error: subscription module disabled');
    }
    /**
     * Stringify entity object.
     *
     * @returns Serialized entity object.
     */
    toString() {
        return `${this.constructor.name} { nameOrId: ${this._nameOrId}, subscriptionsCount: ${this.subscriptionsCount} }`;
    }
}
exports.Entity = Entity;
