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
var unsubscribed_1 = require("./unsubscribed");
exports.HandshakeStoppedState = new state_1.State('HANDSHAKE_STOPPED');
exports.HandshakeStoppedState.on(events_1.subscriptionChange.type, function (context, event) {
    return exports.HandshakeStoppedState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: context.cursor,
    });
});
exports.HandshakeStoppedState.on(events_1.reconnect.type, function (context, event) {
    return handshaking_1.HandshakingState.with(__assign(__assign({}, context), { cursor: event.payload.cursor || context.cursor }));
});
exports.HandshakeStoppedState.on(events_1.restore.type, function (context, event) {
    var _a;
    return exports.HandshakeStoppedState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.cursor.timetoken,
            region: event.payload.cursor.region || ((_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) || 0,
        },
    });
});
exports.HandshakeStoppedState.on(events_1.unsubscribeAll.type, function (_) { return unsubscribed_1.UnsubscribedState.with(); });
