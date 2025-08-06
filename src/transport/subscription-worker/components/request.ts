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
 */
export class PubNubSharedWorkerRequest extends EventTarget {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Service request (aggregated/modified) which will actually be used to call REST API endpoint.
   *
   * This used only by client-provided requests to be notified on service request (aggregated / modified) processing
   * stages.
   */
  private _serviceRequest?: PubNubSharedWorkerRequest;

  /**
   * Controller, which is used on request cancellation unregister event to clean up listeners.
   */
  private listenerAbortController?: AbortController;

  /**
   * Whether request already received service response or an error.
   */
  private _completed: boolean = false;

  /**
   * Access token with permissions to access {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups} on behalf of `userId`.
   */
  private _accessToken?: AccessToken;

  /**
   * Reference to PubNub client instance which created this request.
   *
   * **Note:** Field will be empty for service requests (created by `SharedWorker`).
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
   * @param channelGroups - List of channel groups used in request.
   * @param channels - List of channels used in request.
   * @param userId - Unique user identifier from the name of which request will be made.
   * @param [accessToken] - Access token with permissions to access
   * {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups} on behalf of `userId`.
   */
  constructor(
    readonly request: TransportRequest,
    readonly subscribeKey: string,
    readonly channelGroups: string[],
    readonly channels: string[],
    userId: string,
    accessToken?: AccessToken,
  ) {
    super();
    this._accessToken = accessToken;
    this._userId = userId;
  }

  /**
   * Notify listeners that ongoing request processing has been cancelled.
   */
  cancel() {
    // There is no point in completed request cancellation.
    if (this.completed) return;

    // Unlink client-provided request from service request.
    this.serviceRequest = undefined;

    // There is no need to announce about cancellation of request which can't be canceled (only listeners clean up has
    // been done).
    if (this.request.cancellable) this.dispatchEvent(new RequestCancelEvent(this));
  }
  // endregion

  // --------------------------------------------------------
  // ---------------------- Properties ----------------------
  // --------------------------------------------------------
  // region Properties

  /**
   * Retrieve origin which is used to access PubNub REST API.
   *
   * @returns Origin which is used to access PubNub REST API.
   */
  get origin() {
    return this.request.origin;
  }

  /**
   * Retrieve unique user identifier from the name of which request will be made.
   *
   * @returns Unique user identifier from the name of which request will be made.
   */
  get userId() {
    return this._userId;
  }

  /**
   * Update unique user identifier from the name of which request will be made.
   *
   * @param value - New unique user identifier.
   */
  set userId(value: string) {
    this._userId = value;

    // Patch underlying transport request query parameters to use new value.
    this.request.queryParameters!.uuid = value;
  }

  /**
   * Retrieve access token with permissions to access
   * {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
   *
   * @returns Access token with permissions for {@link PubNubSharedWorkerRequest#userId|userId}.
   */
  get accessToken() {
    return this._accessToken;
  }

  /**
   * Update access token which should be used to access
   * {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups} on behalf of `userId`.
   *
   * @param value Access token with permissions for {@link PubNubSharedWorkerRequest#userId|userId}.
   */
  set accessToken(value: AccessToken | undefined) {
    this._accessToken = value;

    // Patch underlying transport request query parameters to use new value.
    if (value) this.request.queryParameters!.auth = value.toString();
    else delete this.request.queryParameters!.auth;
  }

  /**
   * Retrieve PubNub client associates with request.
   *
   * @returns Reference to the PubNub client which is sending request.
   */
  get client() {
    return this._client!;
  }

  /**
   * Associate request with PubNub client.
   *
   * @param value - PubNub client which created request in `SharedWorker` context.
   */
  set client(value: PubNubClient) {
    this._client = value;
  }

  /**
   * Retrieve whether request already received service response or an error.
   *
   * @returns `true` if request already completed processing (not with {@link PubNubSharedWorkerRequest#cancel|cancel}).
   */
  get completed() {
    return this._completed;
  }

  /**
   * Retrieve whether request can be cancelled or not.
   *
   * @returns `true` if there is possibility and meaning to be able to cancel request.
   */
  get cancellable() {
    return this.request.cancellable;
  }

