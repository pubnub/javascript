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
      getDelay(_: number) {
        return this.delay * 1000;
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

      getDelay(attempt: number) {
        const calculatedDelay = Math.trunc(Math.pow(2, attempt)) * 1000 + Math.random() * 1000;
        if (calculatedDelay > 150000) {
          return 150000;
        } else {
          return calculatedDelay;
        }
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
