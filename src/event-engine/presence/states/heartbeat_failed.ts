/**
 * Failed to heartbeat state module.
 *
 * @internal
 */

import { State } from '../../core/state';
import { Events, disconnect, heartbeatFailure, heartbeatSuccess, joined, left, leftAll, reconnect } from '../events';
import { Effects, heartbeat, leave } from '../effects';
import { HeartbeatingState } from './heartbeating';
import { HeartbeatStoppedState } from './heartbeat_stopped';
import { HeartbeatInactiveState } from './heartbeat_inactive';

/**
 * Context which represent current Presence Event Engine data state.
 *
 * @internal
 */
export type HeartbeatFailedStateContext = {
  channels: string[];
  groups: string[];
};

/**
 * Failed to heartbeat state.
 *
 * State in which Subscription Event Engine waits for user to try to reconnect after all retry attempts has been
 * exhausted.
 *
 * @internal
 */
export const HeartbeatFailedState = new State<HeartbeatFailedStateContext, Events, Effects>('HEARTBEAT_FAILED');

HeartbeatFailedState.on(joined.type, (context, event) =>
  HeartbeatingState.with({
    channels: [...context.channels, ...event.payload.channels],
    groups: [...context.groups, ...event.payload.groups],
  }),
);

HeartbeatFailedState.on(left.type, (context, event) =>
  HeartbeatingState.with(
    {
      channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
      groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
    },
    [leave(event.payload.channels, event.payload.groups)],
  ),
);

HeartbeatFailedState.on(reconnect.type, (context, _) =>
  HeartbeatingState.with({
    channels: context.channels,
    groups: context.groups,
  }),
);

HeartbeatFailedState.on(disconnect.type, (context, _) =>
  HeartbeatStoppedState.with(
    {
      channels: context.channels,
      groups: context.groups,
    },
    [leave(context.channels, context.groups)],
  ),
);

HeartbeatFailedState.on(leftAll.type, (context, _) =>
  HeartbeatInactiveState.with(undefined, [leave(context.channels, context.groups)]),
);
