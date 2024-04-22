"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const SubscribeCapable_1 = require("./SubscribeCapable");
const SubscriptionSet_1 = require("./SubscriptionSet");
class Subscription extends SubscribeCapable_1.SubscribeCapable {
    constructor({ channels, channelGroups, subscriptionOptions, eventEmitter, pubnub, }) {
        super();
        this.channelNames = [];
        this.groupNames = [];
        this.channelNames = channels;
        this.groupNames = channelGroups;
        this.options = subscriptionOptions;
        this.pubnub = pubnub;
        this.eventEmitter = eventEmitter;
        this.listener = {};
        eventEmitter.addListener(this.listener, this.channelNames.filter((c) => !c.endsWith('-pnpres')), this.groupNames.filter((cg) => !cg.endsWith('-pnpres')));
    }
    addSubscription(subscription) {
        return new SubscriptionSet_1.SubscriptionSet({
            channels: [...this.channelNames, ...subscription.channels],
            channelGroups: [...this.groupNames, ...subscription.channelGroups],
            subscriptionOptions: Object.assign(Object.assign({}, this.options), subscription === null || subscription === void 0 ? void 0 : subscription.options),
            eventEmitter: this.eventEmitter,
            pubnub: this.pubnub,
        });
    }
}
exports.Subscription = Subscription;
