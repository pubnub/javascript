"use strict";
/**
 * Presence Event Engine state instances.
 *
 * Isolated from transition handlers so state modules can import sibling states
 * without creating circular dependencies.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatFailedState = exports.HeartbeatStoppedState = exports.HeartbeatCooldownState = exports.HeartbeatingState = exports.HeartbeatInactiveState = void 0;
const state_1 = require("../../core/state");
/** @internal */
exports.HeartbeatInactiveState = new state_1.State('HEARTBEAT_INACTIVE');
/** @internal */
exports.HeartbeatingState = new state_1.State('HEARTBEATING');
/** @internal */
exports.HeartbeatCooldownState = new state_1.State('HEARTBEAT_COOLDOWN');
/** @internal */
exports.HeartbeatStoppedState = new state_1.State('HEARTBEAT_STOPPED');
/** @internal */
exports.HeartbeatFailedState = new state_1.State('HEARTBEAT_FAILED');
