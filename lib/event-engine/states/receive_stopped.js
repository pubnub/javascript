"use strict";
/**
 * Stopped real-time updates (disconnected) state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveStoppedState = void 0;
const events_1 = require("../events");
const instances_1 = require("./instances");
Object.defineProperty(exports, "ReceiveStoppedState", { enumerable: true, get: function () { return instances_1.ReceiveStoppedState; } });
/**
 * Stopped real-time updates (disconnected) state.
 *
 * State in which Subscription Event Engine still has information about subscription but doesn't process real-time
 * updates.
 *
 * @internal
 */
instances_1.ReceiveStoppedState.on(events_1.subscriptionChange.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return instances_1.UnsubscribedState.with(undefined);
    return instances_1.ReceiveStoppedState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
});
instances_1.ReceiveStoppedState.on(events_1.restore.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return instances_1.UnsubscribedState.with(undefined);
    return instances_1.ReceiveStoppedState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context.cursor.region },
    });
});
instances_1.ReceiveStoppedState.on(events_1.reconnect.type, (context, { payload }) => {
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
instances_1.ReceiveStoppedState.on(events_1.unsubscribeAll.type, () => instances_1.UnsubscribedState.with(undefined));
