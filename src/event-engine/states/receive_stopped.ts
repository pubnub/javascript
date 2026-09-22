/**
 * Stopped real-time updates (disconnected) state module.
 *
 * @internal
 */

import { reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { HandshakingState, ReceiveStoppedState, UnsubscribedState } from './instances';

export { ReceiveStoppedState };
export type { ReceiveStoppedStateContext } from './instances';

/**
 * Stopped real-time updates (disconnected) state.
 *
 * State in which Subscription Event Engine still has information about subscription but doesn't process real-time
 * updates.
 *
 * @internal
 */

ReceiveStoppedState.on(subscriptionChange.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return ReceiveStoppedState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
});

ReceiveStoppedState.on(restore.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return ReceiveStoppedState.with({
    channels: payload.channels,
    groups: payload.groups,
    cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context.cursor.region },
  });
});

ReceiveStoppedState.on(reconnect.type, (context, { payload }) =>
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

ReceiveStoppedState.on(unsubscribeAll.type, () => UnsubscribedState.with(undefined));
