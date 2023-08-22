import { PubNubError } from '../../core/components/endpoint';
import { asyncHandler, Dispatcher, Engine } from '../core';
import * as effects from './effects';
import * as events from './events';

export type Dependencies = {
  heartbeat: any;
  leave: any;
  heartbeatDelay: (millisecond: number) => Promise<void>;
  getDelayTime: () => number; // gets value from configuration
};

export class PresenceEventEngineDispatcher extends Dispatcher<effects.Effects, Dependencies> {
  /**
   *   Effect Dispatcher for presence events
   */
  constructor(engine: Engine<events.Events, effects.Effects>, dependencies: Dependencies) {
    super(dependencies);

    this.on(
      effects.heartbeat.type,
      asyncHandler(async (payload, _, { heartbeat }) => {
        try {
          const result = await heartbeat({
            channels: payload.channels,
            channelGroups: payload.groups,
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
      asyncHandler(async (payload, _, { leave }) => {
        try {
          const result = await leave({
            channels: payload.channels,
            channelGroups: payload.groups,
          });

          // engine.transition(events.leaveSuccess());
        } catch (e) {
          if (e instanceof PubNubError) {
            // return engine.transition(events.leaveFailure(e));
          }
        }
      }),
    );

    this.on(
      effects.wait.type,
      asyncHandler(async (_, abortSignal, { heartbeatDelay, getDelayTime }) => {
        abortSignal.throwIfAborted();

        await heartbeatDelay(getDelayTime());

        abortSignal.throwIfAborted();

        return engine.transition(events.leaveSuccess());
      }),
    );
  }
}
