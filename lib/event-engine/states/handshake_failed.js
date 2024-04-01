import { State } from '../core/state';
import { reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { HandshakingState } from './handshaking';
import { UnsubscribedState } from './unsubscribed';
export const HandshakeFailedState = new State('HANDSHAKE_FAILED');
HandshakeFailedState.on(subscriptionChange.type, (context, event) => HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
}));
HandshakeFailedState.on(reconnect.type, (context, event) => HandshakingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: event.payload.cursor || context.cursor,
}));
HandshakeFailedState.on(restore.type, (context, event) => {
    var _a, _b;
    return HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.cursor.timetoken,
            region: event.payload.cursor.region ? event.payload.cursor.region : (_b = (_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : 0,
        },
    });
});
HandshakeFailedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());
