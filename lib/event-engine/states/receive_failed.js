"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveFailedState = void 0;
var state_1 = require("../core/state");
var events_1 = require("../events");
var handshaking_1 = require("./handshaking");
var unsubscribed_1 = require("./unsubscribed");
exports.ReceiveFailedState = new state_1.State('RECEIVE_FAILED');
exports.ReceiveFailedState.on(events_1.reconnect.type, function (context, event) {
    var _a, _b, _c, _d;
    return handshaking_1.HandshakingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: {
            timetoken: (_b = (_a = event.payload) === null || _a === void 0 ? void 0 : _a.timetoken) !== null && _b !== void 0 ? _b : '0',
            region: (_d = (_c = event.payload) === null || _c === void 0 ? void 0 : _c.region) !== null && _d !== void 0 ? _d : 0,
        },
    });
});
exports.ReceiveFailedState.on(events_1.subscriptionChange.type, function (_, event) {
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
    });
});
exports.ReceiveFailedState.on(events_1.restore.type, function (_, event) {
    var _a, _b;
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: { timetoken: event.payload.timetoken, region: (_b = (_a = event.payload) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : 0 },
    });
});
exports.ReceiveFailedState.on(events_1.unsubscribeAll.type, function (_) { return unsubscribed_1.UnsubscribedState.with(undefined); });
