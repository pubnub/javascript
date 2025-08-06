import { HeartbeatRequest } from '../heartbeat-request';

/**
 * Type with events which is dispatched by heartbeat state in response to client-provided requests and PubNub
 * client state change.
 */
export enum HeartbeatStateEvent {
  /**
   * Heartbeat state ready to send another heartbeat.
   */
  Heartbeat = 'heartbeat',
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
