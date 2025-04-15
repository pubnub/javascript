/**
 * Receiving real-time updates (connected) state module.
 *
 * @internal
 */

import { Effects, emitMessages, emitStatus, receiveMessages } from '../effects';
import {
  disconnect,
  Events,
  receiveFailure,
  receiveSuccess,
  restore,
  subscriptionChange,
  unsubscribeAll,
} from '../events';
import * as Subscription from '../../core/types/api/subscription';
import categoryConstants from '../../core/constants/categories';
import { ReceiveStoppedState } from './receive_stopped';
import { ReceiveFailedState } from './receive_failed';
import { UnsubscribedState } from './unsubscribed';
import { State } from '../core/state';
import { HandshakeFailedState } from './handshake_failed';
import { PubNubAPIError } from '../../errors/pubnub-api-error';
import RequestOperation from '../../core/constants/operations';

/**
 * Context which represent current Subscription Event Engine data state.
 *
 * @internal
 */
export type ReceivingStateContext = {
  channels: string[];
  groups: string[];
  cursor: Subscription.SubscriptionCursor;
};

/**
 * Receiving real-time updates (connected) state.
 *
 * State in which Subscription Event Engine processes any real-time updates.
 *
 * @internal
 */
export const ReceivingState = new State<ReceivingStateContext, Events, Effects>('RECEIVING');

ReceivingState.onEnter((context) => receiveMessages(context.channels, context.groups, context.cursor));
ReceivingState.onExit(() => receiveMessages.cancel);

ReceivingState.on(receiveSuccess.type, (context, { payload }) => {
  return ReceivingState.with({ channels: context.channels, groups: context.groups, cursor: payload.cursor }, [
    emitMessages(payload.events),
  ]);
});

ReceivingState.on(subscriptionChange.type, (context, { payload }) => {
  const subscriptionChangeStatus = {
    category: categoryConstants.PNSubscriptionChangedCategory,
    affectedChannels: payload.channels.slice(0),
    affectedChannelGroups: payload.groups.slice(0),
  };

  if (payload.channels.length === 0 && payload.groups.length === 0)
    return UnsubscribedState.with(undefined, [emitStatus(subscriptionChangeStatus)]);

  return ReceivingState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor }, [
    emitStatus(subscriptionChangeStatus),
  ]);
});

ReceivingState.on(restore.type, (context, { payload }) => {
  const subscriptionChangeStatus = {
    category: categoryConstants.PNSubscriptionChangedCategory,
    affectedChannels: payload.channels.slice(0),
    affectedChannelGroups: payload.groups.slice(0),
  };

  if (payload.channels.length === 0 && payload.groups.length === 0)
    return UnsubscribedState.with(undefined, [emitStatus(subscriptionChangeStatus)]);

  return ReceivingState.with(
    {
      channels: payload.channels,
      groups: payload.groups,
      cursor: { timetoken: payload.cursor.timetoken, region: payload.cursor.region || context.cursor.region },
    },
    [emitStatus(subscriptionChangeStatus)],
  );
});

ReceivingState.on(receiveFailure.type, (context, { payload }) =>
  ReceiveFailedState.with({ ...context, reason: payload }, [
    emitStatus({ category: categoryConstants.PNDisconnectedUnexpectedlyCategory, error: payload.status?.category }),
  ]),
);

ReceivingState.on(disconnect.type, (context, event) => {
  if (!event.payload.isOffline) {
    return ReceiveStoppedState.with({ channels: context.channels, groups: context.groups, cursor: context.cursor }, [
      emitStatus({ category: categoryConstants.PNDisconnectedCategory }),
    ]);
  } else {
    const errorReason = PubNubAPIError.create(new Error('Network connection error')).toPubNubError(
      RequestOperation.PNSubscribeOperation,
    );

    return ReceiveFailedState.with(
      { channels: context.channels, groups: context.groups, cursor: context.cursor, reason: errorReason },
      [
        emitStatus({
          category: categoryConstants.PNDisconnectedUnexpectedlyCategory,
          error: errorReason.status?.category,
        }),
      ],
    );
  }
});

ReceivingState.on(unsubscribeAll.type, (_) =>
  UnsubscribedState.with(undefined, [emitStatus({ category: categoryConstants.PNDisconnectedCategory })]),
);
