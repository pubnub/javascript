/**
 * Initial subscription handshake (disconnected) state.
 *
 * @internal
 */

import { Effects, emitStatus, handshake } from '../effects';
import {
  disconnect,
  Events,
  handshakeFailure,
  handshakeSuccess,
  restore,
  subscriptionChange,
  unsubscribeAll,
} from '../events';
import * as Subscription from '../../core/types/api/subscription';
import categoryConstants from '../../core/constants/categories';
import { HandshakeStoppedState } from './handshake_stopped';
import { HandshakeFailedState } from './handshake_failed';
import { UnsubscribedState } from './unsubscribed';
import { ReceivingState } from './receiving';
import { State } from '../core/state';
import { PubNubAPIError } from '../../errors/pubnub-api-error';
import RequestOperation from '../../core/constants/operations';

/**
 * Context which represent current Subscription Event Engine data state.
 *
 * @internal
 */
export type HandshakingStateContext = {
  channels: string[];
  groups: string[];
  cursor?: Subscription.SubscriptionCursor;
};

/**
 * Initial subscription handshake (disconnected) state.
 *
 * State in which Subscription Event Engine tries to receive subscription cursor for next sequential subscribe REST
 * API calls.
 *
 * @internal
 */
export const HandshakingState = new State<HandshakingStateContext, Events, Effects>('HANDSHAKING');

HandshakingState.onEnter((context) => handshake(context.channels, context.groups));
HandshakingState.onExit(() => handshake.cancel);

HandshakingState.on(subscriptionChange.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return HandshakingState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
});

HandshakingState.on(handshakeSuccess.type, (context, { payload }) =>
  ReceivingState.with(
    {
      channels: context.channels,
      groups: context.groups,
      cursor: {
        timetoken: !!context.cursor?.timetoken ? context.cursor?.timetoken : payload.timetoken,
        region: payload.region,
      },
    },
    [
      emitStatus({
        category: categoryConstants.PNConnectedCategory,
        affectedChannels: context.channels.slice(0),
        affectedChannelGroups: context.groups.slice(0),
        currentTimetoken: !!context.cursor?.timetoken ? context.cursor?.timetoken : payload.timetoken,
      }),
    ],
  ),
);

HandshakingState.on(handshakeFailure.type, (context, event) =>
  HandshakeFailedState.with(
    {
      channels: context.channels,
      groups: context.groups,
      cursor: context.cursor,
      reason: event.payload,
    },
    [emitStatus({ category: categoryConstants.PNConnectionErrorCategory, error: event.payload.status?.category })],
  ),
);

HandshakingState.on(disconnect.type, (context, event) => {
  if (!event.payload.isOffline)
    return HandshakeStoppedState.with({ channels: context.channels, groups: context.groups, cursor: context.cursor });
  else {
    const errorReason = PubNubAPIError.create(new Error('Network connection error')).toPubNubError(
      RequestOperation.PNSubscribeOperation,
    );

    return HandshakeFailedState.with(
      { channels: context.channels, groups: context.groups, cursor: context.cursor, reason: errorReason },
      [
        emitStatus({
          category: categoryConstants.PNConnectionErrorCategory,
          error: errorReason.status?.category,
        }),
      ],
    );
  }
});

HandshakingState.on(restore.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return HandshakingState.with({
    channels: payload.channels,
    groups: payload.groups,
    cursor: { timetoken: payload.cursor.timetoken, region: payload.cursor.region || context?.cursor?.region || 0 },
  });
});

HandshakingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());
