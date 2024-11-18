import type { PubNubCore as PubNub } from '../core/pubnub-common';
import EventEmitter from '../core/components/eventEmitter';
import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';

/**
 * First-class objects which provides access to the channel group-specific APIs.
 */
export class ChannelGroup {
  /**
   * Event emitter, which will notify listeners about updates received on channel group's
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
   * Channel group entity name.
   *
   * @internal
   */
  private readonly name: string;

  /**
   * Create simple channel entity.
   *
   * @param name - Name of the channel group which will be used with subscription loop.
   * @param eventEmitter - Event emitter, which will notify listeners about updates received on
   * channel group's subscription.
   * @param pubnub - PubNub instance which will use this entity.
   *
   * @returns Ready to use channel group entity.
   *
   * @internal
   */
  constructor(name: string, eventEmitter: EventEmitter, pubnub: PubNub<unknown, unknown>) {
    this.eventEmitter = eventEmitter;
    this.pubnub = pubnub;
    this.name = name;
  }

  /**
   * Create channel group's subscription object for real-time updates.
   *
   * Create subscription object which can be used to subscribe to the real-time updates sent to the channels in
   * specific channel group.
   *
   * @param [subscriptionOptions] - Channel group's subscription object behavior customization options.
   *
   * @returns Configured and ready to use channel group's subscription object.
   */
  subscription(subscriptionOptions?: SubscriptionOptions) {
    if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
      const channelGroups = [this.name];
      if (subscriptionOptions?.receivePresenceEvents && !this.name.endsWith('-pnpres'))
        channelGroups.push(`${this.name}-pnpres`);

      return new Subscription({
        channels: [],
        channelGroups,
        subscriptionOptions: subscriptionOptions,
        eventEmitter: this.eventEmitter,
        pubnub: this.pubnub,
      });
    } else throw new Error('Subscription error: subscription event engine module disabled');
  }
}
