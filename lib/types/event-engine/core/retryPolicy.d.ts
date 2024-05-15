import { PubNubError } from '../../errors/pubnub-error';
export declare class RetryPolicy {
    static LinearRetryPolicy(configuration: LinearRetryPolicyConfiguration): RequestRetryPolicy & LinearRetryPolicyConfiguration;
    static ExponentialRetryPolicy(configuration: ExponentialRetryPolicyConfiguration): RequestRetryPolicy & ExponentialRetryPolicyConfiguration;
}
export type RequestRetryPolicy = {
    shouldRetry(reason: PubNubError & {
        retryAfter?: number;
    }, attempt: number): boolean;
    getDelay(attempt: number, reason: PubNubError & {
        retryAfter?: number;
    }): number;
    getGiveupReason(reason: PubNubError & {
        retryAfter?: number;
    }, attempt: number): string;
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
