"use strict";
/**
 * Failed to receive real-time updates (disconnected) state.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveFailedState = void 0;
const state_1 = require("../core/state");
const events_1 = require("../events");
const handshaking_1 = require("./handshaking");
const unsubscribed_1 = require("./unsubscribed");
/**
 * Failed to receive real-time updates (disconnected) state.
 *
 * State in which Subscription Event Engine waits for user to try to reconnect after all retry attempts has been
 * exhausted.
 *
 * @internal
 */
exports.ReceiveFailedState = new state_1.State('RECEIVE_FAILED');
exports.ReceiveFailedState.on(events_1.reconnect.type, (context, { payload }) => {
    var _a;
    return handshaking_1.HandshakingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: {
            timetoken: !!payload.cursor.timetoken ? (_a = payload.cursor) === null || _a === void 0 ? void 0 : _a.timetoken : context.cursor.timetoken,
            region: payload.cursor.region || context.cursor.region,
        },
    });
});
exports.ReceiveFailedState.on(events_1.subscriptionChange.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined);
    return handshaking_1.HandshakingState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
});
exports.ReceiveFailedState.on(events_1.restore.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined);
    return handshaking_1.HandshakingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: { timetoken: payload.cursor.timetoken, region: payload.cursor.region || context.cursor.region },
    });
});
exports.ReceiveFailedState.on(events_1.unsubscribeAll.type, (_) => unsubscribed_1.UnsubscribedState.with(undefined));
