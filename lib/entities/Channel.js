"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
var Subscription_1 = require("./Subscription");
var Channel = /** @class */ (function () {
    function Channel(channelName, eventEmitter, pubnub) {
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
        this.name = channelName;
    }
    Channel.prototype.subscription = function (subscriptionOptions) {
        return new Subscription_1.Subscription({
            channels: (subscriptionOptions === null || subscriptionOptions === void 0 ? void 0 : subscriptionOptions.receivePresenceEvents) ? [this.name, "".concat(this.name, "-pnpres")] : [this.name],
            channelGroups: [],
            subscriptionOptions: subscriptionOptions,
            eventEmitter: this.eventEmitter,
            pubnub: this.pubnub,
        });
    };
    return Channel;
}());
exports.Channel = Channel;
