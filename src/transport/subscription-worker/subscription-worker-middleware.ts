/**
 * Subscription Worker transport middleware module.
 *
 * Middleware optimize subscription feature requests utilizing `Subscription Worker` if available and not disabled
 * by user.
 *
 * @internal
 */

import { CancellationController, TransportRequest } from '../../core/types/transport-request';
import { TransportResponse } from '../../core/types/transport-response';
import * as PubNubSubscriptionWorker from './subscription-worker-types';
import { LoggerManager } from '../../core/components/logger-manager';
import { LogLevel, LogMessage } from '../../core/interfaces/logger';
import { Status, StatusEvent, Payload } from '../../core/types/api';
import { TokenManager } from '../../core/components/token_manager';
import { RequestSendingError } from './subscription-worker-types';
import { PubNubAPIError } from '../../errors/pubnub-api-error';
import StatusCategory from '../../core/constants/categories';
import { Transport } from '../../core/interfaces/transport';
import * as PAM from '../../core/types/api/access-manager';
import PNOperations from '../../core/constants/operations';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

type PubNubMiddlewareConfiguration = {
  /**
   * Unique PubNub SDK client identifier.
   */
  clientIdentifier: string;

  /**
   * Subscribe REST API access key.
   */
  subscriptionKey: string;

  /**
   * Unique identifier of the user for which PubNub SDK client has been created.
   */
  userId: string;

  /**
   * Url of the hosted `Subscription` worker file.
   */
  workerUrl: string;

  /**
   * Current PubNub client version.
   */
  sdkVersion: string;

  /**
   * Interval at which Shared Worker should check whether PubNub instances which used it still active or not.
   */
  workerOfflineClientsCheckInterval: number;

  /**
   * Whether `leave` request should be sent for _offline_ PubNub client or not.
   */
  workerUnsubscribeOfflineClients: boolean;

  /**
   * Minimum messages log level which should be passed to the `Subscription` worker logger.
   */
  workerLogLevel: LogLevel;

  /**
   * Whether heartbeat request success should be announced or not.
   *
   * @default `false`
   */
  announceSuccessfulHeartbeats: boolean;

  /**
   * Whether heartbeat request failure should be announced or not.
   *
   * @default `true`
   */
  announceFailedHeartbeats: boolean;

  /**
   * How often the client will announce itself to server. The value is in seconds.
   *
   * @default `not set`
   */
  heartbeatInterval?: number;

  /**
   * REST API endpoints access tokens manager.
   */
  tokenManager?: TokenManager;

  /**
   * Platform-specific transport for requests processing.
   */
  transport: Transport;

  /**
   * Registered logger's manager.
   */
  logger: LoggerManager;
};

// endregion

/**
 * Subscription Worker transport middleware.
 */
export class SubscriptionWorkerMiddleware implements Transport {
  /**
   * Scheduled requests result handling callback.
   */
  private callbacks?: Map<string, { resolve: (value: TransportResponse) => void; reject: (value: Error) => void }>;

  /**
   * Subscription shared worker.
   *
   * **Note:** Browser PubNub SDK Transport provider adjustment for explicit subscription / leave features support.
   */
  private subscriptionWorker?: SharedWorker;

  /**
   * Queue of events for service worker.
   *
   * Keep list of events which should be sent to the worker after its activation.
   */
  private workerEventsQueue: PubNubSubscriptionWorker.ClientEvent[];

  /**
   * Whether subscription worker has been initialized and ready to handle events.
   */
  private subscriptionWorkerReady: boolean = false;

  /**
   * Map of base64-encoded access tokens to their parsed representations.
   */
  private accessTokensMap: Record<
    string,
    {
      token: string;
      expiration: number;
    }
  > = {};

  /**
   * Function which is used to emit PubNub client-related status changes.
   */
  private _emitStatus?: (status: Status | StatusEvent) => void;

  constructor(private readonly configuration: PubNubMiddlewareConfiguration) {
    this.workerEventsQueue = [];
    this.callbacks = new Map();

    this.setupSubscriptionWorker();
  }

  /**
   * Set status emitter from the PubNub client.
   *
   * @param emitter - Function which should be used to emit events.
   */
  set emitStatus(emitter: (status: Status | StatusEvent) => void) {
    this._emitStatus = emitter;
  }

