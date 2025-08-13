import {
  RequestErrorEvent,
  RequestStartEvent,
  RequestCancelEvent,
  RequestSuccessEvent,
  PubNubSharedWorkerRequestEvents,
} from './custom-events/request-processing-event';
import { RequestSendingError, RequestSendingResult, RequestSendingSuccess } from '../subscription-worker-types';
import { TransportRequest } from '../../../core/types/transport-request';
import { Query } from '../../../core/types/api';
import { PubNubClient } from './pubnub-client';
import { AccessToken } from './access-token';

/**
 * Base shared worker request implementation.
 *
 * In the `SharedWorker` context, this base class is used both for `client`-provided (they won't be used for actual
 * request) and those that are created by `SharedWorker` code (`service` request, which will be used in actual
 * requests).
 *
 * **Note:** The term `service` request in inline documentation will mean request created by `SharedWorker` and used to
 * call PubNub REST API.
 */
export class BasePubNubRequest extends EventTarget {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Starter request processing timeout timer.
   */
  private _fetchTimeoutTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Map of attached to the service request `client`-provided requests by their request identifiers.
   *
   * **Context:** `service`-provided requests only.
   */
  private dependents: Record<string, BasePubNubRequest> = {};

  /**
   * Controller, which is used to cancel ongoing `service`-provided request by signaling {@link fetch}.
   */
  private _fetchAbortController?: AbortController;

  /**
   * Service request (aggregated/modified) which will actually be used to call the REST API endpoint.
   *
   * This is used only by `client`-provided requests to be notified on service request (aggregated/modified) processing
   * stages.
   *
   * **Context:** `client`-provided requests only.
   */
  private _serviceRequest?: BasePubNubRequest;

  /**
   * Controller, which is used to clean up any event listeners added by `client`-provided request on `service`-provided
   * request.
   *
   * **Context:** `client`-provided requests only.
   */
  private abortController?: AbortController;

  /**
   * Whether the request already received a service response or an error.
   *
   * **Important:** Any interaction with completed requests except requesting properties is prohibited.
   */
  private _completed: boolean = false;

  /**
   * Whether request has been cancelled or not.
   *
   * **Important:** Any interaction with canceled requests except requesting properties is prohibited.
   */
  private _canceled: boolean = false;

  /**
   * Access token with permissions to access provided `channels`and `channelGroups` on behalf of `userId`.
   */
  private _accessToken?: AccessToken;

  /**
   * Reference to {@link PubNubClient|PubNub} client instance which created this request.
   *
   * **Context:** `client`-provided requests only.
   */
  private _client?: PubNubClient;

  /**
   * Unique user identifier from the name of which request will be made.
   */
  private _userId: string;
  // endregion

  // --------------------------------------------------------
  // --------------------- Constructors ---------------------
  // --------------------------------------------------------
  // region Constructors

  /**
   * Create request object.
   *
   * @param request - Transport request.
   * @param subscribeKey - Subscribe REST API access key.
   * @param userId - Unique user identifier from the name of which request will be made.
   * @param channels - List of channels used in request.
   * @param channelGroups - List of channel groups used in request.
   * @param [accessToken] - Access token with permissions to access provided `channels` and `channelGroups` on behalf of
   * `userId`.
   */
  constructor(
    readonly request: TransportRequest,
    readonly subscribeKey: string,
    userId: string,
    readonly channels: string[],
    readonly channelGroups: string[],
    accessToken?: AccessToken,
  ) {
    super();

    this._accessToken = accessToken;
    this._userId = userId;
  }
  // endregion

  // --------------------------------------------------------
  // ---------------------- Properties ----------------------
  // --------------------------------------------------------
  // region Properties

  /**
   * Get the request's unique identifier.
   *
   * @returns Request's unique identifier.
   */
  get identifier() {
    return this.request.identifier;
  }

