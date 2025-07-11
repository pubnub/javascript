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
import { TransportResponse } from '../../core/types/transport-response';
import uuidGenerator from '../../core/components/uuid';
import { Payload, Query } from '../../core/types/api';

// --------------------------------------------------------
// -------------------- Network Metrics -------------------
// --------------------------------------------------------

interface NetworkMetrics {
  requestId: string;
  requestType: 'subscribe' | 'heartbeat' | 'leave' | 'other';
  url: string;
  method: string;
  queuedAt: number;
  fetchStartedAt?: number;
  fetchCompletedAt?: number;
  responseSize?: number;
  status?: number;
  error?: string;
  queueDepthAtStart?: number;
  concurrentRequestsAtStart?: number;
  clientIdentifier?: string;
  channels?: string[];
  channelGroups?: string[];
  timerToFetchDelay?: number; // Time from timer fire to actual fetch call
}

interface HeartbeatMetrics {
  scheduledAt: number;
  expectedFireAt: number;
  actualFiredAt?: number;
  fetchStartedAt?: number;
  fetchCompletedAt?: number;
  completedAt?: number;
  skipped?: boolean;
  skipReason?: string;
  delayFromExpected?: number;
  queueDepthAtFire?: number;
  error?: string;
}

// Global metrics storage
const networkMetrics: Map<string, NetworkMetrics> = new Map();
const heartbeatMetrics: Map<string, HeartbeatMetrics> = new Map();
const pendingRequests: Map<string, NetworkMetrics> = new Map();
let metricsSequenceNumber = 0;

// Track metrics-only clients (network-metrics dashboard)
const metricsClients: Map<string, MessagePort> = new Map();

// Connection tracking
const activeConnections = new Map<string, { startTime: number; requestId: string }>();
const connectionMetrics = {
  maxConcurrent: 0,
  totalConnections: 0,
  connectionReuse: 0,
  newConnections: 0
};

// Request queue tracking
const requestQueue: { requestId: string; type: string; queuedAt: number; order: number }[] = [];
let requestOrder = 0;
const requestQueueMetrics = {
  maxQueueDepth: 0,
  totalQueued: 0,
  heartbeatDelays: [] as number[],
  requestOrdering: new Map<string, { queueOrder: number; executionOrder: number }>()
};

// Track executed requests (circular buffer)
const executedRequestsBuffer: Array<{
  id: string;
  url: string;
  type: string;
  duration: number;
  status: number | string;
  datetime: string;
  error?: string;
}> = [];
const MAX_EXECUTED_REQUESTS = 50;

// Executed requests statistics
const executedRequestsStats = {
  total: 0,
  success: 0,
  failed: 0,
  byType: {
    heartbeat: { total: 0, success: 0, failed: 0 },
    subscribe: { total: 0, success: 0, failed: 0 },
    leave: { total: 0, success: 0, failed: 0 },
    other: { total: 0, success: 0, failed: 0 }
  }
};

// Metrics helper functions
const getRequestType = (request: TransportRequest): NetworkMetrics['requestType'] => {
  // PubNub API URL patterns:
  // Subscribe: /v2/subscribe/{sub_key}/{channels}/0 OR /subscribe/{sub_key}/{channels}/0
  // Heartbeat: /v2/presence/sub-key/{sub_key}/channel/{channels}/heartbeat
  // Leave: /v2/presence/sub-key/{sub_key}/channel/{channels}/leave
  
  // Debug logging for unrecognized paths
  const isRecognized = request.path.includes('/subscribe/') || 
                      request.path.includes('/heartbeat') || 
                      request.path.includes('/leave');
  
  if (!isRecognized) {
    console.log('[getRequestType] Unrecognized request path:', request.path);
  }
  
  // Check for subscribe (with or without /v2/ prefix)
  if (request.path.includes('/subscribe/')) return 'subscribe';
  if (request.path.includes('/heartbeat')) return 'heartbeat';
  if (request.path.includes('/leave')) return 'leave';
  return 'other';
};

// Periodic metrics summary
let metricsInterval: ReturnType<typeof setInterval> | undefined;
const startMetricsSummary = () => {
  if (metricsInterval) return;
  
  metricsInterval = setInterval(() => {
    // Get detailed request information
    const now = Date.now();
    const activeRequests = Array.from(activeConnections.entries()).map(([id, conn]) => {
      const metrics = networkMetrics.get(id);
      return {
        id,
        url: metrics?.url || 'unknown',
        type: metrics?.requestType || 'unknown',
        channels: metrics?.channels || [],
        duration: now - conn.startTime,
        startTime: conn.startTime
      };
    }).sort((a, b) => b.startTime - a.startTime); // Most recent first
    
    const queuedRequests = requestQueue.map(req => {
      const metrics = networkMetrics.get(req.requestId);
      return {
        id: req.requestId,
        url: metrics?.url || 'unknown',
        type: req.type,
        channels: metrics?.channels || [],
        queueTime: now - req.queuedAt,
        queuedAt: req.queuedAt,
        order: req.order
      };
    }).sort((a, b) => a.order - b.order); // Order by queue position
    
    const summary = {
      timestamp: new Date().toISOString(),
      network: {
        pendingRequests: pendingRequests.size,
        activeConnections: activeConnections.size,
        maxConcurrent: connectionMetrics.maxConcurrent,
        totalRequests: networkMetrics.size,
        browserQueueEstimate: Math.max(0, activeConnections.size - 6), // Estimated browser queue
        executedRequests: {
          total: executedRequestsStats.total,
          success: executedRequestsStats.success,
          failed: executedRequestsStats.failed,
          successRate: executedRequestsStats.total > 0 
            ? Math.round((executedRequestsStats.success / executedRequestsStats.total) * 100) 
            : 0,
          byType: executedRequestsStats.byType
        }
      },
      queue: {
        currentDepth: requestQueue.length,
        maxDepth: requestQueueMetrics.maxQueueDepth,
        totalQueued: requestQueueMetrics.totalQueued,
        avgHeartbeatDelay: requestQueueMetrics.heartbeatDelays.length > 0 
          ? requestQueueMetrics.heartbeatDelays.reduce((a, b) => a + b, 0) / requestQueueMetrics.heartbeatDelays.length
          : 0
      },
      heartbeats: {
        // New clearer metrics
        pendingTimers: Array.from(heartbeatMetrics.values()).filter(hb => !hb.completedAt && !hb.skipped).length,
        activeRequests: Array.from(heartbeatMetrics.values()).filter(hb => 
          hb.actualFiredAt && !hb.completedAt && !hb.skipped
        ).length,
        queuedTimers: Array.from(heartbeatMetrics.values()).filter(hb => 
          hb.scheduledAt && !hb.actualFiredAt && !hb.skipped
        ).length,
        // Keep existing for backwards compatibility
        scheduled: Array.from(heartbeatMetrics.values()).filter(hb => !hb.completedAt && !hb.skipped).length,
        completed: Array.from(heartbeatMetrics.values()).filter(hb => 
          hb.completedAt && !hb.skipped && (now - hb.completedAt < 5000)
        ).length,
        skipped: Array.from(heartbeatMetrics.values()).filter(hb => 
          hb.skipped && hb.completedAt && (now - hb.completedAt < 5000)
        ).length,
        totalTracked: heartbeatMetrics.size,
        breakdown: {
          pending: Array.from(heartbeatMetrics.values()).filter(hb => !hb.completedAt && !hb.skipped).length,
          completedWithinMinute: Array.from(heartbeatMetrics.values()).filter(hb => 
            hb.completedAt && !hb.skipped && (now - hb.completedAt < 60000)
          ).length,
          completedOlderThanMinute: Array.from(heartbeatMetrics.values()).filter(hb => 
            hb.completedAt && !hb.skipped && (now - hb.completedAt >= 60000)
          ).length,
          skippedTotal: Array.from(heartbeatMetrics.values()).filter(hb => hb.skipped).length
        }
      },
      requestTypes: {
        heartbeat: Array.from(networkMetrics.values()).filter(m => m.requestType === 'heartbeat').length,
        subscribe: Array.from(networkMetrics.values()).filter(m => m.requestType === 'subscribe').length,
        leave: Array.from(networkMetrics.values()).filter(m => m.requestType === 'leave').length,
        other: Array.from(networkMetrics.values()).filter(m => m.requestType === 'other').length
      },
      activeRequests: activeRequests.slice(0, 20), // Limit to 20 most recent
      queuedRequests: queuedRequests.slice(0, 20), // Limit to 20 oldest in queue
      executedRequests: executedRequestsBuffer.slice(-50) // Last 50 executed requests
    };
    
    // Debug log queue metrics every 10 seconds
    if (Date.now() % 10000 < 1000) {
      console.log('[QueueMetrics] Current state:', {
        currentDepth: requestQueue.length,
        maxDepth: requestQueueMetrics.maxQueueDepth,
        totalQueued: requestQueueMetrics.totalQueued,
        avgHeartbeatDelay: summary.queue.avgHeartbeatDelay,
        recentDelays: requestQueueMetrics.heartbeatDelays.slice(-5)
      });
    }
    
    // Broadcast summary to all clients
    broadcastMetrics('MetricsSummary', summary);
    
    // Clean up old metrics (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [id, metric] of networkMetrics.entries()) {
      if (metric.queuedAt < fiveMinutesAgo) {
        networkMetrics.delete(id);
      }
    }
    for (const [id, metric] of heartbeatMetrics.entries()) {
      if (metric.scheduledAt < fiveMinutesAgo) {
        heartbeatMetrics.delete(id);
      }
    }
  }, 1000); // Every 1 second
};

