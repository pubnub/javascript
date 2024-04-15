/**
 * Subscription Service Worker Transport provider.
 *
 * Service worker provides support for PubNub subscription feature to give better user experience across
 * multiple opened pages.
 */

import { TransportRequest } from '../../core/types/transport-request';
import uuidGenerator from '../../core/components/uuid';
import { Payload, Query } from '../../core/types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types
// region Client-side

/**
 * Basic information for client and request group identification.
 */
type BasicEvent = {
  /**
   * Unique PubNub SDK client identifier for which setup is done.
   */
  clientIdentifier: string;

  /**
   * Subscribe REST API access key.
   */
  subscriptionKey: string;

  /**
   * Whether verbose logging enabled or not.
   */
  logVerbosity: boolean;
};

/**
 * Send HTTP request event.
 *
 * Request from Web Worker to schedule {@link Request} using provided {@link SendRequestSignal#request|request} data.
 */
export type SendRequestEvent = BasicEvent & {
  type: 'send-request';

  /**
   * Instruction to construct actual {@link Request}.
   */
  request: TransportRequest;
};

/**
 * Cancel HTTP request event.
 */
export type CancelRequestEvent = BasicEvent & {
  type: 'cancel-request';

  /**
   * Identifier of request which should be cancelled.
   */
  identifier: string;
};

/**
 * List of known events from the PubNub Core.
 */
export type ClientEvent = SendRequestEvent | CancelRequestEvent;
// endregion

// region Service Worker
/**
 * {@link Request} processing start event.
 *
 * This event will be sent if {@link logVerbosity} set to `true` when worker will receive
 * {@link SendRequestEvent}.
 */
