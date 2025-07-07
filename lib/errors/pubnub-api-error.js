"use strict";
/**
 * REST API endpoint use error module.
 *
 * @internal
 */
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubNubAPIError = void 0;
const categories_1 = __importDefault(require("../core/constants/categories"));
const pubnub_error_1 = require("./pubnub-error");
/**
 * PubNub REST API call error.
 *
 * @internal
 */
class PubNubAPIError extends Error {
    /**
     * Construct API from known error object or {@link PubNub} service error response.
     *
     * @param errorOrResponse - `Error` or service error response object from which error information
     * should be extracted.
     * @param [data] - Preprocessed service error response.
     *
     * @returns `PubNubAPIError` object with known error category and additional information (if
     * available).
     */
    static create(errorOrResponse, data) {
        if (PubNubAPIError.isErrorObject(errorOrResponse))
            return PubNubAPIError.createFromError(errorOrResponse);
        else
            return PubNubAPIError.createFromServiceResponse(errorOrResponse, data);
    }
    /**
     * Create API error instance from other error object.
     *
     * @param error - `Error` object provided by network provider (mostly) or other {@link PubNub} client components.
     *
     * @returns `PubNubAPIError` object with known error category and additional information (if
     * available).
     */
    static createFromError(error) {
        let category = categories_1.default.PNUnknownCategory;
        let message = 'Unknown error';
        let errorName = 'Error';
        if (!error)
            return new PubNubAPIError(message, category, 0);
        else if (error instanceof PubNubAPIError)
            return error;
        if (PubNubAPIError.isErrorObject(error)) {
            message = error.message;
            errorName = error.name;
        }
        if (errorName === 'AbortError' || message.indexOf('Aborted') !== -1) {
            category = categories_1.default.PNCancelledCategory;
            message = 'Request cancelled';
        }
        else if (message.toLowerCase().indexOf('timeout') !== -1) {
            category = categories_1.default.PNTimeoutCategory;
            message = 'Request timeout';
        }
        else if (message.toLowerCase().indexOf('network') !== -1) {
            category = categories_1.default.PNNetworkIssuesCategory;
            message = 'Network issues';
        }
        else if (errorName === 'TypeError') {
            if (message.indexOf('Load failed') !== -1 || message.indexOf('Failed to fetch') != -1)
                category = categories_1.default.PNNetworkIssuesCategory;
            else
                category = categories_1.default.PNBadRequestCategory;
        }
        else if (errorName === 'FetchError') {
            const errorCode = error.code;
            if (['ECONNREFUSED', 'ENETUNREACH', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN'].includes(errorCode))
                category = categories_1.default.PNNetworkIssuesCategory;
            if (errorCode === 'ECONNREFUSED')
                message = 'Connection refused';
            else if (errorCode === 'ENETUNREACH')
                message = 'Network not reachable';
            else if (errorCode === 'ENOTFOUND')
                message = 'Server not found';
            else if (errorCode === 'ECONNRESET')
                message = 'Connection reset by peer';
            else if (errorCode === 'EAI_AGAIN')
                message = 'Name resolution error';
            else if (errorCode === 'ETIMEDOUT') {
                category = categories_1.default.PNTimeoutCategory;
                message = 'Request timeout';
            }
            else
                message = `Unknown system error: ${error}`;
        }
        else if (message === 'Request timeout')
            category = categories_1.default.PNTimeoutCategory;
        return new PubNubAPIError(message, category, 0, error);
    }
    /**
     * Construct API from known {@link PubNub} service error response.
     *
     * @param response - Service error response object from which error information should be
     * extracted.
     * @param [data] - Preprocessed service error response.
     *
     * @returns `PubNubAPIError` object with known error category and additional information (if
     * available).
     */
    static createFromServiceResponse(response, data) {
        let category = categories_1.default.PNUnknownCategory;
        let errorData;
        let message = 'Unknown error';
        let { status } = response;
        data !== null && data !== void 0 ? data : (data = response.body);
        if (status === 402)
            message = 'Not available for used key set. Contact support@pubnub.com';
        else if (status === 400) {
            category = categories_1.default.PNBadRequestCategory;
            message = 'Bad request';
        }
        else if (status === 403) {
            category = categories_1.default.PNAccessDeniedCategory;
            message = 'Access denied';
        }
        else if (status >= 500) {
            category = categories_1.default.PNServerErrorCategory;
            message = 'Internal server error';
        }
        if (typeof response === 'object' && Object.keys(response).length === 0) {
            category = categories_1.default.PNMalformedResponseCategory;
            message = 'Malformed response (network issues)';
            status = 400;
        }
        // Try to get more information about error from service response.
        if (data && data.byteLength > 0) {
            const decoded = new TextDecoder().decode(data);
            if (response.headers['content-type'].indexOf('text/javascript') !== -1 ||
                response.headers['content-type'].indexOf('application/json') !== -1) {
                try {
                    const errorResponse = JSON.parse(decoded);
                    if (typeof errorResponse === 'object') {
                        if (!Array.isArray(errorResponse)) {
                            if ('error' in errorResponse &&
                                (errorResponse.error === 1 || errorResponse.error === true) &&
                                'status' in errorResponse &&
                                typeof errorResponse.status === 'number' &&
                                'message' in errorResponse &&
                                'service' in errorResponse) {
                                errorData = errorResponse;
                                status = errorResponse.status;
                            }
                            else
                                errorData = errorResponse;
                            if ('error' in errorResponse && errorResponse.error instanceof Error)
                                errorData = errorResponse.error;
                        }
                        else {
                            // Handling Publish API payload error.
                            if (typeof errorResponse[0] === 'number' && errorResponse[0] === 0) {
                                if (errorResponse.length > 1 && typeof errorResponse[1] === 'string')
                                    errorData = errorResponse[1];
                            }
                        }
                    }
                }
                catch (_) {
                    errorData = decoded;
                }
            }
            else if (response.headers['content-type'].indexOf('xml') !== -1) {
                const reason = /<Message>(.*)<\/Message>/gi.exec(decoded);
                message = reason ? `Upload to bucket failed: ${reason[1]}` : 'Upload to bucket failed.';
            }
            else {
                errorData = decoded;
            }
        }
        return new PubNubAPIError(message, category, status, errorData);
    }
    /**
     * Construct PubNub endpoint error.
     *
     * @param message - Short API call error description.
     * @param category - Error category.
     * @param statusCode - Response HTTP status code.
     * @param [errorData] - Error information.
     */
    constructor(message, category, statusCode, errorData) {
        super(message);
        this.category = category;
        this.statusCode = statusCode;
        this.errorData = errorData;
        this.name = 'PubNubAPIError';
    }
    /**
     * Convert API error object to API callback status object.
     *
     * @param operation - Request operation during which error happened.
     *
     * @returns Pre-formatted API callback status object.
     */
    toStatus(operation) {
        return {
            error: true,
            category: this.category,
            operation,
            statusCode: this.statusCode,
            errorData: this.errorData,
            // @ts-expect-error Inner helper for JSON.stringify.
            toJSON: function () {
                let normalizedErrorData;
                const errorData = this.errorData;
                if (errorData) {
                    try {
                        if (typeof errorData === 'object') {
                            const errorObject = Object.assign(Object.assign(Object.assign(Object.assign({}, ('name' in errorData ? { name: errorData.name } : {})), ('message' in errorData ? { message: errorData.message } : {})), ('stack' in errorData ? { stack: errorData.stack } : {})), errorData);
                            normalizedErrorData = JSON.parse(JSON.stringify(errorObject, PubNubAPIError.circularReplacer()));
                        }
                        else
                            normalizedErrorData = errorData;
                    }
                    catch (_) {
                        normalizedErrorData = { error: 'Could not serialize the error object' };
                    }
                }
                // Make sure to exclude `toJSON` function from the final object.
                const _a = this, { toJSON } = _a, status = __rest(_a, ["toJSON"]);
                return JSON.stringify(Object.assign(Object.assign({}, status), { errorData: normalizedErrorData }));
            },
        };
    }
    /**
     * Convert API error object to PubNub client error object.
     *
     * @param operation - Request operation during which error happened.
     * @param [message] - Custom error message.
     *
     * @returns Client-facing pre-formatted endpoint call error.
     */
    toPubNubError(operation, message) {
        return new pubnub_error_1.PubNubError(message !== null && message !== void 0 ? message : this.message, this.toStatus(operation));
    }
    /**
     * Function which handles circular references in serialized JSON.
     *
     * @returns Circular reference replacer function.
     *
     * @internal
     */
    static circularReplacer() {
        const visited = new WeakSet();
        return function (_, value) {
            if (typeof value === 'object' && value !== null) {
                if (visited.has(value))
                    return '[Circular]';
                visited.add(value);
            }
            return value;
        };
    }
    /**
     * Check whether provided `object` is an `Error` or not.
     *
     * This check is required because the error object may be tied to a different execution context (global
     * environment) and won't pass `instanceof Error` from the main window.
     * To protect against monkey-patching, the `fetch` function is taken from an invisible `iframe` and, as a result,
     * it is bind to the separate execution context. Errors generated by `fetch` won't pass the simple
     * `instanceof Error` test.
     *
     * @param object - Object which should be checked.
     *
     * @returns `true` if `object` looks like an `Error` object.
     *
     * @internal
     */
    static isErrorObject(object) {
        if (!object || typeof object !== 'object')
            return false;
        if (object instanceof Error)
            return true;
        if ('name' in object &&
            'message' in object &&
            typeof object.name === 'string' &&
            typeof object.message === 'string') {
            return true;
        }
        return Object.prototype.toString.call(object) === '[object Error]';
    }
}
exports.PubNubAPIError = PubNubAPIError;
