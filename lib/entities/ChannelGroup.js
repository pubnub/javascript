import { Subscription } from './Subscription';
export class ChannelGroup {
    constructor(channelGroup, eventEmitter, pubnub) {
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
        this.name = channelGroup;
    }
    subscription(subscriptionOptions) {
        return new Subscription({
            channels: [],
            channelGroups: (subscriptionOptions === null || subscriptionOptions === void 0 ? void 0 : subscriptionOptions.receivePresenceEvents) ? [this.name, `${this.name}-pnpres`] : [this.name],
            subscriptionOptions: subscriptionOptions,
            eventEmitter: this.eventEmitter,
            pubnub: this.pubnub,
        });
    }
}
