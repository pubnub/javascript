import { State } from '../core/state';
import { subscriptionChange, restore } from '../events';
import { HandshakingState } from './handshaking';
export const UnsubscribedState = new State('UNSUBSCRIBED');
UnsubscribedState.on(subscriptionChange.type, (_, event) => HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
}));
UnsubscribedState.on(restore.type, (_, event) => {
    return HandshakingState.with({
        channels: event.payload.channels,
        groups: event.payload.groups,
        cursor: event.payload.cursor,
    });
});
