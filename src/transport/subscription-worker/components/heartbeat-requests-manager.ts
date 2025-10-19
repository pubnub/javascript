import {
  PubNubClientEvent,
  PubNubClientSendLeaveEvent,
  PubNubClientAuthChangeEvent,
  PubNubClientSendHeartbeatEvent,
  PubNubClientIdentityChangeEvent,
  PubNubClientPresenceStateChangeEvent,
  PubNubClientHeartbeatIntervalChangeEvent,
} from './custom-events/client-event';
import {
  PubNubClientsManagerEvent,
  PubNubClientManagerRegisterEvent,
  PubNubClientManagerUnregisterEvent,
} from './custom-events/client-manager-event';
import { HeartbeatStateEvent, HeartbeatStateHeartbeatEvent } from './custom-events/heartbeat-state-event';
import { PubNubClientsManager } from './pubnub-clients-manager';
import { HeartbeatRequest } from './heartbeat-request';
import { RequestsManager } from './requests-manager';
import { HeartbeatState } from './heartbeat-state';
import { PubNubClient } from './pubnub-client';

/**
 * Heartbeat requests manager responsible for heartbeat aggregation and backup of throttled clients (background tabs).
 *
 * On each heartbeat request from core PubNub client module manager will try to identify whether it is time to send it
 * and also will try to aggregate call for channels / groups for the same user.
 */
export class HeartbeatRequestsManager extends RequestsManager {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Service response binary data decoder.
   */
  private static textDecoder = new TextDecoder();

  /**
   * Map of unique user identifier (composed from multiple request object properties) to the aggregated heartbeat state.
   * @private
   */
  private heartbeatStates: Record<string, HeartbeatState> = {};

  /**
   * Map of client identifiers to `AbortController` instances which is used to detach added listeners when PubNub client
   * unregister.
   */
  private clientAbortControllers: Record<string, AbortController> = {};
  // endregion

  // --------------------------------------------------------
  // --------------------- Constructors ---------------------
  // --------------------------------------------------------
  // region Constructors

  /**
   * Create heartbeat requests manager.
   *
   * @param clientsManager - Reference to the core PubNub clients manager to track their life-cycle and make
   * corresponding state changes.
   */
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
   * Retrieve heartbeat state with which specific client is working.
   *
   * @param client - Reference to the PubNub client for which heartbeat state should be found.
   * @returns Reference to the heartbeat state if client has ongoing requests.
   */
  private heartbeatStateForClient(client: PubNubClient) {
    for (const heartbeatState of Object.values(this.heartbeatStates))
      if (!!heartbeatState.stateForClient(client)) return heartbeatState;

    return undefined;
  }

  /**
   * Move client between heartbeat states.
   *
   * This function used when PubNub client changed its identity (`userId`) or auth (`access token`) and can't be
   * aggregated with previous requests.
   *
   * @param client - Reference to the  {@link PubNubClient|PubNub} client which should be moved to new state.
   */
  private moveClient(client: PubNubClient) {
    const state = this.heartbeatStateForClient(client);
    const request = state ? state.requestForClient(client) : undefined;
    if (!state || !request) return;

    this.removeClient(client);
    this.addClient(client, request);
  }

  /**
   * Add client-provided heartbeat request into heartbeat state for aggregation.
   *
   * @param client - Reference to the client which provided heartbeat request.
   * @param request - Reference to the heartbeat request which should be used in aggregation.
   */
  private addClient(client: PubNubClient, request: HeartbeatRequest) {
    const identifier = request.asIdentifier;

    let state = this.heartbeatStates[identifier];
    if (!state) {
      state = this.heartbeatStates[identifier] = new HeartbeatState(identifier);
      state.interval = client.heartbeatInterval ?? 0;

      // Make sure to receive updates from heartbeat state.
      this.addListenerForHeartbeatStateEvents(state);
    } else if (
      client.heartbeatInterval &&
      state.interval > 0 &&
      client.heartbeatInterval > 0 &&
      client.heartbeatInterval < state.interval
    )
      state.interval = client.heartbeatInterval;

    state.addClientRequest(client, request);
  }

