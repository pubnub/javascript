/**
 * Heartbeating state module.
 *
 * @internal
 */

import { Events, disconnect, heartbeatFailure, heartbeatSuccess, joined, left, leftAll } from '../events';
import { HeartbeatInactiveState } from './heartbeat_inactive';
import { HeartbeatCooldownState } from './heartbeat_cooldown';
import { HeartbeatStoppedState } from './heartbeat_stopped';
import { HeartbeatFailedState } from './heartbeat_failed';
import { Effects, emitStatus, heartbeat, leave } from '../effects';
import { State } from '../../core/state';

/**
 * Context which represent current Presence Event Engine data state.
 *
 * @internal
 */
export type HeartbeatingStateContext = {
  channels: string[];
  groups: string[];
};

/**
 * Heartbeating state module.
 *
 * State in which Presence Event Engine send heartbeat REST API call.
 *
 * @internal
 */
export const HeartbeatingState = new State<HeartbeatingStateContext, Events, Effects>('HEARTBEATING');

HeartbeatingState.onEnter((context) => heartbeat(context.channels, context.groups));
HeartbeatingState.onExit(() => heartbeat.cancel);

HeartbeatingState.on(heartbeatSuccess.type, (context, event) =>
  HeartbeatCooldownState.with({ channels: context.channels, groups: context.groups }, [
    emitStatus({ ...event.payload }),
  ]),
);

HeartbeatingState.on(joined.type, (context, event) =>
  HeartbeatingState.with({
    channels: [...context.channels, ...event.payload.channels.filter((channel) => !context.channels.includes(channel))],
    groups: [...context.groups, ...event.payload.groups.filter((group) => !context.groups.includes(group))],
  }),
);

HeartbeatingState.on(left.type, (context, event) => {
  return HeartbeatingState.with(
    {
      channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
      groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
    },
    [leave(event.payload.channels, event.payload.groups)],
  );
});

HeartbeatingState.on(heartbeatFailure.type, (context, event) =>
  HeartbeatFailedState.with({ ...context }, [
    ...(event.payload.status ? [emitStatus({ ...event.payload.status })] : []),
  ]),
);

HeartbeatingState.on(disconnect.type, (context, event) =>
  HeartbeatStoppedState.with({ channels: context.channels, groups: context.groups }, [
    ...(!event.payload.isOffline ? [leave(context.channels, context.groups)] : []),
  ]),
);

HeartbeatingState.on(leftAll.type, (context, event) =>
  HeartbeatInactiveState.with(undefined, [
    ...(!event.payload.isOffline ? [leave(context.channels, context.groups)] : []),
  ]),
);
