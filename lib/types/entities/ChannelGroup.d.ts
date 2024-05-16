import type { PubNubCore as PubNub } from '../core/pubnub-common';
import EventEmitter from '../core/components/eventEmitter';
import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';
export declare class ChannelGroup {
    private readonly eventEmitter;
    private readonly pubnub;
    private readonly name;
    constructor(channelGroup: string, eventEmitter: EventEmitter, pubnub: PubNub<unknown, unknown>);
    subscription(subscriptionOptions?: SubscriptionOptions): Subscription;
}