export type RequestSendingStart = {
  type: 'request-progress-start';

  /**
   * Receiving PubNub client unique identifier.
   */
  clientIdentifier: string;

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
   * Receiving PubNub client unique identifier.
   */
  clientIdentifier: string;

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
   * Receiving PubNub client unique identifier.
   */
  clientIdentifier: string;

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
   * Receiving PubNub client unique identifier.
   */
  clientIdentifier: string;

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
 * List of known events from the PubNub Subscription Service Worker.
 */
export type ServiceWorkerEvent = RequestSendingProgress | RequestSendingResult;

/**
 * PubNub client state representation in Service Worker.
 */
type PubNubClientState = {
  /**
   * Unique PubNub client identifier.
   */
  clientIdentifier: string;

  /**
   * Subscribe REST API access key.
   */
  subscriptionKey: string;

  /**
   * Unique identifier of the user currently configured for the PubNub client.
   */
  userId: string;

  /**
   * Authorization key or access token which is used to access provided list of
   * {@link subscription.channels|channels} and {@link subscription.channelGroups|channelGroups}.
   */
  authKey?: string;

  /**
   * Whether verbose logging enabled or not.
   */
  logVerbosity: boolean;

  /**
   * Last time, PubNub client instance responded to the `ping` event.
   */
  lastAvailabilityCheck: number;

  /**
   * Current subscription session information.
   *
   * **Note:** Information updated each time when PubNub client instance schedule `subscribe` or
   * `unsubscribe` requests.
   */
  subscription: {
    /**
     * Subscription REST API uri path.
     *
     * **Note:** Keeping it for faster check whether client state should be updated or not.
     */
    path: string;

    /**
     * Channel groups list  representation from request query parameters.
     *
     * **Note:** Keeping it for faster check whether client state should be updated or not.
     */
    channelGroupQuery: string;

    /**
     * List of channels used in current subscription session.
     */
    channels: string[];

    /**
     * List of channel groups used in current subscription session.
     */
    channelGroups: string[];

    /**
     * Timetoken which used has been used with previous subscription session loop.
     */
    previousTimetoken: string;

    /**
     * Timetoken which used in current subscription session loop.
     */
    timetoken: string;

    /**
     * List of channel and / or channel group names for which state has been assigned.
     *
     * Information used during client information update to identify entries which should be removed.
     */
    objectsWithState: string[];

    /**
     * Subscribe request which has been emitted by PubNub client.
     *
     * Value will be reset when current request processing completed or client "disconnected" (not interested in
     * real-time updates).
     */
    request?: TransportRequest;

    /**
     * Identifier of subscribe request which has been actually sent by Service Worker.
     *
     * **Note:** Value not set if client not interested in any real-time updates.
     */
    serviceRequestId?: string;

    /**
     * Real-time events filtering expression.
     */
    filterExpression?: string;
  };
};
// endregion
// endregion

// --------------------------------------------------------
// ------------------- Service Worker ---------------------
// --------------------------------------------------------
// region Service Worker

declare const self: ServiceWorkerGlobalScope;

// region State
/**
 * Service `ArrayBuffer` response decoder.
 */
const decoder = new TextDecoder();

/**
 * Map of identifiers, scheduled by the Service Worker, to their abort controllers.
 *
 * **Note:** Because of message-based nature of interaction it will be impossible to pass actual {@link AbortController}
 * to the transport provider code.
 */
const abortControllers: Map<string, AbortController> = new Map();

/**
 * Map of PubNub client identifiers to their state in the current Service Worker.
 */
const pubNubClients: Record<string, PubNubClientState | undefined> = {};

/**
 * Per-subscription key list of PubNub client state.
 */
const pubNubClientsBySubscriptionKey: { [subscriptionKey: string]: PubNubClientState[] | undefined } = {};

/**
 * Per-subscription key presence state associated with unique user identifiers with which {@link pubNubClients|clients}
 * scheduled subscription request.
 */
const presenceState: {
  [subscriptionKey: string]:
    | {
        [userId: string]: Record<string, Payload | undefined> | undefined;
      }
    | undefined;
} = {};

/**
 * Per-subscription key map of client identifiers to the Service Worker {@link Client} identifier.
 *
 * Service Worker {@link Client} represent pages at which PubNub clients registered Service Workers.
 */
const serviceWorkerClients: {
  [subscriptionKey: string]: { [clientId: string]: string | undefined } | undefined;
} = {};

/**
 * List of ongoing subscription requests.
 *
 * **Node:** Identifiers differ from request identifiers received in {@link SendRequestEvent} object.
 */
const serviceRequests: {
  [requestId: string]: {
    /**
     * Unique active request identifier.
     */
    requestId: string;

    /**
     * Timetoken which is used for subscription loop.
     */
    timetoken: string;

    /**
     * List of channels used in current subscription session.
     */
    channels: string[];

    /**
     * List of channel groups used in current subscription session.
     */
    channelGroups: string[];
  };
} = {};
// endregion

// --------------------------------------------------------
// ------------------- Event Handlers ---------------------
// --------------------------------------------------------
// region Event Handlers

/**
 * Listen for Service Worker activation.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * Listen for events from the client.
 */
self.addEventListener('message', (event) => {
  // Ignoring requests sent from other service workers.
  if (!validateEventPayload(event)) return;

  const data = event.data as ClientEvent;

  if (data.type === 'send-request') {
    if (data.request.path.startsWith('/v2/subscribe')) {
      registerClientIfRequired(event);
      handleSendSubscribeRequestEvent(data);
    } else {
      if (!pubNubClients[data.clientIdentifier]) registerClientIfRequired(event);
      handleSendLeaveRequestEvent(event);
    }
  } else if (data.type === 'cancel-request') handleCancelRequestEvent(data);
});

/**
 * Handle client request to send subscription request.
 *
 * @param event - Subscription event details.
 */
const handleSendSubscribeRequestEvent = (event: SendRequestEvent) => {
  const requestOrId = subscribeTransportRequestFromEvent(event);
  const client = pubNubClients[event.clientIdentifier];

  if (client) notifyRequestProcessing('start', [client], new Date().toISOString());

  if (typeof requestOrId === 'string') {
    if (client) {
      // Updating client timetoken information.
      client.subscription.previousTimetoken = client.subscription.timetoken;
      client.subscription.timetoken = serviceRequests[requestOrId].timetoken;
      client.subscription.serviceRequestId = requestOrId;
    }
    return;
  }

  if (event.request.cancellable) abortControllers.set(requestOrId.identifier, new AbortController());

  sendRequest(
    requestOrId,
    () => clientsForRequest(requestOrId.identifier),
    (clients, response) => {
      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, response);

      // Clean up scheduled request and client references to it.
      markRequestCompleted(clients, requestOrId.identifier);
    },
    (clients, error) => {
      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, null, requestOrId, requestProcessingError(error));

      // Clean up scheduled request and client references to it.
      markRequestCompleted(clients, requestOrId.identifier);
    },
  );
};

