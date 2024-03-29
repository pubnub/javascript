import type { PubNubCore as PubNub } from '../core/pubnub-common';
import EventEmitter from '../core/components/eventEmitter';
import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';

export class ChannelMetadata {
  constructor(
    private readonly id: string,
    private readonly eventEmitter: EventEmitter,
    private readonly pubnub: PubNub<unknown, unknown>,
  ) {}

  subscription(subscriptionOptions?: SubscriptionOptions) {
    return new Subscription({
      channels: [this.id],
      channelGroups: [],
      subscriptionOptions: subscriptionOptions,
      eventEmitter: this.eventEmitter,
      pubnub: this.pubnub,
    });
  }
}
