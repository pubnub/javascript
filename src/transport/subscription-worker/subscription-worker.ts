/// <reference lib="webworker" />
/**
 * Subscription Service Worker Transport provider.
 *
 * Service worker provides support for PubNub subscription feature to give better user experience across
 * multiple opened pages.
 *
 * @internal
 */

import { TransportMethod, TransportRequest } from '../../core/types/transport-request';
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
   * Interval at which Shared Worker should check whether PubNub instances which used it still active or not.
   */
  workerOfflineClientsCheckInterval?: number;

  /**
   * Whether `leave` request should be sent for _offline_ PubNub client or not.
   */
  workerUnsubscribeOfflineClients?: boolean;

  /**
   * Whether verbose logging should be enabled for `Subscription` worker should print debug messages or not.
   */
  workerLogVerbosity?: boolean;
};

/**
 * PubNub client registration event.
 */
export type RegisterEvent = BasicEvent & {
  type: 'client-register';

  /**
   * Unique identifier of the user for which PubNub SDK client has been created.
   */
  userId: string;

  /**
   * How often the client will announce itself to server. The value is in seconds.
   *
   * @default `not set`
   */
  heartbeatInterval?: number;

  /**
   * Specific PubNub client instance communication port.
   */
  port?: MessagePort;
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

  /**
   * Pre-processed access token (If set).
   */
  token?: PubNubClientState['accessToken'];
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
 * Client response on PING request.
 */
export type PongEvent = BasicEvent & {
  type: 'client-pong';
};

/**
 * PubNub client remove registration event.
 *
 * On registration removal ongoing long-long poll request will be cancelled.
 */
export type UnRegisterEvent = BasicEvent & {
  type: 'client-unregister';
};

/**
 * List of known events from the PubNub Core.
 */
export type ClientEvent = RegisterEvent | PongEvent | SendRequestEvent | CancelRequestEvent | UnRegisterEvent;
// endregion

// region Subscription Worker
/**
 * Shared subscription worker connected event.
 *
 * Event signal shared worker client that worker can be used.
 */
export type SharedWorkerConnected = {
  type: 'shared-worker-connected';
};

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
 * Send message to debug console.
 */
export type SharedWorkerConsoleLog = {
  type: 'shared-worker-console-log';

  /**
   * Message which should be printed into the console.
   */
  message: string;
};
/**
 * Send message to debug console.
 */
export type SharedWorkerConsoleDir = {
  type: 'shared-worker-console-dir';

  /**
   * Message which should be printed into the console before {@link data}.
   */
  message?: string;

  /**
   * Data which should be printed into the console.
   */
  data: Payload;
};

/**
 * Shared worker console output request.
 */
export type SharedWorkerConsole = SharedWorkerConsoleLog | SharedWorkerConsoleDir;

/**
 * Shared worker client ping request.
 *
 * Ping used to discover disconnected PubNub instances.
 */
export type SharedWorkerPing = {
  type: 'shared-worker-ping';
};

/**
 * List of known events from the PubNub Subscription Service Worker.
 */
export type SubscriptionWorkerEvent =
  | SharedWorkerConnected
  | SharedWorkerConsole
  | SharedWorkerPing
  | RequestSendingResult;

/**
 * PubNub client state representation in Shared Worker.
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
   * Aggregateable {@link authKey} representation.
   *
   * Representation based on information stored in `resources`, `patterns`, and `authorized_uuid`.
   */
  accessToken?: {
    token: string;
    expiration: number;
  };

  /**
   * Origin which is used to access PubNub REST API.
   */
  origin?: string;

  /**
   * PubNub JS SDK identification string.
   */
  pnsdk?: string;

  /**
   * How often the client will announce itself to server. The value is in seconds.
   *
   * @default `not set`
   */
  heartbeatInterval?: number;

  /**
   * Whether instance registered for the first time or not.
   */
  newlyRegistered: boolean;

  /**
   * Interval at which Shared Worker should check whether PubNub instances which used it still active or not.
   */
  offlineClientsCheckInterval?: number;

  /**
   * Whether `leave` request should be sent for _offline_ PubNub client or not.
   */
  unsubscribeOfflineClients?: boolean;

  /**
   * Whether client should log Shared Worker logs or not.
   */
  workerLogVerbosity?: boolean;

  /**
   * Last time when PING request has been sent.
   */
  lastPingRequest?: number;

  /**
   * Last time when PubNub client respond with PONG event.
   */
  lastPongEvent?: number;

  /**
   * Current subscription session information.
   *
   * **Note:** Information updated each time when PubNub client instance schedule `subscribe` or
   * `unsubscribe` requests.
   */
  subscription?: {
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
     * Timetoken region which used in current subscription session loop.
     */
    region?: string;

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

  heartbeat?: {
    /**
     * List of channels for which user's presence has been announced by the PubNub client.
     */
    channels: string[];

    /**
     * List of channel groups for which user's presence has been announced by the PubNub client.
     */
    channelGroups: string[];

    /**
     * Presence state associated with user at specified list of channels and groups.
     *
     * Per-channel/group state associated with specific user.
     */
    presenceState?: Record<string, Payload | undefined>;
  };
};
// endregion
// endregion

// --------------------------------------------------------
// ------------------- Service Worker ---------------------
// --------------------------------------------------------
// region Service Worker

declare const self: SharedWorkerGlobalScope;

/**
 * Aggregation timer timeout.
 *
 * Timeout used by the timer to postpone `handleSendSubscribeRequestEvent` function call and let other clients for
 * same subscribe key send next subscribe loop request (to make aggregation more efficient).
 */
const subscribeAggregationTimeout = 50;

/**
 * Map of clients aggregation keys to the started aggregation timeout timers with client and event information.
 */
const aggregationTimers: Map<string, [[PubNubClientState, SendRequestEvent][], NodeJS.Timeout]> = new Map();

// region State
/**
 * Per-subscription key map of "offline" clients detection timeouts.
 */
const pingTimeouts: { [subscriptionKey: string]: number | undefined } = {};

/**
 * Unique shared worker instance identifier.
 */
const sharedWorkerIdentifier = uuidGenerator.createUUID();

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
 * Per-subscription key map of heartbeat request configurations recently used for user.
 */
const serviceHeartbeatRequests: {
  [subscriptionKey: string]:
    | {
        [userId: string]:
          | {
              channels: string[];
              channelGroups: string[];
              timestamp: number;
              clientIdentifier?: string;
              response?: [Response, ArrayBuffer];
            }
          | undefined;
      }
    | undefined;
} = {};

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
 * Per-subscription key map of client identifiers to the Shared Worker {@link MessagePort}.
 *
 * Shared Worker {@link MessagePort} represent specific PubNub client which connected to the Shared Worker.
 */
const sharedWorkerClients: {
  [subscriptionKey: string]: { [clientId: string]: MessagePort | undefined } | undefined;
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
     * Timetoken region which is used for subscription loop.
     */
    region?: string;

    /**
     * Timetoken override which is used after initial subscription to catch up on previous messages.
     */
    timetokenOverride?: string;

    /**
     * Timetoken region override which is used after initial subscription to catch up on previous messages.
     */
    regionOverride?: string;

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
 * Handle new PubNub client 'connection'.
 *
 * Echo listeners to let `SharedWorker` users that it is ready.
 *
 * @param event - Remote `SharedWorker` client connection event.
 */
self.onconnect = (event) => {
  consoleLog('New PubNub Client connected to the Subscription Shared Worker.');

  event.ports.forEach((receiver) => {
    receiver.start();

    receiver.onmessage = (event: MessageEvent<ClientEvent>) => {
      // Ignoring unknown event payloads.
      if (!validateEventPayload(event)) return;

      const data = event.data as ClientEvent;

      if (data.type === 'client-register') {
        // Appending information about messaging port for responses.
        data.port = receiver;
        registerClientIfRequired(data);

        consoleLog(`Client '${data.clientIdentifier}' registered with '${sharedWorkerIdentifier}' shared worker`);
      } else if (data.type === 'client-unregister') unRegisterClient(data);
      else if (data.type === 'client-pong') handleClientPong(data);
      else if (data.type === 'send-request') {
        if (data.request.path.startsWith('/v2/subscribe')) {
          updateClientSubscribeStateIfRequired(data);

          const client = pubNubClients[data.clientIdentifier];
          if (client) {
            // Check whether there are more clients which may schedule next subscription loop and they need to be
            // aggregated or not.
            const timerIdentifier = aggregateTimerId(client);
            let enqueuedClients: [PubNubClientState, SendRequestEvent][] = [];

            if (aggregationTimers.has(timerIdentifier)) enqueuedClients = aggregationTimers.get(timerIdentifier)![0];
            enqueuedClients.push([client, data]);

            // Check whether we need to start new aggregation timer or not.
            if (!aggregationTimers.has(timerIdentifier)) {
              const aggregationTimer = setTimeout(() => {
                handleSendSubscribeRequestEventForClients(enqueuedClients, data);
                aggregationTimers.delete(timerIdentifier);
              }, subscribeAggregationTimeout);

              aggregationTimers.set(timerIdentifier, [enqueuedClients, aggregationTimer]);
            }
          }
        } else if (data.request.path.endsWith('/heartbeat')) {
          updateClientHeartbeatState(data);
          handleHeartbeatRequestEvent(data);
        } else handleSendLeaveRequestEvent(data);
      } else if (data.type === 'cancel-request') handleCancelRequestEvent(data);
    };

    receiver.postMessage({ type: 'shared-worker-connected' });
  });
};

/**
 * Handle aggregated clients request to send subscription request.
 *
 * @param clients - List of aggregated clients which would like to send subscription requests.
 * @param event - Subscription event details.
 */
const handleSendSubscribeRequestEventForClients = (
  clients: [PubNubClientState, SendRequestEvent][],
  event: SendRequestEvent,
) => {
  const requestOrId = subscribeTransportRequestFromEvent(event);
  const client = pubNubClients[event.clientIdentifier];

  if (!client) return;

  // Getting rest of aggregated clients.
  clients = clients.filter((aggregatedClient) => aggregatedClient[0].clientIdentifier !== client.clientIdentifier);
  handleSendSubscribeRequestForClient(client, event, requestOrId, true);
  clients.forEach(([aggregatedClient, clientEvent]) =>
    handleSendSubscribeRequestForClient(aggregatedClient, clientEvent, requestOrId, false),
  );
};

/**
 * Handle subscribe request by single client.
 *
 * @param client - Client which processes `request`.
 * @param event - Subscription event details.
 * @param requestOrId - New aggregated request object or its identifier (if already scheduled).
 * @param requestOrigin - Whether `client` is the one who triggered subscribe request or not.
 */
const handleSendSubscribeRequestForClient = (
  client: PubNubClientState,
  event: SendRequestEvent,
  requestOrId: ReturnType<typeof subscribeTransportRequestFromEvent>,
  requestOrigin: boolean,
) => {
  let isInitialSubscribe = false;
  if (!requestOrigin && typeof requestOrId !== 'string') requestOrId = requestOrId.identifier;

  if (client.subscription) isInitialSubscribe = client.subscription.timetoken === '0';

  if (typeof requestOrId === 'string') {
    const scheduledRequest = serviceRequests[requestOrId];

    if (client) {
      if (client.subscription) {
        // Updating client timetoken information.
        client.subscription.timetoken = scheduledRequest.timetoken;
        client.subscription.region = scheduledRequest.region;
        client.subscription.serviceRequestId = requestOrId;
      }

      if (!isInitialSubscribe) return;

      const body = new TextEncoder().encode(
        `{"t":{"t":"${scheduledRequest.timetoken}","r":${scheduledRequest.region ?? '0'}},"m":[]}`,
      );
      const headers = new Headers({
        'Content-Type': 'text/javascript; charset="UTF-8"',
        'Content-Length': `${body.length}`,
      });
      const response = new Response(body, { status: 200, headers });
      const result = requestProcessingSuccess([response, body]);
      result.url = `${event.request.origin}${event.request.path}`;
      result.clientIdentifier = event.clientIdentifier;
      result.identifier = event.request.identifier;

      publishClientEvent(client, result);
    }
    return;
  }

  if (event.request.cancellable) abortControllers.set(requestOrId.identifier, new AbortController());
  const scheduledRequest = serviceRequests[requestOrId.identifier];
  const { timetokenOverride, regionOverride } = scheduledRequest;

  sendRequest(
    requestOrId,
    () => clientsForRequest(requestOrId.identifier),
    (clients, response) => {
      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, response, event.request);

      // Clean up scheduled request and client references to it.
      markRequestCompleted(clients, requestOrId.identifier);
    },
    (clients, error) => {
      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, null, event.request, requestProcessingError(error));

      // Clean up scheduled request and client references to it.
      markRequestCompleted(clients, requestOrId.identifier);
    },
    (response) => {
      let serverResponse = response;
      if (isInitialSubscribe && timetokenOverride && timetokenOverride !== '0') {
        serverResponse = patchInitialSubscribeResponse(serverResponse, timetokenOverride, regionOverride);
      }

      return serverResponse;
    },
  );

  consoleLog(`'${Object.keys(serviceRequests).length}' subscription request currently active.`);
};

