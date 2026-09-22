"use strict";
/**
 * Waiting next heartbeat state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatCooldownState = void 0;
const events_1 = require("../events");
const effects_1 = require("../effects");
const instances_1 = require("./instances");
Object.defineProperty(exports, "HeartbeatCooldownState", { enumerable: true, get: function () { return instances_1.HeartbeatCooldownState; } });
/**
 * Waiting next heartbeat state.
 *
 * State in which Presence Event Engine is waiting when delay will run out and next heartbeat call should be done.
 *
 * @internal
 */
instances_1.HeartbeatCooldownState.onEnter(() => (0, effects_1.wait)());
instances_1.HeartbeatCooldownState.onExit(() => effects_1.wait.cancel);
instances_1.HeartbeatCooldownState.on(events_1.timesUp.type, (context, _) => instances_1.HeartbeatingState.with({
    channels: context.channels,
    groups: context.groups,
}));
instances_1.HeartbeatCooldownState.on(events_1.joined.type, (context, event) => instances_1.HeartbeatingState.with({
    channels: [...context.channels, ...event.payload.channels.filter((channel) => !context.channels.includes(channel))],
    groups: [...context.groups, ...event.payload.groups.filter((group) => !context.groups.includes(group))],
}));
instances_1.HeartbeatCooldownState.on(events_1.left.type, (context, event) => instances_1.HeartbeatingState.with({
    channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
    groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
}, [(0, effects_1.leave)(event.payload.channels, event.payload.groups)]));
instances_1.HeartbeatCooldownState.on(events_1.disconnect.type, (context, event) => instances_1.HeartbeatStoppedState.with({ channels: context.channels, groups: context.groups }, [
    ...(!event.payload.isOffline ? [(0, effects_1.leave)(context.channels, context.groups)] : []),
]));
instances_1.HeartbeatCooldownState.on(events_1.leftAll.type, (context, event) => instances_1.HeartbeatInactiveState.with(undefined, [
    ...(!event.payload.isOffline ? [(0, effects_1.leave)(context.channels, context.groups)] : []),
]));
