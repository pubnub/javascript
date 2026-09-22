"use strict";
/**
 * Failed to receive real-time updates (disconnected) state.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveFailedState = void 0;
const events_1 = require("../events");
const instances_1 = require("./instances");
Object.defineProperty(exports, "ReceiveFailedState", { enumerable: true, get: function () { return instances_1.ReceiveFailedState; } });
/**
 * Failed to receive real-time updates (disconnected) state.
 *
 * State in which Subscription Event Engine waits for user to try to reconnect after all retry attempts has been
 * exhausted.
 *
 * @internal
 */
instances_1.ReceiveFailedState.on(events_1.reconnect.type, (context, { payload }) => {
    var _a;
    return instances_1.HandshakingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: {
            timetoken: !!payload.cursor.timetoken ? (_a = payload.cursor) === null || _a === void 0 ? void 0 : _a.timetoken : context.cursor.timetoken,
            region: payload.cursor.region || context.cursor.region,
        },
        onDemand: true,
    });
});
instances_1.ReceiveFailedState.on(events_1.subscriptionChange.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return instances_1.UnsubscribedState.with(undefined);
    return instances_1.HandshakingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: context.cursor,
        onDemand: true,
    });
});
instances_1.ReceiveFailedState.on(events_1.restore.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return instances_1.UnsubscribedState.with(undefined);
    return instances_1.HandshakingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context.cursor.region },
        onDemand: true,
    });
});
instances_1.ReceiveFailedState.on(events_1.unsubscribeAll.type, (_) => instances_1.UnsubscribedState.with(undefined));