  /**
   * Represent transport request as {@link fetch} {@link Request}.
   *
   * @returns Ready to use {@link Request} instance.
   */
  get asFetchRequest(): Request {
    let headers: Record<string, string> | undefined = undefined;
    const queryParameters = this.request.queryParameters;
    let path = this.request.path;

    if (this.request.headers) {
      headers = {};
      for (const [key, value] of Object.entries(this.request.headers)) headers[key] = value;
    }

    if (queryParameters && Object.keys(queryParameters).length !== 0)
      path = `${path}?${this.queryStringFromObject(queryParameters)}`;

    return new Request(`${this.request.origin!}${path}`, {
      method: this.request.method,
      headers,
      redirect: 'follow',
    });
  }

  /**
   * Retrieve service (aggregated/modified) request which will actually be used to call REST API endpoint.
   *
   * @returns Service (aggregated/modified) request which will actually be used to call REST API endpoint.
   */
  get serviceRequest() {
    return this._serviceRequest;
  }

  /**
   * Link request processing results to the service (aggregated/modified) request.
   *
   * @param value - Service (aggregated/modified) request for which process progress should be observed.
   */
  set serviceRequest(value: PubNubSharedWorkerRequest | undefined) {
    if (this.listenerAbortController) {
      // Ignore attempt to set same service request.
      if (this._serviceRequest && value && this._serviceRequest.request.identifier === value.request.identifier) return;

      if (this.listenerAbortController) {
        this.listenerAbortController.abort();
        this.listenerAbortController = undefined;
      }
    }
    this._serviceRequest = value;

    // There is no point to add listeners for request which already completed.
    if (!value || this.completed) return;

    this.listenerAbortController = new AbortController();
    value.addEventListener(
      PubNubSharedWorkerRequestEvents.Started,
      (evt) => {
        if (!(evt instanceof RequestStartEvent)) return;
        const event = evt as RequestStartEvent;

        // Notify about request processing start.
        this.logRequestStart(event.request);

        // Forward event from the name of this request (because it has been linked to the service request).
        this.dispatchEvent(event.clone());
      },
      { signal: this.listenerAbortController.signal, once: true },
    );
    value.addEventListener(
      PubNubSharedWorkerRequestEvents.Success,
      (evt) => {
        if (!(evt instanceof RequestSuccessEvent)) return;
        const event = evt as RequestSuccessEvent;

        // Clean up other listeners.
        if (this.listenerAbortController) {
          this.listenerAbortController.abort();
          this.listenerAbortController = undefined;
        }

        // Append request-specific information
        this.addRequestInformationForResult(event.request, event.fetchRequest, event.response);

        // Notify about request processing successfully completed.
        this.logRequestSuccess(event.request, event.response);

        // Mark that request received successful response.
        this._completed = true;

        // Forward event from the name of this request (because it has been linked to the service request).
        this.dispatchEvent(event.clone());
      },
      { signal: this.listenerAbortController.signal, once: true },
    );

    value.addEventListener(
      PubNubSharedWorkerRequestEvents.Error,
      (evt) => {
        if (!(evt instanceof RequestErrorEvent)) return;
        const event = evt as RequestErrorEvent;

        // Clean up other listeners.
        if (this.listenerAbortController) {
          this.listenerAbortController.abort();
          this.listenerAbortController = undefined;
        }

        // Append request-specific information
        this.addRequestInformationForResult(event.request, event.fetchRequest, event.error);

        // Notify about request processing error.
        this.logRequestError(event.request, event.error);

        // Mark that request received error.
        this._completed = true;

        // Forward event from the name of this request (because it has been linked to the service request).
        this.dispatchEvent(event.clone());
      },
      { signal: this.listenerAbortController.signal, once: true },
    );
  }
  // endregion

  // --------------------------------------------------------
  // ------------- Request processing handlers --------------
  // --------------------------------------------------------
  // region Request processing handlers

  /**
   * Handle request processing started by request manager (actual sending).
   *
   * **Important:** Function should be called only for `SharedWorker`-provided requests.
   */
  handleProcessingStarted() {
    // Notify about request processing start (will be made only for client-provided request).
    this.logRequestStart(this);

    this.dispatchEvent(new RequestStartEvent(this));
  }

