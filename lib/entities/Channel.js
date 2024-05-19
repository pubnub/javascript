"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
const Subscription_1 = require("./Subscription");
class Channel {
    constructor(channelName, eventEmitter, pubnub) {
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
        this.name = channelName;
    }
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
