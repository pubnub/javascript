"use strict";
/**
 * Inactive heratbeating state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatInactiveState = void 0;
const events_1 = require("../events");
const instances_1 = require("./instances");
Object.defineProperty(exports, "HeartbeatInactiveState", { enumerable: true, get: function () { return instances_1.HeartbeatInactiveState; } });
/**
 * Inactive heratbeating state
 *
 * State in which Presence Event Engine doesn't process any heartbeat requests (initial state).
 *
 * @internal
 */
instances_1.HeartbeatInactiveState.on(events_1.joined.type, (_, event) => instances_1.HeartbeatingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
}));
