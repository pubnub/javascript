import { State } from '../../core/state';
import { Events } from '../events';
import { Effects } from '../effects';

export type HeartbeatReconnectingStateContext = {
  channels: string[];
  groups: string[];
};

export const HearbeatReconnectingState = new State<HeartbeatReconnectingStateContext, Events, Effects>(
  'HEARBEAT_RECONNECTING',
);
