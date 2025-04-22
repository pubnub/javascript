/**
 * Presence Event Engine events module.
 *
 * @internal
 */

import { PubNubError } from '../../errors/pubnub-error';
import { createEvent, MapOf } from '../core';

/**
 * Reconnect event.
 *
 * Event is sent each time when user restores real-time updates processing and notifies other present subscribers
 * about joining back.
 *
 * @internal
 */
export const reconnect = createEvent('RECONNECT', () => ({}));
/**
 * Disconnect event.
 *
 * Event is sent when user wants to temporarily stop real-time updates processing and notifies other present
 * subscribers about leaving.
 *
 * @internal
 */
export const disconnect = createEvent('DISCONNECT', (isOffline?: boolean) => ({ isOffline }));

/**
 * Channel / group join event.
 *
 * Event is sent when user adds new channels / groups to the active channels / groups list and notifies other present
 * subscribers about joining.
 *
 * @internal
 */
export const joined = createEvent('JOINED', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

/**
 * Channel / group leave event.
 *
 * Event is sent when user removes channels / groups from the active channels / groups list and notifies other present
 * subscribers about leaving.
 *
 * @internal
 */
export const left = createEvent('LEFT', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

/**
 * Leave all event.
 *
 * Event is sent when user doesn't want to receive any real-time updates anymore and notifies other
 * subscribers on previously active channels / groups about leaving.
 *
 * @internal
 */
export const leftAll = createEvent('LEFT_ALL', (isOffline?: boolean) => ({ isOffline }));

/**
 * Presence heartbeat success event.
 *
 * Event is sent by corresponding effect handler if REST API call was successful.
 *
 * @internal
 */
export const heartbeatSuccess = createEvent('HEARTBEAT_SUCCESS', (statusCode: number) => ({ statusCode }));

/**
 * Presence heartbeat did fail event.
 *
 * Event is sent by corresponding effect handler if REST API call failed.
 *
 * @internal
 */
export const heartbeatFailure = createEvent('HEARTBEAT_FAILURE', (error: PubNubError) => error);

/**
 * Delayed presence heartbeat event.
 *
 * Event is sent by corresponding effect handler when delay timer between heartbeat calls fired.
 *
 * @internal
 */
export const timesUp = createEvent('TIMES_UP', () => ({}));

/**
 * Presence Event Engine events.
 *
 * @internal
 */
export type Events = MapOf<
  | typeof reconnect
  | typeof disconnect
  | typeof leftAll
  | typeof heartbeatSuccess
  | typeof heartbeatFailure
  | typeof joined
  | typeof left
  | typeof timesUp
>;
