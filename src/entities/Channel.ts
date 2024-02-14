import { Subscription } from './Subscription';
import { SubscriptionOptions, EventEmitter } from './commonTypes';
import type PubNub from '../core/pubnub-common';

export class Channel {
  private name: string;
  private eventEmitter: EventEmitter;
  private pubnub: PubNub;

  constructor(channelName: string, eventEmitter: EventEmitter, pubnub: PubNub) {
    this.name = channelName;
    this.eventEmitter = eventEmitter;
    this.pubnub = pubnub;
  }
  subscription(subscriptionOptions?: SubscriptionOptions) {
    return new Subscription({
      channels: subscriptionOptions?.receivePresenceEvents ? [this.name, `${this.name}-pnpres`] : [this.name],
      channelGroups: [],
      subscriptionOptions: subscriptionOptions,
      eventEmitter: this.eventEmitter,
      pubnub: this.pubnub,
    });
  }
}
