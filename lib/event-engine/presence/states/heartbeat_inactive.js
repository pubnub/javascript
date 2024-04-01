import { State } from '../../core/state';
import { joined } from '../events';
import { HeartbeatingState } from './heartbeating';
export const HeartbeatInactiveState = new State('HEARTBEAT_INACTIVE');
HeartbeatInactiveState.on(joined.type, (_, event) => HeartbeatingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
}));
