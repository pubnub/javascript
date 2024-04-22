import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { HandshakingState } from './handshaking';
import { UnsubscribedState } from './unsubscribed';
import * as Subscription from '../../core/types/api/subscription';

type ReceiveStoppedStateContext = {
  channels: string[];
  groups: string[];
  cursor: Subscription.SubscriptionCursor;
};

export const ReceiveStoppedState = new State<ReceiveStoppedStateContext, Events, Effects>('RECEIVE_STOPPED');

ReceiveStoppedState.on(subscriptionChange.type, (context, event) =>
  ReceiveStoppedState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
  }),
);

ReceiveStoppedState.on(restore.type, (context, event) =>
  ReceiveStoppedState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
      timetoken: event.payload.cursor.timetoken,
      region: event.payload.cursor.region || context.cursor.region,
    },
  }),
);

ReceiveStoppedState.on(reconnect.type, (context, event) =>
  HandshakingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: {
      timetoken: !!event.payload.cursor.timetoken ? event.payload.cursor?.timetoken : context.cursor.timetoken,
      region: event.payload.cursor.region || context.cursor.region,
    },
  }),
);

ReceiveStoppedState.on(unsubscribeAll.type, () => UnsubscribedState.with(undefined));
