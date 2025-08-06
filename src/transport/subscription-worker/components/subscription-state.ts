import { PubNubSharedWorkerRequestEvents, RequestCancelEvent } from './custom-events/request-processing-event';
import { SubscriptionStateChangeEvent } from './custom-events/subscription-state-event';
import { SubscribeRequest } from './subscribe-request';
import { Payload } from '../../../core/types/api';
import { PubNubClient } from './pubnub-client';
import { AccessToken } from './access-token';

export class SubscriptionState extends EventTarget {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Map of client requests which is added and removed in batch (for efficient aggregation and cancellation).
   */
  private changesBatch?: Record<string, { add?: SubscribeRequest[]; remove?: SubscribeRequest[] }>;

  /**
   * Map of client-provided request identifiers to the subscription state listener abort controller.
   */
  private requestListenersAbort: Record<string, AbortController> = {};

  /**
   * Map of client identifiers to their portion of data which affects subscription state.
   *
   * **Note:** This information removed only with {@link SubscriptionState.removeClient|removeClient} function call.
   */
  private clientsState: Record<
    string,
    { channels: Set<string>; channelGroups: Set<string>; state?: Record<string, Payload> }
  > = {};

  /**
   * Map of client to its requests which is pending for service request processing results.
   */
  private requests: Record<string, SubscribeRequest[]> = {};

  /**
   * Aggregated/modified subscribe request which is used to call PubNub REST API.
   */
  private serviceRequests: SubscribeRequest[] = [];

  /**
   * Cached list of channel groups used with recent aggregation service requests.
   */
  private channelGroups: Set<string> = new Set();

  /**
   * Cached presence state associated with user for channels and groups used with recent aggregated service request.
   */
  private state: Record<string, Payload> = {};

  /**
   * Cached list of channels used with recent aggregation service requests.
   */
  private channels: Set<string> = new Set();

  /**
   * Reference to the most suitable access token to access {@link SubscriptionState#channels|channels} and
   * {@link SubscriptionState#channelGroups|channelGroups}.
   */
  private accessToken?: AccessToken;
  // endregion

  // --------------------------------------------------------
  // ---------------------- Accessors -----------------------
  // --------------------------------------------------------
  // region Accessors

  /**
   * Retrieve portion of subscription state which is related to the specific client.
   *
   * @param client - Reference to the PubNub client for which state should be retrieved.
   * @returns PubNub client's state in subscription.
   */
  stateForClient(client: PubNubClient): {
    channels: string[];
    channelGroups: string[];
    state?: Record<string, Payload>;
  } {
    const clientState = this.clientsState[client.identifier];

    return clientState
      ? { channels: [...clientState.channels], channelGroups: [...clientState.channelGroups], state: clientState.state }
      : { channels: [], channelGroups: [] };
  }

  /**
   * Retrieve portion of subscription state which is unique for the client.
   *
   * Function will return list of channels and groups which has been introduced by the client into the state (no other
   * clients have them).
   *
   * @param client - Reference to the PubNub client for which unique elements should be retrieved from the state.
   * @param channels - List of client's channels from subscription state.
   * @param channelGroups - List of client's channel groups from subscription state.
   * @returns State with channels and channel groups unique for the client.
   */
  uniqueStateForClient(
    client: PubNubClient,
    channels: string[],
    channelGroups: string[],
  ): {
    channels: string[];
    channelGroups: string[];
  } {
    let uniqueChannelGroups = [...channelGroups];
    let uniqueChannels = [...channels];

    Object.entries(this.clientsState).forEach(([identifier, state]) => {
      if (identifier === client.identifier) return;
      uniqueChannelGroups = uniqueChannelGroups.filter((channelGroup) => !state.channelGroups.has(channelGroup));
      uniqueChannels = uniqueChannels.filter((channel) => !state.channels.has(channel));
    });

    return { channels: uniqueChannels, channelGroups: uniqueChannelGroups };
  }

