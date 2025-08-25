import {
  PubNubClientEvent,
  PubNubClientSendLeaveEvent,
  PubNubClientAuthChangeEvent,
  PubNubClientSendSubscribeEvent,
  PubNubClientIdentityChangeEvent,
  PubNubClientCancelSubscribeEvent,
} from './custom-events/client-event';
import {
  PubNubClientsManagerEvent,
  PubNubClientManagerRegisterEvent,
  PubNubClientManagerUnregisterEvent,
} from './custom-events/client-manager-event';
import { SubscriptionStateChangeEvent, SubscriptionStateEvent } from './custom-events/subscription-state-event';
import { SubscriptionState, SubscriptionStateChange } from './subscription-state';
import { PubNubClientsManager } from './pubnub-clients-manager';
import { SubscribeRequest } from './subscribe-request';
import { RequestsManager } from './requests-manager';
import { PubNubClient } from './pubnub-client';
import { LeaveRequest } from './leave-request';
import { leaveRequest } from './helpers';

/**
 * Aggregation timer timeout.
 *
 * Timeout used by the timer to postpone enqueued `subscribe` requests processing and let other clients for the same
 * subscribe key send next subscribe loop request (to make aggregation more efficient).
 */
const aggregationTimeout = 50;

/**
 * Sent {@link SubscribeRequest|subscribe} requests manager.
 *
 * Manager responsible for requests enqueue for batch processing and aggregated `service`-provided requests scheduling.
 */
export class SubscribeRequestsManager extends RequestsManager {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Service response binary data decoder.
   */
  private static textDecoder = new TextDecoder();

  /**
   * Stringified to binary data encoder.
   */
  private static textEncoder = new TextEncoder();

  /**
   * Map of change aggregation identifiers to the requests which should be processed at once.
   *
   * `requests` key contains a map of {@link PubNubClient|PubNub} client identifiers to requests created by it (usually
   * there is only one at a time).
   */
  private requestsChangeAggregationQueue: {
    [key: string]: { timeout: ReturnType<typeof setTimeout>; changes: Set<SubscriptionStateChange> };
  } = {};

  /**
   * Map of client identifiers to {@link AbortController} instances which is used to detach added listeners when
   * {@link PubNubClient|PubNub} client unregisters.
   */
  private readonly clientAbortControllers: Record<string, AbortController> = {};

  /**
   * Map of unique user identifier (composed from multiple request object properties) to the aggregated subscription
   * {@link SubscriptionState|state}.
   */
  private readonly subscriptionStates: Record<string, SubscriptionState> = {};
  // endregion

  // --------------------------------------------------------
  // --------------------- Constructors ---------------------
  // --------------------------------------------------------
  // region Constructors

  /**
   * Create a {@link SubscribeRequest|subscribe} requests manager.
   *
   * @param clientsManager - Reference to the {@link PubNubClient|PubNub} clients manager as an events source for new
   * clients for which {@link SubscribeRequest|subscribe} request sending events should be listened.
   */
  constructor(private readonly clientsManager: PubNubClientsManager) {
    super();
    this.addEventListenersForClientsManager(clientsManager);
  }
  // endregion

  // --------------------------------------------------------
  // ----------------- Changes aggregation ------------------
  // --------------------------------------------------------
  // region Changes aggregation

  /**
   * Retrieve {@link SubscribeRequest|requests} changes aggregation queue for specific {@link PubNubClient|PubNub}
   * client.
   *
   * @param client - Reference to {@link PubNubClient|PubNub} client for which {@link SubscribeRequest|subscribe}
   * requests queue should be retrieved.
   * @returns Tuple with aggregation key and aggregated changes of client's {@link SubscribeRequest|subscribe} requests
   * that are enqueued for aggregation/removal.
   */
  private requestsChangeAggregationQueueForClient(
    client: PubNubClient,
  ): [string | undefined, Set<SubscriptionStateChange>] {
    for (const aggregationKey of Object.keys(this.requestsChangeAggregationQueue)) {
      const { changes } = this.requestsChangeAggregationQueue[aggregationKey];
      if (Array.from(changes).some((change) => change.clientIdentifier === client.identifier))
        return [aggregationKey, changes];
    }

    return [undefined, new Set<SubscriptionStateChange>()];
  }

