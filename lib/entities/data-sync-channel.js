"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSyncChannel = void 0;
const data_sync_subscribable_1 = require("./data-sync-subscribable");
/**
 * First-class object which provides access to the real-time updates of a DataSync `Channel` object.
 */
class DataSyncChannel extends data_sync_subscribable_1.DataSyncSubscribable {
    /**
     * Retrieve entity type.
     *
     * @return One of known entity types.
     *
     * @internal
     */
    get entityType() {
        return 'DataSyncChannel';
    }
    /**
     * Create a copy of the receiver which observes `projection` of the same DataSync `Channel` object.
     *
     * @param [projection] - Normalized name of the projection to observe.
     *
     * @returns `DataSyncChannel` entity bound to `projection`.
     *
     * @internal
     */
    withProjection(projection) {
        return new DataSyncChannel(this._nameOrId, this.client, projection);
    }
}
exports.DataSyncChannel = DataSyncChannel;
