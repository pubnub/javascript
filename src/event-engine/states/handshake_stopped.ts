/**
 * Stopped initial subscription handshake (disconnected) state.
 *
 * @internal
 */

import { reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { HandshakeStoppedState, HandshakingState, UnsubscribedState } from './instances';

export { HandshakeStoppedState };

/**
 * Stopped initial subscription handshake (disconnected) state.
 *
 * State in which Subscription Event Engine still has information about subscription but doesn't have subscription
 * cursor for next sequential subscribe REST API call.
 *
 * @internal
 */

HandshakeStoppedState.on(subscriptionChange.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return HandshakeStoppedState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
});

HandshakeStoppedState.on(reconnect.type, (context, { payload }) =>
  HandshakingState.with({ ...context, cursor: payload.cursor || context.cursor, onDemand: true }),
);

HandshakeStoppedState.on(restore.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return HandshakeStoppedState.with({
    channels: payload.channels,
    groups: payload.groups,
    cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context.cursor?.region || 0 },
  });
});

HandshakeStoppedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());
