import type { PubNubCore as PubNub } from '../core/pubnub-common';
import { Listener } from '../core/components/listener_manager';
import * as Subscription from '../core/types/api/subscription';
import EventEmitter from '../core/components/eventEmitter';
import { SubscriptionOptions } from './commonTypes';
export declare abstract class SubscribeCapable {
    protected abstract channelNames: string[];
    protected abstract groupNames: string[];
    protected abstract listener: Listener;
    protected abstract eventEmitter: EventEmitter;
    protected abstract pubnub: PubNub<unknown, unknown>;
    protected abstract options?: SubscriptionOptions;
    subscribe(subscribeParameters?: {
        timetoken?: string;
    }): void;
    unsubscribe(): void;
    set onMessage(onMessageListener: (messageEvent: Subscription.Message) => void);
    set onPresence(onPresenceListener: (presenceEvent: Subscription.Presence) => void);
    set onSignal(onSignalListener: (signalEvent: Subscription.Signal) => void);
    set onObjects(onObjectsListener: (objectsEvent: Subscription.AppContextObject) => void);
    set onMessageAction(messageActionEventListener: (messageActionEvent: Subscription.MessageAction) => void);
    set onFile(fileEventListener: (fileEvent: Subscription.File) => void);
    addListener(listener: Listener): void;
    removeListener(listener: Listener): void;
    get channels(): string[];
    get channelGroups(): string[];
}
