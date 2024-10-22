import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';
/**
 * First-class objects which provides access to the channel group-specific APIs.
 */
export declare class ChannelGroup {
    /**
     * Create channel group's subscription object for real-time updates.
     *
     * Create subscription object which can be used to subscribe to the real-time updates sent to the channels in
     * specific channel group.
     *
     * @param [subscriptionOptions] - Channel group's subscription object behavior customization options.
     *
     * @returns Configured and ready to use channel group's subscription object.
     */
    subscription(subscriptionOptions?: SubscriptionOptions): Subscription;
}
