import { PubNubSharedWorkerRequestEvents } from './custom-events/request-processing-event';
import {
  SubscriptionStateChangeEvent,
  SubscriptionStateInvalidateEvent,
} from './custom-events/subscription-state-event';
import { SubscribeRequest } from './subscribe-request';
import { Payload } from '../../../core/types/api';
import { PubNubClient } from './pubnub-client';
import { LeaveRequest } from './leave-request';
import { AccessToken } from './access-token';
import { leaveRequest } from './helpers';

export class SubscriptionStateChange {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Timestamp when batched changes has been modified before.
   */
  private static previousChangeTimestamp = 0;

  /**
   * Timestamp when subscription change has been enqueued.
   */
  private readonly _timestamp: number;
  // endregion

  // --------------------------------------------------------
  // --------------------- Constructor ----------------------
  // --------------------------------------------------------
  // region Constructor

  /**
   * Squash changes to exclude repetitive removal and addition of the same requests in a single change transaction.
   *
   * @param changes - List of changes that should be analyzed and squashed if possible.
   * @returns List of changes that doesn't have self-excluding change requests.
   */
  static squashedChanges(changes: SubscriptionStateChange[]) {
    if (!changes.length || changes.length === 1) return changes;

    // Sort changes in order in which they have been created (original `changes` is Set).
    const sortedChanges = changes.sort((lhc, rhc) => lhc.timestamp - rhc.timestamp);

    // Remove changes which first add and then remove same request (removes both addition and removal change entry).
    const requestAddChange = sortedChanges.filter((change) => !change.remove);
    requestAddChange.forEach((addChange) => {
      for (let idx = 0; idx < requestAddChange.length; idx++) {
        const change = requestAddChange[idx];
        if (!change.remove || change.request.identifier !== addChange.request.identifier) continue;
        sortedChanges.splice(idx, 1);
        sortedChanges.splice(sortedChanges.indexOf(addChange), 1);
        break;
      }
    });

    // Filter out old `add` change entries for the same client.
    const addChangePerClient: Record<string, SubscriptionStateChange> = {};
    requestAddChange.forEach((change) => {
      if (addChangePerClient[change.clientIdentifier]) {
        const changeIdx = sortedChanges.indexOf(change);
        if (changeIdx >= 0) sortedChanges.splice(changeIdx, 1);
      }
      addChangePerClient[change.clientIdentifier] = change;
    });

    return sortedChanges;
  }

