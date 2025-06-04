/**
 * Failed to receive real-time updates (disconnected) state.
 *
 * @internal
 */

import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { PubNubError } from '../../errors/pubnub-error';
import { HandshakingState } from './handshaking';
import { UnsubscribedState } from './unsubscribed';
import * as Subscription from '../../core/types/api/subscription';

/**
 * Context which represent current Subscription Event Engine data state.
 *
 * @internal
 */
export type ReceiveFailedStateContext = {
  channels: string[];
  groups: string[];
  cursor: Subscription.SubscriptionCursor;

  reason: PubNubError;
};

/**
 * Failed to receive real-time updates (disconnected) state.
 *
 * State in which Subscription Event Engine waits for user to try to reconnect after all retry attempts has been
 * exhausted.
 *
 * @internal
 */
export const ReceiveFailedState = new State<ReceiveFailedStateContext, Events, Effects>('RECEIVE_FAILED');

ReceiveFailedState.on(reconnect.type, (context, { payload }) =>
  HandshakingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: {
      timetoken: !!payload.cursor.timetoken ? payload.cursor?.timetoken : context.cursor.timetoken,
      region: payload.cursor.region || context.cursor.region,
    },
  }),
);

ReceiveFailedState.on(subscriptionChange.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return HandshakingState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
});

ReceiveFailedState.on(restore.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return HandshakingState.with({
    channels: payload.channels,
    groups: payload.groups,
    cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context.cursor.region },
  });
});

ReceiveFailedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined));
