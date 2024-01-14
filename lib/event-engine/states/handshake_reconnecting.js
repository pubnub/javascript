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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeReconnectingState = void 0;
var state_1 = require("../core/state");
var effects_1 = require("../effects");
var events_1 = require("../events");
var handshake_failed_1 = require("./handshake_failed");
var handshake_stopped_1 = require("./handshake_stopped");
var handshaking_1 = require("./handshaking");
var receiving_1 = require("./receiving");
var unsubscribed_1 = require("./unsubscribed");
var categories_1 = __importDefault(require("../../core/constants/categories"));
exports.HandshakeReconnectingState = new state_1.State('HANDSHAKE_RECONNECTING');
exports.HandshakeReconnectingState.onEnter(function (context) { return (0, effects_1.handshakeReconnect)(context); });
exports.HandshakeReconnectingState.onExit(function () { return effects_1.handshakeReconnect.cancel; });
exports.HandshakeReconnectingState.on(events_1.handshakeReconnectSuccess.type, function (context, event) {
    var _a, _b;
    var cursor = {
        timetoken: !!((_a = context.cursor) === null || _a === void 0 ? void 0 : _a.timetoken) ? (_b = context.cursor) === null || _b === void 0 ? void 0 : _b.timetoken : event.payload.cursor.timetoken,
        region: event.payload.cursor.region,
    };
    return receiving_1.ReceivingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: cursor,
    }, [(0, effects_1.emitStatus)({ category: categories_1.default.PNConnectedCategory })]);
});
exports.HandshakeReconnectingState.on(events_1.handshakeReconnectFailure.type, function (context, event) {
    return exports.HandshakeReconnectingState.with(__assign(__assign({}, context), { attempts: context.attempts + 1, reason: event.payload }));
});
exports.HandshakeReconnectingState.on(events_1.handshakeReconnectGiveup.type, function (context, event) {
    var _a;
    return handshake_failed_1.HandshakeFailedState.with({
        groups: context.groups,
        channels: context.channels,
        cursor: context.cursor,
        reason: event.payload,
    }, [(0, effects_1.emitStatus)({ category: categories_1.default.PNConnectionErrorCategory, error: (_a = event.payload) === null || _a === void 0 ? void 0 : _a.message })]);
});
exports.HandshakeReconnectingState.on(events_1.disconnect.type, function (context) {
    return handshake_stopped_1.HandshakeStoppedState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: context.cursor,
    });
});
exports.HandshakeReconnectingState.on(events_1.subscriptionChange.type, function (_, event) {
    return handshaking_1.HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups });
});
exports.HandshakeReconnectingState.on(events_1.restore.type, function (context, event) {
    var _a, _b;
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.cursor.timetoken,
            region: event.payload.cursor.region ? event.payload.cursor.region : (_b = (_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : 0,
        },
    });
});
exports.HandshakeReconnectingState.on(events_1.unsubscribeAll.type, function (_) { return unsubscribed_1.UnsubscribedState.with(undefined); });
