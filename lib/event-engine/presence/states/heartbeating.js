"use strict";
/**
 * Heartbeating state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatingState = void 0;
const events_1 = require("../events");
const heartbeat_inactive_1 = require("./heartbeat_inactive");
const heartbeat_cooldown_1 = require("./heartbeat_cooldown");
const heartbeat_stopped_1 = require("./heartbeat_stopped");
const heartbeat_failed_1 = require("./heartbeat_failed");
const effects_1 = require("../effects");
const state_1 = require("../../core/state");
/**
 * Heartbeating state module.
 *
 * State in which Presence Event Engine send heartbeat REST API call.
 *
 * @internal
 */
exports.HeartbeatingState = new state_1.State('HEARTBEATING');
exports.HeartbeatingState.onEnter((context) => (0, effects_1.heartbeat)(context.channels, context.groups));
exports.HeartbeatingState.onExit(() => effects_1.heartbeat.cancel);
exports.HeartbeatingState.on(events_1.heartbeatSuccess.type, (context, event) => heartbeat_cooldown_1.HeartbeatCooldownState.with({ channels: context.channels, groups: context.groups }, [
    (0, effects_1.emitStatus)(Object.assign({}, event.payload)),
]));
exports.HeartbeatingState.on(events_1.joined.type, (context, event) => exports.HeartbeatingState.with({
    channels: [...context.channels, ...event.payload.channels],
    groups: [...context.groups, ...event.payload.groups],
}));
exports.HeartbeatingState.on(events_1.left.type, (context, event) => {
    return exports.HeartbeatingState.with({
        channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
        groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
    }, [(0, effects_1.leave)(event.payload.channels, event.payload.groups)]);
});
exports.HeartbeatingState.on(events_1.heartbeatFailure.type, (context, event) => heartbeat_failed_1.HeartbeatFailedState.with(Object.assign({}, context), [
    ...(event.payload.status ? [(0, effects_1.emitStatus)(Object.assign({}, event.payload.status))] : []),
]));
exports.HeartbeatingState.on(events_1.disconnect.type, (context, event) => heartbeat_stopped_1.HeartbeatStoppedState.with({ channels: context.channels, groups: context.groups }, [
    ...(!event.payload.isOffline ? [(0, effects_1.leave)(context.channels, context.groups)] : []),
]));
exports.HeartbeatingState.on(events_1.leftAll.type, (context, _) => heartbeat_inactive_1.HeartbeatInactiveState.with(undefined, [(0, effects_1.leave)(context.channels, context.groups)]));
