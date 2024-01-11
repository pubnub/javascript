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
        cursor: context.cursor
    });
});
exports.HandshakeStoppedState.on(events_1.reconnect.type, function (context, event) {
    var _a, _b, _c, _d, _e, _f;
    return handshaking_1.HandshakingState.with(__assign(__assign({}, context), { cursor: {
            timetoken: (_d = (_b = (_a = event.payload) === null || _a === void 0 ? void 0 : _a.timetoken) !== null && _b !== void 0 ? _b : (_c = context.cursor) === null || _c === void 0 ? void 0 : _c.timetoken) !== null && _d !== void 0 ? _d : '0',
            region: (_f = (_e = event.payload) === null || _e === void 0 ? void 0 : _e.region) !== null && _f !== void 0 ? _f : 0,
        } }));
});
exports.HandshakeStoppedState.on(events_1.restore.type, function (_, event) {
    var _a, _b;
    return exports.HandshakeStoppedState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.timetoken,
            region: (_b = (_a = event.payload) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : 0,
        },
    });
});
exports.HandshakeStoppedState.on(events_1.unsubscribeAll.type, function (_) { return unsubscribed_1.UnsubscribedState.with(); });
