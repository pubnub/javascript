"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveFailureState = void 0;
var state_1 = require("../core/state");
var events_1 = require("../events");
var handshaking_1 = require("./handshaking");
var receive_stopped_1 = require("./receive_stopped");
var unsubscribed_1 = require("./unsubscribed");
exports.ReceiveFailureState = new state_1.State('RECEIVE_FAILED');
exports.ReceiveFailureState.on(events_1.reconnectingRetry.type, function (context) {
    return handshaking_1.HandshakingState.with({
        channels: context.channels,
        groups: context.groups,
        timetoken: context.cursor.timetoken,
    });
});
exports.ReceiveFailureState.on(events_1.disconnect.type, function (context) {
    return receive_stopped_1.ReceiveStoppedState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: context.cursor,
    });
});
exports.ReceiveFailureState.on(events_1.subscriptionChange.type, function (_, event) {
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        timetoken: event.payload.timetoken,
    });
});
exports.ReceiveFailureState.on(events_1.restore.type, function (_, event) {
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        timetoken: event.payload.timetoken,
    });
});
exports.ReceiveFailureState.on(events_1.unsubscribeAll.type, function (_) { return unsubscribed_1.UnsubscribedState.with(undefined); });
