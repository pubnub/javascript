import { Cursor } from '../models/Cursor';
import { createEffect, createManagedEffect, MapOf } from './core';
import { HandshakeReconnectingStateContext } from './states/handshake_reconnecting';
import { ReceiveReconnectingStateContext } from './states/receive_reconnecting';

export const handshake = createManagedEffect('HANDSHAKE', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

export const receiveEvents = createManagedEffect(
  'RECEIVE_EVENTS',
  (channels: string[], groups: string[], cursor: Cursor) => ({ channels, groups, cursor }),
);

export const emitEvents = createEffect('EMIT_EVENTS', (events: any[]) => events);

export const reconnect = createManagedEffect('RECONNECT', (context: ReceiveReconnectingStateContext) => context);

export const handshakeReconnect = createManagedEffect(
  'HANDSHAKE_RECONNECT',
  (context: HandshakeReconnectingStateContext) => context,
);

export type Effects = MapOf<
  typeof receiveEvents | typeof handshake | typeof emitEvents | typeof reconnect | typeof handshakeReconnect
>;
