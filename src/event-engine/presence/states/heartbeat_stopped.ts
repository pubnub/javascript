import { State } from '../../core/state';
import { Effects, leave } from '../effects';
import { Events, joined, left, reconnect, leftAll, disconnect } from '../events';
import { HeartbeatInactiveState } from './heartbeat_inactive';
import { HeartbeatingState } from './heartbeating';

export type HeartbeatStoppedStateContext = {
  channels: string[];
  groups: string[];
};

export const HeartbeatStoppedState = new State<HeartbeatStoppedStateContext, Events, Effects>('HEARTBEAT_STOPPED');

HeartbeatStoppedState.on(joined.type, (context, event) =>
  HeartbeatStoppedState.with({
    channels: [...context.channels, ...event.payload.channels],
    groups: [...context.groups, ...event.payload.groups],
  }),
);

HeartbeatStoppedState.on(left.type, (context, event) =>
  HeartbeatStoppedState.with(
    {
      channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
      groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
    },
    [leave(event.payload.channels, event.payload.groups)],
  ),
);

HeartbeatStoppedState.on(reconnect.type, (context, _) =>
  HeartbeatingState.with({
    channels: context.channels,
    groups: context.groups,
  }),
);

HeartbeatStoppedState.on(disconnect.type, (context, _) =>
  HeartbeatStoppedState.with(
    {
      channels: context.channels,
      groups: context.groups,
    },
    [leave(context.channels, context.groups)],
  ),
);

HeartbeatStoppedState.on(leftAll.type, (context, _) =>
  HeartbeatInactiveState.with(undefined, [leave(context.channels, context.groups)]),
);
