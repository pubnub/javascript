/// <reference lib="webworker" />
/**
 * Subscription Service Worker Transport provider.
 *
 * Service worker provides support for PubNub subscription feature to give better user experience across
 * multiple opened pages.
 *
 * @internal
 */

import { SubscribeRequestsManager } from './components/subscribe-requests-manager';
import { HeartbeatRequestsManager } from './components/heartbeat-requests-manager';
import { PubNubClientsManager } from './components/pubnub-clients-manager';
import { ClientEvent } from './subscription-worker-types';
import uuidGenerator from '../../core/components/uuid';

// --------------------------------------------------------
// ------------------- Service Worker ---------------------
// --------------------------------------------------------
// region Service Worker

declare const self: SharedWorkerGlobalScope;

/**
 * Unique shared worker instance identifier.
 */
const sharedWorkerIdentifier = uuidGenerator.createUUID();

const clientsManager = new PubNubClientsManager(sharedWorkerIdentifier);
const subscriptionRequestsManager = new SubscribeRequestsManager(clientsManager);
const heartbeatRequestsManager = new HeartbeatRequestsManager(clientsManager);

// endregion

// --------------------------------------------------------
// ------------------- Event Handlers ---------------------
// --------------------------------------------------------
// region Event Handlers

/**
 * Handle new PubNub client 'connection'.
 *
 * Echo listeners to let `SharedWorker` users that it is ready.
 *
 * @param event - Remote `SharedWorker` client connection event.
 */
self.onconnect = (event) => {
  event.ports.forEach((receiver) => {
    receiver.start();

    receiver.onmessage = (event: MessageEvent<ClientEvent>) => {
      const data = event.data as ClientEvent;
      if (data.type === 'client-register') clientsManager.createClient(data, receiver);
    };

    receiver.postMessage({ type: 'shared-worker-connected' });
  });
};
// endregion
