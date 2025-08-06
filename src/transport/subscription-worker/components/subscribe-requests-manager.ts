import {
  PubNubClientEvent,
  PubNubClientSendLeaveEvent,
  PubNubClientSendSubscribeEvent,
} from './custom-events/client-event';
import {
  PubNubClientsManagerEvent,
  PubNubClientManagerRegisterEvent,
  PubNubClientManagerUnregisterEvent,
} from './custom-events/client-manager-event';
import { SubscriptionStateChangeEvent, SubscriptionStateEvent } from './custom-events/subscription-state-event';
import { TransportMethod, TransportRequest } from '../../../core/types/transport-request';
import { PubNubClientsManager } from './pubnub-clients-manager';
import uuidGenerator from '../../../core/components/uuid';
import { SubscriptionState } from './subscription-state';
import { SubscribeRequest } from './subscribe-request';
import { RequestsManager } from './requests-manager';
import { Query } from '../../../core/types/api';
import { PubNubClient } from './pubnub-client';
import { LeaveRequest } from './leave-request';

/**
 * Aggregation timer timeout.
 *
 * Timeout used by the timer to postpone enqueued `subscribe` requests processing and let other clients for
 * same subscribe key send next subscribe loop request (to make aggregation more efficient).
 */
const aggregationTimeout = 50;

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
   * Map of aggregation identifiers to the requests which should be processed at once.
   *
   * `requests` key contains map of PubNub client identifier to requests created by it (usually there is only one at a
   * time).
   */
  private delayedAggregationQueue: {
    [key: string]: { timeout: ReturnType<typeof setTimeout>; requests: Record<string, SubscribeRequest[]> };
  } = {};

  /**
   * Map of client identifiers to `AbortController` instances which is used to detach added listeners when PubNub client
   * unregister.
   */
  private readonly clientAbortControllers: Record<string, AbortController> = {};

  /**
   * Map of unique user identifier (composed from multiple request object properties) to the aggregated subscription
   * state.
   */
  private readonly subscriptionStates: Record<string, SubscriptionState> = {};
  // endregion

  // --------------------------------------------------------
  // --------------------- Constructors ---------------------
  // --------------------------------------------------------
  // region Constructors

  constructor(private readonly clientsManager: PubNubClientsManager) {
    super();
    this.subscribeOnClientEvents(clientsManager);
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Aggregation ----------------------
  // --------------------------------------------------------
  // region Aggregation

  /**
   * Retrieve subscription state with which specific client is working.
   *
   * @param client - Reference to the PubNub client for which subscription state should be found.
   * @returns Reference to the subscription state if client has ongoing requests.
   */
  private subscriptionStateForClient(client: PubNubClient) {
    let state: SubscriptionState | undefined;

    // Search where `client` previously stored its requests.
    for (const identifier of Object.keys(this.delayedAggregationQueue)) {
      if (this.delayedAggregationQueue[identifier].requests[client.identifier]) {
        state = this.subscriptionStates[identifier];
        break;
      }
    }

    // Search in persistent states.
    if (!state) {
      Object.values(this.subscriptionStates).forEach(
        (subscriptionState) =>
          !state && (state = subscriptionState.requestsForClient(client).length ? subscriptionState : undefined),
      );
    }

    return state;
  }

  /**
   * Move client between subscription states.
   *
   * This function used when PubNub client changed its identity (`userId`) and can't be aggregated with previous
   * requests.
   *
   * @param client - Reference to the PubNub client which should be moved to new state.
   */
  private moveClient(client: PubNubClient) {
    let requests = this.aggregateQueueForClient(client);

    // Check whether there is new requests from the client or requests in subscription state should be used instead.
    if (!requests.length) {
      Object.values(this.subscriptionStates).forEach(
        (subscriptionState) => requests.length === 0 && (requests = subscriptionState.requestsForClient(client)),
      );
    }

    // Provided client doesn't have enqueued for subscription state change or has any data in state itself.
    if (!requests.length) return;

    this.removeClient(client, false);
    this.enqueueForAggregation(client, requests);
  }

  /**
   * Remove unregistered / disconnected PubNub client from manager's state.
   *
   * @param client - Reference to the PubNub client which should be removed from state.
   * @param sendLeave - Whether client should send presence `leave` request for _free_ channels and groups or not.
   */
  private removeClient(client: PubNubClient, sendLeave: boolean) {
    this.removeFromAggregationQueue(client);

    const subscriptionState = this.subscriptionStateForClient(client);
    if (!subscriptionState) return;

    const clientSubscriptionState = subscriptionState.stateForClient(client);
    const clientStateForLeave = subscriptionState.uniqueStateForClient(
      client,
      clientSubscriptionState.channels,
      clientSubscriptionState.channelGroups,
    );

    // Clean up client's data in subscription state.
    subscriptionState.beginChanges();
    subscriptionState.removeClient(client);
    subscriptionState.commitChanges();

    // Check whether there is any need to send `leave` request or not.
    if (!sendLeave || (!clientStateForLeave.channels.length && !clientStateForLeave.channelGroups.length)) return;

    const request = this.leaveRequest(client, clientStateForLeave.channels, clientStateForLeave.channelGroups);
    if (!request) return;

    this.sendRequest(
      request,
      (fetchRequest, response) => request.handleProcessingSuccess(fetchRequest, response),
      (fetchRequest, errorResponse) => request.handleProcessingError(fetchRequest, errorResponse),
    );
  }

  /**
   * Retrieve aggregation queue for specific PubNub client.
   *
   * @param client - Reference to PubNub client for which subscribe requests queue should be retrieved.
   * @returns List of client's subscribe requests which is enqueued for aggregation.
   */
  private aggregateQueueForClient(client: PubNubClient) {
    let queue: { timeout: ReturnType<typeof setTimeout>; requests: Record<string, SubscribeRequest[]> } | undefined;

    for (const identifier of Object.keys(this.delayedAggregationQueue)) {
      if (this.delayedAggregationQueue[identifier].requests[client.identifier]) {
        queue = this.delayedAggregationQueue[identifier];
        break;
      }
    }

    return queue ? queue.requests[client.identifier] : [];
  }

  /**
   * Enqueue subscribe requests for aggregation after small delay.
   *
   * @param client - Reference to the PubNub client which created subscribe request.
   * @param enqueuedRequests - List of subscribe requests which should be placed into the queue.
   */
  private enqueueForAggregation(client: PubNubClient, enqueuedRequests: SubscribeRequest[]) {
    const identifier = enqueuedRequests[0].asIdentifier;

    if (!this.delayedAggregationQueue[identifier]) {
      this.delayedAggregationQueue[identifier] = {
        timeout: setTimeout(() => this.handleDelayedAggregation(identifier), aggregationTimeout),
        requests: { [client.identifier]: enqueuedRequests },
      };
    } else {
      const requests = this.delayedAggregationQueue[identifier].requests;
      if (!requests[client.identifier]) requests[client.identifier] = enqueuedRequests;
      else
        enqueuedRequests.forEach(
          (request) => !requests[client.identifier].includes(request) && requests[client.identifier].push(request),
        );
    }
  }

  /**
   * Remove specific or all `client` requests from delayed aggregation queue.
   *
   * @param client - Reference to the PubNub client which created subscribe request.
   * @param [request] - Subscribe request which should be removed from the queue.
   * @returns List of removed requests.
   */
  private removeFromAggregationQueue(client: PubNubClient, request?: SubscribeRequest) {
    let queue: { timeout: ReturnType<typeof setTimeout>; requests: Record<string, SubscribeRequest[]> } | undefined;
    let removedRequests: SubscribeRequest[] = [];
    let queueIdentifier: string | undefined;

    if (request) {
      queueIdentifier = request.asIdentifier;
      queue = this.delayedAggregationQueue[queueIdentifier];
    } else {
      // Search where `client` previously stored its requests.
      for (const identifier of Object.keys(this.delayedAggregationQueue)) {
        if (this.delayedAggregationQueue[identifier].requests[client.identifier]) {
          queue = this.delayedAggregationQueue[identifier];
          queueIdentifier = identifier;
          break;
        }
      }
    }

    if (!queueIdentifier || !queue) return removedRequests;

    if (!queue || !queue.requests[client.identifier]) return [];

    if (request) {
      const requestIdx = queue.requests[client.identifier].indexOf(request);
      if (requestIdx >= 0) {
        queue.requests[client.identifier].splice(requestIdx, 1);
        if (queue.requests[client.identifier].length === 0) delete queue.requests[client.identifier];

        removedRequests = [request];
      }
    } else {
      removedRequests = [...queue.requests[client.identifier]];
      delete queue.requests[client.identifier];
    }

    if (Object.keys(queue.requests).length === 0 && queue.timeout) {
      clearTimeout(queue.timeout);
      delete this.delayedAggregationQueue[queueIdentifier];
    }

    return removedRequests;
  }

  /**
   * Handle delayed subscribe requests aggregation.
   *
   * @param identifier - Similar subscribe requests aggregation identifier.
   */
  private handleDelayedAggregation(identifier: string) {
    if (!this.delayedAggregationQueue[identifier]) return;

    let state = this.subscriptionStates[identifier];
    if (!state) {
      state = this.subscriptionStates[identifier] = new SubscriptionState();
      // Make sure to receive updates from subscription state.
      this.addListenerForSubscriptionStateEvents(state);
    }

    const requests = Object.values(this.delayedAggregationQueue[identifier].requests)
      .map((requests) => Object.values(requests))
      .flat();
    delete this.delayedAggregationQueue[identifier];

    state.beginChanges();
    requests.forEach((request) => state.addClientRequests(request.client, [request]));
    state.commitChanges();
  }
  // endregion

  // --------------------------------------------------------
  // ------------------- Event Handlers ---------------------
  // --------------------------------------------------------
  // region Event handlers

  /**
   * Listen for PubNub clients manager events which affects aggregated subscribe / heartbeat requests.
   *
   * @param clientsManager - Clients manager for which change in clients should be tracked.
   */
  private subscribeOnClientEvents(clientsManager: PubNubClientsManager) {
    clientsManager.addEventListener(PubNubClientsManagerEvent.Registered, (evt) => {
      const { client } = evt as PubNubClientManagerRegisterEvent;

      // Keep track of the client's listener abort controller.
      const abortController = new AbortController();
      this.clientAbortControllers[client.identifier] = abortController;

      client.addEventListener(PubNubClientEvent.Disconnect, () => this.removeClient(client, true), {
        signal: abortController.signal,
      });
      client.addEventListener(PubNubClientEvent.IdentityChange, () => this.moveClient(client), {
        signal: abortController.signal,
      });
      client.addEventListener(
        PubNubClientEvent.SendSubscribeRequest,
        (evt) => {
          const event = evt as PubNubClientSendSubscribeEvent;
          this.enqueueForAggregation(event.client, [event.request]);
        },
        { signal: abortController.signal },
      );
      client.addEventListener(
        PubNubClientEvent.SendLeaveRequest,
        (evt) => {
          const event = evt as PubNubClientSendLeaveEvent;
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
    clientsManager.addEventListener(PubNubClientsManagerEvent.Unregistered, (evt) => {
      const { client, withLeave } = evt as PubNubClientManagerUnregisterEvent;

      // Remove all listeners added for the client.
      const abortController = this.clientAbortControllers[client.identifier];
      delete this.clientAbortControllers[client.identifier];
      if (abortController) abortController.abort();

      // Update manager's state.
      this.removeClient(client, withLeave);
    });
  }

  /**
   * Listen for subscription state events.
   *
   * @param state - Reference to the subscription object for which listeners should be added.
   */
  private addListenerForSubscriptionStateEvents(state: SubscriptionState) {
    state.addEventListener(SubscriptionStateEvent.Changed, (evt) => {
      const event = evt as SubscriptionStateChangeEvent;

      // Cancel outdated ongoing service requests.
      event.canceledRequests.forEach((request) => this.cancelRequest(request));

      // Schedule new service requests processing.
      event.newRequests.forEach((request) => {
        this.sendRequest(
          request,
          (fetchRequest, response) => request.handleProcessingSuccess(fetchRequest, response),
          (fetchRequest, error) => request.handleProcessingError(fetchRequest, error),
          request.isInitialSubscribe && request.timetokenOverride !== '0'
            ? (response) =>
                this.patchInitialSubscribeResponse(response, request.timetokenOverride, request.timetokenRegionOverride)
            : undefined,
        );
      });
    });
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Create service `leave` request from client-provided request with channels and groups for removal.
   *
   * @param request - Original client-provided `leave` request.
   * @returns Service `leave` request.
   */
  private patchedLeaveRequest(request: LeaveRequest) {
    const subscriptionState = this.subscriptionStateForClient(request.client);
    if (!subscriptionState) {
      // Something is wrong. Client doesn't have any active subscriptions.
      request.cancel();
      return;
    }

    // Filter list from channels and groups which is still in use.
    const clientStateForLeave = subscriptionState.uniqueStateForClient(
      request.client,
      request.channels,
      request.channelGroups,
    );

    const serviceRequest = this.leaveRequest(
      request.client,
      clientStateForLeave.channels,
      clientStateForLeave.channelGroups,
    );
    if (serviceRequest) request.serviceRequest = serviceRequest;
    return serviceRequest;
  }

  /**
   * Create service `leave` request for specific PubNub client with channels and groups for removal.
   *
   * @param client - Reference to the PubNub client whose credentials should be used for new request.
   * @param channels - List of channels which not used by any other clients and can be left.
   * @param channelGroups - List of channel groups which no used by any other clients and can be left.
   * @returns Service `leave` request.
   */
  private leaveRequest(client: PubNubClient, channels: string[], channelGroups: string[]) {
    channels = channels
      .filter((channel) => !channel.endsWith('-pnpres'))
      .map((channel) => this.encodeString(channel))
      .sort();
    channelGroups = channelGroups
      .filter((channelGroup) => !channelGroup.endsWith('-pnpres'))
      .map((channelGroup) => this.encodeString(channelGroup))
      .sort();

    if (channels.length === 0 && channelGroups.length === 0) return undefined;

    const channelGroupsString: string | undefined = channelGroups.length > 0 ? channelGroups.join(',') : undefined;
    const channelsString = channels.length === 0 ? ',' : channels.join(',');

    const query: Query = {
      instanceid: client.identifier,
      uuid: client.userId,
      requestid: uuidGenerator.createUUID(),
      ...(client.accessToken ? { auth: client.accessToken.toString() } : {}),
      ...(channelGroupsString ? { 'channel-group': channelGroupsString } : {}),
    };

    const transportRequest: TransportRequest = {
      origin: client.origin,
      path: `/v2/presence/sub-key/${client.subKey}/channel/${channelsString}/leave`,
      queryParameters: query,
      method: TransportMethod.GET,
      headers: {},
      timeout: 10,
      cancellable: false,
      compressible: false,
      identifier: query.requestid as string,
    };

    return LeaveRequest.fromTransportRequest(transportRequest, client.subKey, client.accessToken);
  }

  /**
   * Patch subscribe service response with new timetoken and region.
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