const patchInitialSubscribeResponse = (
  serverResponse: [Response, ArrayBuffer],
  timetoken?: string,
  region?: string,
): [Response, ArrayBuffer] => {
  if (timetoken === undefined || timetoken === '0' || serverResponse[0].status >= 400) {
    return serverResponse;
  }

  let json: { t: { t: string; r: number }; m: Record<string, unknown>[] };
  const response = serverResponse[0];
  let decidedResponse = response;
  let body = serverResponse[1];

  try {
    json = JSON.parse(new TextDecoder().decode(body));
  } catch (error) {
    consoleLog(`Subscribe response parse error: ${error}`);
    return serverResponse;
  }

  // Replace server-provided timetoken.
  json.t.t = timetoken;
  if (region) json.t.r = parseInt(region, 10);

  try {
    body = new TextEncoder().encode(JSON.stringify(json)).buffer;
    if (body.byteLength) {
      const headers = new Headers(response.headers);
      headers.set('Content-Length', `${body.byteLength}`);

      // Create a new response with the original response options and modified headers
      decidedResponse = new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
      });
    }
  } catch (error) {
    consoleLog(`Subscribe serialization error: ${error}`);
    return serverResponse;
  }

  return body.byteLength > 0 ? [decidedResponse, body] : serverResponse;
};

/**
 * Handle client heartbeat request.
 *
 * @param event - Heartbeat event details.
 */
