import { PubNubError } from '../../core/components/endpoint';
import { Cursor } from '../../models/Cursor';
import { State } from '../core/state';
import { Effects, emitEvents, reconnect } from '../effects';
import { Events, reconnectingFailure, reconnectingGiveup, reconnectingSuccess } from '../events';
import { ReceivingState } from './receiving';
import { ReceiveFailureState } from './receive_failure';

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
  ReceiveFailureState.with({
    groups: context.groups,
    channels: context.channels,
    cursor: context.cursor,
    reason: context.reason,
  }),
);
