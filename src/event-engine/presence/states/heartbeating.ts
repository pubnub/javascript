/**
 * Heartbeating state module.
 *
 * @internal
 */

import { disconnect, heartbeatFailure, heartbeatSuccess, joined, left, leftAll } from '../events';
import { emitStatus, heartbeat, leave } from '../effects';
import {
  HeartbeatCooldownState,
  HeartbeatFailedState,
  HeartbeatInactiveState,
  HeartbeatingState,
  HeartbeatStoppedState,
} from './instances';

export { HeartbeatingState };
export type { HeartbeatingStateContext } from './instances';

/**
 * Heartbeating state module.
 *
 * State in which Presence Event Engine send heartbeat REST API call.
 *
 * @internal
 */

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
