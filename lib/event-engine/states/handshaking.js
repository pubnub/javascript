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
exports.HandshakingState = void 0;
var state_1 = require("../core/state");
var effects_1 = require("../effects");
var events_1 = require("../events");
var handshake_reconnecting_1 = require("./handshake_reconnecting");
var handshake_stopped_1 = require("./handshake_stopped");
var receiving_1 = require("./receiving");
var unsubscribed_1 = require("./unsubscribed");
exports.HandshakingState = new state_1.State('HANDSHAKING');
exports.HandshakingState.onEnter(function (context) { return (0, effects_1.handshake)(context.channels, context.groups); });
exports.HandshakingState.onExit(function () { return effects_1.handshake.cancel; });
exports.HandshakingState.on(events_1.subscriptionChange.type, function (context, event) {
    if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
        return unsubscribed_1.UnsubscribedState.with(undefined);
    }
    return exports.HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups });
});
exports.HandshakingState.on(events_1.handshakingSuccess.type, function (context, event) {
    return receiving_1.ReceivingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: event.payload,
    });
});
exports.HandshakingState.on(events_1.handshakingFailure.type, function (context, event) {
    return handshake_reconnecting_1.HandshakeReconnectingState.with(__assign(__assign({}, context), { attempts: 0, reason: event.payload }));
});
exports.HandshakingState.on(events_1.disconnect.type, function (context) {
    return handshake_stopped_1.HandshakeStoppedState.with({
        channels: context.channels,
        groups: context.groups,
    });
});
