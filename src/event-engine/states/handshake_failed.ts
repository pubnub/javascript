import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { PubNubError } from '../../errors/pubnub-error';
import { HandshakingState } from './handshaking';
import { UnsubscribedState } from './unsubscribed';
import * as Subscription from '../../core/types/api/subscription';

export type HandshakeFailedStateContext = {
  channels: string[];
  groups: string[];
  cursor?: Subscription.SubscriptionCursor;

  reason: PubNubError;
};

export const HandshakeFailedState = new State<HandshakeFailedStateContext, Events, Effects>('HANDSHAKE_FAILED');

HandshakeFailedState.on(subscriptionChange.type, (context, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor,
  }),
);

HandshakeFailedState.on(reconnect.type, (context, event) =>
  HandshakingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: event.payload.cursor || context.cursor,
  }),
);

HandshakeFailedState.on(restore.type, (context, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
      timetoken: event.payload.cursor.timetoken,
      region: event.payload.cursor.region ? event.payload.cursor.region : context?.cursor?.region ?? 0,
    },
  }),
);

HandshakeFailedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());
