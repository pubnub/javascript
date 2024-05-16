/**
 * REST API endpoint use error module.
 */
import { TransportResponse } from '../core/types/transport-response';
import RequestOperation from '../core/constants/operations';
import StatusCategory from '../core/constants/categories';
import { Payload, Status } from '../core/types/api';
import { PubNubError } from './pubnub-error';
/**
 * PubNub REST API call error.
 */
export declare class PubNubAPIError extends Error {
    readonly category: StatusCategory;
    readonly statusCode: number;
    readonly errorData?: Error | Payload | undefined;
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
    static create(errorOrResponse: Error | TransportResponse, data?: ArrayBuffer): PubNubAPIError;
    /**
     * Create API error instance from other error object.
     *
     * @param error - `Error` object provided by network provider (mostly) or other {@link PubNub} client components.
     *
     * @returns `PubNubAPIError` object with known error category and additional information (if
     * available).
     */
    private static createFromError;
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
    private static createFromServiceResponse;
    /**
     * Construct PubNub endpoint error.
     *
     * @param message - Short API call error description.
     * @param category - Error category.
     * @param statusCode - Response HTTP status code.
     * @param errorData - Error information.
     */
    constructor(message: string, category: StatusCategory, statusCode: number, errorData?: Error | Payload | undefined);
    /**
     * Convert API error object to API callback status object.
     *
     * @param operation - Request operation during which error happened.
     *
     * @returns Pre-formatted API callback status object.
     */
    toStatus(operation: RequestOperation): Status;
    /**
     * Convert API error object to PubNub client error object.
     *
     * @param operation - Request operation during which error happened.
     * @param message - Custom error message.
     *
     * @returns Client-facing pre-formatted endpoint call error.
     */
    toPubNubError(operation: RequestOperation, message?: string): PubNubError;
}
