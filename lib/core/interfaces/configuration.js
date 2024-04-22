"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaults = void 0;
const pubnub_error_1 = require("../../errors/pubnub-error");
const USE_SSL = true;
const RESTORE = false;
const AUTO_NETWORK_DETECTION = false;
const DEDUPE_ON_SUBSCRIBE = false;
const DEDUPE_CACHE_SIZE = 100;
const FILE_PUBLISH_RETRY_LIMIT = 5;
const ENABLE_EVENT_ENGINE = false;
const MAINTAIN_PRESENCE_STATE = true;
const KEEP_ALIVE = false;
const USE_VERBOSE_LOGGING = false;
const SUPPRESS_LEAVE_EVENTS = false;
const ANNOUNCE_HEARTBEAT_FAILURE = true;
const ANNOUNCE_HEARTBEAT_SUCCESS = false;
const USE_INSTANCE_ID = false;
const USE_REQUEST_ID = true;
const TRANSACTIONAL_REQUEST_TIMEOUT = 15;
const SUBSCRIBE_REQUEST_TIMEOUT = 310;
const PRESENCE_TIMEOUT = 300;
const PRESENCE_TIMEOUT_MINIMUM = 20;
const setDefaults = (configuration) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
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
    if (!configurationCopy.origin)
        configurationCopy.origin = Array.from({ length: 20 }, (_, i) => `ps${i + 1}.pndsn.com`);
    const keySet = {
        subscribeKey: configurationCopy.subscribeKey,
        publishKey: configurationCopy.publishKey,
        secretKey: configurationCopy.secretKey,
    };
    if (configurationCopy.presenceTimeout !== undefined && configurationCopy.presenceTimeout < PRESENCE_TIMEOUT_MINIMUM) {
        configurationCopy.presenceTimeout = PRESENCE_TIMEOUT_MINIMUM;
        console.log('WARNING: Presence timeout is less than the minimum. Using minimum value: ', PRESENCE_TIMEOUT_MINIMUM);
    }
    (_q = configurationCopy.presenceTimeout) !== null && _q !== void 0 ? _q : (configurationCopy.presenceTimeout = PRESENCE_TIMEOUT);
    let announceSuccessfulHeartbeats = ANNOUNCE_HEARTBEAT_SUCCESS;
    let announceFailedHeartbeats = ANNOUNCE_HEARTBEAT_FAILURE;
    let fileUploadPublishRetryLimit = FILE_PUBLISH_RETRY_LIMIT;
    let dedupeOnSubscribe = DEDUPE_ON_SUBSCRIBE;
    const maximumCacheSize = DEDUPE_CACHE_SIZE;
    let useRequestId = USE_REQUEST_ID;
    if (configurationCopy.dedupeOnSubscribe !== undefined && typeof configurationCopy.dedupeOnSubscribe === 'boolean') {
        dedupeOnSubscribe = configurationCopy.dedupeOnSubscribe;
    }
    if (configurationCopy.useRequestId !== undefined && typeof configurationCopy.useRequestId === 'boolean') {
        useRequestId = configurationCopy.useRequestId;
    }
    if (configurationCopy.announceSuccessfulHeartbeats !== undefined &&
        typeof configurationCopy.announceSuccessfulHeartbeats === 'boolean') {
        announceSuccessfulHeartbeats = configurationCopy.announceSuccessfulHeartbeats;
    }
    if (configurationCopy.announceFailedHeartbeats !== undefined &&
        typeof configurationCopy.announceFailedHeartbeats === 'boolean') {
        announceFailedHeartbeats = configurationCopy.announceFailedHeartbeats;
    }
    if (configurationCopy.fileUploadPublishRetryLimit !== undefined &&
        typeof configurationCopy.fileUploadPublishRetryLimit === 'number') {
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
