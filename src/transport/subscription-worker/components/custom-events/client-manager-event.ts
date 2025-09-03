import { PubNubClient } from '../pubnub-client';

/**
 * Type with events which is dispatched by PubNub clients manager and can be handled with callback passed to the
 * {@link EventTarget#addEventListener|addEventListener}.
 */
export enum PubNubClientsManagerEvent {
  /**
   * New PubNub client has been registered.
   */
  Registered = 'Registered',

  /**
   * PubNub client has been unregistered.
   */
  Unregistered = 'Unregistered',
}

/**
 * Dispatched by clients manager when new PubNub client registers within `SharedWorker`.
 */
export class PubNubClientManagerRegisterEvent extends CustomEvent<PubNubClient> {
  /**
   * Create client registration event.
   *
   * @param client - Reference to the registered PubNub client.
   */
  constructor(client: PubNubClient) {
    super(PubNubClientsManagerEvent.Registered, { detail: client });
  }

  /**
   * Retrieve reference to registered PubNub client.
   *
   * @returns Reference to registered PubNub client.
   */
  get client(): PubNubClient {
    return this.detail;
  }

  /**
   * Create clone of new client register event to make it possible to forward event upstream.
   *
   * @returns Client new client register event.
   */
  clone() {
    return new PubNubClientManagerRegisterEvent(this.client);
  }
}

/**
 * Dispatched by clients manager when PubNub client unregisters from `SharedWorker`.
 */
export class PubNubClientManagerUnregisterEvent extends CustomEvent<{ client: PubNubClient; withLeave: boolean }> {
  /**
   * Create client unregistration event.
   *
   * @param client - Reference to the unregistered PubNub client.
   * @param withLeave - Whether `leave` request should be sent or not.
   */
  constructor(client: PubNubClient, withLeave = false) {
    super(PubNubClientsManagerEvent.Unregistered, { detail: { client, withLeave } });
  }

  /**
   * Retrieve reference to the unregistered PubNub client.
   *
   * @returns Reference to the unregistered PubNub client.
   */
  get client(): PubNubClient {
    return this.detail.client;
  }

  /**
   * Retrieve whether `leave` request should be sent or not.
   *
   * @returns `true` if `leave` request should be sent for previously used channels and groups.
   */
  get withLeave() {
    return this.detail.withLeave;
  }

  /**
   * Create clone of client unregister event to make it possible to forward event upstream.
   *
   * @returns Client client unregister event.
   */
  clone() {
    return new PubNubClientManagerUnregisterEvent(this.client, this.withLeave);
  }
}
