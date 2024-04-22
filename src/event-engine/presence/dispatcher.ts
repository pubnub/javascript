import { PrivateClientConfiguration } from '../../core/interfaces/configuration';
import { asyncHandler, Dispatcher, Engine } from '../core';
import PNOperations from '../../core/constants/operations';
import * as Presence from '../../core/types/api/presence';
import { PubNubError } from '../../errors/pubnub-error';
import { Payload, ResultCallback } from '../../core/types/api';
import * as effects from './effects';
import * as events from './events';
import StatusCategory from '../../core/constants/categories';

export type Dependencies = {
  heartbeat: (
    parameters: Presence.PresenceHeartbeatParameters,
    callback?: ResultCallback<Presence.PresenceHeartbeatResponse>,
  ) => Promise<Presence.PresenceHeartbeatResponse | void>;
  leave: (parameters: Presence.PresenceLeaveParameters) => void;
  heartbeatDelay: () => Promise<void>;

  retryDelay: (milliseconds: number) => Promise<void>;
  config: PrivateClientConfiguration;
  presenceState: Record<string, Payload>;

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  emitStatus: (status: any) => void;
};

export class PresenceEventEngineDispatcher extends Dispatcher<effects.Effects, Dependencies> {
  constructor(engine: Engine<events.Events, effects.Effects>, dependencies: Dependencies) {
    super(dependencies);

    this.on(
      effects.heartbeat.type,
      asyncHandler(async (payload, _, { heartbeat, presenceState, config }) => {
        try {
          const result = await heartbeat({
            channels: payload.channels,
            channelGroups: payload.groups,
            ...(config.maintainPresenceState && { state: presenceState }),
            heartbeat: config.presenceTimeout!,
          });
          engine.transition(events.heartbeatSuccess(200));
        } catch (e) {
          if (e instanceof PubNubError) {
            if (e.status && e.status.category == StatusCategory.PNCancelledCategory) return;
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
            leave({
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

          await retryDelay(config.retryConfiguration.getDelay(payload.attempts, payload.reason));

          abortSignal.throwIfAborted();
          try {
            const result = await heartbeat({
              channels: payload.channels,
              channelGroups: payload.groups,
              ...(config.maintainPresenceState && { state: presenceState }),
              heartbeat: config.presenceTimeout!,
            });
            return engine.transition(events.heartbeatSuccess(200));
          } catch (e) {
            if (e instanceof PubNubError) {
              if (e.status && e.status.category == StatusCategory.PNCancelledCategory) return;
              return engine.transition(events.heartbeatFailure(e));
            }
          }
        } else {
          return engine.transition(events.heartbeatGiveup());
        }
      }),
    );

    this.on(
      effects.emitStatus.type,
      asyncHandler(async (payload, _, { emitStatus, config }) => {
        if (config.announceFailedHeartbeats && payload?.status?.error === true) {
          emitStatus(payload.status);
        } else if (config.announceSuccessfulHeartbeats && payload.statusCode === 200) {
          emitStatus({ ...payload, operation: PNOperations.PNHeartbeatOperation, error: false });
        }
      }),
    );
  }
}
