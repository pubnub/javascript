import * as Subscription from '../../core/types/api/subscription';
import { EventEmitCapable } from './event-emit-capable';

/**
 * SubscriptionCapable entity type.
 *
 * @internal
 */
export enum SubscriptionType {
  /**
   * Channel identifier, which is part of the URI path.
   */
  Channel,

  /**
   * Channel group identifiers, which is part of the query parameters.
   */
  ChannelGroup,
}

/**
 * PubNub entity subscription configuration options.
 */
export type SubscriptionOptions = {
  /**
   * Whether presence events for an entity should be received or not.
   */
  receivePresenceEvents?: boolean;

  /**
   * Real-time event filtering function.
   *
   * Function can be used to filter out events which shouldn't be populated to the registered event listeners.
   *
   * **Note:** This function is called for each received event.
   *
   * @param event - Pre-processed event object from real-time subscription stream.
   *
   * @returns `true` if event should be populated to the event listeners.
   */
  filter?: (event: Subscription.SubscriptionResponse['messages'][0]) => boolean;
};

/**
 * Common interface for entities which can be used in subscription.
 */
export interface SubscriptionCapable {
  /**
   * Create a subscribable's subscription object for real-time updates.
   *
   * Create a subscription object which can be used to subscribe to the real-time updates sent to the specific data
   * stream.
   *
   * @param [subscriptionOptions] - Subscription object behavior customization options.
   *
   * @returns Configured and ready to use subscribable's subscription object.
   */
  subscription(subscriptionOptions?: SubscriptionOptions): EventEmitCapable;

  /**
   * Type of subscription entity.
   *
   * Type defines where it will be used with multiplexed subscribe REST API calls.
   *
   * @retuerns One of {@link SubscriptionType} enum fields.
   *
   * @internal
   */
  subscriptionType: SubscriptionType;

  /**
   * Names for an object to be used in subscription.
   *
   * Provided strings will be used with multiplexed subscribe REST API calls.
   *
   * @param receivePresenceEvents - Whether presence events should be observed or not.
   *
   * @returns List of names with multiplexed subscribe REST API calls (may include additional names to receive presence
   * updates).
   *
   * @internal
   */
  subscriptionNames(receivePresenceEvents?: boolean): string[];

  /**
   * How many active subscriptions use this entity.
   *
   * @internal
   */
  subscriptionsCount: number;

  /**
   * Increase the number of active subscriptions.
   *
   * @param subscriptionStateId - Unique identifier of the subscription state object which will use entity.
   *
   * @internal
   */
  increaseSubscriptionCount(subscriptionStateId: string): void;

  /**
   * Decrease the number of active subscriptions.
   *
   * **Note:** As long as the entity is used by at least one subscription, it can't be removed from the subscription.
   *
   * @param subscriptionStateId - Unique identifier of the subscription state object which doesn't use entity anymore.
   *
   * @internal
   */
  decreaseSubscriptionCount(subscriptionStateId: string): void;
}
