"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMetadata = void 0;
var Subscription_1 = require("./Subscription");
var UserMetadata = /** @class */ (function () {
    function UserMetadata(id, eventEmitter, pubnub) {
        this.id = id;
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
    }
    UserMetadata.prototype.subscription = function (subscriptionOptions) {
        return new Subscription_1.Subscription({
            channels: [this.id],
            channelGroups: [],
            subscriptionOptions: subscriptionOptions,
            eventEmitter: this.eventEmitter,
            pubnub: this.pubnub,
        });
    };
    return UserMetadata;
}());
exports.UserMetadata = UserMetadata;
