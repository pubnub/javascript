/**
 * Web Worker module.
 */

import { TransportRequest } from '../core/types/transport-request';
import { Query } from '../core/types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------

// region Types

// region PubNub Core
export type SetupEvent = {
  type: 'setup';

  /**
   * Whether verbose logging enabled or not.
   */
  logVerbosity: boolean;

  /**
   * If set to `true`, SDK will use the same TCP connection for each HTTP request, instead of
   * opening a new one for each new request.
   *
   * @default `true`
   */
  keepAlive: boolean;
};

/**
 * Send HTTP request event.
 *
 * Request from Web Worker to schedule {@link Request} using provided {@link SendRequestSignal#request|request} data.
 */
export type SendRequestEvent = {
  type: 'send-request';

  /**
   * Instruction to construct actual {@link Request}.
   */
  request: TransportRequest;
};

/**
 * Cancel HTTP request event.
 */
export type CancelRequestEvent = {
  type: 'cancel-request';

  /**
   * Identifier of request which should be cancelled.
   */
  identifier: string;
};

/**
 * List of known events from the PubNub Core.
 */
export type PubNubEvent = SetupEvent | SendRequestEvent | CancelRequestEvent;
// endregion

// region Web Worker
/**
 * {@link Request} processing start event.
 *
 * This event will be sent if {@link logVerbosity} set to `true` when worker will receive
 * {@link SendRequestEvent}.
 */
export type RequestSendingStart = {
  type: 'request-progress-start';

  /**
   * Url of request which has been sent.
   */
  url: string;

  /**
   * Key / value pairs of request which has been sent.
   */
  query?: Query;

  /**
   * When request processing started.
   */
  timestamp: string;
};
/**
 * {@link Request} processing completion event.
 *
 * This event will be sent if {@link logVerbosity} set to `true` when worker will receive
 * response from service or error.
 */
export type RequestSendingEnd = {
  type: 'request-progress-end';
  /**
   * Url of request which has been sent.
   */
  url: string;

  /**
   * Key / value pairs of request which has been sent.
   */
  query?: Query;

  /**
   * Stringified service response (if `Content-Type` allows it).
   */
  response: string | undefined;

  /**
   * How long it took to perform request.
   */
  duration: number;

  /**
   * When request processing ended.
   */
  timestamp: string;
};

/**
 * Request processing progress.
 */
export type RequestSendingProgress = RequestSendingStart | RequestSendingEnd;

/**
 * Request processing error.
 *
 * Object may include either service error response or client-side processing error object.
 */
export type RequestSendingError = {
  type: 'request-process-error';

  /**
   * Failed request identifier.
   */
  identifier: string;

  /**
   * Url which has been used to perform request.
   */
  url: string;

  /**
   * Service error response.
   */
  response?: RequestSendingSuccess['response'];

  /**
   * Client side request processing error.
   */
  error?: {
    /**
     * Name of error object which has been received.
     */
    name: string;

    /**
     * Available client-side errors.
     */
    type: 'NETWORK_ISSUE' | 'ABORTED' | 'TIMEOUT';

    /**
     * Triggered error message.
     */
    message: string;
  };
};

/**
 * Request processing success.
 */
export type RequestSendingSuccess = {
  type: 'request-process-success';

  /**
   * Processed request identifier.
   */
  identifier: string;

  /**
   * Url which has been used to perform request.
   */
  url: string;

  /**
   * Service success response.
   */
  response: {
    /**
     * Received {@link RequestSendingSuccess#response.body|body} content type.
     */
    contentType: string;

    /**
     * Received {@link RequestSendingSuccess#response.body|body} content length.
     */
    contentLength: number;

    /**
     * Response headers key / value pairs.
     */
    headers: Record<string, string>;

    /**
     * Response status code.
     */
    status: number;

    /**
     * Service response.
     */
    body?: ArrayBuffer;
  };
};

/**
 * Request processing results.
 */
export type RequestSendingResult = RequestSendingError | RequestSendingSuccess;

/**
 * List of known events from the PubNub Web Worker.
 */
export type PubNubWebWorkerEvent = RequestSendingProgress | RequestSendingResult;
// endregion
// endregion

