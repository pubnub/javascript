import { PubNubError } from '../core/components/endpoint';
import { Cursor } from '../models/Cursor';
import { createEvent, MapOf } from './core';

export const subscriptionChange = createEvent(
  'SUBSCRIPTION_CHANGED',
  (channels: string[], groups: string[], timetoken?: string) => ({
    channels,
    groups,
    timetoken,
  }),
);

export const disconnect = createEvent('DISCONNECT', () => ({}));
export const reconnect = createEvent('RECONNECT', () => ({}));
export const restore = createEvent(
  'SUBSCRIPTION_RESTORED',
  (channels: string[], groups: string[], timetoken?: string, region?: number) => ({
    channels,
    groups,
    timetoken,
    region,
  }),
);

export const handshakingSuccess = createEvent('HANDSHAKE_SUCCESS', (cursor: Cursor) => cursor);
export const handshakingFailure = createEvent('HANDSHAKE_FAILURE', (error: PubNubError) => error);

export const handshakingReconnectingSuccess = createEvent('HANDSHAKE_RECONNECT_SUCCESS', (cursor: Cursor) => ({
  cursor,
}));
export const handshakingReconnectingFailure = createEvent('HANDSHAKE_RECONNECT_FAILURE', (error: PubNubError) => error);
export const handshakingReconnectingGiveup = createEvent('HANDSHAKE_RECONNECT_GIVEUP', () => ({}));

export const receivingSuccess = createEvent('RECEIVE_SUCCESS', (cursor: Cursor, events: any[]) => ({
  cursor,
  events,
}));
export const receivingFailure = createEvent('RECEIVE_FAILURE', (error: PubNubError) => error);

export const reconnectingSuccess = createEvent('RECEIVE_RECONNECT_SUCCESS', (cursor: Cursor, events: any[]) => ({
  cursor,
  events,
}));
export const reconnectingFailure = createEvent('RECEIVE_RECONNECT_FAILURE', (error: PubNubError) => error);
export const reconnectingGiveup = createEvent('RECEIVING_RECONNECTING_GIVEUP', () => ({}));
export const reconnectingRetry = createEvent('RECONNECT', () => ({}));
export const unsubscribeAll = createEvent('UNSUBSCRIBE_ALL', () => ({}));

export type Events = MapOf<
  | typeof subscriptionChange
  | typeof disconnect
  | typeof unsubscribeAll
  | typeof reconnect
  | typeof restore
  | typeof handshakingSuccess
  | typeof handshakingFailure
  | typeof handshakingReconnectingSuccess
  | typeof handshakingReconnectingGiveup
  | typeof handshakingReconnectingFailure
  | typeof receivingSuccess
  | typeof receivingFailure
  | typeof reconnectingSuccess
  | typeof reconnectingFailure
  | typeof reconnectingGiveup
  | typeof reconnectingRetry
>;
