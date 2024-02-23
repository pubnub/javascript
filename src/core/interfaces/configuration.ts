import { FileConstructor } from './file';
import { TransportKeepAlive } from './transport';

export type PrivateConfigurationOptions = 'platform' | 'sdkFamily' | 'cbor' | 'networking' | 'PubNubFile';

/**
 * Base platform-less PubNub client configuration.
 */
export interface BaseConfiguration {
  /**
   * Specifies the `subscribeKey` to be used for subscribing to a channel and message publishing.
   */
  subscribeKey: string;

  /**
   * Specifies the `publishKey` to be used for publishing messages to a channel.
   */
  publishKey?: string;

  /**
   * `userId` to use. You should set a unique `userId` to identify the user or the device that
   * connects to PubNub.
   * It's a UTF-8 encoded string of up to 64 alphanumeric characters.
   *
   * If you don't set the userId, you won't be able to connect to PubNub.
   */
  userId: string;

  /**
   * If Access Manager enabled, this key will be used on all requests.
   */
  authKey?: string;

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
  origin?: string;

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
   * `true` to allow catch up on the front-end applications.
   *
   * @default `false`
   */
  restore?: boolean;

  /**
   * Whether or not to include the PubNub object instance ID in outgoing requests.
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
   * For more information, refer to {@link /docs/general/setup/connection-management#reconnection-policy|Reconnection Policy}. JavaScript doesn't support excluding endpoints.
   *
   * @default `not set`
   */
  retryConfiguration?: object;

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
   * @deprecated Use `userId` instead.
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
   * Set a custom parameters for setting your connection `keepAlive` if this is set to `true`.
   */
  keepAliveSettings?: TransportKeepAlive;

  /**
   * Track of the SDK family for identifier generator.
   */
  sdkFamily: string;

  /**
   * If the SDK is running as part of another SDK built atop of it, allow a custom pnsdk with
   * name and version.
   */
  sdkName: string;

  /**
   * If the SDK is operated by a partner, allow a custom pnsdk item for them.
   */
  partnerId?: string;

  // ------------------- Web-specific configuration -------------------

  /**
   * If the browser fails to detect the network changes from WiFi to LAN and vice versa or you
   * get reconnection issues, set the flag to `false`. This allows the SDK reconnection logic to
   * take over.
   *
   * @default `true`
   */
  listenToBrowserNetworkEvents?: boolean;

  // ------------------- Node-specific configuration -------------------

  networking: any;

  cbor: any;

  /**
   * Platform-specific file representation
   */
  PubNubFile: FileConstructor;
}
