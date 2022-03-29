import { createEffect, createManagedEffect, MapOf } from './core';

export const handshake = createManagedEffect('HANDSHAKE', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

export const receiveEvents = createManagedEffect('RECEIVE_EVENTS', () => ({}));
export const emitEvents = createEffect('EMIT_EVENTS', (events: any) => events);

export type Effects = MapOf<typeof receiveEvents | typeof handshake | typeof emitEvents>;
