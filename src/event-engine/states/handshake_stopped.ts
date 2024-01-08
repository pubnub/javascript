import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, reconnect, subscriptionChange } from '../events';
import { HandshakingState } from './handshaking';

type HandshakeStoppedStateContext = {
  channels: string[];
  groups: string[];
};

export const HandshakeStoppedState = new State<HandshakeStoppedStateContext, Events, Effects>('HANDSHAKE_STOPPED');

HandshakeStoppedState.on(subscriptionChange.type, (_, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
  }),
);

HandshakeStoppedState.on(reconnect.type, (context) => HandshakingState.with({ ...context }));
