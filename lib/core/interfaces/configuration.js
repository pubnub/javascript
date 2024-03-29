"use strict";
/**
 * {@link PubNub} client configuration module.
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
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether secured connection should be used by or not.
 */
var USE_SSL = true;
/**
 * Whether PubNub client should catch up subscription after network issues.
 */
var RESTORE = false;
/**
 * Whether network availability change should be announced with `PNNetworkDownCategory` and
 * `PNNetworkUpCategory` state or not.
 */
var AUTO_NETWORK_DETECTION = false;
/**
 * Whether messages should be de-duplicated before announcement or not.
 */
var DEDUPE_ON_SUBSCRIBE = false;
/**
 * Maximum cache which should be used for message de-duplication functionality.
 */
var DEDUPE_CACHE_SIZE = 100;
/**
 * Maximum number of file message publish retries.
 */
var FILE_PUBLISH_RETRY_LIMIT = 5;
/**
 * Whether subscription event engine should be used or not.
 */
var ENABLE_EVENT_ENGINE = false;
/**
 * Whether configured user presence state should be maintained by the PubNub client or not.
 */
var MAINTAIN_PRESENCE_STATE = true;
/**
 * Whether PubNub client should try to utilize existing TCP connection for new requests or not.
 */
var KEEP_ALIVE = false;
/**
 * Whether verbose logging should be enabled or not.
 */
var USE_VERBOSE_LOGGING = false;
/**
 * Whether leave events should be suppressed or not.
 */
var SUPPRESS_LEAVE_EVENTS = false;
/**
 * Whether heartbeat request failure should be announced or not.
 */
var ANNOUNCE_HEARTBEAT_FAILURE = true;
/**
 * Whether heartbeat request success should be announced or not.
 */
var ANNOUNCE_HEARTBEAT_SUCCESS = false;
/**
 * Whether PubNub client instance id should be added to the requests or not.
 */
var USE_INSTANCE_ID = false;
/**
 * Whether unique identifier should be added to the request or not.
 */
var USE_REQUEST_ID = false;
/**
 * Transactional requests timeout.
 */
var TRANSACTIONAL_REQUEST_TIMEOUT = 15;
/**
 * Subscription request timeout.
 */
var SUBSCRIBE_REQUEST_TIMEOUT = 310;
/**
 * Default user presence timeout.
 */
var PRESENCE_TIMEOUT = 300;
/**
 * Minimum user presence timeout.
 */