const handleSendLeaveRequestEvent = (event: ExtendableMessageEvent) => {
  const data = event.data as SendRequestEvent;
  const request = leaveTransportRequestFromEvent(data);
  const client = pubNubClients[data.clientIdentifier];

  if (!client) return;
  if (!request) {
    const body = new TextEncoder().encode('{"status": 200, "action": "leave", "message": "OK", "service":"Presence"}');
    const headers = new Headers({ 'Content-Type': 'text/javascript; charset="UTF-8"', 'Content-Length': '74' });
    const response = new Response(body, { status: 200, headers });
    const result = requestProcessingSuccess([response, body]);
    result.url = `${data.request.origin}${data.request.path}`;
    result.clientIdentifier = data.clientIdentifier;
    result.identifier = data.request.identifier;

    publishClientEvent((event.source! as Client).id, result);
    return;
  }

  sendRequest(
    request,
    () => [client],
    (clients, response) => {
      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, response, data.request);
    },
    (clients, error) => {
      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, null, data.request, requestProcessingError(error));
    },
  );
};

/**
 * Handle cancel request event.
 *
 * Try cancel request if there is no other observers.
 *
 * @param event - Request cancellation event details.
 */
const handleCancelRequestEvent = (event: CancelRequestEvent) => {
  const client = pubNubClients[event.clientIdentifier];
  const serviceRequestId = client ? client.subscription.serviceRequestId : undefined;
  if (!client || !serviceRequestId) return;

  // Unset awaited requests.
  delete client.subscription.serviceRequestId;
  delete client.subscription.request;

  if (clientsForRequest(serviceRequestId).length === 0) {
    const controller = abortControllers.get(serviceRequestId);
    abortControllers.delete(serviceRequestId);

    // Clean up scheduled requests.
    delete serviceRequests[serviceRequestId];

    // Abort request if possible.
    if (controller) controller.abort();
  }
};
// endregion

// --------------------------------------------------------
// ------------------------ Common ------------------------
// --------------------------------------------------------
// region Common

/**
 * Process transport request.
 *
 * @param request - Transport request with required information for {@link Request} creation.
 * @param getClients - Request completion PubNub client observers getter.
 * @param success - Request success completion handler.
 * @param failure - Request failure handler.
 */
const sendRequest = (
  request: TransportRequest,
  getClients: () => PubNubClientState[],
  success: (clients: PubNubClientState[], response: [Response, ArrayBuffer]) => void,
  failure: (clients: PubNubClientState[], error: unknown) => void,
) => {
  (async () => {
    // Request progress support.
    const start = new Date().getTime();

    Promise.race([
      fetch(requestFromTransportRequest(request), {
        signal: abortControllers.get(request.identifier)?.signal,
        keepalive: true,
      }),
      requestTimeoutTimer(request.identifier, request.timeout),
    ])
      .then((response): Promise<[Response, ArrayBuffer]> | [Response, ArrayBuffer] =>
        response.arrayBuffer().then((buffer) => [response, buffer]),
      )
      .then((response) => {
        const responseBody = response[1].byteLength > 0 ? response[1] : undefined;

        const clients = getClients();
        if (clients.length === 0) return;

        notifyRequestProcessing(
          'end',
          clients,
          new Date().toISOString(),
          request,
          responseBody,
          response[0].headers.get('Content-Type'),
          new Date().getTime() - start,
        );

        success(clients, response);
      })
      .catch((error) => {
        const clients = getClients();
        if (clients.length === 0) return;

        failure(clients, error);
      });
  })();
};

/**
 * Create request timeout timer.
 *
 * **Note:** Native Fetch API doesn't support `timeout` out-of-box and {@link Promise} used to emulate it.
 *
 * @param requestId - Unique identifier of request which will time out after {@link requestTimeout} seconds.
 * @param requestTimeout - Number of seconds after which request with specified identifier will time out.
 *
 * @returns Promise which rejects after time out will fire.
 */
const requestTimeoutTimer = (requestId: string, requestTimeout: number) =>
  new Promise<Response>((_, reject) => {
    const timeoutId = setTimeout(() => {
      // Clean up.
      abortControllers.delete(requestId);
      clearTimeout(timeoutId);

      reject(new Error('Request timeout'));
    }, requestTimeout * 1000);
  });

/**
 * Retrieve list of PubNub clients which is pending for service worker request completion.
 *
 * @param identifier - Identifier of the subscription request which has been scheduled by the Service Worker.
 *
 * @returns List of PubNub client state objects for Service Worker.
 */
