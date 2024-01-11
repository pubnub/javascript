import { State } from '../../core/state';
import { Effects } from '../effects';
import { Events, joined, left, reconnect, leftAll } from '../events';
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
  HeartbeatStoppedState.with({
    channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
    groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
  }),
);

HeartbeatStoppedState.on(reconnect.type, (context, _) =>
  HeartbeatingState.with({
    channels: context.channels,
    groups: context.groups,
  }),
);

HeartbeatStoppedState.on(leftAll.type, (context, _) => HeartbeatInactiveState.with(undefined));
