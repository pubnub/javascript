"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsubscribedState = void 0;
var state_1 = require("../core/state");
var events_1 = require("../events");
var handshaking_1 = require("./handshaking");
exports.UnsubscribedState = new state_1.State('UNSUBSCRIBED');
exports.UnsubscribedState.on(events_1.subscriptionChange.type, function (_, event) {
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
    });
});
exports.UnsubscribedState.on(events_1.restore.type, function (_, event) {
    var _a, _b;
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.timetoken,
            region: (_b = (_a = event.payload) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : 0,
        },
    });
});