  /**
   * Retrieve the origin that is used to access PubNub REST API.
   *
   * @returns Origin, which is used to access PubNub REST API.
   */
  get origin() {
    return this.request.origin;
  }

  /**
   * Retrieve the unique user identifier from the name of which request will be made.
   *
   * @returns Unique user identifier from the name of which request will be made.
   */
  get userId() {
    return this._userId;
  }

  /**
   * Update the unique user identifier from the name of which request will be made.
   *
   * @param value - New unique user identifier.
   */
  set userId(value: string) {
    this._userId = value;

    // Patch underlying transport request query parameters to use new value.
    this.request.queryParameters!.uuid = value;
  }

  /**
   * Retrieve access token with permissions to access provided `channels` and `channelGroups`.
   *
   * @returns Access token with permissions for {@link userId} or `undefined` if not set.
   */
  get accessToken() {
    return this._accessToken;
  }

  /**
   * Update the access token which should be used to access provided `channels` and `channelGroups` by the user with
   * {@link userId}.
   *
   * @param [value] - Access token with permissions for {@link userId}.
   */
  set accessToken(value: AccessToken | undefined) {
    this._accessToken = value;

    // Patch underlying transport request query parameters to use new value.
    if (value) this.request.queryParameters!.auth = value.toString();
    else delete this.request.queryParameters!.auth;
  }

  /**
   * Retrieve {@link PubNubClient|PubNub} client associates with request.
   *
   * **Context:** `client`-provided requests only.
   *
   * @returns Reference to the {@link PubNubClient|PubNub} client that is sending the request.
   */
  get client() {
    return this._client!;
  }

  /**
   * Associate request with PubNub client.
   *
   * **Context:** `client`-provided requests only.
   *
   * @param value - {@link PubNubClient|PubNub} client that created request in `SharedWorker` context.
   */
  set client(value: PubNubClient) {
    this._client = value;
  }

  /**
   * Retrieve whether the request already received a service response or an error.
   *
   * @returns `true` if request already completed processing (not with {@link cancel}).
   */
  get completed() {
    return this._completed;
  }

  /**
   * Retrieve whether the request can be cancelled or not.
   *
   * @returns `true` if there is a possibility and meaning to be able to cancel the request.
   */
  get cancellable() {
    return this.request.cancellable;
  }

  /**
   * Retrieve whether the request has been canceled prior to completion or not.
   *
   * @returns `true` if the request didn't complete processing.
   */
  get canceled() {
    return this._canceled;
  }

  /**
   * Update controller, which is used to cancel ongoing `service`-provided requests by signaling {@link fetch}.
   *
   * **Context:** `service`-provided requests only.
   *
   * @param value - Controller that has been used to signal {@link fetch} for request cancellation.
   */
  set fetchAbortController(value: AbortController) {
    // There is no point in completed request `fetch` abort controller set.
    if (this.completed || this.canceled) return;

    // Fetch abort controller can't be set for `client`-provided requests.
    if (!this.isServiceRequest) {
      console.error('Unexpected attempt to set fetch abort controller on client-provided request.');
      return;
    }

    if (this._fetchAbortController) {
      console.error('Only one abort controller can be set for service-provided requests.');
      return;
    }

    this._fetchAbortController = value;
  }

  /**
   * Retrieve `service`-provided fetch request abort controller.
   *
   * **Context:** `service`-provided requests only.
   *
   * @returns `service`-provided fetch request abort controller.
   */
  get fetchAbortController() {
    return this._fetchAbortController!;
  }

  /**
   * Represent transport request as {@link fetch} {@link Request}.
   *
   * @returns Ready-to-use {@link Request} instance.
   */
  get asFetchRequest(): Request {
    const queryParameters = this.request.queryParameters;
    const headers: Record<string, string> = {};
    let query = '';

    if (this.request.headers) for (const [key, value] of Object.entries(this.request.headers)) headers[key] = value;

    if (queryParameters && Object.keys(queryParameters).length !== 0)
      query = `?${this.queryStringFromObject(queryParameters)}`;

    return new Request(`${this.origin}${this.request.path}${query}`, {
      method: this.request.method,
      headers: Object.keys(headers).length ? headers : undefined,
      redirect: 'follow',
    });
  }

