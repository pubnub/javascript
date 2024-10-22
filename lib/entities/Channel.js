"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
const Subscription_1 = require("./Subscription");
/**
 * First-class objects which provides access to the channel-specific APIs.
 */
class Channel {
    /**
     * Create simple channel entity.
     *
     * @param name - Name of the channel which will be used with subscription loop.
     * @param eventEmitter - Event emitter, which will notify listeners about updates received on
     * channel's subscription.
     * @param pubnub - PubNub instance which will use this entity.
     *
     * @returns Ready to use channel entity.
     *
     * @internal
     */
    constructor(name, eventEmitter, pubnub) {
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
        this.name = name;
    }
    /**
     * Create channel's subscription object for real-time updates.
     *
     * Create subscription object which can be used to subscribe to the real-time updates sent to the specific channel.
     *
     * @param [subscriptionOptions] - Channel's subscription object behavior customization options.
     *
     * @returns Configured and ready to use channel's subscription object.
     */
    subscription(subscriptionOptions) {
        if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
            return new Subscription_1.Subscription({
                channels: (subscriptionOptions === null || subscriptionOptions === void 0 ? void 0 : subscriptionOptions.receivePresenceEvents) ? [this.name, `${this.name}-pnpres`] : [this.name],
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
exports.Channel = Channel;
