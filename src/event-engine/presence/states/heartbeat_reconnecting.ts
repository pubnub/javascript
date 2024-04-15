import { PubNubError } from '../../../errors/pubnub-error';
import { State } from '../../core/state';
import {
  Events,
  disconnect,
  heartbeatFailure,
  heartbeatGiveup,
  heartbeatSuccess,
  joined,
  left,
  leftAll,
} from '../events';
import { Effects, delayedHeartbeat, emitStatus, leave } from '../effects';
import { HeartbeatingState } from './heartbeating';
import { HeartbeatStoppedState } from './heartbeat_stopped';
import { HeartbeatCooldownState } from './heartbeat_cooldown';
import { HeartbeatInactiveState } from './heartbeat_inactive';
import { HeartbeatFailedState } from './heartbeat_failed';

export type HeartbeatReconnectingStateContext = {
  channels: string[];
  groups: string[];

  attempts: number;
  reason: PubNubError;
};

export const HearbeatReconnectingState = new State<HeartbeatReconnectingStateContext, Events, Effects>(
  'HEARBEAT_RECONNECTING',
);

HearbeatReconnectingState.onEnter((context) => delayedHeartbeat(context));
HearbeatReconnectingState.onExit(() => delayedHeartbeat.cancel);

HearbeatReconnectingState.on(joined.type, (context, event) =>
  HeartbeatingState.with({
    channels: [...context.channels, ...event.payload.channels],
    groups: [...context.groups, ...event.payload.groups],
  }),
);

HearbeatReconnectingState.on(left.type, (context, event) =>
  HeartbeatingState.with(
    {
      channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
      groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
    },
    [leave(event.payload.channels, event.payload.groups)],
  ),
);

HearbeatReconnectingState.on(disconnect.type, (context, _) => {
  HeartbeatStoppedState.with(
    {
      channels: context.channels,
      groups: context.groups,
    },
    [leave(context.channels, context.groups)],
  );
});

HearbeatReconnectingState.on(heartbeatSuccess.type, (context, event) => {
  return HeartbeatCooldownState.with({
    channels: context.channels,
    groups: context.groups,
  });
});

HearbeatReconnectingState.on(heartbeatFailure.type, (context, event) =>
  HearbeatReconnectingState.with({ ...context, attempts: context.attempts + 1, reason: event.payload }),
);

HearbeatReconnectingState.on(heartbeatGiveup.type, (context, event) => {
  return HeartbeatFailedState.with({
    channels: context.channels,
    groups: context.groups,
  });
});

HearbeatReconnectingState.on(leftAll.type, (context, _) =>
  HeartbeatInactiveState.with(undefined, [leave(context.channels, context.groups)]),
);
