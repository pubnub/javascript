export class RetryPolicy {
  static LinearRetryPolicy(configuration: LinearRetryPolicyConfiguration) {
    return {
      delay: configuration.delay,
      maximumRetry: configuration.maximumRetry,
      shouldRetry(error: any, attempt: number) {
        if (error?.status?.statusCode === 403) {
          return false;
        }
        return this.maximumRetry > attempt;
      },
      getDelay(_: number, reason: any) {
        if (reason?.retryAfter) {
          return reason.retryAfter * 1000;
        }
        return (this.delay + Math.random()) * 1000;
      },
      getGiveupReason(error: any, attempt: number) {
        if (this.maximumRetry <= attempt) {
          return 'retry attempts exhaused.';
        }
        if (error?.status?.statusCode === 403) {
          return 'forbidden operation.';
        }
        return 'unknown error';
      },
    };
  }

  static ExponentialRetryPolicy(configuration: ExponentialRetryPolicyConfiguration) {
    return {
      minimumDelay: configuration.minimumDelay,
      maximumDelay: configuration.maximumDelay,
      maximumRetry: configuration.maximumRetry,

      shouldRetry(error: any, attempt: number) {
        if (error?.status?.statusCode === 403) {
          return false;
        }
        return this.maximumRetry > attempt;
      },

      getDelay(attempt: number, reason: any) {
        if (reason?.retryAfter) {
          return reason.retryAfter * 1000;
        }
        const calculatedDelay = (Math.pow(2, attempt) + Math.random()) * 1000;
        if (calculatedDelay > this.maximumDelay) {
          return this.maximumDelay;
        } else {
          return calculatedDelay;
        }
      },

      getGiveupReason(error: any, attempt: number) {
        if (this.maximumRetry <= attempt) {
          return 'retry attempts exhaused.';
        }
        if (error?.status?.statusCode === 403) {
          return 'forbidden operation.';
        }
        return 'unknown error';
      },
    };
  }
}

export type LinearRetryPolicyConfiguration = {
  delay: number;
  maximumRetry: number;
};

export type ExponentialRetryPolicyConfiguration = {
  minimumDelay: number;
  maximumDelay: number;
  maximumRetry: number;
};