/**
 * Map of request identifiers to their abort controllers.
 *
 * **Note:** Because of message-based nature of interaction it will be impossible to pass actual {@link AbortController}
 * to the transport provider code.
 */
const abortControllers: Map<string, AbortController> = new Map();
/**
 * Service `ArrayBuffer` response decoder.
 */
const decoder = new TextDecoder();

/**
 * Whether verbose logging enabled or not.
 */
let logVerbosity = false;

/**
 * If set to `true`, SDK will use the same TCP connection for each HTTP request, instead of
 * opening a new one for each new request.
 *
 * @default `true`
 */
let keepAlive = true;

// --------------------------------------------------------
// ------------------- Event Handlers ---------------------
// --------------------------------------------------------
// region Event Handlers
/**
 * Handle signals from the PubNub core.
 *
 * @param event - Event object from the PubNub Core with instructions for worker.
 */
self.onmessage = (event: MessageEvent<PubNubEvent>) => {
  const { data } = event;

  if (data.type === 'setup') {
    logVerbosity = data.logVerbosity;
    keepAlive = data.keepAlive;
  } else if (data.type === 'send-request') {
    sendRequestEventHandler(data.request);
  }

  if (data.type === 'cancel-request') {
    const controller = abortControllers.get(data.identifier);

    // Abort request if possible.
    if (controller) {
      abortControllers.delete(data.identifier);
      controller.abort();
    }
  }
  event.data;
};

/**
 * Handle request send event.
 *
 * @param req - Data for {@link Request} creation and scheduling.
 */
const sendRequestEventHandler = (req: TransportRequest) => {
  (async () => {
    const request = await requestFromTransportRequest(req);
    // Request progress support.
    const timestamp = new Date().toISOString();
    const start = new Date().getTime();

    if (req.cancellable) abortControllers.set(req.identifier, new AbortController());

    /**
     * Setup request timeout promise.
     *
     * **Note:** Native Fetch API doesn't support `timeout` out-of-box.
     */
    const requestTimeout = new Promise<Response>((_, reject) => {
      const timeoutId = setTimeout(() => {
        // Clean up.
        abortControllers.delete(req.identifier);
        clearTimeout(timeoutId);

        reject(new Error('Request timeout'));
      }, req.timeout * 1000);
    });
    if (logVerbosity) notifyRequestProcessing('start', request, timestamp, req.queryParameters);

    Promise.race([
      fetch(request, { signal: abortControllers.get(req.identifier)?.signal, keepalive: keepAlive }),
      requestTimeout,
    ])
      .then((response): Promise<[Response, ArrayBuffer]> | [Response, ArrayBuffer] =>
        response.arrayBuffer().then((buffer) => [response, buffer]),
      )
      .then((response) => {
        const responseBody = response[1].byteLength > 0 ? response[1] : undefined;
        if (logVerbosity && responseBody) {
          const contentType = response[0].headers.get('Content-Type');
          const timestampDone = new Date().toISOString();
          const now = new Date().getTime();
          const elapsed = now - start;
          let body: string | undefined;

          if (
            contentType &&
            (contentType.indexOf('text/javascript') !== -1 ||
              contentType.indexOf('application/json') !== -1 ||
              contentType.indexOf('text/plain') !== -1 ||
              contentType.indexOf('text/html') !== -1)
          ) {
            body = decoder.decode(responseBody);
          }

          notifyRequestProcessing('end', request, timestampDone, req.queryParameters, body, elapsed);
        }

        // Treat 4xx and 5xx status codes as errors.
        if (response[0].status >= 400)
          postMessage(requestProcessingError(req.identifier, request.url, undefined, response));
        else postMessage(requestProcessingSuccess(req.identifier, request.url, response));
      })
      .catch((error) => postMessage(requestProcessingError(req.identifier, request.url, error)));
  })();
};
// endregion

// --------------------------------------------------------
// ----------------------- Helpers ------------------------
// --------------------------------------------------------

