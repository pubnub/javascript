import { State } from '../../core/state';
import { Events } from '../presence_events';
import { Effects } from '../presence_effects';

export type HeartbeatReconnectingStateContext = {
  channels: string[];
  groups: string[];
};


export const HearbeatReconnectingState = new State<HeartbeatReconnectingStateContext, Events, Effects>('HEARBEAT_RECONNECTING');

