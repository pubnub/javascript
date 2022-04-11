import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, handshakingReconnectingRetry } from '../events';
import { PubNubError } from '../../core/components/endpoint';
import { HandshakeReconnectingState } from './handshake_reconnecting';

export type HandshakeFailureStateContext = {
  channels: string[];
  groups: string[];

  reason: PubNubError;
};

export const HandshakeFailureState = new State<HandshakeFailureStateContext, Events, Effects>('HANDSHAKE_FAILURE');

HandshakeFailureState.on(handshakingReconnectingRetry.type, (context) =>
  HandshakeReconnectingState.with({
    ...context,
    attempts: 0, // TODO: figure out what should be the reason
  }),
);
