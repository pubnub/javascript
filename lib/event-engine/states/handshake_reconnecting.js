"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeReconnectingState = void 0;
const state_1 = require("../core/state");
const effects_1 = require("../effects");
const events_1 = require("../events");
const handshake_failed_1 = require("./handshake_failed");
const handshake_stopped_1 = require("./handshake_stopped");
const handshaking_1 = require("./handshaking");
const receiving_1 = require("./receiving");
const unsubscribed_1 = require("./unsubscribed");
const categories_1 = __importDefault(require("../../core/constants/categories"));
exports.HandshakeReconnectingState = new state_1.State('HANDSHAKE_RECONNECTING');
exports.HandshakeReconnectingState.onEnter((context) => (0, effects_1.handshakeReconnect)(context));
exports.HandshakeReconnectingState.onExit(() => effects_1.handshakeReconnect.cancel);
exports.HandshakeReconnectingState.on(events_1.handshakeReconnectSuccess.type, (context, event) => {
    var _a, _b;
    const cursor = {
        timetoken: !!((_a = context.cursor) === null || _a === void 0 ? void 0 : _a.timetoken) ? (_b = context.cursor) === null || _b === void 0 ? void 0 : _b.timetoken : event.payload.cursor.timetoken,
        region: event.payload.cursor.region,
    };
    return receiving_1.ReceivingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: cursor,
    }, [(0, effects_1.emitStatus)({ category: categories_1.default.PNConnectedCategory })]);
});
exports.HandshakeReconnectingState.on(events_1.handshakeReconnectFailure.type, (context, event) => exports.HandshakeReconnectingState.with(Object.assign(Object.assign({}, context), { attempts: context.attempts + 1, reason: event.payload })));
exports.HandshakeReconnectingState.on(events_1.handshakeReconnectGiveup.type, (context, event) => {
    var _a;
    return handshake_failed_1.HandshakeFailedState.with({
        groups: context.groups,
        channels: context.channels,
        cursor: context.cursor,
        reason: event.payload,
    }, [(0, effects_1.emitStatus)({ category: categories_1.default.PNConnectionErrorCategory, error: (_a = event.payload) === null || _a === void 0 ? void 0 : _a.message })]);
});
exports.HandshakeReconnectingState.on(events_1.disconnect.type, (context) => handshake_stopped_1.HandshakeStoppedState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: context.cursor,
}));
exports.HandshakeReconnectingState.on(events_1.subscriptionChange.type, (context, event) => handshaking_1.HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
}));
exports.HandshakeReconnectingState.on(events_1.restore.type, (context, event) => {
    var _a, _b;
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.cursor.timetoken,
            region: ((_a = event.payload.cursor) === null || _a === void 0 ? void 0 : _a.region) || ((_b = context === null || context === void 0 ? void 0 : context.cursor) === null || _b === void 0 ? void 0 : _b.region) || 0,
        },
    });
});
exports.HandshakeReconnectingState.on(events_1.unsubscribeAll.type, (_) => unsubscribed_1.UnsubscribedState.with(undefined));
