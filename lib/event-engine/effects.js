"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handshakeReconnect = exports.reconnect = exports.emitEvents = exports.receiveEvents = exports.handshake = void 0;
var core_1 = require("./core");
exports.handshake = (0, core_1.createManagedEffect)('HANDSHAKE', function (channels, groups) { return ({
    channels: channels,
    groups: groups,
}); });
exports.receiveEvents = (0, core_1.createManagedEffect)('RECEIVE_EVENTS', function (channels, groups, cursor) { return ({ channels: channels, groups: groups, cursor: cursor }); });
exports.emitEvents = (0, core_1.createEffect)('EMIT_EVENTS', function (events) { return events; });
exports.reconnect = (0, core_1.createManagedEffect)('RECONNECT', function (context) { return context; });
exports.handshakeReconnect = (0, core_1.createManagedEffect)('HANDSHAKE_RECONNECT', function (context) { return context; });
