import { State } from '../../core/state';
import { Effects } from '../effects';
import { Events, joined, left } from '../events';
import { HeartbeatingState } from './heartbeating';

export const HeartbeatInactiveState = new State<void, Events, Effects>('HEARTBEAT_INACTIVE');

HeartbeatInactiveState.on(joined.type, (_, event) =>
  HeartbeatingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
  }),
);

HeartbeatInactiveState.on(left.type, (_, event) => HeartbeatInactiveState.with());
