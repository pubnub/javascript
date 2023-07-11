import { PubNubError } from '../core/components/endpoint';
import { Cursor } from '../models/Cursor';
import { createEvent, MapOf } from './core';

export const subscriptionChange = createEvent('SUBSCRIPTION_CHANGED', (channels: string[], groups: string[], timetoken?: string) => ({
  channels,
  groups,
  timetoken
}));

export const disconnect = createEvent('DISCONNECT', () => ({}));
export const reconnect = createEvent('RECONNECT', () => ({}));
export const restore = createEvent(
  'RESTORE',
  (channels: string[], groups: string[], timetoken?: string, region?: number) => ({
    channels,
    groups,
    timetoken,
    region,
  }),
);

export const handshakingSuccess = createEvent('HANDSHAKE_SUCCESS', (cursor: Cursor) => cursor);
export const handshakingFailure = createEvent('HANDSHAKE_FAILURE', (error: PubNubError) => error);

export const handshakingReconnectingSuccess = createEvent('HANDSHAKING_RECONNECTING_SUCCESS', (cursor: Cursor) => ({
  cursor,
}));
export const handshakingReconnectingFailure = createEvent('HANDSHAKE_RECONNECT_FAILURE', (error: PubNubError) => error);
export const handshakingReconnectingGiveup = createEvent('HANDSHAKING_RECONNECTING_GIVEUP', () => ({}));
export const handshakingReconnectingRetry = createEvent('HANDSHAKING_RECONNECTING_RETRY', () => ({}));

export const receivingSuccess = createEvent('RECEIVE_SUCCESS', (cursor: Cursor, events: any[]) => ({
  cursor,
  events,
}));
export const receivingFailure = createEvent('RECEIVE_FAILURE', (error: PubNubError) => error);

export const reconnectingSuccess = createEvent('RECEIVE_RECONNECT_SUCCESS', (cursor: Cursor, events: any[]) => ({
  cursor,
  events,
}));
export const reconnectingFailure = createEvent('RECEIVING_RECONNECTING_FAILURE', (error: PubNubError) => error);
export const reconnectingGiveup = createEvent('RECEIVING_RECONNECTING_GIVEUP', () => ({}));
export const reconnectingRetry = createEvent('RECEIVING_RECONNECTING_RETRY', () => ({}));

export type Events = MapOf<
  | typeof subscriptionChange
  | typeof disconnect
  | typeof reconnect
  | typeof restore
  | typeof handshakingSuccess
  | typeof handshakingFailure
  | typeof handshakingReconnectingSuccess
  | typeof handshakingReconnectingGiveup
  | typeof handshakingReconnectingFailure
  | typeof handshakingReconnectingRetry
  | typeof receivingSuccess
  | typeof receivingFailure
  | typeof reconnectingSuccess
  | typeof reconnectingFailure
  | typeof reconnectingGiveup
  | typeof reconnectingRetry
>;
