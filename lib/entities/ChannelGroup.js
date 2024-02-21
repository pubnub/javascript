"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelGroup = void 0;
var Subscription_1 = require("./Subscription");
var ChannelGroup = /** @class */ (function () {
    function ChannelGroup(channelGroup, eventEmitter, pubnub) {
        this.name = channelGroup;
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
    }
    ChannelGroup.prototype.subscription = function (subscriptionOptions) {
        return new Subscription_1.Subscription({
            channels: [],
            channelGroups: (subscriptionOptions === null || subscriptionOptions === void 0 ? void 0 : subscriptionOptions.receivePresenceEvents) ? [this.name, "".concat(this.name, "-pnpres")] : [this.name],
            subscriptionOptions: subscriptionOptions,
            eventEmitter: this.eventEmitter,
            pubnub: this.pubnub,
        });
    };
    return ChannelGroup;
}());
exports.ChannelGroup = ChannelGroup;
