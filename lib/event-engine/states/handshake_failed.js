"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeFailedState = void 0;
const state_1 = require("../core/state");
const events_1 = require("../events");
const handshaking_1 = require("./handshaking");
const unsubscribed_1 = require("./unsubscribed");
exports.HandshakeFailedState = new state_1.State('HANDSHAKE_FAILED');
exports.HandshakeFailedState.on(events_1.subscriptionChange.type, (context, event) => handshaking_1.HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
}));
exports.HandshakeFailedState.on(events_1.reconnect.type, (context, event) => handshaking_1.HandshakingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: event.payload.cursor || context.cursor,
}));
exports.HandshakeFailedState.on(events_1.restore.type, (context, event) => {
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
exports.HandshakeFailedState.on(events_1.unsubscribeAll.type, (_) => unsubscribed_1.UnsubscribedState.with());
