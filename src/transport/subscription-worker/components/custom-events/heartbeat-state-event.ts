import { HeartbeatRequest } from '../heartbeat-request';
import { SubscriptionStateInvalidateEvent } from './subscription-state-event';

/**
 * Type with events which is dispatched by heartbeat state in response to client-provided requests and PubNub
 * client state change.
 */
export enum HeartbeatStateEvent {
  /**
   * Heartbeat state ready to send another heartbeat.
   */
  Heartbeat = 'heartbeat',

  /**
   * Heartbeat state has been invalidated after all clients' state was removed from it.
   */
  Invalidated = 'invalidated',
}

/**
 * Dispatched by heartbeat state when new heartbeat can be sent.
 */
export class HeartbeatStateHeartbeatEvent extends CustomEvent<HeartbeatRequest> {
  /**
   * Create heartbeat state heartbeat event.
   *
   * @param request - Aggregated heartbeat request which can be sent.
   */
  constructor(request: HeartbeatRequest) {
    super(HeartbeatStateEvent.Heartbeat, { detail: request });
  }

  /**
   * Retrieve aggregated heartbeat request which can be sent.
   *
   * @returns Aggregated heartbeat request which can be sent.
   */
  get request() {
    return this.detail;
  }

  /**
   * Create clone of heartbeat event to make it possible to forward event upstream.
   *
   * @returns Client heartbeat event.
   */
  clone() {
    return new HeartbeatStateHeartbeatEvent(this.request);
  }
}

/**
 * Dispatched by heartbeat state when it has been invalidated.
 */
export class HeartbeatStateInvalidateEvent extends CustomEvent<object> {
  /**
   * Create heartbeat state invalidation event.
   */
  constructor() {
    super(HeartbeatStateEvent.Invalidated);
  }

  /**
   * Create clone of invalidate event to make it possible to forward event upstream.
   *
   * @returns Client invalidate event.
   */
  clone() {
    return new HeartbeatStateInvalidateEvent();
  }
}
