import { State } from '../core/state';
import { handshake, emitStatus } from '../effects';
import { disconnect, restore, handshakeFailure, handshakeSuccess, subscriptionChange, unsubscribeAll, } from '../events';
import { HandshakeReconnectingState } from './handshake_reconnecting';
import { HandshakeStoppedState } from './handshake_stopped';
import { ReceivingState } from './receiving';
import { UnsubscribedState } from './unsubscribed';
import categoryConstants from '../../core/constants/categories';
export const HandshakingState = new State('HANDSHAKING');
HandshakingState.onEnter((context) => handshake(context.channels, context.groups));
HandshakingState.onExit(() => handshake.cancel);
HandshakingState.on(subscriptionChange.type, (context, event) => {
    if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
        return UnsubscribedState.with(undefined);
    }
    return HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: context.cursor,
    });
});
HandshakingState.on(handshakeSuccess.type, (context, event) => {
    var _a, _b;
    return ReceivingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: {
            timetoken: !!((_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.timetoken) ? (_b = context === null || context === void 0 ? void 0 : context.cursor) === null || _b === void 0 ? void 0 : _b.timetoken : event.payload.timetoken,
            region: event.payload.region,
        },
    }, [
        emitStatus({
            category: categoryConstants.PNConnectedCategory,
        }),
    ]);
});
HandshakingState.on(handshakeFailure.type, (context, event) => {
    return HandshakeReconnectingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: context.cursor,
        attempts: 0,
        reason: event.payload,
    });
});
HandshakingState.on(disconnect.type, (context) => HandshakeStoppedState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: context.cursor,
}));
HandshakingState.on(restore.type, (context, event) => {
    var _a;
    return HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.cursor.timetoken,
            region: event.payload.cursor.region || ((_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) || 0,
        },
    });
});
HandshakingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());