// region Helpers
const notifyRequestProcessing = (
  type: 'start' | 'end',
  request: Request,
  timestamp: string,
  query?: Query,
  response?: string,
  duration?: number,
) => {
  let event: RequestSendingProgress;
  const [url] = request.url.split('?');

  if (type === 'start') {
    event = {
      type: 'request-progress-start',
      url,
      query,
      timestamp,
    };
  } else {
    event = {
      type: 'request-progress-end',
      url,
      query,
      response,
      timestamp,
      duration: duration!,
    };
  }

  postMessage(event);
};

/**
 * Create processing success event from service response.
 *
 * @param identifier - Identifier of the processed request.
 * @param url - Url which has been used to perform request.
 * @param res - Service response for used REST API endpoint along with response body.
 *
 * @returns Request processing success event object.
 */
const requestProcessingSuccess = (
  identifier: string,
  url: string,
  res: [Response, ArrayBuffer],
): RequestSendingSuccess => {
  const [response, body] = res;
  const responseBody = body.byteLength > 0 ? body : undefined;
  const contentLength = parseInt(response.headers.get('Content-Length') ?? '0', 10);
  const contentType = response.headers.get('Content-Type')!;
  const headers: Record<string, string> = {};

  // Copy Headers object content into plain Record.
  response.headers.forEach((value, key) => (headers[key] = value.toLowerCase()));

  return {
    type: 'request-process-success',
    identifier,
    url,
    response: {
      contentLength,
      contentType,
      headers,
      status: response.status,
      body: responseBody,
    },
  };
};

/**
 * Create processing error event from service response.
 *
 * @param identifier - Identifier of the failed request.
 * @param url - Url which has been used to perform request.
 * @param [error] - Client-side request processing error (for example network issues).
 * @param [res] - Service error response (for example permissions error or malformed
 * payload) along with service body.
 *
 * @returns Request processing error event object.
 */
const requestProcessingError = (
  identifier: string,
  url: string,
  error?: unknown,
  res?: [Response, ArrayBuffer],
): RequestSendingError => {
  // User service response as error information source.
  if (res) {
    return {
      ...requestProcessingSuccess(identifier, url, res),
      type: 'request-process-error',
    };
  }

  let type: NonNullable<RequestSendingError['error']>['type'] = 'NETWORK_ISSUE';
  let message = 'Unknown error';
  let name = 'Error';

  if (error && error instanceof Error) {
    message = error.message;
    name = error.name;
  }

  if (name === 'AbortError') {
    message = 'Request aborted';
    type = 'ABORTED';
  } else if (message === 'Request timeout') type = 'TIMEOUT';

  return {
    type: 'request-process-error',
    identifier,
    url,
    error: { name, type, message },
  };
};

/**
 * Creates a Request object from a given {@link TransportRequest} object.
 *
 * @param req - The {@link TransportRequest} object containing request information.
 *
 * @returns {@link Request} object generated from the {@link TransportRequest} object.
 */
const requestFromTransportRequest = async (req: TransportRequest): Promise<Request> => {
  let headers: Record<string, string> | undefined = undefined;
  let body: string | ArrayBuffer | FormData | undefined;
  let path = req.path;

  if (req.headers) {
    headers = {};
    for (const [key, value] of Object.entries(req.headers)) headers[key] = value;
  }

  if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
    path = `${path}?${queryStringFromObject(req.queryParameters)}`;

  if (req.body && typeof req.body === 'object') {
    if (req.body instanceof ArrayBuffer) body = req.body;
    else {
      // Create multipart request body.
      const fileData = await req.body.toArrayBuffer();
      const formData = new FormData();
      for (const [key, value] of Object.entries(req.formData ?? {})) formData.append(key, value);

      formData.append('file', new Blob([fileData], { type: req.body.mimeType }), req.body.name);
      body = formData;
    }
  } else body = req.body;

  return new Request(`${req.origin!}${path}`, {
    method: req.method,
    headers,
    redirect: 'follow',
    body,
  });
};

const queryStringFromObject = (query: Query) => {
  return Object.keys(query)
    .map((key) => {
      const queryValue = query[key];
      if (!Array.isArray(queryValue)) return `${key}=${encodeString(queryValue)}`;

      return queryValue.map((value) => `${key}=${encodeString(value)}`).join('&');
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
const encodeString = (input: string | number) => {
  return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
};
// endregion