  /**
   * Retrieve the service (aggregated/modified) request, which will actually be used to call the REST API endpoint.
   *
   * **Context:** `client`-provided requests only.
   *
   * @returns Service (aggregated/modified) request, which will actually be used to call the REST API endpoint.
   */
  get serviceRequest() {
    return this._serviceRequest;
  }

  /**
   * Link request processing results to the service (aggregated/modified) request.
   *
   * **Context:** `client`-provided requests only.
   *
   * @param value - Service (aggregated/modified) request for which process progress should be observed.
   */
  set serviceRequest(value: BasePubNubRequest | undefined) {
    // This function shouldn't be called even unintentionally, on the `service`-provided requests.
    if (this.isServiceRequest) {
      console.error('Unexpected attempt to set service-provided request on service-provided request.');
      return;
    }

    const previousServiceRequest = this.serviceRequest;
    this._serviceRequest = value;

    // Detach from the previous service request if it has been changed (to a new one or unset).
    if (previousServiceRequest && (!value || previousServiceRequest.identifier !== value.identifier))
      previousServiceRequest.detachRequest(this);

    // There is no need to set attach to service request if either of them is already completed, or canceled.
    if (this.completed || this.canceled || (value && (value.completed || value.canceled))) {
      this._serviceRequest = undefined;
      return;
    }
    if (previousServiceRequest && value && previousServiceRequest.identifier === value.identifier) return;

    // Attach the request to the service request processing results.
    if (value) value.attachRequest(this);
  }

  /**
   * Retrieve whether the receiver is a `service`-provided request or not.
   *
   * @returns `true` if the request has been created by the `SharedWorker`.
   */
  get isServiceRequest() {
    return !this.client;
  }
  // endregion

  // --------------------------------------------------------
  // ---------------------- Dependency ----------------------
  // --------------------------------------------------------
  // region Dependency

  /**
   * Retrieve a list of `client`-provided requests that have been attached to the `service`-provided request.
   *
   * **Context:** `service`-provided requests only.
   *
   * @returns List of attached `client`-provided requests.
   */
  dependentRequests<T extends BasePubNubRequest>(): T[] {
    // Return an empty list for `client`-provided requests.
    if (!this.isServiceRequest) return [];

    return Object.values(this.dependents) as T[];
  }

  /**
   * Attach the `client`-provided request to the receiver (`service`-provided request) to receive a response from the
   * PubNub REST API.
   *
   * **Context:** `service`-provided requests only.
   *
   * @param request - `client`-provided request that should be attached to the receiver (`service`-provided request).
   */
  private attachRequest(request: BasePubNubRequest) {
    // Request attachments works only on service requests.
    if (!this.isServiceRequest || this.dependents[request.identifier]) {
      if (!this.isServiceRequest) console.error('Unexpected attempt to attach requests using client-provided request.');

      return;
    }

    this.dependents[request.identifier] = request;
    this.addEventListenersForRequest(request);
  }

  /**
   * Detach the `client`-provided request from the receiver (`service`-provided request) to ignore any response from the
   * PubNub REST API.
   *
   * **Context:** `service`-provided requests only.
   *
   * @param request - `client`-provided request that should be attached to the receiver (`service`-provided request).
   */
  private detachRequest(request: BasePubNubRequest) {
    // Request detachments works only on service requests.
    if (!this.isServiceRequest || !this.dependents[request.identifier]) {
      if (!this.isServiceRequest) console.error('Unexpected attempt to detach requests using client-provided request.');
      return;
    }

    delete this.dependents[request.identifier];
    request.removeEventListenersFromRequest();

    // Because `service`-provided requests are created in response to the `client`-provided one we need to cancel the
    // receiver if there are no more attached `client`-provided requests.
    // This ensures that there will be no abandoned/dangling `service`-provided request in `SharedWorker` structures.
    if (Object.keys(this.dependents).length === 0) this.cancel('Cancel request');
  }
  // endregion