  /**
   * Move {@link PubNubClient|PubNub} client to new subscription set.
   *
   * This function used when PubNub client changed its identity (`userId`) or auth (`access token`) and can't be
   * aggregated with previous requests.
   *
   * **Note:** Previous `service`-provided `subscribe` request won't be canceled.
   *
   * @param client - Reference to the  {@link PubNubClient|PubNub} client which should be moved to new state.
   */
  private moveClient(client: PubNubClient) {
    // Retrieve a list of client's requests that have been enqueued for further aggregation.
    const [queueIdentifier, enqueuedChanges] = this.requestsChangeAggregationQueueForClient(client);
    // Retrieve list of client's requests from active subscription state.
    let state = this.subscriptionStateForClient(client);
    const request = state?.requestForClient(client);

    // Check whether PubNub client has any activity prior removal or not.
    if (!state && !enqueuedChanges.size) return;

    // Make sure that client will be removed from its previous subscription state.
    if (state) state.invalidateClient(client);

    // Requests aggregation identifier.
    let identifier = request?.asIdentifier;
    if (!identifier && enqueuedChanges.size) {
      const [change] = enqueuedChanges;
      identifier = change.request.asIdentifier;
    }

    if (!identifier) return;

    if (request) {
      // Unset `service`-provided request because we can't receive a response with new `userId`.
      request.serviceRequest = undefined;

      state!.processChanges([new SubscriptionStateChange(client.identifier, request, true, false, true)]);

      state = this.subscriptionStateForIdentifier(identifier);
      // Force state refresh (because we are putting into new subscription set).
      request.resetToInitialRequest();
      state!.processChanges([new SubscriptionStateChange(client.identifier, request, false, false)]);
    }

    // Check whether there is enqueued request changes which should be removed from previous queue and added to the new
    // one.
    if (!enqueuedChanges.size || !this.requestsChangeAggregationQueue[queueIdentifier!]) return;

    // Start the changes aggregation timer if required (this also prepares the queue for `identifier`).
    this.startAggregationTimer(identifier);

    // Remove from previous aggregation queue.
    const oldChangesQueue = this.requestsChangeAggregationQueue[queueIdentifier!].changes;
    SubscriptionStateChange.squashedChanges([...enqueuedChanges])
      .filter((change) => change.clientIdentifier !== client.identifier || change.remove)
      .forEach(oldChangesQueue.delete, oldChangesQueue);

    // Add previously scheduled for aggregation requests to the new subscription set target.
    const { changes } = this.requestsChangeAggregationQueue[identifier];
    SubscriptionStateChange.squashedChanges([...enqueuedChanges])
      .filter(
        (change) =>
          change.clientIdentifier === client.identifier &&
          !change.request.completed &&
          change.request.canceled &&
          !change.remove,
      )
      .forEach(changes.add, changes);
  }

  /**
   * Remove unregistered/disconnected {@link PubNubClient|PubNub} client from manager's {@link SubscriptionState|state}.
   *
   * @param client - Reference to the {@link PubNubClient|PubNub} client which should be removed from
   * {@link SubscriptionState|state}.
   * @param useChangeAggregation - Whether {@link PubNubClient|client} removal should be processed using an aggregation
   * queue or change should be done on-the-fly by removing from both the aggregation queue and subscription state.
   * @param sendLeave - Whether the {@link PubNubClient|client} should send a presence `leave` request for _free_
   * channels and groups or not.
   * @param [invalidated=false] - Whether the {@link PubNubClient|PubNub} client and its request were removed as part of
   * client invalidation (unregister) or not.
   */
  private removeClient(client: PubNubClient, useChangeAggregation: boolean, sendLeave: boolean, invalidated = false) {
    // Retrieve a list of client's requests that have been enqueued for further aggregation.
    const [queueIdentifier, enqueuedChanges] = this.requestsChangeAggregationQueueForClient(client);
    // Retrieve list of client's requests from active subscription state.
    const state = this.subscriptionStateForClient(client);
    const request = state?.requestForClient(client, invalidated);

    // Check whether PubNub client has any activity prior removal or not.
    if (!state && !enqueuedChanges.size) return;

    const identifier = (state && state.identifier) ?? queueIdentifier!;

    // Remove the client's subscription requests from the active aggregation queue.
    if (enqueuedChanges.size && this.requestsChangeAggregationQueue[identifier]) {
      const { changes } = this.requestsChangeAggregationQueue[identifier];
      enqueuedChanges.forEach(changes.delete, changes);

      this.stopAggregationTimerIfEmptyQueue(identifier);
    }

    if (!request) return;

    // Detach `client`-provided request to avoid unexpected response processing.
    request.serviceRequest = undefined;

    if (useChangeAggregation) {
      // Start the changes aggregation timer if required (this also prepares the queue for `identifier`).
      this.startAggregationTimer(identifier);

      // Enqueue requests into the aggregated state change queue (delayed).
      this.enqueueForAggregation(client, request, true, sendLeave, invalidated);
    } else if (state)
      state.processChanges([new SubscriptionStateChange(client.identifier, request, true, sendLeave, invalidated)]);
  }