const clientsForRequest = (identifier: string) => {
  return Object.values(pubNubClients).filter(
    (client): client is PubNubClientState =>
      client !== undefined && client.subscription.serviceRequestId === identifier,
  );
};

/**
 * Clean up PubNub client states from ongoing request.
 *
 * Reset requested and scheduled request information to make PubNub client "free" for neext requests.
 *
 * @param clients - List of PubNub clients which awaited for scheduled request completion.
 * @param requestId - Unique subscribe request identifier for which {@link clients} has been provided.
 */
const markRequestCompleted = (clients: PubNubClientState[], requestId: string) => {
  delete serviceRequests[requestId];

  clients.forEach((client) => {
    delete client.subscription.request;
    delete client.subscription.serviceRequestId;
  });
};

/**
 * Creates a Request object from a given {@link TransportRequest} object.
 *
 * @param req - The {@link TransportRequest} object containing request information.
 *
 * @returns `Request` object generated from the {@link TransportRequest} object or `undefined` if no request
 * should be sent.
 */
const requestFromTransportRequest = (req: TransportRequest): Request => {
  let headers: Record<string, string> | undefined = undefined;
  const queryParameters = req.queryParameters;
  let path = req.path;

  if (req.headers) {
    headers = {};
    for (const [key, value] of Object.entries(req.headers)) headers[key] = value;
  }

  if (queryParameters && Object.keys(queryParameters).length !== 0)
    path = `${path}?${queryStringFromObject(queryParameters)}`;

  return new Request(`${req.origin!}${path}`, {
    method: req.method,
    headers,
    redirect: 'follow',
  });
};

/**
 * Construct transport request from send subscription request event.
 *
 * Update transport request to aggregate channels and groups if possible.
 *
 * @param event - Client's send subscription event request.
 *
 * @returns Final transport request or identifier from active request which will provide response to required
 * channels and groups.
 */
const subscribeTransportRequestFromEvent = (event: SendRequestEvent): TransportRequest | string => {
  const client = pubNubClients[event.clientIdentifier]!;
  const clients = clientsForSendSubscribeRequestEvent(client.subscription.previousTimetoken, event);
  const serviceRequestId = uuidGenerator.createUUID();
  const request = { ...event.request };

  if (clients.length > 1) {
    const activeRequestId = activeSubscriptionForEvent(clients, event);

    // Return identifier of the ongoing request.
    if (activeRequestId) return activeRequestId;

    const state = (presenceState[client.subscriptionKey] ?? {})[client.userId];
    const aggregatedState: Record<string, Payload> = {};
    const channelGroups = new Set(client.subscription.channelGroups);
    const channels = new Set(client.subscription.channels);

    if (state && client.subscription.objectsWithState.length) {
      client.subscription.objectsWithState.forEach((name) => {
        const objectState = state[name];
        if (objectState) aggregatedState[name] = objectState;
      });
    }

    for (const client of clients) {
      const { subscription } = client!;
      // Skip clients which already have active subscription request.
      if (subscription.serviceRequestId) continue;

      subscription.channelGroups.forEach(channelGroups.add, channelGroups);
      subscription.channels.forEach(channels.add, channels);

      // Set awaited service worker request identifier.
      subscription.serviceRequestId = serviceRequestId;

      if (!state) continue;

      subscription.objectsWithState.forEach((name) => {
        const objectState = state[name];

        if (objectState && !aggregatedState[name]) aggregatedState[name] = objectState;
      });
    }

    const serviceRequest = (serviceRequests[serviceRequestId] ??= {
      requestId: serviceRequestId,
      timetoken: (request.queryParameters!.tt as string) ?? '0',
      channelGroups: [],
      channels: [],
    });

    // Update request channels list (if required).
    if (channels.size) {
      serviceRequest.channels = Array.from(channels).sort();
      const pathComponents = request.path.split('/');
      pathComponents[4] = serviceRequest.channels.join(',');
      request.path = pathComponents.join('/');
    }

    // Update request channel groups list (if required).
    if (channelGroups.size) {
      serviceRequest.channelGroups = Array.from(channelGroups).sort();
      request.queryParameters!['channel-group'] = serviceRequest.channelGroups.join(',');
    }

    // Update request `state` (if required).
    if (Object.keys(aggregatedState).length) request.queryParameters!['state'] = JSON.stringify(aggregatedState);
  } else {
    serviceRequests[serviceRequestId] = {
      requestId: serviceRequestId,
      timetoken: (request.queryParameters!.tt as string) ?? '0',
      channelGroups: client.subscription.channelGroups,
      channels: client.subscription.channels,
    };
  }

  client.subscription.serviceRequestId = serviceRequestId;
  request.identifier = serviceRequestId;

  return request;
};

