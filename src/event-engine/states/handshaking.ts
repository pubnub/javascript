import { State } from '../core/state';
import { Effects, handshake, emitStatus } from '../effects';
import {
  disconnect,
  restore,
  Events,
  handshakeFailure,
  handshakeSuccess,
  subscriptionChange,
  unsubscribeAll,
} from '../events';
import { HandshakeReconnectingState } from './handshake_reconnecting';
import { HandshakeStoppedState } from './handshake_stopped';
import { ReceivingState } from './receiving';
import { UnsubscribedState } from './unsubscribed';
import categoryConstants from '../../core/constants/categories';
import * as Subscription from '../../core/types/api/subscription';

export type HandshakingStateContext = {
  channels: string[];
  groups: string[];
  cursor?: Subscription.SubscriptionCursor;
};

export const HandshakingState = new State<HandshakingStateContext, Events, Effects>('HANDSHAKING');

HandshakingState.onEnter((context) => handshake(context.channels, context.groups));
HandshakingState.onExit(() => handshake.cancel);

HandshakingState.on(subscriptionChange.type, (context, event) => {
  if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
    return UnsubscribedState.with(undefined);
  }

  return HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
  });
});

HandshakingState.on(handshakeSuccess.type, (context, event) =>
  ReceivingState.with(
    {
      channels: context.channels,
      groups: context.groups,
      cursor: {
        timetoken: !!context?.cursor?.timetoken ? context?.cursor?.timetoken : event.payload.timetoken,
        region: event.payload.region,
      },
    },
    [
      emitStatus({
        category: categoryConstants.PNConnectedCategory,
      }),
    ],
  ),
);

HandshakingState.on(handshakeFailure.type, (context, event) => {
  return HandshakeReconnectingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: context.cursor,
    attempts: 0,
    reason: event.payload,
  });
});

HandshakingState.on(disconnect.type, (context) =>
  HandshakeStoppedState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: context.cursor,
  }),
);

HandshakingState.on(restore.type, (context, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
      timetoken: event.payload.cursor.timetoken,
      region: event.payload.cursor.region || context?.cursor?.region || 0,
    },
  }),
);

HandshakingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());
