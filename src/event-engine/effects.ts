/**
 * Subscribe Event Engine effects module.
 *
 * @internal
 */

import { createEffect, createManagedEffect, MapOf } from './core';
import { HandshakeReconnectingStateContext } from './states/handshake_reconnecting';
import { ReceiveReconnectingStateContext } from './states/receive_reconnecting';
import * as Subscription from '../core/types/api/subscription';
import { StatusEvent } from '../core/types/api';

/**
 * Initial subscription effect.
 *
 * Performs subscribe REST API call with `tt=0`.
 *
 * @internal
 */
export const handshake = createManagedEffect('HANDSHAKE', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

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
  (channels: string[], groups: string[], cursor: Subscription.SubscriptionCursor) => ({ channels, groups, cursor }),
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
  (events: Subscription.SubscriptionResponse['messages']) => events,
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
 * Real-time updates receive restore effect.
 *
 * Performs subscribe REST API call with `tt` which has been received before disconnection or error.
 *
 * @internal
 */
export const receiveReconnect = createManagedEffect(
  'RECEIVE_RECONNECT',
  (context: ReceiveReconnectingStateContext) => context,
);

/**
 * Initial subscription restore effect.
 *
 * Performs subscribe REST API call with `tt=0` after error.
 *
 * @internal
 */
export const handshakeReconnect = createManagedEffect(
  'HANDSHAKE_RECONNECT',
  (context: HandshakeReconnectingStateContext) => context,
);

/**
 * Subscribe Event Engine effects.
 *
 * @internal
 */
export type Effects = MapOf<
  | typeof receiveMessages
  | typeof handshake
  | typeof emitMessages
  | typeof receiveReconnect
  | typeof handshakeReconnect
  | typeof emitStatus
>;
