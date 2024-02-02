export interface SubscribeCapable {
  subscribe(): void;
  unsubscribe(): void;

  addListener(listener: any): void;
  removeListener(listener: any): void;
}

export type SubscriptionOptions = {
  cursor?: { timetoken?: string; region?: number };
  receivePresenceEvents?: boolean;
  filter?: string;
};
