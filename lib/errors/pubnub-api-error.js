"use strict";
/**
 * REST API endpoint use error module.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubNubAPIError = void 0;
const categories_1 = __importDefault(require("../core/constants/categories"));
const pubnub_error_1 = require("./pubnub-error");
/**
 * PubNub REST API call error.
 */
class PubNubAPIError extends Error {
    /**
     * Construct API from known error object or {@link PubNub} service error response.
     *
     * @param errorOrResponse - `Error` or service error response object from which error information
     * should be extracted.
     * @param data - Preprocessed service error response.
     *
     * @returns `PubNubAPIError` object with known error category and additional information (if
     * available).
     */
    static create(errorOrResponse, data) {
        if (errorOrResponse instanceof Error)
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
        if (error instanceof Error) {
            message = error.message;
            errorName = error.name;
        }
        if (errorName === 'AbortError' || message.indexOf('Aborted') !== -1) {
            category = categories_1.default.PNCancelledCategory;
            message = 'Request cancelled';
        }
        else if (message.indexOf('timeout') !== -1) {
            category = categories_1.default.PNTimeoutCategory;
            message = 'Request timeout';
        }
        else if (message.indexOf('network') !== -1) {
            category = categories_1.default.PNNetworkIssuesCategory;
            message = 'Network issues';
        }
        else if (errorName === 'TypeError') {
            if (message.indexOf('Load failed') !== -1 || message.indexOf('Failed to fetch') != -1)
                category = categories_1.default.PNTimeoutCategory;
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
     * @param data - Preprocessed service error response.
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
        // Try to get more information about error from service response.
        if (data && data.byteLength > 0) {
            const decoded = new TextDecoder().decode(data);
            if (response.headers['content-type'].indexOf('text/javascript') !== -1 ||
                response.headers['content-type'].indexOf('application/json') !== -1) {
                try {
                    const errorResponse = JSON.parse(decoded);
                    if (typeof errorResponse === 'object' && !Array.isArray(errorResponse)) {
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
     * @param errorData - Error information.
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
        };
    }
    /**
     * Convert API error object to PubNub client error object.
     *
     * @param operation - Request operation during which error happened.
     * @param message - Custom error message.
     *
     * @returns Client-facing pre-formatted endpoint call error.
     */
    toPubNubError(operation, message) {
        return new pubnub_error_1.PubNubError(message !== null && message !== void 0 ? message : this.message, this.toStatus(operation));
    }
}
exports.PubNubAPIError = PubNubAPIError;
