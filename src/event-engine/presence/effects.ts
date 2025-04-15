/**
 * Presence Event Engine effects module.
 *
 * @internal
 */

import { createEffect, createManagedEffect, MapOf } from '../core';
import { Status } from '../../core/types/api';

/**
 * Presence heartbeat effect.
 *
 * Performs presence heartbeat REST API call.
 *
 * @internal
 */
export const heartbeat = createManagedEffect('HEARTBEAT', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

/**
 * Presence leave effect.
 *
 * Performs presence leave REST API call.
 *
 * @internal
 */
export const leave = createEffect('LEAVE', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

/**
 * Emit presence heartbeat REST API call result status effect.
 *
 * Notify status change event listeners.
 *
 * @internal
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
export const emitStatus = createEffect('EMIT_STATUS', (status: any) => status);

/**
 * Heartbeat delay effect.
 *
 * Delay of configured length (heartbeat interval) before another heartbeat REST API call will be done.
 *
 * @internal
 */
export const wait = createManagedEffect('WAIT', () => ({}));

/**
 * Presence Event Engine effects.
 *
 * @internal
 */
export type Effects = MapOf<typeof heartbeat | typeof leave | typeof emitStatus | typeof wait>;
