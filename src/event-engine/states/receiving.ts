/**
 * Receiving real-time updates (connected) state module.
 *
 * @internal
 */

import { emitMessages, emitStatus, receiveMessages } from '../effects';
import { disconnect, receiveFailure, receiveSuccess, restore, subscriptionChange, unsubscribeAll } from '../events';
import categoryConstants from '../../core/constants/categories';
import { PubNubAPIError } from '../../errors/pubnub-api-error';
import RequestOperation from '../../core/constants/operations';
import { referenceSubscribeTimetoken } from '../../core/utils';
import { ReceiveFailedState, ReceiveStoppedState, ReceivingState, UnsubscribedState } from './instances';

export { ReceivingState };
export type { ReceivingStateContext } from './instances';

/**
 * Receiving real-time updates (connected) state.
 *
 * State in which Subscription Event Engine processes any real-time updates.
 *
 * @internal
 */

ReceivingState.onEnter((context) =>
  receiveMessages(context.channels, context.groups, context.cursor, context.onDemand ?? false),
);
ReceivingState.onExit(() => receiveMessages.cancel);

ReceivingState.on(receiveSuccess.type, (context, { payload }) =>
  ReceivingState.with(
    {
      channels: context.channels,
      groups: context.groups,
      cursor: payload.cursor,
      referenceTimetoken: referenceSubscribeTimetoken(payload.cursor.timetoken),
    },
    [emitMessages(context.cursor, payload.events)],
  ),
);

ReceivingState.on(subscriptionChange.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0) {
    let errorCategory: string | undefined;
    if (payload.isOffline)
      errorCategory = PubNubAPIError.create(new Error('Network connection error')).toPubNubError(
        RequestOperation.PNSubscribeOperation,
      ).status?.category;

    return UnsubscribedState.with(undefined, [
      emitStatus({
        category: !payload.isOffline
          ? categoryConstants.PNDisconnectedCategory
          : categoryConstants.PNDisconnectedUnexpectedlyCategory,
        operation: RequestOperation.PNUnsubscribeOperation,
        ...(errorCategory ? { error: errorCategory } : {}),
      }),
    ]);
  }

  return ReceivingState.with(
    {
      channels: payload.channels,
      groups: payload.groups,
      cursor: context.cursor,
      referenceTimetoken: context.referenceTimetoken,
      onDemand: true,
    },
    [
      emitStatus({
        category: categoryConstants.PNSubscriptionChangedCategory,
        affectedChannels: payload.channels.slice(0),
        affectedChannelGroups: payload.groups.slice(0),
        currentTimetoken: context.cursor.timetoken,
      }),
    ],
  );
});

ReceivingState.on(restore.type, (context, { payload }) => {
  if (payload.channels.length === 0 && payload.groups.length === 0)
    return UnsubscribedState.with(undefined, [emitStatus({ category: categoryConstants.PNDisconnectedCategory })]);

  return ReceivingState.with(
    {
      channels: payload.channels,
      groups: payload.groups,
      cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context.cursor.region },
      referenceTimetoken: referenceSubscribeTimetoken(
        context.cursor.timetoken,
        `${payload.cursor.timetoken}`,
        context.referenceTimetoken,
      ),
      onDemand: true,
    },
    [
      emitStatus({
        category: categoryConstants.PNSubscriptionChangedCategory,
        affectedChannels: payload.channels.slice(0),
        affectedChannelGroups: payload.groups.slice(0),
        currentTimetoken: payload.cursor.timetoken,
      }),
    ],
  );
});

ReceivingState.on(receiveFailure.type, (context, { payload }) =>
  ReceiveFailedState.with({ ...context, reason: payload }, [
    emitStatus({ category: categoryConstants.PNDisconnectedUnexpectedlyCategory, error: payload.status?.category }),
  ]),
);

ReceivingState.on(disconnect.type, (context, event) => {
  if (!event.payload.isOffline) {
    return ReceiveStoppedState.with({ ...context }, [
      emitStatus({
        category: categoryConstants.PNDisconnectedCategory,
        operation: RequestOperation.PNSubscribeOperation,
      }),
    ]);
  } else {
    const errorReason = PubNubAPIError.create(new Error('Network connection error')).toPubNubError(
      RequestOperation.PNSubscribeOperation,
    );

    return ReceiveFailedState.with({ ...context, reason: errorReason }, [
      emitStatus({
        category: categoryConstants.PNDisconnectedUnexpectedlyCategory,
        operation: RequestOperation.PNSubscribeOperation,
        error: errorReason.status?.category,
      }),
    ]);
  }
});

ReceivingState.on(unsubscribeAll.type, (_) =>
  UnsubscribedState.with(undefined, [
    emitStatus({
      category: categoryConstants.PNDisconnectedCategory,
      operation: RequestOperation.PNUnsubscribeOperation,
    }),
  ]),
);
