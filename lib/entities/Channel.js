import { Subscription } from './Subscription';
export class Channel {
    constructor(channelName, eventEmitter, pubnub) {
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
        this.name = channelName;
    }
    subscription(subscriptionOptions) {
        return new Subscription({
            channels: (subscriptionOptions === null || subscriptionOptions === void 0 ? void 0 : subscriptionOptions.receivePresenceEvents) ? [this.name, `${this.name}-pnpres`] : [this.name],
            channelGroups: [],
            subscriptionOptions: subscriptionOptions,
            eventEmitter: this.eventEmitter,
            pubnub: this.pubnub,
        });
    }
}
