import { SubscribeCapable } from './SubscribeCapable';
import { Subscription } from './Subscription';
/**
 * Multiple entities subscription set object which can be used to receive and handle real-time
 * updates.
 *
 * Subscription set object represent collection of per-entity subscription objects and allow
 * processing them at once for subscription loop and events handling.
 */
export declare class SubscriptionSet extends SubscribeCapable {
    /**
     * Add additional entity's subscription to the subscription set.
     *
     * **Important:** Changes will be effective only after {@link SubscribeCapable#subscribe} call or
     * next subscription loop.
     *
     * @param subscription - Other entity's subscription object, which should be added.
     */
    addSubscription(subscription: Subscription): void;
    /**
     * Remove entity's subscription object from the set.
     *
     * **Important:** Changes will be effective only after {@link SubscribeCapable#unsubscribe} call or
     * next subscription loop.
     *
     * @param subscription - Other entity's subscription object, which should be removed.
     */
    removeSubscription(subscription: Subscription): void;
    /**
     * Merge with other subscription set object.
     *
     * **Important:** Changes will be effective only after {@link SubscribeCapable#subscribe} call or
     * next subscription loop.
     *
     * @param subscriptionSet - Other entities' subscription set, which should be joined.
     */
    addSubscriptionSet(subscriptionSet: SubscriptionSet): void;
    /**
     * Subtract other subscription set object.
     *
     * **Important:** Changes will be effective only after {@link SubscribeCapable#unsubscribe} call or
     * next subscription loop.
     *
     * @param subscriptionSet - Other entities' subscription set, which should be subtracted.
     */
    removeSubscriptionSet(subscriptionSet: SubscriptionSet): void;
    /**
     * Get list of entities' subscription objects registered in subscription set.
     *
     * @returns Entities' subscription objects list.
     */
    get subscriptions(): Subscription[];
}
