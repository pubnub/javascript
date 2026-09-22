"use strict";
/**
 * Heartbeat stopped state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatStoppedState = void 0;
const events_1 = require("../events");
const instances_1 = require("./instances");
Object.defineProperty(exports, "HeartbeatStoppedState", { enumerable: true, get: function () { return instances_1.HeartbeatStoppedState; } });
/**
 * Heartbeat stopped state.
 *
 * State in which Presence Event Engine still has information about active channels / groups, but doesn't wait for
 * delayed heartbeat request sending.
 *
 * @internal
 */
instances_1.HeartbeatStoppedState.on(events_1.joined.type, (context, event) => instances_1.HeartbeatStoppedState.with({
    channels: [...context.channels, ...event.payload.channels.filter((channel) => !context.channels.includes(channel))],
    groups: [...context.groups, ...event.payload.groups.filter((group) => !context.groups.includes(group))],
}));
instances_1.HeartbeatStoppedState.on(events_1.left.type, (context, event) => instances_1.HeartbeatStoppedState.with({
    channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
    groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
}));
instances_1.HeartbeatStoppedState.on(events_1.reconnect.type, (context, _) => instances_1.HeartbeatingState.with({
    channels: context.channels,
    groups: context.groups,
}));
instances_1.HeartbeatStoppedState.on(events_1.leftAll.type, (context, _) => instances_1.HeartbeatInactiveState.with(undefined));
