import { State } from '../core/state';
import { Cursor } from '../../models/Cursor';
import { Effects, emitStatus } from '../effects';
import { disconnect, Events, reconnectingRetry, restore, subscriptionChange, unsubscribeAll } from '../events';
import { PubNubError } from '../../core/components/endpoint';
import { HandshakingState } from './handshaking';
import { ReceiveStoppedState } from './receive_stopped';
import categoryConstants from '../../core/constants/categories';
import { UnsubscribedState } from './unsubscribed';

export type ReceiveFailureStateContext = {
  channels: string[];
  groups: string[];
  cursor: Cursor;

  reason: PubNubError;
};

export const ReceiveFailureState = new State<ReceiveFailureStateContext, Events, Effects>('RECEIVE_FAILED');

ReceiveFailureState.on(reconnectingRetry.type, (context) =>
  HandshakingState.with({
    channels: context.channels,
    groups: context.groups,
    timetoken: context.cursor.timetoken,
  }),
);

ReceiveFailureState.on(disconnect.type, (context) =>
  ReceiveStoppedState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: context.cursor,
  }),
);

ReceiveFailureState.on(subscriptionChange.type, (_, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    timetoken: event.payload.timetoken,
  }),
);

ReceiveFailureState.on(restore.type, (_, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    timetoken: event.payload.timetoken,
  }),
);

ReceiveFailureState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined));
