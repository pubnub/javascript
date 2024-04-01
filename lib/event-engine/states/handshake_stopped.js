import { State } from '../core/state';
import { reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { HandshakingState } from './handshaking';
import { UnsubscribedState } from './unsubscribed';
export const HandshakeStoppedState = new State('HANDSHAKE_STOPPED');
HandshakeStoppedState.on(subscriptionChange.type, (context, event) => HandshakeStoppedState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
}));
HandshakeStoppedState.on(reconnect.type, (context, event) => HandshakingState.with(Object.assign(Object.assign({}, context), { cursor: event.payload.cursor || context.cursor })));
HandshakeStoppedState.on(restore.type, (context, event) => {
    var _a;
    return HandshakeStoppedState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.cursor.timetoken,
            region: event.payload.cursor.region || ((_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) || 0,
        },
    });
});
HandshakeStoppedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());
