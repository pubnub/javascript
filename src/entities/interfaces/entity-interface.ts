import type { PubNubCore as PubNub } from '../../core/pubnub-common';
import { SubscriptionCapable } from './subscription-capable';

/**
 * Known subscribable entity types.
 *
 * @internal
 */
export type EntityType =
  | 'Channel'
  | 'ChannelGroups'
  | 'ChannelMetadata'
  | 'UserMetadata'
  | 'DataSyncUser'
  | 'DataSyncChannel'
  | 'DataSyncMembership'
  | 'DataSyncEntity'
  | 'DataSyncRelationship';

/**
 * Common entity interface.
 */
export interface EntityInterface extends SubscriptionCapable {
  /**
   * Creates and returns an instance of the PubNub client.
   *
   * @return {PubNub<unknown, unknown>} An instance of the PubNub client configured with specified parameters.
   *
   * @internal
   */
  client: PubNub<unknown, unknown>;

  /**
   * Retrieve entity type.
   *
   * @return One of known {@link EntityType entity types}.
   *
   * @internal
   */
  entityType: EntityType;
}
