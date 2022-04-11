import { PubNubError } from '../core/components/endpoint';
import { Cursor } from '../models/Cursor';
import { createEvent, MapOf } from './core';

export const subscriptionChange = createEvent('SUBSCRIPTION_CHANGE', (channels: string[], groups: string[]) => ({
  channels,
  groups,
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

export const handshakingSuccess = createEvent('HANDSHAKING_SUCCESS', (cursor: Cursor) => cursor);
export const handshakingFailure = createEvent('HANDSHAKING_FAILURE', (error: PubNubError) => error);

export const handshakingReconnectingSuccess = createEvent('HANDSHAKING_RECONNECTING_SUCCESS', (cursor: Cursor) => ({
  cursor,
}));
export const handshakingReconnectingFailure = createEvent(
  'HANDSHAKING_RECONNECTING_FAILURE',
  (error: PubNubError) => error,
);
export const handshakingReconnectingGiveup = createEvent('HANDSHAKING_RECONNECTING_GIVEUP', () => ({}));
export const handshakingReconnectingRetry = createEvent('HANDSHAKING_RECONNECTING_RETRY', () => ({}));

export const receivingSuccess = createEvent('RECEIVING_SUCCESS', (cursor: Cursor, events: any[]) => ({
  cursor,
  events,
}));
export const receivingFailure = createEvent('RECEIVING_FAILURE', (error: PubNubError) => error);

export const reconnectingSuccess = createEvent('RECONNECTING_SUCCESS', (cursor: Cursor, events: any[]) => ({
  cursor,
  events,
}));
export const reconnectingFailure = createEvent('RECONNECTING_FAILURE', (error: PubNubError) => error);
export const reconnectingGiveup = createEvent('RECONNECTING_GIVEUP', () => ({}));
export const reconnectingRetry = createEvent('RECONNECTING_RETRY', () => ({}));

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
