import { State } from '../core/state';
import { Effects, emitMessages, emitStatus, receiveMessages } from '../effects';
import {
  disconnect,
  Events,
  receiveFailure,
  receiveSuccess,
  restore,
  subscriptionChange,
  unsubscribeAll,
} from '../events';
import { UnsubscribedState } from './unsubscribed';
import { ReceiveReconnectingState } from './receive_reconnecting';
import { ReceiveStoppedState } from './receive_stopped';
import categoryConstants from '../../core/constants/categories';
import * as Subscription from '../../core/types/api/subscription';

export type ReceivingStateContext = {
  channels: string[];
  groups: string[];
  cursor: Subscription.SubscriptionCursor;
};

export const ReceivingState = new State<ReceivingStateContext, Events, Effects>('RECEIVING');

ReceivingState.onEnter((context) => receiveMessages(context.channels, context.groups, context.cursor));
ReceivingState.onExit(() => receiveMessages.cancel);

ReceivingState.on(receiveSuccess.type, (context, event) => {
  return ReceivingState.with({ channels: context.channels, groups: context.groups, cursor: event.payload.cursor }, [
    emitMessages(event.payload.events),
  ]);
});

ReceivingState.on(subscriptionChange.type, (context, event) => {
  if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
    return UnsubscribedState.with(undefined);
  }

  return ReceivingState.with({
    cursor: context.cursor,
    channels: event.payload.channels,
    groups: event.payload.groups,
  });
});

ReceivingState.on(restore.type, (context, event) => {
  if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
    return UnsubscribedState.with(undefined);
  }

  return ReceivingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
      timetoken: event.payload.cursor.timetoken,
      region: event.payload.cursor.region || context.cursor.region,
    },
  });
});

ReceivingState.on(receiveFailure.type, (context, event) => {
  return ReceiveReconnectingState.with({
    ...context,
    attempts: 0,
    reason: event.payload,
  });
});

ReceivingState.on(disconnect.type, (context) => {
  return ReceiveStoppedState.with(
    {
      channels: context.channels,
      groups: context.groups,
      cursor: context.cursor,
    },
    [emitStatus({ category: categoryConstants.PNDisconnectedCategory })],
  );
});

ReceivingState.on(unsubscribeAll.type, (_) =>
  UnsubscribedState.with(undefined, [emitStatus({ category: categoryConstants.PNDisconnectedCategory })]),
);
