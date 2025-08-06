import { RequestSendingError, RequestSendingSuccess } from '../subscription-worker-types';
import { TransportRequest } from '../../../core/types/transport-request';
import { PubNubSharedWorkerRequest } from './request';

/**
 * SharedWorker's requests manager.
 *
 * Manager responsible for storing client-provided request for the time while enqueue / dequeue service request which
 * is actually sent to the PubNub service.
 */
export class RequestsManager extends EventTarget {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Map of service-request identifiers to their cancellation controllers.
   */
  private readonly abortControllers: Record<string, AbortController> = {};
  // endregion

  // --------------------------------------------------------
  // ------------------ Request processing ------------------
  // --------------------------------------------------------
  // region Request processing

  /**
   * Begin service request processing.
   *
   * @param request - Reference to the service request which should be sent.
   * @param success - Request success completion handler.
   * @param failure - Request failure handler.
   * @param responsePreprocess - Raw response pre-processing function which is used before calling handling callbacks.
   */
  sendRequest(
    request: PubNubSharedWorkerRequest,
    success: (fetchRequest: Request, response: RequestSendingSuccess) => void,
    failure: (fetchRequest: Request, errorResponse: RequestSendingError) => void,
    responsePreprocess?: (response: [Response, ArrayBuffer]) => [Response, ArrayBuffer],
  ) {
    request.handleProcessingStarted();

    if (request.cancellable) this.abortControllers[request.request.identifier] = new AbortController();
    const fetchRequest = request.asFetchRequest;

    (async () => {
      Promise.race([
        fetch(fetchRequest, { signal: this.abortControllers[request.request.identifier]?.signal, keepalive: true }),
        this.requestTimeoutTimer(request.request),
      ])
        .then((response): Promise<[Response, ArrayBuffer]> | [Response, ArrayBuffer] =>
          response.arrayBuffer().then((buffer) => [response, buffer]),
        )
        .then((response) => (responsePreprocess ? responsePreprocess(response) : response))
        .then((response) => {
          if (response[0].status >= 400) failure(fetchRequest, this.requestProcessingError(undefined, response));
          else success(fetchRequest, this.requestProcessingSuccess(response));
        })
        .catch((error) => {
          let fetchError = error;

          if (typeof error === 'string') {
            const errorMessage = error.toLowerCase();
            fetchError = new Error(error);

            if (!errorMessage.includes('timeout') && errorMessage.includes('cancel')) fetchError.name = 'AbortError';
          }

          failure(fetchRequest, this.requestProcessingError(fetchError));
        });
    })();
  }

  /**
   * Cancel active request processing.
   *
   * @param request - Reference to the service request which should be canceled.
   */
  cancelRequest(request: PubNubSharedWorkerRequest) {
    const abortController = this.abortControllers[request.request.identifier];
    delete this.abortControllers[request.request.identifier];

    if (abortController) abortController.abort('Cancel request');
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Create processing success event from service response.
   *
   * **Note:** The rest of information like `clientIdentifier`,`identifier`, and `url` will be added later for each
   * specific PubNub client state.
   *
   * @param res - Service response for used REST API endpoint along with response body.
   *
   * @returns Request processing success event object.
   */
  private requestProcessingSuccess(res: [Response, ArrayBuffer]): RequestSendingSuccess {
    const [response, body] = res;
    const responseBody = body.byteLength > 0 ? body : undefined;
    const contentLength = parseInt(response.headers.get('Content-Length') ?? '0', 10);
    const contentType = response.headers.get('Content-Type')!;
    const headers: Record<string, string> = {};

    // Copy Headers object content into plain Record.
    response.headers.forEach((value, key) => (headers[key.toLowerCase()] = value.toLowerCase()));

    return {
      type: 'request-process-success',
      clientIdentifier: '',
      identifier: '',
      url: '',
      response: { contentLength, contentType, headers, status: response.status, body: responseBody },
    };
  }

  /**
   * Create processing error event from service response.
   *
   * **Note:** The rest of information like `clientIdentifier`,`identifier`, and `url` will be added later for each
   * specific PubNub client state.
   *
   * @param [error] - Client-side request processing error (for example network issues).
   * @param [response] - Service error response (for example permissions error or malformed
   * payload) along with service body.
   * @returns Request processing error event object.
   */
  private requestProcessingError(error?: unknown, response?: [Response, ArrayBuffer]): RequestSendingError {
    // Use service response as error information source.
    if (response) return { ...this.requestProcessingSuccess(response), type: 'request-process-error' };

    let type: NonNullable<RequestSendingError['error']>['type'] = 'NETWORK_ISSUE';
    let message = 'Unknown error';
    let name = 'Error';

    if (error && error instanceof Error) {
      message = error.message;
      name = error.name;
    }

    const errorMessage = message.toLowerCase();
    if (errorMessage.includes('timeout')) type = 'TIMEOUT';
    else if (name === 'AbortError' || errorMessage.includes('aborted') || errorMessage.includes('cancel')) {
      message = 'Request aborted';
      type = 'ABORTED';
    }

    return {
      type: 'request-process-error',
      clientIdentifier: '',
      identifier: '',
      url: '',
      error: { name, type, message },
    };
  }

  /**
   * Create request timeout timer.
   *
   * **Note:** Native Fetch API doesn't support `timeout` out-of-box and {@link Promise} used to emulate it.
   *
   * @param request - Transport request which will time out after {@link TransportRequest.timeout|timeout} seconds.
   * @returns Promise which rejects after time out will fire.
   */
  private requestTimeoutTimer(request: TransportRequest) {
    return new Promise<Response>((_, reject) => {
      const timeoutId = setTimeout(() => {
        // Clean up.

        delete this.abortControllers[request.identifier];
        clearTimeout(timeoutId);

        reject(new Error('Request timeout'));
      }, request.timeout * 1000);
    });
  }

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