  /**
   * Update client's `userId`.
   *
   * @param userId - User ID which will be used by the PubNub client further.
   */
  onUserIdChange(userId: string) {
    this.configuration.userId = userId;

    this.scheduleEventPost({
      type: 'client-update',
      heartbeatInterval: this.configuration.heartbeatInterval,
      clientIdentifier: this.configuration.clientIdentifier,
      subscriptionKey: this.configuration.subscriptionKey,
      userId: this.configuration.userId,
      workerLogLevel: this.configuration.workerLogLevel,
    });
  }

  /**
   * Update presence state associated with `userId`.
   *
   * @param state - Key-value pair of payloads (states) that should be associated with channels / groups specified as
   * keys.
   */
  onPresenceStateChange(state: Record<string, Payload>) {
    this.scheduleEventPost({
      type: 'client-presence-state-update',
      clientIdentifier: this.configuration.clientIdentifier,
      subscriptionKey: this.configuration.subscriptionKey,
      workerLogLevel: this.configuration.workerLogLevel,
      state,
    });
  }

  /**
   * Update client's heartbeat interval change.
   *
   * @param interval - Interval which should be used by timers for _backup_ heartbeat calls created in `SharedWorker`.
   */
  onHeartbeatIntervalChange(interval: number) {
    this.configuration.heartbeatInterval = interval;

    this.scheduleEventPost({
      type: 'client-update',
      heartbeatInterval: this.configuration.heartbeatInterval,
      clientIdentifier: this.configuration.clientIdentifier,
      subscriptionKey: this.configuration.subscriptionKey,
      userId: this.configuration.userId,
      workerLogLevel: this.configuration.workerLogLevel,
    });
  }

  /**
   * Handle authorization key / token change.
   *
   * @param [token] - Authorization token which should be used.
   */
  onTokenChange(token: string | undefined) {
    const updateEvent: PubNubSubscriptionWorker.UpdateEvent = {
      type: 'client-update',
      heartbeatInterval: this.configuration.heartbeatInterval,
      clientIdentifier: this.configuration.clientIdentifier,
      subscriptionKey: this.configuration.subscriptionKey,
      userId: this.configuration.userId,
      workerLogLevel: this.configuration.workerLogLevel,
    };

    // Trigger request processing by Service Worker.
    this.parsedAccessToken(token)
      .then((accessToken) => {
        updateEvent.preProcessedToken = accessToken;
        updateEvent.accessToken = token;
      })
      .then(() => this.scheduleEventPost(updateEvent));
  }

  /**
   * Disconnect client and terminate ongoing long-poll requests (if needed).
   */
  disconnect() {
    this.scheduleEventPost({
      type: 'client-disconnect',
      clientIdentifier: this.configuration.clientIdentifier,
      subscriptionKey: this.configuration.subscriptionKey,
      workerLogLevel: this.configuration.workerLogLevel,
    });
  }

  /**
   * Terminate all ongoing long-poll requests.
   */
  terminate() {
    this.scheduleEventPost({
      type: 'client-unregister',
      clientIdentifier: this.configuration.clientIdentifier,
      subscriptionKey: this.configuration.subscriptionKey,
      workerLogLevel: this.configuration.workerLogLevel,
    });
  }

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    // Use default request flow for non-subscribe / presence leave requests.
    if (!req.path.startsWith('/v2/subscribe') && !req.path.endsWith('/heartbeat') && !req.path.endsWith('/leave'))
      return this.configuration.transport.makeSendable(req);

    this.configuration.logger.debug('SubscriptionWorkerMiddleware', 'Process request with SharedWorker transport.');

    let controller: CancellationController | undefined;
    const sendRequestEvent: PubNubSubscriptionWorker.SendRequestEvent = {
      type: 'send-request',
      clientIdentifier: this.configuration.clientIdentifier,
      subscriptionKey: this.configuration.subscriptionKey,
      request: req,
      workerLogLevel: this.configuration.workerLogLevel,
    };

