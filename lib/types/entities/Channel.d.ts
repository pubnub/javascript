import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';
/**
 * First-class objects which provides access to the channel-specific APIs.
 */
export declare class Channel {
    /**
     * Create channel's subscription object for real-time updates.
     *
     * Create subscription object which can be used to subscribe to the real-time updates sent to the specific channel.
     *
     * @param [subscriptionOptions] - Channel's subscription object behavior customization options.
     *
     * @returns Configured and ready to use channel's subscription object.
     */
    subscription(subscriptionOptions?: SubscriptionOptions): Subscription;
}
