import {
  PubNubClientSendLeaveEvent,
  PubNubClientAuthChangeEvent,
  PubNubClientDisconnectEvent,
  PubNubClientUnregisterEvent,
  PubNubClientSendHeartbeatEvent,
  PubNubClientSendSubscribeEvent,
  PubNubClientIdentityChangeEvent,
  PubNubClientCancelSubscribeEvent,
  PubNubClientPresenceStateChangeEvent,
  PubNubClientHeartbeatIntervalChangeEvent,
} from './custom-events/client-event';
import {
  ClientEvent,
  UpdateEvent,
  SendRequestEvent,
  CancelRequestEvent,
  RequestSendingError,
  SubscriptionWorkerEvent,
  PresenceStateUpdateEvent,
} from '../subscription-worker-types';
import {
  RequestErrorEvent,
  RequestCancelEvent,
  RequestSuccessEvent,
  PubNubSharedWorkerRequestEvents,
} from './custom-events/request-processing-event';
import { LogLevel } from '../../../core/interfaces/logger';
import { HeartbeatRequest } from './heartbeat-request';
import { SubscribeRequest } from './subscribe-request';
import { Payload } from '../../../core/types/api';
import { LeaveRequest } from './leave-request';
import { BasePubNubRequest } from './request';
import { AccessToken } from './access-token';
import { ClientLogger } from './logger';

/**
 * PubNub client representation in Shared Worker context.
 */
export class PubNubClient extends EventTarget {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Map of ongoing PubNub client requests.
   *
   * Unique request identifiers mapped to the requests requested by the core PubNub client module.
   */
  private readonly requests: Record<string, BasePubNubRequest> = {};

  /**
   * Controller, which is used on PubNub client unregister event to clean up listeners.
   */
  private readonly listenerAbortController = new AbortController();

  /**
   * Map of user's presence state for channels/groups after previous subscribe request.
   *
   * **Note:** Keep a local cache to reduce the amount of parsing with each received subscribe send request.
   */
  private cachedSubscriptionState?: Record<string, Payload>;

  /**
   * List of subscription channel groups after previous subscribe request.
   *
   * **Note:** Keep a local cache to reduce the amount of parsing with each received subscribe send request.
   */
  private cachedSubscriptionChannelGroups: string[] = [];

  /**
   * List of subscription channels after previous subscribe request.
   *
   * **Note:** Keep a local cache to reduce the amount of parsing with each received subscribe send request.
   */
  private cachedSubscriptionChannels: string[] = [];

  /**
   * How often the client will announce itself to the server. The value is in seconds.
   */
  private _heartbeatInterval?: number;

  /**
   * Access token to have `read` access to resources used by this client.
   */
  private _accessToken?: AccessToken;

  /**
   * Last time, the core PubNub client module responded with the `PONG` event.
   */
  private _lastPongEvent?: number;

  /**
   * Origin which is used to access PubNub REST API.
   */
  private _origin?: string;

  /**
   * Last time, `SharedWorker` sent `PING` request.
   */
  lastPingRequest?: number;

  /**
   * Client-specific logger that will send log entries to the core PubNub client module.
   */
  readonly logger: ClientLogger;

  /**
   * Whether {@link PubNubClient|PubNub} client has been invalidated (unregistered) or not.
   */
  private _invalidated = false;
  // endregion

  // --------------------------------------------------------
  // --------------------- Constructors ---------------------
  // --------------------------------------------------------
  // region Constructors

  /**
   * Create PubNub client.
   *
   * @param identifier - Unique PubNub client identifier.
   * @param subKey - Subscribe REST API access key.
   * @param userId - Unique identifier of the user currently configured for the PubNub client.
   * @param port - Message port for two-way communication with core PubNub client module.
   * @param logLevel - Minimum messages log level which should be passed to the `Subscription` worker logger.
   * @param [heartbeatInterval] - Interval that is used to announce a user's presence on channels/groups.
   */
  constructor(
    readonly identifier: string,
    readonly subKey: string,
    public userId: string,
    private readonly port: MessagePort,
    logLevel: LogLevel,
    heartbeatInterval?: number,
  ) {
    super();

    this.logger = new ClientLogger(logLevel, this.port);
    this._heartbeatInterval = heartbeatInterval;
    this.subscribeOnEvents();
  }

