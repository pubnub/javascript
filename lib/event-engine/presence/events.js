import { createEvent } from '../core';
export const reconnect = createEvent('RECONNECT', () => ({}));
export const disconnect = createEvent('DISCONNECT', () => ({}));
export const joined = createEvent('JOINED', (channels, groups) => ({
    channels,
    groups,
}));
export const left = createEvent('LEFT', (channels, groups) => ({
    channels,
    groups,
}));
export const leftAll = createEvent('LEFT_ALL', () => ({}));
export const heartbeatSuccess = createEvent('HEARTBEAT_SUCCESS', (statusCode) => ({ statusCode }));
export const heartbeatFailure = createEvent('HEARTBEAT_FAILURE', (error) => error);
export const heartbeatGiveup = createEvent('HEARTBEAT_GIVEUP', () => ({}));
export const timesUp = createEvent('TIMES_UP', () => ({}));
