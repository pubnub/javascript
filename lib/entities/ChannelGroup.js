"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelGroup = void 0;
const Subscription_1 = require("./Subscription");
/**
 * First-class objects which provides access to the channel group-specific APIs.
 */
class ChannelGroup {
    /**
     * Create simple channel entity.
     *
     * @param name - Name of the channel group which will be used with subscription loop.
     * @param eventEmitter - Event emitter, which will notify listeners about updates received on
     * channel group's subscription.
     * @param pubnub - PubNub instance which will use this entity.
     *
     * @returns Ready to use channel group entity.
     *
     * @internal
     */
    constructor(name, eventEmitter, pubnub) {
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
        this.name = name;
    }
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
    subscription(subscriptionOptions) {
        if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
            return new Subscription_1.Subscription({
                channels: [],
                channelGroups: (subscriptionOptions === null || subscriptionOptions === void 0 ? void 0 : subscriptionOptions.receivePresenceEvents) ? [this.name, `${this.name}-pnpres`] : [this.name],
                subscriptionOptions: subscriptionOptions,
                eventEmitter: this.eventEmitter,
                pubnub: this.pubnub,
            });
        }
        else
            throw new Error('Subscription error: subscription event engine module disabled');
    }
}
exports.ChannelGroup = ChannelGroup;
