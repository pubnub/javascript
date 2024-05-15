/**
 * Subscription Worker transport middleware module.
 *
 * Middleware optimize subscription feature requests utilizing `Subscription Worker` if available and not disabled
 * by user.
 */

import { CancellationController, TransportRequest } from '../../core/types/transport-request';
import { TransportResponse } from '../../core/types/transport-response';
import * as PubNubSubscriptionWorker from './subscription-worker';
import { PubNubAPIError } from '../../errors/pubnub-api-error';
import StatusCategory from '../../core/constants/categories';
import { Transport } from '../../core/interfaces/transport';

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
   * Whether verbose logging should be enabled for `Subscription` worker should print debug messages or not.
   */
  workerLogVerbosity: boolean;

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

  constructor(private readonly configuration: PubNubMiddlewareConfiguration) {
    this.workerEventsQueue = [];
    this.callbacks = new Map();

    this.setupSubscriptionWorker();
  }

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    // Use default request flow for non-subscribe / presence leave requests.
    if (!req.path.startsWith('/v2/subscribe') && !req.path.endsWith('/leave'))
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
        this.scheduleEventPost(sendRequestEvent);
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
        logVerbosity: this.configuration.logVerbosity,
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
      console.dir(data.data);
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
