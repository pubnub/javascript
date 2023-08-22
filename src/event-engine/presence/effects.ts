import { createEffect, createManagedEffect, MapOf } from '../core';

export const heartbeat = createEffect('HEARTBEAT', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

export const leave = createEffect('LEAVE', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

export const wait = createManagedEffect('WAIT', () => ({}));

export type Effects = MapOf<typeof heartbeat | typeof leave | typeof wait>;
