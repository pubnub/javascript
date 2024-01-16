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
exports.ReceivingState = void 0;
var state_1 = require("../core/state");
var effects_1 = require("../effects");
var events_1 = require("../events");
var unsubscribed_1 = require("./unsubscribed");
var receive_reconnecting_1 = require("./receive_reconnecting");
var receive_stopped_1 = require("./receive_stopped");
var categories_1 = __importDefault(require("../../core/constants/categories"));
exports.ReceivingState = new state_1.State('RECEIVING');
exports.ReceivingState.onEnter(function (context) { return (0, effects_1.receiveMessages)(context.channels, context.groups, context.cursor); });
exports.ReceivingState.onExit(function () { return effects_1.receiveMessages.cancel; });
exports.ReceivingState.on(events_1.receiveSuccess.type, function (context, event) {
    return exports.ReceivingState.with({ channels: context.channels, groups: context.groups, cursor: event.payload.cursor }, [
        (0, effects_1.emitMessages)(event.payload.events),
    ]);
});
exports.ReceivingState.on(events_1.subscriptionChange.type, function (context, event) {
    if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
        return unsubscribed_1.UnsubscribedState.with(undefined);
    }
    return exports.ReceivingState.with({
        cursor: context.cursor,
        channels: event.payload.channels,
        groups: event.payload.groups,
    });
});
exports.ReceivingState.on(events_1.restore.type, function (context, event) {
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
exports.ReceivingState.on(events_1.receiveFailure.type, function (context, event) {
    return receive_reconnecting_1.ReceiveReconnectingState.with(__assign(__assign({}, context), { attempts: 0, reason: event.payload }));
});
exports.ReceivingState.on(events_1.disconnect.type, function (context) {
    return receive_stopped_1.ReceiveStoppedState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: context.cursor,
    }, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory })]);
});
exports.ReceivingState.on(events_1.unsubscribeAll.type, function (_) {
    return unsubscribed_1.UnsubscribedState.with(undefined, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory })]);
});
