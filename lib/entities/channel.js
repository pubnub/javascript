"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
const entity_1 = require("./entity");
/**
 * First-class objects which provides access to the channel-specific APIs.
 */
class Channel extends entity_1.Entity {
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
        return 'Channel';
    }
    /**
     * Get a unique channel name.
     *
     * @returns Channel name.
     */
    get name() {
        return this._nameOrId;
    }
}
exports.Channel = Channel;
