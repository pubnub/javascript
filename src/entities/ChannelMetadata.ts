import { Subscription } from './Subscription';
import { SubscriptionOptions, EventEmitter } from './commonTypes';
import type PubNub from '../core/pubnub-common';

export class ChannelMetadata {
  private id: string;
  private eventEmitter: EventEmitter;
  private pubnub: PubNub;

  constructor(id: string, eventEmitter: EventEmitter, pubnub: PubNub) {
    this.id = id;
    this.eventEmitter = eventEmitter;
    this.pubnub = pubnub;
  }
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