/**
 * Construct transport request from send leave request event.
 *
 * Filter out channels and groups, which is still in use by other PubNub client instances from leave request.
 *
 * @param event - Client's send leave event request.
 *
 * @returns Final transport request or `undefined` in case if there is no channels and groups for which request can be
 * done.
 */
const leaveTransportRequestFromEvent = (event: SendRequestEvent): TransportRequest | undefined => {
  const client = pubNubClients[event.clientIdentifier];
  const clients = clientsForSendLeaveRequestEvent(event);
  let channelGroups = channelGroupsFromRequest(event.request);
  let channels = channelsFromRequest(event.request);
  const request = { ...event.request };

  if (client) {
    const { subscription } = client;
    if (channels.length) subscription.channels = subscription.channels.filter((channel) => !channels.includes(channel));
    if (channelGroups.length) {
      subscription.channelGroups = subscription.channelGroups.filter((group) => !channelGroups.includes(group));
    }
  }

  // Filter out channels and groups which is still in use by the other PubNub client instances.
  for (const client of clients) {
    if (client.clientIdentifier === event.clientIdentifier) continue;
    if (channels.length) channels = channels.filter((channel) => !client.subscription.channels.includes(channel));
    if (channelGroups.length)
      channelGroups = channelGroups.filter((group) => !client.subscription.channelGroups.includes(group));
  }

  if (channels.length === 0 && channelGroups.length === 0) return undefined;

  // Update request channels list (if required).
  if (channels.length) {
    const pathComponents = request.path.split('/');
    pathComponents[4] = channels.join(',');
    request.path = pathComponents.join('/');
  }

  // Update request channel groups list (if required).
  if (channelGroups.length) request.queryParameters!['channel-group'] = channelGroups.join(',');

  return request;
};

/**
 * Send event to all service worker clients.
 *
 * @param identifier - Service Worker receiving {@link Client} identifier.
 * @param event - Service worker event object.
 */
const publishClientEvent = (identifier: string, event: ServiceWorkerEvent) => {
  self.clients.get(identifier).then((client) => {
    if (!client) return;
    client.postMessage(event);
  });
};

/**
 * Send request processing update.
 *
 * @param type - Type of processing event.
 * @param clients - List of PubNub clients which should be notified about request progress.
 * @param timestamp - Date and time when request processing update happened.
 * @param [request] - Processed request information.
 * @param [responseBody] - PubNub service response.
 * @param [contentType] - PubNub service response content type.
 * @param [duration] - How long it took to complete request.
 */
const notifyRequestProcessing = (
  type: 'start' | 'end',
  clients: PubNubClientState[],
  timestamp: string,
  request?: TransportRequest,
  responseBody?: ArrayBuffer,
  contentType?: string | null,
  duration?: number,
) => {
  if (clients.length === 0) return;

  const clientIds = serviceWorkerClients[clients[0].subscriptionKey] ?? {};
  let event: RequestSendingProgress;

  if (type === 'start') {
    event = {
      type: 'request-progress-start',
      clientIdentifier: '',
      url: '',
      timestamp,
    };
  } else {
    let response: string | undefined;
    if (
      responseBody &&
      contentType &&
      (contentType.indexOf('text/javascript') !== -1 ||
        contentType.indexOf('application/json') !== -1 ||
        contentType.indexOf('text/plain') !== -1 ||
        contentType.indexOf('text/html') !== -1)
    ) {
      response = decoder.decode(responseBody);
    }

    event = {
      type: 'request-progress-end',
      clientIdentifier: '',
      url: '',
      response,
      timestamp,
      duration: duration!,
    };
  }

  clients.forEach((client) => {
    const serviceWorkerClientId = clientIds[client.clientIdentifier];
    const { request: clientRequest } = client.subscription;
    const decidedRequest = clientRequest ?? request;

    if (client.logVerbosity && serviceWorkerClientId && decidedRequest) {
      publishClientEvent(serviceWorkerClientId, {
        ...event,
        clientIdentifier: client.clientIdentifier,
        url: `${decidedRequest.origin}${decidedRequest.path}`,
        query: decidedRequest.queryParameters,
      });
    }
  });
};

