import type { PubNubCore as PubNub } from '../core/pubnub-common';
import { Listener } from '../core/components/listener_manager';
import EventEmitter from '../core/components/eventEmitter';
import { SubscribeCapable } from './SubscribeCapable';
import { SubscriptionOptions } from './commonTypes';
import { Subscription } from './Subscription';
export declare class SubscriptionSet extends SubscribeCapable {
    protected channelNames: string[];
    protected groupNames: string[];
    protected options?: SubscriptionOptions;
    protected pubnub: PubNub<unknown, unknown>;
    protected eventEmitter: EventEmitter;
    protected subscriptionList: Subscription[];
    protected listener: Listener;
    constructor({ channels, channelGroups, subscriptionOptions, eventEmitter, pubnub, }: {
        channels?: string[];
        channelGroups?: string[];
        subscriptionOptions?: SubscriptionOptions;
        eventEmitter: EventEmitter;
        pubnub: PubNub<unknown, unknown>;
    });
    addSubscription(subscription: Subscription): void;
    removeSubscription(subscription: Subscription): void;
    addSubscriptionSet(subscriptionSet: SubscriptionSet): void;
    removeSubscriptionSet(subscriptionSet: SubscriptionSet): void;
    get subscriptions(): Subscription[];
}