  /**
   * Enqueue {@link SubscribeRequest|subscribe} requests for aggregation after small delay.
   *
   * @param client - Reference to the {@link PubNubClient|PubNub} client which created
   * {@link SubscribeRequest|subscribe} request.
   * @param enqueuedRequest - {@link SubscribeRequest|Subscribe} request which should be placed into the queue.
   * @param removing - Whether requests enqueued for removal or not.
   * @param sendLeave - Whether on remove it should leave "free" channels and groups or not.
   * @param [clientInvalidate=false] - Whether the `subscription` state change was caused by the
   * {@link PubNubClient|PubNub} client invalidation (unregister) or not.
   */
  private enqueueForAggregation(
    client: PubNubClient,
    enqueuedRequest: SubscribeRequest,
    removing: boolean,
    sendLeave: boolean,
    clientInvalidate = false,
  ) {
    const identifier = enqueuedRequest.asIdentifier;
    // Start the changes aggregation timer if required (this also prepares the queue for `identifier`).
    this.startAggregationTimer(identifier);

    // Enqueue requests into the aggregated state change queue.
    const { changes } = this.requestsChangeAggregationQueue[identifier];
    changes.add(new SubscriptionStateChange(client.identifier, enqueuedRequest, removing, sendLeave, clientInvalidate));
  }

  /**
   * Start requests change aggregation timer.
   *
   * @param identifier - Similar {@link SubscribeRequest|subscribe} requests aggregation identifier.
   */
  private startAggregationTimer(identifier: string) {
    if (this.requestsChangeAggregationQueue[identifier]) return;

    this.requestsChangeAggregationQueue[identifier] = {
      timeout: setTimeout(() => this.handleDelayedAggregation(identifier), aggregationTimeout),
      changes: new Set<SubscriptionStateChange>(),
    };
  }

  /**
   * Stop request changes aggregation timer if there is no changes left in queue.
   *
   * @param identifier - Similar {@link SubscribeRequest|subscribe} requests aggregation identifier.
   */
  private stopAggregationTimerIfEmptyQueue(identifier: string) {
    const queue = this.requestsChangeAggregationQueue[identifier];
    if (!queue) return;

    if (queue.changes.size === 0) {
      if (queue.timeout) clearTimeout(queue.timeout);
      delete this.requestsChangeAggregationQueue[identifier];
    }
  }

  /**
   * Handle delayed {@link SubscribeRequest|subscribe} requests aggregation.
   *
   * @param identifier - Similar {@link SubscribeRequest|subscribe} requests aggregation identifier.
   */
  private handleDelayedAggregation(identifier: string) {
    if (!this.requestsChangeAggregationQueue[identifier]) return;

    const state = this.subscriptionStateForIdentifier(identifier);

    // Squash self-excluding change entries.
    const changes = [...this.requestsChangeAggregationQueue[identifier].changes];
    delete this.requestsChangeAggregationQueue[identifier];

    // Apply final changes to the subscription state.
    state.processChanges(changes);
  }

  /**
   * Retrieve existing or create new `subscription` {@link SubscriptionState|state} object for id.
   *
   * @param identifier - Similar {@link SubscribeRequest|subscribe} requests aggregation identifier.
   * @returns Existing or create new `subscription` {@link SubscriptionState|state} object for id.
   */
  private subscriptionStateForIdentifier(identifier: string) {
    let state = this.subscriptionStates[identifier];

    if (!state) {
      state = this.subscriptionStates[identifier] = new SubscriptionState(identifier);
      // Make sure to receive updates from subscription state.
      this.addListenerForSubscriptionStateEvents(state);
    }

    return state;
  }
  // endregion

  // --------------------------------------------------------
  // ------------------- Event Handlers ---------------------
  // --------------------------------------------------------
  // region Event handlers

