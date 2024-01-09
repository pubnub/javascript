import { PubNubError } from '../core/components/endpoint';
import { asyncHandler, Dispatcher, Engine } from './core';
import * as effects from './effects';
import * as events from './events';

export type Dependencies = {
  handshake: any;
  receiveEvents: any;
  join: any;
  leave: any;
  leaveAll: any;
  presenceState: any;
  config: any;

  delay: (milliseconds: number) => Promise<void>;

  emitEvents: (events: any[]) => void;
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
          const result = await handshake({
            abortSignal: abortSignal,
            channels: payload.channels,
            channelGroups: payload.groups,
            filterExpression: config.filterExpression,
            state: presenceState,
          });
          return engine.transition(events.handshakingSuccess(result));
        } catch (e) {
          if (e instanceof Error && e.message === 'Aborted') {
            return;
          }

          if (e instanceof PubNubError) {
            return engine.transition(events.handshakingFailure(e));
          }
        }
      }),
    );

    this.on(
      effects.receiveEvents.type,
      asyncHandler(async (payload, abortSignal, { receiveEvents, config }) => {
        abortSignal.throwIfAborted();
        try {
          const result = await receiveEvents({
            abortSignal: abortSignal,
            channels: payload.channels,
            channelGroups: payload.groups,
            timetoken: payload.cursor.timetoken,
            region: payload.cursor.region,
            filterExpression: config.filterExpression,
          });

          engine.transition(events.receivingSuccess(result.metadata, result.messages));
        } catch (error) {
          if (error instanceof Error && error.message === 'Aborted') {
            return;
          }

          if (error instanceof PubNubError && !abortSignal.aborted) {
            return engine.transition(events.receivingFailure(error));
          }
        }
      }),
    );

    this.on(
      effects.emitEvents.type,
      asyncHandler( async (payload, _, { emitEvents }) => {
        if (payload.length > 0) {
          emitEvents(payload);
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
      effects.reconnect.type,
      asyncHandler(async (payload, abortSignal, { receiveEvents, delay, config }) => {
        if (config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts)) {
          abortSignal.throwIfAborted();

          await delay(config.retryConfiguration.getDelay(payload.attempts));

          abortSignal.throwIfAborted();

          try {
            const result = await receiveEvents({
              abortSignal: abortSignal,
              channels: payload.channels,
              channelGroups: payload.groups,
              timetoken: payload.cursor.timetoken,
              region: payload.cursor.region,
              filterExpression: config.filterExpression,
            });

            return engine.transition(events.reconnectingSuccess(result.metadata, result.messages));
          } catch (error) {
            if (error instanceof Error && error.message === 'Aborted') {
              return;
            }

            if (error instanceof PubNubError) {
              return engine.transition(events.reconnectingFailure(error));
            }
          }
        } else {
          return engine.transition(events.reconnectingGiveup());
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
            const result = await handshake({
              abortSignal: abortSignal,
              channels: payload.channels,
              channelGroups: payload.groups,
              filterExpression: config.filterExpression,
              state: presenceState,
            });

            return engine.transition(events.handshakingReconnectingSuccess(result));
          } catch (error) {
            if (error instanceof Error && error.message === 'Aborted') {
              return;
            }

            if (error instanceof PubNubError) {
              return engine.transition(events.handshakingReconnectingFailure(error));
            }
          }
        } else {
          return engine.transition(events.handshakingReconnectingGiveup());
        }
      }),
    );
  }
}
