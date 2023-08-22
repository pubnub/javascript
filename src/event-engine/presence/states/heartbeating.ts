import { State } from '../../core/state';
import { Events, heartbeatFailure, heartbeatSuccess, joined, left } from '../events';
import { Effects, heartbeat, leave } from '../effects';
import { HeartbeatCooldownState } from './heartbeat_cooldown';
import { HearbeatReconnectingState } from './heartbeat_reconnecting';

export type HeartbeatingStateContext = {
  channels: string[];
  groups: string[];
};

export const HeartbeatingState = new State<HeartbeatingStateContext, Events, Effects>('HEARTBEATING');

HeartbeatingState.onEnter((context) => heartbeat(context.channels, context.groups));
// HeartbeatingState.onExit(() => heartbeat.cancel);

HeartbeatingState.on(heartbeatSuccess.type, (context, _) => {
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

HeartbeatingState.on(left.type, (context, event) =>
  HeartbeatingState.with(
    {
      channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
      groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
    },
    [leave(event.payload.channels, event.payload.groups)],
  ),
);

HeartbeatingState.on(heartbeatFailure.type, (context, event) =>
  HearbeatReconnectingState.with({
    channels: context.channels,
    groups: context.groups,
  }),
);
