import { State } from '../core/state';
import { reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { HandshakingState } from './handshaking';
import { UnsubscribedState } from './unsubscribed';
export const ReceiveFailedState = new State('RECEIVE_FAILED');
ReceiveFailedState.on(reconnect.type, (context, event) => {
    var _a;
    return HandshakingState.with({
        channels: context.channels,
        groups: context.groups,
        cursor: {
            timetoken: !!event.payload.cursor.timetoken ? (_a = event.payload.cursor) === null || _a === void 0 ? void 0 : _a.timetoken : context.cursor.timetoken,
            region: event.payload.cursor.region || context.cursor.region,
        },
    });
});
ReceiveFailedState.on(subscriptionChange.type, (context, event) => HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
}));
ReceiveFailedState.on(restore.type, (context, event) => HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
        timetoken: event.payload.cursor.timetoken,
        region: event.payload.cursor.region || context.cursor.region,
    },
}));
ReceiveFailedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined));
