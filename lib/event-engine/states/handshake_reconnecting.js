import { State } from '../core/state';
import { emitStatus, handshakeReconnect } from '../effects';
import { disconnect, handshakeReconnectFailure, handshakeReconnectGiveup, handshakeReconnectSuccess, restore, subscriptionChange, unsubscribeAll, } from '../events';
import { HandshakeFailedState } from './handshake_failed';
import { HandshakeStoppedState } from './handshake_stopped';
import { HandshakingState } from './handshaking';
import { ReceivingState } from './receiving';
import { UnsubscribedState } from './unsubscribed';
import categoryConstants from '../../core/constants/categories';
export const HandshakeReconnectingState = new State('HANDSHAKE_RECONNECTING');
HandshakeReconnectingState.onEnter((context) => handshakeReconnect(context));
HandshakeReconnectingState.onExit(() => handshakeReconnect.cancel);
HandshakeReconnectingState.on(handshakeReconnectSuccess.type, (context, event) => {
    var _a, _b;
    const cursor = {
        timetoken: !!((_a = context.cursor) === null || _a === void 0 ? void 0 : _a.timetoken) ? (_b = context.cursor) === null || _b === void 0 ? void 0 : _b.timetoken : event.payload.cursor.timetoken,
        region: event.payload.cursor.region,
    };
    return ReceivingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: cursor,
    }, [emitStatus({ category: categoryConstants.PNConnectedCategory })]);
});
HandshakeReconnectingState.on(handshakeReconnectFailure.type, (context, event) => HandshakeReconnectingState.with(Object.assign(Object.assign({}, context), { attempts: context.attempts + 1, reason: event.payload })));
HandshakeReconnectingState.on(handshakeReconnectGiveup.type, (context, event) => {
    var _a;
    return HandshakeFailedState.with({
        groups: context.groups,
        channels: context.channels,
        cursor: context.cursor,
        reason: event.payload,
    }, [emitStatus({ category: categoryConstants.PNConnectionErrorCategory, error: (_a = event.payload) === null || _a === void 0 ? void 0 : _a.message })]);
});
HandshakeReconnectingState.on(disconnect.type, (context) => HandshakeStoppedState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: context.cursor,
}));
HandshakeReconnectingState.on(subscriptionChange.type, (context, event) => HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
}));
HandshakeReconnectingState.on(restore.type, (context, event) => {
    var _a, _b;
    return HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: {
            timetoken: event.payload.cursor.timetoken,
            region: ((_a = event.payload.cursor) === null || _a === void 0 ? void 0 : _a.region) || ((_b = context === null || context === void 0 ? void 0 : context.cursor) === null || _b === void 0 ? void 0 : _b.region) || 0,
        },
    });
});
HandshakeReconnectingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined));
