"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveStoppedState = void 0;
var state_1 = require("../core/state");
var events_1 = require("../events");
var handshaking_1 = require("./handshaking");
var receiving_1 = require("./receiving");
var unsubscribed_1 = require("./unsubscribed");
exports.ReceiveStoppedState = new state_1.State('STOPPED');
exports.ReceiveStoppedState.on(events_1.subscriptionChange.type, function (context, event) {
    return receiving_1.ReceivingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: context.cursor,
    });
});
exports.ReceiveStoppedState.on(events_1.restore.type, function (context, event) {
    return receiving_1.ReceivingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: context.cursor,
    });
});
exports.ReceiveStoppedState.on(events_1.reconnect.type, function (context) {
    return handshaking_1.HandshakingState.with({
        channels: context.channels,
        groups: context.groups,
    });
});
exports.ReceiveStoppedState.on(events_1.unsubscribeAll.type, function () { return unsubscribed_1.UnsubscribedState.with(undefined); });
