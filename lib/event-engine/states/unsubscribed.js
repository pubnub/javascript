"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsubscribedState = void 0;
var state_1 = require("../core/state");
var events_1 = require("../events");
var handshaking_1 = require("./handshaking");
exports.UnsubscribedState = new state_1.State('UNSUBSCRIBED');
exports.UnsubscribedState.on(events_1.subscriptionChange.type, function (_, event) {
    return handshaking_1.HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups });
});
