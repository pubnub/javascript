import { Cursor } from '../models/Cursor';
import { createEffect, createManagedEffect, MapOf } from './core';
import { HandshakeReconnectingStateContext } from './states/handshake_reconnecting';
import { ReceiveReconnectingStateContext } from './states/receive_reconnecting';

export const handshake = createManagedEffect('HANDSHAKE', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

export const receiveMessages = createManagedEffect(
  'RECEIVE_MESSAGES',
  (channels: string[], groups: string[], cursor: Cursor) => ({ channels, groups, cursor }),
);

export const emitMessages = createEffect('EMIT_MESSAGES', (events: any[]) => events);

export const emitStatus = createEffect('EMIT_STATUS', (status: any) => status);

export const receiveReconnect = createManagedEffect(
  'RECEIVE_RECONNECT',
  (context: ReceiveReconnectingStateContext) => context,
);

export const handshakeReconnect = createManagedEffect(
  'HANDSHAKE_RECONNECT',
  (context: HandshakeReconnectingStateContext) => context,
);

export type Effects = MapOf<
  | typeof receiveMessages
  | typeof handshake
  | typeof emitMessages
  | typeof receiveReconnect
  | typeof handshakeReconnect
  | typeof emitStatus
>;
