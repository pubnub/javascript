import { DataSyncSubscribable } from './data-sync-subscribable';

/**
 * First-class object which provides access to the real-time updates of a DataSync `Entity` object.
 */
export class DataSyncEntity extends DataSyncSubscribable {
  /**
   * Retrieve entity type.
   *
   * @return One of known entity types.
   *
   * @internal
   */
  override get entityType(): 'DataSyncEntity' {
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
  protected override withProjection(projection?: string): DataSyncEntity {
    return new DataSyncEntity(this._nameOrId, this.client, projection);
  }
}
