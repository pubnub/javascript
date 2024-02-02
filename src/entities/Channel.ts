import { Subscription } from './Subscription';
import { SubscriptionOptions } from './commonTypes';

export class Channel {
  private name: string;
  private eventEmitter: any;
  private pubnub: any;

  constructor(channelName: string, eventEmitter: any, pubnub: any) {
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
