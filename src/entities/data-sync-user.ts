import { DataSyncSubscribable } from './data-sync-subscribable';

/**
 * First-class object which provides access to the real-time updates of a DataSync `User` object.
 */
export class DataSyncUser extends DataSyncSubscribable {
  /**
   * Retrieve entity type.
   *
   * @return One of known entity types.
   *
   * @internal
   */
  override get entityType(): 'DataSyncUser' {
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
  protected override withProjection(projection?: string): DataSyncUser {
    return new DataSyncUser(this._nameOrId, this.client, projection);
  }
}
