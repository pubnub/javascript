import { Subscription } from './Subscription';
import { SubscriptionOptions } from './commonTypes';

export class ChannelGroup {
  private name: string;
  private eventEmitter: any;
  private pubnub: any;

  constructor(channelGroup: string, eventEmitter: any, pubnub: any) {
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
