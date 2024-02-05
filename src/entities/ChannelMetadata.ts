import { Subscription } from './Subscription';
import { SubscriptionOptions } from './commonTypes';

export class ChannelMetadata {
  private id: string;
  private eventEmitter: any;
  private pubnub: any;

  constructor(id: string, eventEmitter: any, pubnub: any) {
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
