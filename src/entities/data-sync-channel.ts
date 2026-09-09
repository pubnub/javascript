import { DataSyncSubscribable } from './data-sync-subscribable';

/**
 * First-class object which provides access to the real-time updates of a DataSync `Channel` object.
 */
export class DataSyncChannel extends DataSyncSubscribable {
  /**
   * Retrieve entity type.
   *
   * @return One of known entity types.
   *
   * @internal
   */
  override get entityType(): 'DataSyncChannel' {
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
  protected override withProjection(projection?: string): DataSyncChannel {
    return new DataSyncChannel(this._nameOrId, this.client, projection);
  }
}
