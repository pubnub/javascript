"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelMetadata = void 0;
const entity_1 = require("./entity");
/**
 * First-class objects which provides access to the channel app context object-specific APIs.
 */
class ChannelMetadata extends entity_1.Entity {
    /**
     * Get unique channel metadata object identifier.
     *
     * @returns Channel metadata identifier.
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
exports.ChannelMetadata = ChannelMetadata;