  /**
   * Clean up resources used by this PubNub client.
   */
  invalidate(dispatchEvent = false) {
    // Remove the client's listeners.
    this.listenerAbortController.abort();
    this._invalidated = true;

    this.cancelRequests();
  }
  // endregion

  // --------------------------------------------------------
  // ---------------------- Properties ----------------------
  // --------------------------------------------------------
  // region Properties

  /**
   * Retrieve origin which is used to access PubNub REST API.
   *
   * @returns Origin which is used to access PubNub REST API.
   */
  get origin(): string {
    return this._origin ?? '';
  }

  /**
   * Retrieve heartbeat interval, which is used to announce a user's presence on channels/groups.
   *
   * @returns Heartbeat interval, which is used to announce a user's presence on channels/groups.
   */
  get heartbeatInterval() {
    return this._heartbeatInterval;
  }

  /**
   * Retrieve an access token to have `read` access to resources used by this client.
   *
   * @returns Access token to have `read` access to resources used by this client.
   */
  get accessToken() {
    return this._accessToken;
  }

  /**
   * Retrieve whether the {@link PubNubClient|PubNub} client has been invalidated (unregistered) or not.
   *
   * @returns `true` if the client has been invalidated during unregistration.
   */
  get isInvalidated() {
    return this._invalidated;
  }

