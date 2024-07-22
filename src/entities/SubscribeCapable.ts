import type { PubNubCore as PubNub } from '../core/pubnub-common';
import { Listener } from '../core/components/listener_manager';
import * as Subscription from '../core/types/api/subscription';
import EventEmitter from '../core/components/eventEmitter';
import { SubscriptionOptions } from './commonTypes';

export abstract class SubscribeCapable {
  protected abstract channelNames: string[];
  protected abstract groupNames: string[];
  protected abstract listener: Listener;
  protected abstract eventEmitter: EventEmitter;
  protected abstract pubnub: PubNub<unknown, unknown>;
  protected abstract options?: SubscriptionOptions;

  subscribe(subscribeParameters?: { timetoken?: string }) {
    const timetoken = subscribeParameters?.timetoken;
    this.pubnub.subscribe({
      channels: this.channelNames,
      channelGroups: this.groupNames,
      ...(timetoken !== null && timetoken !== '' && { timetoken: timetoken }),
    });
  }
  unsubscribe() {
    this.pubnub.unsubscribe({
      channels: this.channelNames,
      channelGroups: this.groupNames,
    });
  }

  set onMessage(onMessageListener: (messageEvent: Subscription.Message) => void) {
    this.listener.message = onMessageListener;
  }

  set onPresence(onPresenceListener: (presenceEvent: Subscription.Presence) => void) {
    this.listener.presence = onPresenceListener;
  }

  set onSignal(onSignalListener: (signalEvent: Subscription.Signal) => void) {
    this.listener.signal = onSignalListener;
  }

  set onObjects(onObjectsListener: (objectsEvent: Subscription.AppContextObject) => void) {
    this.listener.objects = onObjectsListener;
  }

  set onMessageAction(messageActionEventListener: (messageActionEvent: Subscription.MessageAction) => void) {
    this.listener.messageAction = messageActionEventListener;
  }

  set onFile(fileEventListener: (fileEvent: Subscription.File) => void) {
    this.listener.file = fileEventListener;
  }

  addListener(listener: Listener) {
    this.eventEmitter.addListener(
      listener,
      this.channelNames.filter((c) => !c.endsWith('-pnpres')),
      this.groupNames.filter((cg) => !cg.endsWith('-pnpres')),
    );
  }
  removeListener(listener: Listener) {
    this.eventEmitter.removeListener(listener, this.channelNames, this.groupNames);
  }

  get channels(): string[] {
    return this.channelNames.slice(0);
  }
  get channelGroups(): string[] {
    return this.groupNames.slice(0);
  }
}
