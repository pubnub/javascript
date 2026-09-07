"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSyncEntity = void 0;
const data_sync_subscribable_1 = require("./data-sync-subscribable");
/**
 * First-class object which provides access to the real-time updates of a DataSync `Entity` object.
 */
class DataSyncEntity extends data_sync_subscribable_1.DataSyncSubscribable {
    /**
     * Retrieve entity type.
     *
     * @return One of known entity types.
     *
     * @internal
     */
    get entityType() {
        return 'DataSyncEntity';
    }
    /**
     * Create a copy of the receiver which observes `projection` of the same DataSync `Entity` object.
     *
     * @param [projection] - Normalized name of the projection to observe.
     *
     * @returns `DataSyncEntity` entity bound to `projection`.
     *
     * @internal
     */
    withProjection(projection) {
        return new DataSyncEntity(this._nameOrId, this.client, projection);
    }
}
exports.DataSyncEntity = DataSyncEntity;