/**
 * Send request processing result event.
 *
 * @param clients - List of PubNub clients which should be notified about request result.
 * @param [response] - PubNub service response.
 * @param [request] - Processed request information.
 * @param [result] - Explicit request processing result which should be notified.
 */
const notifyRequestProcessingResult = (
  clients: PubNubClientState[],
  response: [Response, ArrayBuffer] | null,
  request?: TransportRequest,
  result?: RequestSendingResult,
) => {
  if (clients.length === 0) return;
  if (!result && !response) return;

  const clientIds = serviceWorkerClients[clients[0].subscriptionKey] ?? {};

  if (!result && response) {
    result =
      response[0].status >= 400
        ? // Treat 4xx and 5xx status codes as errors.
          requestProcessingError(undefined, response)
        : requestProcessingSuccess(response);
  }

  clients.forEach((client) => {
    const serviceWorkerClientId = clientIds[client.clientIdentifier];
    const { request: clientRequest } = client.subscription;
    const decidedRequest = clientRequest ?? request;

    if (serviceWorkerClientId && decidedRequest) {
      publishClientEvent(serviceWorkerClientId, {
        ...result!,
        clientIdentifier: client.clientIdentifier,
        identifier: decidedRequest.identifier,
        url: `${decidedRequest.origin}${decidedRequest.path}`,
      });
    }
  });
};

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
const requestProcessingSuccess = (res: [Response, ArrayBuffer]): RequestSendingSuccess => {
  const [response, body] = res;
  const responseBody = body.byteLength > 0 ? body : undefined;
  const contentLength = parseInt(response.headers.get('Content-Length') ?? '0', 10);
  const contentType = response.headers.get('Content-Type')!;
  const headers: Record<string, string> = {};

  // Copy Headers object content into plain Record.
  response.headers.forEach((value, key) => (headers[key] = value.toLowerCase()));

  return {
    type: 'request-process-success',
    clientIdentifier: '',
    identifier: '',
    url: '',
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
 * **Note:** The rest of information like `clientIdentifier`,`identifier`, and `url` will be added later for each
 * specific PubNub client state.
 *
 * @param [error] - Client-side request processing error (for example network issues).
 * @param [res] - Service error response (for example permissions error or malformed
 * payload) along with service body.
 *
 * @returns Request processing error event object.
 */
const requestProcessingError = (error?: unknown, res?: [Response, ArrayBuffer]): RequestSendingError => {
  // User service response as error information source.
  if (res) {
    return {
      ...requestProcessingSuccess(res),
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
    clientIdentifier: '',
    identifier: '',
    url: '',
    error: { name, type, message },
  };
};
// endregion

// --------------------------------------------------------
// ----------------------- Helpers ------------------------
// --------------------------------------------------------
// region Helpers

/**
 * Register client if it didn't use Service Worker before.
 *
 * The registration process updates the Service Worker state with information about channels and groups in which
 * particular PubNub clients are interested, and uses this information when another subscribe request is made to build
 * shared  requests.
 *
 * @param event - Base information about PubNub client instance and Service Worker {@link Client}.
 */
const registerClientIfRequired = (event: ExtendableMessageEvent) => {
  const information = event.data as SendRequestEvent;
  const { clientIdentifier } = information;
  const query = information.request.queryParameters!;

  let client = pubNubClients[clientIdentifier];

  if (!client) {
    const isPresenceLeave = !information.request.path.startsWith('/v2/subscribe');
    const channelGroupQuery = !isPresenceLeave ? ((query!['channel-group'] ?? '') as string) : '';
    const state = !isPresenceLeave ? ((query.state ?? '') as string) : '';

    client = pubNubClients[clientIdentifier] = {
      clientIdentifier,
      subscriptionKey: information.subscriptionKey,
      userId: query.uuid as string,
      authKey: (query.auth ?? '') as string,
      logVerbosity: information.logVerbosity,
      lastAvailabilityCheck: new Date().getTime(),
      subscription: {
        path: !isPresenceLeave ? information.request.path : '',
        channelGroupQuery: !isPresenceLeave ? channelGroupQuery : '',
        channels: !isPresenceLeave ? channelsFromRequest(information.request) : [],
        channelGroups: !isPresenceLeave ? channelGroupsFromRequest(information.request) : [],
        previousTimetoken: !isPresenceLeave ? ((query.tt ?? '0') as string) : '0',
        timetoken: !isPresenceLeave ? ((query.tt ?? '0') as string) : '0',
        request: !isPresenceLeave ? information.request : undefined,
        objectsWithState: [],
        filterExpression: !isPresenceLeave ? ((query['filter-expr'] ?? '') as string) : undefined,
      },
    };

    if (!isPresenceLeave && state.length > 0) {
      const parsedState = JSON.parse(state) as Record<string, Payload>;
      const userState = ((presenceState[client.subscriptionKey] ??= {})[client.userId] ??= {});

      Object.entries(parsedState).forEach(([objectName, value]) => (userState[objectName] = value));
      client.subscription.objectsWithState = Object.keys(parsedState);
    }

    // Map registered PubNub client to its subscription key.
    const clientsBySubscriptionKey = (pubNubClientsBySubscriptionKey[information.subscriptionKey] ??= []);
    if (clientsBySubscriptionKey.every((entry) => entry.clientIdentifier !== clientIdentifier))
      clientsBySubscriptionKey.push(client);

    // Binding PubNub client to the page (Service Worker Client).
    (serviceWorkerClients[information.subscriptionKey] ??= {})[clientIdentifier] = (event.source! as Client).id;
  } else {
    const channelGroupQuery = (query!['channel-group'] ?? '') as string;
    const state = (query.state ?? '') as string;
    client.subscription.filterExpression = (query['filter-expr'] ?? '') as string;
    client.subscription.previousTimetoken = client.subscription.timetoken;
    client.subscription.timetoken = (query.tt ?? '0') as string;
    client.lastAvailabilityCheck = new Date().getTime();
    client.subscription.request = information.request;
    client.authKey = (query.auth ?? '') as string;
    client.userId = query.uuid as string;

    if (client.subscription.path !== information.request.path) {
      client.subscription.path = information.request.path;
      client.subscription.channels = channelsFromRequest(information.request);
    }

    if (client.subscription.channelGroupQuery !== channelGroupQuery) {
      client.subscription.channelGroupQuery = channelGroupQuery;
      client.subscription.channelGroups = channelGroupsFromRequest(information.request);
    }

    if (state.length > 0) {
      const parsedState = JSON.parse(state) as Record<string, Payload>;
      const userState = ((presenceState[client.subscriptionKey] ??= {})[client.userId] ??= {});
      Object.entries(parsedState).forEach(([objectName, value]) => (userState[objectName] = value));

      // Clean up state for objects where presence state has been reset.
      for (const objectName of client.subscription.objectsWithState)
        if (!parsedState[objectName]) delete userState[objectName];
      client.subscription.objectsWithState = Object.keys(parsedState);
    }
    // Handle potential presence state reset.
    else if (client.subscription.objectsWithState.length) {
      const userState = ((presenceState[client.subscriptionKey] ??= {})[client.userId] ??= {});

      for (const objectName of client.subscription.objectsWithState) delete userState[objectName];
      client.subscription.objectsWithState = [];
    }
  }
};

/**
 * Validate received event payload.
 */
const validateEventPayload = (event: ExtendableMessageEvent): boolean => {
  if (!event.source || !(event.source instanceof Client)) return false;
  const data = event.data as ClientEvent;

  const { clientIdentifier, subscriptionKey, logVerbosity } = data as ClientEvent;
  if (logVerbosity === undefined || typeof logVerbosity !== 'boolean') return false;
  if (!clientIdentifier || typeof clientIdentifier !== 'string') return false;

  return !(!subscriptionKey || typeof subscriptionKey !== 'string');
};

/**
 * Search for active subscription for one of the passed {@link serviceWorkerClients}.
 *
 * @param activeClients - List of suitable registered PubNub clients.
 * @param event - Send Subscriber Request event data.
 *
 * @returns Unique identifier of the active request which will receive real-time updates for channels and groups
 * requested in received subscription request or `undefined` if none of active (or not scheduled) request can be used.
 */
const activeSubscriptionForEvent = (
  activeClients: PubNubClientState[],
  event: SendRequestEvent,
): string | undefined => {
  const query = event.request.queryParameters!;
  const channelGroupQuery = (query['channel-group'] ?? '') as string;
  const requestPath = event.request.path;
  let channelGroups: string[] | undefined;
  let channels: string[] | undefined;

  for (const client of activeClients) {
    const { subscription } = client;
    // Skip PubNub clients which doesn't await for subscription response.
    if (!subscription.serviceRequestId) continue;

    if (subscription.path === requestPath && subscription.channelGroupQuery === channelGroupQuery) {
      return subscription.serviceRequestId;
    } else {
      const scheduledRequest = serviceRequests[subscription.serviceRequestId];
      if (!channelGroups) channelGroups = channelGroupsFromRequest(event.request);
      if (!channels) channels = channelsFromRequest(event.request);

      // Checking whether all required channels and groups are handled already by active request or not.
      if (channels.length && !includesStrings(scheduledRequest.channels, channels)) continue;
      if (channelGroups.length && !includesStrings(scheduledRequest.channelGroups, channelGroups)) continue;

      return subscription.serviceRequestId;
    }
  }

  return undefined;
};

/**
 * Find PubNub client states with configuration compatible with the one in request.
 *
 * Method allow to find information about all PubNub client instances which use same:
 * - subscription key
 * - `userId`
 * - `auth` key
 * - `filter expression`
 * - `timetoken` (compare should be done against previous timetoken of the client which requested new subscribe).
 *
 * @param timetoken - Previous timetoken used by the PubNub client which requested to send new subscription request
 * (it will be the same as 'current' timetoken of the other PubNub clients).
 * @param event - Send subscribe request event information.
 *
 * @returns List of PubNub client states which works from other pages for the same user.
 */
const clientsForSendSubscribeRequestEvent = (timetoken: string, event: SendRequestEvent) => {
  const query = event.request.queryParameters!;
  const filterExpression = (query['filter-expr'] ?? '') as string;
  const authKey = (query.auth ?? '') as string;
  const userId = query.uuid! as string;

  return (pubNubClientsBySubscriptionKey[event.subscriptionKey] ?? []).filter(
    (client) =>
      client.userId === userId &&
      client.authKey === authKey &&
      client.subscription.filterExpression === filterExpression &&
      (timetoken === '0' ||
        client.subscription.previousTimetoken === '0' ||
        client.subscription.previousTimetoken === timetoken),
  );
};

/**
 * Find PubNub client states with configuration compatible with the one in request.
 *
 * Method allow to find information about all PubNub client instances which use same:
 * - subscription key
 * - `userId`
 * - `auth` key
 *
 * @param event - Send leave request event information.
 *
 * @returns List of PubNub client states which works from other pages for the same user.
 */
const clientsForSendLeaveRequestEvent = (event: SendRequestEvent) => {
  const query = event.request.queryParameters!;
  const authKey = (query.auth ?? '') as string;
  const userId = query.uuid! as string;

  return (pubNubClientsBySubscriptionKey[event.subscriptionKey] ?? []).filter(
    (client) => client.userId === userId && client.authKey === authKey,
  );
};

/**
 * Extract list of channels from request URI path.
 *
 * @param request - Transport request which should provide `path` for parsing.
 *
 * @returns List of channel names (not percent-decoded) for which `subscribe` or `leave` has been called.
 */
const channelsFromRequest = (request: TransportRequest): string[] => {
  const channels = request.path.split('/')[request.path.startsWith('/v2/subscribe/') ? 4 : 6];
  return channels === ',' ? [] : channels.split(',').filter((name) => name.length > 0);
};

/**
 * Extract list of channel groups from request query.
 *
 * @param request - Transport request which should provide `query` for parsing.
 *
 * @returns List of channel group names (not percent-decoded) for which `subscribe` or `leave` has been called.
 */
const channelGroupsFromRequest = (request: TransportRequest): string[] => {
  const group = (request.queryParameters!['channel-group'] ?? '') as string;
  return group.length === 0 ? [] : group.split(',').filter((name) => name.length > 0);
};

/**
 * Check whether {@link main} array contains all entries from {@link sub} array.
 *
 * @param main - Main array with which `intersection` with {@link sub} should be checked.
 * @param sub - Sub-array whose values should be checked in {@link main}.
 *
 * @returns `true` if all entries from {@link sub} is present in {@link main}.
 */
const includesStrings = (main: string[], sub: string[]) => {
  const set = new Set(main);
  return sub.every(set.has, set);
};

/**
 * Stringify request query key / value pairs.
 *
 * @param query - Request query object.
 *
 * @returns Stringified query object.
 */
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
// endregion
