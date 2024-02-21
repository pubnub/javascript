import { SubscriptionSet } from './SubscriptionSet';
import { SubscriptionOptions, EventEmitter, Listener } from './commonTypes';
import type PubNub from '../core/pubnub-common';
import { SubscribeCapable } from './SubscribeCapable';

export class Subscription extends SubscribeCapable {
  protected channelNames: string[] = [];
  protected groupNames: string[] = [];
  protected options?: SubscriptionOptions;
  protected pubnub: PubNub;
  protected eventEmitter: EventEmitter;
  protected listener: Listener;

  constructor({
    channels,
    channelGroups,
    subscriptionOptions,
    eventEmitter,
    pubnub,
  }: {
    channels: string[];
    channelGroups: string[];
    subscriptionOptions?: SubscriptionOptions;
    eventEmitter: EventEmitter;
    pubnub: PubNub;
  }) {
    super();
    this.channelNames = channels;
    this.groupNames = channelGroups;
    this.options = subscriptionOptions;
    this.pubnub = pubnub;
    this.eventEmitter = eventEmitter;
    this.listener = {};
    eventEmitter.addListener(
      this.listener,
      this.channelNames.filter((c) => !c.endsWith('-pnpres')),
      this.groupNames.filter((cg) => !cg.endsWith('-pnpres')),
    );
  }
  addSubscription(subscription: Subscription) {
    return new SubscriptionSet({
      channels: [...this.channelNames, ...subscription.channels],
      channelGroups: [...this.groupNames, ...subscription.channelGroups],
      subscriptionOptions: { ...this.options, ...subscription?.options },
      eventEmitter: this.eventEmitter,
      pubnub: this.pubnub,
    });
  }
}
