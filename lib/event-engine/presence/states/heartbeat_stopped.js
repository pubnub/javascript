"use strict";
/**
 * Heartbeat stopped state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatStoppedState = void 0;
const state_1 = require("../../core/state");
const events_1 = require("../events");
const heartbeat_inactive_1 = require("./heartbeat_inactive");
const heartbeating_1 = require("./heartbeating");
/**
 * Heartbeat stopped state.
 *
 * State in which Presence Event Engine still has information about active channels / groups, but doesn't wait for
 * delayed heartbeat request sending.
 *
 * @internal
 */
exports.HeartbeatStoppedState = new state_1.State('HEARTBEAT_STOPPED');
exports.HeartbeatStoppedState.on(events_1.joined.type, (context, event) => exports.HeartbeatStoppedState.with({
    channels: [...context.channels, ...event.payload.channels.filter((channel) => !context.channels.includes(channel))],
    groups: [...context.groups, ...event.payload.groups.filter((group) => !context.groups.includes(group))],
}));
exports.HeartbeatStoppedState.on(events_1.left.type, (context, event) => exports.HeartbeatStoppedState.with({
    channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
    groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
}));
exports.HeartbeatStoppedState.on(events_1.reconnect.type, (context, _) => heartbeating_1.HeartbeatingState.with({
    channels: context.channels,
    groups: context.groups,
}));
exports.HeartbeatStoppedState.on(events_1.leftAll.type, (context, _) => heartbeat_inactive_1.HeartbeatInactiveState.with(undefined));
