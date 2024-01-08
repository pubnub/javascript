import { PubNubError } from '../../core/components/endpoint';
import { Cursor } from '../../models/Cursor';
import { State } from '../core/state';
import { Effects, emitEvents, reconnect, emitStatus } from '../effects';
import {
  disconnect,
  Events,
  reconnectingFailure,
  reconnectingGiveup,
  reconnectingSuccess,
  restore,
  subscriptionChange,
  unsubscribeAll,
} from '../events';
import { ReceivingState } from './receiving';
import { ReceiveFailureState } from './receive_failure';
import { ReceiveStoppedState } from './receive_stopped';
import { UnsubscribedState } from './unsubscribed';
import categoryConstants from '../../core/constants/categories';

export type ReceiveReconnectingStateContext = {
  channels: string[];
  groups: string[];
  cursor: Cursor;

  attempts: number;
  reason: PubNubError;
};

export const ReceiveReconnectingState = new State<ReceiveReconnectingStateContext, Events, Effects>(
  'RECEIVE_RECONNECTING',
);

ReceiveReconnectingState.onEnter((context) => reconnect(context));
ReceiveReconnectingState.onExit(() => reconnect.cancel);

ReceiveReconnectingState.on(reconnectingSuccess.type, (context, event) =>
  ReceivingState.with(
    {
      channels: context.channels,
      groups: context.groups,
      cursor: event.payload.cursor,
    },
    [emitEvents(event.payload.events)],
  ),
);

ReceiveReconnectingState.on(reconnectingFailure.type, (context, event) =>
  ReceiveReconnectingState.with({ ...context, attempts: context.attempts + 1, reason: event.payload }),
);

ReceiveReconnectingState.on(reconnectingGiveup.type, (context) =>
  ReceiveFailureState.with(
    {
      groups: context.groups,
      channels: context.channels,
      cursor: context.cursor,
      reason: context.reason,
    },
    [emitStatus({ category: categoryConstants.PNDisconnectedUnexpectedlyCategory })],
  ),
);

ReceiveReconnectingState.on(disconnect.type, (context) =>
  ReceiveStoppedState.with(
    {
      channels: context.channels,
      groups: context.groups,
      cursor: context.cursor,
    },
    [emitStatus({ category: categoryConstants.PNDisconnectedCategory })],
  ),
);

ReceiveReconnectingState.on(restore.type, (context, event) =>
  ReceivingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
      timetoken: event.payload.timetoken ?? context.cursor.timetoken,
      region: event.payload.region ?? context.cursor.region,
    },
  }),
);

ReceiveReconnectingState.on(subscriptionChange.type, (context, event) =>
  ReceivingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
  }),
);

ReceiveReconnectingState.on(unsubscribeAll.type, (_) =>
  UnsubscribedState.with(undefined, [emitStatus({ category: categoryConstants.PNDisconnectedCategory })]),
);
