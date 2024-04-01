import { Subscription } from './Subscription';
export class UserMetadata {
    constructor(id, eventEmitter, pubnub) {
        this.id = id;
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
    }
    subscription(subscriptionOptions) {
        return new Subscription({
            channels: [this.id],
            channelGroups: [],
            subscriptionOptions: subscriptionOptions,
            eventEmitter: this.eventEmitter,
            pubnub: this.pubnub,
        });
    }
}
