"use strict";
/**
 * Subscribe Event Engine effects module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitStatus = exports.emitMessages = exports.receiveMessages = exports.handshake = void 0;
const core_1 = require("./core");
/**
 * Initial subscription effect.
 *
 * Performs subscribe REST API call with `tt=0`.
 *
 * @internal
 */
exports.handshake = (0, core_1.createManagedEffect)('HANDSHAKE', (channels, groups) => ({
    channels,
    groups,
}));
/**
 * Real-time updates receive effect.
 *
 * Performs sequential subscribe REST API call with `tt` set to the value received from the previous subscribe
 * REST API call.
 *
 * @internal
 */
exports.receiveMessages = (0, core_1.createManagedEffect)('RECEIVE_MESSAGES', (channels, groups, cursor) => ({ channels, groups, cursor }));
/**
 * Emit real-time updates effect.
 *
 * Notify event listeners about updates for which listener handlers has been provided.
 *
 * @internal
 */
exports.emitMessages = (0, core_1.createEffect)('EMIT_MESSAGES', (events) => events);
/**
 * Emit subscription status change effect.
 *
 * Notify status change event listeners.
 *
 * @internal
 */
exports.emitStatus = (0, core_1.createEffect)('EMIT_STATUS', (status) => status);
