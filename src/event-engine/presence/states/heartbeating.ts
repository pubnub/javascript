import { State } from '../../core/state';
import { Events, disconnect, heartbeatFailure, heartbeatSuccess, joined, left, leftAll } from '../events';
import { Effects, emitStatus, heartbeat, leave } from '../effects';
import { HeartbeatCooldownState } from './heartbeat_cooldown';
import { HearbeatReconnectingState } from './heartbeat_reconnecting';
import { HeartbeatStoppedState } from './heartbeat_stopped';
import { HeartbeatInactiveState } from './heartbeat_inactive';

export type HeartbeatingStateContext = {
  channels: string[];
  groups: string[];
};

export const HeartbeatingState = new State<HeartbeatingStateContext, Events, Effects>('HEARTBEATING');

HeartbeatingState.onEnter((context) => heartbeat(context.channels, context.groups));

HeartbeatingState.on(heartbeatSuccess.type, (context, event) => {
  return HeartbeatCooldownState.with({
    channels: context.channels,
    groups: context.groups,
  });
});

HeartbeatingState.on(joined.type, (context, event) =>
  HeartbeatingState.with({
    channels: [...context.channels, ...event.payload.channels],
    groups: [...context.groups, ...event.payload.groups],
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

HeartbeatingState.on(heartbeatFailure.type, (context, event) => {
  return HearbeatReconnectingState.with({
    ...context,
    attempts: 0,
    reason: event.payload,
  });
});

HeartbeatingState.on(disconnect.type, (context) =>
  HeartbeatStoppedState.with(
    {
      channels: context.channels,
      groups: context.groups,
    },
    [leave(context.channels, context.groups)],
  ),
);

HeartbeatingState.on(leftAll.type, (context, _) =>
  HeartbeatInactiveState.with(undefined, [leave(context.channels, context.groups)]),
);
