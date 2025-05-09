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
import { TokenManager } from '../../core/components/token_manager';
import * as PubNubSubscriptionWorker from './subscription-worker';
import { PubNubAPIError } from '../../errors/pubnub-api-error';
import StatusCategory from '../../core/constants/categories';
import { Transport } from '../../core/interfaces/transport';
import * as PAM from '../../core/types/api/access-manager';

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
   * Whether verbose logging enabled or not.
   */
  logVerbosity: boolean;

  /**
   * Interval at which Shared Worker should check whether PubNub instances which used it still active or not.
   */
  workerOfflineClientsCheckInterval: number;

  /**
   * Whether `leave` request should be sent for _offline_ PubNub client or not.
   */
  workerUnsubscribeOfflineClients: boolean;

  /**
   * Whether verbose logging should be enabled for `Subscription` worker should print debug messages or not.
   */
  workerLogVerbosity: boolean;

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
};

// endregion

/**
 * Subscription Worker transport middleware.
 */
export class SubscriptionWorkerMiddleware implements Transport {
  /**
   * Scheduled requests result handling callback.
   */
  callbacks?: Map<string, { resolve: (value: TransportResponse) => void; reject: (value: Error) => void }>;

  /**
   * Subscription shared worker.
   *
   * **Note:** Browser PubNub SDK Transport provider adjustment for explicit subscription / leave features support.
   */
  subscriptionWorker?: SharedWorker;

  /**
   * Queue of events for service worker.
   *
   * Keep list of events which should be sent to the worker after its activation.
   */
  workerEventsQueue: PubNubSubscriptionWorker.ClientEvent[];

  /**
   * Whether subscription worker has been initialized and ready to handle events.
   */
  subscriptionWorkerReady: boolean = false;

  /**
   * Map of base64-encoded access tokens to their parsed representations.
   */
  accessTokensMap: Record<
    string,
    {
      token: string;
      expiration: number;
    }
  > = {};

  constructor(private readonly configuration: PubNubMiddlewareConfiguration) {
    this.workerEventsQueue = [];
    this.callbacks = new Map();

    this.setupSubscriptionWorker();
  }

  /**
   * Terminate all ongoing long-poll requests.
   */
  terminate() {
    this.scheduleEventPost({
      type: 'client-unregister',
      clientIdentifier: this.configuration.clientIdentifier,
      subscriptionKey: this.configuration.subscriptionKey,
      logVerbosity: this.configuration.logVerbosity,
    });
  }

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    // Use default request flow for non-subscribe / presence leave requests.
    if (!req.path.startsWith('/v2/subscribe') && !req.path.endsWith('/heartbeat') && !req.path.endsWith('/leave'))
      return this.configuration.transport.makeSendable(req);

    let controller: CancellationController | undefined;
    const sendRequestEvent: PubNubSubscriptionWorker.SendRequestEvent = {
      type: 'send-request',
      clientIdentifier: this.configuration.clientIdentifier,
      subscriptionKey: this.configuration.subscriptionKey,
      logVerbosity: this.configuration.logVerbosity,
      request: req,
    };

    if (req.cancellable) {
      controller = {
        abort: () => {
          const cancelRequest: PubNubSubscriptionWorker.CancelRequestEvent = {
            type: 'cancel-request',
            clientIdentifier: this.configuration.clientIdentifier,
            subscriptionKey: this.configuration.subscriptionKey,
            logVerbosity: this.configuration.logVerbosity,
            identifier: req.identifier,
          };

          // Cancel active request with specified identifier.
          this.scheduleEventPost(cancelRequest);
        },
      };
    }

