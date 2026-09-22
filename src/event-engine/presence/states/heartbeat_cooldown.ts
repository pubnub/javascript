/**
 * Waiting next heartbeat state module.
 *
 * @internal
 */

import { disconnect, joined, left, leftAll, timesUp } from '../events';
import { leave, wait } from '../effects';
import { HeartbeatCooldownState, HeartbeatInactiveState, HeartbeatingState, HeartbeatStoppedState } from './instances';

export { HeartbeatCooldownState };
export type { HeartbeatCooldownStateContext } from './instances';

/**
 * Waiting next heartbeat state.
 *
 * State in which Presence Event Engine is waiting when delay will run out and next heartbeat call should be done.
 *
 * @internal
 */

HeartbeatCooldownState.onEnter(() => wait());
HeartbeatCooldownState.onExit(() => wait.cancel);

HeartbeatCooldownState.on(timesUp.type, (context, _) =>
  HeartbeatingState.with({
    channels: context.channels,
    groups: context.groups,
  }),
);

HeartbeatCooldownState.on(joined.type, (context, event) =>
  HeartbeatingState.with({
    channels: [...context.channels, ...event.payload.channels.filter((channel) => !context.channels.includes(channel))],
    groups: [...context.groups, ...event.payload.groups.filter((group) => !context.groups.includes(group))],
  }),
);

HeartbeatCooldownState.on(left.type, (context, event) =>
  HeartbeatingState.with(
    {
      channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
      groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
    },
    [leave(event.payload.channels, event.payload.groups)],
  ),
);

HeartbeatCooldownState.on(disconnect.type, (context, event) =>
  HeartbeatStoppedState.with({ channels: context.channels, groups: context.groups }, [
    ...(!event.payload.isOffline ? [leave(context.channels, context.groups)] : []),
  ]),
);

HeartbeatCooldownState.on(leftAll.type, (context, event) =>
  HeartbeatInactiveState.with(undefined, [
    ...(!event.payload.isOffline ? [leave(context.channels, context.groups)] : []),
  ]),
);
