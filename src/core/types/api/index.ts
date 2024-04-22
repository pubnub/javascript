// PubNub client API common types.

import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import StatusCategory from '../../constants/categories';

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

/**
 * Endpoint call completion block with result.
 *
 * **Note:** Endpoints which return consumable data use this callback.
 */
export type ResultCallback<ResponseType> = (status: Status, response: ResponseType | null) => void;

/**
 * Endpoint acknowledgment completion block.
 *
 * **Note:** Endpoints which return only acknowledgment or error status use this callback.
 */
export type StatusCallback = (status: Status) => void;

/**
 * REST API endpoint processing status.
 *
 * **Note:** Used as {@link ResultCallback} and {@link StatusCallback} callbacks first argument type and
 * {@link PubNubError} instance `status` field value type.
 */
export type Status = {
  /**
   * Whether status represent error or not.
   */
  error: boolean;
  /**
   * API call status category.
   */
  category: StatusCategory;

  /**
   * Type of REST API endpoint which reported status.
   */
  operation?: RequestOperation;

  /**
   * REST API response status code.
   */
  statusCode: number;

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
   * Information about error.
   */
  error?: string | boolean;

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
