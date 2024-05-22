"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelGroup = void 0;
const Subscription_1 = require("./Subscription");
class ChannelGroup {
    constructor(channelGroup, eventEmitter, pubnub) {
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
        this.name = channelGroup;
    }
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
