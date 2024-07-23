"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionSet = void 0;
const SubscribeCapable_1 = require("./SubscribeCapable");
class SubscriptionSet extends SubscribeCapable_1.SubscribeCapable {
    constructor({ channels = [], channelGroups = [], subscriptionOptions, eventEmitter, pubnub, }) {
        super();
        this.channelNames = [];
        this.groupNames = [];
        this.subscriptionList = [];
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
        eventEmitter.addListener(this.listener, this.channelNames.filter((c) => !c.endsWith('-pnpres')), this.groupNames.filter((cg) => !cg.endsWith('-pnpres')));
    }
    addSubscription(subscription) {
        this.subscriptionList.push(subscription);
        this.channelNames = [...this.channelNames, ...subscription.channels];
        this.groupNames = [...this.groupNames, ...subscription.channelGroups];
        this.eventEmitter.addListener(this.listener, subscription.channels, subscription.channelGroups);
    }
    removeSubscription(subscription) {
        const channelsToRemove = subscription.channels;
        const groupsToRemove = subscription.channelGroups;
        this.channelNames = this.channelNames.filter((c) => !channelsToRemove.includes(c));
        this.groupNames = this.groupNames.filter((cg) => !groupsToRemove.includes(cg));
        this.subscriptionList = this.subscriptionList.filter((s) => s !== subscription);
        this.eventEmitter.removeListener(this.listener, channelsToRemove, groupsToRemove);
    }
    addSubscriptionSet(subscriptionSet) {
        this.subscriptionList = [...this.subscriptionList, ...subscriptionSet.subscriptions];
        this.channelNames = [...this.channelNames, ...subscriptionSet.channels];
        this.groupNames = [...this.groupNames, ...subscriptionSet.channelGroups];
        this.eventEmitter.addListener(this.listener, subscriptionSet.channels, subscriptionSet.channelGroups);
    }
    removeSubscriptionSet(subscriptionSet) {
        const channelsToRemove = subscriptionSet.channels;
        const groupsToRemove = subscriptionSet.channelGroups;
        this.channelNames = this.channelNames.filter((c) => !channelsToRemove.includes(c));
        this.groupNames = this.groupNames.filter((cg) => !groupsToRemove.includes(cg));
        this.subscriptionList = this.subscriptionList.filter((s) => !subscriptionSet.subscriptions.includes(s));
        this.eventEmitter.removeListener(this.listener, channelsToRemove, groupsToRemove);
    }
    get subscriptions() {
        return this.subscriptionList.slice(0);
    }
}
exports.SubscriptionSet = SubscriptionSet;
