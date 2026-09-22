"use strict";
/**
 * Subscribe Event Engine state instances.
 *
 * Isolated from transition handlers so state modules can import sibling states
 * without creating circular dependencies.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveFailedState = exports.ReceiveStoppedState = exports.ReceivingState = exports.HandshakeFailedState = exports.HandshakeStoppedState = exports.HandshakingState = exports.UnsubscribedState = void 0;
const state_1 = require("../core/state");
/** @internal */
exports.UnsubscribedState = new state_1.State('UNSUBSCRIBED');
/** @internal */
exports.HandshakingState = new state_1.State('HANDSHAKING');
/** @internal */
exports.HandshakeStoppedState = new state_1.State('HANDSHAKE_STOPPED');
/** @internal */
exports.HandshakeFailedState = new state_1.State('HANDSHAKE_FAILED');
/** @internal */
exports.ReceivingState = new state_1.State('RECEIVING');
/** @internal */
exports.ReceiveStoppedState = new state_1.State('RECEIVE_STOPPED');
/** @internal */
exports.ReceiveFailedState = new state_1.State('RECEIVE_FAILED');
