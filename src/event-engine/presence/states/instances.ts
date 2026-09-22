/**
 * Presence Event Engine state instances.
 *
 * Isolated from transition handlers so state modules can import sibling states
 * without creating circular dependencies.
 *
 * @internal
 */

import { State } from '../../core/state';
import { Effects } from '../effects';
import { Events } from '../events';

/**
 * Context which represent current Presence Event Engine data state.
 *
 * @internal
 */
export type HeartbeatingStateContext = {
  channels: string[];
  groups: string[];
};

/**
 * Context which represent current Presence Event Engine data state.
 *
 * @internal
 */
export type HeartbeatCooldownStateContext = {
  channels: string[];
  groups: string[];
};

/**
 * Context which represent current Presence Event Engine data state.
 *
 * @internal
 */
export type HeartbeatStoppedStateContext = {
  channels: string[];
  groups: string[];
};

/**
 * Context which represent current Presence Event Engine data state.
 *
 * @internal
 */
export type HeartbeatFailedStateContext = {
  channels: string[];
  groups: string[];
};

/** @internal */
export const HeartbeatInactiveState = new State<void, Events, Effects>('HEARTBEAT_INACTIVE');

/** @internal */
export const HeartbeatingState = new State<HeartbeatingStateContext, Events, Effects>('HEARTBEATING');

/** @internal */
export const HeartbeatCooldownState = new State<HeartbeatCooldownStateContext, Events, Effects>('HEARTBEAT_COOLDOWN');

/** @internal */
export const HeartbeatStoppedState = new State<HeartbeatStoppedStateContext, Events, Effects>('HEARTBEAT_STOPPED');

/** @internal */
export const HeartbeatFailedState = new State<HeartbeatFailedStateContext, Events, Effects>('HEARTBEAT_FAILED');
