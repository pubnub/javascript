/**
 * Initial subscription handshake (disconnected) state.
 *
 * @internal
 */

import { emitStatus, handshake } from '../effects';
import { disconnect, handshakeFailure, handshakeSuccess, restore, subscriptionChange, unsubscribeAll } from '../events';
import categoryConstants from '../../core/constants/categories';
import { PubNubAPIError } from '../../errors/pubnub-api-error';
import RequestOperation from '../../core/constants/operations';
import { referenceSubscribeTimetoken } from '../../core/utils';
import {
  HandshakeFailedState,
  HandshakeStoppedState,
  HandshakingState,
  ReceivingState,
  UnsubscribedState,
} from './instances';

export { HandshakingState };
export type { HandshakingStateContext } from './instances';

/**
 * Initial subscription handshake (disconnected) state.
 *
 * State in which Subscription Event Engine tries to receive the subscription cursor for the next sequential
 * subscribe REST API calls.
 *
 * @internal
 */

HandshakingState.onEnter((context) => handshake(context.channels, context.groups, context.onDemand ?? false));
HandshakingState.onExit(() => handshake.cancel);

HandshakingState.on(subscriptionChange.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return HandshakingState.with({
    channels: payload.channels,
    groups: payload.groups,
    cursor: context.cursor,
    onDemand: true,
  });
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
      referenceTimetoken: referenceSubscribeTimetoken(payload.timetoken, context.cursor?.timetoken),
    },
    [
      emitStatus({
        category: categoryConstants.PNConnectedCategory,
        affectedChannels: context.channels.slice(0),
        affectedChannelGroups: context.groups.slice(0),
        operation: RequestOperation.PNSubscribeOperation,
        currentTimetoken: !!context.cursor?.timetoken ? context.cursor?.timetoken : payload.timetoken,
      }),
    ],
  ),
);

HandshakingState.on(handshakeFailure.type, (context, event) =>
  HandshakeFailedState.with({ ...context, reason: event.payload }, [
    emitStatus({ category: categoryConstants.PNConnectionErrorCategory, error: event.payload.status?.category }),
  ]),
);

HandshakingState.on(disconnect.type, (context, event) => {
  if (!event.payload.isOffline) return HandshakeStoppedState.with({ ...context });
  else {
    const errorReason = PubNubAPIError.create(new Error('Network connection error')).toPubNubError(
      RequestOperation.PNSubscribeOperation,
    );

    return HandshakeFailedState.with({ ...context, reason: errorReason }, [
      emitStatus({
        category: categoryConstants.PNConnectionErrorCategory,
        error: errorReason.status?.category,
      }),
    ]);
  }
});

HandshakingState.on(restore.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) return UnsubscribedState.with(undefined);

  return HandshakingState.with({
    channels: payload.channels,
    groups: payload.groups,
    cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context?.cursor?.region || 0 },
    onDemand: true,
  });
});

HandshakingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());
