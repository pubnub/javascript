// PubNub client API common types.

import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { TransportResponse } from '../transport-response';
import StatusCategory from '../../constants/categories';

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

    if (error instanceof Error) {
      message = error.message;
      errorName = error.name;
    }

    if (errorName === 'AbortError') {
      category = StatusCategory.PNCancelledCategory;
      message = 'Request cancelled';
    } else if (errorName === 'FetchError') {
      const errorCode = (error as Record<string, string>).code;

      if (errorCode in ['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN'])
        category = StatusCategory.PNNetworkIssuesCategory;
      if (errorCode === 'ECONNREFUSED') message = 'Connection refused';
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

    if (status === 402) message = 'Not available for used key set. Contact support@pubnub.com';
    else if (status === 400) {
      category = StatusCategory.PNBadRequestCategory;
      message = 'Bad request';
    } else if (status === 403) {
      category = StatusCategory.PNAccessDeniedCategory;
      message = 'Access denied';
    }

    // Try get more information about error from service response.
    if (data && data.byteLength > 0) {
      const decoded = new TextDecoder().decode(data);

      if (response.headers['content-type']!.includes('application/json')) {
        try {
          const errorResponse: Payload = JSON.parse(decoded);

          if (typeof errorResponse === 'object' && !Array.isArray(errorResponse)) {
            if (
              'error' in errorResponse &&
              errorResponse.error === 1 &&
              'status' in errorResponse &&
              typeof errorResponse.status === 'number' &&
              'message' in errorResponse &&
              'service' in errorResponse
            ) {
              errorData = errorResponse;
              status = errorResponse.status;
            }

            if (
              'error' in errorResponse &&
              typeof errorResponse.error === 'object' &&
              !Array.isArray(errorResponse.error!) &&
              'message' in errorResponse.error!
            ) {
              errorData = errorResponse.error;
            }
          }
        } catch (_) {
          errorData = decoded;
        }
      } else errorData = decoded;
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
    this.name = this.constructor.name;
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
}

/**
 * PubNub account keyset.
 */
export type KeySet = {
  /**
   * Specifies the `subscribeKey` to be used for subscribing to a channel and message publishing.
   */
  subscribeKey: string;

  /**
   * Specifies the `publishKey` to be used for publishing messages to a channel.
   */
  publishKey?: string;

  /**
   * Specifies the `secretKey` to be used for request signatures computation.
   */
  secretKey?: string;
};

/**
 * REST API request processing function.
 */
export type SendRequestFunction<ResponseType> = (
  request: AbstractRequest<ResponseType>,
  callback?: ResultCallback<ResponseType>,
) => Promise<ResponseType | void>;

export type ResultCallback<ResponseType> = (status: Status, response: ResponseType | null) => void;
export type StatusCallback = (status: Status) => void;

/**
 * REST API endpoint processing status.
 */
export type Status = {
  /**
   * Whether status represent error or not.
   */
  error: boolean;
  /**
   * API call status category.
   */
  category?: StatusCategory;

  /**
   * Type of REST API endpoint which reported status.
   */
  operation?: RequestOperation;

  /**
   * REST API response status code.
   */
  statusCode?: number;

  /**
   * Error data provided by REST API.
   */
  errorData?: Error | Payload;

  /**
   * Additional status information.
   */
  [p: string]: Payload | Error | undefined;
};

/**
 * Real-time PubNub client status change event.
 */
export type StatusEvent = {
  /**
   * API call status category.
   */
  category: StatusCategory;

  /**
   * Type of REST API endpoint which reported status.
   */
  operation?: RequestOperation;

  /**
   * List of channels for which status update announced.
   */
  affectedChannels?: string[];

  /**
   * List of currently subscribed channels.
   *
   * List of channels from which PubNub client receives real-time updates.
   */
  subscribedChannels?: string[];

  /**
   * List of channel groups for which status update announced.
   */
  affectedChannelGroups?: string[];

  /**
   * High-precision timetoken which has been used with previous subscription loop.
   */
  lastTimetoken?: number | string;

  /**
   * High-precision timetoken which is used for current subscription loop.
   */
  currentTimetoken?: number | string;
};

/**
 * {@link TransportRequest} query parameter type.
 */
export type Query = Record<string, string | number | (string | number)[]>;

/**
 * General payload type.
 *
 * Type should be used for:
 * * generic messages and signals content,
 * * published message metadata.
 */
export type Payload = string | number | boolean | { [key: string]: Payload | null } | Payload[];

/**
 * Scalar payload type.
 *
 * Type used for REST API which doesn't allow nested types:
 * * App Context
 */
export type PayloadWithScalars = { [key: string]: string | number | boolean | null };
