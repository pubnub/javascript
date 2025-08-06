import {
  PubNubClientManagerRegisterEvent,
  PubNubClientManagerUnregisterEvent,
} from './custom-events/client-manager-event';
import { PubNubClientEvent } from './custom-events/client-event';
import { RegisterEvent } from '../subscription-worker-types';
import { PubNubClient } from './pubnub-client';

export class PubNubClientsManager extends EventTarget {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Map of started `PING` timeouts per-subscription key.
   */
  private timeouts: {
    [subKey: string]: { timeout?: ReturnType<typeof setTimeout>; interval: number; unsubscribeOffline: boolean };
  } = {};

  /**
   * Map of previously created PubNub clients.
   */
  private clients: Record<string, { client: PubNubClient; abortController: AbortController }> = {};

  /**
   * Map of previously created PubNub clients to the corresponding subscription key.
   */
  private clientBySubscribeKey: Record<string, PubNubClient[]> = {};
  // endregion

  // --------------------------------------------------------
  // --------------------- Constructors ---------------------
  // --------------------------------------------------------
  // region Constructors

  /**
   * Create PubNub clients manager.
   *
   * @param sharedWorkerIdentifier - Unique `Subscription` worker identifier which will work with clients.
   */
  constructor(private readonly sharedWorkerIdentifier: string) {
    super();
  }
  // endregion

  // --------------------------------------------------------
  // ----------------- Client registration ------------------
  // --------------------------------------------------------
  // region Client registration

  /**
   * Create PubNub client.
   *
   * Function called in response to the `client-register` from the core PubNub client module.
   *
   * @param event - Registration event with base PubNub client information.
   * @param port - Message port for two-way communication with core PunNub client module.
   * @returns New PubNub client or existing from the cache.
   */
  createClient(event: RegisterEvent, port: MessagePort) {
    if (this.clients[event.clientIdentifier]) return this.clients[event.clientIdentifier];

    const client = new PubNubClient(
      event.clientIdentifier,
      event.subscriptionKey,
      event.userId,
      port,
      event.workerLogLevel,
      event.heartbeatInterval,
    );

    this.registerClient(client);

    // Start offline PubNub clients checks (ping-pong).
    if (event.workerOfflineClientsCheckInterval) {
      this.startClientTimeoutCheck(
        event.subscriptionKey,
        event.workerOfflineClientsCheckInterval,
        event.workerUnsubscribeOfflineClients ?? false,
      );
    }

    return client;
  }

  /**
   * Store PubNub client in manager's internal state.
   *
   * @param client - Freshly created PubNub client which should be registered.
   */
  private registerClient(client: PubNubClient) {
    this.clients[client.identifier] = { client, abortController: new AbortController() };

    // Associate client with subscription key.
    if (!this.clientBySubscribeKey[client.subKey]) this.clientBySubscribeKey[client.subKey] = [client];
    else this.clientBySubscribeKey[client.subKey].push(client);

    this.forEachClient(client.subKey, (subKeyClient) =>
      subKeyClient.logger.debug(
        `'${client.identifier}' client registered with '${this.sharedWorkerIdentifier}' shared worker (${
          this.clientBySubscribeKey[client.subKey].length
        } active clients).`,
      ),
    );

    this.subscribeOnClientEvents(client);

    // Notify other components that new client is registered and ready for usage.
    this.dispatchEvent(new PubNubClientManagerRegisterEvent(client));
  }

  /**
   * Remove PubNub client from manager's internal state.
   *
   * @param client - Previously created PubNub client which should be removed.
   * @param withLeave - Whether `leave` request should be sent or not.
   */
  private unregisterClient(client: PubNubClient, withLeave = false) {
    if (!this.clients[client.identifier]) return;

    // Make sure to detach all listeners for this `client`.
    this.clients[client.identifier].abortController.abort();
    delete this.clients[client.identifier];

    const clientsBySubscribeKey = this.clientBySubscribeKey[client.subKey];
    if (clientsBySubscribeKey) {
      const clientIdx = clientsBySubscribeKey.indexOf(client);
      clientsBySubscribeKey.splice(clientIdx, 1);

      if (clientsBySubscribeKey.length === 0) {
        delete this.clientBySubscribeKey[client.subKey];
        this.stopClientTimeoutCheck(client);
      }
    }

    this.forEachClient(client.subKey, (subKeyClient) =>
      subKeyClient.logger.debug(
        `'${this.sharedWorkerIdentifier}' shared worker unregistered '${client.identifier}' client (${
          this.clientBySubscribeKey[client.subKey].length
        } active clients).`,
      ),
    );

    // Notify other components that client is unregistered and non-operational anymore.
    this.dispatchEvent(new PubNubClientManagerUnregisterEvent(client, withLeave));
  }
  // endregion

