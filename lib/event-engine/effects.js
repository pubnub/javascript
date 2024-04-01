import { createEffect, createManagedEffect } from './core';
export const handshake = createManagedEffect('HANDSHAKE', (channels, groups) => ({
    channels,
    groups,
}));
export const receiveMessages = createManagedEffect('RECEIVE_MESSAGES', (channels, groups, cursor) => ({ channels, groups, cursor }));
export const emitMessages = createEffect('EMIT_MESSAGES', (events) => events);
export const emitStatus = createEffect('EMIT_STATUS', (status) => status);
export const receiveReconnect = createManagedEffect('RECEIVE_RECONNECT', (context) => context);
export const handshakeReconnect = createManagedEffect('HANDSHAKE_RECONNECT', (context) => context);
