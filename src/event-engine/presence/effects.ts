import { createEffect, createManagedEffect, MapOf } from '../core';
import { HeartbeatReconnectingStateContext } from './states/heartbeat_reconnecting';
import { Status } from '../../core/types/api';

export const heartbeat = createEffect('HEARTBEAT', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

export const leave = createEffect('LEAVE', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const emitStatus = createEffect('EMIT_STATUS', (status: any) => status);

export const wait = createManagedEffect('WAIT', () => ({}));

export const delayedHeartbeat = createManagedEffect(
  'DELAYED_HEARTBEAT',
  (context: HeartbeatReconnectingStateContext) => context,
);

export type Effects = MapOf<
  typeof heartbeat | typeof leave | typeof emitStatus | typeof wait | typeof delayedHeartbeat
>;
