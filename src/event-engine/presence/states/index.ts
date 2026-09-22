/**
 * Presence Event Engine states.
 *
 * Side-effect imports register transition handlers on the shared state instances.
 *
 * @internal
 */

import './heartbeat_inactive';
import './heartbeating';
import './heartbeat_cooldown';
import './heartbeat_stopped';
import './heartbeat_failed';

export {
  HeartbeatInactiveState,
  HeartbeatingState,
  HeartbeatCooldownState,
  HeartbeatStoppedState,
  HeartbeatFailedState,
} from './instances';

export type {
  HeartbeatingStateContext,
  HeartbeatCooldownStateContext,
  HeartbeatStoppedStateContext,
  HeartbeatFailedStateContext,
} from './instances';
