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

UnsubscribedState.on(subscriptionChange.type, (_, { payload }) =>
  HandshakingState.with({ channels: payload.channels, groups: payload.groups }),
);

UnsubscribedState.on(restore.type, (_, { payload }) =>
  HandshakingState.with({ channels: payload.channels, groups: payload.groups, cursor: payload.cursor }),
);
