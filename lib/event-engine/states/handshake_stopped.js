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
exports.HandshakeStoppedState = void 0;
var state_1 = require("../core/state");
var events_1 = require("../events");
var handshaking_1 = require("./handshaking");
exports.HandshakeStoppedState = new state_1.State('STOPPED');
exports.HandshakeStoppedState.on(events_1.subscriptionChange.type, function (_context, event) {
    return exports.HandshakeStoppedState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
    });
});
exports.HandshakeStoppedState.on(events_1.reconnect.type, function (context) { return handshaking_1.HandshakingState.with(__assign({}, context)); });