const handleHeartbeatRequestEvent = (event: SendRequestEvent) => {
  const client = pubNubClients[event.clientIdentifier];
  const request = heartbeatTransportRequestFromEvent(event);

  if (!client) return;
  const heartbeatRequestKey = `${client.userId}_${clientAggregateAuthKey(client) ?? ''}`;
  const hbRequestsBySubscriptionKey = serviceHeartbeatRequests[client.subscriptionKey];
  const hbRequests = (hbRequestsBySubscriptionKey ?? {})[heartbeatRequestKey];

  if (!request) {
    consoleLog(
      `Previous heartbeat request has been sent less than ${client.heartbeatInterval} seconds ago. Skipping...`,
      client,
    );

    let response: Response | undefined;
    let body: ArrayBuffer | undefined;

    // Pulling out previous response.
    if (hbRequests && hbRequests.response) [response, body] = hbRequests.response;

    if (!response) {
      body = new TextEncoder().encode('{ "status": 200, "message": "OK", "service": "Presence" }').buffer;
      const headers = new Headers({
        'Content-Type': 'text/javascript; charset="UTF-8"',
        'Content-Length': `${body.byteLength}`,
      });

      response = new Response(body, { status: 200, headers });
    }

    const result = requestProcessingSuccess([response, body!]);
    result.url = `${event.request.origin}${event.request.path}`;
    result.clientIdentifier = event.clientIdentifier;
    result.identifier = event.request.identifier;

    publishClientEvent(client, result);
    return;
  }

  sendRequest(
    request,
    () => [client],
    (clients, response) => {
      if (hbRequests) hbRequests.response = response;

      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, response, event.request);
    },
    (clients, error) => {
      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, null, event.request, requestProcessingError(error));
    },
  );

  consoleLog(`Started heartbeat request.`, client);
};

/**
 * Handle client request to leave request.
 *
 * @param data - Leave event details.
 * @param [client] - Specific client to handle leave request.
 */
const handleSendLeaveRequestEvent = (data: SendRequestEvent, client?: PubNubClientState) => {
  client = client ?? pubNubClients[data.clientIdentifier];
  const request = leaveTransportRequestFromEvent(data);

  if (!client) return;
  // Clean up client subscription information if there is no more channels / groups to use.
  const { subscription, heartbeat } = client;
  const serviceRequestId = subscription?.serviceRequestId;
  if (subscription && subscription.channels.length === 0 && subscription.channelGroups.length === 0) {
    subscription.channelGroupQuery = '';
    subscription.path = '';
    subscription.previousTimetoken = '0';
    subscription.timetoken = '0';
    delete subscription.region;
    delete subscription.serviceRequestId;
    delete subscription.request;
  }

  if (serviceHeartbeatRequests[client.subscriptionKey]) {
    if (heartbeat && heartbeat.channels.length === 0 && heartbeat.channelGroups.length === 0) {
      const hbRequestsBySubscriptionKey = (serviceHeartbeatRequests[client.subscriptionKey] ??= {});
      const heartbeatRequestKey = `${client.userId}_${clientAggregateAuthKey(client) ?? ''}`;

      if (
        hbRequestsBySubscriptionKey[heartbeatRequestKey] &&
        hbRequestsBySubscriptionKey[heartbeatRequestKey].clientIdentifier === client.clientIdentifier
      )
        delete hbRequestsBySubscriptionKey[heartbeatRequestKey]!.clientIdentifier;
    }
  }

  if (!request) {
    const body = new TextEncoder().encode('{"status": 200, "action": "leave", "message": "OK", "service":"Presence"}');
    const headers = new Headers({
      'Content-Type': 'text/javascript; charset="UTF-8"',
      'Content-Length': `${body.length}`,
    });
    const response = new Response(body, { status: 200, headers });
    const result = requestProcessingSuccess([response, body]);
    result.url = `${data.request.origin}${data.request.path}`;
    result.clientIdentifier = data.clientIdentifier;
    result.identifier = data.request.identifier;

    publishClientEvent(client, result);
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

  consoleLog(`Started leave request.`, client);

  // Check whether there were active subscription with channels from this client or not.
  if (serviceRequestId === undefined) return;

  // Update ongoing clients
  const clients = clientsForRequest(serviceRequestId);
  clients.forEach((client) => {
    if (client && client.subscription) delete client.subscription.serviceRequestId;
  });
  cancelRequest(serviceRequestId);
  restartSubscribeRequestForClients(clients);
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
  if (!client || !client.subscription) return;

  const serviceRequestId = client.subscription.serviceRequestId;
  if (!client || !serviceRequestId) return;

  // Unset awaited requests.
  delete client.subscription.serviceRequestId;
  if (client.subscription.request && client.subscription.request.identifier === event.identifier) {
    delete client.subscription.request;
  }

  cancelRequest(serviceRequestId);
};
// endregion

// --------------------------------------------------------
// --------------------- Subscription ---------------------
// --------------------------------------------------------
// region Subscription

/**
 * Try restart subscribe request for the list of clients.
 *
 * Subscribe restart will use previous timetoken information to schedule new subscription loop.
 *
 * **Note:** This function mimics behaviour when SharedWorker receives request from PubNub SDK.
 *
 * @param clients List of PubNub client states for which new aggregated request should be sent.
 */
const restartSubscribeRequestForClients = (clients: PubNubClientState[]) => {
  let clientWithRequest: PubNubClientState | undefined;
  let request: TransportRequest | undefined;

  for (const client of clients) {
    if (client.subscription && client.subscription.request) {
      request = client.subscription.request;
      clientWithRequest = client;
      break;
    }
  }
  if (!request || !clientWithRequest) return;

  const sendRequest: SendRequestEvent = {
    type: 'send-request',
    clientIdentifier: clientWithRequest.clientIdentifier,
    subscriptionKey: clientWithRequest.subscriptionKey,
    request,
  };

  handleSendSubscribeRequestEventForClients([[clientWithRequest, sendRequest]], sendRequest);
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
 * @param responsePreProcess - Raw response pre-processing function which is used before calling handling callbacks.
 */
const sendRequest = (
  request: TransportRequest,
  getClients: () => PubNubClientState[],
  success: (clients: PubNubClientState[], response: [Response, ArrayBuffer]) => void,
  failure: (clients: PubNubClientState[], error: unknown) => void,
  responsePreProcess?: (response: [Response, ArrayBuffer]) => [Response, ArrayBuffer],
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
      .then((response) => (responsePreProcess ? responsePreProcess(response) : response))
      .then((response) => {
        const responseBody = response[1].byteLength > 0 ? response[1] : undefined;

        const clients = getClients();
        if (clients.length === 0) return;

        success(clients, response);
      })
      .catch((error) => {
        const clients = getClients();
        if (clients.length === 0) return;

        let fetchError = error;

        if (typeof error === 'string') {
          const errorMessage = error.toLowerCase();
          fetchError = new Error(error);

          if (!errorMessage.includes('timeout') && errorMessage.includes('cancel')) fetchError.name = 'AbortError';
        }

        failure(clients, fetchError);
      });
  })();
};

/**
 * Cancel (abort) service request by ID.
 *
 * @param requestId - Unique identifier of request which should be cancelled.
 */
const cancelRequest = (requestId: string) => {
  if (clientsForRequest(requestId).length === 0) {
    const controller = abortControllers.get(requestId);
    abortControllers.delete(requestId);

    // Clean up scheduled requests.
    delete serviceRequests[requestId];

    // Abort request if possible.
    if (controller) controller.abort('Cancel request');
  }
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
      client !== undefined && client.subscription !== undefined && client.subscription.serviceRequestId === identifier,
  );
};