  /**
   * Retrieve list of ongoing subscribe requests for the client.
   *
   * @param client - Reference to the client for which requests should be retrieved.
   * @returns List of client's ongoing requests.
   */
  requestsForClient(client: PubNubClient) {
    return [...(this.requests[client.identifier] ?? [])];
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Aggregation ----------------------
  // --------------------------------------------------------
  // region Aggregation

  /**
   * Mark subscription state update start.
   */
  beginChanges() {
    if (this.changesBatch) {
      console.error(
        `Looks like there is incomplete change transaction. 'commitChanges()' should be called before 'beginChanges()'`,
      );
      return;
    }

    this.changesBatch = {};
  }

  /**
   * Add new client's request to the batched state update.
   *
   * @param client - Reference to PubNub client which is adding new requests for processing.
   * @param requests - List of new client-provided subscribe requests for processing.
   */
  addClientRequests(client: PubNubClient, requests: SubscribeRequest[]) {
    if (!this.changesBatch) {
      console.error(`'beginChanges()' should be called before 'addClientRequests(...)'`);
      return;
    }

    if (!this.changesBatch[client.identifier]) this.changesBatch[client.identifier] = { add: requests };
    else if (!this.changesBatch[client.identifier].add) this.changesBatch[client.identifier].add = requests;
    else this.changesBatch[client.identifier].add!.push(...requests);
  }

  /**
   * Add removed client's requests to the batched state update.
   *
   * @param client - Reference to PubNub client which is removing existing requests for processing.
   * @param requests - List of previous client-provided subscribe requests for removal.
   */
  removeClientRequests(client: PubNubClient, requests: SubscribeRequest[]) {
    if (!this.changesBatch) {
      console.error(`'beginChanges()' should be called before 'removeClientRequests(...)'`);
      return;
    }

    if (!this.changesBatch[client.identifier]) this.changesBatch[client.identifier] = { remove: requests };
    else if (!this.changesBatch[client.identifier].remove) this.changesBatch[client.identifier].remove = requests;
    else this.changesBatch[client.identifier].remove!.push(...requests);
  }

  /**
   * Add all requests associated with removed client to the batched state update.
   * @param client
   */
  removeClient(client: PubNubClient) {
    if (!this.changesBatch) {
      console.error(`'beginChanges()' should be called before 'removeClient(...)'`);
      return;
    }

    delete this.clientsState[client.identifier];

    if (!this.requests[client.identifier] || this.requests[client.identifier].length === 0) return;

    const requests = this.requests[client.identifier];
    if (!this.changesBatch[client.identifier]) this.changesBatch[client.identifier] = { remove: requests };
    else if (!this.changesBatch[client.identifier].remove) this.changesBatch[client.identifier].remove = requests;
    else this.changesBatch[client.identifier].remove!.push(...requests);
  }

  /**
   * Process batched state update.
   */
  commitChanges():
    | {
        channelGroups?: { removed?: string[]; added?: string[] };
        channels?: { removed?: string[]; added?: string[] };
      }
    | undefined {
    if (!this.changesBatch) {
      console.error(`'beginChanges()' should be called before 'commitChanges()'`);
      return undefined;
    } else if (Object.keys(this.changesBatch).length === 0) return undefined;

    let stateRefreshRequired = this.channelGroups.size === 0 && this.channels.size === 0;
    let changes: ReturnType<typeof this.subscriptionStateChanges>;

    // Identify whether state refresh maybe required because of some new PubNub client requests require it or has been
    // removed before completion or not.
    if (!stateRefreshRequired) {
      stateRefreshRequired = Object.values(this.changesBatch).some(
        (state) =>
          (state.remove && state.remove.length) ||
          (state.add && state.add.some((request) => request.requireCachedStateReset)),
      );
    }

    // Update list of PubNub client requests.
    const appliedRequests = this.applyBatchedRequestChanges();

    if (stateRefreshRequired) {
      const channelGroups = new Set<string>();
      const channels = new Set<string>();
      this.state = {};

      // Aggregate channels and groups from active requests.
      Object.entries(this.requests).forEach(([clientIdentifier, requests]) => {
        const clientState = (this.clientsState[clientIdentifier] ??= { channels: new Set(), channelGroups: new Set() });

        requests.forEach((request) => {
          if (request.state) {
            if (!clientState.state) clientState.state = {};
            clientState.state = { ...clientState.state, ...request.state };
            this.state = { ...this.state, ...request.state };
          }

          request.channelGroups.forEach(clientState.channelGroups.add, clientState.channelGroups);
          request.channels.forEach(clientState.channels.add, clientState.channels);

          request.channelGroups.forEach(channelGroups.add, channelGroups);
          request.channels.forEach(channels.add, channels);
        });
      });

      changes = this.subscriptionStateChanges(channels, channelGroups);

      // Update state information.
      this.channelGroups = channelGroups;
      this.channels = channels;

      // Identify most suitable access token.
      const sortedTokens = Object.values(this.requests)
        .flat()
        .filter((request) => !!request.accessToken)
        .map((request) => request.accessToken!)
        .sort(AccessToken.compare);
      if (sortedTokens && sortedTokens.length > 0) this.accessToken = sortedTokens.pop();
    }

    // Reset changes batch.
    this.changesBatch = undefined;

    // Identify and dispatch subscription state change event with service requests for cancellation and start.
    this.handleSubscriptionStateChange(
      changes,
      appliedRequests.initial,
      appliedRequests.continuation,
      appliedRequests.removed,
    );

    return changes;
  }

  /**
   * Process changes in subscription state.
   *
   * @param [changes] - Changes to the subscribed channels and groups in aggregated requests.
   * @param initialRequests - List of client-provided handshake subscribe requests.
   * @param continuationRequests - List of client-provided subscription loop continuation subscribe requests.
   * @param removedRequests - List of client-provided subscribe requests which should be removed from the state.
   */
  private handleSubscriptionStateChange(
    changes: ReturnType<typeof this.subscriptionStateChanges>,
    initialRequests: SubscribeRequest[],
    continuationRequests: SubscribeRequest[],
    removedRequests: SubscribeRequest[],
  ) {
    // If `changes` is undefine it mean that there were no changes in subscription channels/groups list and no need to
    // cancel ongoing long-poll request.
    const serviceRequests = this.serviceRequests.filter((request) => !request.completed);
    const cancelledServiceRequests: SubscribeRequest[] = [];
    const newServiceRequests: SubscribeRequest[] = [];

    // Identify token override for initial requests.
    let timetokenOverrideRefreshTimestamp: number | undefined;
    let timetokenOverride: string | undefined;
    let timetokenRegionOverride: string | undefined;

    (initialRequests.length ? continuationRequests : []).forEach((request) => {
      let shouldSetPreviousTimetoken = !timetokenOverride;
      if (!shouldSetPreviousTimetoken && request.timetoken !== '0') {
        if (timetokenOverride === '0') shouldSetPreviousTimetoken = true;
        else if (request.timetoken < timetokenOverride!)
          shouldSetPreviousTimetoken = request.creationDate > timetokenOverrideRefreshTimestamp!;
      }

      if (shouldSetPreviousTimetoken) {
        timetokenOverrideRefreshTimestamp = request.creationDate;
        timetokenOverride = request.timetoken;
        timetokenRegionOverride = request.region;
      }
    });

    // New aggregated requests constructor.
    const createAggregatedRequest = (requests: SubscribeRequest[]) => {
      if (requests.length === 0) return;

      const serviceRequest = SubscribeRequest.fromRequests(
        requests,
        this.accessToken,
        timetokenOverride,
        timetokenRegionOverride,
      );
      this.addListenersForRequestEvents(serviceRequest);

      requests.forEach((request) => (request.serviceRequest = serviceRequest));
      this.serviceRequests.push(serviceRequest);
      newServiceRequests.push(serviceRequest);
    };

    // Check whether already active service requests cover list of channels/groups and there is no need for separate
    // request.
    if (initialRequests.length) {
      const aggregationRequests: SubscribeRequest[] = [];

      serviceRequests.forEach((serviceRequest) => {
        for (const request of initialRequests) {
          if (request.isSubsetOf(serviceRequest)) {
            if (serviceRequest.isInitialSubscribe) request.serviceRequest = serviceRequest;
            else {
              request.handleProcessingStarted();
              this.makeResponseOnHandshakeRequest(request, serviceRequest.timetoken, serviceRequest.region!);
            }
          } else aggregationRequests.push(request);
        }
      });

      if (!serviceRequests.length && !aggregationRequests.length) aggregationRequests.push(...initialRequests);

      // Create handshake service request (if possible)
      createAggregatedRequest(aggregationRequests);
    }

    // Separate continuation requests by next subscription loop timetoken.
    // This prevents possibility that some subscribe requests will be aggregated into one with much newer timetoken and
    // miss messages as result.
    const continuationByTimetoken: Record<string, SubscribeRequest[]> = {};
    continuationRequests.forEach((request) => {
      if (!continuationByTimetoken[request.timetoken]) continuationByTimetoken[request.timetoken] = [request];
      else continuationByTimetoken[request.timetoken].push(request);
    });
    // Create continuation service request (if possible)
    Object.values(continuationByTimetoken).forEach((requests) => createAggregatedRequest(requests));

    // Find active service requests for which removed client-provided requests was the last one who provided channels
    // and groups for them
    if (removedRequests.length && changes && (changes.channelGroups.removed || changes.channels.removed)) {
      const removedChannelGroups = changes.channelGroups.removed ?? [];
      const removedChannels = changes.channels.removed ?? [];

      removedRequests.forEach((request) => {
        const { channels, channelGroups } = request.serviceRequest!;
        if (
          channelGroups.some((group) => removedChannelGroups.includes(group)) ||
          channels.some((channel) => removedChannels.includes(channel))
        )
          cancelledServiceRequests.push(request.serviceRequest! as SubscribeRequest);
      });
    }

    if (newServiceRequests.length || cancelledServiceRequests.length)
      this.dispatchEvent(new SubscriptionStateChangeEvent(newServiceRequests, cancelledServiceRequests));
  }
  // endregion

  // --------------------------------------------------------
  // ------------------- Event Handlers ---------------------
  // --------------------------------------------------------
  // region Event handlers

  private addListenersForRequestEvents(request: SubscribeRequest) {
    const abortController = (this.requestListenersAbort[request.request.identifier] = new AbortController());

    const cleanUpCallback = (evt: Event) => {
      this.removeListenersFromRequestEvents(request);

      if (!request.serviceRequest) return;

      // Canceled request should be pulled out from subscription state.
      if (evt instanceof RequestCancelEvent) {
        const { request } = evt as RequestCancelEvent;
        this.beginChanges();
        this.removeClientRequests(request.client, [request as SubscribeRequest]);
        this.commitChanges();
      }
    };

    request.addEventListener(PubNubSharedWorkerRequestEvents.Success, cleanUpCallback, {
      signal: abortController.signal,
      once: true,
    });
    request.addEventListener(PubNubSharedWorkerRequestEvents.Error, cleanUpCallback, {
      signal: abortController.signal,
      once: true,
    });
    request.addEventListener(PubNubSharedWorkerRequestEvents.Canceled, cleanUpCallback, {
      signal: abortController.signal,
      once: true,
    });
  }

  private removeListenersFromRequestEvents(request: SubscribeRequest) {
    if (!this.requestListenersAbort[request.request.identifier]) return;

    this.requestListenersAbort[request.request.identifier].abort();
    delete this.requestListenersAbort[request.request.identifier];
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

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
   * Apply batched requests change.
   *
   * @returns Subscribe request separated by different subscription loop stages.
   */
  private applyBatchedRequestChanges(): {
    initial: SubscribeRequest[];
    continuation: SubscribeRequest[];
    removed: SubscribeRequest[];
  } {
    const continuationRequests: SubscribeRequest[] = [];
    const initialRequests: SubscribeRequest[] = [];
    const removedRequests: SubscribeRequest[] = [];
    const changesBatch = this.changesBatch!;

    // Handle rapid subscribe requests addition and removal (when same subscribe request instance added in both `add`
    // and `remove` operations). Remove has higher priority.
    Object.keys(changesBatch).forEach((clientIdentifier) => {
      if (!changesBatch[clientIdentifier].add || !changesBatch[clientIdentifier].remove) return;
      for (const request of changesBatch[clientIdentifier].remove!) {
        const addRequestIdx = changesBatch[clientIdentifier].add!.indexOf(request);
        if (addRequestIdx >= 0) changesBatch[clientIdentifier].add!.splice(addRequestIdx, 1);
      }
    });

    Object.keys(changesBatch).forEach((clientIdentifier) => {
      if (changesBatch[clientIdentifier].add!) {
        if (!this.requests[clientIdentifier]) this.requests[clientIdentifier] = [];

        for (const request of changesBatch[clientIdentifier].add!) {
          if (request.isInitialSubscribe) initialRequests.push(request);
          else continuationRequests.push(request);
          this.requests[clientIdentifier].push(request);
          this.addListenersForRequestEvents(request);
        }
      }

      if (this.requests[clientIdentifier] && changesBatch[clientIdentifier].remove!) {
        for (const request of changesBatch[clientIdentifier].remove!) {
          const addRequestIdx = this.requests[clientIdentifier].indexOf(request);
          if (addRequestIdx < 0) continue;

          if (!request.completed && request.serviceRequest) removedRequests.push(request);
          this.requests[clientIdentifier].splice(addRequestIdx, 1);
          this.removeListenersFromRequestEvents(request);

          if (this.requests[clientIdentifier].length === 0) delete this.requests[clientIdentifier];
        }
      }
    });

    return { initial: initialRequests, continuation: continuationRequests, removed: removedRequests };
  }

  /**
   * Identify changes to the channels and groups.
   *
   * @param channels - Set with channels which has been left after client requests list has been changed.
   * @param channelGroups - Set with channel groups which has been left after client requests list has been changed.
   * @returns Objects with names of channels and groups which has been added and removed from the current subscription
   * state.
   */
  private subscriptionStateChanges(
    channels: Set<string>,
    channelGroups: Set<string>,
  ):
    | {
        channelGroups: { removed?: string[]; added?: string[] };
        channels: { removed?: string[]; added?: string[] };
      }
    | undefined {
    const stateIsEmpty = this.channelGroups.size === 0 && this.channels.size === 0;
    const changes = { channelGroups: {}, channels: {} };
    const removedChannelGroups: string[] = [];
    const addedChannelGroups: string[] = [];
    const removedChannels: string[] = [];
    const addedChannels: string[] = [];

    for (const group of channelGroups) if (!this.channelGroups.has(group)) addedChannelGroups.push(group);
    for (const channel of channels) if (!this.channels.has(channel)) addedChannels.push(channel);

    if (!stateIsEmpty) {
      for (const group of this.channelGroups) if (!channelGroups.has(group)) removedChannelGroups.push(group);
      for (const channel of this.channels) if (!channels.has(channel)) removedChannels.push(channel);
    }

    if (addedChannels.length || removedChannels.length) {
      changes.channels = {
        ...(addedChannels.length ? { added: addedChannels } : {}),
        ...(removedChannels.length ? { removed: removedChannels } : {}),
      };
    }

    if (addedChannelGroups.length || removedChannelGroups.length) {
      changes.channelGroups = {
        ...(addedChannelGroups.length ? { added: addedChannelGroups } : {}),
        ...(removedChannelGroups.length ? { removed: removedChannelGroups } : {}),
      };
    }

    return Object.keys(changes.channelGroups).length === 0 && Object.keys(changes.channels).length === 0
      ? undefined
      : changes;
  }
  // endregion
}
