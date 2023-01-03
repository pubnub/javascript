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
exports.ReceiveStoppedState = void 0;
var state_1 = require("../core/state");
var events_1 = require("../events");
var receiving_1 = require("./receiving");
exports.ReceiveStoppedState = new state_1.State('STOPPED');
exports.ReceiveStoppedState.on(events_1.subscriptionChange.type, function (context, event) {
    return exports.ReceiveStoppedState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: context.cursor,
    });
});
exports.ReceiveStoppedState.on(events_1.reconnect.type, function (context) { return receiving_1.ReceivingState.with(__assign({}, context)); });
