"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMetadata = void 0;
const Subscription_1 = require("./Subscription");
/**
 * First-class objects which provides access to the user app context object-specific APIs.
 */
class UserMetadata {
    /**
     * Create user app context object entity.
     *
     * @param id - User app context object identifier which will be used with subscription loop.
     * @param eventEmitter - Event emitter, which will notify listeners about updates received on
     * channel's subscription.
     * @param pubnub - PubNub instance which will use this entity.
     *
     * @returns Ready to use user app context object entity.
     *
     * @internal
     */
    constructor(id, eventEmitter, pubnub) {
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
        this.id = id;
    }
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
    subscription(subscriptionOptions) {
        if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
            return new Subscription_1.Subscription({
                channels: [this.id],
                channelGroups: [],
                subscriptionOptions: subscriptionOptions,
                eventEmitter: this.eventEmitter,
                pubnub: this.pubnub,
            });
        }
        else
            throw new Error('Subscription error: subscription event engine module disabled');
    }
}
exports.UserMetadata = UserMetadata;
