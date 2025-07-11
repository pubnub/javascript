"use strict";
/**
 * Failed to heartbeat state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatFailedState = void 0;
const state_1 = require("../../core/state");
const events_1 = require("../events");
const effects_1 = require("../effects");
const heartbeating_1 = require("./heartbeating");
const heartbeat_stopped_1 = require("./heartbeat_stopped");
const heartbeat_inactive_1 = require("./heartbeat_inactive");
/**
 * Failed to heartbeat state.
 *
 * State in which Subscription Event Engine waits for user to try to reconnect after all retry attempts has been
 * exhausted.
 *
 * @internal
 */
exports.HeartbeatFailedState = new state_1.State('HEARTBEAT_FAILED');
exports.HeartbeatFailedState.on(events_1.joined.type, (context, event) => heartbeating_1.HeartbeatingState.with({
    channels: [...context.channels, ...event.payload.channels.filter((channel) => !context.channels.includes(channel))],
    groups: [...context.groups, ...event.payload.groups.filter((group) => !context.groups.includes(group))],
}));
exports.HeartbeatFailedState.on(events_1.left.type, (context, event) => heartbeating_1.HeartbeatingState.with({
    channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
    groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
}, [(0, effects_1.leave)(event.payload.channels, event.payload.groups)]));
exports.HeartbeatFailedState.on(events_1.reconnect.type, (context, _) => heartbeating_1.HeartbeatingState.with({
    channels: context.channels,
    groups: context.groups,
}));
exports.HeartbeatFailedState.on(events_1.disconnect.type, (context, event) => heartbeat_stopped_1.HeartbeatStoppedState.with({ channels: context.channels, groups: context.groups }, [
    ...(!event.payload.isOffline ? [(0, effects_1.leave)(context.channels, context.groups)] : []),
]));
exports.HeartbeatFailedState.on(events_1.leftAll.type, (context, event) => heartbeat_inactive_1.HeartbeatInactiveState.with(undefined, [
    ...(!event.payload.isOffline ? [(0, effects_1.leave)(context.channels, context.groups)] : []),
]));
