import {
  RequestErrorEvent,
  RequestSuccessEvent,
  PubNubSharedWorkerRequestEvents,
} from './custom-events/request-processing-event';
import { HeartbeatStateHeartbeatEvent, HeartbeatStateInvalidateEvent } from './custom-events/heartbeat-state-event';
import { RequestSendingSuccess } from '../subscription-worker-types';
import { HeartbeatRequest } from './heartbeat-request';
import { Payload } from '../../../core/types/api';
import { PubNubClient } from './pubnub-client';
import { AccessToken } from './access-token';

export class HeartbeatState extends EventTarget {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Map of client identifiers to their portion of data which affects heartbeat state.
   *
   * **Note:** This information removed only with {@link HeartbeatState.removeClient|removeClient} function call.
   */
  private clientsState: Record<
    string,
    { channels: string[]; channelGroups: string[]; state?: Record<string, Payload> }
  > = {};

  /**
   * Map of client to its requests which is pending for service request processing results.
   */
  private requests: Record<string, HeartbeatRequest> = {};

  /**
   * Backout timer timeout.
   */
  private timeout?: ReturnType<typeof setTimeout>;

  /**
   * Time when previous heartbeat request has been done.
   */
  private lastHeartbeatTimestamp: number = 0;

  /**
   * Reference to the most suitable access token to access {@link HeartbeatState#channels|channels} and
   * {@link HeartbeatState#channelGroups|channelGroups}.
   */
  private _accessToken?: AccessToken;

  /**
   * Stores response from the previous heartbeat request.
   */
  private previousRequestResult?: RequestSendingSuccess;

  /**
   * Stores whether automated _backup_ timer can fire or not.
   */
  private canSendBackupHeartbeat = true;

  /**
   * Whether previous call failed with `Access Denied` error or not.
   */
  private isAccessDeniedError = false;

  /**
   * Presence heartbeat interval.
   *
   * Value used to decide whether new request should be handled right away or should wait for _backup_ timer in state
   * to send aggregated request.
   */
  private _interval: number = 0;
  // endregion

  // --------------------------------------------------------
  // --------------------- Constructor ----------------------
  // --------------------------------------------------------
  // region Constructor

