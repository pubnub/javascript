/**
 * Unsubscribed / disconnected state module.
 *
 * @internal
 */

import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, subscriptionChange, restore } from '../events';
import { HandshakingState } from './handshaking';

/**
 * Unsubscribed / disconnected state.
 *
 * State in which Subscription Event Engine doesn't process any real-time updates.
 *
 * @internal
 */
export const UnsubscribedState = new State<void, Events, Effects>('UNSUBSCRIBED');

UnsubscribedState.on(subscriptionChange.type, (_, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return HandshakingState.with({ channels: payload.channels, groups: payload.groups, onDemand: true });
});

UnsubscribedState.on(restore.type, (_, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return HandshakingState.with({
    channels: payload.channels,
    groups: payload.groups,
    cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region },
    onDemand: true,
  });
});