// Start metrics summary when first client connects
startMetricsSummary();

const logNetworkMetrics = (metrics: NetworkMetrics) => {
  const duration = (metrics.fetchCompletedAt || Date.now()) - metrics.queuedAt;
  const fetchDuration = metrics.fetchStartedAt && metrics.fetchCompletedAt ? 
    metrics.fetchCompletedAt - metrics.fetchStartedAt : undefined;
  
  const metricsData = {
    totalDuration: duration,
    fetchDuration,
    queueTime: metrics.fetchStartedAt ? metrics.fetchStartedAt - metrics.queuedAt : undefined,
    timerToFetchDelay: metrics.timerToFetchDelay,
    status: metrics.status,
    error: metrics.error,
    queueDepth: metrics.queueDepthAtStart,
    concurrent: metrics.concurrentRequestsAtStart,
    url: metrics.url,
    channels: metrics.channels,
    sequence: metricsSequenceNumber++
  };
  
  console.log(`[NetworkMetrics] ${metrics.requestType} request ${metrics.requestId}:`, metricsData);
  
  // Send metrics to all connected clients
  broadcastMetrics('network-metrics', {
    type: metrics.requestType,
    requestId: metrics.requestId,
    metrics: metricsData
  });
};

// Helper to broadcast metrics to all connected clients
const broadcastMetrics = (eventType: string, data: any) => {
  // Only broadcast to registered metrics clients (network-metrics dashboard)
  for (const [clientId, port] of metricsClients.entries()) {
    try {
      port.postMessage({
        type: 'metrics-broadcast',
        eventType: eventType,
        metrics: data,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      // Remove dead ports
      console.error(`Failed to send metrics to ${clientId}, removing`);
      metricsClients.delete(clientId);
    }
  }
  
  // Also log to console for debugging (but not to PubNub clients)
  console.log(`[${eventType}]`, data);
};

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
 * PubNub client update event.
 */
export type UpdateEvent = BasicEvent & {
  type: 'client-update';

  /**
   * `userId` currently used by the client.
   */
  userId: string;

  /**
   * How often the client will announce itself to server. The value is in seconds.
   *
   * @default `not set`
   */
  heartbeatInterval?: number;

  /**
   * Access token which is used to access provided list of channels and channel groups.
   *
   * **Note:** Value can be missing, but it shouldn't reset it in the state.
   */
  accessToken?: string;

  /**
   * Pre-processed access token (If set).
   *
   * **Note:** Value can be missing, but it shouldn't reset it in the state.
   */
  preProcessedToken?: PubNubClientState['accessToken'];
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
  preProcessedToken?: PubNubClientState['accessToken'];
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
export type ClientEvent =
  | RegisterEvent
  | UpdateEvent
  | PongEvent
  | SendRequestEvent
  | CancelRequestEvent
  | UnRegisterEvent;
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
  message: Payload;
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
     * Date time when subscription object has been updated.
     */
    refreshTimestamp: number;

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
     * Previous heartbeat send event.
     */
    heartbeatEvent?: SendRequestEvent;

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

    /**
     * Backup presence heartbeat loop managed by the `SharedWorker`.
     */
    loop?: {
      /**
       * Heartbeat timer.
       *
       * Timer which is started with first heartbeat request and repeat inside SharedWorker to bypass browser's
       * timers throttling.
       *
       * **Note:** Timer will be restarted each time when core client request to send a request (still "alive").
       */
      timer: ReturnType<typeof setTimeout>;

      /**
       * Interval which has been used for the timer.
       */
      heartbeatInterval: number;

      /**
       * Timestamp when time has been started.
       *
       * **Note:** Information needed to compute active timer restart with new interval value.
       */
      startTimestamp: number;
    };
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
              createdByActualRequest: boolean;
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
  [subscriptionKey: string]: { [userId: string]: Record<string, Payload | undefined> | undefined } | undefined;
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

    receiver.onmessage = (event: MessageEvent<any>) => {
      // Handle metrics-only client registration
      if (event.data && typeof event.data === 'object' && event.data.type === 'metrics-client-register') {
        const clientId = event.data.clientId;
        metricsClients.set(clientId, receiver);
        console.log(`Metrics client registered: ${clientId}`);
        
        // Send acknowledgment
        receiver.postMessage({
          type: 'metrics-client-registered',
          clientId: clientId
        });
        return;
      }
      
      // Ignoring unknown event payloads.
      if (!validateEventPayload(event)) return;

      const data = event.data as ClientEvent;

      if (data.type === 'client-register') {
        // Appending information about messaging port for responses.
        data.port = receiver;
        registerClientIfRequired(data);

        consoleLog(`Client '${data.clientIdentifier}' registered with '${sharedWorkerIdentifier}' shared worker`);
      } else if (data.type === 'client-update') updateClientInformation(data);
      else if (data.type === 'client-unregister') unRegisterClient(data);
      else if (data.type === 'client-pong') handleClientPong(data);
      else if (data.type === 'send-request') {
        if (data.request.path.startsWith('/v2/subscribe')) {
          const changedSubscription = updateClientSubscribeStateIfRequired(data);

          const client = pubNubClients[data.clientIdentifier];
          if (client) {
            // Check whether there are more clients which may schedule next subscription loop and they need to be
            // aggregated or not.
            const timerIdentifier = aggregateTimerId(client);
            let enqueuedClients: [PubNubClientState, SendRequestEvent][] = [];

            if (aggregationTimers.has(timerIdentifier)) enqueuedClients = aggregationTimers.get(timerIdentifier)![0];
            enqueuedClients.push([client, data]);

            // Clear existing aggregation timer if subscription list changed.
            if (aggregationTimers.has(timerIdentifier) && changedSubscription) {
              clearTimeout(aggregationTimers.get(timerIdentifier)![1]);
              aggregationTimers.delete(timerIdentifier);
            }

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
          
          // Create heartbeat metrics for direct client requests
          const scheduledAt = Date.now();
          const hbMetricsId = `hb-direct-${data.clientIdentifier}-${scheduledAt}`;
          const hbMetrics: HeartbeatMetrics = {
            scheduledAt,
            expectedFireAt: scheduledAt, // Direct request, no delay expected
            actualFiredAt: scheduledAt,
            queueDepthAtFire: pendingRequests.size
          };
          heartbeatMetrics.set(hbMetricsId, hbMetrics);
          
          handleHeartbeatRequestEvent(data, true, false, hbMetrics);
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
        client.subscription.refreshTimestamp = Date.now();
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
  const expectingInitialSubscribeResponse = scheduledRequest.timetoken === '0';

  consoleLog(`'${Object.keys(serviceRequests).length}' subscription request currently active.`);

  // Notify about request processing start.
  for (const client of clientsForRequest(requestOrId.identifier))
    consoleLog({ messageType: 'network-request', message: requestOrId as unknown as Payload }, client);

  sendRequest(
    requestOrId,
    () => clientsForRequest(requestOrId.identifier),
    (clients, fetchRequest, response) => {
      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, fetchRequest, response, event.request);

      // Clean up scheduled request and client references to it.
      markRequestCompleted(clients, requestOrId.identifier);
    },
    (clients, fetchRequest, error) => {
      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, fetchRequest, null, event.request, requestProcessingError(error));

      // Clean up scheduled request and client references to it.
      markRequestCompleted(clients, requestOrId.identifier);
    },
    (response) => {
      let serverResponse = response;
      if (expectingInitialSubscribeResponse && timetokenOverride && timetokenOverride !== '0')
        serverResponse = patchInitialSubscribeResponse(serverResponse, timetokenOverride, regionOverride);

      return serverResponse;
    },
  );
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
 * @param [actualRequest] - Whether handling actual request from the core-part of the client and not backup heartbeat in
 * the `SharedWorker`.
 * @param [outOfOrder] - Whether handling request which is sent on irregular basis (setting update).
 * @param [hbMetrics] - Heartbeat metrics object to update when heartbeat is skipped.
 */
const handleHeartbeatRequestEvent = (event: SendRequestEvent, actualRequest = true, outOfOrder = false, hbMetrics?: HeartbeatMetrics) => {
  const heartbeatStartTime = Date.now();
  
  console.log(`[HeartbeatRequest] Processing heartbeat event:`, {
    clientId: event.clientIdentifier,
    actualRequest,
    outOfOrder,
    pendingRequests: pendingRequests.size,
    timestamp: new Date(heartbeatStartTime).toISOString()
  });

  const client = pubNubClients[event.clientIdentifier];
  const request = heartbeatTransportRequestFromEvent(event, actualRequest, outOfOrder);

  if (!client) {
    console.warn(`[HeartbeatRequest] No client found for ${event.clientIdentifier}`);
    return;
  }
  const heartbeatRequestKey = `${client.userId}_${clientAggregateAuthKey(client) ?? ''}`;
  const hbRequestsBySubscriptionKey = serviceHeartbeatRequests[client.subscriptionKey];
  const hbRequests = (hbRequestsBySubscriptionKey ?? {})[heartbeatRequestKey];

  if (!request) {
    let message = `Previous heartbeat request has been sent less than ${
      client.heartbeatInterval
    } seconds ago. Skipping...`;
    let skipReason = 'too_frequent';
    
    if (!client.heartbeat || (client.heartbeat.channels.length === 0 && client.heartbeat.channelGroups.length === 0)) {
      message = `${client.clientIdentifier} doesn't have subscriptions to non-presence channels. Skipping...`;
      skipReason = 'no_channels';
    }
    
    consoleLog(message, client);
    
    // Update heartbeat metrics if provided
    if (hbMetrics) {
      hbMetrics.skipped = true;
      hbMetrics.skipReason = skipReason;
      hbMetrics.completedAt = Date.now();
      
      // Log the skip for metrics tracking
      const skipData = {
        clientId: client.clientIdentifier,
        reason: skipReason,
        metricsId: Object.entries(heartbeatMetrics).find(([_, m]) => m === hbMetrics)?.[0],
        timestamp: new Date().toISOString()
      };
      console.log(`[HeartbeatMetrics] Heartbeat skipped:`, skipData);
      
      // Broadcast the skip event
      broadcastMetrics('HeartbeatSkipped', skipData);
    }

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

  consoleLog(`Started heartbeat request.`, client);

  // Notify about request processing start.
  for (const client of clientsForSendHeartbeatRequestEvent(event))
    consoleLog({ messageType: 'network-request', message: request as unknown as Payload }, client);

  sendRequest(
    request,
    () => [client],
    (clients, fetchRequest, response) => {
      if (hbRequests) hbRequests.response = response;

      // Mark heartbeat as completed if metrics were provided
      if (hbMetrics && !hbMetrics.completedAt) {
        hbMetrics.completedAt = Date.now();
        hbMetrics.fetchCompletedAt = Date.now();
      }

      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, fetchRequest, response, event.request);

      // Stop heartbeat timer on client error status codes.
      if (response[0].status >= 400 && response[0].status < 500) stopHeartbeatTimer(client);
    },
    (clients, fetchRequest, error) => {
      // Mark heartbeat as completed with error if metrics were provided
      if (hbMetrics && !hbMetrics.completedAt) {
        hbMetrics.completedAt = Date.now();
        hbMetrics.error = error instanceof Error ? error.message : String(error);
      }

      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, fetchRequest, null, event.request, requestProcessingError(error));
    },
  );

  // Start "backup" heartbeat timer.
  if (!outOfOrder) startHeartbeatTimer(client);
};

/**
 * Handle client request to leave request.
 *
 * @param data - Leave event details.
 * @param [invalidatedClient] - Specific client to handle leave request.
 * @param [invalidatedClientServiceRequestId] - Identifier of the service request ID for which the invalidated
 * client waited for a subscribe response.
 */
const handleSendLeaveRequestEvent = (
  data: SendRequestEvent,
  invalidatedClient?: PubNubClientState,
  invalidatedClientServiceRequestId?: string,
) => {
  const client = invalidatedClient ?? pubNubClients[data.clientIdentifier];
  const request = leaveTransportRequestFromEvent(data, invalidatedClient);

  if (!client) return;

  // Clean up client subscription information if there is no more channels / groups to use.
  const { subscription, heartbeat } = client;
  const serviceRequestId = invalidatedClientServiceRequestId ?? subscription?.serviceRequestId;
  if (subscription && subscription.channels.length === 0 && subscription.channelGroups.length === 0) {
    subscription.channelGroupQuery = '';
    subscription.path = '';
    subscription.previousTimetoken = '0';
    subscription.refreshTimestamp = Date.now();
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

      delete heartbeat.heartbeatEvent;
      stopHeartbeatTimer(client);
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

  consoleLog(`Started leave request.`, client);

  // Notify about request processing start.
  for (const client of clientsForSendLeaveRequestEvent(data, invalidatedClient))
    consoleLog({ messageType: 'network-request', message: request as unknown as Payload }, client);

  sendRequest(
    request,
    () => [client],
    (clients, fetchRequest, response) => {
      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, fetchRequest, response, data.request);
    },
    (clients, fetchRequest, error) => {
      // Notify each PubNub client which awaited for response.
      notifyRequestProcessingResult(clients, fetchRequest, null, data.request, requestProcessingError(error));
    },
  );

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
  success: (clients: PubNubClientState[], fetchRequest: Request, response: [Response, ArrayBuffer]) => void,
  failure: (clients: PubNubClientState[], fetchRequest: Request, error: unknown) => void,
  responsePreProcess?: (response: [Response, ArrayBuffer]) => [Response, ArrayBuffer],
) => {
  // Initialize network metrics for this request
  const metrics: NetworkMetrics = {
    requestId: request.identifier,
    requestType: getRequestType(request),
    url: `${request.origin || ''}${request.path}`,
    method: request.method,
    queuedAt: Date.now(),
    queueDepthAtStart: pendingRequests.size,
    concurrentRequestsAtStart: pendingRequests.size,
  };

  // Extract channels/channel groups from request
  if (request.queryParameters) {
    const query = request.queryParameters;
    if (query['channel-group']) {
      metrics.channelGroups = (query['channel-group'] as string).split(',');
    }
    if (request.path.includes('/v2/subscribe/')) {
      // Extract channels from path for subscribe requests
      const pathParts = request.path.split('/');
      const channelsIndex = pathParts.indexOf('subscribe') + 2;
      if (channelsIndex < pathParts.length) {
        metrics.channels = decodeURIComponent(pathParts[channelsIndex]).split(',');
      }
    }
  }

  // Add to pending requests
  pendingRequests.set(request.identifier, metrics);
  networkMetrics.set(request.identifier, metrics);

  // Add to request queue for order tracking
  const queueOrder = requestOrder++;
  requestQueue.push({
    requestId: request.identifier,
    type: metrics.requestType,
    queuedAt: metrics.queuedAt,
    order: queueOrder
  });
  requestQueueMetrics.totalQueued++;
  requestQueueMetrics.maxQueueDepth = Math.max(requestQueueMetrics.maxQueueDepth, requestQueue.length);
  requestQueueMetrics.requestOrdering.set(request.identifier, { queueOrder, executionOrder: -1 });
  
  // Debug logging for queue metrics
  if (requestQueue.length > 1) {
    console.log(`[QueueMetrics] Request queued: ${metrics.requestType}`, {
      currentDepth: requestQueue.length,
      maxDepth: requestQueueMetrics.maxQueueDepth,
      totalQueued: requestQueueMetrics.totalQueued
    });
  }

  // Log initial metrics
  if (metrics.requestType === 'heartbeat') {
    console.log(`[NetworkTiming] Heartbeat request ${request.identifier} queued:`, {
      queueDepth: metrics.queueDepthAtStart,
      concurrent: metrics.concurrentRequestsAtStart,
      queuePosition: queueOrder,
      url: metrics.url,
      channels: metrics.channels?.length || 0,
      channelGroups: metrics.channelGroups?.length || 0
    });
  }

  (async () => {
    const fetchRequest = requestFromTransportRequest(request);
    
    // Mark fetch start time
    metrics.fetchStartedAt = Date.now();
    const queueDelay = metrics.fetchStartedAt - metrics.queuedAt;
    
    // Track execution order
    const orderInfo = requestQueueMetrics.requestOrdering.get(request.identifier);
    if (orderInfo) {
      orderInfo.executionOrder = requestOrder++;
      const outOfOrderBy = orderInfo.executionOrder - orderInfo.queueOrder;
      
      if (metrics.requestType === 'heartbeat' && outOfOrderBy > 5) {
        console.warn(`[RequestQueue] Heartbeat executed out of order by ${outOfOrderBy} positions`, {
          requestId: request.identifier,
          queueOrder: orderInfo.queueOrder,
          executionOrder: orderInfo.executionOrder
        });
      }
    }
    
    // Remove from queue
    const queueIndex = requestQueue.findIndex(r => r.requestId === request.identifier);
    if (queueIndex !== -1) {
      requestQueue.splice(queueIndex, 1);
    }
    
    // Track all heartbeat queue delays for better metrics
    if (metrics.requestType === 'heartbeat') {
      requestQueueMetrics.heartbeatDelays.push(queueDelay);
      
      // Keep only the last 100 heartbeat delays to avoid memory growth
      if (requestQueueMetrics.heartbeatDelays.length > 100) {
        requestQueueMetrics.heartbeatDelays.shift();
      }
      
      if (queueDelay > 100) {
        console.warn(`[NetworkTiming] Heartbeat delayed in queue: ${queueDelay}ms`, {
          requestId: request.identifier,
          queueDepth: pendingRequests.size,
          queueDelay,
          remainingInQueue: requestQueue.length
        });
      }
    }

    // Track connection
    const connectionKey = request.origin ? new URL(request.origin).hostname : 'unknown';
    activeConnections.set(request.identifier, { startTime: Date.now(), requestId: request.identifier });
    connectionMetrics.totalConnections++;
    connectionMetrics.maxConcurrent = Math.max(connectionMetrics.maxConcurrent, activeConnections.size);
    
    if (activeConnections.size > 6) {
      console.warn(`[ConnectionPool] High concurrent connections: ${activeConnections.size}`, {
        requestType: metrics.requestType,
        requestId: request.identifier,
        activeRequests: Array.from(activeConnections.keys())
      });
    }

    Promise.race([
      fetch(fetchRequest, {
        signal: abortControllers.get(request.identifier)?.signal,
        keepalive: true,
      }),
      requestTimeoutTimer(request.identifier, request.timeout),
    ])
      .then((response): Promise<[Response, ArrayBuffer]> | [Response, ArrayBuffer] =>
        response.arrayBuffer().then((buffer) => {
          metrics.responseSize = buffer.byteLength;
          metrics.status = response.status;
          return [response, buffer];
        }),
      )
      .then((response) => (responsePreProcess ? responsePreProcess(response) : response))
      .then((response) => {
        // Mark completion
        metrics.fetchCompletedAt = Date.now();
        pendingRequests.delete(request.identifier);
        activeConnections.delete(request.identifier);
        
        // Track executed request
        executedRequestsStats.total++;
        executedRequestsStats.success++;
        const requestType = metrics.requestType || 'other';
        executedRequestsStats.byType[requestType].total++;
        executedRequestsStats.byType[requestType].success++;

        // Add to buffer
        executedRequestsBuffer.push({
          id: request.identifier,
          url: metrics.url,
          type: metrics.requestType,
          duration: metrics.fetchCompletedAt! - metrics.queuedAt,
          status: metrics.status || 200,
          datetime: new Date().toISOString(),
          error: metrics.error
        });

        if (executedRequestsBuffer.length > MAX_EXECUTED_REQUESTS) {
          executedRequestsBuffer.shift();
        }
        
        // Log completion metrics
        logNetworkMetrics(metrics);
        
        const clients = getClients();
        if (clients.length === 0) return;

        success(clients, fetchRequest, response);
      })
      .catch((error) => {
        // Mark failure
        metrics.fetchCompletedAt = Date.now();
        metrics.error = error instanceof Error ? error.message : String(error);
        pendingRequests.delete(request.identifier);
        activeConnections.delete(request.identifier);
        
        // Track executed request (failure)
        executedRequestsStats.total++;
        executedRequestsStats.failed++;
        const requestType = metrics.requestType || 'other';
        executedRequestsStats.byType[requestType].total++;
        executedRequestsStats.byType[requestType].failed++;

        // Add to buffer
        executedRequestsBuffer.push({
          id: request.identifier,
          url: metrics.url,
          type: metrics.requestType,
          duration: Date.now() - metrics.queuedAt,
          status: 'error',
          datetime: new Date().toISOString(),
          error: metrics.error || 'Unknown error'
        });

        if (executedRequestsBuffer.length > MAX_EXECUTED_REQUESTS) {
          executedRequestsBuffer.shift();
        }
        
        // Log failure metrics
        logNetworkMetrics(metrics);
        
        const clients = getClients();
        if (clients.length === 0) return;

        let fetchError = error;

        if (typeof error === 'string') {
          const errorMessage = error.toLowerCase();
          fetchError = new Error(error);

          if (!errorMessage.includes('timeout') && errorMessage.includes('cancel')) fetchError.name = 'AbortError';
        }
        
        // Special logging for timeouts
        if (metrics.error && metrics.error.toLowerCase().includes('timeout')) {
          const timeoutData = {
            requestType: metrics.requestType,
            requestId: request.identifier,
            totalDuration: metrics.fetchCompletedAt! - metrics.queuedAt,
            queueTime: metrics.fetchStartedAt ? metrics.fetchStartedAt - metrics.queuedAt : 'unknown',
            networkTime: metrics.fetchStartedAt ? metrics.fetchCompletedAt! - metrics.fetchStartedAt : 'unknown',
            concurrentRequests: metrics.concurrentRequestsAtStart,
            activeConnectionsNow: activeConnections.size,
            channels: metrics.channels,
            channelGroups: metrics.channelGroups,
            url: metrics.url
          };
          
          console.error(`[NetworkTimeout] Request timed out after ${metrics.fetchCompletedAt! - metrics.queuedAt}ms:`, timeoutData);
          broadcastMetrics('NetworkTimeout', timeoutData);
          
          // Log state of all pending requests when timeout occurs
          if (metrics.requestType === 'heartbeat') {
            const systemState = {
              pendingRequests: Array.from(pendingRequests.entries()).map(([id, m]) => ({
                id,
                type: m.requestType,
                queuedFor: Date.now() - m.queuedAt,
                started: !!m.fetchStartedAt
              })),
              activeConnections: activeConnections.size,
              requestQueue: requestQueue.map(r => ({
                type: r.type,
                waitingFor: Date.now() - r.queuedAt
              }))
            };
            
            console.error(`[NetworkTimeout] Current system state at heartbeat timeout:`, systemState);
            broadcastMetrics('NetworkTimeout', { 
              event: 'heartbeat-timeout-state',
              ...systemState 
            });
          }
        }

        failure(clients, fetchRequest, fetchError);
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
  let previousSubscribeTimetokenRefreshTimestamp: number | undefined;
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
      if (_subscription.timetoken) {
        let shouldSetPreviousTimetoken = !previousSubscribeTimetoken;
        if (!shouldSetPreviousTimetoken && _subscription.timetoken !== '0') {
          if (previousSubscribeTimetoken === '0') shouldSetPreviousTimetoken = true;
          else if (_subscription.timetoken < previousSubscribeTimetoken!)
            shouldSetPreviousTimetoken = _subscription.refreshTimestamp > previousSubscribeTimetokenRefreshTimestamp!;
        }

        if (shouldSetPreviousTimetoken) {
          previousSubscribeTimetokenRefreshTimestamp = _subscription.refreshTimestamp;
          previousSubscribeTimetoken = _subscription.timetoken;
          previousSubscribeRegion = _subscription.region;
        }
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
    if (
      !serviceRequests[serviceRequestId].timetokenOverride ||
      (serviceRequests[serviceRequestId].timetokenOverride !== '0' &&
        previousSubscribeTimetoken &&
        previousSubscribeTimetoken !== '0')
    ) {
      serviceRequests[serviceRequestId].timetokenOverride = previousSubscribeTimetoken;
      serviceRequests[serviceRequestId].regionOverride = previousSubscribeRegion;
    }
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
 * @param [actualRequest] - Whether handling actual request from the core-part of the client and not backup heartbeat in
 * the `SharedWorker`.
 * @param [outOfOrder] - Whether handling request which is sent on irregular basis (setting update).
 *
 * @returns Final transport request or identifier from active request which will provide response to required
 * channels and groups.
 */
const heartbeatTransportRequestFromEvent = (
  event: SendRequestEvent,
  actualRequest: boolean,
  outOfOrder: boolean,
): TransportRequest | undefined => {
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
      createdByActualRequest: actualRequest,
      channels: channelsForAnnouncement,
      channelGroups: channelGroupsForAnnouncement,
      clientIdentifier: client.clientIdentifier,
      timestamp: Date.now(),
    };
    aggregatedState = client.heartbeat.presenceState ?? {};
    aggregated = false;
  } else {
    const { createdByActualRequest, channels, channelGroups, response } =
      hbRequestsBySubscriptionKey[heartbeatRequestKey];

    // Allow out-of-order call from the client for heartbeat initiated by the `SharedWorker`.
    if (!createdByActualRequest && actualRequest) {
      hbRequestsBySubscriptionKey[heartbeatRequestKey].createdByActualRequest = true;
      hbRequestsBySubscriptionKey[heartbeatRequestKey].timestamp = Date.now();
      outOfOrder = true;
    }

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

    // Request should be sent if a previous attempt failed.
    if (!outOfOrder && !failedPreviousRequest && currentTimestamp < expectedTimestamp) {
      // Check whether it is too soon to send request or not.
      const leeway = minimumHeartbeatInterval * 0.05 * 1000;

      if (minimumHeartbeatInterval - leeway <= 3) {
        // Leeway can't be applied if actual interval between heartbeat requests is smaller
        // than 3 seconds which derived from the server's threshold.
        return undefined;
      } else if (expectedTimestamp - currentTimestamp > leeway) return undefined;
    }
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
  if (!outOfOrder) hbRequestsBySubscriptionKey[heartbeatRequestKey].timestamp = Date.now();

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
 * @param event - Client's sending leave event request.
 * @param [invalidatedClient] - Invalidated PubNub client state.
 *
 * @returns Final transport request or `undefined` in case if there are no channels and groups for which request can be
 * done.
 */
const leaveTransportRequestFromEvent = (
  event: SendRequestEvent,
  invalidatedClient?: PubNubClientState,
): TransportRequest | undefined => {
  const client = invalidatedClient ?? pubNubClients[event.clientIdentifier];
  const clients = clientsForSendLeaveRequestEvent(event, invalidatedClient);
  let channelGroups = channelGroupsFromRequest(event.request);
  let channels = channelsFromRequest(event.request);
  const request = { ...event.request };

  // Remove channels / groups from active client's subscription.
  if (client && client.subscription) {
    const { subscription } = client;
    if (channels.length) {
      subscription.channels = subscription.channels.filter((channel) => !channels.includes(channel));

      // Modify cached request path.
      const pathComponents = subscription.path.split('/');

      if (pathComponents[4] !== ',') {
        const pathChannels = pathComponents[4].split(',').filter((channel) => !channels.includes(channel));
        pathComponents[4] = pathChannels.length ? pathChannels.join(',') : ',';
        subscription.path = pathComponents.join('/');
      }
    }
    if (channelGroups.length) {
      subscription.channelGroups = subscription.channelGroups.filter((group) => !channelGroups.includes(group));

      // Modify cached request path.
      if (subscription.channelGroupQuery.length > 0) {
        const queryChannelGroups = subscription.channelGroupQuery
          .split(',')
          .filter((group) => !channelGroups.includes(group));

        subscription.channelGroupQuery = queryChannelGroups.length ? queryChannelGroups.join(',') : '';
      }
    }
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
  const channelsAndGroupsCount = channels.length + channelGroups.length;
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

      if (channelsAndGroupsCount > 0) {
        consoleLog(
          `Leaving only presence channels which doesn't require presence leave. Ignoring leave request.`,
          client,
        );
      } else {
        consoleLog(
          `Specified channels and groups still in use by other clients: ${clientIds}. Ignoring leave request.`,
          client,
        );
      }
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
 * @param fetchRequest - Actual request which has been used with `fetch` API.
 * @param response - PubNub service response.
 * @param request - Processed request information.
 * @param [result] - Explicit request processing result which should be notified.
 */
const notifyRequestProcessingResult = (
  clients: PubNubClientState[],
  fetchRequest: Request,
  response: [Response, ArrayBuffer] | null,
  request: TransportRequest,
  result?: RequestSendingResult,
) => {
  if (clients.length === 0) return;
  if (!result && !response) return;

  const workerLogVerbosity = clients.some((client) => client && client.workerLogVerbosity);
  const clientIds = sharedWorkerClients[clients[0].subscriptionKey] ?? {};
  const isSubscribeRequest = request.path.startsWith('/v2/subscribe');

  if (!result && response) {
    result =
      response[0].status >= 400
        ? // Treat 4xx and 5xx status codes as errors.
          requestProcessingError(undefined, response)
        : requestProcessingSuccess(response);
  }

  const headers: Record<string, string> = {};
  let body: ArrayBuffer | undefined;
  let status = 200;

  // Compose request response object.
  if (response) {
    body = response[1].byteLength > 0 ? response[1] : undefined;
    const { headers: requestHeaders } = response[0];
    status = response[0].status;

    // Copy Headers object content into plain Record.
    requestHeaders.forEach((value, key) => (headers[key] = value.toLowerCase()));
  }
  const transportResponse: TransportResponse = { status, url: fetchRequest.url, headers, body };

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

      if (result!.type === 'request-process-success' && client.workerLogVerbosity)
        consoleLog({ messageType: 'network-response', message: transportResponse as unknown as Payload }, client);
      else if (result!.type === 'request-process-error' && client.workerLogVerbosity) {
        const canceled = result!.error ? result!.error!.type === 'TIMEOUT' || result!.error!.type === 'ABORTED' : false;
        let details = result!.error ? result!.error!.message : 'Unknown';
        if (payload.response) {
          const contentType = payload.response.headers['content-type'];

          if (
            payload.response.body &&
            contentType &&
            (contentType.indexOf('javascript') !== -1 || contentType.indexOf('json') !== -1)
          ) {
            try {
              const serviceResponse = JSON.parse(new TextDecoder().decode(payload.response.body));
              if ('message' in serviceResponse) details = serviceResponse.message;
              else if ('error' in serviceResponse) {
                if (typeof serviceResponse.error === 'string') details = serviceResponse.error;
                else if (typeof serviceResponse.error === 'object' && 'message' in serviceResponse.error)
                  details = serviceResponse.error.message;
              }
            } catch (_) {}
          }

          if (details === 'Unknown') {
            if (payload.response.status >= 500) details = 'Internal Server Error';
            else if (payload.response.status == 400) details = 'Bad request';
            else if (payload.response.status == 403) details = 'Access denied';
            else details = `${payload.response.status}`;
          }
        }

        consoleLog(
          {
            messageType: 'network-request',
            message: request as unknown as Payload,
            details,
            canceled,
            failed: !canceled,
          },
          client,
        );
      }

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
 * Update configuration of previously registered PubNub client.
 *
 * @param event - Object with up-to-date client settings, which should be reflected in SharedWorker's state for the
 * registered client.
 */
const updateClientInformation = (event: UpdateEvent) => {
  const { clientIdentifier, userId, heartbeatInterval, accessToken: authKey, preProcessedToken: token } = event;
  const client = pubNubClients[clientIdentifier];

  // This should never happen.
  if (!client) return;

  consoleDir({ userId, heartbeatInterval, authKey, token } as Payload, `Update client configuration:`, client);

  // Check whether identity changed as part of configuration update or not.
  if (userId !== client.userId || (authKey && authKey !== (client.authKey ?? ''))) {
    const _heartbeatRequests = serviceHeartbeatRequests[client.subscriptionKey] ?? {};
    const heartbeatRequestKey = `${userId}_${clientAggregateAuthKey(client) ?? ''}`;
    // Clean up previous heartbeat aggregation data.
    if (_heartbeatRequests[heartbeatRequestKey] !== undefined) delete _heartbeatRequests[heartbeatRequestKey];
  }

  const intervalChanged = client.heartbeatInterval !== heartbeatInterval;

  // Updating client configuration.
  client.userId = userId;
  client.heartbeatInterval = heartbeatInterval;
  if (authKey) client.authKey = authKey;
  if (token) client.accessToken = token;

  if (intervalChanged) startHeartbeatTimer(client, true);
  updateCachedRequestAuthKeys(client);

  // Make immediate heartbeat call (if possible).
  if (!client.heartbeat || !client.heartbeat.heartbeatEvent) return;
  handleHeartbeatRequestEvent(client.heartbeat.heartbeatEvent, false, true, undefined);
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
 * @returns `true` if channels / groups list has been changed. May return `undefined` because `client` is missing.
 */
const updateClientSubscribeStateIfRequired = (event: SendRequestEvent): boolean | undefined => {
  const query = event.request.queryParameters!;
  const { clientIdentifier } = event;
  const client = pubNubClients[clientIdentifier];
  let changed = false;

  // This should never happen.
  if (!client) return;

  const channelGroupQuery = (query!['channel-group'] ?? '') as string;
  const state = (query.state ?? '') as string;

  let subscription = client.subscription;
  if (!subscription) {
    changed = true;
    subscription = {
      refreshTimestamp: 0,
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
    const _channelsFromRequest = channelsFromRequest(event.request);
    if (!changed) changed = !includesStrings(subscription.channels, _channelsFromRequest);
    subscription.channels = _channelsFromRequest;
  }

  if (subscription.channelGroupQuery !== channelGroupQuery) {
    subscription.channelGroupQuery = channelGroupQuery;
    const _channelGroupsFromRequest = channelGroupsFromRequest(event.request);
    if (!changed) changed = !includesStrings(subscription.channelGroups, _channelGroupsFromRequest);
    subscription.channelGroups = _channelGroupsFromRequest;
  }

  let { authKey } = client;
  const { userId } = client;
  subscription.refreshTimestamp = Date.now();
  subscription.request = event.request;
  subscription.filterExpression = (query['filter-expr'] ?? '') as string;
  subscription.timetoken = (query.tt ?? '0') as string;
  if (query.tr !== undefined) subscription.region = query.tr as string;
  client.authKey = (query.auth ?? '') as string;
  client.origin = event.request.origin;
  client.userId = query.uuid as string;
  client.pnsdk = query.pnsdk as string;
  client.accessToken = event.preProcessedToken;

  if (client.newlyRegistered && !authKey && client.authKey) authKey = client.authKey;
  client.newlyRegistered = false;

  return changed;
};

/**
 * Update presence heartbeat information for previously registered client.
 *
 * Use information from request to populate list of channels / groups and presence state information.
 *
 * @param event - Send heartbeat request event.
 */
const updateClientHeartbeatState = (event: SendRequestEvent) => {
  const { clientIdentifier } = event;
  const client = pubNubClients[clientIdentifier];
  const { request } = event;
  const query = request.queryParameters ?? {};

  // This should never happen.
  if (!client) return;

  const _clientHeartbeat = (client.heartbeat ??= {
    channels: [],
    channelGroups: [],
  });
  _clientHeartbeat.heartbeatEvent = { ...event };

  // Update presence heartbeat information about client.
  _clientHeartbeat.channelGroups = channelGroupsFromRequest(request).filter((group) => !group.endsWith('-pnpres'));
  _clientHeartbeat.channels = channelsFromRequest(request).filter((channel) => !channel.endsWith('-pnpres'));

  const state = (query.state ?? '') as string;
  if (state.length > 0) {
    const userPresenceState = JSON.parse(state) as Record<string, Payload>;
    for (const objectName of Object.keys(userPresenceState))
      if (!_clientHeartbeat.channels.includes(objectName) && !_clientHeartbeat.channelGroups.includes(objectName))
        delete userPresenceState[objectName];
    _clientHeartbeat.presenceState = userPresenceState;
  }

  client.accessToken = event.preProcessedToken;
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
  let serviceRequestId: string | undefined;

  // Unsubscribe invalidated PubNub client.
  if (invalidatedClient) {
    // Cancel long-poll request if possible.
    if (invalidatedClient.subscription) {
      serviceRequestId = invalidatedClient.subscription.serviceRequestId;
      delete invalidatedClient.subscription.serviceRequestId;
      if (serviceRequestId) cancelRequest(serviceRequestId);
    }

    // Make sure to stop heartbeat timer.
    stopHeartbeatTimer(invalidatedClient);

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
    if (invalidatedClient.unsubscribeOfflineClients) unsubscribeClient(invalidatedClient, serviceRequestId);
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

/**
 * Unsubscribe offline / invalidated PubNub client.
 *
 * @param client - Invalidated PubNub client state object.
 * @param [invalidatedClientServiceRequestId] - Identifier of the service request ID for which the invalidated
 * client waited for a subscribe response.
 */
const unsubscribeClient = (client: PubNubClientState, invalidatedClientServiceRequestId?: string) => {
  if (!client.subscription) return;

  const { channels, channelGroups } = client.subscription;
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

  handleSendLeaveRequestEvent(request, client, invalidatedClientServiceRequestId);
};

/**
 * Start presence heartbeat timer for periodic `heartbeat` API calls.
 *
 * @param client - Client state with information for heartbeat.
 * @param [adjust] - Whether timer fire timer should be re-adjusted or not.
 */
const startHeartbeatTimer = (client: PubNubClientState, adjust: boolean = false) => {
  const { heartbeat, heartbeatInterval } = client;

  // Check whether there is a need to run "backup" heartbeat timer or not.
  const shouldStart =
    heartbeatInterval &&
    heartbeatInterval > 0 &&
    heartbeat !== undefined &&
    heartbeat.heartbeatEvent &&
    (heartbeat.channels.length > 0 || heartbeat.channelGroups.length > 0);
  if (!shouldStart) {
    stopHeartbeatTimer(client);
    return;
  }

  // Check whether there is active timer which should be re-adjusted or not.
  if (adjust && !heartbeat.loop) return;

  let targetInterval = heartbeatInterval;
  if (adjust && heartbeat.loop && targetInterval !== heartbeat.loop.heartbeatInterval) {
    const activeTime = (Date.now() - heartbeat.loop.startTimestamp) / 1000;
    if (activeTime < targetInterval) targetInterval -= activeTime;
  }

  stopHeartbeatTimer(client);
  if (targetInterval <= 0) return;

  const scheduledAt = Date.now();
  const expectedFireAt = scheduledAt + (targetInterval * 1000);
  
  // Create heartbeat metrics entry
  const hbMetricsId = `hb-${client.clientIdentifier}-${scheduledAt}`;
  const hbMetrics: HeartbeatMetrics = {
    scheduledAt,
    expectedFireAt,
    queueDepthAtFire: pendingRequests.size
  };
  heartbeatMetrics.set(hbMetricsId, hbMetrics);

  const scheduleData = {
    targetInterval,
    expectedFireAt: new Date(expectedFireAt).toISOString(),
    currentPendingRequests: pendingRequests.size,
    channels: heartbeat.channels.length,
    channelGroups: heartbeat.channelGroups.length
  };
  
  console.log(`[HeartbeatTimer] Scheduling heartbeat for client ${client.clientIdentifier}:`, scheduleData);
  broadcastMetrics('HeartbeatTimer', { 
    event: 'scheduled',
    clientId: client.clientIdentifier,
    ...scheduleData
  });

  heartbeat.loop = {
    timer: setTimeout(() => {
      const actualFiredAt = Date.now();
      hbMetrics.actualFiredAt = actualFiredAt;
      hbMetrics.delayFromExpected = actualFiredAt - expectedFireAt;
      hbMetrics.queueDepthAtFire = pendingRequests.size;
      
      if (Math.abs(hbMetrics.delayFromExpected) > 100) {
        console.warn(`[HeartbeatTimer] Heartbeat timer fired ${hbMetrics.delayFromExpected}ms off schedule:`, {
          clientId: client.clientIdentifier,
          expected: new Date(expectedFireAt).toISOString(),
          actual: new Date(actualFiredAt).toISOString(),
          delay: hbMetrics.delayFromExpected,
          pendingRequests: pendingRequests.size
        });
      }

      stopHeartbeatTimer(client);
      if (!client.heartbeat || !client.heartbeat.heartbeatEvent) {
        hbMetrics.skipped = true;
        hbMetrics.skipReason = 'No heartbeat event available';
        return;
      }

      // Generate new request ID
      const { request } = client.heartbeat.heartbeatEvent;
      request.identifier = uuidGenerator.createUUID();
      request.queryParameters!.requestid = request.identifier;
      
      // Link heartbeat metrics to network request
      const networkMetricsForHB = networkMetrics.get(request.identifier);
      if (networkMetricsForHB) {
        networkMetricsForHB.timerToFetchDelay = Date.now() - actualFiredAt;
      }

      handleHeartbeatRequestEvent(client.heartbeat.heartbeatEvent, false, false, hbMetrics);
    }, targetInterval * 1000),
    heartbeatInterval,
    startTimestamp: scheduledAt,
  };
};

/**
 * Stop presence heartbeat timer before it will fire.
 *
 * @param client - Client state for which presence heartbeat timer should be stopped.
 */
const stopHeartbeatTimer = (client: PubNubClientState) => {
  const { heartbeat } = client;
  if (heartbeat === undefined || !heartbeat.loop) return;

  clearTimeout(heartbeat.loop.timer);
  delete heartbeat.loop;
};

/**
 * Refresh authentication key stored in cached `subscribe` and `heartbeat` requests.
 *
 * @param client - Client state for which cached requests should be updated.
 */
const updateCachedRequestAuthKeys = (client: PubNubClientState) => {
  const { subscription, heartbeat } = client;

  // Update `auth` query for cached subscribe request (if required).
  if (subscription && subscription.request && subscription.request.queryParameters) {
    const query = subscription.request.queryParameters;
    if (client.authKey && client.authKey.length > 0) query.auth = client.authKey;
    else if (query.auth) delete query.auth;
  }

  // Update `auth` query for cached heartbeat request (if required).
  if (heartbeat?.heartbeatEvent && heartbeat.heartbeatEvent.request) {
    if (client.accessToken) heartbeat.heartbeatEvent.preProcessedToken = client.accessToken;

    const hbRequestsBySubscriptionKey = (serviceHeartbeatRequests[client.subscriptionKey] ??= {});
    const heartbeatRequestKey = `${client.userId}_${clientAggregateAuthKey(client) ?? ''}`;
    if (hbRequestsBySubscriptionKey[heartbeatRequestKey] && hbRequestsBySubscriptionKey[heartbeatRequestKey].response)
      delete hbRequestsBySubscriptionKey[heartbeatRequestKey].response;

    // Generate new request ID
    heartbeat.heartbeatEvent.request.identifier = uuidGenerator.createUUID();

    const query = heartbeat.heartbeatEvent.request.queryParameters!;
    query.requestid = heartbeat.heartbeatEvent.request.identifier;
    if (client.authKey && client.authKey.length > 0) query.auth = client.authKey;
    else if (query.auth) delete query.auth;
  }
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
 * @param [invalidatedClient] - Invalidated PubNub client state.
 *
 * @returns List of PubNub client states which works from other pages for the same user.
 */
const clientsForSendLeaveRequestEvent = (event: SendRequestEvent, invalidatedClient?: PubNubClientState) => {
  const reqClient = invalidatedClient ?? pubNubClients[event.clientIdentifier];
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
const consoleLog = (message: Payload, client?: PubNubClientState): void => {
  // TODO: cleanup this afterwards
  // const clients = (client ? [client] : Object.values(pubNubClients)).filter(
  //   (client) => client && client.workerLogVerbosity,
  // );
  // const payload: SharedWorkerConsoleLog = {
  //   type: 'shared-worker-console-log',
  //   message,
  // };

  // clients.forEach((client) => {
  //   if (client) publishClientEvent(client, payload);
  // });
  console.log(message);
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
