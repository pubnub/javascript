/**
 * {@link PubNub} client configuration module.
 */
import { RequestRetryPolicy } from '../../event-engine/core/retryPolicy';
/**
 * Base user-provided PubNub client configuration.
 */
export type UserConfiguration = {
    /**
     * Specifies the `subscribeKey` to be used for subscribing to a channel and message publishing.
     */
    subscribeKey: string;
    /**
     * Specifies the `subscribe_key` to be used for subscribing to a channel and message publishing.
     *
     * @deprecated Use the {@link subscribeKey} instead.
     */
    subscribe_key?: string;
    /**
     * Specifies the `publishKey` to be used for publishing messages to a channel.
     */
    publishKey?: string;
    /**
     * Specifies the `publish_key` to be used for publishing messages to a channel.
     *
     * @deprecated Use the {@link publishKey} instead.
     */
    publish_key?: string;
    /**
     * Specifies the `secretKey` to be used for request signatures computation.
     */
    secretKey?: string;
    /**
     * Specifies the `secret_key` to be used for request signatures computation.
     *
     * @deprecated Use the {@link secretKey} instead.
     */
    secret_key?: string;
    /**
     * Unique PubNub client user identifier.
     *
     * Unique `userId` to identify the user or the device that connects to PubNub.
     * It's a UTF-8 encoded string of up to 64 alphanumeric characters.
     *
     * If you don't set the `userId`, you won't be able to connect to PubNub.
     */
    userId?: string;
    /**
     * If Access Manager enabled, this key will be used on all requests.
     */
    authKey?: string | null;
    /**
     * Log HTTP information.
     *
     * @default `false`
     */
    logVerbosity?: boolean;
    /**
     * If set to true, requests will be made over HTTPS.
     *
     * @default `true` for v4.20.0 onwards, `false` before v4.20.0
     */
    ssl?: boolean;
    /**
     * If a custom domain is required, SDK accepts it here.
     *
     * @default `ps.pndsn.com`
     */
    origin?: string | string[];
    /**
     * How long the server will consider the client alive for presence.The value is in seconds.
     *
     * @default `300`
     */
    presenceTimeout?: number;
    /**
     * How often the client will announce itself to server.The value is in seconds.
     *
     * @default `not set`
     */
    heartbeatInterval?: number;
    /**
     * Transactional requests timeout in milliseconds.
     *
     * Maximum duration for which PubNub client should wait for transactional request completion.
     *
     * @default `15` seconds
     */
    transactionalRequestTimeout?: number;
    /**
     * Subscription requests timeout in milliseconds.
     *
     * Maximum duration for which PubNub client should wait for subscription request completion.
     *
     * @default `310` seconds
     */
    subscribeRequestTimeout?: number;
    /**
     * `true` to allow catch up on the front-end applications.
     *
     * @default `false`
     */
    restore?: boolean;
    /**
     * Whether to include the PubNub object instance ID in outgoing requests.
     *
     * @default `false`
     */
    useInstanceId?: boolean;
    /**
     * When `true` the SDK doesn't send out the leave requests.
     *
     * @default `false`
     */
    suppressLeaveEvents?: boolean;
    /**
     * `PNRequestMessageCountExceededCategory` is thrown when the number of messages into the
     * payload is above of `requestMessageCountThreshold`.
     *
     * @default `100`
     */
    requestMessageCountThreshold?: number;
    /**
     * This flag announces when the network is down or up using the states `PNNetworkDownCategory`
     * and `PNNetworkUpCategory`.
     *
     * @default `false`
     */
    autoNetworkDetection?: boolean;
    /**
     * Whether to use the standardized workflows for subscribe and presence.
     *
     * Note that the `maintainPresenceState` parameter is set to true by default, so make sure to
     * disable it if you don't need to maintain presence state. For more information, refer to the
     * param description in this table.
     *
     *
     * @default `false`
     */
    enableEventEngine?: boolean;
    /**
     * Custom reconnection configuration parameters.
     *
     * `retryConfiguration: policy` is the type of policy to be used.
     *
     * Available values:
     * - `PubNub.LinearRetryPolicy({ delay, maximumRetry })`
     * - `PubNub.ExponentialRetryPolicy({ minimumDelay, maximumDelay, maximumRetry })`
     *
     * For more information, refer to
     * {@link /docs/general/setup/connection-management#reconnection-policy|Reconnection Policy}. JavaScript doesn't
     * support excluding endpoints.
     *
     * @default `not set`
     */
    retryConfiguration?: RequestRetryPolicy;
    /**
     * Whether the `state` set using `setState()` should be maintained for the current `userId`.
     * This option works only when `enableEventEngine` is set to `true`.
     *
     * @default `true`
     */
    maintainPresenceState?: boolean;
    /**
     * `UUID` to use. You should set a unique `UUID` to identify the user or the device that
     * connects to PubNub.
     * If you don't set the `UUID`, you won't be able to connect to PubNub.
     *
     * @deprecated Use {@link userId} instead.
     */
    uuid?: string;
    /**
     * If set to `true`, SDK will use the same TCP connection for each HTTP request, instead of
     * opening a new one for each new request.
     *
     * @default `false`
     */
    keepAlive?: boolean;
    /**
     * If the SDK is running as part of another SDK built atop of it, allow a custom `pnsdk` with
     * name and version.
     */
    sdkName?: string;
    /**
     * If the SDK is operated by a partner, allow a custom `pnsdk` item for them.
     */
    partnerId?: string;
};
/**
 * User-provided configuration object interface.
 *
 * Interface contains limited set of settings manipulation and access.
 */
