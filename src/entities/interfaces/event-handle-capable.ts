import * as Subscription from '../../core/types/api/subscription';

export interface EventHandleCapable {
  /**
   * Subscription input associated with this subscribing capable object
   *
   * @param forUnsubscribe - Whether list subscription input created for unsubscription (means entity should be free).
   *
   * @returns Subscription input object.
   *
   * @internal
   */
  subscriptionInput(forUnsubscribe: boolean): Subscription.SubscriptionInput;

  /**
   * Dispatch received a real-time update.
   *
   * @param cursor - A time cursor for the next portion of events.
   * @param event - A real-time event from multiplexed subscription.
   *
   * @internal
   */
  handleEvent(cursor: Subscription.SubscriptionCursor, event: Subscription.SubscriptionResponse['messages'][0]): void;

  /**
   * Invalidate subscription object.
   *
   * Clean up resources used by a subscription object.
   *
   * @param forDestroy - Whether subscription object invalidated as part of PubNub client destroy process or not.
   *
   * @internal
   */
  invalidate(forDestroy: boolean): void;
}
