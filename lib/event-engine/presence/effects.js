import { createEffect, createManagedEffect } from '../core';
export const heartbeat = createEffect('HEARTBEAT', (channels, groups) => ({
    channels,
    groups,
}));
export const leave = createEffect('LEAVE', (channels, groups) => ({
    channels,
    groups,
}));
// TODO: Find out actual `status` type.
/* eslint-disable  @typescript-eslint/no-explicit-any */
export const emitStatus = createEffect('EMIT_STATUS', (status) => status);
export const wait = createManagedEffect('WAIT', () => ({}));
export const delayedHeartbeat = createManagedEffect('DELAYED_HEARTBEAT', (context) => context);
