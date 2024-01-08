"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatStoppedState = void 0;
var state_1 = require("../../core/state");
var effects_1 = require("../effects");
var events_1 = require("../events");
var heartbeat_inactive_1 = require("./heartbeat_inactive");
var heartbeating_1 = require("./heartbeating");
exports.HeartbeatStoppedState = new state_1.State('HEARTBEAT_STOPPED');
exports.HeartbeatStoppedState.on(events_1.joined.type, function (context, event) {
    return exports.HeartbeatStoppedState.with({
        channels: __spreadArray(__spreadArray([], __read(context.channels), false), __read(event.payload.channels), false),
        groups: __spreadArray(__spreadArray([], __read(context.groups), false), __read(event.payload.groups), false),
    });
});
exports.HeartbeatStoppedState.on(events_1.left.type, function (context, event) {
    return exports.HeartbeatStoppedState.with({
        channels: context.channels.filter(function (channel) { return !event.payload.channels.includes(channel); }),
        groups: context.groups.filter(function (group) { return !event.payload.groups.includes(group); }),
    }, [(0, effects_1.leave)(event.payload.channels, event.payload.groups)]);
});
exports.HeartbeatStoppedState.on(events_1.reconnect.type, function (context, _) {
    return heartbeating_1.HeartbeatingState.with({
        channels: context.channels,
        groups: context.groups,
    });
});
exports.HeartbeatStoppedState.on(events_1.disconnect.type, function (context, _) {
    return exports.HeartbeatStoppedState.with({
        channels: context.channels,
        groups: context.groups,
    }, [(0, effects_1.leave)(context.channels, context.groups)]);
});
exports.HeartbeatStoppedState.on(events_1.leftAll.type, function (context, _) {
    return heartbeat_inactive_1.HeartbeatInactiveState.with(undefined, [(0, effects_1.leave)(context.channels, context.groups)]);
});
