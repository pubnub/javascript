import { PubNubError } from '../../core/components/endpoint';
import { State } from '../core/state';
import { Effects, emitEvents, handshakeReconnect, reconnect } from '../effects';
import {
  disconnect,
  Events,
  handshakingReconnectingFailure,
  handshakingReconnectingGiveup,
  handshakingReconnectingSuccess,
  subscriptionChange,
} from '../events';
import { HandshakeFailureState } from './handshake_failure';
import { HandshakeStoppedState } from './handshake_stopped';
import { HandshakingState } from './handshaking';
import { ReceivingState } from './receiving';

export type HandshakeReconnectingStateContext = {
  channels: string[];
  groups: string[];

  attempts: number;
  reason: PubNubError;
};

export const HandshakeReconnectingState = new State<HandshakeReconnectingStateContext, Events, Effects>(
  'HANDSHAKE_RECONNECTING',
);

HandshakeReconnectingState.onEnter((context) => handshakeReconnect(context));
HandshakeReconnectingState.onExit(() => handshakeReconnect.cancel);

HandshakeReconnectingState.on(handshakingReconnectingSuccess.type, (context, event) =>
  ReceivingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: event.payload.cursor,
  }),
);

HandshakeReconnectingState.on(handshakingReconnectingFailure.type, (context, event) =>
  HandshakeReconnectingState.with({ ...context, attempts: context.attempts + 1, reason: event.payload }),
);

HandshakeReconnectingState.on(handshakingReconnectingGiveup.type, (context) =>
  HandshakeFailureState.with({
    groups: context.groups,
    channels: context.channels,
    reason: context.reason,
  }),
);

HandshakeReconnectingState.on(disconnect.type, (context) =>
  HandshakeStoppedState.with({
    channels: context.channels,
    groups: context.groups,
  }),
);

HandshakeReconnectingState.on(subscriptionChange.type, (_, event) =>
  HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups }),
);
