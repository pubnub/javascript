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
exports.ReceiveFailureState = void 0;
var state_1 = require("../core/state");
var events_1 = require("../events");
var receive_reconnecting_1 = require("./receive_reconnecting");
var receive_stopped_1 = require("./receive_stopped");
exports.ReceiveFailureState = new state_1.State('RECEIVE_FAILURE');
exports.ReceiveFailureState.on(events_1.reconnectingRetry.type, function (context) {
    return receive_reconnecting_1.ReceiveReconnectingState.with(__assign(__assign({}, context), { attempts: 0 }));
});
exports.ReceiveFailureState.on(events_1.disconnect.type, function (context) {
    return receive_stopped_1.ReceiveStoppedState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: context.cursor,
    });
});
