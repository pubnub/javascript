"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatingState = void 0;
const state_1 = require("../../core/state");
const events_1 = require("../events");
const effects_1 = require("../effects");
const heartbeat_cooldown_1 = require("./heartbeat_cooldown");
const heartbeat_reconnecting_1 = require("./heartbeat_reconnecting");
const heartbeat_stopped_1 = require("./heartbeat_stopped");
const heartbeat_inactive_1 = require("./heartbeat_inactive");
exports.HeartbeatingState = new state_1.State('HEARTBEATING');
exports.HeartbeatingState.onEnter((context) => (0, effects_1.heartbeat)(context.channels, context.groups));
exports.HeartbeatingState.on(events_1.heartbeatSuccess.type, (context, event) => {
    return heartbeat_cooldown_1.HeartbeatCooldownState.with({
        channels: context.channels,
        groups: context.groups,
    });
});
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
exports.HeartbeatingState.on(events_1.heartbeatFailure.type, (context, event) => {
    return heartbeat_reconnecting_1.HearbeatReconnectingState.with(Object.assign(Object.assign({}, context), { attempts: 0, reason: event.payload }));
});
exports.HeartbeatingState.on(events_1.disconnect.type, (context) => heartbeat_stopped_1.HeartbeatStoppedState.with({
    channels: context.channels,
    groups: context.groups,
}, [(0, effects_1.leave)(context.channels, context.groups)]));
exports.HeartbeatingState.on(events_1.leftAll.type, (context, _) => heartbeat_inactive_1.HeartbeatInactiveState.with(undefined, [(0, effects_1.leave)(context.channels, context.groups)]));
