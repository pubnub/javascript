import { PubNubError } from '../../core/components/endpoint';
import { createEvent, MapOf } from '../core';

export const disconnect = createEvent('DISCONNECT', () => ({}));

export const joined = createEvent('JOINED', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

export const left = createEvent('LEFT', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

export const leftAll = createEvent('LEFT_ALL', () => ({}));

export const heartbeatSuccess = createEvent('HEARTBEAT_SUCCESS', () => ({}));

export const heartbeatFailure = createEvent('HEARTBEAT_FAILURE', (error: PubNubError) => error);

export const leaveSuccess = createEvent('LEAVE_SUCCESS', () => ({}));

export const leaveFailure = createEvent('LEAVE_FAILURE', (error: PubNubError) => error);

export const timesUp = createEvent('TIMES_UP', () => ({}));

export type Events = MapOf<
  | typeof disconnect
  | typeof leftAll
  | typeof heartbeatSuccess
  | typeof heartbeatFailure
  | typeof leaveSuccess
  | typeof leaveFailure
  | typeof joined
  | typeof left
  | typeof timesUp
>;
