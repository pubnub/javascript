// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types
// region Client-side

import { TransportRequest } from '../../core/types/transport-request';
import { LogLevel, LogMessage } from '../../core/interfaces/logger';
import { Payload } from '../../core/types/api';

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
   * Minimum messages log level which should be passed to the Subscription worker logger.
   */
  workerLogLevel: LogLevel;

  /**
   * Interval at which Shared Worker should check whether PubNub instances which used it still active or not.
   */
  workerOfflineClientsCheckInterval?: number;

  /**
   * Whether `leave` request should be sent for _offline_ PubNub client or not.
   */
  workerUnsubscribeOfflineClients?: boolean;
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
  preProcessedToken?: { token: string; expiration: number };
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
 * Client response on PING request.
 */
export type PongEvent = BasicEvent & {
  type: 'client-pong';
};

/**
 * PubNub client disconnection event.
 *
 * On disconnection will be cleared subscription/heartbeat state and active backup heartbeat timer.
 */
export type DisconnectEvent = BasicEvent & {
  type: 'client-disconnect';
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
  | DisconnectEvent
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
 * Logger's message type definition.
 */
export type ClientLogMessage = Omit<LogMessage, 'timestamp' | 'pubNubId' | 'level' | 'minimumLevel'>;

// endregion