export interface ClientConfiguration {
    /**
     * Get a PubNub client user identifier.
     *
     * @returns Current PubNub client user identifier.
     */
    getUserId(): string;
    /**
     * Change the current PubNub client user identifier.
     *
     * **Important:** Change won't affect ongoing REST API calls.
     *
     * @param value - New PubNub client user identifier.
     *
     * @throws Error empty user identifier has been provided.
     */
    setUserId(value: string): void;
    /**
     * Change REST API endpoint access authorization key.
     *
     * @param authKey - New authorization key which should be used with new requests.
     */
    setAuthKey(authKey: string | null): void;
    /**
     * Real-time updates filtering expression.
     *
     * @returns Filtering expression.
     */
    getFilterExpression(): string | undefined | null;
    /**
     * Update real-time updates filtering expression.
     *
     * @param expression - New expression which should be used or `undefined` to disable filtering.
     */
    setFilterExpression(expression: string | null | undefined): void;
    /**
     * Change data encryption / decryption key.
     *
     * @param key - New key which should be used for data encryption / decryption.
     */
    setCipherKey(key: string | undefined): void;
    /**
     * Get PubNub SDK version.
     *
     * @returns Current SDK version.
     */
    get version(): string;
    /**
     * Get PubNub SDK version.
     *
     * @returns Current SDK version.
     */
    getVersion(): string;
    /**
     * Add framework's prefix.
     *
     * @param name - Name of the framework which would want to add own data into `pnsdk` suffix.
     * @param suffix - Suffix with information about framework.
     */
    _addPnsdkSuffix(name: string, suffix: string | number): void;
    /**
     * Get a PubNub client user identifier.
     *
     * @returns Current PubNub client user identifier.
     *
     * @deprecated Use the {@link getUserId} or {@link userId} getter instead.
     */
    getUUID(): string;
    /**
     * Change the current PubNub client user identifier.
     *
     * **Important:** Change won't affect ongoing REST API calls.
     *
     * @param value - New PubNub client user identifier.
     *
     * @returns {Configuration} Reference to the configuration instance for easier chaining.
     *
     * @throws Error empty user identifier has been provided.
     *
     * @deprecated Use the {@link setUserId} or {@link userId} setter instead.
     */
    setUUID(value: string): void;
}
