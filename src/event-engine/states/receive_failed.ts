/**
 * Failed to receive real-time updates (disconnected) state.
 *
 * @internal
 */

import { reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { HandshakingState, ReceiveFailedState, UnsubscribedState } from './instances';

export { ReceiveFailedState };
export type { ReceiveFailedStateContext } from './instances';

/**
 * Failed to receive real-time updates (disconnected) state.
 *
 * State in which Subscription Event Engine waits for user to try to reconnect after all retry attempts has been
 * exhausted.
 *
 * @internal
 */

ReceiveFailedState.on(reconnect.type, (context, { payload }) =>
  HandshakingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: {
      timetoken: !!payload.cursor.timetoken ? payload.cursor?.timetoken : context.cursor.timetoken,
      region: payload.cursor.region || context.cursor.region,
    },
    onDemand: true,
  }),
);

ReceiveFailedState.on(subscriptionChange.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return HandshakingState.with({
    channels: payload.channels,
    groups: payload.groups,
    cursor: context.cursor,
    onDemand: true,
  });
});

ReceiveFailedState.on(restore.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return HandshakingState.with({
    channels: payload.channels,
    groups: payload.groups,
    cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context.cursor.region },
    onDemand: true,
  });
});

ReceiveFailedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined));
