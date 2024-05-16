"use strict";
/**
 * Node.js specific {@link PubNub} client configuration module.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaults = void 0;
const configuration_1 = require("../core/interfaces/configuration");
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
 *
 * @internal
 */
const setDefaults = (configuration) => {
    var _a;
    return Object.assign(Object.assign({}, (0, configuration_1.setDefaults)(configuration)), { 
        // Set platform-specific options.
        keepAlive: (_a = configuration.keepAlive) !== null && _a !== void 0 ? _a : KEEP_ALIVE });
};
exports.setDefaults = setDefaults;
