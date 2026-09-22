"use strict";
/**
 * Failed initial subscription handshake (disconnected) state.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeFailedState = void 0;
const events_1 = require("../events");
const instances_1 = require("./instances");
Object.defineProperty(exports, "HandshakeFailedState", { enumerable: true, get: function () { return instances_1.HandshakeFailedState; } });
/**
 * Failed initial subscription handshake (disconnected) state.
 *
 * State in which Subscription Event Engine waits for user to try to reconnect after all retry attempts has been
 * exhausted.
 *
 * @internal
 */
instances_1.HandshakeFailedState.on(events_1.subscriptionChange.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return instances_1.UnsubscribedState.with(undefined);
    return instances_1.HandshakingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: context.cursor,
        onDemand: true,
    });
});
instances_1.HandshakeFailedState.on(events_1.reconnect.type, (context, { payload }) => instances_1.HandshakingState.with(Object.assign(Object.assign({}, context), { cursor: payload.cursor || context.cursor, onDemand: true })));
instances_1.HandshakeFailedState.on(events_1.restore.type, (context, { payload }) => {
    var _a, _b;
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return instances_1.UnsubscribedState.with(undefined);
    return instances_1.HandshakingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: {
            timetoken: `${payload.cursor.timetoken}`,
            region: payload.cursor.region ? payload.cursor.region : ((_b = (_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : 0),
        },
        onDemand: true,
    });
});
instances_1.HandshakeFailedState.on(events_1.unsubscribeAll.type, (_) => instances_1.UnsubscribedState.with());
