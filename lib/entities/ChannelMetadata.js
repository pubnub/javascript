"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelMetadata = void 0;
var Subscription_1 = require("./Subscription");
var ChannelMetadata = /** @class */ (function () {
    function ChannelMetadata(id, eventEmitter, pubnub) {
        this.id = id;
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
    }
    ChannelMetadata.prototype.subscription = function (subscriptionOptions) {
        return new Subscription_1.Subscription({
            channels: [this.id],
            channelGroups: [],
            subscriptionOptions: subscriptionOptions,
            eventEmitter: this.eventEmitter,
            pubnub: this.pubnub,
        });
    };
    return ChannelMetadata;
}());
exports.ChannelMetadata = ChannelMetadata;
