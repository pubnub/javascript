import { EventEmitter, Listener, SubscriptionOptions } from './commonTypes';
import PubNubType from 'pubnub';
import type PubNub from '../core/pubnub-common';

export abstract class SubscribeCapable {
  protected abstract channelNames: string[];
  protected abstract groupNames: string[];
  protected abstract listener: Listener;
  protected abstract eventEmitter: EventEmitter;
  protected abstract pubnub: PubNub;
  protected abstract options?: SubscriptionOptions;

  subscribe() {
    this.pubnub.subscribe({
      channels: this.channelNames,
      channelGroups: this.groupNames,
      ...(this.options?.cursor?.timetoken && { timetoken: this.options.cursor.timetoken }),
    });
  }
  unsubscribe() {
    this.pubnub.unsubscribe({
      channels: this.channelNames.filter((c) => !c.endsWith('-pnpres')),
      channelGroups: this.groupNames.filter((cg) => !cg.endsWith('-pnpres')),
    });
  }

  set onMessage(onMessagelistener: (messageEvent: PubNubType.MessageEvent) => void) {
    this.listener.message = onMessagelistener;
  }

  set onPresence(onPresencelistener: (presenceEvent: PubNubType.PresenceEvent) => void) {
    this.listener.presence = onPresencelistener;
  }

  set onSignal(onSignalListener: (signalEvent: PubNubType.SignalEvent) => void) {
    this.listener.signal = onSignalListener;
  }

  set onObjects(onObjectsListener: (objectsEvent: PubNubType.ObjectsEvent) => void) {
    this.listener.objects = onObjectsListener;
  }

  set onMessageAction(messageActionEventListener: (messageActionEvent: PubNubType.MessageActionEvent) => void) {
    this.listener.messageAction = messageActionEventListener;
  }

  set onFile(fileEventListener: (fileEvent: PubNubType.FileEvent) => void) {
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
