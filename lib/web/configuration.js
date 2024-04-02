import { setDefaults as setBaseDefaults, } from '../core/interfaces/configuration';
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
 * Whether PubNub client should try to utilize existing TCP connection for new requests or not.
 */
const KEEP_ALIVE = true;
/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 */
export const setDefaults = (configuration) => {
    var _a, _b;
    return Object.assign(Object.assign({}, setBaseDefaults(configuration)), { 
        // Set platform-specific options.
        listenToBrowserNetworkEvents: (_a = configuration.listenToBrowserNetworkEvents) !== null && _a !== void 0 ? _a : LISTEN_TO_BROWSER_NETWORK_EVENTS, keepAlive: (_b = configuration.keepAlive) !== null && _b !== void 0 ? _b : KEEP_ALIVE });
};
