/**
 * Failed requests retry module.
 */
import { TransportResponse } from '../types/transport-response';
import { TransportRequest } from '../types/transport-request';
import StatusCategory from '../constants/categories';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * List of known endpoint groups (by context).
 */
export enum Endpoint {
  /**
   * Unknown endpoint.
   *
   * @internal
   */
  Unknown = 'UnknownEndpoint',

  /**
   * The endpoints to send messages.
   *
   * This is related to the following functionality:
   * - `publish`
   * - `signal`
   * - `publish file`
   * - `fire`
   */
  MessageSend = 'MessageSendEndpoint',

  /**
   * The endpoint for real-time update retrieval.
   *
   * This is related to the following functionality:
   * - `subscribe`
   */
  Subscribe = 'SubscribeEndpoint',

  /**
   * The endpoint to access and manage `user_id` presence and fetch channel presence information.
   *
   * This is related to the following functionality:
   * - `get presence state`
   * - `set presence state`
   * - `here now`
   * - `where now`
   * - `heartbeat`
   */
  Presence = 'PresenceEndpoint',

  /**
   * The endpoint to access and manage files in channel-specific storage.
   *
   * This is related to the following functionality:
   * - `send file`
   * - `download file`
   * - `list files`
   * - `delete file`
   */
  Files = 'FilesEndpoint',

  /**
   * The endpoint to access and manage messages for a specific channel(s) in the persistent storage.
   *
   * This is related to the following functionality:
   * - `fetch messages / message actions`
   * - `delete messages`
   * - `messages count`
   */
  MessageStorage = 'MessageStorageEndpoint',

  /**
   * The endpoint to access and manage channel groups.
   *
   * This is related to the following functionality:
   * - `add channels to group`
   * - `list channels in group`
   * - `remove channels from group`
   * - `list channel groups`
   */
  ChannelGroups = 'ChannelGroupsEndpoint',

  /**
   * The endpoint to access and manage device registration for channel push notifications.
   *
   * This is related to the following functionality:
   * - `enable channels for push notifications`
   * - `list push notification enabled channels`
   * - `disable push notifications for channels`
   * - `disable push notifications for all channels`
   */
  DevicePushNotifications = 'DevicePushNotificationsEndpoint',

  /**
   * The endpoint to access and manage App Context objects.
   *
   * This is related to the following functionality:
   * - `set UUID metadata`
   * - `get UUID metadata`
   * - `remove UUID metadata`
   * - `get all UUID metadata`
   * - `set Channel metadata`
   * - `get Channel metadata`
   * - `remove Channel metadata`
   * - `get all Channel metadata`
   * - `manage members`
   * - `list members`
   * - `manage memberships`
   * - `list memberships`
   */
  AppContext = 'AppContextEndpoint',

  /**
   * The endpoint to access and manage reactions for a specific message.
   *
   * This is related to the following functionality:
   * - `add message action`
   * - `get message actions`
   * - `remove message action`
   */
  MessageReactions = 'MessageReactionsEndpoint',
}

/**
 * Request retry configuration interface.
 */
export type RequestRetryPolicy = {
  /**
   * Check whether failed request can be retried.
   *
   * @param request - Transport request for which retry ability should be identifier.
   * @param [response] - Service response (if available)
   * @param [errorCategory] - Request processing error category.
   * @param [attempt] - Number of sequential failure.
   *
   * @returns `true` if another request retry attempt can be done.
   */
  shouldRetry(
    request: TransportRequest,
    response?: TransportResponse,
    errorCategory?: StatusCategory,
    attempt?: number,
  ): boolean;

  /**
   * Computed delay for next request retry attempt.
   *
   * @param attempt - Number of sequential failure.
   * @param [response] - Service response (if available).
   *
   * @returns Delay before next request retry attempt in milliseconds.
   */
  getDelay(attempt: number, response?: TransportResponse): number;

  /**
   * Validate retry policy parameters.
   *
   * @throws Error if `minimum` delay is smaller than 2 seconds for `exponential` retry policy.
   * @throws Error if `maximum` delay is larger than 150 seconds for `exponential` retry policy.
   * @throws Error if `maximumRetry` attempts is larger than 6 for `exponential` retry policy.
   * @throws Error if `maximumRetry` attempts is larger than 10 for `linear` retry policy.
   */
  validate(): void;
};

/**
 * Policy, which uses linear formula to calculate next request retry attempt time.
 */
export type LinearRetryPolicyConfiguration = {
  /**
   * Delay between retry attempt (in seconds).
   */
  delay: number;

  /**
   * Maximum number of retry attempts.
   */
  maximumRetry: number;

  /**
   * Endpoints that won't be retried.
   */
  excluded?: Endpoint[];
};

/**
 * Policy, which uses exponential formula to calculate next request retry attempt time.
 */
