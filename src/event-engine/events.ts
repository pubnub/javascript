import * as Subscription from '../core/types/api/subscription';
import { PubNubError } from '../errors/pubnub-error';
import { createEvent, MapOf } from './core';

export const subscriptionChange = createEvent('SUBSCRIPTION_CHANGED', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

export const restore = createEvent(
  'SUBSCRIPTION_RESTORED',
  (channels: string[], groups: string[], timetoken: string | number, region?: number) => ({
    channels,
    groups,
    cursor: {
      timetoken: timetoken,
      region: region ?? 0,
    },
  }),
);

export const handshakeSuccess = createEvent('HANDSHAKE_SUCCESS', (cursor: Subscription.SubscriptionCursor) => cursor);
export const handshakeFailure = createEvent('HANDSHAKE_FAILURE', (error: PubNubError) => error);

export const handshakeReconnectSuccess = createEvent(
  'HANDSHAKE_RECONNECT_SUCCESS',
  (cursor: Subscription.SubscriptionCursor) => ({
    cursor,
  }),
);
export const handshakeReconnectFailure = createEvent('HANDSHAKE_RECONNECT_FAILURE', (error: PubNubError) => error);
export const handshakeReconnectGiveup = createEvent('HANDSHAKE_RECONNECT_GIVEUP', (error: PubNubError) => error);

export const receiveSuccess = createEvent(
  'RECEIVE_SUCCESS',
  (cursor: Subscription.SubscriptionCursor, events: Subscription.SubscriptionResponse['messages']) => ({
    cursor,
    events,
  }),
);
export const receiveFailure = createEvent('RECEIVE_FAILURE', (error: PubNubError) => error);

export const receiveReconnectSuccess = createEvent(
  'RECEIVE_RECONNECT_SUCCESS',
  (cursor: Subscription.SubscriptionCursor, events: Subscription.SubscriptionResponse['messages']) => ({
    cursor,
    events,
  }),
);
export const receiveReconnectFailure = createEvent('RECEIVE_RECONNECT_FAILURE', (error: PubNubError) => error);
export const receiveReconnectGiveup = createEvent('RECEIVING_RECONNECT_GIVEUP', (error: PubNubError) => error);
export const disconnect = createEvent('DISCONNECT', () => ({}));

export const reconnect = createEvent('RECONNECT', (timetoken?: string, region?: number) => ({
  cursor: {
    timetoken: timetoken ?? '',
    region: region ?? 0,
  },
}));
export const unsubscribeAll = createEvent('UNSUBSCRIBE_ALL', () => ({}));

export type Events = MapOf<
  | typeof subscriptionChange
  | typeof restore
  | typeof handshakeSuccess
  | typeof handshakeFailure
  | typeof handshakeReconnectSuccess
  | typeof handshakeReconnectFailure
  | typeof handshakeReconnectGiveup
  | typeof receiveSuccess
  | typeof receiveFailure
  | typeof receiveReconnectSuccess
  | typeof receiveReconnectFailure
  | typeof receiveReconnectGiveup
  | typeof disconnect
  | typeof reconnect
  | typeof unsubscribeAll
>;
