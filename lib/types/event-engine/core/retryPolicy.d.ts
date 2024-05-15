import { PubNubError } from '../../errors/pubnub-error';
export declare class RetryPolicy {
    static LinearRetryPolicy(configuration: LinearRetryPolicyConfiguration): RequestRetryPolicy & LinearRetryPolicyConfiguration;
    static ExponentialRetryPolicy(configuration: ExponentialRetryPolicyConfiguration): RequestRetryPolicy & ExponentialRetryPolicyConfiguration;
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
    shouldRetry(reason: PubNubError & {
        retryAfter?: number;
    }, attempt: number): boolean;
    /**
     * Computed delay for next request retry attempt.
     *
     * @param attempt - Number of consequent failure.
     * @param reason - Request processing failure reason.
     *
     * @returns Delay before next request retry attempt in milliseconds.
     */
    getDelay(attempt: number, reason: PubNubError & {
        retryAfter?: number;
    }): number;
    /**
     * Identify reason why another retry attempt can't be made.
     *
     * @param reason - Request processing failure reason.
     * @param attempt - Number of consequent failure.
     *
     * @returns Give up reason.
     */
    getGiveupReason(reason: PubNubError & {
        retryAfter?: number;
    }, attempt: number): string;
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