export type ExponentialRetryPolicyConfiguration = {
  /**
   * Minimum delay between retry attempts (in seconds).
   */
  minimumDelay: number;

  /**
   * Maximum delay between retry attempts (in seconds).
   */
  maximumDelay: number;

  /**
   * Maximum number of retry attempts.
   */
  maximumRetry: number;

  /**
   * Endpoints that won't be retried.
   */
  excluded?: Endpoint[];
};
// endregion

/**
 * Failed request retry policy.
 */
export class RetryPolicy {
  static None(): RequestRetryPolicy {
    return {
      shouldRetry(_request, _response, _errorCategory, _attempt): boolean {
        return false;
      },
      getDelay(_attempt, _response): number {
        return -1;
      },
      validate() {
        return true;
      },
    };
  }

  static LinearRetryPolicy(
    configuration: LinearRetryPolicyConfiguration,
  ): RequestRetryPolicy & LinearRetryPolicyConfiguration {
    return {
      delay: configuration.delay,
      maximumRetry: configuration.maximumRetry,
      excluded: configuration.excluded ?? [],

      shouldRetry(request, response, error, attempt) {
        return isRetriableRequest(request, response, error, attempt ?? 0, this.maximumRetry, this.excluded);
      },

      getDelay(_, response) {
        let delay = -1;
        if (response && response.headers['retry-after'] !== undefined)
          delay = parseInt(response.headers['retry-after'], 10);
        if (delay === -1) delay = this.delay;

        return (delay + Math.random()) * 1000;
      },

      validate() {
        if (this.delay < 2) throw new Error('Delay can not be set less than 2 seconds for retry');
        if (this.maximumRetry > 10) throw new Error('Maximum retry for linear retry policy can not be more than 10');
      },
    };
  }

  static ExponentialRetryPolicy(
    configuration: ExponentialRetryPolicyConfiguration,
  ): RequestRetryPolicy & ExponentialRetryPolicyConfiguration {
    return {
      minimumDelay: configuration.minimumDelay,
      maximumDelay: configuration.maximumDelay,
      maximumRetry: configuration.maximumRetry,
      excluded: configuration.excluded ?? [],

      shouldRetry(request, response, error, attempt) {
        return isRetriableRequest(request, response, error, attempt ?? 0, this.maximumRetry, this.excluded);
      },

      getDelay(attempt, response) {
        let delay = -1;
        if (response && response.headers['retry-after'] !== undefined)
          delay = parseInt(response.headers['retry-after'], 10);
        if (delay === -1) delay = Math.min(Math.pow(2, attempt), this.maximumDelay);

        return (delay + Math.random()) * 1000;
      },

      validate() {
        if (this.minimumDelay < 2) throw new Error('Minimum delay can not be set less than 2 seconds for retry');
        else if (this.maximumDelay > 150)
          throw new Error('Maximum delay can not be set more than 150 seconds for' + ' retry');
        else if (this.maximumRetry > 6)
          throw new Error('Maximum retry for exponential retry policy can not be more than 6');
      },
    };
  }
}

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
const isRetriableRequest = (
  req: TransportRequest,
  res: TransportResponse | undefined,
  errorCategory: StatusCategory | undefined,
  retryAttempt: number,
  maximumRetry: number,
  excluded?: Endpoint[],
) => {
  if (errorCategory) {
    if (
      errorCategory === StatusCategory.PNCancelledCategory ||
      errorCategory === StatusCategory.PNBadRequestCategory ||
      errorCategory === StatusCategory.PNAccessDeniedCategory
    )
      return false;
  }
  if (isExcludedRequest(req, excluded)) return false;
  else if (retryAttempt > maximumRetry) return false;

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
const isExcludedRequest = (req: TransportRequest, excluded?: Endpoint[]) =>
  excluded && excluded.length > 0 ? excluded.includes(endpointFromRequest(req)) : false;

/**
 * Identify API group from transport request.
 *
 * @param req - Request for which `path` will be analyzed to identify REST API group.
 *
 * @returns Endpoint group to which request belongs.
 *
 * @internal
 */
const endpointFromRequest = (req: TransportRequest) => {
  let endpoint = Endpoint.Unknown;

  if (req.path.startsWith('/v2/subscribe')) endpoint = Endpoint.Subscribe;
  else if (req.path.startsWith('/publish/') || req.path.startsWith('/signal/')) endpoint = Endpoint.MessageSend;
  else if (req.path.startsWith('/v2/presence')) endpoint = Endpoint.Presence;
  else if (req.path.startsWith('/v2/history') || req.path.startsWith('/v3/history')) endpoint = Endpoint.MessageStorage;
  else if (req.path.startsWith('/v1/message-actions/')) endpoint = Endpoint.MessageReactions;
  else if (req.path.startsWith('/v1/channel-registration/')) endpoint = Endpoint.ChannelGroups;
  else if (req.path.startsWith('/v2/objects/')) endpoint = Endpoint.ChannelGroups;
  else if (req.path.startsWith('/v1/push/') || req.path.startsWith('/v2/push/'))
    endpoint = Endpoint.DevicePushNotifications;
  else if (req.path.startsWith('/v1/files/')) endpoint = Endpoint.Files;

  return endpoint;
};