  // --------------------------------------------------------
  // ------------------ Request processing ------------------
  // --------------------------------------------------------
  // region Request processing

  /**
   * Notify listeners that ongoing request processing has been cancelled.
   *
   * **Note:** The current implementation doesn't let {@link PubNubClient|PubNub} directly call
   * {@link cancel}, and it can be called from `SharedWorker` code logic.
   *
   * **Important:** Previously attached `client`-provided requests should be re-attached to another `service`-provided
   * request or properly cancelled with {@link PubNubClient|PubNub} notification of the core PubNub client module.
   *
   * @param [reason] - Reason because of which the request has been cancelled. The request manager uses this to specify
   * whether the `service`-provided request has been cancelled on-demand or because of timeout.
   * @param [notifyDependent] - Whether dependent requests should receive cancellation error or not.
   * @returns List of detached `client`-provided requests.
   */
  cancel(reason?: string, notifyDependent: boolean = false) {
    // There is no point in completed request cancellation.
    if (this.completed || this.canceled) {
      return [];
    }

    const dependentRequests = this.dependentRequests();
    if (this.isServiceRequest) {
      // Detach request if not interested in receiving request cancellation error (because of timeout).
      // When switching between aggregated `service`-provided requests there is no need in handling cancellation of
      // outdated request.
      if (!notifyDependent) dependentRequests.forEach((request) => (request.serviceRequest = undefined));

      if (this._fetchAbortController) {
        this._fetchAbortController.abort(reason);
        this._fetchAbortController = undefined;
      }
    } else this.serviceRequest = undefined;

    this._canceled = true;
    this.stopRequestTimeoutTimer();
    this.dispatchEvent(new RequestCancelEvent(this));

    return dependentRequests;
  }

  /**
   * Create and return running request processing timeout timer.
   *
   * @returns Promise with timout timer resolution.
   */
  requestTimeoutTimer() {
    return new Promise<Response>((_, reject) => {
      this._fetchTimeoutTimer = setTimeout(() => {
        reject(new Error('Request timeout'));
        this.cancel('Cancel because of timeout', true);
      }, this.request.timeout * 1000);
    });
  }

  /**
   * Stop request processing timeout timer without error.
   */
  stopRequestTimeoutTimer() {
    if (!this._fetchTimeoutTimer) return;

    clearTimeout(this._fetchTimeoutTimer);
    this._fetchTimeoutTimer = undefined;
  }

  /**
   * Handle request processing started by the request manager (actual sending).
   */
  handleProcessingStarted() {
    // Log out request processing start (will be made only for client-provided request).
    this.logRequestStart(this);

    this.dispatchEvent(new RequestStartEvent(this));
  }

  /**
   * Handle request processing successfully completed by request manager (actual sending).
   *
   * @param fetchRequest - Reference to the actual request that has been used with {@link fetch}.
   * @param response - PubNub service response which is ready to be sent to the core PubNub client module.
   */
  handleProcessingSuccess(fetchRequest: Request, response: RequestSendingSuccess) {
    this.addRequestInformationForResult(this, fetchRequest, response);
    this.logRequestSuccess(this, response);
    this._completed = true;

    this.stopRequestTimeoutTimer();
    this.dispatchEvent(new RequestSuccessEvent(this, fetchRequest, response));
  }

  /**
   * Handle request processing failed by request manager (actual sending).
   *
   * @param fetchRequest - Reference to the actual request that has been used with {@link fetch}.
   * @param error - Request processing error description.
   */
  handleProcessingError(fetchRequest: Request, error: RequestSendingError) {
    this.addRequestInformationForResult(this, fetchRequest, error);
    this.logRequestError(this, error);
    this._completed = true;

    this.stopRequestTimeoutTimer();
    this.dispatchEvent(new RequestErrorEvent(this, fetchRequest, error));
  }
  // endregion

