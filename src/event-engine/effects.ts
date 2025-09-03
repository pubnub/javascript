/**
 * Subscribe Event Engine effects module.
 *
 * @internal
 */

import { createEffect, createManagedEffect, MapOf } from './core';
import * as Subscription from '../core/types/api/subscription';
import { StatusEvent } from '../core/types/api';

/**
 * Initial subscription effect.
 *
 * Performs subscribe REST API call with `tt=0`.
 *
 * @internal
 */
export const handshake = createManagedEffect(
  'HANDSHAKE',
  (channels: string[], groups: string[], onDemand: boolean) => ({
    channels,
    groups,
    onDemand,
  }),
);

/**
 * Real-time updates receive effect.
 *
 * Performs sequential subscribe REST API call with `tt` set to the value received from the previous subscribe
 * REST API call.
 *
 * @internal
 */
export const receiveMessages = createManagedEffect(
  'RECEIVE_MESSAGES',
  (channels: string[], groups: string[], cursor: Subscription.SubscriptionCursor, onDemand: boolean) => ({
    channels,
    groups,
    cursor,
    onDemand,
  }),
);

/**
 * Emit real-time updates effect.
 *
 * Notify event listeners about updates for which listener handlers has been provided.
 *
 * @internal
 */
export const emitMessages = createEffect(
  'EMIT_MESSAGES',
  (cursor: Subscription.SubscriptionCursor, events: Subscription.SubscriptionResponse['messages']) => ({
    cursor,
    events,
  }),
);

/**
 * Emit subscription status change effect.
 *
 * Notify status change event listeners.
 *
 * @internal
 */
export const emitStatus = createEffect('EMIT_STATUS', (status: StatusEvent) => status);

/**
 * Subscribe Event Engine effects.
 *
 * @internal
 */
export type Effects = MapOf<typeof receiveMessages | typeof handshake | typeof emitMessages | typeof emitStatus>;
