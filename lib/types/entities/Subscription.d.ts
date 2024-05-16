import type { PubNubCore as PubNub } from '../core/pubnub-common';
import { Listener } from '../core/components/listener_manager';
import EventEmitter from '../core/components/eventEmitter';
import { SubscribeCapable } from './SubscribeCapable';
import { SubscriptionOptions } from './commonTypes';
import { SubscriptionSet } from './SubscriptionSet';
export declare class Subscription extends SubscribeCapable {
    protected channelNames: string[];
    protected groupNames: string[];
    protected options?: SubscriptionOptions;
    protected pubnub: PubNub<unknown, unknown>;
    protected eventEmitter: EventEmitter;
    protected listener: Listener;
    constructor({ channels, channelGroups, subscriptionOptions, eventEmitter, pubnub, }: {
        channels: string[];
        channelGroups: string[];
        subscriptionOptions?: SubscriptionOptions;
        eventEmitter: EventEmitter;
        pubnub: PubNub<unknown, unknown>;
    });
    addSubscription(subscription: Subscription): SubscriptionSet;
}
