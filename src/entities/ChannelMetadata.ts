import type { PubNubCore as PubNub } from '../core/pubnub-common';
import EventEmitter from '../core/components/eventEmitter';
import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';

/**
 * First-class objects which provides access to the channel app context object-specific APIs.
 */
export class ChannelMetadata {
  /**
   * Event emitter, which will notify listeners about updates received on channel app context object
   * subscription.
   *
   * @internal
   */
  private readonly eventEmitter: EventEmitter;

  /**
   * PubNub instance which will use this entity.
   *
   * @internal
   */
  private readonly pubnub: PubNub<unknown, unknown>;

  /**
   * Channel app context object identifier.
   *
   * @internal
   */
  private readonly id: string;

  /**
   * Create channel app context object entity.
   *
   * @param id - Channel app context object identifier which will be used with subscription loop.
   * @param eventEmitter - Event emitter, which will notify listeners about updates received on
   * channel's subscription.
   * @param pubnub - PubNub instance which will use this entity.
   *
   * @returns Ready to use channel app context object entity.
   *
   * @internal
   */
  constructor(id: string, eventEmitter: EventEmitter, pubnub: PubNub<unknown, unknown>) {
    this.eventEmitter = eventEmitter;
    this.pubnub = pubnub;
    this.id = id;
  }

  /**
   * Create channel's app context subscription object for real-time updates.
   *
   * Create subscription object which can be used to subscribe to the real-time updates sent to the specific channel
   * app context object.
   *
   * @param [subscriptionOptions] - Channel's app context subscription object behavior customization options.
   *
   * @returns Configured and ready to use channel's app context subscription object.
   */
  subscription(subscriptionOptions?: SubscriptionOptions) {
    if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
      return new Subscription({
        channels: [this.id],
        channelGroups: [],
        subscriptionOptions: subscriptionOptions,
        eventEmitter: this.eventEmitter,
        pubnub: this.pubnub,
      });
    } else throw new Error('Subscription error: subscription module disabled');
  }
}
