"use strict";
/**
 * Node.js specific {@link PubNub} client configuration module.
 */
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
 * Whether PubNub client should try utilize existing TCP connection for new requests or not.
 */
var KEEP_ALIVE = false;
/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 *
 * @returns Extended {@link PubNub} client configuration object pre-filled with default values.
 */
var setDefaults = function (configuration) {
    var _a;
    return __assign(__assign({}, (0, configuration_1.setDefaults)(configuration)), { 
        // Set platform-specific options.
        keepAlive: (_a = configuration.keepAlive) !== null && _a !== void 0 ? _a : KEEP_ALIVE });
};
exports.setDefaults = setDefaults;
