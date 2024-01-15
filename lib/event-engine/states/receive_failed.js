"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveFailedState = void 0;
var state_1 = require("../core/state");
var events_1 = require("../events");
var handshaking_1 = require("./handshaking");
var unsubscribed_1 = require("./unsubscribed");
exports.ReceiveFailedState = new state_1.State('RECEIVE_FAILED');
exports.ReceiveFailedState.on(events_1.reconnect.type, function (context, event) {
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
exports.ReceiveFailedState.on(events_1.subscriptionChange.type, function (context, event) {
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: context.cursor,
    });
});
exports.ReceiveFailedState.on(events_1.restore.type, function (context, event) {
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.cursor.timetoken,
            region: event.payload.cursor.region || context.cursor.region,
        },
    });
});
exports.ReceiveFailedState.on(events_1.unsubscribeAll.type, function (_) { return unsubscribed_1.UnsubscribedState.with(undefined); });