  // --------------------------------------------------------
  // ------------------- Event Handlers ---------------------
  // --------------------------------------------------------
  // region Event handlers

  /**
   * Add `service`-provided request processing progress listeners for `client`-provided requests.
   *
   * **Context:** `service`-provided requests only.
   *
   * @param request - `client`-provided request that would like to observe `service`-provided request progress.
   */
  addEventListenersForRequest(request: BasePubNubRequest) {
    if (!this.isServiceRequest) {
      console.error('Unexpected attempt to add listeners using a client-provided request.');
      return;
    }

    request.abortController = new AbortController();

    this.addEventListener(
      PubNubSharedWorkerRequestEvents.Started,
      (event) => {
        if (!(event instanceof RequestStartEvent)) return;

        request.logRequestStart(event.request);
        request.dispatchEvent(event.clone(request));
      },
      { signal: request.abortController.signal, once: true },
    );
    this.addEventListener(
      PubNubSharedWorkerRequestEvents.Success,
      (event) => {
        if (!(event instanceof RequestSuccessEvent)) return;

        request.removeEventListenersFromRequest();
        request.addRequestInformationForResult(event.request, event.fetchRequest, event.response);
        request.logRequestSuccess(event.request, event.response);
        request._completed = true;
        request.dispatchEvent(event.clone(request));
      },
      { signal: request.abortController.signal, once: true },
    );

    this.addEventListener(
      PubNubSharedWorkerRequestEvents.Error,
      (event) => {
        if (!(event instanceof RequestErrorEvent)) return;

        request.removeEventListenersFromRequest();
        request.addRequestInformationForResult(event.request, event.fetchRequest, event.error);
        request.logRequestError(event.request, event.error);
        request._completed = true;
        request.dispatchEvent(event.clone(request));
      },
      { signal: request.abortController.signal, once: true },
    );
  }

