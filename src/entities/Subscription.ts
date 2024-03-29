import type { PubNubCore as PubNub } from '../core/pubnub-common';
import { Listener } from '../core/components/listener_manager';
import EventEmitter from '../core/components/eventEmitter';
import { SubscribeCapable } from './SubscribeCapable';
import { SubscriptionOptions } from './commonTypes';
import { SubscriptionSet } from './SubscriptionSet';

export class Subscription extends SubscribeCapable {
  protected channelNames: string[] = [];
  protected groupNames: string[] = [];
  protected options?: SubscriptionOptions;
  protected pubnub: PubNub<unknown, unknown>;
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
    pubnub: PubNub<unknown, unknown>;
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
