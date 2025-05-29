"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionType = void 0;
/**
 * SubscriptionCapable entity type.
 *
 * @internal
 */
var SubscriptionType;
(function (SubscriptionType) {
    /**
     * Channel identifier, which is part of the URI path.
     */
    SubscriptionType[SubscriptionType["Channel"] = 0] = "Channel";
    /**
     * Channel group identifiers, which is part of the query parameters.
     */
    SubscriptionType[SubscriptionType["ChannelGroup"] = 1] = "ChannelGroup";
})(SubscriptionType || (exports.SubscriptionType = SubscriptionType = {}));
