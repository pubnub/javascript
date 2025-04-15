/**
 * Stopped real-time updates (disconnected) state module.
 *
 * @internal
 */

import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { HandshakingState } from './handshaking';
import { UnsubscribedState } from './unsubscribed';
import * as Subscription from '../../core/types/api/subscription';

/**
 * Context which represent current Subscription Event Engine data state.
 *
 * @internal
 */
type ReceiveStoppedStateContext = {
  channels: string[];
  groups: string[];
  cursor: Subscription.SubscriptionCursor;
};

/**
 * Stopped real-time updates (disconnected) state.
 *
 * State in which Subscription Event Engine still has information about subscription but doesn't process real-time
 * updates.
 *
 * @internal
 */
export const ReceiveStoppedState = new State<ReceiveStoppedStateContext, Events, Effects>('RECEIVE_STOPPED');

ReceiveStoppedState.on(subscriptionChange.type, (context, { payload }) =>
  ReceiveStoppedState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor }),
);

ReceiveStoppedState.on(restore.type, (context, { payload }) =>
  ReceiveStoppedState.with({
    channels: payload.channels,
    groups: payload.groups,
    cursor: { timetoken: payload.cursor.timetoken, region: payload.cursor.region || context.cursor.region },
  }),
);

ReceiveStoppedState.on(reconnect.type, (context, { payload }) =>
  HandshakingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: {
      timetoken: !!payload.cursor.timetoken ? payload.cursor?.timetoken : context.cursor.timetoken,
      region: payload.cursor.region || context.cursor.region,
    },
  }),
);

ReceiveStoppedState.on(unsubscribeAll.type, () => UnsubscribedState.with(undefined));