  /**
   * Retrieve the last time, the core PubNub client module responded with the `PONG` event.
   *
   * @returns Last time, the core PubNub client module responded with the `PONG` event.
   */
  get lastPongEvent() {
    return this._lastPongEvent;
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Communication --------------------
  // --------------------------------------------------------
  // region Communication

  /**
   * Post event to the core PubNub client module.
   *
   * @param event - Subscription worker event payload.
   * @returns `true` if the event has been sent without any issues.
   */
  postEvent(event: SubscriptionWorkerEvent) {
    try {
      this.port.postMessage(event);
      return true;
    } catch (error) {
      this.logger.error(`Unable send message using message port: ${error}`);
    }

    return false;
  }
  // endregion

  // --------------------------------------------------------
  // -------------------- Event handlers --------------------
  // --------------------------------------------------------
  // region Event handlers

  /**
   * Subscribe to client-specific signals from the core PubNub client module.
   */
  private subscribeOnEvents() {
    this.port.addEventListener(
      'message',
      (event: MessageEvent<ClientEvent>) => {
        if (event.data.type === 'client-unregister') this.handleUnregisterEvent();
        else if (event.data.type === 'client-update') this.handleConfigurationUpdateEvent(event.data);
        else if (event.data.type === 'client-presence-state-update') this.handlePresenceStateUpdateEvent(event.data);
        else if (event.data.type === 'send-request') this.handleSendRequestEvent(event.data);
        else if (event.data.type === 'cancel-request') this.handleCancelRequestEvent(event.data);
        else if (event.data.type === 'client-disconnect') this.handleDisconnectEvent();
        else if (event.data.type === 'client-pong') this.handlePongEvent();
      },
      { signal: this.listenerAbortController.signal },
    );
  }

  /**
   * Handle PubNub client unregister event.
   *
   * During unregister handling, the following changes will happen:
   * - remove from the clients hash map ({@link PubNubClientsManager|clients manager})
   * - reset long-poll request (remove channels/groups that have been used only by this client)
   * - stop backup heartbeat timer
   */
  private handleUnregisterEvent() {
    this.invalidate();
    this.dispatchEvent(new PubNubClientUnregisterEvent(this));
  }

  /**
   * Update client's configuration.
   *
   * During configuration update handling, the following changes may happen (depending on the changed data):
   * - reset long-poll request (remove channels/groups that have been used only by this client from active request) on
   *   `userID` change.
   * - heartbeat will be sent immediately on `userID` change (to announce new user presence). **Note:** proper flow will
   *   be `unsubscribeAll` and then, with changed `userID` subscribe back, but the code will handle hard reset as well.
   * - _backup_ heartbeat timer reschedule in on `heartbeatInterval` change.
   *
   * @param event - Object with up-to-date client settings, which should be reflected in SharedWorker's state for the
   * registered client.
   */
  private handleConfigurationUpdateEvent(event: UpdateEvent) {
    const { userId, accessToken: authKey, preProcessedToken: token, heartbeatInterval, workerLogLevel } = event;

    this.logger.minLogLevel = workerLogLevel;
    this.logger.debug(() => ({
      messageType: 'object',
      message: { userId, authKey, token, heartbeatInterval, workerLogLevel },
      details: 'Update client configuration with parameters:',
    }));

    // Check whether authentication information has been changed or not.
    // Important: If changed, this should be notified before a potential identity change event.
    if (!!authKey || !!this.accessToken) {
      const accessToken = authKey ? new AccessToken(authKey, (token ?? {}).token, (token ?? {}).expiration) : undefined;

      // Check whether the access token really changed or not.
      if (
        !!accessToken !== !!this.accessToken ||
        (!!accessToken && this.accessToken && !accessToken.equalTo(this.accessToken, true))
      ) {
        const oldValue = this._accessToken;
        this._accessToken = accessToken;

        // Make sure that all ongoing subscribe (usually should be only one at a time) requests use proper
        // `accessToken`.
        Object.values(this.requests)
          .filter(
            (request) =>
              (!request.completed && request instanceof SubscribeRequest) || request instanceof HeartbeatRequest,
          )
          .forEach((request) => (request.accessToken = accessToken));

        this.dispatchEvent(new PubNubClientAuthChangeEvent(this, accessToken, oldValue));
      }
    }

    // Check whether PubNub client identity has been changed or not.
    if (this.userId !== userId) {
      const oldValue = this.userId;
      this.userId = userId;

      // Make sure that all ongoing subscribe (usually should be only one at a time) requests use proper `userId`.
      // **Note:** Core PubNub client module docs have a warning saying that `userId` should be changed only after
      // unsubscribe/disconnect to properly update the user's presence.
      Object.values(this.requests)
        .filter(
          (request) =>
            (!request.completed && request instanceof SubscribeRequest) || request instanceof HeartbeatRequest,
        )
        .forEach((request) => (request.userId = userId));

      this.dispatchEvent(new PubNubClientIdentityChangeEvent(this, oldValue, userId));
    }

    if (this._heartbeatInterval !== heartbeatInterval) {
      const oldValue = this._heartbeatInterval;
      this._heartbeatInterval = heartbeatInterval;

      this.dispatchEvent(new PubNubClientHeartbeatIntervalChangeEvent(this, heartbeatInterval, oldValue));
    }
  }

  /**
   * Handle client's user presence state information update.
   *
   * @param event - Object with up-to-date `userId` presence `state`, which should be reflected in SharedWorker's state
   * for the registered client.
   */
  private handlePresenceStateUpdateEvent(event: PresenceStateUpdateEvent) {
    this.dispatchEvent(new PubNubClientPresenceStateChangeEvent(this, event.state));
  }

  /**
   * Handle requests send request from the core PubNub client module.
   *
   * @param data - Object with received request details.
   */
  private handleSendRequestEvent(data: SendRequestEvent) {
    let request: BasePubNubRequest;

    // Setup client's authentication token from request (if it hasn't been set yet)
    if (!this._accessToken && !!data.request.queryParameters?.auth && !!data.preProcessedToken) {
      const auth = data.request.queryParameters.auth as string;
      this._accessToken = new AccessToken(auth, data.preProcessedToken.token, data.preProcessedToken.expiration);
    }

    if (data.request.path.startsWith('/v2/subscribe')) {
      if (
        SubscribeRequest.useCachedState(data.request) &&
        (this.cachedSubscriptionChannelGroups.length || this.cachedSubscriptionChannels.length)
      ) {
        request = SubscribeRequest.fromCachedState(
          data.request,
          this.subKey,
          this.cachedSubscriptionChannelGroups,
          this.cachedSubscriptionChannels,
          this.cachedSubscriptionState,
          this.accessToken,
        );
      } else {
        request = SubscribeRequest.fromTransportRequest(data.request, this.subKey, this.accessToken);

        // Update the cached client's subscription state.
        this.cachedSubscriptionChannelGroups = [...request.channelGroups];
        this.cachedSubscriptionChannels = [...request.channels];
        if ((request as SubscribeRequest).state)
          this.cachedSubscriptionState = { ...(request as SubscribeRequest).state };
        else this.cachedSubscriptionState = undefined;
      }
    } else if (data.request.path.endsWith('/heartbeat'))
      request = HeartbeatRequest.fromTransportRequest(data.request, this.subKey, this.accessToken);
    else request = LeaveRequest.fromTransportRequest(data.request, this.subKey, this.accessToken);

    request.client = this;
    this.requests[request.request.identifier] = request;

    if (!this._origin) this._origin = request.origin;

    // Set client state cleanup on request processing completion (with any outcome).
    this.listenRequestCompletion(request);

    // Notify request managers about new client-provided request.
    this.dispatchEvent(this.eventWithRequest(request));
  }

  /**
   * Handle on-demand request cancellation.
   *
   * **Note:** Cancellation will dispatch the event handled in `listenRequestCompletion` and remove target request from
   * the PubNub client requests' list.
   *
   * @param data - Object with canceled request information.
   */
  private handleCancelRequestEvent(data: CancelRequestEvent) {
    if (!this.requests[data.identifier]) return;
    const request = this.requests[data.identifier];
    request.cancel('Cancel request');
  }

  /**
   * Handle PubNub client disconnect event.
   *
   * **Note:** On disconnect, the core {@link PubNubClient|PubNub} client module will terminate `client`-provided
   * subscribe requests ({@link handleCancelRequestEvent} will be called).
   *
   * During disconnection handling, the following changes will happen:
   * - reset subscription state ({@link SubscribeRequestsManager|subscription requests manager})
   * - stop backup heartbeat timer
   * - reset heartbeat state ({@link HeartbeatRequestsManager|heartbeat requests manager})
   */
  private handleDisconnectEvent() {
    this.dispatchEvent(new PubNubClientDisconnectEvent(this));
  }

  /**
   * Handle ping-pong response from the core PubNub client module.
   */
  private handlePongEvent() {
    this._lastPongEvent = Date.now() / 1000;
  }

  /**
   * Listen for any request outcome to clean
   *
   * @param request - Request for which processing outcome should be observed.
   */
  private listenRequestCompletion(request: BasePubNubRequest) {
    const ac = new AbortController();
    const callback = (evt: Event) => {
      delete this.requests[request.identifier];
      ac.abort();

      if (evt instanceof RequestSuccessEvent) this.postEvent((evt as RequestSuccessEvent).response);
      else if (evt instanceof RequestErrorEvent) this.postEvent((evt as RequestErrorEvent).error);
      else if (evt instanceof RequestCancelEvent) {
        this.postEvent(this.requestCancelError(request));

        // Notify specifically about the `subscribe` request cancellation.
        if (!this._invalidated && request instanceof SubscribeRequest)
          this.dispatchEvent(new PubNubClientCancelSubscribeEvent(request.client, request));
      }
    };

    request.addEventListener(PubNubSharedWorkerRequestEvents.Success, callback, { signal: ac.signal, once: true });
    request.addEventListener(PubNubSharedWorkerRequestEvents.Error, callback, { signal: ac.signal, once: true });
    request.addEventListener(PubNubSharedWorkerRequestEvents.Canceled, callback, { signal: ac.signal, once: true });
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Requests -----------------------
  // --------------------------------------------------------
  // region Requests

  /**
   * Cancel any active `client`-provided requests.
   *
   * **Note:** Cancellation will dispatch the event handled in `listenRequestCompletion` and remove `request` from the
   * PubNub client requests' list.
   */
  private cancelRequests() {
    Object.values(this.requests).forEach((request) => request.cancel());
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Wrap `request` into corresponding event for dispatching.
   *
   * @param request - Request which should be used to identify event type and stored in it.
   */
  private eventWithRequest(request: BasePubNubRequest) {
    let event: CustomEvent;

    if (request instanceof SubscribeRequest) event = new PubNubClientSendSubscribeEvent(this, request);
    else if (request instanceof HeartbeatRequest) event = new PubNubClientSendHeartbeatEvent(this, request);
    else event = new PubNubClientSendLeaveEvent(this, request as LeaveRequest);

    return event;
  }

  /**
   * Create request cancellation response.
   *
   * @param request - Reference on client-provided request for which payload should be prepared.
   * @returns Object which will be treated as cancel response on core PubNub client module side.
   */
  private requestCancelError(request: BasePubNubRequest): RequestSendingError {
    return {
      type: 'request-process-error',
      clientIdentifier: this.identifier,
      identifier: request.request.identifier,
      url: request.asFetchRequest.url,
      error: { name: 'AbortError', type: 'ABORTED', message: 'Request aborted' },
    };
  }
  // endregion
}
