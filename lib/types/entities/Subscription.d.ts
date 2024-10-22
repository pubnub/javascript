import { SubscribeCapable } from './SubscribeCapable';
import { SubscriptionSet } from './SubscriptionSet';
/**
 * Single-entity subscription object which can be used to receive and handle real-time updates.
 */
export declare class Subscription extends SubscribeCapable {
    /**
     * Merge entities' subscription objects into subscription set.
     *
     * @param subscription - Other entity's subscription object to be merged with receiver.
     * @return Subscription set which contains both receiver and other entities' subscription objects.
     */
    addSubscription(subscription: Subscription): SubscriptionSet;
}
