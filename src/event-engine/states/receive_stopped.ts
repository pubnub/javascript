import { Cursor } from '../../models/Cursor';
import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, reconnect, subscriptionChange } from '../events';
import { ReceivingState } from './receiving';

type ReceiveStoppedStateContext = {
  channels: string[];
  groups: string[];
  cursor: Cursor;
};

export const ReceiveStoppedState = new State<ReceiveStoppedStateContext, Events, Effects>('STOPPED');

ReceiveStoppedState.on(subscriptionChange.type, (context, event) =>
  ReceiveStoppedState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
  }),
);

ReceiveStoppedState.on(reconnect.type, (context) => ReceivingState.with({ ...context }));
