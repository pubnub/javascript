"use strict";
/**
 * Stopped initial subscription handshake (disconnected) state.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeStoppedState = void 0;
const state_1 = require("../core/state");
const events_1 = require("../events");
const handshaking_1 = require("./handshaking");
const unsubscribed_1 = require("./unsubscribed");
/**
 * Stopped initial subscription handshake (disconnected) state.
 *
 * State in which Subscription Event Engine still has information about subscription but doesn't have subscription
 * cursor for next sequential subscribe REST API call.
 *
 * @internal
 */
exports.HandshakeStoppedState = new state_1.State('HANDSHAKE_STOPPED');
exports.HandshakeStoppedState.on(events_1.subscriptionChange.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined);
    return exports.HandshakeStoppedState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
});
exports.HandshakeStoppedState.on(events_1.reconnect.type, (context, { payload }) => handshaking_1.HandshakingState.with(Object.assign(Object.assign({}, context), { cursor: payload.cursor || context.cursor, onDemand: true })));
exports.HandshakeStoppedState.on(events_1.restore.type, (context, { payload }) => {
    var _a;
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined);
    return exports.HandshakeStoppedState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || ((_a = context.cursor) === null || _a === void 0 ? void 0 : _a.region) || 0 },
    });
});
exports.HandshakeStoppedState.on(events_1.unsubscribeAll.type, (_) => unsubscribed_1.UnsubscribedState.with());
