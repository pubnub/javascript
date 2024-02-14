import { SubscriptionSet } from './SubscriptionSet';
import { SubscribeCapable, SubscriptionOptions, EventEmitter, Listener } from './commonTypes';
import type PubNub from '../core/pubnub-common';

export class Subscription implements SubscribeCapable {
  private channelNames: string[] = [];
  private groupNames: string[] = [];
  private options?: SubscriptionOptions;
  private pubnub: PubNub;
  private eventEmitter: EventEmitter;

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
    this.channelNames = channels;
    this.groupNames = channelGroups;
    this.options = subscriptionOptions;
    this.pubnub = pubnub;
    this.eventEmitter = eventEmitter;
  }

  subscribe() {
    this.pubnub.subscribe({
      channels: this.channelNames,
      channelGroups: this.groupNames,
      ...(this.options?.cursor?.timetoken && { timetoken: this.options.cursor.timetoken }),
    });
  }
  unsubscribe() {
    this.pubnub.unsubscribe({
      channels: this.channelNames.filter((c) => !c.endsWith('-pnpres')),
      channelGroups: this.groupNames.filter((cg) => !cg.endsWith('-pnpres')),
    });
  }

  addListener(listener: Listener) {
    this.eventEmitter.addListener(
      listener,
      this.channelNames.filter((c) => !c.endsWith('-pnpres')),
      this.groupNames.filter((cg) => !cg.endsWith('-pnpres')),
    );
  }
  removeListener(listener: Listener) {
    this.eventEmitter.removeListener(listener, this.channelNames, this.groupNames);
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

  get channels(): string[] {
    return this.channelNames.slice(0);
  }
  get channelGroups(): string[] {
    return this.groupNames.slice(0);
  }
}
