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
exports.ReceiveReconnectingState = void 0;
var state_1 = require("../core/state");
var effects_1 = require("../effects");
var events_1 = require("../events");
var receiving_1 = require("./receiving");
var receive_failed_1 = require("./receive_failed");
var receive_stopped_1 = require("./receive_stopped");
var unsubscribed_1 = require("./unsubscribed");
var categories_1 = __importDefault(require("../../core/constants/categories"));
exports.ReceiveReconnectingState = new state_1.State('RECEIVE_RECONNECTING');
exports.ReceiveReconnectingState.onEnter(function (context) { return (0, effects_1.receiveReconnect)(context); });
exports.ReceiveReconnectingState.onExit(function () { return effects_1.receiveReconnect.cancel; });
exports.ReceiveReconnectingState.on(events_1.receiveReconnectSuccess.type, function (context, event) {
    return receiving_1.ReceivingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: event.payload.cursor,
    }, [(0, effects_1.emitMessages)(event.payload.events)]);
});
exports.ReceiveReconnectingState.on(events_1.receiveReconnectFailure.type, function (context, event) {
    return exports.ReceiveReconnectingState.with(__assign(__assign({}, context), { attempts: context.attempts + 1, reason: event.payload }));
});
exports.ReceiveReconnectingState.on(events_1.receiveReconnectGiveup.type, function (context, event) {
    var _a;
    return receive_failed_1.ReceiveFailedState.with({
        groups: context.groups,
        channels: context.channels,
        cursor: context.cursor,
        reason: event.payload,
    }, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedUnexpectedlyCategory, error: (_a = event.payload) === null || _a === void 0 ? void 0 : _a.message })]);
});
exports.ReceiveReconnectingState.on(events_1.disconnect.type, function (context) {
    return receive_stopped_1.ReceiveStoppedState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: context.cursor,
    }, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory })]);
});
exports.ReceiveReconnectingState.on(events_1.restore.type, function (context, event) {
    var _a, _b;
    return receiving_1.ReceivingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.timetoken,
            region: (_b = (_a = event.payload) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : context.cursor.region,
        },
    });
});
exports.ReceiveReconnectingState.on(events_1.subscriptionChange.type, function (context, event) {
    return receiving_1.ReceivingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: context.cursor,
    });
});
exports.ReceiveReconnectingState.on(events_1.unsubscribeAll.type, function (_) {
    return unsubscribed_1.UnsubscribedState.with(undefined, [(0, effects_1.emitStatus)({ category: categories_1.default.PNDisconnectedCategory })]);
});
