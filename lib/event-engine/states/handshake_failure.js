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
exports.HandshakeFailureState = void 0;
var state_1 = require("../core/state");
var events_1 = require("../events");
var handshake_stopped_1 = require("./handshake_stopped");
var handshaking_1 = require("./handshaking");
exports.HandshakeFailureState = new state_1.State('HANDSHAKE_FAILURE');
exports.HandshakeFailureState.on(events_1.disconnect.type, function (context) {
    return handshake_stopped_1.HandshakeStoppedState.with({
        channels: context.channels,
        groups: context.groups,
    });
});
exports.HandshakeFailureState.on(events_1.reconnect.type, function (context) { return handshaking_1.HandshakingState.with(__assign({}, context)); });
