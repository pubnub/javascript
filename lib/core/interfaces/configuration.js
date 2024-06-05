"use strict";
/**
 * {@link PubNub} client configuration module.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaults = void 0;
const pubnub_error_1 = require("../../errors/pubnub-error");
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether secured connection should be used by or not.
 */
const USE_SSL = true;
/**
 * Whether PubNub client should catch up subscription after network issues.
 */
const RESTORE = false;
/**
 * Whether network availability change should be announced with `PNNetworkDownCategory` and
 * `PNNetworkUpCategory` state or not.
 */
const AUTO_NETWORK_DETECTION = false;
/**
 * Whether messages should be de-duplicated before announcement or not.
 */
const DEDUPE_ON_SUBSCRIBE = false;
/**
 * Maximum cache which should be used for message de-duplication functionality.
 */
const DEDUPE_CACHE_SIZE = 100;
/**
 * Maximum number of file message publish retries.
 */
const FILE_PUBLISH_RETRY_LIMIT = 5;
/**
 * Whether subscription event engine should be used or not.
 */
const ENABLE_EVENT_ENGINE = false;
/**
 * Whether configured user presence state should be maintained by the PubNub client or not.
 */
const MAINTAIN_PRESENCE_STATE = true;
/**
 * Whether PubNub client should try to utilize existing TCP connection for new requests or not.
 */
const KEEP_ALIVE = false;
/**
 * Whether verbose logging should be enabled or not.
 */
const USE_VERBOSE_LOGGING = false;
/**
 * Whether leave events should be suppressed or not.
 */
const SUPPRESS_LEAVE_EVENTS = false;
/**
 * Whether heartbeat request failure should be announced or not.
 */
const ANNOUNCE_HEARTBEAT_FAILURE = true;
/**
 * Whether heartbeat request success should be announced or not.
 */
const ANNOUNCE_HEARTBEAT_SUCCESS = false;
/**
 * Whether PubNub client instance id should be added to the requests or not.
 */
const USE_INSTANCE_ID = false;
/**
 * Whether unique identifier should be added to the request or not.
 */
const USE_REQUEST_ID = true;
/**
 * Transactional requests timeout.
 */
const TRANSACTIONAL_REQUEST_TIMEOUT = 15;
/**
 * Subscription request timeout.
 */
const SUBSCRIBE_REQUEST_TIMEOUT = 310;
/**
 * Default user presence timeout.
 */
const PRESENCE_TIMEOUT = 300;
/**
 * Minimum user presence timeout.
 */
const PRESENCE_TIMEOUT_MINIMUM = 20;
/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 *
 * @internal
 */
const setDefaults = (configuration) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    // Copy configuration.
    const configurationCopy = Object.assign({}, configuration);
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
    if (configurationCopy.userId && configurationCopy.uuid)
        throw new pubnub_error_1.PubNubError("PubNub client configuration error: use only 'userId'");
    (_o = configurationCopy.userId) !== null && _o !== void 0 ? _o : (configurationCopy.userId = configurationCopy.uuid);
    if (!configurationCopy.userId)
        throw new pubnub_error_1.PubNubError("PubNub client configuration error: 'userId' not set");
    else if (((_p = configurationCopy.userId) === null || _p === void 0 ? void 0 : _p.trim().length) === 0)
        throw new pubnub_error_1.PubNubError("PubNub client configuration error: 'userId' is empty");
    // Generate default origin subdomains.
    if (!configurationCopy.origin)
        configurationCopy.origin = Array.from({ length: 20 }, (_, i) => `ps${i + 1}.pndsn.com`);
    const keySet = {
        subscribeKey: configurationCopy.subscribeKey,
        publishKey: configurationCopy.publishKey,
        secretKey: configurationCopy.secretKey,
    };
    if (configurationCopy.presenceTimeout !== undefined && configurationCopy.presenceTimeout < PRESENCE_TIMEOUT_MINIMUM) {
        configurationCopy.presenceTimeout = PRESENCE_TIMEOUT_MINIMUM;
        // eslint-disable-next-line no-console
        console.log('WARNING: Presence timeout is less than the minimum. Using minimum value: ', PRESENCE_TIMEOUT_MINIMUM);
    }
    if (configurationCopy.presenceTimeout !== undefined)
        configurationCopy.heartbeatInterval = configurationCopy.presenceTimeout / 2 - 1;
    else
        configurationCopy.presenceTimeout = PRESENCE_TIMEOUT;
    // Apply extended configuration defaults.
    let announceSuccessfulHeartbeats = ANNOUNCE_HEARTBEAT_SUCCESS;
    let announceFailedHeartbeats = ANNOUNCE_HEARTBEAT_FAILURE;
    let fileUploadPublishRetryLimit = FILE_PUBLISH_RETRY_LIMIT;
    let dedupeOnSubscribe = DEDUPE_ON_SUBSCRIBE;
    const maximumCacheSize = DEDUPE_CACHE_SIZE;
    let useRequestId = USE_REQUEST_ID;
    // @ts-expect-error Not documented legacy configuration options.
    if (configurationCopy.dedupeOnSubscribe !== undefined && typeof configurationCopy.dedupeOnSubscribe === 'boolean') {
        // @ts-expect-error Not documented legacy configuration options.
        dedupeOnSubscribe = configurationCopy.dedupeOnSubscribe;
    }
    // @ts-expect-error Not documented legacy configuration options.
    if (configurationCopy.useRequestId !== undefined && typeof configurationCopy.useRequestId === 'boolean') {
        // @ts-expect-error Not documented legacy configuration options.
        useRequestId = configurationCopy.useRequestId;
    }
    if (
    // @ts-expect-error Not documented legacy configuration options.
    configurationCopy.announceSuccessfulHeartbeats !== undefined &&
        // @ts-expect-error Not documented legacy configuration options.
        typeof configurationCopy.announceSuccessfulHeartbeats === 'boolean') {
        // @ts-expect-error Not documented legacy configuration options.
        announceSuccessfulHeartbeats = configurationCopy.announceSuccessfulHeartbeats;
    }
    if (
    // @ts-expect-error Not documented legacy configuration options.
    configurationCopy.announceFailedHeartbeats !== undefined &&
        // @ts-expect-error Not documented legacy configuration options.
        typeof configurationCopy.announceFailedHeartbeats === 'boolean') {
        // @ts-expect-error Not documented legacy configuration options.
        announceFailedHeartbeats = configurationCopy.announceFailedHeartbeats;
    }
    if (
    // @ts-expect-error Not documented legacy configuration options.
    configurationCopy.fileUploadPublishRetryLimit !== undefined &&
        // @ts-expect-error Not documented legacy configuration options.
        typeof configurationCopy.fileUploadPublishRetryLimit === 'number') {
        // @ts-expect-error Not documented legacy configuration options.
        fileUploadPublishRetryLimit = configurationCopy.fileUploadPublishRetryLimit;
    }
    return Object.assign(Object.assign({}, configurationCopy), { keySet,
        dedupeOnSubscribe,
        maximumCacheSize,
        useRequestId,
        announceSuccessfulHeartbeats,
        announceFailedHeartbeats,
        fileUploadPublishRetryLimit });
};
exports.setDefaults = setDefaults;
