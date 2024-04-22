"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMetadata = void 0;
const Subscription_1 = require("./Subscription");
class UserMetadata {
    constructor(id, eventEmitter, pubnub) {
        this.id = id;
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
    }
    subscription(subscriptionOptions) {
        return new Subscription_1.Subscription({
            channels: [this.id],
            channelGroups: [],
            subscriptionOptions: subscriptionOptions,
            eventEmitter: this.eventEmitter,
            pubnub: this.pubnub,
        });
    }
}
exports.UserMetadata = UserMetadata;
