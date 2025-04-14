/**
 * Subscribe Event Engine events module.
 *
 * @internal
 */

import * as Subscription from '../core/types/api/subscription';
import { PubNubError } from '../errors/pubnub-error';
import { createEvent, MapOf } from './core';

/**
 * Subscription list change event.
 *
 * Event is sent each time when user would like to change list of active channels / groups.
 *
 * @internal
 */
export const subscriptionChange = createEvent('SUBSCRIPTION_CHANGED', (channels: string[], groups: string[]) => ({
  channels,
  groups,
}));

/**
 * Subscription loop restore.
 *
 * Event is sent when user would like to try catch up on missed updates by providing specific timetoken.
 *
 * @internal
 */
export const restore = createEvent(
  'SUBSCRIPTION_RESTORED',
  (channels: string[], groups: string[], timetoken: string | number, region?: number) => ({
    channels,
    groups,
    cursor: {
      timetoken: timetoken,
      region: region ?? 0,
    },
  }),
);

/**
 * Initial subscription handshake success event.
 *
 * Event is sent by corresponding effect handler if REST API call was successful.
 *
 * @internal
 */
export const handshakeSuccess = createEvent('HANDSHAKE_SUCCESS', (cursor: Subscription.SubscriptionCursor) => cursor);

/**
 * Initial subscription handshake did fail event.
 *
 * Event is sent by corresponding effect handler if REST API call failed.
 *
 * @internal
 */
export const handshakeFailure = createEvent('HANDSHAKE_FAILURE', (error: PubNubError) => error);

/**
 * Subscription successfully received real-time updates event.
 *
 * Event is sent by corresponding effect handler if REST API call was successful.
 *
 * @internal
 */
export const receiveSuccess = createEvent(
  'RECEIVE_SUCCESS',
  (cursor: Subscription.SubscriptionCursor, events: Subscription.SubscriptionResponse['messages']) => ({
    cursor,
    events,
  }),
);
/**
 * Subscription did fail to receive real-time updates event.
 *
 * Event is sent by corresponding effect handler if REST API call failed.
 *
 * @internal
 */
export const receiveFailure = createEvent('RECEIVE_FAILURE', (error: PubNubError) => error);

/**
 * Client disconnect event.
 *
 * Event is sent when user wants to temporarily stop real-time updates receive.
 *
 * @internal
 */
export const disconnect = createEvent('DISCONNECT', (isOffline?: boolean) => ({ isOffline }));

/**
 * Client reconnect event.
 *
 * Event is sent when user wants to restore real-time updates receive.
 *
 * @internal
 */
export const reconnect = createEvent('RECONNECT', (timetoken?: string, region?: number) => ({
  cursor: {
    timetoken: timetoken ?? '',
    region: region ?? 0,
  },
}));

/**
 * Completely stop real-time updates receive event.
 *
 * Event is sent when user doesn't want to receive any real-time updates anymore.
 *
 * @internal
 */
export const unsubscribeAll = createEvent('UNSUBSCRIBE_ALL', () => ({}));

/**
 * Subscribe Event Engine events.
 *
 * @internal
 */
export type Events = MapOf<
  | typeof subscriptionChange
  | typeof restore
  | typeof handshakeSuccess
  | typeof handshakeFailure
  | typeof receiveSuccess
  | typeof receiveFailure
  | typeof disconnect
  | typeof reconnect
  | typeof unsubscribeAll
>;
