"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handshakeReconnect = exports.receiveReconnect = exports.emitStatus = exports.emitMessages = exports.receiveMessages = exports.handshake = void 0;
var core_1 = require("./core");
exports.handshake = (0, core_1.createManagedEffect)('HANDSHAKE', function (channels, groups) { return ({
    channels: channels,
    groups: groups,
}); });
exports.receiveMessages = (0, core_1.createManagedEffect)('RECEIVE_MESSAGES', function (channels, groups, cursor) { return ({ channels: channels, groups: groups, cursor: cursor }); });
exports.emitMessages = (0, core_1.createEffect)('EMIT_MESSAGES', function (events) { return events; });
// TODO: Find out actual `status` type.
/* eslint-disable  @typescript-eslint/no-explicit-any */
exports.emitStatus = (0, core_1.createEffect)('EMIT_STATUS', function (status) { return status; });
exports.receiveReconnect = (0, core_1.createManagedEffect)('RECEIVE_RECONNECT', function (context) { return context; });
exports.handshakeReconnect = (0, core_1.createManagedEffect)('HANDSHAKE_RECONNECT', function (context) { return context; });