  /**
   * Create heartbeat state management object.
   *
   * @param identifier -  Similar {@link SubscribeRequest|subscribe} requests aggregation identifier.
   */
  constructor(public readonly identifier: string) {
    super();
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Properties -----------------------
  // --------------------------------------------------------
  // region Properties

  /**
   * Update presence heartbeat interval.
   *
   * @param value - New heartbeat interval.
   */
  set interval(value: number) {
    const changed = this._interval !== value;
    this._interval = value;

    if (!changed) return;

    // Restart timer if required.
    if (value === 0) this.stopTimer();
    else this.startTimer();
  }

  /**
   * Update access token which should be used for aggregated heartbeat requests.
   *
   * @param value - New access token for heartbeat requests.
   */
  set accessToken(value: AccessToken | undefined) {
    if (!value) {
      this._accessToken = value;
      return;
    }

    const accessTokens = Object.values(this.requests)
      .filter((request) => !!request.accessToken)
      .map((request) => request.accessToken!);
    accessTokens.push(value);

    this._accessToken = accessTokens.sort(AccessToken.compare).pop();

    // Restart _backup_ heartbeat if previous call failed because of permissions error.
    if (this.isAccessDeniedError) {
      this.canSendBackupHeartbeat = true;
      this.startTimer(this.presenceTimerTimeout());
    }
  }
  // endregion

  // --------------------------------------------------------
  // ---------------------- Accessors -----------------------
  // --------------------------------------------------------
  // region Accessors

  /**
   * Retrieve portion of heartbeat state which is related to the specific client.
   *
   * @param client - Reference to the PubNub client for which state should be retrieved.
   * @returns PubNub client's state in heartbeat.
   */
  stateForClient(client: PubNubClient):
    | {
        channels: string[];
        channelGroups: string[];
        state?: Record<string, Payload>;
      }
    | undefined {
    if (!this.clientsState[client.identifier]) return undefined;

    const clientState = this.clientsState[client.identifier];

    return clientState
      ? { channels: [...clientState.channels], channelGroups: [...clientState.channelGroups], state: clientState.state }
      : { channels: [], channelGroups: [] };
  }

  /**
   * Retrieve recent heartbeat request for the client.
   *
   * @param client - Reference to the client for which request should be retrieved.
   * @returns List of client's ongoing requests.
   */
  requestForClient(client: PubNubClient): HeartbeatRequest | undefined {
    return this.requests[client.identifier];
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Aggregation ----------------------
  // --------------------------------------------------------
  // region Aggregation

  /**
   * Add new client's request to the state.
   *
   * @param client - Reference to PubNub client which is adding new requests for processing.
   * @param request - New client-provided heartbeat request for processing.
   */
  addClientRequest(client: PubNubClient, request: HeartbeatRequest) {
    this.requests[client.identifier] = request;
    this.clientsState[client.identifier] = { channels: request.channels, channelGroups: request.channelGroups };
    if (request.state) this.clientsState[client.identifier].state = { ...request.state };

    // Update access token information (use the one which will provide permissions for longer period).
    const sortedTokens = Object.values(this.requests)
      .filter((request) => !!request.accessToken)
      .map((request) => request.accessToken!)
      .sort(AccessToken.compare);
    if (sortedTokens && sortedTokens.length > 0) this._accessToken = sortedTokens.pop();

    this.sendAggregatedHeartbeat(request);
  }

  /**
   * Remove client and requests associated with it from the state.
   *
   * @param client - Reference to the PubNub client which should be removed.
   */
  removeClient(client: PubNubClient) {
    delete this.clientsState[client.identifier];
    delete this.requests[client.identifier];

    // Stop backup timer if there is no more channels and groups left.
    if (!Object.keys(this.clientsState).length) {
      this.stopTimer();
      this.dispatchEvent(new HeartbeatStateInvalidateEvent());
    }
  }

  removeFromClientState(client: PubNubClient, channels: string[], channelGroups: string[]) {
    const clientState = this.clientsState[client.identifier];
    if (!clientState) return;

    clientState.channelGroups = clientState.channelGroups.filter((group) => !channelGroups.includes(group));
    clientState.channels = clientState.channels.filter((channel) => !channels.includes(channel));

    if (clientState.channels.length === 0 && clientState.channelGroups.length === 0) {
      this.removeClient(client);
      return;
    }

    // Clean up user's presence state from removed channels and groups.
    if (!clientState.state) return;
    Object.keys(clientState.state).forEach((key) => {
      if (!clientState.channels.includes(key) && !clientState.channelGroups.includes(key))
        delete clientState.state![key];
    });
  }

  /**
   * Start "backup" presence heartbeat timer.
   *
   * @param targetInterval - Interval after which heartbeat request should be sent.
   */
  private startTimer(targetInterval?: number) {
    this.stopTimer();
    if (Object.keys(this.clientsState).length === 0) return;

    this.timeout = setTimeout(() => this.handlePresenceTimer(), (targetInterval ?? this._interval) * 1000);
  }

  /**
   * Stop "backup" presence heartbeat timer.
   */
  private stopTimer() {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = undefined;
  }

  /**
   * Send aggregated heartbeat request (if possible).
   *
   * @param [request] - Client provided request which tried to announce presence.
   */
  private sendAggregatedHeartbeat(request?: HeartbeatRequest) {
    if (this.lastHeartbeatTimestamp !== 0) {
      // Check whether it is too soon to send request or not.
      const expected = this.lastHeartbeatTimestamp + this._interval * 1000;
      let leeway = this._interval * 0.05;
      if (this._interval - leeway < 3) leeway = 0;
      const current = Date.now();

      if (expected - current > leeway * 1000) {
        if (request && this.previousRequestResult) {
          request.handleProcessingStarted();
          request.handleProcessingSuccess(request.asFetchRequest, this.previousRequestResult);
        } else if (!request) return;
      }
    }

    const requests = Object.values(this.requests);
    const baseRequest = requests[Math.floor(Math.random() * requests.length)];
    const aggregatedRequest = { ...baseRequest.request };
    let state: Record<string, Payload> = {};
    const channelGroups = new Set<string>();
    const channels = new Set<string>();

    Object.values(this.clientsState).forEach((clientState) => {
      if (clientState.state) state = { ...state, ...clientState.state };
      clientState.channelGroups.forEach(channelGroups.add, channelGroups);
      clientState.channels.forEach(channels.add, channels);
    });

    this.lastHeartbeatTimestamp = Date.now();
    const serviceRequest = HeartbeatRequest.fromCachedState(
      aggregatedRequest,
      requests[0].subscribeKey,
      [...channelGroups],
      [...channels],
      Object.keys(state).length > 0 ? state : undefined,
      this._accessToken,
    );

    // Set service request for all client-provided requests without response.
    Object.values(this.requests).forEach(
      (request) => !request.serviceRequest && (request.serviceRequest = serviceRequest),
    );

    this.addListenersForRequest(serviceRequest);
    this.dispatchEvent(new HeartbeatStateHeartbeatEvent(serviceRequest));

    // Restart _backup_ timer after regular client-provided request triggered heartbeat.
    if (request) this.startTimer();
  }
  // endregion

  // --------------------------------------------------------
  // ------------------- Event Handlers ---------------------
  // --------------------------------------------------------
  // region Event handlers

  /**
   * Add listeners to the service request.
   *
   * Listeners used to capture last service success response and mark whether further _backup_ requests possible or not.
   *
   * @param request - Service `heartbeat` request for which events will be listened once.
   */
  private addListenersForRequest(request: HeartbeatRequest) {
    const ac = new AbortController();
    const callback = (evt: Event) => {
      // Clean up service request listeners.
      ac.abort();

      if (evt instanceof RequestSuccessEvent) {
        const { response } = evt as RequestSuccessEvent;
        this.previousRequestResult = response;
      } else if (evt instanceof RequestErrorEvent) {
        const { error } = evt as RequestErrorEvent;
        this.canSendBackupHeartbeat = true;
        this.isAccessDeniedError = false;

        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          this.isAccessDeniedError = error.response.status === 403;
          this.canSendBackupHeartbeat = false;
        }
      }
    };
    request.addEventListener(PubNubSharedWorkerRequestEvents.Success, callback, { signal: ac.signal, once: true });
    request.addEventListener(PubNubSharedWorkerRequestEvents.Error, callback, { signal: ac.signal, once: true });
    request.addEventListener(PubNubSharedWorkerRequestEvents.Canceled, callback, { signal: ac.signal, once: true });
  }

  /**
   * Handle periodic _backup_ heartbeat timer.
   */
  private handlePresenceTimer() {
    if (Object.keys(this.clientsState).length === 0 || !this.canSendBackupHeartbeat) return;

    const targetInterval = this.presenceTimerTimeout();

    this.sendAggregatedHeartbeat();
    this.startTimer(targetInterval);
  }

  /**
   * Compute timeout for _backup_ heartbeat timer.
   *
   * @returns Number of seconds after which new aggregated heartbeat request should be sent.
   */
  private presenceTimerTimeout() {
    const timePassed = (Date.now() - this.lastHeartbeatTimestamp) / 1000;
    let targetInterval = this._interval;
    if (timePassed < targetInterval) targetInterval -= timePassed;
    if (targetInterval === this._interval) targetInterval += 0.05;
    targetInterval = Math.max(targetInterval, 3);

    return targetInterval;
  }
  // endregion
}
