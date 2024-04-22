"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeStoppedState = void 0;
const state_1 = require("../core/state");
const events_1 = require("../events");
const handshaking_1 = require("./handshaking");
const unsubscribed_1 = require("./unsubscribed");
exports.HandshakeStoppedState = new state_1.State('HANDSHAKE_STOPPED');
exports.HandshakeStoppedState.on(events_1.subscriptionChange.type, (context, event) => exports.HandshakeStoppedState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
}));
exports.HandshakeStoppedState.on(events_1.reconnect.type, (context, event) => handshaking_1.HandshakingState.with(Object.assign(Object.assign({}, context), { cursor: event.payload.cursor || context.cursor })));
exports.HandshakeStoppedState.on(events_1.restore.type, (context, event) => {
    var _a;
    return exports.HandshakeStoppedState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.cursor.timetoken,
            region: event.payload.cursor.region || ((_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) || 0,
        },
    });
});
exports.HandshakeStoppedState.on(events_1.unsubscribeAll.type, (_) => unsubscribed_1.UnsubscribedState.with());
