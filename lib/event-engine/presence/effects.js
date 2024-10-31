"use strict";
/**
 * Presence Event Engine effects module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.delayedHeartbeat = exports.wait = exports.emitStatus = exports.leave = exports.heartbeat = void 0;
const core_1 = require("../core");
/**
 * Presence heartbeat effect.
 *
 * Performs presence heartbeat REST API call.
 *
 * @internal
 */
exports.heartbeat = (0, core_1.createEffect)('HEARTBEAT', (channels, groups) => ({
    channels,
    groups,
}));
/**
 * Presence leave effect.
 *
 * Performs presence leave REST API call.
 *
 * @internal
 */
exports.leave = (0, core_1.createEffect)('LEAVE', (channels, groups) => ({
    channels,
    groups,
}));
/**
 * Emit presence heartbeat REST API call result status effect.
 *
 * Notify status change event listeners.
 *
 * @internal
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
exports.emitStatus = (0, core_1.createEffect)('EMIT_STATUS', (status) => status);
/**
 * Heartbeat delay effect.
 *
 * Delay of configured length (heartbeat interval) before another heartbeat REST API call will be done.
 *
 * @internal
 */
exports.wait = (0, core_1.createManagedEffect)('WAIT', () => ({}));
/**
 * Delayed heartbeat effect.
 *
 * Similar to the {@link wait} effect but used in case if previous heartbeat call did fail.
 *
 * @internal
 */
exports.delayedHeartbeat = (0, core_1.createManagedEffect)('DELAYED_HEARTBEAT', (context) => context);
