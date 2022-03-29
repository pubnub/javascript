import { State } from '../core/state';
import { Effects, handshake } from '../effects';
import { Events, handshakingFailure, handshakingGiveup, handshakingSuccess } from '../events';
import { ReceivingState } from './receiving';

export type HandshakingStateContext = {
  channels: string[];
  groups: string[];
};

export const HandshakingState = new State<HandshakingStateContext, Events, Effects>('HANDSHAKING');

HandshakingState.onEnter((context) => handshake(context.channels, context.groups));

HandshakingState.on(handshakingSuccess.type, (context, event) =>
  ReceivingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: event.payload,
  }),
);

HandshakingState.on(handshakingFailure.type, (context, event) => undefined);

HandshakingState.on(handshakingGiveup.type, (context, event) => undefined);
