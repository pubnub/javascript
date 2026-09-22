/**
 * Subscribe Event Engine state instances.
 *
 * Isolated from transition handlers so state modules can import sibling states
 * without creating circular dependencies.
 *
 * @internal
 */

import * as Subscription from '../../core/types/api/subscription';
import { PubNubError } from '../../errors/pubnub-error';
import { State } from '../core/state';
import { Effects } from '../effects';
import { Events } from '../events';

/**
 * Context which represent current Subscription Event Engine data state.
 *
 * @internal
 */
export type HandshakingStateContext = {
  channels: string[];
  groups: string[];
  cursor?: Subscription.SubscriptionCursor;
  onDemand?: boolean;
};

/**
 * Context which represent current Subscription Event Engine data state.
 *
 * @internal
 */
export type HandshakeStoppedStateContext = {
  channels: string[];
  groups: string[];
  cursor?: Subscription.SubscriptionCursor;
};

/**
 * Context which represent current Subscription Event Engine data state.
 *
 * @internal
 */
export type HandshakeFailedStateContext = {
  channels: string[];
  groups: string[];
  cursor?: Subscription.SubscriptionCursor;

  reason: PubNubError;
};

/**
 * Context which represent current Subscription Event Engine data state.
 *
 * @internal
 */
export type ReceivingStateContext = {
  channels: string[];
  groups: string[];
  cursor: Subscription.SubscriptionCursor;
  referenceTimetoken?: string;
  onDemand?: boolean;
};

/**
 * Context which represent current Subscription Event Engine data state.
 *
 * @internal
 */
export type ReceiveStoppedStateContext = {
  channels: string[];
  groups: string[];
  cursor: Subscription.SubscriptionCursor;
};

/**
 * Context which represent current Subscription Event Engine data state.
 *
 * @internal
 */
export type ReceiveFailedStateContext = {
  channels: string[];
  groups: string[];
  cursor: Subscription.SubscriptionCursor;

  reason: PubNubError;
};

/** @internal */
export const UnsubscribedState = new State<void, Events, Effects>('UNSUBSCRIBED');

/** @internal */
export const HandshakingState = new State<HandshakingStateContext, Events, Effects>('HANDSHAKING');

/** @internal */
export const HandshakeStoppedState = new State<HandshakeStoppedStateContext, Events, Effects>('HANDSHAKE_STOPPED');

/** @internal */
export const HandshakeFailedState = new State<HandshakeFailedStateContext, Events, Effects>('HANDSHAKE_FAILED');

/** @internal */
export const ReceivingState = new State<ReceivingStateContext, Events, Effects>('RECEIVING');

/** @internal */
export const ReceiveStoppedState = new State<ReceiveStoppedStateContext, Events, Effects>('RECEIVE_STOPPED');

/** @internal */
export const ReceiveFailedState = new State<ReceiveFailedStateContext, Events, Effects>('RECEIVE_FAILED');
