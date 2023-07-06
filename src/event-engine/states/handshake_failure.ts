import { State } from '../core/state';
import { Effects, emitStatus } from '../effects';
import { disconnect, Events, handshakingReconnectingRetry, reconnect } from '../events';
import { PubNubError } from '../../core/components/endpoint';
import { HandshakeReconnectingState } from './handshake_reconnecting';
import { HandshakeStoppedState } from './handshake_stopped';
import { HandshakingState } from './handshaking';

export type HandshakeFailureStateContext = {
  channels: string[];
  groups: string[];

  reason: PubNubError;
};

export const HandshakeFailureState = new State<HandshakeFailureStateContext, Events, Effects>('HANDSHAKE_FAILURE');

HandshakeFailureState.onEnter((context) => emitStatus({ category: 'PNNetworkIssuesCategory' }));

HandshakeFailureState.on(handshakingReconnectingRetry.type, (context) =>
  HandshakeReconnectingState.with({
    ...context,
    attempts: 0, // TODO: figure out what should be the reason
  }),
);

HandshakeFailureState.on(disconnect.type, (context) =>
  HandshakeStoppedState.with({
    channels: context.channels,
    groups: context.groups,
  }),
);

HandshakeFailureState.on(reconnect.type, (context) => HandshakingState.with({ ...context }));
