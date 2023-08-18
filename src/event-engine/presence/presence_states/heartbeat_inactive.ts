import { State } from '../core/state';
import { Effects } from '../presence_effects';
import { Events, joined } from '../presence_events';
import { HeartbeatingState } from './heartbeating';

export const HeartbeatInactiveState = new State<void, Events, Effects>('HEARTBEAT_INACTIVE');

HeartbeatInactiveState.on(joined.type, (_, event) => 
  HeartbeatingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups
  }),
);