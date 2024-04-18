import { PrivateClientConfiguration } from '../core/interfaces/configuration';
import * as Subscription from '../core/types/api/subscription';
import { PubNubError } from '../errors/pubnub-error';
import { asyncHandler, Dispatcher, Engine } from './core';
import * as effects from './effects';
import * as events from './events';
import { Payload, StatusEvent } from '../core/types/api';
import StatusCategory from '../core/constants/categories';

export type Dependencies = {
  handshake: (parameters: Subscription.CancelableSubscribeParameters) => Promise<Subscription.SubscriptionCursor>;
  receiveMessages: (
    parameters: Subscription.CancelableSubscribeParameters,
  ) => Promise<Subscription.SubscriptionResponse>;
  join?: (parameters: { channels?: string[]; groups?: string[] }) => void;
  leave?: (parameters: { channels?: string[]; groups?: string[] }) => void;
  leaveAll?: () => void;
  presenceState: Record<string, Payload>;
  config: PrivateClientConfiguration;

  delay: (milliseconds: number) => Promise<void>;

  emitMessages: (events: Subscription.SubscriptionResponse['messages']) => void;
  emitStatus: (status: StatusEvent) => void;
};

export class EventEngineDispatcher extends Dispatcher<effects.Effects, Dependencies> {
  constructor(engine: Engine<events.Events, effects.Effects>, dependencies: Dependencies) {
    super(dependencies);

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
      asyncHandler(async (payload, _, { emitMessages }) => {
        if (payload.length > 0) {
          emitMessages(payload);
        }
      }),
    );

    this.on(
      effects.emitStatus.type,
      asyncHandler(async (payload, _, { emitStatus }) => {
        emitStatus(payload);
      }),
    );

    this.on(
      effects.receiveReconnect.type,
      asyncHandler(async (payload, abortSignal, { receiveMessages, delay, config }) => {
        if (config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts)) {
          abortSignal.throwIfAborted();

          await delay(config.retryConfiguration.getDelay(payload.attempts, payload.reason));

          abortSignal.throwIfAborted();

          try {
            const result = await receiveMessages({
              abortSignal: abortSignal,
              channels: payload.channels,
              channelGroups: payload.groups,
              timetoken: payload.cursor.timetoken,
              region: payload.cursor.region,
              filterExpression: config.filterExpression,
            });

            return engine.transition(events.receiveReconnectSuccess(result.cursor, result.messages));
          } catch (error) {
            if (error instanceof PubNubError) {
              if (error.status && error.status.category == StatusCategory.PNCancelledCategory) return;
              return engine.transition(events.receiveReconnectFailure(error));
            }
          }
        } else {
          return engine.transition(
            events.receiveReconnectGiveup(
              new PubNubError(
                config.retryConfiguration
                  ? config.retryConfiguration.getGiveupReason(payload.reason, payload.attempts)
                  : 'Unable to complete subscribe messages receive.',
              ),
            ),
          );
        }
      }),
    );

    this.on(
      effects.handshakeReconnect.type,
      asyncHandler(async (payload, abortSignal, { handshake, delay, presenceState, config }) => {
        if (config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts)) {
          abortSignal.throwIfAborted();

          await delay(config.retryConfiguration.getDelay(payload.attempts, payload.reason));

          abortSignal.throwIfAborted();

          try {
            const result = await handshake({
              abortSignal: abortSignal,
              channels: payload.channels,
              channelGroups: payload.groups,
              filterExpression: config.filterExpression,
              ...(config.maintainPresenceState && { state: presenceState }),
            });

            return engine.transition(events.handshakeReconnectSuccess(result));
          } catch (error) {
            if (error instanceof PubNubError) {
              if (error.status && error.status.category == StatusCategory.PNCancelledCategory) return;
              return engine.transition(events.handshakeReconnectFailure(error));
            }
          }
        } else {
          return engine.transition(
            events.handshakeReconnectGiveup(
              new PubNubError(
                config.retryConfiguration
                  ? config.retryConfiguration.getGiveupReason(payload.reason, payload.attempts)
                  : 'Unable to complete subscribe handshake',
              ),
            ),
          );
        }
      }),
    );
  }
}
