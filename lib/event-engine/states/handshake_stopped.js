"use strict";
/**
 * Stopped initial subscription handshake (disconnected) state.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeStoppedState = void 0;
const events_1 = require("../events");
const instances_1 = require("./instances");
Object.defineProperty(exports, "HandshakeStoppedState", { enumerable: true, get: function () { return instances_1.HandshakeStoppedState; } });
/**
 * Stopped initial subscription handshake (disconnected) state.
 *
 * State in which Subscription Event Engine still has information about subscription but doesn't have subscription
 * cursor for next sequential subscribe REST API call.
 *
 * @internal
 */
instances_1.HandshakeStoppedState.on(events_1.subscriptionChange.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return instances_1.UnsubscribedState.with(undefined);
    return instances_1.HandshakeStoppedState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
});
instances_1.HandshakeStoppedState.on(events_1.reconnect.type, (context, { payload }) => instances_1.HandshakingState.with(Object.assign(Object.assign({}, context), { cursor: payload.cursor || context.cursor, onDemand: true })));
instances_1.HandshakeStoppedState.on(events_1.restore.type, (context, { payload }) => {
    var _a;
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return instances_1.UnsubscribedState.with(undefined);
    return instances_1.HandshakeStoppedState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || ((_a = context.cursor) === null || _a === void 0 ? void 0 : _a.region) || 0 },
    });
});
instances_1.HandshakeStoppedState.on(events_1.unsubscribeAll.type, (_) => instances_1.UnsubscribedState.with());
