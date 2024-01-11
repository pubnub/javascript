"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeFailedState = void 0;
var state_1 = require("../core/state");
var events_1 = require("../events");
var handshaking_1 = require("./handshaking");
var unsubscribed_1 = require("./unsubscribed");
exports.HandshakeFailedState = new state_1.State('HANDSHAKE_FAILED');
exports.HandshakeFailedState.on(events_1.subscriptionChange.type, function (_, event) {
    return handshaking_1.HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups });
});
exports.HandshakeFailedState.on(events_1.reconnect.type, function (context, event) {
    var _a, _b, _c, _d, _e;
    return handshaking_1.HandshakingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: {
            timetoken: (_c = (_b = (_a = event.payload) === null || _a === void 0 ? void 0 : _a.timetoken) !== null && _b !== void 0 ? _b : context.timetoken) !== null && _c !== void 0 ? _c : '0',
            region: (_e = (_d = event.payload) === null || _d === void 0 ? void 0 : _d.region) !== null && _e !== void 0 ? _e : 0,
        },
    });
});
exports.HandshakeFailedState.on(events_1.restore.type, function (_, event) {
    var _a, _b;
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.timetoken,
            region: (_b = (_a = event.payload) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : 0,
        },
    });
});
exports.HandshakeFailedState.on(events_1.unsubscribeAll.type, function (_) { return unsubscribed_1.UnsubscribedState.with(); });
