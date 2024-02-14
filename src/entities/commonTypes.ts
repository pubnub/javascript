import PubNub from 'pubnub';
export interface SubscribeCapable {
  subscribe(): void;
  unsubscribe(): void;

  addListener(listener: any): void;
  removeListener(listener: any): void;
}

export type SubscriptionOptions = {
  cursor?: { timetoken?: string; region?: number };
  receivePresenceEvents?: boolean;
};

export type EventEmitter = {
  emitEvent(e: any): void;
  addListener(l: any, channels: any, groups: any): void;
  removeListener(listener: any, channels: any, groups: any): void;
  removeAllListeners(): void;
};

export type Listener = {
  message?(m: PubNub.MessageEvent): void;
  presence?(p: PubNub.PresenceEvent): void;
  signal?(s: PubNub.SignalEvent): void;
  objects?(o: PubNub.ObjectsEvent): void;
  messageAction?(ma: PubNub.MessageActionEvent): void;
  file?(f: PubNub.FileEvent): void;
  status?(s: PubNub.StatusEvent): void;
};