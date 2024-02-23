import { Subscription } from './Subscription';
import { SubscriptionOptions, EventEmitter } from './commonTypes';
import type PubNub from '../core/pubnub-common';

export class ChannelGroup {
  private name: string;
  private eventEmitter: EventEmitter;
  private pubnub: PubNub;

  constructor(channelGroup: string, eventEmitter: EventEmitter, pubnub: PubNub) {
    this.name = channelGroup;
    this.eventEmitter = eventEmitter;
    this.pubnub = pubnub;
  }
  subscription(subscriptionOptions?: SubscriptionOptions) {
    return new Subscription({
      channels: [],
      channelGroups: subscriptionOptions?.receivePresenceEvents ? [this.name, `${this.name}-pnpres`] : [this.name],
      subscriptionOptions: subscriptionOptions,
      eventEmitter: this.eventEmitter,
      pubnub: this.pubnub,
    });
  }
}
