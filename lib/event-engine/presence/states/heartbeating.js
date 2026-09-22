"use strict";
/**
 * Heartbeating state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatingState = void 0;
const events_1 = require("../events");
const effects_1 = require("../effects");
const instances_1 = require("./instances");
Object.defineProperty(exports, "HeartbeatingState", { enumerable: true, get: function () { return instances_1.HeartbeatingState; } });
/**
 * Heartbeating state module.
 *
 * State in which Presence Event Engine send heartbeat REST API call.
 *
 * @internal
 */
instances_1.HeartbeatingState.onEnter((context) => (0, effects_1.heartbeat)(context.channels, context.groups));
instances_1.HeartbeatingState.onExit(() => effects_1.heartbeat.cancel);
instances_1.HeartbeatingState.on(events_1.heartbeatSuccess.type, (context, event) => instances_1.HeartbeatCooldownState.with({ channels: context.channels, groups: context.groups }, [
    (0, effects_1.emitStatus)(Object.assign({}, event.payload)),
]));
instances_1.HeartbeatingState.on(events_1.joined.type, (context, event) => instances_1.HeartbeatingState.with({
    channels: [...context.channels, ...event.payload.channels.filter((channel) => !context.channels.includes(channel))],
    groups: [...context.groups, ...event.payload.groups.filter((group) => !context.groups.includes(group))],
}));
instances_1.HeartbeatingState.on(events_1.left.type, (context, event) => {
    return instances_1.HeartbeatingState.with({
        channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
        groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
    }, [(0, effects_1.leave)(event.payload.channels, event.payload.groups)]);
});
instances_1.HeartbeatingState.on(events_1.heartbeatFailure.type, (context, event) => instances_1.HeartbeatFailedState.with(Object.assign({}, context), [
    ...(event.payload.status ? [(0, effects_1.emitStatus)(Object.assign({}, event.payload.status))] : []),
]));
instances_1.HeartbeatingState.on(events_1.disconnect.type, (context, event) => instances_1.HeartbeatStoppedState.with({ channels: context.channels, groups: context.groups }, [
    ...(!event.payload.isOffline ? [(0, effects_1.leave)(context.channels, context.groups)] : []),
]));
instances_1.HeartbeatingState.on(events_1.leftAll.type, (context, event) => instances_1.HeartbeatInactiveState.with(undefined, [
    ...(!event.payload.isOffline ? [(0, effects_1.leave)(context.channels, context.groups)] : []),
]));
