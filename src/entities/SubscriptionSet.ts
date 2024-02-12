import { Subscription } from './Subscription';
import { SubscribeCapable, SubscriptionOptions } from './commonTypes';

export class SubscriptionSet implements SubscribeCapable {
  private channelNames: string[] = [];
  private groupNames: string[] = [];
  private options: SubscriptionOptions;
  private pubnub: any;
  private eventEmitter: any;
  private subscriptionList: Subscription[] = [];

  constructor({
    channels = [],
    channelGroups = [],
    subscriptionOptions,
    eventEmitter,
    pubnub,
  }: {
    channels: string[];
    channelGroups: string[];
    subscriptionOptions: SubscriptionOptions;
    eventEmitter: any;
    pubnub: any;
  }) {
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

  addListener(listener: any) {
    this.eventEmitter.addListener(
      listener,
      this.channelNames.filter((c) => !c.endsWith('-pnpres')),
      this.groupNames.filter((cg) => !cg.endsWith('-pnpres')),
    );
  }
  removeListener(listener: any) {
    this.eventEmitter.removeListener(listener, this.channelNames, this.groupNames);
  }

  addSubscription(subscription: Subscription) {
    this.subscriptionList.push(subscription);
    this.channelNames = [...this.channelNames, ...subscription.channels];
    this.groupNames = [...this.groupNames, ...subscription.channelGroups];
  }

  removeSubscription(subscription: Subscription) {
    const channelsToRemove = subscription.channels;
    const groupsToRemove = subscription.channelGroups;
    this.channelNames = this.channelNames.filter((c) => !channelsToRemove.includes(c));
    this.groupNames = this.groupNames.filter((cg) => !groupsToRemove.includes(cg));
    this.subscriptionList = this.subscriptionList.filter((s) => s !== subscription);
  }

  addSubscriptionSet(subscriptionSet: SubscriptionSet) {
    this.subscriptionList = [...this.subscriptionList, ...subscriptionSet.subscriptions];
    this.channelNames = [...this.channelNames, ...subscriptionSet.channels];
    this.groupNames = [...this.groupNames, ...subscriptionSet.channelGroups];
  }

  removeSubscriptionSet(subscriptionSet: SubscriptionSet) {
    const channelsToRemove = subscriptionSet.channels;
    const groupsToRemove = subscriptionSet.channelGroups;
    this.channelNames = this.channelNames.filter((c) => !channelsToRemove.includes(c));
    this.groupNames = this.groupNames.filter((cg) => !groupsToRemove.includes(cg));
    this.subscriptionList = this.subscriptionList.filter((s) => !subscriptionSet.subscriptions.includes(s));
  }

  get channels() {
    return this.channelNames.slice(0);
  }
  get channelGroups() {
    return this.groupNames.slice(0);
  }
  get subscriptions() {
    return this.subscriptionList.slice(0);
  }
}
