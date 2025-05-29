import type { PubNubCore as PubNub } from '../../core/pubnub-common';
import { SubscriptionCapable } from './subscription-capable';

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
}
