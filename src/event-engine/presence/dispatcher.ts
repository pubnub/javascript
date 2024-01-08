import { PubNubError } from '../../core/components/endpoint';
import { asyncHandler, Dispatcher, Engine } from '../core';
import * as effects from './effects';
import * as events from './events';

export type Dependencies = {
  heartbeat: any;
  leave: any;
  heartbeatDelay: () => Promise<void>;

  retryDelay: (milliseconds: number) => Promise<void>;
  config: any;
  presenceState: any;
};

export class PresenceEventEngineDispatcher extends Dispatcher<effects.Effects, Dependencies> {
  constructor(engine: Engine<events.Events, effects.Effects>, dependencies: Dependencies) {
    super(dependencies);

    this.on(
      effects.heartbeat.type,
      asyncHandler(async (payload, _, { heartbeat, presenceState }) => {
        try {
          const result = await heartbeat({
            channels: payload.channels,
            channelGroups: payload.groups,
            state: presenceState,
          });

          engine.transition(events.heartbeatSuccess());
        } catch (e) {
          if (e instanceof PubNubError) {
            return engine.transition(events.heartbeatFailure(e));
          }
        }
      }),
    );

    this.on(
      effects.leave.type,
      asyncHandler(async (payload, _, { leave, config }) => {
        if (!config.suppressLeaveEvents) {
          try {
            const result = await leave({
              channels: payload.channels,
              channelGroups: payload.groups,
            });
          } catch (e) {}
        }
      }),
    );

    this.on(
      effects.wait.type,
      asyncHandler(async (_, abortSignal, { heartbeatDelay }) => {
        abortSignal.throwIfAborted();

        await heartbeatDelay();

        abortSignal.throwIfAborted();

        return engine.transition(events.timesUp());
      }),
    );

    this.on(
      effects.delayedHeartbeat.type,
      asyncHandler(async (payload, abortSignal, { heartbeat, retryDelay, presenceState, config }) => {
        if (config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts)) {
          abortSignal.throwIfAborted();
          await retryDelay(config.retryConfiguration.getDelay(payload.attempts));
          abortSignal.throwIfAborted();
          try {
            const result = await heartbeat({
              channels: payload.channels,
              channelGroups: payload.groups,
              state: presenceState,
            });
            console.log(`after hb call`);
            return engine.transition(events.heartbeatSuccess());
          } catch (e) {
            if (e instanceof Error && e.message === 'Aborted') {
              return;
            }

            if (e instanceof PubNubError) {
              return engine.transition(events.heartbeatFailure(e));
            }
          }
        } else {
          return engine.transition(events.heartbeatGiveup());
        }
      }),
    );
  }
}