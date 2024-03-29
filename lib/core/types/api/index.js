"use strict";
// PubNub client API common types.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubNubAPIError = void 0;
var categories_1 = __importDefault(require("../../constants/categories"));
/**
 * PubNub REST API call error.
 */
var PubNubAPIError = /** @class */ (function (_super) {
    __extends(PubNubAPIError, _super);
    /**
     * Construct PubNub endpoint error.
     *
     * @param message - Short API call error description.
     * @param category - Error category.
     * @param statusCode - Response HTTP status code.
     * @param errorData - Error information.
     */
    function PubNubAPIError(message, category, statusCode, errorData) {
        var _this = _super.call(this, message) || this;
        _this.category = category;
        _this.statusCode = statusCode;
        _this.errorData = errorData;
        _this.name = _this.constructor.name;
        return _this;
    }
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
    PubNubAPIError.create = function (errorOrResponse, data) {
        if (errorOrResponse instanceof Error)
            return PubNubAPIError.createFromError(errorOrResponse);
        else
            return PubNubAPIError.createFromServiceResponse(errorOrResponse, data);
    };
    /**
     * Create API error instance from other error object.
     *
     * @param error - `Error` object provided by network provider (mostly) or other {@link PubNub} client components.
     *
     * @returns `PubNubAPIError` object with known error category and additional information (if
     * available).
     */
    PubNubAPIError.createFromError = function (error) {
        var category = categories_1.default.PNUnknownCategory;
        var message = 'Unknown error';
        var errorName = 'Error';
        if (!error)
            return new PubNubAPIError(message, category, 0);
        if (error instanceof Error) {
            message = error.message;
            errorName = error.name;
        }
        if (errorName === 'AbortError') {
            category = categories_1.default.PNCancelledCategory;
            message = 'Request cancelled';
        }
        else if (errorName === 'FetchError') {
            var errorCode = error.code;
            if (errorCode in ['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN'])
                category = categories_1.default.PNNetworkIssuesCategory;
            if (errorCode === 'ECONNREFUSED')
                message = 'Connection refused';
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
                message = "Unknown system error: ".concat(error);
        }
        else if (message === 'Request timeout')
            category = categories_1.default.PNTimeoutCategory;
        return new PubNubAPIError(message, category, 0, error);
    };
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
    PubNubAPIError.createFromServiceResponse = function (response, data) {
        var category = categories_1.default.PNUnknownCategory;
        var errorData;
        var message = 'Unknown error';
        var status = response.status;
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
        // Try get more information about error from service response.
        if (data && data.byteLength > 0) {
            var decoded = new TextDecoder().decode(data);
            if (response.headers['content-type'].includes('application/json')) {
                try {
                    var errorResponse = JSON.parse(decoded);
                    if (typeof errorResponse === 'object' && !Array.isArray(errorResponse)) {
                        if ('error' in errorResponse &&
                            errorResponse.error === 1 &&
                            'status' in errorResponse &&
                            typeof errorResponse.status === 'number' &&
                            'message' in errorResponse &&
                            'service' in errorResponse) {
                            errorData = errorResponse;
                            status = errorResponse.status;
                        }
                        if ('error' in errorResponse &&
                            typeof errorResponse.error === 'object' &&
                            !Array.isArray(errorResponse.error) &&
                            'message' in errorResponse.error) {
                            errorData = errorResponse.error;
                        }
                    }
                }
                catch (_) {
                    errorData = decoded;
                }
            }
            else
                errorData = decoded;
        }
        return new PubNubAPIError(message, category, status, errorData);
    };
    /**
     * Convert API error object to API callback status object.
     *
     * @param operation - Request operation during which error happened.
     *
     * @returns Pre-formatted API callback status object.
     */
    PubNubAPIError.prototype.toStatus = function (operation) {
        return {
            error: true,
            category: this.category,
            operation: operation,
            statusCode: this.statusCode,
            errorData: this.errorData,
        };
    };
    return PubNubAPIError;
}(Error));
exports.PubNubAPIError = PubNubAPIError;
