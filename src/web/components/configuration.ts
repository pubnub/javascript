import {
  UserConfiguration,
  ExtendedConfiguration,
  setDefaults as setBaseDefaults,
} from '../../core/interfaces/configuration';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether PubNub client should update its state using browser's reachability events or not.
 *
 * If the browser fails to detect the network changes from Wi-Fi to LAN and vice versa, or you get
 * reconnection issues, set the flag to `false`. This allows the SDK reconnection logic to take over.
 */
const LISTEN_TO_BROWSER_NETWORK_EVENTS = true;

/**
 * Whether PubNub client should spawn `Subscription` service worker for better user presence
 * experience or not.
 */
const ENABLE_SERVICE_WORKER = false;

/**
 * Whether PubNub client should try to utilize existing TCP connection for new requests or not.
 */
const KEEP_ALIVE = true;
// endregion

/**
 * Browser platform PubNub client configuration.
 */
export type PubNubConfiguration = UserConfiguration & {
  /**
   * If the browser fails to detect the network changes from Wi-Fi to LAN and vice versa, or you
   * get reconnection issues, set the flag to `false`. This allows the SDK reconnection logic to
   * take over.
   *
   * @default `true`
   */
  listenToBrowserNetworkEvents?: boolean;

  /**
   * Whether PubNub client should spawn `Subscription` service worker for better user presence
   * experience or not.
   *
   * @default `true` (if supported)
   */
  enableServiceWorker?: boolean;

  /**
   * If set to `true`, SDK will use the same TCP connection for each HTTP request, instead of
   * opening a new one for each new request.
   *
   * @default `true`
   */
  keepAlive?: boolean;
};

/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 */
export const setDefaults = (configuration: PubNubConfiguration): PubNubConfiguration & ExtendedConfiguration => {
  // Force disable service workers if environment doesn't support them.
  if ((configuration.enableServiceWorker ?? ENABLE_SERVICE_WORKER) && !('serviceWorker' in navigator))
    configuration.enableServiceWorker = false;

  return {
    // Set base configuration defaults.
    ...setBaseDefaults(configuration),
    // Set platform-specific options.
    listenToBrowserNetworkEvents: configuration.listenToBrowserNetworkEvents ?? LISTEN_TO_BROWSER_NETWORK_EVENTS,
    enableServiceWorker: configuration.enableServiceWorker ?? ENABLE_SERVICE_WORKER,
    keepAlive: configuration.keepAlive ?? KEEP_ALIVE,
  };
};
