import { PubNubError } from '../../errors/pubnub-error';
import { createEvent, MapOf } from '../core';

export const reconnect = createEvent('RECONNECT', () => ({}));
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

export const heartbeatSuccess = createEvent('HEARTBEAT_SUCCESS', (statusCode: number) => ({ statusCode }));

export const heartbeatFailure = createEvent('HEARTBEAT_FAILURE', (error: PubNubError) => error);

export const heartbeatGiveup = createEvent('HEARTBEAT_GIVEUP', () => ({}));

export const timesUp = createEvent('TIMES_UP', () => ({}));

export type Events = MapOf<
  | typeof reconnect
  | typeof disconnect
  | typeof leftAll
  | typeof heartbeatSuccess
  | typeof heartbeatFailure
  | typeof heartbeatGiveup
  | typeof joined
  | typeof left
  | typeof timesUp
>;
