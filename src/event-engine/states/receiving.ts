import { State } from '../core/state';
import { Cursor } from '../../models/Cursor';
import { Effects, emitEvents, receiveEvents } from '../effects';
import { disconnect, Events, receivingFailure, receivingSuccess, subscriptionChange } from '../events';
import { UnsubscribedState } from './unsubscribed';
import { ReceiveReconnectingState } from './receive_reconnecting';
import { ReceiveStoppedState } from './receive_stopped';

export type ReceivingStateContext = {
  channels: string[];
  groups: string[];
  cursor: Cursor;
};

export const ReceivingState = new State<ReceivingStateContext, Events, Effects>('RECEIVING');

ReceivingState.onEnter((context) => receiveEvents(context.channels, context.groups, context.cursor));
ReceivingState.onExit(() => receiveEvents.cancel);

ReceivingState.on(receivingSuccess.type, (context, event) => {
  return ReceivingState.with({ ...context, cursor: event.payload.cursor }, [emitEvents(event.payload.events)]);
});

ReceivingState.on(subscriptionChange.type, (context, event) => {
  if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
    return UnsubscribedState.with(undefined);
  }

  return ReceivingState.with({ ...context, channels: event.payload.channels, groups: event.payload.groups });
});

ReceivingState.on(receivingFailure.type, (context, event) => {
  return ReceiveReconnectingState.with({
    ...context,
    attempts: 0,
    reason: event.payload,
  });
});

ReceivingState.on(disconnect.type, (context) =>
  ReceiveStoppedState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: context.cursor,
  }),
);