/**
 * Clean up PubNub client states from ongoing request.
 *
 * Reset requested and scheduled request information to make PubNub client "free" for next requests.
 *
 * @param clients - List of PubNub clients which awaited for scheduled request completion.
 * @param requestId - Unique subscribe request identifier for which {@link clients} has been provided.
 */
const markRequestCompleted = (clients: PubNubClientState[], requestId: string) => {
  delete serviceRequests[requestId];

  clients.forEach((client) => {
    if (client.subscription) {
      delete client.subscription.request;
      delete client.subscription.serviceRequestId;
    }
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
  const subscription = client.subscription!;
  const clients = clientsForSendSubscribeRequestEvent(subscription.timetoken, event);
  const serviceRequestId = uuidGenerator.createUUID();
  const request = { ...event.request };
  let previousSubscribeTimetoken: string | undefined;
  let previousSubscribeRegion: string | undefined;

  if (clients.length > 1) {
    const activeRequestId = activeSubscriptionForEvent(clients, event);

    // Return identifier of the ongoing request.
    if (activeRequestId) {
      const scheduledRequest = serviceRequests[activeRequestId];
      const { channels, channelGroups } = client.subscription ?? { channels: [], channelGroups: [] };
      if (
        (channels.length > 0 ? includesStrings(scheduledRequest.channels, channels) : true) &&
        (channelGroups.length > 0 ? includesStrings(scheduledRequest.channelGroups, channelGroups) : true)
      ) {
        return activeRequestId;
      }
    }

    const state = (presenceState[client.subscriptionKey] ?? {})[client.userId];
    const aggregatedState: Record<string, Payload> = {};
    const channelGroups = new Set(subscription.channelGroups);
    const channels = new Set(subscription.channels);

    if (state && subscription.objectsWithState.length) {
      subscription.objectsWithState.forEach((name) => {
        const objectState = state[name];
        if (objectState) aggregatedState[name] = objectState;
      });
    }

    for (const _client of clients) {
      const { subscription: _subscription } = _client;
      // Skip clients which doesn't have active subscription request.
      if (!_subscription) continue;

      // Keep track of timetoken from previous call to use it for catchup after initial subscribe.
      if ((clients.length === 1 || _client.clientIdentifier !== client.clientIdentifier) && _subscription.timetoken) {
        previousSubscribeTimetoken = _subscription.timetoken;
        previousSubscribeRegion = _subscription.region;
      }

      _subscription.channelGroups.forEach(channelGroups.add, channelGroups);
      _subscription.channels.forEach(channels.add, channels);

      const activeServiceRequestId = _subscription.serviceRequestId;
      _subscription.serviceRequestId = serviceRequestId;

      // Set awaited service worker request identifier.
      if (activeServiceRequestId && serviceRequests[activeServiceRequestId]) {
        cancelRequest(activeServiceRequestId);
      }

      if (!state) continue;

      _subscription.objectsWithState.forEach((name) => {
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

    // Update `auth` key (if required).
    if (request.queryParameters && request.queryParameters.auth) {
      const authKey = authKeyForAggregatedClientsRequest(clients);
      if (authKey) request.queryParameters.auth = authKey;
    }
  } else {
    serviceRequests[serviceRequestId] = {
      requestId: serviceRequestId,
      timetoken: (request.queryParameters!.tt as string) ?? '0',
      channelGroups: subscription.channelGroups,
      channels: subscription.channels,
    };
  }

  if (serviceRequests[serviceRequestId]) {
    if (
      request.queryParameters &&
      request.queryParameters.tt !== undefined &&
      request.queryParameters.tr !== undefined
    ) {
      serviceRequests[serviceRequestId].region = request.queryParameters.tr as string;
    }
    serviceRequests[serviceRequestId].timetokenOverride = previousSubscribeTimetoken;
    serviceRequests[serviceRequestId].regionOverride = previousSubscribeRegion;
  }

  subscription.serviceRequestId = serviceRequestId;
  request.identifier = serviceRequestId;

  const clientIds = clients
    .reduce((identifiers: string[], { clientIdentifier }) => {
      identifiers.push(clientIdentifier);
      return identifiers;
    }, [])
    .join(', ');

  if (clientIds.length > 0) {
    for (const _client of clients)
      consoleDir(serviceRequests[serviceRequestId], `Started aggregated request for clients: ${clientIds}`, _client);
  }

  return request;
};

/**
 * Construct transport request from send heartbeat request event.
 *
 * Update transport request to aggregate channels and groups if possible.
 *
 * @param event - Client's send heartbeat event request.
 *
 * @returns Final transport request or identifier from active request which will provide response to required
 * channels and groups.
 */
const heartbeatTransportRequestFromEvent = (event: SendRequestEvent): TransportRequest | undefined => {
  const client = pubNubClients[event.clientIdentifier];
  const clients = clientsForSendHeartbeatRequestEvent(event);
  const request = { ...event.request };

  if (!client || !client.heartbeat) return undefined;

  const hbRequestsBySubscriptionKey = (serviceHeartbeatRequests[client.subscriptionKey] ??= {});
  const heartbeatRequestKey = `${client.userId}_${clientAggregateAuthKey(client) ?? ''}`;
  const channelGroupsForAnnouncement: string[] = [...client.heartbeat.channelGroups];
  const channelsForAnnouncement: string[] = [...client.heartbeat.channels];
  let aggregatedState: Record<string, Payload | undefined>;
  let failedPreviousRequest = false;
  let aggregated: boolean;

  if (!hbRequestsBySubscriptionKey[heartbeatRequestKey]) {
    hbRequestsBySubscriptionKey[heartbeatRequestKey] = {
      channels: channelsForAnnouncement,
      channelGroups: channelGroupsForAnnouncement,
      clientIdentifier: client.clientIdentifier,
      timestamp: Date.now(),
    };
    aggregatedState = client.heartbeat.presenceState ?? {};
    aggregated = false;
  } else {
    const { channels, channelGroups, response } = hbRequestsBySubscriptionKey[heartbeatRequestKey];
    aggregatedState = client.heartbeat.presenceState ?? {};
    aggregated =
      includesStrings(channels, channelsForAnnouncement) &&
      includesStrings(channelGroups, channelGroupsForAnnouncement);
    if (response) failedPreviousRequest = response[0].status >= 400;
  }

  // Find minimum heartbeat interval which maybe required to use.
  let minimumHeartbeatInterval = client.heartbeatInterval!;
  for (const client of clients) {
    if (client.heartbeatInterval)
      minimumHeartbeatInterval = Math.min(minimumHeartbeatInterval, client.heartbeatInterval);
  }

  // Check whether multiple instance aggregate heartbeat and there is previous sender known.
  // `clientIdentifier` maybe empty in case if client which triggered heartbeats before has been invalidated and new
  // should handle heartbeat unconditionally.
  if (aggregated && hbRequestsBySubscriptionKey[heartbeatRequestKey].clientIdentifier) {
    const expectedTimestamp =
      hbRequestsBySubscriptionKey[heartbeatRequestKey].timestamp + minimumHeartbeatInterval * 1000;
    const currentTimestamp = Date.now();

    // Check whether it is too soon to send request or not (5 is leeway which let send request a bit earlier).
    // Request should be sent if previous attempt failed.
    if (!failedPreviousRequest && currentTimestamp < expectedTimestamp && expectedTimestamp - currentTimestamp > 5000)
      return undefined;
  }

  delete hbRequestsBySubscriptionKey[heartbeatRequestKey]!.response;
  hbRequestsBySubscriptionKey[heartbeatRequestKey]!.clientIdentifier = client.clientIdentifier;

  // Aggregate channels for similar clients which is pending for heartbeat.
  for (const _client of clients) {
    const { heartbeat } = _client;
    if (heartbeat === undefined || _client.clientIdentifier === event.clientIdentifier) continue;

    // Append presence state from the client (will override previously set value if already set).
    if (heartbeat.presenceState) aggregatedState = { ...aggregatedState, ...heartbeat.presenceState };

    channelGroupsForAnnouncement.push(
      ...heartbeat.channelGroups.filter((channel) => !channelGroupsForAnnouncement.includes(channel)),
    );
    channelsForAnnouncement.push(...heartbeat.channels.filter((channel) => !channelsForAnnouncement.includes(channel)));
  }

  hbRequestsBySubscriptionKey[heartbeatRequestKey].channels = channelsForAnnouncement;
  hbRequestsBySubscriptionKey[heartbeatRequestKey].channelGroups = channelGroupsForAnnouncement;
  hbRequestsBySubscriptionKey[heartbeatRequestKey].timestamp = Date.now();

  // Remove presence state for objects which is not part of heartbeat.
  for (const objectName in Object.keys(aggregatedState)) {
    if (!channelsForAnnouncement.includes(objectName) && !channelGroupsForAnnouncement.includes(objectName))
      delete aggregatedState[objectName];
  }
  // No need to try send request with empty list of channels and groups.
  if (channelsForAnnouncement.length === 0 && channelGroupsForAnnouncement.length === 0) return undefined;

  // Update request channels list (if required).
  if (channelsForAnnouncement.length || channelGroupsForAnnouncement.length) {
    const pathComponents = request.path.split('/');
    pathComponents[6] = channelsForAnnouncement.length ? channelsForAnnouncement.join(',') : ',';
    request.path = pathComponents.join('/');
  }

  // Update request channel groups list (if required).
  if (channelGroupsForAnnouncement.length)
    request.queryParameters!['channel-group'] = channelGroupsForAnnouncement.join(',');

  // Update request `state` (if required).
  if (Object.keys(aggregatedState).length) request.queryParameters!['state'] = JSON.stringify(aggregatedState);
  else delete request.queryParameters!['state'];

  // Update `auth` key (if required).
  if (clients.length > 1 && request.queryParameters && request.queryParameters.auth) {
    const aggregatedAuthKey = authKeyForAggregatedClientsRequest(clients);
    if (aggregatedAuthKey) request.queryParameters.auth = aggregatedAuthKey;
  }

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

  // Remove channels / groups from active client's subscription.
  if (client && client.subscription) {
    const { subscription } = client;
    if (channels.length) subscription.channels = subscription.channels.filter((channel) => !channels.includes(channel));
    if (channelGroups.length)
      subscription.channelGroups = subscription.channelGroups.filter((group) => !channelGroups.includes(group));
  }

  // Remove channels / groups from client's presence heartbeat state.
  if (client && client.heartbeat) {
    const { heartbeat } = client;
    if (channels.length) heartbeat.channels = heartbeat.channels.filter((channel) => !channels.includes(channel));
    if (channelGroups.length)
      heartbeat.channelGroups = heartbeat.channelGroups.filter((channel) => !channelGroups.includes(channel));
  }

  // Filter out channels and groups which is still in use by the other PubNub client instances.
  for (const client of clients) {
    const subscription = client.subscription;
    if (subscription === undefined) continue;
    if (client.clientIdentifier === event.clientIdentifier) continue;
    if (channels.length)
      channels = channels.filter((channel) => !channel.endsWith('-pnpres') && !subscription.channels.includes(channel));
    if (channelGroups.length)
      channelGroups = channelGroups.filter(
        (group) => !group.endsWith('-pnpres') && !subscription.channelGroups.includes(group),
      );
  }

  // Clean up from presence channels and groups
  if (channels.length) channels = channels.filter((channel) => !channel.endsWith('-pnpres'));
  if (channelGroups.length) channelGroups = channelGroups.filter((group) => !group.endsWith('-pnpres'));

  if (channels.length === 0 && channelGroups.length === 0) {
    if (client && client.workerLogVerbosity) {
      const clientIds = clients
        .reduce((identifiers: string[], { clientIdentifier }) => {
          identifiers.push(clientIdentifier);
          return identifiers;
        }, [])
        .join(', ');

      consoleLog(
        `Specified channels and groups still in use by other clients: ${clientIds}. Ignoring leave request.`,
        client,
      );
    }

    return undefined;
  }

  // Update aggregated heartbeat state object.
  if (client && serviceHeartbeatRequests[client.subscriptionKey] && (channels.length || channelGroups.length)) {
    const hbRequestsBySubscriptionKey = serviceHeartbeatRequests[client.subscriptionKey]!;
    const heartbeatRequestKey = `${client.userId}_${clientAggregateAuthKey(client) ?? ''}`;

    if (hbRequestsBySubscriptionKey[heartbeatRequestKey]) {
      let { channels: hbChannels, channelGroups: hbChannelGroups } = hbRequestsBySubscriptionKey[heartbeatRequestKey];

      if (channelGroups.length) hbChannelGroups = hbChannelGroups.filter((group) => !channels.includes(group));
      if (channels.length) hbChannels = hbChannels.filter((channel) => !channels.includes(channel));

      hbRequestsBySubscriptionKey[heartbeatRequestKey].channelGroups = hbChannelGroups;
      hbRequestsBySubscriptionKey[heartbeatRequestKey].channels = hbChannels;
    }
  }

  // Update request channels list (if required).
  if (channels.length) {
    const pathComponents = request.path.split('/');
    pathComponents[6] = channels.join(',');
    request.path = pathComponents.join('/');
  }

  // Update request channel groups list (if required).
  if (channelGroups.length) request.queryParameters!['channel-group'] = channelGroups.join(',');

  // Update `auth` key (if required).
  if (clients.length > 1 && request.queryParameters && request.queryParameters.auth) {
    const aggregatedAuthKey = authKeyForAggregatedClientsRequest(clients);
    if (aggregatedAuthKey) request.queryParameters.auth = aggregatedAuthKey;
  }

  return request;
};

/**
 * Send event to the specific PubNub client.
 *
 * @param client - State for the client which should receive {@link event}.
 * @param event - Subscription worker event object.
 */
const publishClientEvent = (client: PubNubClientState, event: SubscriptionWorkerEvent) => {
  const receiver = (sharedWorkerClients[client.subscriptionKey] ?? {})[client.clientIdentifier];
  if (!receiver) return false;

  try {
    receiver.postMessage(event);
    return true;
  } catch (error) {
    if (client.workerLogVerbosity) console.error(`[SharedWorker] Unable send message using message port: ${error}`);
  }

  return false;
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

  const workerLogVerbosity = clients.some((client) => client && client.workerLogVerbosity);
  const clientIds = sharedWorkerClients[clients[0].subscriptionKey] ?? {};
  const isSubscribeRequest = request && request.path.startsWith('/v2/subscribe');

  if (!result && response) {
    result =
      response[0].status >= 400
        ? // Treat 4xx and 5xx status codes as errors.
          requestProcessingError(undefined, response)
        : requestProcessingSuccess(response);
  }

  // Notify about subscribe and leave requests completion.
  if (workerLogVerbosity && request && !request.path.endsWith('/heartbeat')) {
    const notifiedClientIds = clients
      .reduce((identifiers: string[], { clientIdentifier }) => {
        identifiers.push(clientIdentifier);
        return identifiers;
      }, [])
      .join(', ');
    const endpoint = isSubscribeRequest ? 'subscribe' : 'leave';

    const message = `Notify clients about ${endpoint} request completion: ${notifiedClientIds}`;
    for (const client of clients) consoleLog(message, client);
  }

  for (const client of clients) {
    if (isSubscribeRequest && !client.subscription) {
      // Notifying about client with inactive subscription.
      if (workerLogVerbosity) {
        const message = `${client.clientIdentifier} doesn't have active subscription. Don't notify about completion.`;
        for (const nClient of clients) consoleLog(message, nClient);
      }

      continue;
    }

    const serviceWorkerClientId = clientIds[client.clientIdentifier];
    const { request: clientRequest } = client.subscription ?? {};
    let decidedRequest = clientRequest ?? request;
    if (!isSubscribeRequest) decidedRequest = request;

    if (serviceWorkerClientId && decidedRequest) {
      const payload = {
        ...result!,
        clientIdentifier: client.clientIdentifier,
        identifier: decidedRequest.identifier,
        url: `${decidedRequest.origin}${decidedRequest.path}`,
      };

      publishClientEvent(client, payload);
    } else if (!serviceWorkerClientId && workerLogVerbosity) {
      // Notifying about client without Shared Worker's communication channel.
      const message = `${
        client.clientIdentifier
      } doesn't have Shared Worker's communication channel. Don't notify about completion.`;
      for (const nClient of clients) {
        if (nClient.clientIdentifier !== client.clientIdentifier) consoleLog(message, nClient);
      }
    }
  }
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
  // Use service response as error information source.
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
const registerClientIfRequired = (event: RegisterEvent) => {
  const { clientIdentifier } = event;

  if (pubNubClients[clientIdentifier]) return;

  const client = (pubNubClients[clientIdentifier] = {
    clientIdentifier,
    subscriptionKey: event.subscriptionKey,
    userId: event.userId,
    heartbeatInterval: event.heartbeatInterval,
    newlyRegistered: true,
    offlineClientsCheckInterval: event.workerOfflineClientsCheckInterval,
    unsubscribeOfflineClients: event.workerUnsubscribeOfflineClients,
    workerLogVerbosity: event.workerLogVerbosity,
  });

  // Map registered PubNub client to its subscription key.
  const clientsBySubscriptionKey = (pubNubClientsBySubscriptionKey[event.subscriptionKey] ??= []);
  if (clientsBySubscriptionKey.every((entry) => entry.clientIdentifier !== clientIdentifier))
    clientsBySubscriptionKey.push(client);

  // Binding PubNub client to the MessagePort (receiver).
  (sharedWorkerClients[event.subscriptionKey] ??= {})[clientIdentifier] = event.port;

  const message =
    `Registered PubNub client with '${clientIdentifier}' identifier. ` +
    `'${clientsBySubscriptionKey.length}' clients currently active.`;
  for (const _client of clientsBySubscriptionKey) consoleLog(message, _client);

  if (
    !pingTimeouts[event.subscriptionKey] &&
    (pubNubClientsBySubscriptionKey[event.subscriptionKey] ?? []).length > 0
  ) {
    const { subscriptionKey } = event;
    const interval = event.workerOfflineClientsCheckInterval!;
    for (const _client of clientsBySubscriptionKey)
      consoleLog(`Setup PubNub client ping event ${interval} seconds`, _client);

    pingTimeouts[subscriptionKey] = setTimeout(
      () => pingClients(subscriptionKey),
      interval * 500 - 1,
    ) as unknown as number;
  }
};

/**
 * Unregister client if it uses Service Worker before.
 *
 * During registration removal client information will be removed from the Shared Worker and
 * long-poll request will be cancelled if possible.
 *
 * @param event - Base information about PubNub client instance and Service Worker {@link Client}.
 */
const unRegisterClient = (event: UnRegisterEvent) => {
  invalidateClient(event.subscriptionKey, event.clientIdentifier);
};

/**
 * Update information about previously registered client.
 *
 * Use information from request to populate list of channels and other useful information.
 *
 * @param event - Send request.
 */
const updateClientSubscribeStateIfRequired = (event: SendRequestEvent) => {
  const query = event.request.queryParameters!;
  const { clientIdentifier } = event;
  const client = pubNubClients[clientIdentifier];

  // This should never happen.
  if (!client) return;

  const channelGroupQuery = (query!['channel-group'] ?? '') as string;
  const state = (query.state ?? '') as string;

  let subscription = client.subscription;
  if (!subscription) {
    subscription = {
      path: '',
      channelGroupQuery: '',
      channels: [],
      channelGroups: [],
      previousTimetoken: '0',
      timetoken: '0',
      objectsWithState: [],
    };

    if (state.length > 0) {
      const parsedState = JSON.parse(state) as Record<string, Payload>;
      const userState = ((presenceState[client.subscriptionKey] ??= {})[client.userId] ??= {});

      Object.entries(parsedState).forEach(([objectName, value]) => (userState[objectName] = value));
      subscription.objectsWithState = Object.keys(parsedState);
    }

    client.subscription = subscription;
  } else {
    if (state.length > 0) {
      const parsedState = JSON.parse(state) as Record<string, Payload>;
      const userState = ((presenceState[client.subscriptionKey] ??= {})[client.userId] ??= {});
      Object.entries(parsedState).forEach(([objectName, value]) => (userState[objectName] = value));

      // Clean up state for objects where presence state has been reset.
      for (const objectName of subscription.objectsWithState)
        if (!parsedState[objectName]) delete userState[objectName];

      subscription.objectsWithState = Object.keys(parsedState);
    }
    // Handle potential presence state reset.
    else if (subscription.objectsWithState.length) {
      const userState = ((presenceState[client.subscriptionKey] ??= {})[client.userId] ??= {});

      for (const objectName of subscription.objectsWithState) delete userState[objectName];
      subscription.objectsWithState = [];
    }
  }

  if (subscription.path !== event.request.path) {
    subscription.path = event.request.path;
    subscription.channels = channelsFromRequest(event.request);
  }

  if (subscription.channelGroupQuery !== channelGroupQuery) {
    subscription.channelGroupQuery = channelGroupQuery;
    subscription.channelGroups = channelGroupsFromRequest(event.request);
  }

  let { authKey } = client;
  const { userId } = client;
  subscription.request = event.request;
  subscription.filterExpression = (query['filter-expr'] ?? '') as string;
  subscription.timetoken = (query.tt ?? '0') as string;
  if (query.tr !== undefined) subscription.region = query.tr as string;
  client.authKey = (query.auth ?? '') as string;
  client.origin = event.request.origin;
  client.userId = query.uuid as string;
  client.pnsdk = query.pnsdk as string;
  client.accessToken = event.token;

  if (client.newlyRegistered && !authKey && client.authKey) authKey = client.authKey;
  client.newlyRegistered = false;

  handleClientIdentityChangeIfRequired(client, userId, authKey);
};

/**
 * Update presence heartbeat information for previously registered client.
 *
 * Use information from request to populate list of channels / groups and presence state information.
 *
 * @param event - Send heartbeat request event.
 */
const updateClientHeartbeatState = (event: SendRequestEvent) => {
  const client = pubNubClients[event.clientIdentifier];
  const { request } = event;

  // This should never happen.
  if (!client) return;

  const _clientHeartbeat = (client.heartbeat ??= {
    channels: [],
    channelGroups: [],
  });

  // Update presence heartbeat information about client.
  _clientHeartbeat.channelGroups = channelGroupsFromRequest(request).filter((group) => !group.endsWith('-pnpres'));
  _clientHeartbeat.channels = channelsFromRequest(request).filter((channel) => !channel.endsWith('-pnpres'));

  const state = (request.queryParameters!.state ?? '') as string;
  if (state.length > 0) {
    const userPresenceState = JSON.parse(state) as Record<string, Payload>;
    for (const objectName of Object.keys(userPresenceState))
      if (!_clientHeartbeat.channels.includes(objectName) && !_clientHeartbeat.channelGroups.includes(objectName))
        delete userPresenceState[objectName];
    _clientHeartbeat.presenceState = userPresenceState;
  }
};

/**
 * Check whether PubNub client identity has been changed between state refresh or not.
 *
 * @param client - PubNub client state which will be checked.
 * @param userId - `userId` which has been used by `PubNub` client before state refresh.
 * @param authKey - `authKey` which has been used by `PubNub` client before state refresh.
 */
const handleClientIdentityChangeIfRequired = (client: PubNubClientState, userId: string, authKey?: string) => {
  if (!client || (userId === client.userId && (authKey ?? '') === (client.authKey ?? ''))) return;

  const _heartbeatRequests = serviceHeartbeatRequests[client.subscriptionKey] ?? {};

  const heartbeatRequestKey = `${userId}_${clientAggregateAuthKey(client) ?? ''}`;
  if (_heartbeatRequests[heartbeatRequestKey] !== undefined) delete _heartbeatRequests[heartbeatRequestKey];
};

/**
 * Handle PubNub client response on PING request.
 *
 * @param event - Information about client which responded on PING request.
 */
const handleClientPong = (event: PongEvent) => {
  const client = pubNubClients[event.clientIdentifier];

  if (!client) return;

  client.lastPongEvent = new Date().getTime() / 1000;
};

/**
 * Clean up resources used by registered PubNub client instance.
 *
 * @param subscriptionKey - Subscription key which has been used by the
 * invalidated instance.
 * @param clientId - Unique PubNub client identifier.
 */
const invalidateClient = (subscriptionKey: string, clientId: string) => {
  const invalidatedClient = pubNubClients[clientId];
  delete pubNubClients[clientId];
  let clients = pubNubClientsBySubscriptionKey[subscriptionKey];

  // Unsubscribe invalidated PubNub client.
  if (invalidatedClient) {
    // Cancel long-poll request if possible.
    if (invalidatedClient.subscription) {
      const { serviceRequestId } = invalidatedClient.subscription;
      delete invalidatedClient.subscription.serviceRequestId;
      if (serviceRequestId) cancelRequest(serviceRequestId);
    }

    if (serviceHeartbeatRequests[subscriptionKey]) {
      const hbRequestsBySubscriptionKey = (serviceHeartbeatRequests[subscriptionKey] ??= {});
      const heartbeatRequestKey = `${invalidatedClient.userId}_${clientAggregateAuthKey(invalidatedClient) ?? ''}`;

      if (
        hbRequestsBySubscriptionKey[heartbeatRequestKey] &&
        hbRequestsBySubscriptionKey[heartbeatRequestKey].clientIdentifier === invalidatedClient.clientIdentifier
      )
        delete hbRequestsBySubscriptionKey[heartbeatRequestKey]!.clientIdentifier;
    }

    // Leave subscribed channels / groups properly.
    if (invalidatedClient.unsubscribeOfflineClients) unsubscribeClient(invalidatedClient);
  }

  if (clients) {
    // Clean up linkage between client and subscription key.
    clients = clients.filter((client) => client.clientIdentifier !== clientId);
    if (clients.length > 0) pubNubClientsBySubscriptionKey[subscriptionKey] = clients;
    else {
      delete pubNubClientsBySubscriptionKey[subscriptionKey];
      delete serviceHeartbeatRequests[subscriptionKey];
    }

    // Clean up presence state information if not in use anymore.
    if (clients.length === 0) delete presenceState[subscriptionKey];

    // Clean up service workers client linkage to PubNub clients.
    if (clients.length > 0) {
      const workerClients = sharedWorkerClients[subscriptionKey];
      if (workerClients) {
        delete workerClients[clientId];

        if (Object.keys(workerClients).length === 0) delete sharedWorkerClients[subscriptionKey];
      }
    } else delete sharedWorkerClients[subscriptionKey];
  }

  const message = `Invalidate '${clientId}' client. '${
    (pubNubClientsBySubscriptionKey[subscriptionKey] ?? []).length
  }' clients currently active.`;
  if (!clients) consoleLog(message);
  else for (const _client of clients) consoleLog(message, _client);
};

const unsubscribeClient = (client: PubNubClientState) => {
  if (!client.subscription) return;

  const { channels, channelGroups, serviceRequestId } = client.subscription;
  const encodedChannelGroups = (channelGroups ?? [])
    .filter((name) => !name.endsWith('-pnpres'))
    .map((name) => encodeString(name))
    .sort();
  const encodedChannels = (channels ?? [])
    .filter((name) => !name.endsWith('-pnpres'))
    .map((name) => encodeString(name))
    .sort();

  if (encodedChannels.length === 0 && encodedChannelGroups.length === 0) return;

  const channelGroupsString: string | undefined =
    encodedChannelGroups.length > 0 ? encodedChannelGroups.join(',') : undefined;
  const channelsString = encodedChannels.length === 0 ? ',' : encodedChannels.join(',');
  const query: Query = {
    instanceid: client.clientIdentifier,
    uuid: client.userId,
    requestid: uuidGenerator.createUUID(),
    ...(client.authKey ? { auth: client.authKey } : {}),
    ...(channelGroupsString ? { 'channel-group': channelGroupsString } : {}),
  };

  const request: SendRequestEvent = {
    type: 'send-request',
    clientIdentifier: client.clientIdentifier,
    subscriptionKey: client.subscriptionKey,
    request: {
      origin: client.origin,
      path: `/v2/presence/sub-key/${client.subscriptionKey}/channel/${channelsString}/leave`,
      queryParameters: query,
      method: TransportMethod.GET,
      headers: {},
      timeout: 10,
      cancellable: false,
      compressible: false,
      identifier: query.requestid as string,
    },
  };

  handleSendLeaveRequestEvent(request, client);
};

/**
 * Validate received event payload.
 */
const validateEventPayload = (event: MessageEvent<ClientEvent>): boolean => {
  const { clientIdentifier, subscriptionKey } = event.data as ClientEvent;
  if (!clientIdentifier || typeof clientIdentifier !== 'string') return false;

  return !(!subscriptionKey || typeof subscriptionKey !== 'string');
};

/**
 * Search for active subscription for one of the passed {@link sharedWorkerClients}.
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
    if (!subscription || !subscription.serviceRequestId) continue;
    const sourceClient = pubNubClients[event.clientIdentifier];
    const requestId = subscription.serviceRequestId;

    if (subscription.path === requestPath && subscription.channelGroupQuery === channelGroupQuery) {
      consoleLog(
        `Found identical request started by '${client.clientIdentifier}' client. 
Waiting for existing '${requestId}' request completion.`,
        sourceClient,
      );

      return subscription.serviceRequestId;
    } else {
      const scheduledRequest = serviceRequests[subscription.serviceRequestId];
      if (!channelGroups) channelGroups = channelGroupsFromRequest(event.request);
      if (!channels) channels = channelsFromRequest(event.request);

      // Checking whether all required channels and groups are handled already by active request or not.
      if (channels.length && !includesStrings(scheduledRequest.channels, channels)) continue;
      if (channelGroups.length && !includesStrings(scheduledRequest.channelGroups, channelGroups)) continue;

      consoleDir(
        scheduledRequest,
        `'${event.request.identifier}' request channels and groups are subset of ongoing '${requestId}' request 
which has started by '${client.clientIdentifier}' client. Waiting for existing '${requestId}' request completion.`,
        sourceClient,
      );

      return subscription.serviceRequestId;
    }
  }

  return undefined;
};

/**
 * Check whether there are any clients which can be used for subscribe request aggregation or not.
 *
 * @param client - PubNub client state which will be checked.
 * @param event - Send subscribe request event information.
 *
 * @returns `true` in case there is more than 1 client which has same parameters for subscribe request to aggregate.
 */
const hasClientsForSendAggregatedSubscribeRequestEvent = (client: PubNubClientState, event: SendRequestEvent) => {
  return clientsForSendSubscribeRequestEvent((client.subscription ?? {}).timetoken ?? '0', event).length > 1;
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
  const reqClient = pubNubClients[event.clientIdentifier];
  if (!reqClient) return [];

  const query = event.request.queryParameters!;
  const authKey = clientAggregateAuthKey(reqClient);
  const filterExpression = (query['filter-expr'] ?? '') as string;
  const userId = query.uuid! as string;

  return (pubNubClientsBySubscriptionKey[event.subscriptionKey] ?? []).filter(
    (client) =>
      client.userId === userId &&
      clientAggregateAuthKey(client) === authKey &&
      client.subscription &&
      // Only clients with active subscription can be used.
      (client.subscription.channels.length !== 0 || client.subscription.channelGroups.length !== 0) &&
      client.subscription.filterExpression === filterExpression &&
      (timetoken === '0' || client.subscription.timetoken === '0' || client.subscription.timetoken === timetoken),
  );
};

/**
 * Find PubNub client state with configuration compatible with toe one in request.
 *
 * Method allow to find information about all PubNub client instances which use same:
 * - subscription key
 * - `userId`
 * - `auth` key
 *
 * @param event - Send heartbeat request event information.
 *
 * @returns List of PubNub client states which works from other pages for the same user.
 */
const clientsForSendHeartbeatRequestEvent = (event: SendRequestEvent) => {
  return clientsForSendLeaveRequestEvent(event);
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
  const reqClient = pubNubClients[event.clientIdentifier];
  if (!reqClient) return [];

  const query = event.request.queryParameters!;
  const authKey = clientAggregateAuthKey(reqClient);
  const userId = query.uuid! as string;

  return (pubNubClientsBySubscriptionKey[event.subscriptionKey] ?? []).filter(
    (client) => client.userId === userId && clientAggregateAuthKey(client) === authKey,
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
 * Send PubNub client PING request to identify disconnected instances.
 *
 * @param subscriptionKey - Subscribe key for which offline PubNub client should be checked.
 */
const pingClients = (subscriptionKey: string) => {
  const payload: SharedWorkerPing = { type: 'shared-worker-ping' };

  const _pubNubClients = Object.values(pubNubClients).filter(
    (client) => client && client.subscriptionKey === subscriptionKey,
  );

  _pubNubClients.forEach((client) => {
    let clientInvalidated = false;

    if (client && client.lastPingRequest) {
      const interval = client.offlineClientsCheckInterval!;

      // Check whether client never respond or last response was too long time ago.
      if (!client.lastPongEvent || Math.abs(client.lastPongEvent - client.lastPingRequest) > interval * 0.5) {
        clientInvalidated = true;

        for (const _client of _pubNubClients)
          consoleLog(`'${client.clientIdentifier}' client is inactive. Invalidating...`, _client);
        invalidateClient(client.subscriptionKey, client.clientIdentifier);
      }
    }

    if (client && !clientInvalidated) {
      client.lastPingRequest = new Date().getTime() / 1000;
      publishClientEvent(client, payload);
    }
  });

  // Restart ping timer if there is still active PubNub clients for subscription key.
  if (_pubNubClients && _pubNubClients.length > 0 && _pubNubClients[0]) {
    const interval = _pubNubClients[0].offlineClientsCheckInterval!;
    pingTimeouts[subscriptionKey] = setTimeout(
      () => pingClients(subscriptionKey),
      interval * 500 - 1,
    ) as unknown as number;
  }
};

/**
 * Retrieve auth key which is suitable for common clients request aggregation.
 *
 * @param client - Client for which auth key for aggregation should be retrieved.
 *
 * @returns Client aggregation auth key.
 */
const clientAggregateAuthKey = (client: PubNubClientState): string | undefined => {
  return client.accessToken ? (client.accessToken.token ?? client.authKey) : client.authKey;
};

/**
 * Pick auth key for clients with latest expiration date.
 *
 * @param clients - List of clients for which latest auth key should be retrieved.
 *
 * @returns Access token which can be used to confirm `userId` permissions for aggregated request.
 */
const authKeyForAggregatedClientsRequest = (clients: PubNubClientState[]) => {
  const latestClient = clients
    .filter((client) => !!client.accessToken)
    .sort((a, b) => a.accessToken!.expiration - b.accessToken!.expiration)
    .pop();

  return latestClient ? latestClient.authKey : undefined;
};

/**
 * Compose clients' aggregation key.
 *
 * Aggregation key includes key parameters which differentiate clients between each other.
 *
 * @param client - Client for which identifier should be composed.
 *
 * @returns Aggregation timeout identifier string.
 */
const aggregateTimerId = (client: PubNubClientState) => {
  const authKey = clientAggregateAuthKey(client);
  let id = `${client.userId}-${client.subscriptionKey}${authKey ? `-${authKey}` : ''}`;
  if (client.subscription && client.subscription.filterExpression) id += `-${client.subscription.filterExpression}`;
  return id;
};

/**
 * Print message on the worker's clients console.
 *
 * @param message - Message which should be printed.
 * @param [client] - Target client to which log message should be sent.
 */
const consoleLog = (message: string, client?: PubNubClientState): void => {
  const clients = (client ? [client] : Object.values(pubNubClients)).filter(
    (client) => client && client.workerLogVerbosity,
  );
  const payload: SharedWorkerConsoleLog = {
    type: 'shared-worker-console-log',
    message,
  };

  clients.forEach((client) => {
    if (client) publishClientEvent(client, payload);
  });
};

/**
 * Print message on the worker's clients console.
 *
 * @param data - Data which should be printed into the console.
 * @param [message] - Message which should be printed before {@link data}.
 * @param [client] - Target client to which log message should be sent.
 */
const consoleDir = (data: Payload, message?: string, client?: PubNubClientState): void => {
  const clients = (client ? [client] : Object.values(pubNubClients)).filter(
    (client) => client && client.workerLogVerbosity,
  );
  const payload: SharedWorkerConsoleDir = {
    type: 'shared-worker-console-dir',
    message,
    data,
  };

  clients.forEach((client) => {
    if (client) publishClientEvent(client, payload);
  });
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
