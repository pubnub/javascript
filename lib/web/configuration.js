"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaults = void 0;
var configuration_1 = require("../core/interfaces/configuration");
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
var LISTEN_TO_BROWSER_NETWORK_EVENTS = true;
/**
 * Whether PubNub client should try utilize existing TCP connection for new requests or not.
 */
var KEEP_ALIVE = true;
/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 */
var setDefaults = function (configuration) {
    var _a, _b;
    return __assign(__assign({}, (0, configuration_1.setDefaults)(configuration)), { 
        // Set platform-specific options.
        listenToBrowserNetworkEvents: (_a = configuration.listenToBrowserNetworkEvents) !== null && _a !== void 0 ? _a : LISTEN_TO_BROWSER_NETWORK_EVENTS, keepAlive: (_b = configuration.keepAlive) !== null && _b !== void 0 ? _b : KEEP_ALIVE });
};
exports.setDefaults = setDefaults;