var PRESENCE_TIMEOUT_MINIMUM = 20;
/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 */
var setDefaults = function (configuration) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    // Copy configuration.
    var configurationCopy = __assign({}, configuration);
    (_a = configurationCopy.logVerbosity) !== null && _a !== void 0 ? _a : (configurationCopy.logVerbosity = USE_VERBOSE_LOGGING);
    (_b = configurationCopy.ssl) !== null && _b !== void 0 ? _b : (configurationCopy.ssl = USE_SSL);
    (_c = configurationCopy.transactionalRequestTimeout) !== null && _c !== void 0 ? _c : (configurationCopy.transactionalRequestTimeout = TRANSACTIONAL_REQUEST_TIMEOUT);
    (_d = configurationCopy.subscribeRequestTimeout) !== null && _d !== void 0 ? _d : (configurationCopy.subscribeRequestTimeout = SUBSCRIBE_REQUEST_TIMEOUT);
    (_e = configurationCopy.restore) !== null && _e !== void 0 ? _e : (configurationCopy.restore = RESTORE);
    (_f = configurationCopy.useInstanceId) !== null && _f !== void 0 ? _f : (configurationCopy.useInstanceId = USE_INSTANCE_ID);
    (_g = configurationCopy.suppressLeaveEvents) !== null && _g !== void 0 ? _g : (configurationCopy.suppressLeaveEvents = SUPPRESS_LEAVE_EVENTS);
    (_h = configurationCopy.requestMessageCountThreshold) !== null && _h !== void 0 ? _h : (configurationCopy.requestMessageCountThreshold = DEDUPE_CACHE_SIZE);
    (_j = configurationCopy.autoNetworkDetection) !== null && _j !== void 0 ? _j : (configurationCopy.autoNetworkDetection = AUTO_NETWORK_DETECTION);
    (_k = configurationCopy.enableEventEngine) !== null && _k !== void 0 ? _k : (configurationCopy.enableEventEngine = ENABLE_EVENT_ENGINE);
    (_l = configurationCopy.maintainPresenceState) !== null && _l !== void 0 ? _l : (configurationCopy.maintainPresenceState = MAINTAIN_PRESENCE_STATE);
    (_m = configurationCopy.keepAlive) !== null && _m !== void 0 ? _m : (configurationCopy.keepAlive = KEEP_ALIVE);
    // Generate default origin subdomains.
    if (!configurationCopy.origin)
        configurationCopy.origin = Array.from({ length: 20 }, function (_, i) { return "ps".concat(i + 1, ".pndsn.com"); });
    var keySet = {
        subscribeKey: configurationCopy.subscribeKey,
        publishKey: configurationCopy.publishKey,
        secretKey: configurationCopy.secretKey,
    };
    if (configurationCopy.presenceTimeout && configurationCopy.presenceTimeout < PRESENCE_TIMEOUT_MINIMUM) {
        configurationCopy.presenceTimeout = PRESENCE_TIMEOUT_MINIMUM;
        // eslint-disable-next-line no-console
        console.log('WARNING: Presence timeout is less than the minimum. Using minimum value: ', PRESENCE_TIMEOUT_MINIMUM);
    }
    if (configurationCopy.presenceTimeout) {
        configurationCopy.heartbeatInterval = configurationCopy.presenceTimeout / 2 - 1;
    }
    else
        configurationCopy.presenceTimeout = PRESENCE_TIMEOUT;
    // Apply extended configuration defaults.
    var announceSuccessfulHeartbeats = ANNOUNCE_HEARTBEAT_SUCCESS;
    var announceFailedHeartbeats = ANNOUNCE_HEARTBEAT_FAILURE;
    var fileUploadPublishRetryLimit = FILE_PUBLISH_RETRY_LIMIT;
    var dedupeOnSubscribe = DEDUPE_ON_SUBSCRIBE;
    var maximumCacheSize = DEDUPE_CACHE_SIZE;
    var useRequestId = USE_REQUEST_ID;
    // @ts-expect-error Not documented legacy configuration options.
    if (configurationCopy.dedupeOnSubscribe && typeof configurationCopy.dedupeOnSubscribe === 'boolean') {
        // @ts-expect-error Not documented legacy configuration options.
        dedupeOnSubscribe = configurationCopy.dedupeOnSubscribe;
    }
    // @ts-expect-error Not documented legacy configuration options.
    if (configurationCopy.useRequestId && typeof configurationCopy.useRequestId === 'boolean') {
        // @ts-expect-error Not documented legacy configuration options.
        useRequestId = configurationCopy.useRequestId;
    }
    if (
    // @ts-expect-error Not documented legacy configuration options.
    configurationCopy.announceSuccessfulHeartbeats &&
        // @ts-expect-error Not documented legacy configuration options.
        typeof configurationCopy.announceSuccessfulHeartbeats === 'boolean') {
        // @ts-expect-error Not documented legacy configuration options.
        announceSuccessfulHeartbeats = configurationCopy.announceSuccessfulHeartbeats;
    }
    // @ts-expect-error Not documented legacy configuration options.
    if (configurationCopy.announceFailedHeartbeats && typeof configurationCopy.announceFailedHeartbeats === 'boolean') {
        // @ts-expect-error Not documented legacy configuration options.
        announceFailedHeartbeats = configurationCopy.announceFailedHeartbeats;
    }
    if (
    // @ts-expect-error Not documented legacy configuration options.
    configurationCopy.fileUploadPublishRetryLimit &&
        // @ts-expect-error Not documented legacy configuration options.
        typeof configurationCopy.fileUploadPublishRetryLimit === 'number') {
        // @ts-expect-error Not documented legacy configuration options.
        fileUploadPublishRetryLimit = configurationCopy.fileUploadPublishRetryLimit;
    }
    return __assign(__assign({}, configurationCopy), { keySet: keySet, dedupeOnSubscribe: dedupeOnSubscribe, maximumCacheSize: maximumCacheSize, useRequestId: useRequestId, announceSuccessfulHeartbeats: announceSuccessfulHeartbeats, announceFailedHeartbeats: announceFailedHeartbeats, fileUploadPublishRetryLimit: fileUploadPublishRetryLimit });
};
exports.setDefaults = setDefaults;
