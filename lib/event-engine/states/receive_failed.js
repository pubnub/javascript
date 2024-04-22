"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveFailedState = void 0;
const state_1 = require("../core/state");
const events_1 = require("../events");
const handshaking_1 = require("./handshaking");
const unsubscribed_1 = require("./unsubscribed");
exports.ReceiveFailedState = new state_1.State('RECEIVE_FAILED');
exports.ReceiveFailedState.on(events_1.reconnect.type, (context, event) => {
    var _a;
    return handshaking_1.HandshakingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: {
            timetoken: !!event.payload.cursor.timetoken ? (_a = event.payload.cursor) === null || _a === void 0 ? void 0 : _a.timetoken : context.cursor.timetoken,
            region: event.payload.cursor.region || context.cursor.region,
        },
    });
});
exports.ReceiveFailedState.on(events_1.subscriptionChange.type, (context, event) => handshaking_1.HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
}));
exports.ReceiveFailedState.on(events_1.restore.type, (context, event) => handshaking_1.HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
        timetoken: event.payload.cursor.timetoken,
        region: event.payload.cursor.region || context.cursor.region,
    },
}));
exports.ReceiveFailedState.on(events_1.unsubscribeAll.type, (_) => unsubscribed_1.UnsubscribedState.with(undefined));
