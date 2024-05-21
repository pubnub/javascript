import type { PubNubCore as PubNub } from '../core/pubnub-common';
import EventEmitter from '../core/components/eventEmitter';
import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';

export class ChannelGroup {
  private readonly name: string;

  constructor(
    channelGroup: string,
    private readonly eventEmitter: EventEmitter,
    private readonly pubnub: PubNub<unknown, unknown>,
  ) {
    this.name = channelGroup;
  }

  subscription(subscriptionOptions?: SubscriptionOptions) {
    if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
      return new Subscription({
        channels: [],
        channelGroups: subscriptionOptions?.receivePresenceEvents ? [this.name, `${this.name}-pnpres`] : [this.name],
        subscriptionOptions: subscriptionOptions,
        eventEmitter: this.eventEmitter,
        pubnub: this.pubnub,
      });
    } else throw new Error('Subscription error: subscription event engine module disabled');
  }
}