  /**
   * Handle request processing successfully completed by request manager (actual sending).
   *
   * **Important:** Function should be called only for `SharedWorker`-provided requests.
   *
   * @param fetchRequest - Reference to actual request which has been used with {@link fetch}.
   * @param response - PubNub service response.
   */
  handleProcessingSuccess(fetchRequest: Request, response: RequestSendingSuccess) {
    // Append request-specific information
    this.addRequestInformationForResult(this, fetchRequest, response);

    // Notify about request processing successfully completed (will be made only for client-provided request).
    this.logRequestSuccess(this, response);

    // Mark that request received successful response.
    this._completed = true;

    this.dispatchEvent(new RequestSuccessEvent(this, fetchRequest, response));
  }

  /**
   * Handle request processing failed by request manager (actual sending).
   *
   * **Important:** Function should be called only for `SharedWorker`-provided requests.
   *
   * @param fetchRequest - Reference to actual request which has been used with {@link fetch}.
   * @param error - Request processing error description.
   */
  handleProcessingError(fetchRequest: Request, error: RequestSendingError) {
    // Append request-specific information
    this.addRequestInformationForResult(this, fetchRequest, error);

    // Notify about request processing error (will be made only for client-provided request).
    this.logRequestError(this, error);

    // Mark that request received error.
    this._completed = true;

    this.dispatchEvent(new RequestErrorEvent(this, fetchRequest, error));
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Append request-specific information to the processing result.
   *
   * @param fetchRequest - Reference to actual request which has been used with {@link fetch}.
   * @param request - Reference to the client- or service-provided request with information for response.
   * @param result - Request processing result which should be modified.
   */
  private addRequestInformationForResult(
    request: PubNubSharedWorkerRequest,
    fetchRequest: Request,
    result: RequestSendingResult,
  ) {
    if (!this._client) return;

    result.clientIdentifier = this._client.identifier;
    result.identifier = this.request.identifier;
    result.url = fetchRequest.url;
  }

  /**
   * Log to the core PubNub client module information about request processing start.
   *
   * @param request - Reference to the client- or service-provided request information about which should be logged.
   */
  private logRequestStart(request: PubNubSharedWorkerRequest) {
    if (!this._client) return;
    this._client.logger.debug(() => ({ messageType: 'network-request', message: request.request }));
  }

  /**
   * Log to the core PubNub client module information about request processing successful completion.
   *
   * @param request - Reference to the client- or service-provided request information about which should be logged.
   * @param response - Reference to the PubNub service response.
   */
  private logRequestSuccess(request: PubNubSharedWorkerRequest, response: RequestSendingSuccess) {
    if (!this._client) return;

    this._client.logger.debug(() => {
      const { status, headers, body } = response.response;
      const fetchRequest = request.asFetchRequest;
      const _headers: Record<string, string> = {};

      // Copy Headers object content into plain Record.
      Object.entries(headers).forEach(([key, value]) => (_headers[key.toLowerCase()] = value.toLowerCase()));

      return { messageType: 'network-response', message: { status, url: fetchRequest.url, headers, body } };
    });
  }

  /**
   * Log to the core PubNub client module information about request processing error.
   *
   * @param request - Reference to the client- or service-provided request information about which should be logged.
   * @param error - Request processing error information.
   */
  private logRequestError(request: PubNubSharedWorkerRequest, error: RequestSendingError) {
    if (!this._client) return;

    if ((error.error ? error.error.message : 'Unknown').toLowerCase().includes('timeout')) {
      this._client.logger.debug(() => ({
        messageType: 'network-request',
        message: request.request,
        details: 'Timeout',
        canceled: true,
      }));
    } else {
      this._client.logger.warn(() => {
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
   * Retrieve error details from error response object.
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
   * Stringify request query key / value pairs.
   *
   * @param query - Request query object.
   *
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
   *
   * @returns Percent-encoded string.
   */
  private encodeString(input: string | number) {
    return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
  }
  // endregion
}