  /**
   * Listen for {@link PubNubClient|PubNub} clients {@link PubNubClientsManager|manager} events that affect aggregated
   * subscribe/heartbeat requests.
   *
   * @param clientsManager - Clients {@link PubNubClientsManager|manager} for which change in
   * {@link PubNubClient|clients} should be tracked.
   */
  private addEventListenersForClientsManager(clientsManager: PubNubClientsManager) {
    clientsManager.addEventListener(PubNubClientsManagerEvent.Registered, (evt) => {
      const { client } = evt as PubNubClientManagerRegisterEvent;

      // Keep track of the client's listener abort controller.
      const abortController = new AbortController();
      this.clientAbortControllers[client.identifier] = abortController;

      client.addEventListener(
        PubNubClientEvent.IdentityChange,
        (event) => {
          if (!(event instanceof PubNubClientIdentityChangeEvent)) return;
          // Make changes into state only if `userId` actually changed.
          if (
            !!event.oldUserId !== !!event.newUserId ||
            (event.oldUserId && event.newUserId && event.newUserId !== event.oldUserId)
          )
            this.moveClient(client);
        },
        {
          signal: abortController.signal,
        },
      );
      client.addEventListener(
        PubNubClientEvent.AuthChange,
        (event) => {
          if (!(event instanceof PubNubClientAuthChangeEvent)) return;
          // Check whether the client should be moved to another state because of a permissions change or whether the
          // same token with the same permissions should be used for the next requests.
          if (
            !!event.oldAuth !== !!event.newAuth ||
            (event.oldAuth && event.newAuth && !event.oldAuth.equalTo(event.newAuth))
          )
            this.moveClient(client);
          else if (event.oldAuth && event.newAuth && event.oldAuth.equalTo(event.newAuth))
            this.subscriptionStateForClient(client)?.updateClientAccessToken(event.newAuth);
        },
        {
          signal: abortController.signal,
        },
      );
      client.addEventListener(
        PubNubClientEvent.SendSubscribeRequest,
        (event) => {
          if (!(event instanceof PubNubClientSendSubscribeEvent)) return;
          this.enqueueForAggregation(event.client, event.request, false, false);
        },
        { signal: abortController.signal },
      );
      client.addEventListener(
        PubNubClientEvent.CancelSubscribeRequest,
        (event) => {
          if (!(event instanceof PubNubClientCancelSubscribeEvent)) return;
          this.enqueueForAggregation(event.client, event.request, true, false);
        },
        { signal: abortController.signal },
      );
      client.addEventListener(
        PubNubClientEvent.SendLeaveRequest,
        (event) => {
          if (!(event instanceof PubNubClientSendLeaveEvent)) return;
          const request = this.patchedLeaveRequest(event.request);
          if (!request) return;

          this.sendRequest(
            request,
            (fetchRequest, response) => request.handleProcessingSuccess(fetchRequest, response),
            (fetchRequest, errorResponse) => request.handleProcessingError(fetchRequest, errorResponse),
          );
        },
        { signal: abortController.signal },
      );
    });
    clientsManager.addEventListener(PubNubClientsManagerEvent.Unregistered, (event) => {
      const { client, withLeave } = event as PubNubClientManagerUnregisterEvent;

      // Remove all listeners added for the client.
      const abortController = this.clientAbortControllers[client.identifier];
      delete this.clientAbortControllers[client.identifier];
      if (abortController) abortController.abort();

      // Update manager's state.
      this.removeClient(client, false, withLeave, true);
    });
  }