  /**
   * Remove listeners added to the `service` request.
   *
   * **Context:** `client`-provided requests only.
   */
  removeEventListenersFromRequest() {
    // Only client-provided requests add listeners.
    if (this.isServiceRequest || !this.abortController) {
      if (this.isServiceRequest)
        console.error('Unexpected attempt to remove listeners using a client-provided request.');
      return;
    }

    this.abortController.abort();
    this.abortController = undefined;
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Check whether the request contains specified channels in the URI path and channel groups in the request query or
   * not.
   *
   * @param channels - List of channels for which any entry should be checked in the request.
   * @param channelGroups - List of channel groups for which any entry should be checked in the request.
   * @returns `true` if receiver has at least one entry from provided `channels` or `channelGroups` in own URI.
   */
  hasAnyChannelsOrGroups(channels: string[], channelGroups: string[]) {
    return (
      this.channels.some((channel) => channels.includes(channel)) ||
      this.channelGroups.some((channelGroup) => channelGroups.includes(channelGroup))
    );
  }

  /**
   * Append request-specific information to the processing result.
   *
   * @param fetchRequest - Reference to the actual request that has been used with {@link fetch}.
   * @param request - Reference to the client- or service-provided request with information for response.
   * @param result - Request processing result that should be modified.
   */
  private addRequestInformationForResult(
    request: BasePubNubRequest,
    fetchRequest: Request,
    result: RequestSendingResult,
  ) {
    if (this.isServiceRequest) return;

    result.clientIdentifier = this.client.identifier;
    result.identifier = this.identifier;
    result.url = fetchRequest.url;
  }

  /**
   * Log to the core PubNub client module information about request processing start.
   *
   * @param request - Reference to the client- or service-provided request information about which should be logged.
   */
  private logRequestStart(request: BasePubNubRequest) {
    if (this.isServiceRequest) return;

    this.client.logger.debug(() => ({ messageType: 'network-request', message: request.request }));
  }

  /**
   * Log to the core PubNub client module information about request processing successful completion.
   *
   * @param request - Reference to the client- or service-provided request information about which should be logged.
   * @param response - Reference to the PubNub service response.
   */
  private logRequestSuccess(request: BasePubNubRequest, response: RequestSendingSuccess) {
    if (this.isServiceRequest) return;

    this.client.logger.debug(() => {
      const { status, headers, body } = response.response;
      const fetchRequest = request.asFetchRequest;
      const _headers: Record<string, string> = {};

      // Copy Headers object content into plain Record.
      Object.entries(headers).forEach(([key, value]) => (_headers[key] = value));

      return { messageType: 'network-response', message: { status, url: fetchRequest.url, headers, body } };
    });
  }

  /**
   * Log to the core PubNub client module information about request processing error.
   *
   * @param request - Reference to the client- or service-provided request information about which should be logged.
   * @param error - Request processing error information.
   */
  private logRequestError(request: BasePubNubRequest, error: RequestSendingError) {
    if (this.isServiceRequest) return;

    if ((error.error ? error.error.message : 'Unknown').toLowerCase().includes('timeout')) {
      this.client.logger.debug(() => ({
        messageType: 'network-request',
        message: request.request,
        details: 'Timeout',
        canceled: true,
      }));
    } else {
      this.client.logger.warn(() => {
        const { details, canceled } = this.errorDetailsFromSendingError(error);
        let logDetails = details;

        if (canceled) logDetails = 'Aborted';
        else if (details.toLowerCase().includes('network')) logDetails = 'Network error';

        return {
          messageType: 'network-request',
          message: request.request,
          details: logDetails,
          canceled: canceled,
          failed: !canceled,
        };
      });
    }
  }

  /**
   * Retrieve error details from the error response object.
   *
   * @param error - Request fetch error object.
   * @reruns Object with error details and whether it has been canceled or not.
   */
  private errorDetailsFromSendingError(error: RequestSendingError): { details: string; canceled: boolean } {
    const canceled = error.error ? error.error.type === 'TIMEOUT' || error.error.type === 'ABORTED' : false;
    let details = error.error ? error.error.message : 'Unknown';
    if (error.response) {
      const contentType = error.response.headers['content-type'];

      if (
        error.response.body &&
        contentType &&
        (contentType.indexOf('javascript') !== -1 || contentType.indexOf('json') !== -1)
      ) {
        try {
          const serviceResponse = JSON.parse(new TextDecoder().decode(error.response.body));
          if ('message' in serviceResponse) details = serviceResponse.message;
          else if ('error' in serviceResponse) {
            if (typeof serviceResponse.error === 'string') details = serviceResponse.error;
            else if (typeof serviceResponse.error === 'object' && 'message' in serviceResponse.error)
              details = serviceResponse.error.message;
          }
        } catch (_) {}
      }

      if (details === 'Unknown') {
        if (error.response.status >= 500) details = 'Internal Server Error';
        else if (error.response.status == 400) details = 'Bad request';
        else if (error.response.status == 403) details = 'Access denied';
        else details = `${error.response.status}`;
      }
    }

    return { details, canceled };
  }

  /**
   * Stringify request query key/value pairs.
   *
   * @param query - Request query object.
   * @returns Stringified query object.
   */
  private queryStringFromObject = (query: Query) => {
    return Object.keys(query)
      .map((key) => {
        const queryValue = query[key];
        if (!Array.isArray(queryValue)) return `${key}=${this.encodeString(queryValue)}`;

        return queryValue.map((value) => `${key}=${this.encodeString(value)}`).join('&');
      })
      .join('&');
  };

  /**
   * Percent-encode input string.
   *
   * **Note:** Encode content in accordance of the `PubNub` service requirements.
   *
   * @param input - Source string or number for encoding.
   * @returns Percent-encoded string.
   */
  protected encodeString(input: string | number) {
    return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
  }
  // endregion
}
