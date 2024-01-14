import { State } from '../core/state';
import { Cursor } from '../../models/Cursor';
import { Effects } from '../effects';
import { Events, reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { PubNubError } from '../../core/components/endpoint';
import { HandshakingState } from './handshaking';
import { UnsubscribedState } from './unsubscribed';

export type ReceiveFailedStateContext = {
  channels: string[];
  groups: string[];
  cursor: Cursor;

  reason: PubNubError;
};

export const ReceiveFailedState = new State<ReceiveFailedStateContext, Events, Effects>('RECEIVE_FAILED');

ReceiveFailedState.on(reconnect.type, (context, event) =>
  HandshakingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: {
      timetoken: !!event.payload.cursor.timetoken ? event.payload.cursor?.timetoken : context.cursor.timetoken,
      region: event.payload.cursor.region ? event.payload.cursor.region : context.cursor.region,
    },
  }),
);

ReceiveFailedState.on(subscriptionChange.type, (_, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
  }),
);

ReceiveFailedState.on(restore.type, (context, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
      timetoken: event.payload.cursor.timetoken,
      region: event.payload.cursor.region ? event.payload.cursor.region : context.cursor.region,
    },
  }),
);

ReceiveFailedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined));
