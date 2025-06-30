import { SubscriptionType } from './interfaces/subscription-capable';
import { Entity } from './entity';

/**
 * First-class objects which provides access to the channel group-specific APIs.
 */
export class ChannelGroup extends Entity {
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
    return 'ChannelGroups';
  }

  /**
   * Get a unique channel group name.
   *
   * @returns Channel group name.
   */
  get name(): string {
    return this._nameOrId;
  }

  /**
   * Type of subscription entity.
   *
   * Type defines where it will be used with multiplexed subscribe REST API calls.
   *
   * @retuerns One of {@link SubscriptionType} enum fields.
   *
   * @internal
   */
  override get subscriptionType(): SubscriptionType {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') return SubscriptionType.ChannelGroup;
    else throw new Error('Unsubscription error: subscription module disabled');
  }
}
