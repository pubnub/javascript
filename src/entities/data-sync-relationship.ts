import { DataSyncSubscribable } from './data-sync-subscribable';

/**
 * First-class object which provides access to the real-time updates of a DataSync `Relationship`
 * object.
 *
 * **Important:** The service delivers relationship changes on the data channels of **both linked
 * entities** (`entityAId` and `entityBId`), and never on the relationship's own identifier. Observe
 * `pubnub.dataSyncEntity(...)` for the linked entities to receive relationship updates; this entity
 * is only useful if a key set is configured to publish relationship changes on the relationship
 * identifier itself.
 */
export class DataSyncRelationship extends DataSyncSubscribable {
  /**
   * Retrieve entity type.
   *
   * @return One of known entity types.
   *
   * @internal
   */
  override get entityType(): 'DataSyncRelationship' {
    return 'DataSyncRelationship';
  }

  /**
   * Create a copy of the receiver which observes `projection` of the same DataSync `Relationship`
   * object.
   *
   * @param [projection] - Normalized name of the projection to observe.
   *
   * @returns `DataSyncRelationship` entity bound to `projection`.
   *
   * @internal
   */
  protected override withProjection(projection?: string): DataSyncRelationship {
    return new DataSyncRelationship(this._nameOrId, this.client, projection);
  }
}
