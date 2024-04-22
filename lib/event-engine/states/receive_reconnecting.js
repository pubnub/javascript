"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveReconnectingState = void 0;
const state_1 = require("../core/state");
const effects_1 = require("../effects");
const events_1 = require("../events");
const receiving_1 = require("./receiving");
const receive_failed_1 = require("./receive_failed");
const receive_stopped_1 = require("./receive_stopped");
const unsubscribed_1 = require("./unsubscribed");
const categories_1 = __importDefault(require("../../core/constants/categories"));
exports.ReceiveReconnectingState = new state_1.State('RECEIVE_RECONNECTING');
exports.ReceiveReconnectingState.onEnter((context) => (0, effects_1.receiveReconnect)(context));
exports.ReceiveReconnectingState.onExit(() => effects_1.receiveReconnect.cancel);
exports.ReceiveReconnectingState.on(events_1.receiveReconnectSuccess.type, (context, event) => receiving_1.ReceivingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: event.payload.cursor,
}, [(0, effects_1.emitMessages)(event.payload.events)]));
exports.ReceiveReconnectingState.on(events_1.receiveReconnectFailure.type, (context, event) => exports.ReceiveReconnectingState.with(Object.assign(Object.assign({}, context), { attempts: context.attempts + 1, reason: event.payload })));
exports.ReceiveReconnectingState.on(events_1.receiveReconnectGiveup.type, (context, event) => {
    var _a;
    return receive_failed_1.ReceiveFailedState.with({
        groups: context.groups,
        channels: context.channels,
        cursor: context.cursor,
        reason: event.payload,
    }, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedUnexpectedlyCategory, error: (_a = event.payload) === null || _a === void 0 ? void 0 : _a.message })]);
});
exports.ReceiveReconnectingState.on(events_1.disconnect.type, (context) => receive_stopped_1.ReceiveStoppedState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: context.cursor,
}, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory })]));
exports.ReceiveReconnectingState.on(events_1.restore.type, (context, event) => receiving_1.ReceivingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
        timetoken: event.payload.cursor.timetoken,
        region: event.payload.cursor.region || context.cursor.region,
    },
}));
exports.ReceiveReconnectingState.on(events_1.subscriptionChange.type, (context, event) => receiving_1.ReceivingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
}));
exports.ReceiveReconnectingState.on(events_1.unsubscribeAll.type, (_) => unsubscribed_1.UnsubscribedState.with(undefined, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory })]));