  // --------------------------------------------------------
  // ----------------- Availability check -------------------
  // --------------------------------------------------------
  // region Availability check

  /**
   * Start timer for _timeout_ PubNub client checks.
   *
   * @param subKey - Subscription key to get list of PubNub clients which should be checked.
   * @param interval - Interval at which _timeout_ check should be done.
   * @param unsubscribeOffline - Whether _timeout_ (or _offline_) PubNub clients should send `leave` request before
   * invalidation or not.
   */
  private startClientTimeoutCheck(subKey: string, interval: number, unsubscribeOffline: boolean) {
    if (this.timeouts[subKey]) return;

    this.forEachClient(subKey, (client) =>
      client.logger.debug(`Setup PubNub client ping for every ${interval} seconds.`),
    );

    this.timeouts[subKey] = {
      interval,
      unsubscribeOffline,
      timeout: setTimeout(() => this.handleTimeoutCheck(subKey), interval * 500 - 1),
    };
  }

  /**
   * Stop _timeout_ (or _offline_) PubNub clients pinging.
   *
   * **Note:** This method used only when all clients for specific subscription key has been unregistered.
   *
   * @param client - PubNub client with which last client related by subscription key has been removed.
   */
  private stopClientTimeoutCheck(client: PubNubClient) {
    if (!this.timeouts[client.subKey]) return;

    if (this.timeouts[client.subKey].timeout) clearTimeout(this.timeouts[client.subKey].timeout);
    delete this.timeouts[client.subKey];
  }

  /**
   * Handle periodic PubNub client timeout check.
   *
   * @param subKey - Subscription key to get list of PubNub clients which should be checked.
   */
  private handleTimeoutCheck(subKey: string) {
    if (!this.timeouts[subKey]) return;

    const interval = this.timeouts[subKey].interval;
    [...this.clientBySubscribeKey[subKey]].forEach((client) => {
      if (
        client.lastPingRequest &&
        (!client.lastPongEvent || Math.abs(client.lastPongEvent - client.lastPingRequest) > interval * 0.5)
      ) {
        this.unregisterClient(client, this.timeouts[subKey].unsubscribeOffline);

        // Notify other clients with same subscription key that one of them became inactive.
        this.forEachClient(subKey, (subKeyClient) => {
          if (subKeyClient.identifier !== client.identifier)
            subKeyClient.logger.debug(`'${client.identifier}' client is inactive. Invalidating...`);
        });
      }

      if (this.clients[client.identifier]) {
        client.lastPingRequest = new Date().getTime() / 1000;
        client.postEvent({ type: 'shared-worker-ping' });
      }
    });

    // Restart PubNub clients timeout check timer.
    if (this.timeouts[subKey])
      this.timeouts[subKey].timeout = setTimeout(() => this.handleTimeoutCheck(subKey), interval * 500);
  }
  // endregion

  // --------------------------------------------------------
  // ------------------- Event Handlers ---------------------
  // --------------------------------------------------------
  // region Event handlers

  /**
   * Listen for PubNub client events which affects aggregated subscribe / heartbeat requests.
   *
   * @param client - PubNub client for which event should be listened.
   */
  private subscribeOnClientEvents(client: PubNubClient) {
    client.addEventListener(
      PubNubClientEvent.Unregister,
      () =>
        this.unregisterClient(
          client,
          this.timeouts[client.subKey] ? this.timeouts[client.subKey].unsubscribeOffline : false,
        ),
      { signal: this.clients[client.identifier].abortController.signal, once: true },
    );
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Call callback function for all PubNub clients which has similar `subscribeKey`.
   *
   * @param subKey - Subscription key for which list of clients should be retrieved.
   * @param callback - Function which will be called for each clients list entry.
   */
  private forEachClient(subKey: string, callback: (client: PubNubClient) => void) {
    if (!this.clientBySubscribeKey[subKey]) return;
    this.clientBySubscribeKey[subKey].forEach(callback);
  }
  // endregion
}
