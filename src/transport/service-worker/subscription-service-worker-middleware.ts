/**
 * Subscription Service Worker transport middleware module.
 *
 * Middleware optimize subscription feature requests utilizing `Subscription Service Worker` if available and not
 * disabled by user.
 */

import { CancellationController, TransportRequest } from '../../core/types/transport-request';
import * as PubNubSubscriptionServiceWorker from './subscription-service-worker';
import { TransportResponse } from '../../core/types/transport-response';
import { Transport } from '../../core/interfaces/transport';
import { PubNubAPIError } from '../../errors/pubnub-api-error';
import StatusCategory from '../../core/constants/categories';

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
   * Current PubNub client version.
   */
  sdkVersion: string;

  /**
   * Whether verbose logging enabled or not.
   */
  logVerbosity: boolean;

  /**
   * Platform-specific transport for requests processing.
   */
  transport: Transport;
};

// endregion

/**
 * Subscription Service Worker transport middleware.
 */
export class SubscriptionServiceWorkerMiddleware implements Transport {
  /**
   * Scheduled requests result handling callback.
   */
  callbacks?: Map<string, { resolve: (value: TransportResponse) => void; reject: (value: Error) => void }>;

  /**
   * Subscription service worker.
   *
   * **Note:** Web PubNub SDK Transport provider adjustment for explicit subscription feature support.
   */
  serviceWorkerRegistration?: ServiceWorkerRegistration;

  /**
   * Queue of events for service worker.
   *
   * Keep list of events which should be sent to the worker after its activation.
   */
  serviceWorkerEventsQueue: PubNubSubscriptionServiceWorker.ClientEvent[];

  constructor(private readonly configuration: PubNubMiddlewareConfiguration) {
    this.serviceWorkerEventsQueue = [];
    this.callbacks = new Map();

    this.setupServiceWorker();
  }

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    // Use default request flow for non-subscribe / presence leave requests.
    if (!req.path.startsWith('/v2/subscribe') && !req.path.endsWith('/leave'))
      return this.configuration.transport.makeSendable(req);

    let controller: CancellationController | undefined;
    const sendRequestEvent: PubNubSubscriptionServiceWorker.SendRequestEvent = {
      type: 'send-request',
      clientIdentifier: this.configuration.clientIdentifier,
      subscriptionKey: this.configuration.subscriptionKey,
      logVerbosity: this.configuration.logVerbosity,
      request: req,
    };

    if (req.cancellable) {
      controller = {
        abort: () => {
          const cancelRequest: PubNubSubscriptionServiceWorker.CancelRequestEvent = {
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
   * Schedule {@link event} publish to the service worker.
   *
   * Service worker may not be ready for events processing and this method build queue for the time when worker will be
   * ready.
   *
   * @param event - Event payload for service worker.
   * @param outOfOrder - Whether event should be processed first then enqueued queue.
   */
  private scheduleEventPost(event: PubNubSubscriptionServiceWorker.ClientEvent, outOfOrder: boolean = false) {
    // Trigger request processing by Web Worker.
    const serviceWorker = this.serviceWorker;
    if (serviceWorker) serviceWorker.postMessage(event);
    else {
      if (outOfOrder) this.serviceWorkerEventsQueue.splice(0, 0, event);
      else this.serviceWorkerEventsQueue.push(event);
    }
  }

  /**
   * Dequeue and post events from the queue to the service worker.
   */
  private flushScheduledEvents(): void {
    // Trigger request processing by Web Worker.
    const serviceWorker = this.serviceWorker;
    if (!serviceWorker || this.serviceWorkerEventsQueue.length === 0) return;

    // Clean up from cancelled events.
    const outdatedEvents: PubNubSubscriptionServiceWorker.ClientEvent[] = [];
    for (let i = 0; i < this.serviceWorkerEventsQueue.length; i++) {
      const event = this.serviceWorkerEventsQueue[i];

      // Check whether found request cancel event to search for request send event it cancels.
      if (event.type !== 'cancel-request' || i === 0) continue;

      for (let j = 0; j < i; j++) {
        const otherEvent = this.serviceWorkerEventsQueue[j];
        if (otherEvent.type !== 'send-request') continue;

        // Collect outdated events if identifiers match.
        if (otherEvent.request.identifier === event.identifier) {
          outdatedEvents.push(event, otherEvent);
          break;
        }
      }
    }

    // Actualizing events queue.
    this.serviceWorkerEventsQueue = this.serviceWorkerEventsQueue.filter((event) => !outdatedEvents.includes(event));
    this.serviceWorkerEventsQueue.forEach((event) => serviceWorker.postMessage(event));
    this.serviceWorkerEventsQueue = [];
  }

  /**
   * Subscription service worker.
   *
   * @returns Service worker which has been registered by the PubNub SDK.
   */
  private get serviceWorker() {
    return this.serviceWorkerRegistration ? this.serviceWorkerRegistration.active : null;
  }

  private setupServiceWorker(): void {
    if (!('serviceWorker' in navigator)) return;
    const serviceWorkerContainer = navigator.serviceWorker as ServiceWorkerContainer;
    serviceWorkerContainer
      .register(`SERVICE_WORKER_CDN/SERVICE_WORKER_FILE_PLACEHOLDER`, {
        scope: `/pubnub-${this.configuration.sdkVersion}`,
      })
      .then((registration) => {
        this.serviceWorkerRegistration = registration;

        // Flush any pending service worker events.
        if (registration.active) this.flushScheduledEvents();

        /**
         * Listening for service worker code update.
         *
         * It is possible that one of the tabs will open with newer SDK version and Subscription Service Worker
         * will be re-installed - in this case we need to "rehydrate" it.
         *
         * After re-installation of new service worker it will lose all accumulated state and client need to
         * re-introduce itself and its state.
         */
        this.serviceWorkerRegistration.addEventListener('updatefound', () => {
          if (!this.serviceWorkerRegistration) return;

          // New service installing right now.
          const serviceWorker = this.serviceWorkerRegistration.installing!;

          const stateChangeListener = () => {
            // Flush any pending service worker events.
            if (serviceWorker.state === 'activated') {
              // Flush any pending service worker events.
              this.flushScheduledEvents();
            } else if (serviceWorker.state === 'redundant') {
              // Clean up listener from deprecated service worker version.
              serviceWorker.removeEventListener('statechange', stateChangeListener);
            }
          };

          serviceWorker.addEventListener('statechange', stateChangeListener);
        });
      });

    serviceWorkerContainer.addEventListener('message', (event) => this.handleServiceWorkerEvent(event));
  }

  private handleServiceWorkerEvent(event: MessageEvent<PubNubSubscriptionServiceWorker.ServiceWorkerEvent>) {
    const { data } = event;

    // Ignoring updates not related to this instance.
    if (data.clientIdentifier !== this.configuration.clientIdentifier) return;

    if (data.type === 'request-progress-start' || data.type === 'request-progress-end') {
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
   * @param information - Request progress information from Web Worker.
   */
  private logRequestProgress(information: PubNubSubscriptionServiceWorker.RequestSendingProgress) {
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
