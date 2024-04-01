/**
 * Node.js specific {@link PubNub} client configuration module.
 */
import { setDefaults as setBaseDefaults, } from '../core/interfaces/configuration';
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether PubNub client should try utilize existing TCP connection for new requests or not.
 */
const KEEP_ALIVE = false;
/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 *
 * @returns Extended {@link PubNub} client configuration object pre-filled with default values.
 */
export const setDefaults = (configuration) => {
    var _a;
    return Object.assign(Object.assign({}, setBaseDefaults(configuration)), { 
        // Set platform-specific options.
        keepAlive: (_a = configuration.keepAlive) !== null && _a !== void 0 ? _a : KEEP_ALIVE });
};
