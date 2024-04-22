import { PubNubError } from '../../errors/pubnub-error';

export class RetryPolicy {
  static LinearRetryPolicy(
    configuration: LinearRetryPolicyConfiguration,
  ): RequestRetryPolicy & LinearRetryPolicyConfiguration {
    return {
      delay: configuration.delay,
      maximumRetry: configuration.maximumRetry,
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      shouldRetry(error: any, attempt: number) {
        if (error?.status?.statusCode === 403) {
          return false;
        }
        return this.maximumRetry > attempt;
      },
      getDelay(_, reason) {
        const delay = reason.retryAfter ?? this.delay;
        return (delay + Math.random()) * 1000;
      },
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      getGiveupReason(error: any, attempt: number) {
        if (this.maximumRetry <= attempt) {
          return 'retry attempts exhaused.';
        }
        if (error?.status?.statusCode === 403) {
          return 'forbidden operation.';
        }
        return 'unknown error';
      },
      validate() {
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

      shouldRetry(reason, attempt) {
        if (reason?.status?.statusCode === 403) {
          return false;
        }
        return this.maximumRetry > attempt;
      },

      getDelay(attempt, reason) {
        const delay = reason.retryAfter ?? Math.min(Math.pow(2, attempt), this.maximumDelay);
        return (delay + Math.random()) * 1000;
      },

      getGiveupReason(reason, attempt) {
        if (this.maximumRetry <= attempt) {
          return 'retry attempts exhausted.';
        }
        if (reason?.status?.statusCode === 403) {
          return 'forbidden operation.';
        }
        return 'unknown error';
      },

      validate() {
        if (this.minimumDelay < 2) throw new Error('Minimum delay can not be set less than 2 seconds for retry');
        else if (this.maximumDelay) throw new Error('Maximum delay can not be set more than 150 seconds for retry');
        else if (this.maximumRetry > 6)
          throw new Error('Maximum retry for exponential retry policy can not be more than 6');
      },
    };
  }
}

export type RequestRetryPolicy = {
  /**
   * Check whether failed request can be retried.
   *
   * @param reason - Request processing failure reason.
   * @param attempt - Number of consequent failure.
   *
   * @returns `true` if another request retry attempt can be done.
   */
  shouldRetry(reason: PubNubError & { retryAfter?: number }, attempt: number): boolean;

  /**
   * Computed delay for next request retry attempt.
   *
   * @param attempt - Number of consequent failure.
   * @param reason - Request processing failure reason.
   *
   * @returns Delay before next request retry attempt in milliseconds.
   */
  getDelay(attempt: number, reason: PubNubError & { retryAfter?: number }): number;

  /**
   * Identify reason why another retry attempt can't be made.
   *
   * @param reason - Request processing failure reason.
   * @param attempt - Number of consequent failure.
   *
   * @returns Give up reason.
   */
  getGiveupReason(reason: PubNubError & { retryAfter?: number }, attempt: number): string;

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

export type LinearRetryPolicyConfiguration = {
  delay: number;
  maximumRetry: number;
};

export type ExponentialRetryPolicyConfiguration = {
  minimumDelay: number;
  maximumDelay: number;
  maximumRetry: number;
};
