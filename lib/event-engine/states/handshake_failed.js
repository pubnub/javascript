"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeFailedState = void 0;
var state_1 = require("../core/state");
var events_1 = require("../events");
var handshaking_1 = require("./handshaking");
var unsubscribed_1 = require("./unsubscribed");
exports.HandshakeFailedState = new state_1.State('HANDSHAKE_FAILED');
exports.HandshakeFailedState.on(events_1.subscriptionChange.type, function (context, event) {
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: context.cursor,
    });
});
exports.HandshakeFailedState.on(events_1.reconnect.type, function (context, event) {
    return handshaking_1.HandshakingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: event.payload.cursor || context.cursor,
    });
});
exports.HandshakeFailedState.on(events_1.restore.type, function (context, event) {
    var _a, _b;
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.cursor.timetoken,
            region: event.payload.cursor.region ? event.payload.cursor.region : (_b = (_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : 0,
        },
    });
});
exports.HandshakeFailedState.on(events_1.unsubscribeAll.type, function (_) { return unsubscribed_1.UnsubscribedState.with(); });
