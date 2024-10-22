import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';
/**
 * First-class objects which provides access to the channel app context object-specific APIs.
 */
export declare class ChannelMetadata {
    /**
     * Create channel's app context subscription object for real-time updates.
     *
     * Create subscription object which can be used to subscribe to the real-time updates sent to the specific channel
     * app context object.
     *
     * @param [subscriptionOptions] - Channel's app context subscription object behavior customization options.
     *
     * @returns Configured and ready to use channel's app context subscription object.
     */
    subscription(subscriptionOptions?: SubscriptionOptions): Subscription;
}
