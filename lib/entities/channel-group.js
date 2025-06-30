"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelGroup = void 0;
const subscription_capable_1 = require("./interfaces/subscription-capable");
const entity_1 = require("./entity");
/**
 * First-class objects which provides access to the channel group-specific APIs.
 */
class ChannelGroup extends entity_1.Entity {
    /**
     * Retrieve entity type.
     *
     * There is four types:
     * - Channel
     * - ChannelGroups
     * - ChannelMetadata
     * - UserMetadata
     *
     * @return One of known entity types.
     *
     * @internal
     */
    get entityType() {
        return 'ChannelGroups';
    }
    /**
     * Get a unique channel group name.
     *
     * @returns Channel group name.
     */
    get name() {
        return this._nameOrId;
    }
    /**
     * Type of subscription entity.
     *
     * Type defines where it will be used with multiplexed subscribe REST API calls.
     *
     * @retuerns One of {@link SubscriptionType} enum fields.
     *
     * @internal
     */
    get subscriptionType() {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled')
            return subscription_capable_1.SubscriptionType.ChannelGroup;
        else
            throw new Error('Unsubscription error: subscription module disabled');
    }
}
exports.ChannelGroup = ChannelGroup;
