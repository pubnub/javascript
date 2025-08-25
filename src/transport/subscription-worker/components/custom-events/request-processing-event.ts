import { RequestSendingError, RequestSendingSuccess } from '../../subscription-worker-types';
import { BasePubNubRequest } from '../request';

/**
 * Type with events which is emitted by request and can be handled with callback passed to the
 * {@link EventTarget#addEventListener|addEventListener}.
 */
export enum PubNubSharedWorkerRequestEvents {
  /**
   * Request processing started.
   */
  Started = 'started',

  /**
   * Request processing has been canceled.
   *
   * **Note:** This event dispatched only by client-provided requests.
   */
  Canceled = 'canceled',

  /**
   * Request successfully completed.
   */
  Success = 'success',

  /**
   * Request completed with error.
   *
   * Error can be caused by:
   * - missing permissions (403)
   * - network issues
   */
  Error = 'error',
}

/**
 * Base request processing event class.
 */
class BaseRequestEvent<T = object> extends CustomEvent<{ request: BasePubNubRequest } & T> {
  /**
   * Retrieve service (aggregated / updated) request.
   *
   * @returns Service (aggregated / updated) request.
   */
  get request(): BasePubNubRequest {
    return this.detail.request;
  }
}

/**
 * Dispatched by request when linked service request processing started.
 */
export class RequestStartEvent extends BaseRequestEvent {
  /**
   * Create request processing start event.
   *
   * @param request - Service (aggregated / updated) request.
   */
  constructor(request: BasePubNubRequest) {
    super(PubNubSharedWorkerRequestEvents.Started, { detail: { request } });
  }

  /**
   * Create clone of request processing start event to make it possible to forward event upstream.
   *
   * @param request - Custom requests with this event should be cloned.
   * @returns Client request processing start event.
   */
  clone(request?: BasePubNubRequest) {
    return new RequestStartEvent(request ?? this.request);
  }
}

/**
 * Dispatched by request when linked service request processing completed.
 */
export class RequestSuccessEvent extends BaseRequestEvent<{ fetchRequest: Request; response: RequestSendingSuccess }> {
  /**
   * Create request processing success event.
   *
   * @param request - Service (aggregated / updated) request.
   * @param fetchRequest - Actual request which has been used with {@link fetch}.
   * @param response - PubNub service response.
   */
  constructor(request: BasePubNubRequest, fetchRequest: Request, response: RequestSendingSuccess) {
    super(PubNubSharedWorkerRequestEvents.Success, { detail: { request, fetchRequest, response } });
  }

  /**
   * Retrieve actual request which has been used with {@link fetch}.
   *
   * @returns Actual request which has been used with {@link fetch}.
   */
  get fetchRequest() {
    return this.detail.fetchRequest;
  }

  /**
   * Retrieve PubNub service response.
   *
   * @returns Service response.
   */
  get response() {
    return this.detail.response;
  }

  /**
   * Create clone of request processing success event to make it possible to forward event upstream.
   *
   * @param request - Custom requests with this event should be cloned.
   * @returns Client request processing success event.
   */
  clone(request?: BasePubNubRequest) {
    return new RequestSuccessEvent(
      request ?? this.request,
      request ? request.asFetchRequest : this.fetchRequest,
      this.response,
    );
  }
}

/**
 * Dispatched by request when linked service request processing failed / service error response.
 */
export class RequestErrorEvent extends BaseRequestEvent<{ fetchRequest: Request; error: RequestSendingError }> {
  /**
   * Create request processing error event.
   *
   * @param request - Service (aggregated / updated) request.
   * @param fetchRequest - Actual request which has been used with {@link fetch}.
   * @param error - Request processing error information.
   */
  constructor(request: BasePubNubRequest, fetchRequest: Request, error: RequestSendingError) {
    super(PubNubSharedWorkerRequestEvents.Error, { detail: { request, fetchRequest, error } });
  }

  /**
   * Retrieve actual request which has been used with {@link fetch}.
   *
   * @returns Actual request which has been used with {@link fetch}.
   */
  get fetchRequest() {
    return this.detail.fetchRequest;
  }

  /**
   * Retrieve request processing error description.
   *
   * @returns Request processing error description.
   */
  get error(): RequestSendingError {
    return this.detail.error;
  }

  /**
   * Create clone of request processing failure event to make it possible to forward event upstream.
   *
   * @param request - Custom requests with this event should be cloned.
   * @returns Client request processing failure event.
   */
  clone(request?: BasePubNubRequest) {
    return new RequestErrorEvent(
      request ?? this.request,
      request ? request.asFetchRequest : this.fetchRequest,
      this.error,
    );
  }
}

/**
 * Dispatched by request when it has been canceled.
 */
export class RequestCancelEvent extends BaseRequestEvent {
  /**
   * Create request cancelling event.
   *
   * @param request - Client-provided (original) request.
   */
  constructor(request: BasePubNubRequest) {
    super(PubNubSharedWorkerRequestEvents.Canceled, { detail: { request } });
  }

  /**
   * Create clone of request cancel event to make it possible to forward event upstream.
   *
   * @param request - Custom requests with this event should be cloned.
   * @returns Client request cancel event.
   */
  clone(request?: BasePubNubRequest) {
    return new RequestCancelEvent(request ?? this.request);
  }
}
