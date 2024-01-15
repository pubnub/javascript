"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
var categories_1 = __importDefault(require("../../core/constants/categories"));
exports.HandshakingState = new state_1.State('HANDSHAKING');
exports.HandshakingState.onEnter(function (context) { return (0, effects_1.handshake)(context.channels, context.groups); });
exports.HandshakingState.onExit(function () { return effects_1.handshake.cancel; });
exports.HandshakingState.on(events_1.subscriptionChange.type, function (context, event) {
    if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
        return unsubscribed_1.UnsubscribedState.with(undefined);
    }
    return exports.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: context.cursor,
    });
});
exports.HandshakingState.on(events_1.handshakeSuccess.type, function (context, event) {
    var _a, _b;
    return receiving_1.ReceivingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: {
            timetoken: !!((_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.timetoken) ? (_b = context === null || context === void 0 ? void 0 : context.cursor) === null || _b === void 0 ? void 0 : _b.timetoken : event.payload.timetoken,
            region: event.payload.region,
        },
    }, [
        (0, effects_1.emitStatus)({
            category: categories_1.default.PNConnectedCategory,
        }),
    ]);
});
exports.HandshakingState.on(events_1.handshakeFailure.type, function (context, event) {
    return handshake_reconnecting_1.HandshakeReconnectingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: context.cursor,
        attempts: 0,
        reason: event.payload,
    });
});
exports.HandshakingState.on(events_1.disconnect.type, function (context) {
    return handshake_stopped_1.HandshakeStoppedState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: context.cursor,
    });
});
exports.HandshakingState.on(events_1.restore.type, function (context, event) {
    var _a;
    return exports.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.cursor.timetoken,
            region: event.payload.cursor.region || ((_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) || 0,
        },
    });
});
exports.HandshakingState.on(events_1.unsubscribeAll.type, function (_) { return unsubscribed_1.UnsubscribedState.with(); });
