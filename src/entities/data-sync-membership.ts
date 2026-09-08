import { DataSyncSubscribable } from './data-sync-subscribable';

/**
 * First-class object which provides access to the real-time updates of a DataSync `Membership`
 * object.
 *
 * **Note:** A membership identifier is composite (`{userId}:{channelId}`) and is used verbatim as
 * the name of the observed data channel.
 *
 * **Important:** The service delivers membership changes on the data channels of **both linked
 * entities** (the user identifier and the channel identifier), and never on the membership's own
 * identifier. Observe `pubnub.dataSyncUser(...)` and/or `pubnub.dataSyncChannel(...)` to receive
 * membership updates; this entity is only useful if a key set is configured to publish membership
 * changes on the membership identifier itself.
 */
export class DataSyncMembership extends DataSyncSubscribable {
  /**
   * Retrieve entity type.
   *
   * @return One of known entity types.
   *
   * @internal
   */
  override get entityType(): 'DataSyncMembership' {
    return 'DataSyncMembership';
  }

  /**
   * Create a copy of the receiver which observes `projection` of the same DataSync `Membership`
   * object.
   *
   * @param [projection] - Normalized name of the projection to observe.
   *
   * @returns `DataSyncMembership` entity bound to `projection`.
   *
   * @internal
   */
  protected override withProjection(projection?: string): DataSyncMembership {
    return new DataSyncMembership(this._nameOrId, this.client, projection);
  }
}