  /**
   * Remove client and its requests from further aggregated heartbeat calls.
   *
   * @param client - Reference to the PubNub client which should be removed from heartbeat state.
   */
  private removeClient(client: PubNubClient) {
    const state = this.heartbeatStateForClient(client);
    if (!state) return;

    state.removeClient(client);
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
    // Listen for new core PubNub client registrations.
    clientsManager.addEventListener(PubNubClientsManagerEvent.Registered, (evt) => {
      const { client } = evt as PubNubClientManagerRegisterEvent;

      // Keep track of the client's listener abort controller.
      const abortController = new AbortController();
      this.clientAbortControllers[client.identifier] = abortController;

      client.addEventListener(PubNubClientEvent.Disconnect, () => this.removeClient(client), {
        signal: abortController.signal,
      });
      client.addEventListener(
        PubNubClientEvent.IdentityChange,
        (event) => {
          if (!(event instanceof PubNubClientIdentityChangeEvent)) return;
          // Make changes into state only if `userId` actually changed.
          if (
            !!event.oldUserId !== !!event.newUserId ||
            (event.oldUserId && event.newUserId && event.newUserId !== event.oldUserId)
          ) {
            const state = this.heartbeatStateForClient(client);
            const request = state ? state.requestForClient(client) : undefined;
            if (request) request.userId = event.newUserId;

            this.moveClient(client);
          }
        },
        {
          signal: abortController.signal,
        },
      );
      client.addEventListener(
        PubNubClientEvent.AuthChange,
        (event) => {
          if (!(event instanceof PubNubClientAuthChangeEvent)) return;
          const state = this.heartbeatStateForClient(client);
          const request = state ? state.requestForClient(client) : undefined;
          if (request) request.accessToken = event.newAuth;

          // Check whether the client should be moved to another state because of a permissions change or whether the
          // same token with the same permissions should be used for the next requests.
          if (
            !!event.oldAuth !== !!event.newAuth ||
            (event.oldAuth && event.newAuth && !event.newAuth.equalTo(event.oldAuth))
          )
            this.moveClient(client);
          else if (state && event.oldAuth && event.newAuth && event.oldAuth.equalTo(event.newAuth))
            state.accessToken = event.newAuth;
        },
        {
          signal: abortController.signal,
        },
      );
      client.addEventListener(
        PubNubClientEvent.HeartbeatIntervalChange,
        (evt) => {
          const event = evt as PubNubClientHeartbeatIntervalChangeEvent;
          const state = this.heartbeatStateForClient(client);
          if (state) state.interval = event.newInterval ?? 0;
        },
        { signal: abortController.signal },
      );
      client.addEventListener(
        PubNubClientEvent.PresenceStateChange,
        (event) => {
          if (!(event instanceof PubNubClientPresenceStateChangeEvent)) return;
          this.heartbeatStateForClient(event.client)?.updateClientPresenceState(event.client, event.state);
        },
        { signal: abortController.signal },
      );
      client.addEventListener(
        PubNubClientEvent.SendHeartbeatRequest,
        (evt) => this.addClient(client, (evt as PubNubClientSendHeartbeatEvent).request),
        { signal: abortController.signal },
      );
      client.addEventListener(
        PubNubClientEvent.SendLeaveRequest,
        (evt) => {
          const { request } = evt as PubNubClientSendLeaveEvent;
          const state = this.heartbeatStateForClient(client);
          if (!state) return;

          state.removeFromClientState(client, request.channels, request.channelGroups);
        },
        { signal: abortController.signal },
      );
    });
    // Listen for core PubNub client module disappearance.
    clientsManager.addEventListener(PubNubClientsManagerEvent.Unregistered, (evt) => {
      const { client } = evt as PubNubClientManagerUnregisterEvent;

      // Remove all listeners added for the client.
      const abortController = this.clientAbortControllers[client.identifier];
      delete this.clientAbortControllers[client.identifier];
      if (abortController) abortController.abort();

      this.removeClient(client);
    });
  }

  /**
   * Listen for heartbeat state events.
   *
   * @param state - Reference to the subscription object for which listeners should be added.
   */
  private addListenerForHeartbeatStateEvents(state: HeartbeatState) {
    const abortController = new AbortController();

    state.addEventListener(
      HeartbeatStateEvent.Heartbeat,
      (evt) => {
        const { request } = evt as HeartbeatStateHeartbeatEvent;

        this.sendRequest(
          request,
          (fetchRequest, response) => request.handleProcessingSuccess(fetchRequest, response),
          (fetchRequest, error) => request.handleProcessingError(fetchRequest, error),
        );
      },
      { signal: abortController.signal },
    );
    state.addEventListener(
      HeartbeatStateEvent.Invalidated,
      () => {
        delete this.heartbeatStates[state.identifier];
        abortController.abort();
      },
      { signal: abortController.signal, once: true },
    );
  }
  // endregion
}
