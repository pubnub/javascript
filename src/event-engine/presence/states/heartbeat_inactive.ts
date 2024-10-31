/**
 * Inactive heratbeating state module.
 *
 * @internal
 */

import { State } from '../../core/state';
import { Effects } from '../effects';
import { Events, joined } from '../events';
import { HeartbeatingState } from './heartbeating';

/**
 * Inactive heratbeating state
 *
 * State in which Presence Event Engine doesn't process any heartbeat requests (initial state).
 *
 * @internal
 */
export const HeartbeatInactiveState = new State<void, Events, Effects>('HEARTBEAT_INACTIVE');

HeartbeatInactiveState.on(joined.type, (_, event) =>
  HeartbeatingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
  }),
);
