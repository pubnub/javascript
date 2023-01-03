import { PubNubError } from '../core/components/endpoint';
import { asyncHandler, Dispatcher, Engine } from './core';
import * as effects from './effects';
import * as events from './events';

export type Dependencies = {
  handshake: any;
  receiveEvents: any;

  getRetryDelay: (attempts: number) => number;
  shouldRetry: (error: Error, attempts: number) => boolean;
  delay: (milliseconds: number) => Promise<void>;
};

export class EventEngineDispatcher extends Dispatcher<effects.Effects, Dependencies> {
  constructor(engine: Engine<events.Events, effects.Effects>, dependencies: Dependencies) {
    super(dependencies);

    this.on(
      effects.handshake.type,
      asyncHandler(async (payload, abortSignal, { handshake }) => {
        abortSignal.throwIfAborted();

        try {
          const result = await handshake({
            abortSignal: abortSignal,
            channels: payload.channels,
            channelGroups: payload.groups,
          });

          engine.transition(events.handshakingSuccess(result));
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
      asyncHandler(async (payload, abortSignal, { receiveEvents }) => {
        abortSignal.throwIfAborted();

        try {
          const result = await receiveEvents({
            abortSignal: abortSignal,
            channels: payload.channels,
            channelGroups: payload.groups,
            timetoken: payload.cursor.timetoken,
            region: payload.cursor.region,
          });

          engine.transition(events.receivingSuccess(result.metadata, result.messages));
        } catch (error) {
          if (error instanceof Error && error.message === 'Aborted') {
            return;
          }

          if (error instanceof PubNubError) {
            return engine.transition(events.receivingFailure(error));
          }
        }
      }),
    );

    this.on(
      effects.emitEvents.type,
      asyncHandler(async (payload, abortSignal, { receiveEvents }) => {
        if (payload.length > 0) {
          console.log(payload);
        }
      }),
    );

    this.on(
      effects.reconnect.type,
      asyncHandler(async (payload, abortSignal, { receiveEvents, shouldRetry, getRetryDelay, delay }) => {
        if (!shouldRetry(payload.reason, payload.attempts)) {
          return engine.transition(events.reconnectingGiveup());
        }

        abortSignal.throwIfAborted();

        await delay(getRetryDelay(payload.attempts));

        abortSignal.throwIfAborted();

        try {
          const result = await receiveEvents({
            abortSignal: abortSignal,
            channels: payload.channels,
            channelGroups: payload.groups,
            timetoken: payload.cursor.timetoken,
            region: payload.cursor.region,
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
      }),
    );

    this.on(
      effects.handshakeReconnect.type,
      asyncHandler(async (payload, abortSignal, { handshake, shouldRetry, getRetryDelay, delay }) => {
        if (!shouldRetry(payload.reason, payload.attempts)) {
          return engine.transition(events.handshakingReconnectingGiveup());
        }

        abortSignal.throwIfAborted();

        await delay(getRetryDelay(payload.attempts));

        abortSignal.throwIfAborted();

        try {
          const result = await handshake({
            abortSignal: abortSignal,
            channels: payload.channels,
            channelGroups: payload.groups,
          });

          return engine.transition(events.handshakingReconnectingSuccess(result.metadata));
        } catch (error) {
          if (error instanceof Error && error.message === 'Aborted') {
            return;
          }

          if (error instanceof PubNubError) {
            return engine.transition(events.handshakingReconnectingFailure(error));
          }
        }
      }),
    );
  }
}
