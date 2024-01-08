import { Cursor } from '../../models/Cursor';
import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { HandshakingState } from './handshaking';
import { ReceivingState } from './receiving';
import { UnsubscribedState } from './unsubscribed';

type ReceiveStoppedStateContext = {
  channels: string[];
  groups: string[];
  cursor: Cursor;
};

export const ReceiveStoppedState = new State<ReceiveStoppedStateContext, Events, Effects>('STOPPED');

ReceiveStoppedState.on(subscriptionChange.type, (context, event) =>
  ReceivingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
  }),
);

ReceiveStoppedState.on(restore.type, (context, event) =>
  ReceivingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
  }),
);

ReceiveStoppedState.on(reconnect.type, (context) =>
  HandshakingState.with({
    channels: context.channels,
    groups: context.groups,
  }),
);

ReceiveStoppedState.on(unsubscribeAll.type, () => UnsubscribedState.with(undefined));
