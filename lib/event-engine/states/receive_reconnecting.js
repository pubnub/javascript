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
exports.ReceiveReconnectingState = void 0;
var state_1 = require("../core/state");
var effects_1 = require("../effects");
var events_1 = require("../events");
var receiving_1 = require("./receiving");
var receive_failure_1 = require("./receive_failure");
var receive_stopped_1 = require("./receive_stopped");
exports.ReceiveReconnectingState = new state_1.State('RECEIVE_RECONNECTING');
exports.ReceiveReconnectingState.onEnter(function (context) { return (0, effects_1.reconnect)(context); });
exports.ReceiveReconnectingState.onExit(function () { return effects_1.reconnect.cancel; });
exports.ReceiveReconnectingState.on(events_1.reconnectingSuccess.type, function (context, event) {
    return receiving_1.ReceivingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: event.payload.cursor,
    }, [(0, effects_1.emitEvents)(event.payload.events)]);
});
exports.ReceiveReconnectingState.on(events_1.reconnectingFailure.type, function (context, event) {
    return exports.ReceiveReconnectingState.with(__assign(__assign({}, context), { attempts: context.attempts + 1, reason: event.payload }));
});
exports.ReceiveReconnectingState.on(events_1.reconnectingGiveup.type, function (context) {
    return receive_failure_1.ReceiveFailureState.with({
        groups: context.groups,
        channels: context.channels,
        cursor: context.cursor,
        reason: context.reason,
    });
});
exports.ReceiveReconnectingState.on(events_1.disconnect.type, function (context) {
    return receive_stopped_1.ReceiveStoppedState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: context.cursor,
    });
});
