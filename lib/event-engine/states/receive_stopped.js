"use strict";
/**
 * Stopped real-time updates (disconnected) state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveStoppedState = void 0;
const state_1 = require("../core/state");
const events_1 = require("../events");
const handshaking_1 = require("./handshaking");
const unsubscribed_1 = require("./unsubscribed");
/**
 * Stopped real-time updates (disconnected) state.
 *
 * State in which Subscription Event Engine still has information about subscription but doesn't process real-time
 * updates.
 *
 * @internal
 */
exports.ReceiveStoppedState = new state_1.State('RECEIVE_STOPPED');
exports.ReceiveStoppedState.on(events_1.subscriptionChange.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined);
    return exports.ReceiveStoppedState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
});
exports.ReceiveStoppedState.on(events_1.restore.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined);
    return exports.ReceiveStoppedState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: { timetoken: payload.cursor.timetoken, region: payload.cursor.region || context.cursor.region },
    });
});
exports.ReceiveStoppedState.on(events_1.reconnect.type, (context, { payload }) => {
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
exports.ReceiveStoppedState.on(events_1.unsubscribeAll.type, () => unsubscribed_1.UnsubscribedState.with(undefined));
