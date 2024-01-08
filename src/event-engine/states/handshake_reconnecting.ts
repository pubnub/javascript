import { PubNubError } from '../../core/components/endpoint';
import { State } from '../core/state';
import { Effects, emitEvents, emitStatus, handshakeReconnect, reconnect } from '../effects';
import {
  disconnect,
  Events,
  handshakingReconnectingFailure,
  handshakingReconnectingGiveup,
  handshakingReconnectingSuccess,
  restore,
  subscriptionChange,
  unsubscribeAll,
} from '../events';
import { HandshakeFailureState } from './handshake_failure';
import { HandshakeStoppedState } from './handshake_stopped';
import { HandshakingState } from './handshaking';
import { ReceivingState } from './receiving';
import { UnsubscribedState } from './unsubscribed';
import categoryConstants from '../../core/constants/categories';

export type HandshakeReconnectingStateContext = {
  channels: string[];
  groups: string[];
  timetoken?: string;

  attempts: number;
  reason: PubNubError;
};

export const HandshakeReconnectingState = new State<HandshakeReconnectingStateContext, Events, Effects>(
  'HANDSHAKE_RECONNECTING',
);

HandshakeReconnectingState.onEnter((context) => handshakeReconnect(context));
HandshakeReconnectingState.onExit(() => handshakeReconnect.cancel);

HandshakeReconnectingState.on(handshakingReconnectingSuccess.type, (context, event) => {
  const cursor = context.timetoken ? { timetoken: context.timetoken, region: 1 } : event.payload.cursor;
  return ReceivingState.with(
    {
      channels: context.channels,
      groups: context.groups,
      cursor: cursor,
    },
    [emitStatus({ category: categoryConstants.PNConnectedCategory })],
  );
});

HandshakeReconnectingState.on(handshakingReconnectingFailure.type, (context, event) =>
  HandshakeReconnectingState.with({ ...context, attempts: context.attempts + 1, reason: event.payload }),
);

HandshakeReconnectingState.on(handshakingReconnectingGiveup.type, (context) =>
  HandshakeFailureState.with(
    {
      groups: context.groups,
      channels: context.channels,
      reason: context.reason,
    },
    [emitStatus({ category: categoryConstants.PNConnectionErrorCategory })],
  ),
);

HandshakeReconnectingState.on(disconnect.type, (context) =>
  HandshakeStoppedState.with(
    {
      channels: context.channels,
      groups: context.groups,
    },
    [emitStatus({ category: categoryConstants.PNDisconnectedCategory })],
  ),
);

HandshakeReconnectingState.on(subscriptionChange.type, (_, event) =>
  HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups }),
);

HandshakeReconnectingState.on(restore.type, (_, event) =>
  HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups }),
);

HandshakeReconnectingState.on(unsubscribeAll.type, (_) =>
  UnsubscribedState.with(undefined, [emitStatus({ category: categoryConstants.PNDisconnectedCategory })]),
);
