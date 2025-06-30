"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMetadata = void 0;
const entity_1 = require("./entity");
/**
 * First-class objects which provides access to the user app context object-specific APIs.
 */
class UserMetadata extends entity_1.Entity {
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
        return 'UserMetadata';
    }
    /**
     * Get unique user metadata object identifier.
     *
     * @returns User metadata identifier.
     */
    get id() {
        return this._nameOrId;
    }
    /**
     * Names for an object to be used in subscription.
     *
     * Provided strings will be used with multiplexed subscribe REST API calls.
     *
     * @param _receivePresenceEvents - Whether presence events should be observed or not.
     *
     * @returns List of names with multiplexed subscribe REST API calls (may include additional names to receive presence
     * updates).
     *
     * @internal
     */
    subscriptionNames(_receivePresenceEvents) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled')
            return [this.id];
        else
            throw new Error('Unsubscription error: subscription module disabled');
    }
}
exports.UserMetadata = UserMetadata;
