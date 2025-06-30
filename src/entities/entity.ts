import { SubscriptionCapable, SubscriptionType, SubscriptionOptions } from './interfaces/subscription-capable';
import { EntityInterface } from './interfaces/entity-interface';
import { PubNubCore as PubNub } from '../core/pubnub-common';
import { Subscription } from './subscription';

/**
 * Common entity interface.
 */
export abstract class Entity implements EntityInterface, SubscriptionCapable {
  /**
   * List of subscription state object IDs which are using this entity.
   *
   * @internal
   */
  private subscriptionStateIds: string[] = [];

  /**
   * PubNub instance which has been used to create this entity.
   *
   * @internal
   */
  readonly client: PubNub<unknown, unknown>;

  /**
   * Unique entity identification.
   *
   * **Note:** Depending on the entity type, this field may contain either its name or its ID.
   *
   * @internal
   */
  protected readonly _nameOrId: string;

  /**
   * Create an entity instance.
   *
   * @param nameOrId - Identifier which will be used with subscription loop.
   * @param client - PubNub instance which has been used to create this entity.
   *
   * @internal
   */
  constructor(nameOrId: string, client: PubNub<unknown, unknown>) {
    this.client = client;
    this._nameOrId = nameOrId;
  }

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
  get entityType(): 'Channel' | 'ChannelGroups' | 'ChannelMetadata' | 'UserMetadata' {
    return 'Channel';
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
  get subscriptionType(): SubscriptionType {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') return SubscriptionType.Channel;
    else throw new Error('Subscription type error: subscription module disabled');
  }

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
  subscriptionNames(receivePresenceEvents?: boolean): string[] {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      return [
        this._nameOrId,
        ...(receivePresenceEvents && !this._nameOrId.endsWith('-pnpres') ? [`${this._nameOrId}-pnpres`] : []),
      ];
    } else throw new Error('Subscription names error: subscription module disabled');
  }

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
  subscription(subscriptionOptions?: SubscriptionOptions): Subscription {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      return new Subscription({
        client: this.client,
        entity: this,
        options: subscriptionOptions,
      });
    } else throw new Error('Subscription error: subscription module disabled');
  }

  /**
   * How many active subscriptions use this entity.
   *
   * @internal
   */
  get subscriptionsCount(): number {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') return this.subscriptionStateIds.length;
    else throw new Error('Subscriptions count error: subscription module disabled');
  }

  /**
   * Increase the number of active subscriptions.
   *
   * @param subscriptionStateId - Unique identifier of the subscription state object which doesn't use entity anymore.
   *
   * @internal
   */
  increaseSubscriptionCount(subscriptionStateId: string): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (!this.subscriptionStateIds.includes(subscriptionStateId)) this.subscriptionStateIds.push(subscriptionStateId);
    } else throw new Error('Subscriptions count error: subscription module disabled');
  }

  /**
   * Decrease the number of active subscriptions.
   *
   * **Note:** As long as the entity is used by at least one subscription, it can't be removed from the subscription.
   *
   * @param subscriptionStateId - Unique identifier of the subscription state object which doesn't use entity anymore.
   *
   * @internal
   */
  decreaseSubscriptionCount(subscriptionStateId: string): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      const index = this.subscriptionStateIds.indexOf(subscriptionStateId);
      if (index >= 0) this.subscriptionStateIds.splice(index, 1);
    } else throw new Error('Subscriptions count error: subscription module disabled');
  }

  /**
   * Stringify entity object.
   *
   * @returns Serialized entity object.
   */
  toString(): string {
    return `${this.entityType} { nameOrId: ${this._nameOrId}, subscriptionsCount: ${this.subscriptionsCount} }`;
  }
}
