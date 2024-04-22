"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handshakeReconnect = exports.receiveReconnect = exports.emitStatus = exports.emitMessages = exports.receiveMessages = exports.handshake = void 0;
const core_1 = require("./core");
exports.handshake = (0, core_1.createManagedEffect)('HANDSHAKE', (channels, groups) => ({
    channels,
    groups,
}));
exports.receiveMessages = (0, core_1.createManagedEffect)('RECEIVE_MESSAGES', (channels, groups, cursor) => ({ channels, groups, cursor }));
exports.emitMessages = (0, core_1.createEffect)('EMIT_MESSAGES', (events) => events);
exports.emitStatus = (0, core_1.createEffect)('EMIT_STATUS', (status) => status);
exports.receiveReconnect = (0, core_1.createManagedEffect)('RECEIVE_RECONNECT', (context) => context);
exports.handshakeReconnect = (0, core_1.createManagedEffect)('HANDSHAKE_RECONNECT', (context) => context);
