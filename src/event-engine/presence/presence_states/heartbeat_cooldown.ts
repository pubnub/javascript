import { State } from '../../core/state';
import { Events, timesUp } from '../presence_events';
import { Effects } from '../presence_effects';
import { HeartbeatingState } from './heartbeating';

export type HeartbeatCooldownStateContext = {
  channels: string[];
  groups: string[];
};

export const HeartbeatCooldownState = new State<HeartbeatCooldownStateContext, Events, Effects>('HEARTBEATCOOLDOWN');

HeartbeatCooldownState.on(timesUp.type, (context, event) => 
  HeartbeatingState.with({
    channels: context.channels,
    groups: context.groups
  })
);
