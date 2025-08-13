import { SubscribeRequest } from '../subscribe-request';
import { LeaveRequest } from '../leave-request';

/**
 * Type with events which is dispatched by subscription state in response to client-provided requests and PubNub
 * client state change.
 */
export enum SubscriptionStateEvent {
  /**
   * Subscription state has been changed.
   */
  Changed = 'changed',

  /**
   * Subscription state has been invalidated after all clients' state was removed from it.
   */
  Invalidated = 'invalidated',
}

/**
 * Dispatched by subscription state when state and service requests are changed.
 */
export class SubscriptionStateChangeEvent extends CustomEvent<{
  withInitialResponse: { request: SubscribeRequest; timetoken: string; region: string }[];
  newRequests: SubscribeRequest[];
  canceledRequests: SubscribeRequest[];
  leaveRequest?: LeaveRequest;
}> {
  /**
   * Create subscription state change event.
   *
   * @param withInitialResponse - List of initial `client`-provided {@link SubscribeRequest|subscribe} requests with
   * timetokens and regions that should be returned right away.
   * @param newRequests - List of new service requests which need to be scheduled for processing.
   * @param canceledRequests - List of previously scheduled service requests which should be cancelled.
   * @param leaveRequest - Request which should be used to announce `leave` from part of the channels and groups.
   */
  constructor(
    withInitialResponse: { request: SubscribeRequest; timetoken: string; region: string }[],
    newRequests: SubscribeRequest[],
    canceledRequests: SubscribeRequest[],
    leaveRequest?: LeaveRequest,
  ) {
    super(SubscriptionStateEvent.Changed, {
      detail: { withInitialResponse, newRequests, canceledRequests, leaveRequest },
    });
  }

  /**
   * Retrieve list of initial `client`-provided {@link SubscribeRequest|subscribe} requests with timetokens and regions
   * that should be returned right away.
   *
   * @returns List of initial `client`-provided {@link SubscribeRequest|subscribe} requests with timetokens and regions
   * that should be returned right away.
   */
  get requestsWithInitialResponse() {
    return this.detail.withInitialResponse;
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
   * Retrieve request which should be used to announce `leave` from part of the channels and groups.
   *
   * @returns Request which should be used to announce `leave` from part of the channels and groups.
   */
  get leaveRequest() {
    return this.detail.leaveRequest;
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
    return new SubscriptionStateChangeEvent(
      this.requestsWithInitialResponse,
      this.newRequests,
      this.canceledRequests,
      this.leaveRequest,
    );
  }
}
/**
 * Dispatched by subscription state when it has been invalidated.
 */
export class SubscriptionStateInvalidateEvent extends CustomEvent<object> {
  /**
   * Create subscription state invalidation event.
   */
  constructor() {
    super(SubscriptionStateEvent.Invalidated);
  }

  /**
   * Create clone of subscription state change event to make it possible to forward event upstream.
   *
   * @returns Client subscription state change event.
   */
  clone() {
    return new SubscriptionStateInvalidateEvent();
  }
}
