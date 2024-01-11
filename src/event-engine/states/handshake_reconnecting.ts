import { PubNubError } from '../../core/components/endpoint';
import { State } from '../core/state';
import { Effects, emitStatus, handshakeReconnect } from '../effects';
import {
  disconnect,
  Events,
  handshakeReconnectFailure,
  handshakeReconnectGiveup,
  handshakeReconnectSuccess,
  restore,
  subscriptionChange,
  unsubscribeAll,
} from '../events';
import { HandshakeFailedState } from './handshake_failed';
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

HandshakeReconnectingState.on(handshakeReconnectSuccess.type, (context, event) => {
  const cursor = {
    timetoken: context?.timetoken ?? event.payload.cursor.timetoken,
    region: event.payload.cursor.region,
  };
  return ReceivingState.with(
    {
      channels: context.channels,
      groups: context.groups,
      cursor: cursor,
    },
    [emitStatus({ category: categoryConstants.PNConnectedCategory })],
  );
});

HandshakeReconnectingState.on(handshakeReconnectFailure.type, (context, event) =>
  HandshakeReconnectingState.with({ ...context, attempts: context.attempts + 1, reason: event.payload }),
);

HandshakeReconnectingState.on(handshakeReconnectGiveup.type, (context, event) =>
  HandshakeFailedState.with(
    {
      groups: context.groups,
      channels: context.channels,
      timetoken: context.timetoken,
      reason: event.payload,
    },
    [emitStatus({ category: categoryConstants.PNConnectionErrorCategory, error: event.payload?.message })],
  ),
);

HandshakeReconnectingState.on(disconnect.type, (context) =>
  HandshakeStoppedState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: {
      timetoken: context.timetoken ?? '0',
      region: 0
    }
  }),
);

HandshakeReconnectingState.on(subscriptionChange.type, (_, event) =>
  HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups }),
);

HandshakeReconnectingState.on(restore.type, (_, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
      timetoken: event.payload.timetoken,
      region: event.payload?.region ?? 0,
    },
  }),
);

HandshakeReconnectingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined));
