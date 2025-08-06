import { SubscribeRequest } from '../subscribe-request';

/**
 * Type with events which is dispatched by subscription state in response to client-provided requests and PubNub
 * client state change.
 */
export enum SubscriptionStateEvent {
  /**
   * Subscription state has been changed.
   */
  Changed = 'changed',
}

/**
 * Dispatched by subscription state when state and service requests are changed.
 */
export class SubscriptionStateChangeEvent extends CustomEvent<{
  newRequests: SubscribeRequest[];
  canceledRequests: SubscribeRequest[];
}> {
  /**
   * Create subscription state change event.
   *
   * @param newRequests - List of new service requests which need to be scheduled for processing.
   * @param canceledRequests - List of previously scheduled service requests which should be cancelled.
   */
  constructor(newRequests: SubscribeRequest[], canceledRequests: SubscribeRequest[]) {
    super(SubscriptionStateEvent.Changed, { detail: { newRequests, canceledRequests } });
  }

  /**
   * Retrieve list of new service requests which need to be scheduled for processing.
   *
   * @returns List of new service requests which need to be scheduled for processing.
   */
  get newRequests() {
    return this.detail.newRequests;
  }

  /**
   * Retrieve list of previously scheduled service requests which should be cancelled.
   *
   * @returns List of previously scheduled service requests which should be cancelled.
   */
  get canceledRequests() {
    return this.detail.canceledRequests;
  }

  /**
   * Create clone of subscription state change event to make it possible to forward event upstream.
   *
   * @returns Client subscription state change event.
   */
  clone() {
    return new SubscriptionStateChangeEvent(this.newRequests, this.canceledRequests);
  }
}
