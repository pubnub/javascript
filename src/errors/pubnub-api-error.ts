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
export class PubNubAPIError extends Error {
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
  static create(errorOrResponse: Error | TransportResponse, data?: ArrayBuffer): PubNubAPIError {
    if (errorOrResponse instanceof Error) return PubNubAPIError.createFromError(errorOrResponse);
    else return PubNubAPIError.createFromServiceResponse(errorOrResponse, data);
  }

  /**
   * Create API error instance from other error object.
   *
   * @param error - `Error` object provided by network provider (mostly) or other {@link PubNub} client components.
   *
   * @returns `PubNubAPIError` object with known error category and additional information (if
   * available).
   */
  private static createFromError(error: unknown): PubNubAPIError {
    let category: StatusCategory = StatusCategory.PNUnknownCategory;
    let message = 'Unknown error';
    let errorName = 'Error';

    if (!error) return new PubNubAPIError(message, category, 0);
    else if (error instanceof PubNubAPIError) return error;

    if (error instanceof Error) {
      message = error.message;
      errorName = error.name;
    }

    if (errorName === 'AbortError' || message.indexOf('Aborted') !== -1) {
      category = StatusCategory.PNCancelledCategory;
      message = 'Request cancelled';
    } else if (message.indexOf('timeout') !== -1) {
      category = StatusCategory.PNTimeoutCategory;
      message = 'Request timeout';
    } else if (message.indexOf('network') !== -1) {
      category = StatusCategory.PNNetworkIssuesCategory;
      message = 'Network issues';
    } else if (errorName === 'TypeError') {
      if (message.indexOf('Load failed') !== -1 || message.indexOf('Failed to fetch') != -1)
        category = StatusCategory.PNTimeoutCategory;
      else category = StatusCategory.PNBadRequestCategory;
    } else if (errorName === 'FetchError') {
      const errorCode = (error as Record<string, string>).code;

      if (['ECONNREFUSED', 'ENETUNREACH', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN'].includes(errorCode))
        category = StatusCategory.PNNetworkIssuesCategory;
      if (errorCode === 'ECONNREFUSED') message = 'Connection refused';
      else if (errorCode === 'ENETUNREACH') message = 'Network not reachable';
      else if (errorCode === 'ENOTFOUND') message = 'Server not found';
      else if (errorCode === 'ECONNRESET') message = 'Connection reset by peer';
      else if (errorCode === 'EAI_AGAIN') message = 'Name resolution error';
      else if (errorCode === 'ETIMEDOUT') {
        category = StatusCategory.PNTimeoutCategory;
        message = 'Request timeout';
      } else message = `Unknown system error: ${error}`;
    } else if (message === 'Request timeout') category = StatusCategory.PNTimeoutCategory;

    return new PubNubAPIError(message, category, 0, error as Error);
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
  private static createFromServiceResponse(response: TransportResponse, data?: ArrayBuffer): PubNubAPIError {
    let category: StatusCategory = StatusCategory.PNUnknownCategory;
    let errorData: Error | Payload | undefined;
    let message = 'Unknown error';
    let { status } = response;
    data ??= response.body;

    if (status === 402) message = 'Not available for used key set. Contact support@pubnub.com';
    else if (status === 400) {
      category = StatusCategory.PNBadRequestCategory;
      message = 'Bad request';
    } else if (status === 403) {
      category = StatusCategory.PNAccessDeniedCategory;
      message = 'Access denied';
    }

    // Try to get more information about error from service response.
    if (data && data.byteLength > 0) {
      const decoded = new TextDecoder().decode(data);

      if (
        response.headers['content-type']!.indexOf('text/javascript') !== -1 ||
        response.headers['content-type']!.indexOf('application/json') !== -1
      ) {
        try {
          const errorResponse: Payload = JSON.parse(decoded);

          if (typeof errorResponse === 'object' && !Array.isArray(errorResponse)) {
            if (
              'error' in errorResponse &&
              (errorResponse.error === 1 || errorResponse.error === true) &&
              'status' in errorResponse &&
              typeof errorResponse.status === 'number' &&
              'message' in errorResponse &&
              'service' in errorResponse
            ) {
              errorData = errorResponse;
              status = errorResponse.status;
            } else errorData = errorResponse;

            if ('error' in errorResponse && errorResponse.error instanceof Error) errorData = errorResponse.error;
          }
        } catch (_) {
          errorData = decoded;
        }
      } else if (response.headers['content-type']!.indexOf('xml') !== -1) {
        const reason = /<Message>(.*)<\/Message>/gi.exec(decoded);
        message = reason ? `Upload to bucket failed: ${reason[1]}` : 'Upload to bucket failed.';
      } else {
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
  constructor(
    message: string,
    public readonly category: StatusCategory,
    public readonly statusCode: number,
    public readonly errorData?: Error | Payload,
  ) {
    super(message);

    this.name = 'PubNubAPIError';
  }

  /**
   * Convert API error object to API callback status object.
   *
   * @param operation - Request operation during which error happened.
   *
   * @returns Pre-formatted API callback status object.
   */
  public toStatus(operation: RequestOperation): Status {
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
  public toPubNubError(operation: RequestOperation, message?: string): PubNubError {
    return new PubNubError(message ?? this.message, this.toStatus(operation));
  }
}