  /**
   * Create subscription state batched change entry.
   *
   * @param clientIdentifier - Identifier of the {@link PubNubClient|PubNub} client that provided data for subscription
   * state change.
   * @param request - Request that should be used during batched subscription state modification.
   * @param remove - Whether provided {@link request} should be removed from `subscription` state or not.
   * @param sendLeave - Whether the {@link PubNubClient|client} should send a presence `leave` request for _free_
   * channels and groups or not.
   * @param [clientInvalidate=false] - Whether the `subscription` state change was caused by the
   * {@link PubNubClient|PubNub} client invalidation (unregister) or not.
   */
  constructor(
    public readonly clientIdentifier: string,
    public readonly request: SubscribeRequest,
    public readonly remove: boolean,
    public readonly sendLeave: boolean,
    public readonly clientInvalidate = false,
  ) {
    this._timestamp = this.timestampForChange();
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Properties -----------------------
  // --------------------------------------------------------
  // region Properties

  /**
   * Retrieve subscription change enqueue timestamp.
   *
   * @returns Subscription change enqueue timestamp.
   */
  get timestamp() {
    return this._timestamp;
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Serialize object for easier representation in logs.
   *
   * @returns Stringified `subscription` state object.
   */
  toString() {
    return `SubscriptionStateChange { timestamp: ${this.timestamp}, client: ${
      this.clientIdentifier
    }, request: ${this.request.toString()}, remove: ${this.remove ? "'remove'" : "'do not remove'"}, sendLeave: ${
      this.sendLeave ? "'send'" : "'do not send'"
    } }`;
  }

  /**
   * Serialize the object to a "typed" JSON string.
   *
   * @returns "Typed" JSON string.
   */
  toJSON() {
    return this.toString();
  }

  /**
   * Retrieve timestamp when change has been added to the batch.
   *
   * Non-repetitive timestamp required for proper changes sorting and identification of requests which has been removed
   * and added during single batch.
   *
   * @returns Non-repetitive timestamp even for burst changes.
   */
  private timestampForChange() {
    const timestamp = Date.now();

    if (timestamp <= SubscriptionStateChange.previousChangeTimestamp) {
      SubscriptionStateChange.previousChangeTimestamp++;
    } else SubscriptionStateChange.previousChangeTimestamp = timestamp;

    return SubscriptionStateChange.previousChangeTimestamp;
  }
  // endregion
}

/**
 * Aggregated subscription state.
 *
 * State object responsible for keeping in sync and optimization of `client`-provided {@link SubscribeRequest|requests}
 * by attaching them to already existing or new aggregated `service`-provided {@link SubscribeRequest|requests} to
 * reduce number of concurrent connections.
 */
export class SubscriptionState extends EventTarget {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Map of `client`-provided request identifiers to the subscription state listener abort controller.
   */
  private requestListenersAbort: Record<string, AbortController> = {};

  /**
   * Map of {@link PubNubClient|client} identifiers to their portion of data which affects subscription state.
   *
   * **Note:** This information is removed only with the {@link SubscriptionState.removeClient|removeClient} function
   * call.
   */
  private clientsState: Record<
    string,
    { channels: Set<string>; channelGroups: Set<string>; state?: Record<string, Payload> }
  > = {};

  /**
   * Map of {@link PubNubClient|client} to its {@link SubscribeRequest|request} that already received response/error
   * or has been canceled.
   */
  private lastCompletedRequest: Record<string, SubscribeRequest> = {};

  /**
   * List of identifiers of the {@link PubNubClient|PubNub} clients that should be invalidated when it will be
   * possible.
   */
  private clientsForInvalidation: string[] = [];

  /**
   * Map of {@link PubNubClient|client} to its {@link SubscribeRequest|request} which is pending for
   * `service`-provided {@link SubscribeRequest|request} processing results.
   */
  private requests: Record<string, SubscribeRequest> = {};

  /**
   * Aggregated/modified {@link SubscribeRequest|subscribe} requests which is used to call PubNub REST API.
   *
   * **Note:** There could be multiple requests to handle the situation when similar {@link PubNubClient|PubNub} clients
   * have subscriptions but with different timetokens (if requests have intersecting lists of channels and groups they
   * can be merged in the future if a response on a similar channel will be received and the same `timetoken` will be
   * used for continuation).
   */
  private serviceRequests: SubscribeRequest[] = [];

  /**
   * Cached list of channel groups used with recent aggregation service requests.
   *
   * **Note:** Set required to have the ability to identify which channel groups have been added/removed with recent
   * {@link SubscriptionStateChange|changes} list processing.
   */
  private channelGroups: Set<string> = new Set();

  /**
   * Cached list of channels used with recent aggregation service requests.
   *
   * **Note:** Set required to have the ability to identify which channels have been added/removed with recent
   * {@link SubscriptionStateChange|changes} list processing.
   */
  private channels: Set<string> = new Set();

  /**
   * Reference to the most suitable access token to access {@link SubscriptionState#channels|channels} and
   * {@link SubscriptionState#channelGroups|channelGroups}.
   */
  private accessToken?: AccessToken;
  // endregion

  // --------------------------------------------------------
  // --------------------- Constructor ----------------------
  // --------------------------------------------------------
  // region Constructor

  /**
   * Create subscription state management object.
   *
   * @param identifier -  Similar {@link SubscribeRequest|subscribe} requests aggregation identifier.
   */
  constructor(public readonly identifier: string) {
    super();
  }
  // endregion

  // --------------------------------------------------------
  // ---------------------- Accessors -----------------------
  // --------------------------------------------------------
  // region Accessors

  /**
   * Check whether subscription state contain state for specific {@link PubNubClient|PubNub} client.
   *
   * @param client - Reference to the {@link PubNubClient|PubNub} client for which state should be checked.
   * @returns `true` if there is state related to the {@link PubNubClient|client}.
   */
  hasStateForClient(client: PubNubClient) {
    return !!this.clientsState[client.identifier];
  }

  /**
   * Retrieve portion of subscription state which is unique for the {@link PubNubClient|client}.
   *
   * Function will return list of channels and groups which has been introduced by the client into the state (no other
   * clients have them).
   *
   * @param client - Reference to the {@link PubNubClient|PubNub} client for which unique elements should be retrieved
   * from the state.
   * @param channels - List of client's channels from subscription state.
   * @param channelGroups - List of client's channel groups from subscription state.
   * @returns State with channels and channel groups unique for the {@link PubNubClient|client}.
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
   * Retrieve ongoing `client`-provided {@link SubscribeRequest|subscribe} request for the {@link PubNubClient|client}.
   *
   * @param client - Reference to the {@link PubNubClient|PubNub} client for which requests should be retrieved.
   * @param [invalidated=false] - Whether receiving request for invalidated (unregistered) {@link PubNubClient|PubNub}
   * client.
   * @returns A `client`-provided {@link SubscribeRequest|subscribe} request if it has been sent by
   * {@link PubNubClient|client}.
   */
  requestForClient(client: PubNubClient, invalidated = false): SubscribeRequest | undefined {
    return this.requests[client.identifier] ?? (invalidated ? this.lastCompletedRequest[client.identifier] : undefined);
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Aggregation ----------------------
  // --------------------------------------------------------
  // region Aggregation

  /**
   * Mark specific client as suitable for state invalidation when it will be appropriate.
   *
   * @param client - Reference to the {@link PubNubClient|PubNub} client which should be invalidated when will be
   * possible.
   */
  invalidateClient(client: PubNubClient) {
    if (this.clientsForInvalidation.includes(client.identifier)) return;
    this.clientsForInvalidation.push(client.identifier);
  }

  /**
   * Process batched subscription state change.
   *
   * @param changes - List of {@link SubscriptionStateChange|changes} made from requests received from the core
   * {@link PubNubClient|PubNub} client modules.
   */
  processChanges(changes: SubscriptionStateChange[]) {
    if (changes.length) changes = SubscriptionStateChange.squashedChanges(changes);

    if (!changes.length) return;

    let stateRefreshRequired = this.channelGroups.size === 0 && this.channels.size === 0;
    if (!stateRefreshRequired)
      stateRefreshRequired = changes.some((change) => change.remove || change.request.requireCachedStateReset);

    // Update list of PubNub client requests.
    const appliedRequests = this.applyChanges(changes);

    let stateChanges: ReturnType<typeof this.subscriptionStateChanges>;
    if (stateRefreshRequired) stateChanges = this.refreshInternalState();

    // Identify and dispatch subscription state change event with service requests for cancellation and start.
    this.handleSubscriptionStateChange(
      changes,
      stateChanges,
      appliedRequests.initial,
      appliedRequests.continuation,
      appliedRequests.removed,
    );

    // Check whether subscription state for all registered clients has been removed or not.
    if (!Object.keys(this.clientsState).length) this.dispatchEvent(new SubscriptionStateInvalidateEvent());
  }

  /**
   * Make changes to the internal state.
   *
   * Categorize changes by grouping requests (into `initial`, `continuation`, and `removed` groups) and update internal
   * state to reflect those changes (add/remove `client`-provided requests).
   *
   * @param changes - Final subscription state changes list.
   * @returns Subscribe request separated by different subscription loop stages.
   */
  private applyChanges(changes: SubscriptionStateChange[]): {
    initial: SubscribeRequest[];
    continuation: SubscribeRequest[];
    removed: SubscribeRequest[];
  } {
    const continuationRequests: SubscribeRequest[] = [];
    const initialRequests: SubscribeRequest[] = [];
    const removedRequests: SubscribeRequest[] = [];

    changes.forEach((change) => {
      const { remove, request, clientIdentifier, clientInvalidate } = change;

      if (!remove) {
        if (request.isInitialSubscribe) initialRequests.push(request);
        else continuationRequests.push(request);

        this.requests[clientIdentifier] = request;
        this.addListenersForRequestEvents(request);
      }

      if (remove && (!!this.requests[clientIdentifier] || !!this.lastCompletedRequest[clientIdentifier])) {
        if (clientInvalidate) {
          delete this.lastCompletedRequest[clientIdentifier];
          delete this.clientsState[clientIdentifier];
        }

        delete this.requests[clientIdentifier];
        removedRequests.push(request);
      }
    });

    return { initial: initialRequests, continuation: continuationRequests, removed: removedRequests };
  }

  /**
   * Process changes in subscription state.
   *
   * @param changes - Final subscription state changes list.
   * @param stateChanges - Changes to the subscribed channels and groups in aggregated requests.
   * @param initialRequests - List of `client`-provided handshake {@link SubscribeRequest|subscribe} requests.
   * @param continuationRequests - List of `client`-provided subscription loop continuation
   * {@link SubscribeRequest|subscribe} requests.
   * @param removedRequests - List of `client`-provided {@link SubscribeRequest|subscribe} requests that should be
   * removed from the state.
   */
  private handleSubscriptionStateChange(
    changes: SubscriptionStateChange[],
    stateChanges: ReturnType<typeof this.subscriptionStateChanges>,
    initialRequests: SubscribeRequest[],
    continuationRequests: SubscribeRequest[],
    removedRequests: SubscribeRequest[],
  ) {
    // Retrieve list of active (not completed or canceled) `service`-provided requests.
    const serviceRequests = this.serviceRequests.filter((request) => !request.completed && !request.canceled);
    const requestsWithInitialResponse: { request: SubscribeRequest; timetoken: string; region: string }[] = [];
    const newContinuationServiceRequests: SubscribeRequest[] = [];
    const newInitialServiceRequests: SubscribeRequest[] = [];
    const cancelledServiceRequests: SubscribeRequest[] = [];
    let serviceLeaveRequest: LeaveRequest | undefined;

    const originalContinuationRequests = [...continuationRequests];
    const originalInitialRequests = [...initialRequests];

    // Identify token override for initial requests.
    let timetokenOverrideRefreshTimestamp: number | undefined;
    let decidedTimetokenRegionOverride: string | undefined;
    let decidedTimetokenOverride: string | undefined;

    const cancelServiceRequest = (serviceRequest: SubscribeRequest) => {
      cancelledServiceRequests.push(serviceRequest);

      const rest = serviceRequest
        .dependentRequests<SubscribeRequest>()
        .filter((dependantRequest) => !removedRequests.includes(dependantRequest));

      if (rest.length === 0) return;

      rest.forEach((dependantRequest) => (dependantRequest.serviceRequest = undefined));
      (serviceRequest.isInitialSubscribe ? initialRequests : continuationRequests).push(...rest);
    };

    // --------------------------------------------------
    // Identify ongoing `service`-provided requests which should be canceled because channels/channel groups has been
    // added/removed.
    //

    if (stateChanges) {
      if (stateChanges.channels.added || stateChanges.channelGroups.added) {
        for (const serviceRequest of serviceRequests) cancelServiceRequest(serviceRequest);
        serviceRequests.length = 0;
      } else if (stateChanges.channels.removed || stateChanges.channelGroups.removed) {
        const channelGroups = stateChanges.channelGroups.removed ?? [];
        const channels = stateChanges.channels.removed ?? [];

        for (let serviceRequestIdx = serviceRequests.length - 1; serviceRequestIdx >= 0; serviceRequestIdx--) {
          const serviceRequest = serviceRequests[serviceRequestIdx];
          if (!serviceRequest.hasAnyChannelsOrGroups(channels, channelGroups)) continue;

          cancelServiceRequest(serviceRequest);
          serviceRequests.splice(serviceRequestIdx, 1);
        }
      }
    }

    continuationRequests = this.squashSameClientRequests(continuationRequests);
    initialRequests = this.squashSameClientRequests(initialRequests);

    // --------------------------------------------------
    // Searching for optimal timetoken, which should be used for `service`-provided request (will override response with
    // new timetoken to make it possible to aggregate on next subscription loop with already ongoing `service`-provided
    // long-poll request).
    //

    (initialRequests.length ? continuationRequests : []).forEach((request) => {
      let shouldSetPreviousTimetoken = !decidedTimetokenOverride;
      if (!shouldSetPreviousTimetoken && request.timetoken !== '0') {
        if (decidedTimetokenOverride === '0') shouldSetPreviousTimetoken = true;
        else if (request.timetoken < decidedTimetokenOverride!)
          shouldSetPreviousTimetoken = request.creationDate > timetokenOverrideRefreshTimestamp!;
      }

      if (shouldSetPreviousTimetoken) {
        timetokenOverrideRefreshTimestamp = request.creationDate;
        decidedTimetokenOverride = request.timetoken;
        decidedTimetokenRegionOverride = request.region;
      }
    });

    // --------------------------------------------------
    // Try to attach `initial` and `continuation` `client`-provided requests to ongoing `service`-provided requests.
    //

    // Separate continuation requests by next subscription loop timetoken.
    // This prevents possibility that some subscribe requests will be aggregated into one with much newer timetoken and
    // miss messages as result.
    const continuationByTimetoken: Record<string, SubscribeRequest[]> = {};
    continuationRequests.forEach((request) => {
      if (!continuationByTimetoken[request.timetoken]) continuationByTimetoken[request.timetoken] = [request];
      else continuationByTimetoken[request.timetoken].push(request);
    });

    this.attachToServiceRequest(serviceRequests, initialRequests);
    for (let initialRequestIdx = initialRequests.length - 1; initialRequestIdx >= 0; initialRequestIdx--) {
      const request = initialRequests[initialRequestIdx];

      serviceRequests.forEach((serviceRequest) => {
        if (!request.isSubsetOf(serviceRequest) || serviceRequest.isInitialSubscribe) return;

        const { region, timetoken } = serviceRequest;
        requestsWithInitialResponse.push({ request, timetoken, region: region! });
        initialRequests.splice(initialRequestIdx, 1);
      });
    }
    if (initialRequests.length) {
      let aggregationRequests: SubscribeRequest[];

      if (continuationRequests.length) {
        decidedTimetokenOverride = Object.keys(continuationByTimetoken).sort().pop()!;
        const requests = continuationByTimetoken[decidedTimetokenOverride];
        decidedTimetokenRegionOverride = requests[0].region!;
        delete continuationByTimetoken[decidedTimetokenOverride];

        requests.forEach((request) => request.resetToInitialRequest());
        aggregationRequests = [...initialRequests, ...requests];
      } else aggregationRequests = initialRequests;

      // Create handshake service request (if possible)
      this.createAggregatedRequest(
        aggregationRequests,
        newInitialServiceRequests,
        decidedTimetokenOverride,
        decidedTimetokenRegionOverride,
      );
    }

    // Handle case when `initial` requests are supersets of continuation requests.
    Object.values(continuationByTimetoken).forEach((requestsByTimetoken) => {
      // Set `initial` `service`-provided requests as service requests for those continuation `client`-provided requests
      // that are a _subset_ of them.
      this.attachToServiceRequest(newInitialServiceRequests, requestsByTimetoken);
      // Set `ongoing` `service`-provided requests as service requests for those continuation `client`-provided requests
      // that are a _subset_ of them (if any still available).
      this.attachToServiceRequest(serviceRequests, requestsByTimetoken);

      // Create continuation `service`-provided request (if possible).
      this.createAggregatedRequest(requestsByTimetoken, newContinuationServiceRequests);
    });

    // --------------------------------------------------
    // Identify channels and groups for which presence `leave` should be generated.
    //

    const channelGroupsForLeave = new Set<string>();
    const channelsForLeave = new Set<string>();

    if (
      stateChanges &&
      removedRequests.length &&
      (stateChanges.channels.removed || stateChanges.channelGroups.removed)
    ) {
      const channelGroups = stateChanges.channelGroups.removed ?? [];
      const channels = stateChanges.channels.removed ?? [];
      const client = removedRequests[0].client;

      changes
        .filter((change) => change.remove && change.sendLeave)
        .forEach((change) => {
          const { channels: requestChannels, channelGroups: requestChannelsGroups } = change.request;
          channelGroups.forEach((group) => requestChannelsGroups.includes(group) && channelGroupsForLeave.add(group));
          channels.forEach((channel) => requestChannels.includes(channel) && channelsForLeave.add(channel));
        });
      serviceLeaveRequest = leaveRequest(client, [...channelsForLeave], [...channelGroupsForLeave]);
    }

    if (
      requestsWithInitialResponse.length ||
      newInitialServiceRequests.length ||
      newContinuationServiceRequests.length ||
      cancelledServiceRequests.length ||
      serviceLeaveRequest
    ) {
      this.dispatchEvent(
        new SubscriptionStateChangeEvent(
          requestsWithInitialResponse,
          [...newInitialServiceRequests, ...newContinuationServiceRequests],
          cancelledServiceRequests,
          serviceLeaveRequest,
        ),
      );
    }
  }

  /**
   * Refresh the internal subscription's state.
   */
  private refreshInternalState() {
    const channelGroups = new Set<string>();
    const channels = new Set<string>();

    // Aggregate channels and groups from active requests.
    Object.entries(this.requests).forEach(([clientIdentifier, request]) => {
      const clientState = (this.clientsState[clientIdentifier] ??= { channels: new Set(), channelGroups: new Set() });

      request.channelGroups.forEach(clientState.channelGroups.add, clientState.channelGroups);
      request.channels.forEach(clientState.channels.add, clientState.channels);

      request.channelGroups.forEach(channelGroups.add, channelGroups);
      request.channels.forEach(channels.add, channels);
    });

    const changes = this.subscriptionStateChanges(channels, channelGroups);

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

    return changes;
  }
  // endregion

  // --------------------------------------------------------
  // ------------------- Event Handlers ---------------------
  // --------------------------------------------------------
  // region Event handlers

  private addListenersForRequestEvents(request: SubscribeRequest) {
    const abortController = (this.requestListenersAbort[request.identifier] = new AbortController());

    const cleanUpCallback = (evt: Event) => {
      this.removeListenersFromRequestEvents(request);
      if (!request.isServiceRequest) {
        if (this.requests[request.client.identifier]) {
          this.lastCompletedRequest[request.client.identifier] = request;
          delete this.requests[request.client.identifier];

          const clientIdx = this.clientsForInvalidation.indexOf(request.client.identifier);
          if (clientIdx > 0) {
            this.clientsForInvalidation.splice(clientIdx, 1);
            delete this.lastCompletedRequest[request.client.identifier];
            delete this.clientsState[request.client.identifier];

            // Check whether subscription state for all registered clients has been removed or not.
            if (!Object.keys(this.clientsState).length) this.dispatchEvent(new SubscriptionStateInvalidateEvent());
          }
        }

        return;
      }

      const requestIdx = this.serviceRequests.indexOf(request);
      if (requestIdx >= 0) this.serviceRequests.splice(requestIdx, 1);
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

  /**
   * Squash list of provided requests to represent latest request for each client.
   *
   * @param requests - List with potentially repetitive or multiple {@link SubscribeRequest|subscribe} requests for the
   * same {@link PubNubClient|PubNub} client.
   * @returns List of latest {@link SubscribeRequest|subscribe} requests for corresponding {@link PubNubClient|PubNub}
   * clients.
   */
  private squashSameClientRequests(requests: SubscribeRequest[]) {
    if (!requests.length || requests.length === 1) return requests;

    // Sort requests in order in which they have been created.
    const sortedRequests = requests.sort((lhr, rhr) => lhr.creationDate - rhr.creationDate);
    return Object.values(
      sortedRequests.reduce(
        (acc, value) => {
          acc[value.client.identifier] = value;
          return acc;
        },
        {} as Record<string, SubscribeRequest>,
      ),
    );
  }

  /**
   * Attach `client`-provided requests to the compatible ongoing `service`-provided requests.
   *
   * @param serviceRequests - List of ongoing `service`-provided subscribe requests.
   * @param requests - List of `client`-provided requests that should try to hook for service response using existing
   * ongoing `service`-provided requests.
   */
  private attachToServiceRequest(serviceRequests: SubscribeRequest[], requests: SubscribeRequest[]) {
    if (!serviceRequests.length || !requests.length) return;

    [...requests].forEach((request) => {
      for (const serviceRequest of serviceRequests) {
        // Check whether continuation request is actually a subset of the `service`-provided request or not.
        // Note: Second condition handled in the function which calls `attachToServiceRequest`.
        if (
          !!request.serviceRequest ||
          !request.isSubsetOf(serviceRequest) ||
          (request.isInitialSubscribe && !serviceRequest.isInitialSubscribe)
        )
          continue;

        // Attach to the matching `service`-provided request.
        request.serviceRequest = serviceRequest;

        // There is no need to aggregate attached request.
        const requestIdx = requests.indexOf(request);
        requests.splice(requestIdx, 1);
        break;
      }
    });
  }

  /**
   * Create aggregated `service`-provided {@link SubscribeRequest|subscribe} request.
   *
   * @param requests - List of `client`-provided {@link SubscribeRequest|subscribe} requests which should be sent with
   * as single `service`-provided request.
   * @param serviceRequests - List with created `service`-provided {@link SubscribeRequest|subscribe} requests.
   * @param timetokenOverride - Timetoken that should replace the initial response timetoken.
   * @param regionOverride - Timetoken region that should replace the initial response timetoken region.
   */
  private createAggregatedRequest(
    requests: SubscribeRequest[],
    serviceRequests: SubscribeRequest[],
    timetokenOverride?: string,
    regionOverride?: string,
  ) {
    if (requests.length === 0) return;

    const serviceRequest = SubscribeRequest.fromRequests(requests, this.accessToken, timetokenOverride, regionOverride);
    this.addListenersForRequestEvents(serviceRequest);

    requests.forEach((request) => (request.serviceRequest = serviceRequest));
    this.serviceRequests.push(serviceRequest);
    serviceRequests.push(serviceRequest);
  }
  // endregion
}
