import { PubNubError } from '../core/components/endpoint';
import { asyncHandler, Dispatcher, Engine } from './core';
import * as effects from './effects';
import * as events from './events';

export type Dependencies = {
  handshake: any;
  receiveMessages: any;
  join: any;
  leave: any;
  leaveAll: any;
  presenceState: any;
  config: any;

  delay: (milliseconds: number) => Promise<void>;

  emitMessages: (events: any[]) => void;
  emitStatus: (status: any) => void;
};

export class EventEngineDispatcher extends Dispatcher<effects.Effects, Dependencies> {
  constructor(engine: Engine<events.Events, effects.Effects>, dependencies: Dependencies) {
    super(dependencies);

    this.on(
      effects.handshake.type,
      asyncHandler(async (payload, abortSignal, { handshake, presenceState, config }) => {
        abortSignal.throwIfAborted();

        try {
          const handshakeParams: any = {
            abortSignal: abortSignal,
            channels: payload.channels,
            channelGroups: payload.groups,
            filterExpression: config.filterExpression,
          };
          if (config.maintainPresenceState) handshakeParams.state = presenceState;
          const result = await handshake(handshakeParams);
          return engine.transition(events.handshakeSuccess(result));
        } catch (e) {
          if (e instanceof Error && e.message === 'Aborted') {
            return;
          }

          if (e instanceof PubNubError) {
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

          engine.transition(events.receiveSuccess(result.metadata, result.messages));
        } catch (error) {
          if (error instanceof Error && error.message === 'Aborted') {
            return;
          }

          if (error instanceof PubNubError && !abortSignal.aborted) {
            return engine.transition(events.receiveFailure(error));
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

          await delay(config.retryConfiguration.getDelay(payload.attempts));

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

            return engine.transition(events.receiveReconnectSuccess(result.metadata, result.messages));
          } catch (error) {
            if (error instanceof Error && error.message === 'Aborted') {
              return;
            }

            if (error instanceof PubNubError) {
              return engine.transition(events.receiveReconnectFailure(error));
            }
          }
        } else {
          return engine.transition(
            events.receiveReconnectGiveup(
              new PubNubError(config.retryConfiguration.getGiveupReason(payload.reason, payload.attempts)),
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

          await delay(config.retryConfiguration.getDelay(payload.attempts));

          abortSignal.throwIfAborted();

          try {
            const handshakeParams: any = {
              abortSignal: abortSignal,
              channels: payload.channels,
              channelGroups: payload.groups,
              filterExpression: config.filterExpression,
            };
            if (config.maintainPresenceState) handshakeParams.state = presenceState;
            const result = await handshake(handshakeParams);

            return engine.transition(events.handshakeReconnectSuccess(result));
          } catch (error) {
            if (error instanceof Error && error.message === 'Aborted') {
              return;
            }

            if (error instanceof PubNubError) {
              return engine.transition(events.handshakeReconnectFailure(error));
            }
          }
        } else {
          return engine.transition(
            events.handshakeReconnectGiveup(
              new PubNubError(config.retryConfiguration.getGiveupReason(payload.reason, payload.attempts)),
            ),
          );
        }
      }),
    );
  }
}
