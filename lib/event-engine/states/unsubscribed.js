"use strict";
/**
 * Unsubscribed / disconnected state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsubscribedState = void 0;
const events_1 = require("../events");
const instances_1 = require("./instances");
Object.defineProperty(exports, "UnsubscribedState", { enumerable: true, get: function () { return instances_1.UnsubscribedState; } });
/**
 * Unsubscribed / disconnected state.
 *
 * State in which Subscription Event Engine doesn't process any real-time updates.
 *
 * @internal
 */
instances_1.UnsubscribedState.on(events_1.subscriptionChange.type, (_, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return instances_1.UnsubscribedState.with(undefined);
    return instances_1.HandshakingState.with({ channels: payload.channels, groups: payload.groups, onDemand: true });
});
instances_1.UnsubscribedState.on(events_1.restore.type, (_, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return instances_1.UnsubscribedState.with(undefined);
    return instances_1.HandshakingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region },
        onDemand: true,
    });
});
