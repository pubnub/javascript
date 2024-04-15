import { PubNubError } from '../../errors/pubnub-error';
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
import * as Subscription from '../../core/types/api/subscription';

export type HandshakeReconnectingStateContext = {
  channels: string[];
  groups: string[];
  cursor?: Subscription.SubscriptionCursor;

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
    timetoken: !!context.cursor?.timetoken ? context.cursor?.timetoken : event.payload.cursor.timetoken,
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
      cursor: context.cursor,
      reason: event.payload,
    },
    [emitStatus({ category: categoryConstants.PNConnectionErrorCategory, error: event.payload?.message })],
  ),
);

HandshakeReconnectingState.on(disconnect.type, (context) =>
  HandshakeStoppedState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: context.cursor,
  }),
);

HandshakeReconnectingState.on(subscriptionChange.type, (context, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
  }),
);

HandshakeReconnectingState.on(restore.type, (context, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
      timetoken: event.payload.cursor.timetoken,
      region: event.payload.cursor?.region || context?.cursor?.region || 0,
    },
  }),
);

HandshakeReconnectingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined));
