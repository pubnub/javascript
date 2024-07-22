import type { PubNubCore as PubNub } from '../core/pubnub-common';
import { Listener } from '../core/components/listener_manager';
import EventEmitter from '../core/components/eventEmitter';
import { SubscribeCapable } from './SubscribeCapable';
import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';

export class SubscriptionSet extends SubscribeCapable {
  protected channelNames: string[] = [];
  protected groupNames: string[] = [];
  protected options?: SubscriptionOptions;
  protected pubnub: PubNub<unknown, unknown>;
  protected eventEmitter: EventEmitter;
  protected subscriptionList: Subscription[] = [];
  protected listener: Listener;

  constructor({
    channels = [],
    channelGroups = [],
    subscriptionOptions,
    eventEmitter,
    pubnub,
  }: {
    channels?: string[];
    channelGroups?: string[];
    subscriptionOptions?: SubscriptionOptions;
    eventEmitter: EventEmitter;
    pubnub: PubNub<unknown, unknown>;
  }) {
    super();
    this.options = subscriptionOptions;
    this.eventEmitter = eventEmitter;
    this.pubnub = pubnub;
    channels.forEach((c) => {
      const subscription = this.pubnub.channel(c).subscription(this.options);
      this.channelNames = [...this.channelNames, ...subscription.channels];
      this.subscriptionList.push(subscription);
    });
    channelGroups.forEach((cg) => {
      const subscription = this.pubnub.channelGroup(cg).subscription(this.options);
      this.groupNames = [...this.groupNames, ...subscription.channelGroups];
      this.subscriptionList.push(subscription);
    });
    this.listener = {};
    eventEmitter.addListener(
      this.listener,
      this.channelNames.filter((c) => !c.endsWith('-pnpres')),
      this.groupNames.filter((cg) => !cg.endsWith('-pnpres')),
    );
  }

  addSubscription(subscription: Subscription) {
    this.subscriptionList.push(subscription);
    this.channelNames = [...this.channelNames, ...subscription.channels];
    this.groupNames = [...this.groupNames, ...subscription.channelGroups];
    this.eventEmitter.addListener(this.listener, subscription.channels, subscription.channelGroups);
  }

  removeSubscription(subscription: Subscription) {
    const channelsToRemove = subscription.channels;
    const groupsToRemove = subscription.channelGroups;
    this.channelNames = this.channelNames.filter((c) => !channelsToRemove.includes(c));
    this.groupNames = this.groupNames.filter((cg) => !groupsToRemove.includes(cg));
    this.subscriptionList = this.subscriptionList.filter((s) => s !== subscription);
    this.eventEmitter.removeListener(this.listener, channelsToRemove, groupsToRemove);
  }

  addSubscriptionSet(subscriptionSet: SubscriptionSet) {
    this.subscriptionList = [...this.subscriptionList, ...subscriptionSet.subscriptions];
    this.channelNames = [...this.channelNames, ...subscriptionSet.channels];
    this.groupNames = [...this.groupNames, ...subscriptionSet.channelGroups];
    this.eventEmitter.addListener(this.listener, subscriptionSet.channels, subscriptionSet.channelGroups);
  }

  removeSubscriptionSet(subscriptionSet: SubscriptionSet) {
    const channelsToRemove = subscriptionSet.channels;
    const groupsToRemove = subscriptionSet.channelGroups;
    this.channelNames = this.channelNames.filter((c) => !channelsToRemove.includes(c));
    this.groupNames = this.groupNames.filter((cg) => !groupsToRemove.includes(cg));
    this.subscriptionList = this.subscriptionList.filter((s) => !subscriptionSet.subscriptions.includes(s));
    this.eventEmitter.removeListener(this.listener, channelsToRemove, groupsToRemove);
  }

  get subscriptions(): Subscription[] {
    return this.subscriptionList.slice(0);
  }
}
