import { Subscription } from './Subscription';
import { SubscribeCapable, SubscriptionOptions } from './commonTypes';

export class SubscriptionSet implements SubscribeCapable {
  private channelNames: string[] = [];
  private groupNames: string[] = [];
  private options: SubscriptionOptions;
  private pubnub: any;
  private eventEmitter: any;
  private subscriptions: Subscription[];

  constructor({
    channels,
    channelGroups,
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
    this.channelNames = [...this.channelNames, ...channels];
    this.groupNames = [...this.groupNames, ...channelGroups];
    this.options = subscriptionOptions;
    this.eventEmitter = eventEmitter;
    this.pubnub = pubnub;
    this.subscriptions = [
      new Subscription({
        channels: this.channelNames,
        channelGroups: this.groupNames,
        subscriptionOptions: this.options,
        eventEmitter: this.eventEmitter,
        pubnub: this.pubnub,
      }),
    ];
  }
  subscribe() {
    this.pubnub.subscribe({
      channels: this.channelNames,
      channelGroups: this.groupNames,
      ...(this.options?.cursor?.timetoken && { timetoken: this.options.cursor.timetoken }),
    });
  }
  unsubscribe() {
    this.pubnub.unsubscribe({ channels: this.channelNames, channelGroups: this.groupNames });
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
    this.subscriptions.push(subscription);
    this.channelNames = [...this.channelNames, ...subscription.channels];
    this.groupNames = [...this.groupNames, ...subscription.channelGroups];
  }

  removeSubscription(subscription: Subscription) {
    const channelsToRemove = subscription.channels;
    const groupsToRemove = subscription.channelGroups;
    this.channelNames = this.channelNames.filter((c) => !channelsToRemove.includes(c));
    this.groupNames = this.groupNames.filter((cg) => !groupsToRemove.includes(cg));
    this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
  }

  get channels() {
    return this.channelNames.slice(0);
  }
  get channelGroups() {
    return this.groupNames.slice(0);
  }
}
