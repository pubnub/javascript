"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSyncUser = void 0;
const data_sync_subscribable_1 = require("./data-sync-subscribable");
/**
 * First-class object which provides access to the real-time updates of a DataSync `User` object.
 */
class DataSyncUser extends data_sync_subscribable_1.DataSyncSubscribable {
    /**
     * Retrieve entity type.
     *
     * @return One of known entity types.
     *
     * @internal
     */
    get entityType() {
        return 'DataSyncUser';
    }
    /**
     * Create a copy of the receiver which observes `projection` of the same DataSync `User` object.
     *
     * @param [projection] - Normalized name of the projection to observe.
     *
     * @returns `DataSyncUser` entity bound to `projection`.
     *
     * @internal
     */
    withProjection(projection) {
        return new DataSyncUser(this._nameOrId, this.client, projection);
    }
}
exports.DataSyncUser = DataSyncUser;
