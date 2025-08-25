"use strict";
/**
 * Failed initial subscription handshake (disconnected) state.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeFailedState = void 0;
const state_1 = require("../core/state");
const events_1 = require("../events");
const handshaking_1 = require("./handshaking");
const unsubscribed_1 = require("./unsubscribed");
/**
 * Failed initial subscription handshake (disconnected) state.
 *
 * State in which Subscription Event Engine waits for user to try to reconnect after all retry attempts has been
 * exhausted.
 *
 * @internal
 */
exports.HandshakeFailedState = new state_1.State('HANDSHAKE_FAILED');
exports.HandshakeFailedState.on(events_1.subscriptionChange.type, (context, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined);
    return handshaking_1.HandshakingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: context.cursor,
        onDemand: true,
    });
});
exports.HandshakeFailedState.on(events_1.reconnect.type, (context, { payload }) => handshaking_1.HandshakingState.with(Object.assign(Object.assign({}, context), { cursor: payload.cursor || context.cursor, onDemand: true })));
exports.HandshakeFailedState.on(events_1.restore.type, (context, { payload }) => {
    var _a, _b;
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return unsubscribed_1.UnsubscribedState.with(undefined);
    return handshaking_1.HandshakingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: {
            timetoken: `${payload.cursor.timetoken}`,
            region: payload.cursor.region ? payload.cursor.region : ((_b = (_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : 0),
        },
        onDemand: true,
    });
});
exports.HandshakeFailedState.on(events_1.unsubscribeAll.type, (_) => unsubscribed_1.UnsubscribedState.with());