  /**
   * Listen for subscription {@link SubscriptionState|state} events.
   *
   * @param state - Reference to the subscription object for which listeners should be added.
   */
  private addListenerForSubscriptionStateEvents(state: SubscriptionState) {
    const abortController = new AbortController();

    state.addEventListener(
      SubscriptionStateEvent.Changed,
      (event) => {
        const { requestsWithInitialResponse, canceledRequests, newRequests, leaveRequest } =
          event as SubscriptionStateChangeEvent;

        // Cancel outdated ongoing `service`-provided subscribe requests.
        canceledRequests.forEach((request) => request.cancel('Cancel request'));

        // Schedule new `service`-provided subscribe requests processing.
        newRequests.forEach((request) => {
          this.sendRequest(
            request,
            (fetchRequest, response) => request.handleProcessingSuccess(fetchRequest, response),
            (fetchRequest, error) => request.handleProcessingError(fetchRequest, error),
            request.isInitialSubscribe && request.timetokenOverride !== '0'
              ? (response) =>
                  this.patchInitialSubscribeResponse(
                    response,
                    request.timetokenOverride,
                    request.timetokenRegionOverride,
                  )
              : undefined,
          );
        });

        requestsWithInitialResponse.forEach((response) => {
          const { request, timetoken, region } = response;
          request.handleProcessingStarted();
          this.makeResponseOnHandshakeRequest(request, timetoken, region);
        });

        if (leaveRequest) {
          this.sendRequest(
            leaveRequest,
            (fetchRequest, response) => leaveRequest.handleProcessingSuccess(fetchRequest, response),
            (fetchRequest, error) => leaveRequest.handleProcessingError(fetchRequest, error),
          );
        }
      },
      { signal: abortController.signal },
    );
    state.addEventListener(
      SubscriptionStateEvent.Invalidated,
      () => {
        delete this.subscriptionStates[state.identifier];
        abortController.abort();
      },
      {
        signal: abortController.signal,
        once: true,
      },
    );
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Retrieve subscription {@link SubscriptionState|state} with which specific client is working.
   *
   * @param client - Reference to the {@link PubNubClient|PubNub} client for which subscription
   * {@link SubscriptionState|state} should be found.
   * @returns Reference to the subscription {@link SubscriptionState|state} if the client has ongoing
   * {@link SubscribeRequest|requests}.
   */
  private subscriptionStateForClient(client: PubNubClient) {
    return Object.values(this.subscriptionStates).find((state) => state.hasStateForClient(client));
  }

  /**
   * Create `service`-provided `leave` request from a `client`-provided {@link LeaveRequest|request} with channels and
   * groups for removal.
   *
   * @param request - Original `client`-provided `leave` {@link LeaveRequest|request}.
   * @returns `service`-provided `leave` request.
   */
  private patchedLeaveRequest(request: LeaveRequest) {
    const subscriptionState = this.subscriptionStateForClient(request.client);
    // Something is wrong. Client doesn't have any active subscriptions.
    if (!subscriptionState) {
      request.cancel();
      return;
    }

    // Filter list from channels and groups which is still in use.
    const clientStateForLeave = subscriptionState.uniqueStateForClient(
      request.client,
      request.channels,
      request.channelGroups,
    );

    const serviceRequest = leaveRequest(
      request.client,
      clientStateForLeave.channels,
      clientStateForLeave.channelGroups,
    );
    if (serviceRequest) request.serviceRequest = serviceRequest;

    return serviceRequest;
  }

  /**
   * Return "response" from PubNub service with initial timetoken data.
   *
   * @param request - Client-provided handshake/initial request for which response should be provided.
   * @param timetoken - Timetoken from currently active service request.
   * @param region - Region from currently active service request.
   */
  private makeResponseOnHandshakeRequest(request: SubscribeRequest, timetoken: string, region: string) {
    const body = new TextEncoder().encode(`{"t":{"t":"${timetoken}","r":${region ?? '0'}},"m":[]}`);

    request.handleProcessingSuccess(request.asFetchRequest, {
      type: 'request-process-success',
      clientIdentifier: '',
      identifier: '',
      url: '',
      response: {
        contentType: 'text/javascript; charset="UTF-8"',
        contentLength: body.length,
        headers: { 'content-type': 'text/javascript; charset="UTF-8"', 'content-length': `${body.length}` },
        status: 200,
        body,
      },
    });
  }

  /**
   * Patch `service`-provided subscribe response with new timetoken and region.
   *
   * @param serverResponse - Original service response for patching.
   * @param timetoken - Original timetoken override value.
   * @param region - Original timetoken region override value.
   * @returns Patched subscribe REST API response.
   */
  private patchInitialSubscribeResponse(
    serverResponse: [Response, ArrayBuffer],
    timetoken?: string,
    region?: string,
  ): [Response, ArrayBuffer] {
    if (timetoken === undefined || timetoken === '0' || serverResponse[0].status >= 400) return serverResponse;

    let json: { t: { t: string; r: number }; m: Record<string, unknown>[] };
    const response = serverResponse[0];
    let decidedResponse = response;
    let body = serverResponse[1];

    try {
      json = JSON.parse(SubscribeRequestsManager.textDecoder.decode(body));
    } catch (error) {
      console.error(`Subscribe response parse error: ${error}`);
      return serverResponse;
    }

    // Replace server-provided timetoken.
    json.t.t = timetoken;
    if (region) json.t.r = parseInt(region, 10);

    try {
      body = SubscribeRequestsManager.textEncoder.encode(JSON.stringify(json)).buffer;

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
      console.error(`Subscribe serialization error: ${error}`);
      return serverResponse;
    }

    return body.byteLength > 0 ? [decidedResponse, body] : serverResponse;
  }
  // endregion
}