    return [
      new Promise((resolve, reject) => {
        // Associate Promise resolution / reject with request identifier for future usage in
        // `onmessage` handler block to return results.
        this.callbacks!.set(req.identifier, { resolve, reject });

        // Trigger request processing by Service Worker.
        this.parsedAccessTokenForRequest(req)
          .then((accessToken) => (sendRequestEvent.token = accessToken))
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
    // Trigger request processing by subscription worker.
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
    // Trigger request processing by subscription worker.
    const subscriptionWorker = this.sharedSubscriptionWorker;
    if (!subscriptionWorker || this.workerEventsQueue.length === 0) return;

    // Clean up from cancelled events.
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

    this.subscriptionWorker = new SharedWorker(
      this.configuration.workerUrl,
      `/pubnub-${this.configuration.sdkVersion}`,
    );

    this.subscriptionWorker.port.start();

    // Register PubNub client within subscription worker.
    this.scheduleEventPost(
      {
        type: 'client-register',
        clientIdentifier: this.configuration.clientIdentifier,
        subscriptionKey: this.configuration.subscriptionKey,
        userId: this.configuration.userId,
        heartbeatInterval: this.configuration.heartbeatInterval,
        logVerbosity: this.configuration.logVerbosity,
        workerOfflineClientsCheckInterval: this.configuration.workerOfflineClientsCheckInterval,
        workerUnsubscribeOfflineClients: this.configuration.workerUnsubscribeOfflineClients,
        workerLogVerbosity: this.configuration.workerLogVerbosity,
      },
      true,
    );

    this.subscriptionWorker.port.onmessage = (event) => this.handleWorkerEvent(event);
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
      this.subscriptionWorkerReady = true;
      this.flushScheduledEvents();
    } else if (data.type === 'shared-worker-console-log') {
      console.log(`[SharedWorker] ${data.message}`);
    } else if (data.type === 'shared-worker-console-dir') {
      if (data.message) console.log(`[SharedWorker] ${data.message}`);
      console.dir(data.data, { depth: 10 });
    } else if (data.type === 'shared-worker-ping') {
      const { logVerbosity, subscriptionKey, clientIdentifier } = this.configuration;

      this.scheduleEventPost({
        type: 'client-pong',
        subscriptionKey,
        clientIdentifier,
        logVerbosity,
      });
    } else if (data.type === 'request-progress-start' || data.type === 'request-progress-end') {
      this.logRequestProgress(data);
    } else if (data.type === 'request-process-success' || data.type === 'request-process-error') {
      const { resolve, reject } = this.callbacks!.get(data.identifier)!;

      if (data.type === 'request-process-success') {
        resolve({
          status: data.response.status,
          url: data.url,
          headers: data.response.headers,
          body: data.response.body,
        });
      } else {
        let category: StatusCategory = StatusCategory.PNUnknownCategory;
        let message = 'Unknown error';

        // Handle client-side issues (if any).
        if (data.error) {
          if (data.error.type === 'NETWORK_ISSUE') category = StatusCategory.PNNetworkIssuesCategory;
          else if (data.error.type === 'TIMEOUT') category = StatusCategory.PNTimeoutCategory;
          else if (data.error.type === 'ABORTED') category = StatusCategory.PNCancelledCategory;
          message = `${data.error.message} (${data.identifier})`;
        }
        // Handle service error response.
        else if (data.response) {
          return reject(
            PubNubAPIError.create(
              {
                url: data.url,
                headers: data.response.headers,
                body: data.response.body,
                status: data.response.status,
              },
              data.response.body,
            ),
          );
        }

        reject(new PubNubAPIError(message, category, 0, new Error(message)));
      }
    }
  }

  /**
   * Get parsed access token object.
   *
   * @param req - Transport request which may contain access token for processing.
   *
   * @returns Object with stringified access token information and expiration date information.
   */
  private async parsedAccessTokenForRequest(req: TransportRequest) {
    const accessToken = req.queryParameters ? ((req.queryParameters.auth as string) ?? '') : undefined;
    if (!accessToken) return undefined;
    else if (this.accessTokensMap[accessToken]) return this.accessTokensMap[accessToken];

    return this.stringifyAccessToken(accessToken).then(([token, stringifiedToken]) => {
      if (!token || !stringifiedToken) return undefined;

      return (this.accessTokensMap = {
        [accessToken]: { token: stringifiedToken, expiration: token.timestamp * token.ttl * 60 },
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
   * Print request progress information.
   *
   * @param information - Request progress information from worker.
   */
  private logRequestProgress(information: PubNubSubscriptionWorker.RequestSendingProgress) {
    if (information.type === 'request-progress-start') {
      console.log('<<<<<');
      console.log(`[${information.timestamp}] ${information.url}\n${JSON.stringify(information.query ?? {})}`);
      console.log('-----');
    } else {
      console.log('>>>>>>');
      console.log(
        `[${information.timestamp} / ${information.duration}] ${information.url}\n${JSON.stringify(
          information.query ?? {},
        )}\n${information.response}`,
      );
      console.log('-----');
    }
  }
}
