import PubNub from 'pubnub';
export interface SubscribeCapable {
  subscribe(): void;
  unsubscribe(): void;

  addListener(listener: Listener): void;
  removeListener(listener: Listener): void;
}

export type SubscriptionOptions = {
  cursor?: { timetoken?: string; region?: number };
  receivePresenceEvents?: boolean;
};

export type EventEmitter = {
  emitEvent(e: Event): void;
  addListener(l: Listener, channels?: string[], groups?: string[]): void;
  removeListener(listener: Listener, channels?: string[], groups?: string[]): void;
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

type Event =
  | PubNub.MessageEvent
  | PubNub.PresenceEvent
  | PubNub.SignalEvent
  | PubNub.ObjectsEvent
  | PubNub.MessageActionEvent
  | PubNub.FileEvent;