    if (req.cancellable) {
      controller = {
        abort: () => {
          const cancelRequest: PubNubSubscriptionWorker.CancelRequestEvent = {
            type: 'cancel-request',
            clientIdentifier: this.configuration.clientIdentifier,
            subscriptionKey: this.configuration.subscriptionKey,
            identifier: req.identifier,
            workerLogLevel: this.configuration.workerLogLevel,
          };

          // Cancel active request with specified identifier.
          this.scheduleEventPost(cancelRequest);
        },
      };
    }

    return [
      new Promise((resolve, reject) => {
        // Associate Promise resolution / reject with a request identifier for future usage in
        //  the `onmessage ` handler block to return results.
        this.callbacks!.set(req.identifier, { resolve, reject });

        // Trigger request processing by Service Worker.
        this.parsedAccessTokenForRequest(req)
          .then((accessToken) => (sendRequestEvent.preProcessedToken = accessToken))
          .then(() => this.scheduleEventPost(sendRequestEvent));
      }),
      controller,
    ];
  }

  request(req: TransportRequest): TransportRequest {
    return req;
  }

  /**
   * Schedule {@link event} publish to the subscription worker.
   *
   * Subscription worker may not be ready for events processing and this method build queue for the time when worker
   * will be ready.
   *
   * @param event - Event payload for the subscription worker.
   * @param outOfOrder - Whether event should be processed first then enqueued queue.
   */
  private scheduleEventPost(event: PubNubSubscriptionWorker.ClientEvent, outOfOrder: boolean = false) {
    // Trigger request processing by a subscription worker.
    const subscriptionWorker = this.sharedSubscriptionWorker;
    if (subscriptionWorker) subscriptionWorker.port.postMessage(event);
    else {
      if (outOfOrder) this.workerEventsQueue.splice(0, 0, event);
      else this.workerEventsQueue.push(event);
    }
  }

  /**
   * Dequeue and post events from the queue to the subscription worker.
   */
  private flushScheduledEvents(): void {
    // Trigger request processing by a subscription worker.
    const subscriptionWorker = this.sharedSubscriptionWorker;
    if (!subscriptionWorker || this.workerEventsQueue.length === 0) return;

    // Clean up from canceled events.
    const outdatedEvents: PubNubSubscriptionWorker.ClientEvent[] = [];
    for (let i = 0; i < this.workerEventsQueue.length; i++) {
      const event = this.workerEventsQueue[i];

      // Check whether found request cancel event to search for request send event it cancels.
      if (event.type !== 'cancel-request' || i === 0) continue;

      for (let j = 0; j < i; j++) {
        const otherEvent = this.workerEventsQueue[j];
        if (otherEvent.type !== 'send-request') continue;

        // Collect outdated events if identifiers match.
        if (otherEvent.request.identifier === event.identifier) {
          outdatedEvents.push(event, otherEvent);
          break;
        }
      }
    }

    // Actualizing events queue.
    this.workerEventsQueue = this.workerEventsQueue.filter((event) => !outdatedEvents.includes(event));
    this.workerEventsQueue.forEach((event) => subscriptionWorker.port.postMessage(event));
    this.workerEventsQueue = [];
  }

  /**
   * Subscription worker.
   *
   * @returns Worker which has been registered by the PubNub SDK.
   */
  private get sharedSubscriptionWorker() {
    return this.subscriptionWorkerReady ? this.subscriptionWorker : null;
  }

  private setupSubscriptionWorker(): void {
    if (typeof SharedWorker === 'undefined') return;

    try {
      this.subscriptionWorker = new SharedWorker(
        this.configuration.workerUrl,
        `/pubnub-${this.configuration.sdkVersion}`,
      );
    } catch (error) {
      this.configuration.logger.error('SubscriptionWorkerMiddleware', () => ({
        messageType: 'error',
        message: error,
      }));

      throw error;
    }

    this.subscriptionWorker.port.start();

    // Register PubNub client within subscription worker.
    this.scheduleEventPost(
      {
        type: 'client-register',
        clientIdentifier: this.configuration.clientIdentifier,
        subscriptionKey: this.configuration.subscriptionKey,
        userId: this.configuration.userId,
        heartbeatInterval: this.configuration.heartbeatInterval,
        workerOfflineClientsCheckInterval: this.configuration.workerOfflineClientsCheckInterval,
        workerUnsubscribeOfflineClients: this.configuration.workerUnsubscribeOfflineClients,
        workerLogLevel: this.configuration.workerLogLevel,
      },
      true,
    );

    this.subscriptionWorker.port.onmessage = (event) => this.handleWorkerEvent(event);

    if (this.shouldAnnounceNewerSharedWorkerVersionAvailability())
      localStorage.setItem('PNSubscriptionSharedWorkerVersion', this.configuration.sdkVersion);

    window.addEventListener('storage', (event) => {
      if (event.key !== 'PNSubscriptionSharedWorkerVersion' || !event.newValue) return;
      if (this._emitStatus && this.isNewerSharedWorkerVersion(event.newValue))
        this._emitStatus({ error: false, category: StatusCategory.PNSharedWorkerUpdatedCategory });
    });
  }

  private handleWorkerEvent(event: MessageEvent<PubNubSubscriptionWorker.SubscriptionWorkerEvent>) {
    const { data } = event;

    // Ignoring updates not related to this instance.
    if (
      data.type !== 'shared-worker-ping' &&
      data.type !== 'shared-worker-connected' &&
      data.type !== 'shared-worker-console-log' &&
      data.type !== 'shared-worker-console-dir' &&
      data.clientIdentifier !== this.configuration.clientIdentifier
    )
      return;

    if (data.type === 'shared-worker-connected') {
      this.configuration.logger.trace('SharedWorker', 'Ready for events processing.');
      this.subscriptionWorkerReady = true;
      this.flushScheduledEvents();
    } else if (data.type === 'shared-worker-console-log') {
      this.configuration.logger.debug('SharedWorker', () => {
        if (typeof data.message === 'string' || typeof data.message === 'number' || typeof data.message === 'boolean') {
          return {
            messageType: 'text',
            message: data.message,
          };
        }

        return data.message as Pick<LogMessage, 'messageType' | 'message'>;
      });
    } else if (data.type === 'shared-worker-console-dir') {
      this.configuration.logger.debug('SharedWorker', () => {
        return {
          messageType: 'object',
          message: data.data,
          details: data.message ? data.message : undefined,
        };
      });
    } else if (data.type === 'shared-worker-ping') {
      const { subscriptionKey, clientIdentifier } = this.configuration;

      this.scheduleEventPost({
        type: 'client-pong',
        subscriptionKey,
        clientIdentifier,
        workerLogLevel: this.configuration.workerLogLevel,
      });
    } else if (data.type === 'request-process-success' || data.type === 'request-process-error') {
      if (this.callbacks!.has(data.identifier)) {
        const { resolve, reject } = this.callbacks!.get(data.identifier)!;
        this.callbacks!.delete(data.identifier);

        if (data.type === 'request-process-success') {
          resolve({
            status: data.response.status,
            url: data.url,
            headers: data.response.headers,
            body: data.response.body,
          });
        } else reject(this.errorFromRequestSendingError(data));
      }
      // Handling "backup" heartbeat which doesn't have registered callbacks.
      else if (this._emitStatus && data.url.indexOf('/v2/presence') >= 0 && data.url.indexOf('/heartbeat') >= 0) {
        if (data.type === 'request-process-success' && this.configuration.announceSuccessfulHeartbeats) {
          this._emitStatus({
            statusCode: data.response.status,
            error: false,
            operation: PNOperations.PNHeartbeatOperation,
            category: StatusCategory.PNAcknowledgmentCategory,
          });
        } else if (data.type === 'request-process-error' && this.configuration.announceFailedHeartbeats)
          this._emitStatus(this.errorFromRequestSendingError(data).toStatus(PNOperations.PNHeartbeatOperation));
      }
    }
  }

  /**
   * Get parsed access token object from request.
   *
   * @param req - Transport request which may contain access token for processing.
   *
   * @returns Object with stringified access token information and expiration date information.
   */
  private async parsedAccessTokenForRequest(req: TransportRequest) {
    return this.parsedAccessToken(req.queryParameters ? ((req.queryParameters.auth as string) ?? '') : undefined);
  }

  /**
   * Get parsed access token object.
   *
   * @param accessToken - Access token for processing.
   *
   * @returns Object with stringified access token information and expiration date information.
   */
  private async parsedAccessToken(accessToken: string | undefined) {
    if (!accessToken) return undefined;
    else if (this.accessTokensMap[accessToken]) return this.accessTokensMap[accessToken];

    return this.stringifyAccessToken(accessToken).then(([token, stringifiedToken]) => {
      if (!token || !stringifiedToken) return undefined;

      return (this.accessTokensMap = {
        [accessToken]: { token: stringifiedToken, expiration: token.timestamp + token.ttl * 60 },
      })[accessToken];
    });
  }

  /**
   * Stringify access token content.
   *
   * Stringify information about resources with permissions.
   *
   * @param tokenString - Base64-encoded access token which should be parsed and stringified.
   *
   * @returns Tuple with parsed access token and its stringified content hash string.
   */
  private async stringifyAccessToken(tokenString: string): Promise<[PAM.Token | undefined, string | undefined]> {
    if (!this.configuration.tokenManager) return [undefined, undefined];
    const token = this.configuration.tokenManager.parseToken(tokenString);
    if (!token) return [undefined, undefined];

    // Translate permission to short string built from first chars of enabled permission.
    const stringifyPermissions = (permission: PAM.Permissions) =>
      Object.entries(permission)
        .filter(([_, v]) => v)
        .map(([k]) => k[0])
        .sort()
        .join('');

    const stringifyResources = (resource: PAM.Token['resources']) =>
      resource
        ? Object.entries(resource)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([type, entries]) =>
              Object.entries(entries || {})
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([name, perms]) => `${type}:${name}=${perms ? stringifyPermissions(perms) : ''}`)
                .join(','),
            )
            .join(';')
        : '';

    let accessToken = [stringifyResources(token.resources), stringifyResources(token.patterns), token.authorized_uuid]
      .filter(Boolean)
      .join('|');

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(accessToken));
      accessToken = String.fromCharCode(...Array.from(new Uint8Array(hash)));
    }

    return [token, typeof btoa !== 'undefined' ? btoa(accessToken) : accessToken];
  }

  /**
   * Create error from failure received from the `SharedWorker`.
   *
   * @param sendingError - Request sending error received from the `SharedWorker`.
   *
   * @returns `PubNubAPIError` instance with request processing failure information.
   */
  private errorFromRequestSendingError(sendingError: RequestSendingError): PubNubAPIError {
    let category: StatusCategory = StatusCategory.PNUnknownCategory;
    let message = 'Unknown error';

    // Handle client-side issues (if any).
    if (sendingError.error) {
      if (sendingError.error.type === 'NETWORK_ISSUE') category = StatusCategory.PNNetworkIssuesCategory;
      else if (sendingError.error.type === 'TIMEOUT') category = StatusCategory.PNTimeoutCategory;
      else if (sendingError.error.type === 'ABORTED') category = StatusCategory.PNCancelledCategory;
      message = `${sendingError.error.message} (${sendingError.identifier})`;
    }
    // Handle service error response.
    else if (sendingError.response) {
      const { url, response } = sendingError;

      return PubNubAPIError.create(
        { url, headers: response.headers, body: response.body, status: response.status },
        response.body,
      );
    }

    return new PubNubAPIError(message, category, 0, new Error(message));
  }

  /**
   * Check whether current subscription `SharedWorker` version should be announced or not.
   *
   * @returns `true` if local storage is empty (only newer version will add value) or stored version is smaller than
   * current.
   */
  private shouldAnnounceNewerSharedWorkerVersionAvailability() {
    const version = localStorage.getItem('PNSubscriptionSharedWorkerVersion');
    if (!version) return true;

    return !this.isNewerSharedWorkerVersion(version);
  }

  /**
   * Check whether current subscription `SharedWorker` version should be announced or not.
   *
   * @param version - Stored (received on init or event) version of subscription shared worker.
   * @returns `true` if provided `version` is newer than current client version.
   */
  private isNewerSharedWorkerVersion(version: string) {
    const [currentMajor, currentMinor, currentPatch] = this.configuration.sdkVersion.split('.').map(Number);
    const [storedMajor, storedMinor, storedPatch] = version.split('.').map(Number);

    return storedMajor > currentMajor || storedMinor > currentMinor || storedPatch > currentPatch;
  }
}
