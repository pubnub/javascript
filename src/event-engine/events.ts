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
export const handshakingFailure = createEvent('HANDSHAKING_FAILURE', () => ({}));
export const handshakingGiveup = createEvent('HANDSHAKING_GIVEUP', () => ({}));
export const handshakingReconnect = createEvent('HANDSHAKNG_RECONNECT', () => ({}));

export const receivingSuccess = createEvent('RECEIVING_SUCCESS', () => ({}));
export const receivingFailure = createEvent('RECEIVING_FAILURE', () => ({}));

export type Events = MapOf<
  | typeof subscriptionChange
  | typeof disconnect
  | typeof reconnect
  | typeof restore
  | typeof handshakingSuccess
  | typeof handshakingFailure
  | typeof handshakingGiveup
  | typeof handshakingReconnect
  | typeof receivingSuccess
  | typeof receivingSuccess
>;
