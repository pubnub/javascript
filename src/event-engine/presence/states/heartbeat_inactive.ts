/**
 * Inactive heratbeating state module.
 *
 * @internal
 */

import { joined } from '../events';
import { HeartbeatInactiveState, HeartbeatingState } from './instances';

export { HeartbeatInactiveState };

/**
 * Inactive heratbeating state
 *
 * State in which Presence Event Engine doesn't process any heartbeat requests (initial state).
 *
 * @internal
 */

HeartbeatInactiveState.on(joined.type, (_, event) =>
  HeartbeatingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
  }),
);
