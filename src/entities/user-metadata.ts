import { Entity } from './entity';

/**
 * First-class objects which provides access to the user app context object-specific APIs.
 */
export class UserMetadata extends Entity {
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
  override get entityType(): 'Channel' | 'ChannelGroups' | 'ChannelMetadata' | 'UserMetadata' {
    return 'UserMetadata';
  }

  /**
   * Get unique user metadata object identifier.
   *
   * @returns User metadata identifier.
   */
  get id(): string {
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
  override subscriptionNames(_receivePresenceEvents?: boolean): string[] {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') return [this.id];
    else throw new Error('Unsubscription error: subscription module disabled');
  }
}
