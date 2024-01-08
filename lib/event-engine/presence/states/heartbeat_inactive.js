"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatInactiveState = void 0;
var state_1 = require("../../core/state");
var events_1 = require("../events");
var heartbeating_1 = require("./heartbeating");
exports.HeartbeatInactiveState = new state_1.State('HEARTBEAT_INACTIVE');
exports.HeartbeatInactiveState.on(events_1.joined.type, function (_, event) {
    return heartbeating_1.HeartbeatingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
    });
});
exports.HeartbeatInactiveState.on(events_1.left.type, function (_, event) { return exports.HeartbeatInactiveState.with(); });
