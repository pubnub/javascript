"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatInactiveState = void 0;
const state_1 = require("../../core/state");
const events_1 = require("../events");
const heartbeating_1 = require("./heartbeating");
exports.HeartbeatInactiveState = new state_1.State('HEARTBEAT_INACTIVE');
exports.HeartbeatInactiveState.on(events_1.joined.type, (_, event) => heartbeating_1.HeartbeatingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
}));
