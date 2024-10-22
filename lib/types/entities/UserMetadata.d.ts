import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';
/**
 * First-class objects which provides access to the user app context object-specific APIs.
 */
export declare class UserMetadata {
    /**
     * Create user's app context subscription object for real-time updates.
     *
     * Create subscription object which can be used to subscribe to the real-time updates sent to the specific user
     * app context object.
     *
     * @param [subscriptionOptions] - User's app context subscription object behavior customization options.
     *
     * @returns Configured and ready to use user's app context subscription object.
     */
    subscription(subscriptionOptions?: SubscriptionOptions): Subscription;
}
