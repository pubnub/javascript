"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryPolicy = exports.Endpoint = void 0;
const categories_1 = __importDefault(require("../constants/categories"));
// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types
/**
 * List of known endpoint groups (by context).
 */
var Endpoint;
(function (Endpoint) {
    /**
     * Unknown endpoint.
     *
     * @internal
     */
    Endpoint["Unknown"] = "UnknownEndpoint";
    /**
     * The endpoints to send messages.
     */
    Endpoint["MessageSend"] = "MessageSendEndpoint";
    /**
     * The endpoint for real-time update retrieval.
     */
    Endpoint["Subscribe"] = "SubscribeEndpoint";
    /**
     * The endpoint to access and manage `user_id` presence and fetch channel presence information.
     */
    Endpoint["Presence"] = "PresenceEndpoint";
    /**
     * The endpoint to access and manage files in channel-specific storage.
     */
    Endpoint["Files"] = "FilesEndpoint";
    /**
     * The endpoint to access and manage messages for a specific channel(s) in the persistent storage.
     */
    Endpoint["MessageStorage"] = "MessageStorageEndpoint";
    /**
     * The endpoint to access and manage channel groups.
     */
    Endpoint["ChannelGroups"] = "ChannelGroupsEndpoint";
    /**
     * The endpoint to access and manage device registration for channel push notifications.
     */
    Endpoint["DevicePushNotifications"] = "DevicePushNotificationsEndpoint";
    /**
     * The endpoint to access and manage App Context objects.
     */
    Endpoint["AppContext"] = "AppContextEndpoint";
    /**
     * The endpoint to access and manage reactions for a specific message.
     */
    Endpoint["MessageReactions"] = "MessageReactionsEndpoint";
})(Endpoint || (exports.Endpoint = Endpoint = {}));
// endregion
/**
 * Failed request retry policy.
 */
class RetryPolicy {
    static LinearRetryPolicy(configuration) {
        var _a;
        return {
            delay: configuration.delay,
            maximumRetry: configuration.maximumRetry,
            excluded: (_a = configuration.excluded) !== null && _a !== void 0 ? _a : [],
            shouldRetry(request, response, error, attempt) {
                return isRetriableRequest(request, response, error, attempt !== null && attempt !== void 0 ? attempt : 0, this.maximumRetry, this.excluded);
            },
            getDelay(_, response) {
                let delay = -1;
                if (response && response.headers['retry-after'] !== undefined)
                    delay = parseInt(response.headers['retry-after'], 10);
                if (delay === -1)
                    delay = this.delay;
                return (delay + Math.random()) * 1000;
            },
            validate() {
                if (this.delay < 2)
                    throw new Error('Delay can not be set less than 2 seconds for retry');
                if (this.maximumRetry > 10)
                    throw new Error('Maximum retry for linear retry policy can not be more than 10');
            },
        };
    }
    static ExponentialRetryPolicy(configuration) {
        var _a;
        return {
            minimumDelay: configuration.minimumDelay,
            maximumDelay: configuration.maximumDelay,
            maximumRetry: configuration.maximumRetry,
            excluded: (_a = configuration.excluded) !== null && _a !== void 0 ? _a : [],
            shouldRetry(request, response, error, attempt) {
                return isRetriableRequest(request, response, error, attempt !== null && attempt !== void 0 ? attempt : 0, this.maximumRetry, this.excluded);
            },
            getDelay(attempt, response) {
                let delay = -1;
                if (response && response.headers['retry-after'] !== undefined)
                    delay = parseInt(response.headers['retry-after'], 10);
                if (delay === -1)
                    delay = Math.min(Math.pow(2, attempt), this.maximumDelay);
                return (delay + Math.random()) * 1000;
            },
            validate() {
                if (this.minimumDelay < 2)
                    throw new Error('Minimum delay can not be set less than 2 seconds for retry');
                else if (this.maximumDelay > 150)
                    throw new Error('Maximum delay can not be set more than 150 seconds for' + ' retry');
                else if (this.maximumRetry > 6)
                    throw new Error('Maximum retry for exponential retry policy can not be more than 6');
            },
        };
    }
}
exports.RetryPolicy = RetryPolicy;
/**
 * Check whether request can be retried or not.
 *
 * @param req - Request for which retry ability is checked.
 * @param res - Service response which should be taken into consideration.
 * @param errorCategory - Request processing error category.
 * @param retryAttempt - Current retry attempt.
 * @param maximumRetry - Maximum retry attempts count according to the retry policy.
 * @param excluded - List of endpoints for which retry policy won't be applied.
 *
 * @return `true` if request can be retried.
 *
 * @internal
 */
const isRetriableRequest = (req, res, errorCategory, retryAttempt, maximumRetry, excluded) => {
    if (errorCategory && errorCategory === categories_1.default.PNCancelledCategory)
        return false;
    else if (isExcludedRequest(req, excluded))
        return false;
    else if (retryAttempt > maximumRetry)
        return false;
    return res ? res.status === 429 || res.status >= 500 : true;
};
/**
 * Check whether the provided request is in the list of endpoints for which retry is not allowed or not.
 *
 * @param req - Request which will be tested.
 * @param excluded - List of excluded endpoints configured for retry policy.
 *
 * @returns `true` if request has been excluded and shouldn't be retried.
 *
 * @internal
 */
const isExcludedRequest = (req, excluded) => excluded && excluded.length > 0 ? excluded.includes(endpointFromRequest(req)) : false;
/**
 * Identify API group from transport request.
 *
 * @param req - Request for which `path` will be analyzed to identify REST API group.
 *
 * @returns Endpoint group to which request belongs.
 *
 * @internal
 */
const endpointFromRequest = (req) => {
    let endpoint = Endpoint.Unknown;
    if (req.path.startsWith('/v2/subscribe'))
        endpoint = Endpoint.Subscribe;
    else if (req.path.startsWith('/publish/') || req.path.startsWith('/signal/'))
        endpoint = Endpoint.MessageSend;
    else if (req.path.startsWith('/v2/presence'))
        endpoint = Endpoint.Presence;
    else if (req.path.startsWith('/v2/history') || req.path.startsWith('/v3/history'))
        endpoint = Endpoint.MessageStorage;
    else if (req.path.startsWith('/v1/message-actions/'))
        endpoint = Endpoint.MessageReactions;
    else if (req.path.startsWith('/v1/channel-registration/'))
        endpoint = Endpoint.ChannelGroups;
    else if (req.path.startsWith('/v2/objects/'))
        endpoint = Endpoint.ChannelGroups;
    else if (req.path.startsWith('/v1/push/') || req.path.startsWith('/v2/push/'))
        endpoint = Endpoint.DevicePushNotifications;
    else if (req.path.startsWith('/v1/files/'))
        endpoint = Endpoint.Files;
    return endpoint;
};
