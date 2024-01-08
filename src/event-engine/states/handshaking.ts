import { State } from '../core/state';
import { Effects, handshake, emitStatus } from '../effects';
import {
  disconnect,
  restore,
  Events,
  handshakingFailure,
  handshakingSuccess,
  subscriptionChange,
  unsubscribeAll,
} from '../events';
import { HandshakeReconnectingState } from './handshake_reconnecting';
import { HandshakeStoppedState } from './handshake_stopped';
import { ReceivingState } from './receiving';
import { UnsubscribedState } from './unsubscribed';
import categoryConstants from '../../core/constants/categories';

export type HandshakingStateContext = {
  channels: string[];
  groups: string[];
  timetoken?: string;
};

export const HandshakingState = new State<HandshakingStateContext, Events, Effects>('HANDSHAKING');

HandshakingState.onEnter((context) => handshake(context.channels, context.groups));
HandshakingState.onExit(() => handshake.cancel);

HandshakingState.on(subscriptionChange.type, (context, event) => {
  if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
    return UnsubscribedState.with(undefined);
  }

  return HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups });
});

HandshakingState.on(handshakingSuccess.type, (context, event) =>
  ReceivingState.with(
    {
      channels: context.channels,
      groups: context.groups,
      cursor: {
        timetoken: context.timetoken && context.timetoken !== '0' ? context.timetoken : event.payload.timetoken,
        region: event.payload.region,
      },
    },
    [emitStatus({ category: categoryConstants.PNConnectedCategory })],
  ),
);

HandshakingState.on(handshakingFailure.type, (context, event) =>
  HandshakeReconnectingState.with({
    ...context,
    attempts: 0,
    reason: event.payload,
  }),
);

HandshakingState.on(disconnect.type, (context) =>
  HandshakeStoppedState.with({
    channels: context.channels,
    groups: context.groups,
  }),
);

HandshakingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());

HandshakingState.on(restore.type, (_, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    timetoken: event.payload.timetoken,
  }),
);
