"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsubscribedState = void 0;
const state_1 = require("../core/state");
const events_1 = require("../events");
const handshaking_1 = require("./handshaking");
exports.UnsubscribedState = new state_1.State('UNSUBSCRIBED');
exports.UnsubscribedState.on(events_1.subscriptionChange.type, (_, event) => handshaking_1.HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
}));
exports.UnsubscribedState.on(events_1.restore.type, (_, event) => {
    return handshaking_1.HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: event.payload.cursor,
    });
});
