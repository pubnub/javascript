import { PubNubError } from '../../errors/pubnub-error';
import { State } from '../core/state';
import { Effects, emitMessages, receiveReconnect, emitStatus } from '../effects';
import {
  disconnect,
  Events,
  receiveReconnectFailure,
  receiveReconnectGiveup,
  receiveReconnectSuccess,
  restore,
  subscriptionChange,
  unsubscribeAll,
} from '../events';
import { ReceivingState } from './receiving';
import { ReceiveFailedState } from './receive_failed';
import { ReceiveStoppedState } from './receive_stopped';
import { UnsubscribedState } from './unsubscribed';
import categoryConstants from '../../core/constants/categories';
import * as Subscription from '../../core/types/api/subscription';

export type ReceiveReconnectingStateContext = {
  channels: string[];
  groups: string[];
  cursor: Subscription.SubscriptionCursor;

  attempts: number;
  reason: PubNubError;
};

export const ReceiveReconnectingState = new State<ReceiveReconnectingStateContext, Events, Effects>(
  'RECEIVE_RECONNECTING',
);

ReceiveReconnectingState.onEnter((context) => receiveReconnect(context));
ReceiveReconnectingState.onExit(() => receiveReconnect.cancel);

ReceiveReconnectingState.on(receiveReconnectSuccess.type, (context, event) =>
  ReceivingState.with(
    {
      channels: context.channels,
      groups: context.groups,
      cursor: event.payload.cursor,
    },
    [emitMessages(event.payload.events)],
  ),
);

ReceiveReconnectingState.on(receiveReconnectFailure.type, (context, event) =>
  ReceiveReconnectingState.with({ ...context, attempts: context.attempts + 1, reason: event.payload }),
);

ReceiveReconnectingState.on(receiveReconnectGiveup.type, (context, event) =>
  ReceiveFailedState.with(
    {
      groups: context.groups,
      channels: context.channels,
      cursor: context.cursor,
      reason: event.payload,
    },
    [emitStatus({ category: categoryConstants.PNDisconnectedUnexpectedlyCategory, error: event.payload?.message })],
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
      timetoken: event.payload.cursor.timetoken,
      region: event.payload.cursor.region || context.cursor.region,
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
