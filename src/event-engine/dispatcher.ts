/**
 * Subscribe Event Engine effects dispatcher.
 *
 * @internal
 */

import { PrivateClientConfiguration } from '../core/interfaces/configuration';
import * as Subscription from '../core/types/api/subscription';
import StatusCategory from '../core/constants/categories';
import { asyncHandler, Dispatcher, Engine } from './core';
import { Payload, StatusEvent } from '../core/types/api';
import { PubNubError } from '../errors/pubnub-error';
import * as effects from './effects';
import * as events from './events';

/**
 * Subscription Event Engine dependencies set (configuration).
 *
 * @internal
 */
export type Dependencies = {
  handshake: (parameters: Subscription.CancelableSubscribeParameters) => Promise<Subscription.SubscriptionCursor>;
  receiveMessages: (
    parameters: Subscription.CancelableSubscribeParameters,
  ) => Promise<Subscription.SubscriptionResponse>;
  join?: (parameters: { channels?: string[]; groups?: string[] }) => void;
  leave?: (parameters: { channels?: string[]; groups?: string[] }) => void;
  leaveAll?: (parameters: { channels?: string[]; groups?: string[]; isOffline?: boolean }) => void;
  presenceReconnect?: (parameters: { channels?: string[]; groups?: string[] }) => void;
  presenceDisconnect?: (parameters: { channels?: string[]; groups?: string[]; isOffline?: boolean }) => void;
  presenceState: Record<string, Payload>;
  config: PrivateClientConfiguration;

  delay: (milliseconds: number) => Promise<void>;

  emitMessages: (
    cursor: Subscription.SubscriptionCursor,
    events: Subscription.SubscriptionResponse['messages'],
  ) => void;
  emitStatus: (status: StatusEvent) => void;
};

/**
 * Subscribe Event Engine dispatcher.
 *
 * Dispatcher responsible for subscription events handling and corresponding effects execution.
 *
 * @internal
 */
export class EventEngineDispatcher extends Dispatcher<effects.Effects, Dependencies> {
  constructor(engine: Engine<events.Events, effects.Effects>, dependencies: Dependencies) {
    super(dependencies, dependencies.config.logger());

    this.on(
      effects.handshake.type,
      asyncHandler(async (payload, abortSignal, { handshake, presenceState, config }) => {
        abortSignal.throwIfAborted();

        try {
          const result = await handshake({
            abortSignal: abortSignal,
            channels: payload.channels,
            channelGroups: payload.groups,
            filterExpression: config.filterExpression,
            ...(config.maintainPresenceState && { state: presenceState }),
            onDemand: payload.onDemand,
          });
          return engine.transition(events.handshakeSuccess(result));
        } catch (e) {
          if (e instanceof PubNubError) {
            if (e.status && e.status.category == StatusCategory.PNCancelledCategory) return;
            return engine.transition(events.handshakeFailure(e));
          }
        }
      }),
    );

    this.on(
      effects.receiveMessages.type,
      asyncHandler(async (payload, abortSignal, { receiveMessages, config }) => {
        abortSignal.throwIfAborted();
        try {
          const result = await receiveMessages({
            abortSignal: abortSignal,
            channels: payload.channels,
            channelGroups: payload.groups,
            timetoken: payload.cursor.timetoken,
            region: payload.cursor.region,
            filterExpression: config.filterExpression,
            onDemand: payload.onDemand,
          });

          engine.transition(events.receiveSuccess(result.cursor, result.messages));
        } catch (error) {
          if (error instanceof PubNubError) {
            if (error.status && error.status.category == StatusCategory.PNCancelledCategory) return;
            if (!abortSignal.aborted) return engine.transition(events.receiveFailure(error));
          }
        }
      }),
    );

    this.on(
      effects.emitMessages.type,
      asyncHandler(async ({ cursor, events }, _, { emitMessages }) => {
        if (events.length > 0) emitMessages(cursor, events);
      }),
    );

    this.on(
      effects.emitStatus.type,
      asyncHandler(async (payload, _, { emitStatus }) => emitStatus(payload)),
    );
  }
}
