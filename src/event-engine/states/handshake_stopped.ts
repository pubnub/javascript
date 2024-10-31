/**
 * Stopped initial subscription handshake (disconnected) state.
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
type HandshakeStoppedStateContext = {
  channels: string[];
  groups: string[];
  cursor?: Subscription.SubscriptionCursor;
};

/**
 * Stopped initial subscription handshake (disconnected) state.
 *
 * State in which Subscription Event Engine still has information about subscription but doesn't have subscription
 * cursor for next sequential subscribe REST API call.
 *
 * @internal
 */
export const HandshakeStoppedState = new State<HandshakeStoppedStateContext, Events, Effects>('HANDSHAKE_STOPPED');

HandshakeStoppedState.on(subscriptionChange.type, (context, event) =>
  HandshakeStoppedState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
  }),
);

HandshakeStoppedState.on(reconnect.type, (context, event) =>
  HandshakingState.with({
    ...context,
    cursor: event.payload.cursor || context.cursor,
  }),
);

HandshakeStoppedState.on(restore.type, (context, event) =>
  HandshakeStoppedState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
      timetoken: event.payload.cursor.timetoken,
      region: event.payload.cursor.region || context?.cursor?.region || 0,
    },
  }),
);

HandshakeStoppedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());
