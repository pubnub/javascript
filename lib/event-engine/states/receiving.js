"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceivingState = void 0;
const state_1 = require("../core/state");
const effects_1 = require("../effects");
const events_1 = require("../events");
const unsubscribed_1 = require("./unsubscribed");
const receive_reconnecting_1 = require("./receive_reconnecting");
const receive_stopped_1 = require("./receive_stopped");
const categories_1 = __importDefault(require("../../core/constants/categories"));
exports.ReceivingState = new state_1.State('RECEIVING');
exports.ReceivingState.onEnter((context) => (0, effects_1.receiveMessages)(context.channels, context.groups, context.cursor));
exports.ReceivingState.onExit(() => effects_1.receiveMessages.cancel);
exports.ReceivingState.on(events_1.receiveSuccess.type, (context, event) => {
    return exports.ReceivingState.with({ channels: context.channels, groups: context.groups, cursor: event.payload.cursor }, [
        (0, effects_1.emitMessages)(event.payload.events),
    ]);
});
exports.ReceivingState.on(events_1.subscriptionChange.type, (context, event) => {
    if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
        return unsubscribed_1.UnsubscribedState.with(undefined);
    }
    return exports.ReceivingState.with({
        cursor: context.cursor,
        channels: event.payload.channels,
        groups: event.payload.groups,
    });
});
exports.ReceivingState.on(events_1.restore.type, (context, event) => {
    if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
        return unsubscribed_1.UnsubscribedState.with(undefined);
    }
    return exports.ReceivingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.cursor.timetoken,
            region: event.payload.cursor.region || context.cursor.region,
        },
    });
});
exports.ReceivingState.on(events_1.receiveFailure.type, (context, event) => {
    return receive_reconnecting_1.ReceiveReconnectingState.with(Object.assign(Object.assign({}, context), { attempts: 0, reason: event.payload }));
});
exports.ReceivingState.on(events_1.disconnect.type, (context) => {
    return receive_stopped_1.ReceiveStoppedState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: context.cursor,
    }, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory })]);
});
exports.ReceivingState.on(events_1.unsubscribeAll.type, (_) => unsubscribed_1.UnsubscribedState.with(undefined, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory })]));
