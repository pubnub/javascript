"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeReconnectingState = void 0;
var state_1 = require("../core/state");
var effects_1 = require("../effects");
var events_1 = require("../events");
var handshake_failure_1 = require("./handshake_failure");
var handshake_stopped_1 = require("./handshake_stopped");
var receiving_1 = require("./receiving");
exports.HandshakeReconnectingState = new state_1.State('HANDSHAKE_RECONNECTING');
exports.HandshakeReconnectingState.onEnter(function (context) { return (0, effects_1.handshakeReconnect)(context); });
exports.HandshakeReconnectingState.onExit(function () { return effects_1.reconnect.cancel; });
exports.HandshakeReconnectingState.on(events_1.reconnectingSuccess.type, function (context, event) {
    return receiving_1.ReceivingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: event.payload.cursor,
    }, [(0, effects_1.emitEvents)(event.payload.events)]);
});
exports.HandshakeReconnectingState.on(events_1.reconnectingFailure.type, function (context, event) {
    return exports.HandshakeReconnectingState.with(__assign(__assign({}, context), { attempts: context.attempts + 1, reason: event.payload }));
});
exports.HandshakeReconnectingState.on(events_1.reconnectingGiveup.type, function (context) {
    return handshake_failure_1.HandshakeFailureState.with({
        groups: context.groups,
        channels: context.channels,
        reason: context.reason,
    });
});
exports.HandshakeReconnectingState.on(events_1.disconnect.type, function (context) {
    return handshake_stopped_1.HandshakeStoppedState.with({
        channels: context.channels,
        groups: context.groups,
    });
});
