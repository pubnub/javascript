import type { PubNubCore as PubNub } from '../core/pubnub-common';
import EventEmitter from '../core/components/eventEmitter';
import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';

/**
 * First-class objects which provides access to the channel-specific APIs.
 */
export class Channel {
  /**
   * Event emitter, which will notify listeners about updates received on channel's subscription.
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
   * Channel entity name.
   *
   * @internal
   */
  private readonly name: string;

  /**
   * Create simple channel entity.
   *
   * @param name - Name of the channel which will be used with subscription loop.
   * @param eventEmitter - Event emitter, which will notify listeners about updates received on
   * channel's subscription.
   * @param pubnub - PubNub instance which will use this entity.
   *
   * @returns Ready to use channel entity.
   *
   * @internal
   */
  constructor(name: string, eventEmitter: EventEmitter, pubnub: PubNub<unknown, unknown>) {
    this.eventEmitter = eventEmitter;
    this.pubnub = pubnub;
    this.name = name;
  }

  /**
   * Create channel's subscription object for real-time updates.
   *
   * Create subscription object which can be used to subscribe to the real-time updates sent to the specific channel.
   *
   * @param [subscriptionOptions] - Channel's subscription object behavior customization options.
   *
   * @returns Configured and ready to use channel's subscription object.
   */
  subscription(subscriptionOptions?: SubscriptionOptions) {
    if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
      const channels = [this.name];
      if (subscriptionOptions?.receivePresenceEvents && !this.name.endsWith('-pnpres'))
        channels.push(`${this.name}-pnpres`);

      return new Subscription({
        channels,
        channelGroups: [],
        subscriptionOptions: subscriptionOptions,
        eventEmitter: this.eventEmitter,
        pubnub: this.pubnub,
      });
    } else throw new Error('Subscription error: subscription event engine module disabled');
  }
}
