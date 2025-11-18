import { Readable } from 'stream';
import { Buffer } from 'buffer';
import { ProxyAgentOptions } from 'proxy-agent';

/**
 * PubNub client for Node.js platform.
 */
declare class PubNub extends PubNubCore<
  string | ArrayBuffer | Buffer | Readable,
  PubNub.PubNubFileParameters,
  PubNub.PubNubFile
> {
  /**
   * Data encryption / decryption module constructor.
   */
  static CryptoModule: typeof PubNub.CryptoModuleType;
  /**
   * PubNub File constructor.
   */
  File: PubNub.PubNubFileConstructor<PubNub.PubNubFile, PubNub.PubNubFileParameters>;
  /**
   * Create and configure PubNub client core.
   *
   * @param configuration - User-provided PubNub client configuration.
   *
   * @returns Configured and ready to use PubNub client.
   */
  constructor(configuration: PubNub.PubNubConfiguration);
  /**
   * Update request proxy configuration.
   *
   * @param configuration - Updated request proxy configuration.
   *
   * @throws An error if {@link PubNub} client already configured to use `keepAlive`.
   * `keepAlive` and `proxy` can't be used simultaneously.
   */
  setProxy(configuration?: ProxyAgentOptions): void;
}

/**
 * Platform-agnostic PubNub client core.
 */
declare class PubNubCore<
  CryptographyTypes,
  FileConstructorParameters,
  PlatformFile extends Partial<PubNub.PubNubFileInterface> = Record<string, unknown>,
> implements PubNub.EventEmitCapable
{
  /**
   * Type of REST API endpoint which reported status.
   */
  static OPERATIONS: typeof PubNub.RequestOperation;
  /**
   * API call status category.
   */
  static CATEGORIES: typeof PubNub.StatusCategory;
  /**
   * Enum with API endpoint groups which can be used with retry policy to set up exclusions (which shouldn't be
   * retried).
   */
  static Endpoint: typeof PubNub.Endpoint;
  /**
   * Exponential retry policy constructor.
   */
  static ExponentialRetryPolicy: typeof PubNub.RetryPolicy.ExponentialRetryPolicy;
  /**
   * Linear retry policy constructor.
   */
  static LinearRetryPolicy: typeof PubNub.RetryPolicy.LinearRetryPolicy;
  /**
   * Disabled / inactive retry policy.
   *
   * **Note:** By default `ExponentialRetryPolicy` is set for subscribe requests and this one can be used to disable
   * retry policy for all requests (setting `undefined` for retry configuration will set default policy).
   */
  static NoneRetryPolicy: typeof PubNub.RetryPolicy.None;
  /**
   * Available minimum log levels.
   */
  static LogLevel: typeof PubNub.LoggerLogLevel;
  /**
   * Construct notification payload which will trigger push notification.
   *
   * @param title - Title which will be shown on notification.
   * @param body - Payload which will be sent as part of notification.
   *
   * @returns Pre-formatted message payload which will trigger push notification.
   */
  static notificationPayload(title: string, body: string): PubNub.NotificationsPayload;
  /**
   * Generate unique identifier.
   *
   * @returns Unique identifier.
   */
  static generateUUID(): any;
  /**
   * PubNub client configuration.
   *
   * @returns Currently user PubNub client configuration.
   */
  get configuration(): PubNub.ClientConfiguration;
  /**
   * Current PubNub client configuration.
   *
   * @returns Currently user PubNub client configuration.
   *
   * @deprecated Use {@link configuration} getter instead.
   */
  get _config(): PubNub.ClientConfiguration;
  /**
   * REST API endpoint access authorization key.
   *
   * It is required to have `authorization key` with required permissions to access REST API
   * endpoints when `PAM` enabled for user key set.
   */
  get authKey(): string | undefined;
  /**
   * REST API endpoint access authorization key.
   *
   * It is required to have `authorization key` with required permissions to access REST API
   * endpoints when `PAM` enabled for user key set.
   */
  getAuthKey(): string | undefined;
  /**
   * Change REST API endpoint access authorization key.
   *
   * @param authKey - New authorization key which should be used with new requests.
   */
  setAuthKey(authKey: string): void;
  /**
   * Get a PubNub client user identifier.
   *
   * @returns Current PubNub client user identifier.
   */
  get userId(): string;
  /**
   * Change the current PubNub client user identifier.
   *
   * **Important:** Change won't affect ongoing REST API calls.
   * **Warning:** Because ongoing REST API calls won't be canceled there could happen unexpected events like implicit
   * `join` event for the previous `userId` after a long-poll subscribe request will receive a response. To avoid this
   * it is advised to unsubscribe from all/disconnect before changing `userId`.
   *
   * @param value - New PubNub client user identifier.
   *
   * @throws Error empty user identifier has been provided.
   */
  set userId(value: string);
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
   * Real-time updates filtering expression.
   *
   * @returns Filtering expression.
   */
  get filterExpression(): string | undefined;
  /**
   * Real-time updates filtering expression.
   *
   * @returns Filtering expression.
   */
  getFilterExpression(): string | undefined;
  /**
   * Update real-time updates filtering expression.
   *
   * @param expression - New expression which should be used or `undefined` to disable filtering.
   */
  set filterExpression(expression: string | null | undefined);
  /**
   * Update real-time updates filtering expression.
   *
   * @param expression - New expression which should be used or `undefined` to disable filtering.
   */
  setFilterExpression(expression: string | null): void;
  /**
   * Dta encryption / decryption key.
   *
   * @returns Currently used key for data encryption / decryption.
   */
  get cipherKey(): string | undefined;
  /**
   * Change data encryption / decryption key.
   *
   * @param key - New key which should be used for data encryption / decryption.
   */
  set cipherKey(key: string | undefined);
  /**
   * Change data encryption / decryption key.
   *
   * @param key - New key which should be used for data encryption / decryption.
   */
  setCipherKey(key: string): void;
  /**
   * Change a heartbeat requests interval.
   *
   * @param interval - New presence request heartbeat intervals.
   */
  set heartbeatInterval(interval: number);
  /**
   * Change a heartbeat requests interval.
   *
   * @param interval - New presence request heartbeat intervals.
   */
  setHeartbeatInterval(interval: number): void;
  /**
   * Get registered loggers' manager.
   *
   * @returns Registered loggers' manager.
   */
  get logger(): PubNub.LoggerManager;
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
   * @param suffix - Suffix with information about a framework.
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
   * @throws Error empty user identifier has been provided.
   *
   * @deprecated Use the {@link PubNubCore#setUserId setUserId} or {@link PubNubCore#userId userId} setter instead.
   */
  setUUID(value: string): void;
  /**
   * Custom data encryption method.
   *
   * @deprecated Instead use {@link cryptoModule} for data encryption.
   */
  get customEncrypt(): ((data: string) => string) | undefined;
  /**
   * Custom data decryption method.
   *
   * @deprecated Instead use {@link cryptoModule} for data decryption.
   */
  get customDecrypt(): ((data: string) => string) | undefined;
  /**
   * Create a `Channel` entity.
   *
   * Entity can be used for the interaction with the following API:
   * - `subscribe`
   *
   * @param name - Unique channel name.
   * @returns `Channel` entity.
   */
  channel(name: string): PubNub.Channel;
  /**
   * Create a `ChannelGroup` entity.
   *
   * Entity can be used for the interaction with the following API:
   * - `subscribe`
   *
   * @param name - Unique channel group name.
   * @returns `ChannelGroup` entity.
   */
  channelGroup(name: string): PubNub.ChannelGroup;
  /**
   * Create a `ChannelMetadata` entity.
   *
   * Entity can be used for the interaction with the following API:
   * - `subscribe`
   *
   * @param id - Unique channel metadata object identifier.
   * @returns `ChannelMetadata` entity.
   */
  channelMetadata(id: string): PubNub.ChannelMetadata;
  /**
   * Create a `UserMetadata` entity.
   *
   * Entity can be used for the interaction with the following API:
   * - `subscribe`
   *
   * @param id - Unique user metadata object identifier.
   * @returns `UserMetadata` entity.
   */
  userMetadata(id: string): PubNub.UserMetadata;
  /**
   * Create subscriptions set object.
   *
   * @param parameters - Subscriptions set configuration parameters.
   */
  subscriptionSet(parameters: {
    channels?: string[];
    channelGroups?: string[];
    subscriptionOptions?: PubNub.SubscriptionOptions;
  }): PubNub.SubscriptionSet;
  /**
   * Unsubscribe from all channels and groups.
   *
   * @param [isOffline] - Whether `offline` presence should be notified or not.
   */
  destroy(isOffline?: boolean): void;
  /**
   * Unsubscribe from all channels and groups.
   *
   * @deprecated Use {@link destroy} method instead.
   */
  stop(): void;
  /**
   * Publish data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  publish(
    parameters: PubNub.Publish.PublishParameters,
    callback: PubNub.ResultCallback<PubNub.Publish.PublishResponse>,
  ): void;
  /**
   * Publish data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous publish data response.
   */
  publish(parameters: PubNub.Publish.PublishParameters): Promise<PubNub.Publish.PublishResponse>;
  /**
   * Signal data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  signal(
    parameters: PubNub.Signal.SignalParameters,
    callback: PubNub.ResultCallback<PubNub.Signal.SignalResponse>,
  ): void;
  /**
   * Signal data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous signal data response.
   */
  signal(parameters: PubNub.Signal.SignalParameters): Promise<PubNub.Signal.SignalResponse>;
  /**
   * `Fire` a data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link publish} method instead.
   */
  fire(
    parameters: PubNub.Publish.PublishParameters,
    callback: PubNub.ResultCallback<PubNub.Publish.PublishResponse>,
  ): void;
  /**
   * `Fire` a data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous signal data response.
   *
   * @deprecated Use {@link publish} method instead.
   */
  fire(parameters: PubNub.Publish.PublishParameters): Promise<PubNub.Publish.PublishResponse>;
  /**
   * Get list of channels on which PubNub client currently subscribed.
   *
   * @returns List of active channels.
   */
  getSubscribedChannels(): string[];
  /**
   * Get list of channel groups on which PubNub client currently subscribed.
   *
   * @returns List of active channel groups.
   */
  getSubscribedChannelGroups(): string[];
  /**
   * Subscribe to specified channels and groups real-time events.
   *
   * @param parameters - Request configuration parameters.
   */
  subscribe(parameters: PubNub.Subscription.SubscribeParameters): void;
  /**
   * Unsubscribe from specified channels and groups real-time events.
   *
   * @param parameters - Request configuration parameters.
   */
  unsubscribe(parameters: PubNub.Presence.PresenceLeaveParameters): void;
  /**
   * Unsubscribe from all channels and groups.
   */
  unsubscribeAll(): void;
  /**
   * Temporarily disconnect from the real-time events stream.
   *
   * **Note:** `isOffline` is set to `true` only when a client experiences network issues.
   *
   * @param [isOffline] - Whether `offline` presence should be notified or not.
   */
  disconnect(isOffline?: boolean): void;
  /**
   * Restore connection to the real-time events stream.
   *
   * @param parameters - Reconnection catch-up configuration. **Note:** available only with the enabled event engine.
   */
  reconnect(parameters?: { timetoken?: string; region?: number }): void;
  /**
   * Get reactions to a specific message.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  getMessageActions(
    parameters: PubNub.MessageAction.GetMessageActionsParameters,
    callback: PubNub.ResultCallback<PubNub.MessageAction.GetMessageActionsResponse>,
  ): void;
  /**
   * Get reactions to a specific message.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get reactions response.
   */
  getMessageActions(
    parameters: PubNub.MessageAction.GetMessageActionsParameters,
  ): Promise<PubNub.MessageAction.GetMessageActionsResponse>;
  /**
   * Add a reaction to a specific message.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  addMessageAction(
    parameters: PubNub.MessageAction.AddMessageActionParameters,
    callback: PubNub.ResultCallback<PubNub.MessageAction.AddMessageActionResponse>,
  ): void;
  /**
   * Add a reaction to a specific message.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous add a reaction response.
   */
  addMessageAction(
    parameters: PubNub.MessageAction.AddMessageActionParameters,
  ): Promise<PubNub.MessageAction.AddMessageActionResponse>;
  /**
   * Remove a reaction from a specific message.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  removeMessageAction(
    parameters: PubNub.MessageAction.RemoveMessageActionParameters,
    callback: PubNub.ResultCallback<PubNub.MessageAction.RemoveMessageActionResponse>,
  ): void;
  /**
   * Remove a reaction from a specific message.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous remove a reaction response.
   */
  removeMessageAction(
    parameters: PubNub.MessageAction.RemoveMessageActionParameters,
  ): Promise<PubNub.MessageAction.RemoveMessageActionResponse>;
  /**
   * Fetch messages history for channels.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  fetchMessages(
    parameters: PubNub.History.FetchMessagesParameters,
    callback: PubNub.ResultCallback<PubNub.History.FetchMessagesResponse>,
  ): void;
  /**
   * Fetch messages history for channels.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous fetch messages response.
   */
  fetchMessages(parameters: PubNub.History.FetchMessagesParameters): Promise<PubNub.History.FetchMessagesResponse>;
  /**
   * Delete messages from the channel history.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   */
  deleteMessages(
    parameters: PubNub.History.DeleteMessagesParameters,
    callback: PubNub.ResultCallback<PubNub.History.DeleteMessagesResponse>,
  ): void;
  /**
   * Delete messages from the channel history.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous delete messages response.
   *
   */
  deleteMessages(parameters: PubNub.History.DeleteMessagesParameters): Promise<PubNub.History.DeleteMessagesResponse>;
  /**
   * Count messages from the channels' history.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  messageCounts(
    parameters: PubNub.History.MessageCountParameters,
    callback: PubNub.ResultCallback<PubNub.History.MessageCountResponse>,
  ): void;
  /**
   * Count messages from the channels' history.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous count messages response.
   */
  messageCounts(parameters: PubNub.History.MessageCountParameters): Promise<PubNub.History.MessageCountResponse>;
  /**
   * Fetch single channel history.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated
   */
  history(
    parameters: PubNub.History.GetHistoryParameters,
    callback: PubNub.ResultCallback<PubNub.History.GetHistoryResponse>,
  ): void;
  /**
   * Fetch single channel history.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous fetch channel history response.
   *
   * @deprecated
   */
  history(parameters: PubNub.History.GetHistoryParameters): Promise<PubNub.History.GetHistoryResponse>;
  /**
   * Get channel's presence information.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  hereNow(
    parameters: PubNub.Presence.HereNowParameters,
    callback: PubNub.ResultCallback<PubNub.Presence.HereNowResponse>,
  ): void;
  /**
   * Get channel presence information.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get channel's presence response.
   */
  hereNow(parameters: PubNub.Presence.HereNowParameters): Promise<PubNub.Presence.HereNowResponse>;
  /**
   * Get user's presence information.
   *
   * Get list of channels to which `uuid` currently subscribed.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  whereNow(
    parameters: PubNub.Presence.WhereNowParameters,
    callback: PubNub.ResultCallback<PubNub.Presence.WhereNowResponse>,
  ): void;
  /**
   * Get user's presence information.
   *
   * Get list of channels to which `uuid` currently subscribed.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get user's presence response.
   */
  whereNow(parameters: PubNub.Presence.WhereNowParameters): Promise<PubNub.Presence.WhereNowResponse>;
  /**
   * Get associated user's data for channels and groups.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  getState(
    parameters: PubNub.Presence.GetPresenceStateParameters,
    callback: PubNub.ResultCallback<PubNub.Presence.GetPresenceStateResponse>,
  ): void;
  /**
   * Get associated user's data for channels and groups.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get associated user's data response.
   */
  getState(parameters: PubNub.Presence.GetPresenceStateParameters): Promise<PubNub.Presence.GetPresenceStateResponse>;
  /**
   * Set associated user's data for channels and groups.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  setState(
    parameters: PubNub.Presence.SetPresenceStateParameters | PubNub.Presence.SetPresenceStateWithHeartbeatParameters,
    callback: PubNub.ResultCallback<
      PubNub.Presence.SetPresenceStateResponse | PubNub.Presence.PresenceHeartbeatResponse
    >,
  ): void;
  /**
   * Set associated user's data for channels and groups.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous set associated user's data response.
   */
  setState(
    parameters: PubNub.Presence.SetPresenceStateParameters | PubNub.Presence.SetPresenceStateWithHeartbeatParameters,
  ): Promise<PubNub.Presence.SetPresenceStateResponse | PubNub.Presence.PresenceHeartbeatResponse>;
  /**
   * Manual presence management.
   *
   * @param parameters - Desired presence state for a provided list of channels and groups.
   */
  presence(parameters: { connected: boolean; channels?: string[]; channelGroups?: string[] }): void;
  /**
   * Grant token permission.
   *
   * Generate access token with requested permissions.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  grantToken(
    parameters: PubNub.PAM.GrantTokenParameters,
    callback: PubNub.ResultCallback<PubNub.PAM.GrantTokenResponse>,
  ): void;
  /**
   * Grant token permission.
   *
   * Generate an access token with requested permissions.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous grant token response.
   */
  grantToken(parameters: PubNub.PAM.GrantTokenParameters): Promise<PubNub.PAM.GrantTokenResponse>;
  /**
   * Revoke token permission.
   *
   * @param token - Access token for which permissions should be revoked.
   * @param callback - Request completion handler callback.
   */
  revokeToken(
    token: PubNub.PAM.RevokeParameters,
    callback: PubNub.ResultCallback<PubNub.PAM.RevokeTokenResponse>,
  ): void;
  /**
   * Revoke token permission.
   *
   * @param token - Access token for which permissions should be revoked.
   *
   * @returns Asynchronous revoke token response.
   */
  revokeToken(token: PubNub.PAM.RevokeParameters): Promise<PubNub.PAM.RevokeTokenResponse>;
  /**
   * Get a current access token.
   *
   * @returns Previously configured access token using {@link setToken} method.
   */
  get token(): string | undefined;
  /**
   * Get a current access token.
   *
   * @returns Previously configured access token using {@link setToken} method.
   */
  getToken(): string | undefined;
  /**
   * Set current access token.
   *
   * @param token - New access token which should be used with next REST API endpoint calls.
   */
  set token(token: string | undefined);
  /**
   * Set current access token.
   *
   * @param token - New access token which should be used with next REST API endpoint calls.
   */
  setToken(token: string | undefined): void;
  /**
   * Parse access token.
   *
   * Parse token to see what permissions token owner has.
   *
   * @param token - Token which should be parsed.
   *
   * @returns Token's permissions information for the resources.
   */
  parseToken(token: string): PubNub.PAM.Token | undefined;
  /**
   * Grant auth key(s) permission.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link grantToken} and {@link setToken} methods instead.
   */
  grant(parameters: PubNub.PAM.GrantParameters, callback: PubNub.ResultCallback<PubNub.PAM.PermissionsResponse>): void;
  /**
   * Grant auth key(s) permission.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous grant auth key(s) permissions response.
   *
   * @deprecated Use {@link grantToken} and {@link setToken} methods instead.
   */
  grant(parameters: PubNub.PAM.GrantParameters): Promise<PubNub.PAM.PermissionsResponse>;
  /**
   * Audit auth key(s) permission.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated
   */
  audit(parameters: PubNub.PAM.AuditParameters, callback: PubNub.ResultCallback<PubNub.PAM.PermissionsResponse>): void;
  /**
   * Audit auth key(s) permission.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous audit auth key(s) permissions response.
   *
   * @deprecated
   */
  audit(parameters: PubNub.PAM.AuditParameters): Promise<PubNub.PAM.PermissionsResponse>;
  /**
   * PubNub App Context API group.
   */
  get objects(): PubNub.PubNubObjects;
  /**
   * Fetch a paginated list of User objects.
   *
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata getAllUUIDMetadata} method instead.
   */
  fetchUsers<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    callback: PubNub.ResultCallback<PubNub.AppContext.GetAllUUIDMetadataResponse<Custom>>,
  ): void;
  /**
   * Fetch a paginated list of User objects.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata getAllUUIDMetadata} method instead.
   */
  fetchUsers<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.GetAllMetadataParameters<PubNub.AppContext.UUIDMetadataObject<Custom>>,
    callback: PubNub.ResultCallback<PubNub.AppContext.GetAllUUIDMetadataResponse<Custom>>,
  ): void;
  /**
   * Fetch a paginated list of User objects.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous get all User objects response.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata getAllUUIDMetadata} method instead.
   */
  fetchUsers<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters?: PubNub.AppContext.GetAllMetadataParameters<PubNub.AppContext.UUIDMetadataObject<Custom>>,
  ): Promise<PubNub.AppContext.GetAllUUIDMetadataResponse<Custom>>;
  /**
   * Fetch User object for a currently configured PubNub client `uuid`.
   *
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata getUUIDMetadata} method instead.
   */
  fetchUser<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    callback: PubNub.ResultCallback<PubNub.AppContext.GetUUIDMetadataResponse<Custom>>,
  ): void;
  /**
   * Fetch User object for a currently configured PubNub client `uuid`.
   *
   * @param parameters - Request configuration parameters. Will fetch a User object for a currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata|getUUIDMetadata} method instead.
   */
  fetchUser<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.GetUUIDMetadataParameters,
    callback: PubNub.ResultCallback<PubNub.AppContext.GetUUIDMetadataResponse<Custom>>,
  ): void;
  /**
   * Fetch User object for a currently configured PubNub client `uuid`.
   *
   * @param [parameters] - Request configuration parameters. Will fetch a User object for a currently
   * configured PubNub client `uuid` if not set.
   *
   * @returns Asynchronous get User object response.
   *
   * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata getUUIDMetadata} method instead.
   */
  fetchUser<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters?: PubNub.AppContext.GetUUIDMetadataParameters,
  ): Promise<PubNub.AppContext.GetUUIDMetadataResponse<Custom>>;
  /**
   * Create a User object.
   *
   * @param parameters - Request configuration parameters. Will create a User object for a currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata setUUIDMetadata} method instead.
   */
  createUser<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.SetUUIDMetadataParameters<Custom>,
    callback: PubNub.ResultCallback<PubNub.AppContext.SetUUIDMetadataResponse<Custom>>,
  ): void;
  /**
   * Create a User object.
   *
   * @param parameters - Request configuration parameters. Will create User object for a currently
   * configured PubNub client `uuid` if not set.
   *
   * @returns Asynchronous create User object response.
   *
   * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata setUUIDMetadata} method instead.
   */
  createUser<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.SetUUIDMetadataParameters<Custom>,
  ): Promise<PubNub.AppContext.SetUUIDMetadataResponse<Custom>>;
  /**
   * Update a User object.
   *
   * @param parameters - Request configuration parameters. Will update User object for currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata setUUIDMetadata} method instead.
   */
  updateUser<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.SetUUIDMetadataParameters<Custom>,
    callback: PubNub.ResultCallback<PubNub.AppContext.SetUUIDMetadataResponse<Custom>>,
  ): void;
  /**
   * Update a User object.
   *
   * @param parameters - Request configuration parameters. Will update a User object for a currently
   * configured PubNub client `uuid` if not set.
   *
   * @returns Asynchronous update User object response.
   *
   * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata setUUIDMetadata} method instead.
   */
  updateUser<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.SetUUIDMetadataParameters<Custom>,
  ): Promise<PubNub.AppContext.SetUUIDMetadataResponse<Custom>>;
  /**
   * Remove a specific User object.
   *
   * @param callback - Request completion handler callback. Will remove a User object for a currently
   * configured PubNub client `uuid` if not set.
   *
   * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata removeUUIDMetadata} method instead.
   */
  removeUser(callback: PubNub.ResultCallback<PubNub.AppContext.RemoveUUIDMetadataResponse>): void;
  /**
   * Remove a specific User object.
   *
   * @param parameters - Request configuration parameters. Will remove a User object for a currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata removeUUIDMetadata} method instead.
   */
  removeUser(
    parameters: PubNub.AppContext.RemoveUUIDMetadataParameters,
    callback: PubNub.ResultCallback<PubNub.AppContext.RemoveUUIDMetadataResponse>,
  ): void;
  /**
   * Remove a specific User object.
   *
   * @param [parameters] - Request configuration parameters. Will remove a User object for a currently
   * configured PubNub client `uuid` if not set.
   *
   * @returns Asynchronous User object remove response.
   *
   * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata removeUUIDMetadata} method instead.
   */
  removeUser(
    parameters?: PubNub.AppContext.RemoveUUIDMetadataParameters,
  ): Promise<PubNub.AppContext.RemoveUUIDMetadataResponse>;
  /**
   * Fetch a paginated list of Space objects.
   *
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata getAllChannelMetadata} method instead.
   */
  fetchSpaces<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    callback: PubNub.ResultCallback<PubNub.AppContext.GetAllChannelMetadataResponse<Custom>>,
  ): void;
  /**
   * Fetch a paginated list of Space objects.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata getAllChannelMetadata} method instead.
   */
  fetchSpaces<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.GetAllMetadataParameters<PubNub.AppContext.ChannelMetadataObject<Custom>>,
    callback: PubNub.ResultCallback<PubNub.AppContext.GetAllChannelMetadataResponse<Custom>>,
  ): void;
  /**
   * Fetch a paginated list of Space objects.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous get all Space objects responses.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata getAllChannelMetadata} method instead.
   */
  fetchSpaces<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters?: PubNub.AppContext.GetAllMetadataParameters<PubNub.AppContext.ChannelMetadataObject<Custom>>,
  ): Promise<PubNub.AppContext.GetAllChannelMetadataResponse<Custom>>;
  /**
   * Fetch a specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getChannelMetadata getChannelMetadata} method instead.
   */
  fetchSpace<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.GetChannelMetadataParameters,
    callback: PubNub.ResultCallback<PubNub.AppContext.GetChannelMetadataResponse<Custom>>,
  ): void;
  /**
   * Fetch a specific Space object.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get Channel metadata response.
   *
   * @deprecated Use {@link PubNubCore#objects.getChannelMetadata getChannelMetadata} method instead.
   */
  fetchSpace<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.GetChannelMetadataParameters,
  ): Promise<PubNub.AppContext.GetChannelMetadataResponse<Custom>>;
  /**
   * Create a specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata setChannelMetadata} method instead.
   */
  createSpace<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.SetChannelMetadataParameters<Custom>,
    callback: PubNub.ResultCallback<PubNub.AppContext.SetChannelMetadataResponse<Custom>>,
  ): void;
  /**
   * Create specific Space object.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous create Space object response.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata setChannelMetadata} method instead.
   */
  createSpace<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.SetChannelMetadataParameters<Custom>,
  ): Promise<PubNub.AppContext.SetChannelMetadataResponse<Custom>>;
  /**
   * Update specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata setChannelMetadata} method instead.
   */
  updateSpace<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.SetChannelMetadataParameters<Custom>,
    callback: PubNub.ResultCallback<PubNub.AppContext.SetChannelMetadataResponse<Custom>>,
  ): void;
  /**
   * Update specific Space object.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update Space object response.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata setChannelMetadata} method instead.
   */
  updateSpace<Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData>(
    parameters: PubNub.AppContext.SetChannelMetadataParameters<Custom>,
  ): Promise<PubNub.AppContext.SetChannelMetadataResponse<Custom>>;
  /**
   * Remove a Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata removeChannelMetadata} method instead.
   */
  removeSpace(
    parameters: PubNub.AppContext.RemoveChannelMetadataParameters,
    callback: PubNub.ResultCallback<PubNub.AppContext.RemoveChannelMetadataResponse>,
  ): void;
  /**
   * Remove a specific Space object.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous Space object remove response.
   *
   * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata removeChannelMetadata} method instead.
   */
  removeSpace(
    parameters: PubNub.AppContext.RemoveChannelMetadataParameters,
  ): Promise<PubNub.AppContext.RemoveChannelMetadataResponse>;
  /**
   * Fetch a paginated list of specific Space members or specific User memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getChannelMembers getChannelMembers} or
   * {@link PubNubCore#objects.getMemberships getMemberships} methods instead.
   */
  fetchMemberships<
    RelationCustom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
    MetadataCustom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
  >(
    parameters: PubNub.AppContext.GetMembershipsParameters | PubNub.AppContext.GetMembersParameters,
    callback: PubNub.ResultCallback<
      | PubNub.AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom>
      | PubNub.AppContext.UserMembersResponse<RelationCustom, MetadataCustom>
    >,
  ): void;
  /**
   * Fetch paginated list of specific Space members or specific User memberships.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get specific Space members or specific User memberships response.
   *
   * @deprecated Use {@link PubNubCore#objects.getChannelMembers getChannelMembers} or
   * {@link PubNubCore#objects.getMemberships getMemberships} methods instead.
   */
  fetchMemberships<
    RelationCustom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
    MetadataCustom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
  >(
    parameters: PubNub.AppContext.GetMembershipsParameters | PubNub.AppContext.GetMembersParameters,
  ): Promise<
    | PubNub.AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom>
    | PubNub.AppContext.UserMembersResponse<RelationCustom, MetadataCustom>
  >;
  /**
   * Add members to specific Space or memberships specific User.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers setChannelMembers} or
   * {@link PubNubCore#objects.setMemberships setMemberships} methods instead.
   */
  addMemberships<
    Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
    MetadataCustom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
  >(
    parameters:
      | PubNub.AppContext.SetMembershipsParameters<Custom>
      | PubNub.AppContext.SetChannelMembersParameters<Custom>,
    callback: PubNub.ResultCallback<
      | PubNub.AppContext.SetMembershipsResponse<Custom, MetadataCustom>
      | PubNub.AppContext.SetMembersResponse<Custom, MetadataCustom>
    >,
  ): void;
  /**
   * Add members to specific Space or memberships specific User.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous add members to specific Space or memberships specific User response.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers setChannelMembers} or
   * {@link PubNubCore#objects.setMemberships setMemberships} methods instead.
   */
  addMemberships<
    Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
    MetadataCustom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
  >(
    parameters:
      | PubNub.AppContext.SetMembershipsParameters<Custom>
      | PubNub.AppContext.SetChannelMembersParameters<Custom>,
  ): Promise<
    | PubNub.AppContext.SetMembershipsResponse<Custom, MetadataCustom>
    | PubNub.AppContext.SetMembersResponse<Custom, MetadataCustom>
  >;
  /**
   * Update specific Space members or User memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers setChannelMembers} or
   * {@link PubNubCore#objects.setMemberships setMemberships} methods instead.
   */
  updateMemberships<
    Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
    MetadataCustom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
  >(
    parameters:
      | PubNub.AppContext.SetMembershipsParameters<Custom>
      | PubNub.AppContext.SetChannelMembersParameters<Custom>,
    callback: PubNub.ResultCallback<
      | PubNub.AppContext.SetMembershipsResponse<Custom, MetadataCustom>
      | PubNub.AppContext.SetMembersResponse<Custom, MetadataCustom>
    >,
  ): void;
  /**
   * Update specific Space members or User memberships.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update Space members or User memberships response.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers setChannelMembers} or
   * {@link PubNubCore#objects.setMemberships setMemberships} methods instead.
   */
  updateMemberships<
    Custom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
    MetadataCustom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
  >(
    parameters:
      | PubNub.AppContext.SetMembershipsParameters<Custom>
      | PubNub.AppContext.SetChannelMembersParameters<Custom>,
  ): Promise<
    | PubNub.AppContext.SetMembershipsResponse<Custom, MetadataCustom>
    | PubNub.AppContext.SetMembersResponse<Custom, MetadataCustom>
  >;
  /**
   * Remove User membership.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.removeMemberships removeMemberships} or
   * {@link PubNubCore#objects.removeChannelMembers removeChannelMembers} methods instead from `objects` API group.
   */
  removeMemberships<
    RelationCustom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
    MetadataCustom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
  >(
    parameters: PubNub.AppContext.RemoveMembersParameters | PubNub.AppContext.RemoveMembershipsParameters,
    callback: PubNub.ResultCallback<
      | PubNub.AppContext.RemoveMembersResponse<RelationCustom, MetadataCustom>
      | PubNub.AppContext.RemoveMembershipsResponse<RelationCustom, MetadataCustom>
    >,
  ): void;
  /**
   * Remove User membership.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous memberships modification response.
   *
   * @deprecated Use {@link PubNubCore#objects.removeMemberships removeMemberships} or
   * {@link PubNubCore#objects.removeChannelMembers removeChannelMembers} methods instead from `objects` API group.
   */
  removeMemberships<
    RelationCustom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
    MetadataCustom extends PubNub.AppContext.CustomData = PubNub.AppContext.CustomData,
  >(
    parameters: PubNub.AppContext.RemoveMembersParameters | PubNub.AppContext.RemoveMembershipsParameters,
  ): Promise<PubNub.AppContext.RemoveMembersResponse<RelationCustom, MetadataCustom>>;
  /**
   * PubNub Channel Groups API group.
   */
  get channelGroups(): PubNub.PubNubChannelGroups;
  /**
   * PubNub Push Notifications API group.
   */
  get push(): PubNub.PubNubPushNotifications;
  /**
   * Share file to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  sendFile(
    parameters: PubNub.FileSharing.SendFileParameters<FileConstructorParameters>,
    callback: PubNub.ResultCallback<PubNub.FileSharing.SendFileResponse>,
  ): void;
  /**
   * Share file to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous file sharing response.
   */
  sendFile(
    parameters: PubNub.FileSharing.SendFileParameters<FileConstructorParameters>,
  ): Promise<PubNub.FileSharing.SendFileResponse>;
  /**
   * Publish file message to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  publishFile(
    parameters: PubNub.FileSharing.PublishFileMessageParameters,
    callback: PubNub.ResultCallback<PubNub.FileSharing.PublishFileMessageResponse>,
  ): void;
  /**
   * Publish file message to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous publish file message response.
   */
  publishFile(
    parameters: PubNub.FileSharing.PublishFileMessageParameters,
  ): Promise<PubNub.FileSharing.PublishFileMessageResponse>;
  /**
   * Retrieve list of shared files in specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  listFiles(
    parameters: PubNub.FileSharing.ListFilesParameters,
    callback: PubNub.ResultCallback<PubNub.FileSharing.ListFilesResponse>,
  ): void;
  /**
   * Retrieve list of shared files in specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous shared files list response.
   */
  listFiles(parameters: PubNub.FileSharing.ListFilesParameters): Promise<PubNub.FileSharing.ListFilesResponse>;
  /**
   * Get file download Url.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns File download Url.
   */
  getFileUrl(parameters: PubNub.FileSharing.FileUrlParameters): PubNub.FileSharing.FileUrlResponse;
  /**
   * Download a shared file from a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  downloadFile(
    parameters: PubNub.FileSharing.DownloadFileParameters,
    callback: PubNub.ResultCallback<PlatformFile>,
  ): void;
  /**
   * Download a shared file from a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous download shared file response.
   */
  downloadFile(parameters: PubNub.FileSharing.DownloadFileParameters): Promise<PlatformFile>;
  /**
   * Delete a shared file from a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  deleteFile(
    parameters: PubNub.FileSharing.DeleteFileParameters,
    callback: PubNub.ResultCallback<PubNub.FileSharing.DeleteFileResponse>,
  ): void;
  /**
   * Delete a shared file from a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous delete shared file response.
   */
  deleteFile(parameters: PubNub.FileSharing.DeleteFileParameters): Promise<PubNub.FileSharing.DeleteFileResponse>;
  /**
     Get current high-precision timetoken.
     *
     * @param callback - Request completion handler callback.
     */
  time(callback: PubNub.ResultCallback<PubNub.Time.TimeResponse>): void;
  /**
   * Get current high-precision timetoken.
   *
   * @returns Asynchronous get current timetoken response.
   */
  time(): Promise<PubNub.Time.TimeResponse>;
  /**
   * Set a connection status change event handler.
   *
   * @param listener - Listener function, which will be called each time when the connection status changes.
   */
  set onStatus(listener: ((status: PubNub.Status | PubNub.StatusEvent) => void) | undefined);
  /**
   * Set a new message handler.
   *
   * @param listener - Listener function, which will be called each time when a new message
   * is received from the real-time network.
   */
  set onMessage(listener: ((event: PubNub.Subscription.Message) => void) | undefined);
  /**
   * Set a new presence events handler.
   *
   * @param listener - Listener function, which will be called each time when a new
   * presence event is received from the real-time network.
   */
  set onPresence(listener: ((event: PubNub.Subscription.Presence) => void) | undefined);
  /**
   * Set a new signal handler.
   *
   * @param listener - Listener function, which will be called each time when a new signal
   * is received from the real-time network.
   */
  set onSignal(listener: ((event: PubNub.Subscription.Signal) => void) | undefined);
  /**
   * Set a new app context event handler.
   *
   * @param listener - Listener function, which will be called each time when a new
   * app context event is received from the real-time network.
   */
  set onObjects(listener: ((event: PubNub.Subscription.AppContextObject) => void) | undefined);
  /**
   * Set a new message reaction event handler.
   *
   * @param listener - Listener function, which will be called each time when a
   * new message reaction event is received from the real-time network.
   */
  set onMessageAction(listener: ((event: PubNub.Subscription.MessageAction) => void) | undefined);
  /**
   * Set a new file handler.
   *
   * @param listener - Listener function, which will be called each time when a new file
   * is received from the real-time network.
   */
  set onFile(listener: ((event: PubNub.Subscription.File) => void) | undefined);
  /**
   * Set events handler.
   *
   * @param listener - Events listener configuration object, which lets specify handlers for multiple
   * types of events.
   */
  addListener(listener: PubNub.Listener): void;
  /**
   * Remove real-time event listener.
   *
   * @param listener - Event listener configuration, which should be removed from the list of notified
   * listeners. **Important:** Should be the same object which has been passed to the
   * {@link addListener}.
   */
  removeListener(listener: PubNub.Listener): void;
  /**
   * Clear all real-time event listeners.
   */
  removeAllListeners(): void;
  /**
   * Encrypt data.
   *
   * @param data - Stringified data which should be encrypted using `CryptoModule`.
   * @param [customCipherKey] - Cipher key which should be used to encrypt data. **Deprecated:**
   * use {@link Configuration#cryptoModule|cryptoModule} instead.
   *
   * @returns Data encryption result as a string.
   *
   * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
   */
  encrypt(data: string | PubNub.Payload, customCipherKey?: string): string;
  /**
   * Decrypt data.
   *
   * @param data - Stringified data which should be encrypted using `CryptoModule`.
   * @param [customCipherKey] - Cipher key which should be used to decrypt data. **Deprecated:**
   * use {@link Configuration#cryptoModule|cryptoModule} instead.
   *
   * @returns Data decryption result as an object.
   *
   * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
   */
  decrypt(data: string, customCipherKey?: string): PubNub.Payload | null;
  /**
   * Encrypt file content.
   *
   * @param file - File which should be encrypted using `CryptoModule`.
   *
   * @returns Asynchronous file encryption result.
   *
   * @throws Error if source file isn't provided.
   * @throws File constructor not provided.
   * @throws Crypto module is missing (if non-legacy flow used).
   *
   * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
   */
  encryptFile(file: PubNub.PubNubFileInterface): Promise<PubNub.PubNubFileInterface>;
  /**
   * Encrypt file content.
   *
   * @param key - Cipher key which should be used to encrypt data.
   * @param file - File which should be encrypted using legacy cryptography.
   *
   * @returns Asynchronous file encryption result.
   *
   * @throws Error if source file isn't provided.
   * @throws File constructor not provided.
   * @throws Crypto module is missing (if non-legacy flow used).
   *
   * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
   */
  encryptFile(key: string, file: PubNub.PubNubFileInterface): Promise<PubNub.PubNubFileInterface>;
  /**
   * Decrypt file content.
   *
   * @param file - File which should be decrypted using legacy cryptography.
   *
   * @returns Asynchronous file decryption result.
   *
   * @throws Error if source file isn't provided.
   * @throws File constructor not provided.
   * @throws Crypto module is missing (if non-legacy flow used).
   *
   * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
   */
  decryptFile(file: PubNub.PubNubFileInterface): Promise<PubNub.PubNubFileInterface>;
  /**
   * Decrypt file content.
   *
   * @param key - Cipher key which should be used to decrypt data.
   * @param [file] - File which should be decrypted using legacy cryptography.
   *
   * @returns Asynchronous file decryption result.
   *
   * @throws Error if source file isn't provided.
   * @throws File constructor not provided.
   * @throws Crypto module is missing (if non-legacy flow used).
   *
   * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
   */
  decryptFile(
    key: string | PubNub.PubNubFileInterface,
    file?: PubNub.PubNubFileInterface,
  ): Promise<PubNub.PubNubFileInterface>;
}

declare namespace PubNub {
  /**
   * Crypto module cryptors interface.
   */
  type CryptorType = ICryptor | ILegacyCryptor;

  /**
   * CryptoModule for Node.js platform.
   */
  export class NodeCryptoModule extends AbstractCryptoModule<CryptorType> {
    /**
     * {@link LegacyCryptor|Legacy} cryptor identifier.
     */
    static LEGACY_IDENTIFIER: string;
    static legacyCryptoModule(config: CryptorConfiguration): NodeCryptoModule;
    static aesCbcCryptoModule(config: CryptorConfiguration): NodeCryptoModule;
    /**
     * Construct crypto module with `cryptor` as default for data encryption and decryption.
     *
     * @param defaultCryptor - Default cryptor for data encryption and decryption.
     *
     * @returns Crypto module with pre-configured default cryptor.
     */
    static withDefaultCryptor(defaultCryptor: CryptorType): NodeCryptoModule;
    encrypt(data: ArrayBuffer | string): string | ArrayBuffer;
    encryptFile(
      file: PubNubFile,
      File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
    ): Promise<PubNubFile | undefined>;
    decrypt(data: ArrayBuffer | string): ArrayBuffer | Payload | null;
    decryptFile(
      file: PubNubFile,
      File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
    ): Promise<PubNubFile | undefined>;
  }

  /** Re-export aliased type. */
  export { NodeCryptoModule as CryptoModuleType };

  /**
   * Crypto module configuration.
   */
  export type CryptoModuleConfiguration<C> = {
    default: C;
    cryptors?: C[];
  };

  export type CryptorConfiguration = {
    /**
     * Data encryption / decryption key.
     */
    cipherKey?: string;
    /**
     * Request sign secret key.
     */
    secretKey?: string;
    /**
     * Whether random initialization vector should be used or not.
     *
     * @default `true`
     */
    useRandomIVs?: boolean;
    /**
     * Custom data encryption method.
     *
     * @deprecated Instead use {@link cryptoModule} for data encryption.
     */
    customEncrypt?: (data: string | Payload) => string;
    /**
     * Custom data decryption method.
     *
     * @deprecated Instead use {@link cryptoModule} for data decryption.
     */
    customDecrypt?: (data: string) => string;
  };

  /**
   * Base crypto module interface.
   */
  export interface ICryptoModule {
    /**
     * Encrypt data.
     *
     * @param data - Data which should be encrypted using `CryptoModule`.
     *
     * @returns Data encryption result.
     */
    encrypt(data: ArrayBuffer | string): ArrayBuffer | string;
    /**
     * Encrypt file object.
     *
     * @param file - File object with data for encryption.
     * @param File - File object constructor to create instance for encrypted data representation.
     *
     * @returns Asynchronous file encryption result.
     */
    encryptFile(
      file: PubNubFileInterface,
      File: PubNubFileConstructor<PubNubFileInterface, any>,
    ): Promise<PubNubFileInterface | undefined>;
    /**
     * Encrypt data.
     *
     * @param data - Dta which should be encrypted using `CryptoModule`.
     *
     * @returns Data decryption result.
     */
    decrypt(data: ArrayBuffer | string): ArrayBuffer | Payload | null;
    /**
     * Decrypt file object.
     *
     * @param file - Encrypted file object with data for decryption.
     * @param File - File object constructor to create instance for decrypted data representation.
     *
     * @returns Asynchronous file decryption result.
     */
    decryptFile(
      file: PubNubFileInterface,
      File: PubNubFileConstructor<PubNubFileInterface, any>,
    ): Promise<PubNubFileInterface | undefined>;
  }

  export abstract class AbstractCryptoModule<C> implements ICryptoModule {
    defaultCryptor: C;
    cryptors: C[];
    /**
     * Construct crypto module with legacy cryptor for encryption and both legacy and AES-CBC
     * cryptors for decryption.
     *
     * @param config Cryptors configuration options.
     *
     * @returns Crypto module which encrypts data using legacy cryptor.
     *
     * @throws Error if `config.cipherKey` not set.
     */
    static legacyCryptoModule(config: CryptorConfiguration): ICryptoModule;
    /**
     * Construct crypto module with AES-CBC cryptor for encryption and both AES-CBC and legacy
     * cryptors for decryption.
     *
     * @param config Cryptors configuration options.
     *
     * @returns Crypto module which encrypts data using AES-CBC cryptor.
     *
     * @throws Error if `config.cipherKey` not set.
     */
    static aesCbcCryptoModule(config: CryptorConfiguration): ICryptoModule;
    constructor(configuration: CryptoModuleConfiguration<C>);
    /**
     * Encrypt data.
     *
     * @param data - Data which should be encrypted using {@link ICryptoModule}.
     *
     * @returns Data encryption result.
     */
    abstract encrypt(data: ArrayBuffer | string): ArrayBuffer | string;
    /**
     * Encrypt file object.
     *
     * @param file - File object with data for encryption.
     * @param File - File object constructor to create instance for encrypted data representation.
     *
     * @returns Asynchronous file encryption result.
     */
    abstract encryptFile(
      file: PubNubFileInterface,
      File: PubNubFileConstructor<PubNubFileInterface, any>,
    ): Promise<PubNubFileInterface | undefined>;
    /**
     * Encrypt data.
     *
     * @param data - Dta which should be encrypted using `ICryptoModule`.
     *
     * @returns Data decryption result.
     */
    abstract decrypt(data: ArrayBuffer | string): ArrayBuffer | Payload | null;
    /**
     * Decrypt file object.
     *
     * @param file - Encrypted file object with data for decryption.
     * @param File - File object constructor to create instance for decrypted data representation.
     *
     * @returns Asynchronous file decryption result.
     */
    abstract decryptFile(
      file: PubNubFileInterface,
      File: PubNubFileConstructor<PubNubFileInterface, any>,
    ): Promise<PubNubFileInterface | undefined>;
    /**
     * Serialize crypto module information to string.
     *
     * @returns Serialized crypto module information.
     */
    toString(): string;
  }

  /**
   * Base file constructor parameters.
   *
   * Minimum set of parameters which can be p
   */
  export type PubNubBasicFileParameters = {
    data: string | ArrayBuffer;
    name: string;
    mimeType?: string;
  };

  /**
   * Platform-agnostic {@link PubNub} File object.
   *
   * Interface describes share of {@link PubNub} File which is required by {@link PubNub} core to
   * perform required actions.
   */
  export interface PubNubFileInterface {
    /**
     * Actual file name.
     */
    name: string;
    /**
     * File mime-type.
     */
    mimeType?: string;
    /**
     * File content length.
     */
    contentLength?: number;
    /**
     * Convert {@link PubNub} file object content to {@link ArrayBuffer}.
     *
     * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    toArrayBuffer(): Promise<ArrayBuffer>;
    /**
     * Convert {@link PubNub} File object content to file `Uri`.
     *
     * @returns Asynchronous results of conversion to file `Uri`.
     *
     * @throws Error if provided {@link PubNub} File object content is not supported for this
     * operation.
     */
    toFileUri(): Promise<Record<string, unknown>>;
  }

  /**
   * {@link PubNub} File object class interface.
   */
  export interface PubNubFileConstructor<File extends PubNubFileInterface, ConstructorParameters> {
    /**
     * Whether {@link Blob} data supported by platform or not.
     */
    supportsBlob: boolean;
    /**
     * Whether {@link File} data supported by platform or not.
     */
    supportsFile: boolean;
    /**
     * Whether {@link Buffer} data supported by platform or not.
     */
    supportsBuffer: boolean;
    /**
     * Whether {@link Stream} data supported by platform or not.
     */
    supportsStream: boolean;
    /**
     * Whether {@link String} data supported by platform or not.
     */
    supportsString: boolean;
    /**
     * Whether {@link ArrayBuffer} supported by platform or not.
     */
    supportsArrayBuffer: boolean;
    /**
     * Whether {@link PubNub} File object encryption supported or not.
     */
    supportsEncryptFile: boolean;
    /**
     * Whether `File Uri` data supported by platform or not.
     */
    supportsFileUri: boolean;
    /**
     * {@link PubNub} File object constructor.
     *
     * @param file - File instantiation parameters (can be raw data or structured object).
     *
     * @returns Constructed platform-specific {@link PubNub} File object.
     */
    create(file: ConstructorParameters): File;
    /**
     * {@link PubNub} File object constructor.
     *
     * @param file - File instantiation parameters (can be raw data or structured object).
     *
     * @returns Constructed platform-specific {@link PubNub} File object.
     */
    new (file: ConstructorParameters): File;
  }

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
    error?: string | StatusCategory | boolean;
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
  export type Payload =
    | string
    | number
    | boolean
    | {
        toJSON: () => Payload;
      }
    | {
        [key: string]: Payload | null;
      }
    | Payload[];

  /**
   * Endpoint API operation types.
   */
  export enum RequestOperation {
    /**
     * Data publish REST API operation.
     */
    PNPublishOperation = 'PNPublishOperation',
    /**
     * Signal sending REST API operation.
     */
    PNSignalOperation = 'PNSignalOperation',
    /**
     * Subscribe for real-time updates REST API operation.
     *
     * User's presence change on specified entities will trigger `join` event.
     */
    PNSubscribeOperation = 'PNSubscribeOperation',
    /**
     * Unsubscribe from real-time updates REST API operation.
     *
     * User's presence change on specified entities will trigger `leave` event.
     */
    PNUnsubscribeOperation = 'PNUnsubscribeOperation',
    /**
     * Fetch user's presence information REST API operation.
     */
    PNWhereNowOperation = 'PNWhereNowOperation',
    /**
     * Fetch channel's presence information REST API operation.
     */
    PNHereNowOperation = 'PNHereNowOperation',
    /**
     * Fetch global presence information REST API operation.
     */
    PNGlobalHereNowOperation = 'PNGlobalHereNowOperation',
    /**
     * Update user's information associated with specified channel REST API operation.
     */
    PNSetStateOperation = 'PNSetStateOperation',
    /**
     * Fetch user's information associated with the specified channel REST API operation.
     */
    PNGetStateOperation = 'PNGetStateOperation',
    /**
     * Announce presence on managed channels REST API operation.
     */
    PNHeartbeatOperation = 'PNHeartbeatOperation',
    /**
     * Add a reaction to the specified message REST API operation.
     */
    PNAddMessageActionOperation = 'PNAddActionOperation',
    /**
     * Remove reaction from the specified message REST API operation.
     */
    PNRemoveMessageActionOperation = 'PNRemoveMessageActionOperation',
    /**
     * Fetch reactions for specific message REST API operation.
     */
    PNGetMessageActionsOperation = 'PNGetMessageActionsOperation',
    PNTimeOperation = 'PNTimeOperation',
    /**
     * Channel history REST API operation.
     */
    PNHistoryOperation = 'PNHistoryOperation',
    /**
     * Delete messages from channel history REST API operation.
     */
    PNDeleteMessagesOperation = 'PNDeleteMessagesOperation',
    /**
     * History for channels REST API operation.
     */
    PNFetchMessagesOperation = 'PNFetchMessagesOperation',
    /**
     * Number of messages for channels in specified time frame REST API operation.
     */
    PNMessageCounts = 'PNMessageCountsOperation',
    /**
     * Fetch users metadata REST API operation.
     */
    PNGetAllUUIDMetadataOperation = 'PNGetAllUUIDMetadataOperation',
    /**
     * Fetch user metadata REST API operation.
     */
    PNGetUUIDMetadataOperation = 'PNGetUUIDMetadataOperation',
    /**
     * Set user metadata REST API operation.
     */
    PNSetUUIDMetadataOperation = 'PNSetUUIDMetadataOperation',
    /**
     * Remove user metadata REST API operation.
     */
    PNRemoveUUIDMetadataOperation = 'PNRemoveUUIDMetadataOperation',
    /**
     * Fetch channels metadata REST API operation.
     */
    PNGetAllChannelMetadataOperation = 'PNGetAllChannelMetadataOperation',
    /**
     * Fetch channel metadata REST API operation.
     */
    PNGetChannelMetadataOperation = 'PNGetChannelMetadataOperation',
    /**
     * Set channel metadata REST API operation.
     */
    PNSetChannelMetadataOperation = 'PNSetChannelMetadataOperation',
    /**
     * Remove channel metadata REST API operation.
     */
    PNRemoveChannelMetadataOperation = 'PNRemoveChannelMetadataOperation',
    /**
     * Fetch channel members REST API operation.
     */
    PNGetMembersOperation = 'PNGetMembersOperation',
    /**
     * Update channel members REST API operation.
     */
    PNSetMembersOperation = 'PNSetMembersOperation',
    /**
     * Fetch channel memberships REST API operation.
     */
    PNGetMembershipsOperation = 'PNGetMembershipsOperation',
    /**
     * Update channel memberships REST API operation.
     */
    PNSetMembershipsOperation = 'PNSetMembershipsOperation',
    /**
     * Fetch list of files sent to the channel REST API operation.
     */
    PNListFilesOperation = 'PNListFilesOperation',
    /**
     * Retrieve file upload URL REST API operation.
     */
    PNGenerateUploadUrlOperation = 'PNGenerateUploadUrlOperation',
    /**
     * Upload file to the channel REST API operation.
     */
    PNPublishFileOperation = 'PNPublishFileOperation',
    /**
     * Publish File Message to the channel REST API operation.
     */
    PNPublishFileMessageOperation = 'PNPublishFileMessageOperation',
    /**
     * Retrieve file download URL REST API operation.
     */
    PNGetFileUrlOperation = 'PNGetFileUrlOperation',
    /**
     * Download file from the channel REST API operation.
     */
    PNDownloadFileOperation = 'PNDownloadFileOperation',
    /**
     * Delete file sent to the channel REST API operation.
     */
    PNDeleteFileOperation = 'PNDeleteFileOperation',
    /**
     * Register channels with device push notifications REST API operation.
     */
    PNAddPushNotificationEnabledChannelsOperation = 'PNAddPushNotificationEnabledChannelsOperation',
    /**
     * Unregister channels with device push notifications REST API operation.
     */
    PNRemovePushNotificationEnabledChannelsOperation = 'PNRemovePushNotificationEnabledChannelsOperation',
    /**
     * Fetch list of channels with enabled push notifications for device REST API operation.
     */
    PNPushNotificationEnabledChannelsOperation = 'PNPushNotificationEnabledChannelsOperation',
    /**
     * Disable push notifications for device REST API operation.
     */
    PNRemoveAllPushNotificationsOperation = 'PNRemoveAllPushNotificationsOperation',
    /**
     * Fetch channels groups list REST API operation.
     */
    PNChannelGroupsOperation = 'PNChannelGroupsOperation',
    /**
     * Remove specified channel group REST API operation.
     */
    PNRemoveGroupOperation = 'PNRemoveGroupOperation',
    /**
     * Fetch list of channels for the specified channel group REST API operation.
     */
    PNChannelsForGroupOperation = 'PNChannelsForGroupOperation',
    /**
     * Add list of channels to the specified channel group REST API operation.
     */
    PNAddChannelsToGroupOperation = 'PNAddChannelsToGroupOperation',
    /**
     * Remove list of channels from the specified channel group REST API operation.
     */
    PNRemoveChannelsFromGroupOperation = 'PNRemoveChannelsFromGroupOperation',
    /**
     * Generate authorized token REST API operation.
     */
    PNAccessManagerGrant = 'PNAccessManagerGrant',
    /**
     * Generate authorized token REST API operation.
     */
    PNAccessManagerGrantToken = 'PNAccessManagerGrantToken',
    PNAccessManagerAudit = 'PNAccessManagerAudit',
    /**
     * Revoke authorized token REST API operation.
     */
    PNAccessManagerRevokeToken = 'PNAccessManagerRevokeToken',
  }

  /**
   * Request processing status categories.
   */
  export enum StatusCategory {
    /**
     * Call failed when network was unable to complete the call.
     */
    PNNetworkIssuesCategory = 'PNNetworkIssuesCategory',
    /**
     * Network call timed out.
     */
    PNTimeoutCategory = 'PNTimeoutCategory',
    /**
     * Request has been cancelled.
     */
    PNCancelledCategory = 'PNCancelledCategory',
    /**
     * Server responded with bad response.
     */
    PNBadRequestCategory = 'PNBadRequestCategory',
    /**
     * Server responded with access denied.
     */
    PNAccessDeniedCategory = 'PNAccessDeniedCategory',
    /**
     * Incomplete parameters provided for used endpoint.
     */
    PNValidationErrorCategory = 'PNValidationErrorCategory',
    /**
     * PubNub request acknowledgment status.
     *
     * Some API endpoints respond with request processing status w/o useful data.
     */
    PNAcknowledgmentCategory = 'PNAcknowledgmentCategory',
    /**
     * PubNub service or intermediate "actor" returned unexpected response.
     *
     * There can be few sources of unexpected return with success code:
     * - proxy server / VPN;
     * - Wi-Fi hotspot authorization page.
     */
    PNMalformedResponseCategory = 'PNMalformedResponseCategory',
    /**
     * Server can't process request.
     *
     * There can be few sources of unexpected return with success code:
     * - potentially an ongoing incident;
     * - proxy server / VPN.
     */
    PNServerErrorCategory = 'PNServerErrorCategory',
    /**
     * Something strange happened; please check the logs.
     */
    PNUnknownCategory = 'PNUnknownCategory',
    /**
     * SDK will announce when the network appears to be connected again.
     */
    PNNetworkUpCategory = 'PNNetworkUpCategory',
    /**
     * SDK will announce when the network appears to down.
     */
    PNNetworkDownCategory = 'PNNetworkDownCategory',
    /**
     * PubNub client reconnected to the real-time updates stream.
     */
    PNReconnectedCategory = 'PNReconnectedCategory',
    /**
     * PubNub client connected to the real-time updates stream.
     */
    PNConnectedCategory = 'PNConnectedCategory',
    /**
     * Set of active channels and groups has been changed.
     */
    PNSubscriptionChangedCategory = 'PNSubscriptionChangedCategory',
    /**
     * Received real-time updates exceed specified threshold.
     *
     * After temporary disconnection and catchup, this category means that potentially some
     * real-time updates have been pushed into `storage` and need to be requested separately.
     */
    PNRequestMessageCountExceededCategory = 'PNRequestMessageCountExceededCategory',
    /**
     * PubNub client disconnected from the real-time updates streams.
     */
    PNDisconnectedCategory = 'PNDisconnectedCategory',
    /**
     * PubNub client wasn't able to connect to the real-time updates streams.
     */
    PNConnectionErrorCategory = 'PNConnectionErrorCategory',
    /**
     * PubNub client unexpectedly disconnected from the real-time updates streams.
     */
    PNDisconnectedUnexpectedlyCategory = 'PNDisconnectedUnexpectedlyCategory',
    /**
     * SDK will announce when newer shared worker will be 'noticed'.
     */
    PNSharedWorkerUpdatedCategory = 'PNSharedWorkerUpdatedCategory',
  }

  /**
   * PubNub File instance creation parameters.
   */
  export type PubNubFileParameters<StringEncoding extends BufferEncoding = BufferEncoding> = {
    /**
     * Readable stream represents file object content.
     */
    stream?: Readable;
    /**
     * Buffer or string represents file object content.
     */
    data?: Buffer | ArrayBuffer | string;
    /**
     * String {@link PubNubFileParameters#data|data} encoding.
     *
     * @default `utf8`
     */
    encoding?: StringEncoding;
    /**
     * File object name.
     */
    name: string;
    /**
     * File object content type.
     */
    mimeType?: string;
  };

  /**
   * Node.js implementation for {@link PubNub} File object.
   *
   * **Important:** Class should implement constructor and class fields from {@link PubNubFileConstructor}.
   */
  export class PubNubFile implements PubNubFileInterface {
    /**
     * Whether {@link Blob} data supported by platform or not.
     */
    static supportsBlob: boolean;
    /**
     * Whether {@link File} data supported by platform or not.
     */
    static supportsFile: boolean;
    /**
     * Whether {@link Buffer} data supported by platform or not.
     */
    static supportsBuffer: boolean;
    /**
     * Whether {@link Stream} data supported by platform or not.
     */
    static supportsStream: boolean;
    /**
     * Whether {@link String} data supported by platform or not.
     */
    static supportsString: boolean;
    /**
     * Whether {@link ArrayBuffer} supported by platform or not.
     */
    static supportsArrayBuffer: boolean;
    /**
     * Whether {@link PubNub} File object encryption supported or not.
     */
    static supportsEncryptFile: boolean;
    /**
     * Whether `File Uri` data supported by platform or not.
     */
    static supportsFileUri: boolean;
    /**
     * File object content source.
     */
    readonly data: Readable | Buffer;
    /**
     * File object content length.
     */
    contentLength?: number;
    /**
     * File object content type.
     */
    mimeType: string;
    /**
     * File object name.
     */
    name: string;
    static create(file: PubNubFileParameters): PubNubFile;
    constructor(file: PubNubFileParameters);
    /**
     * Convert {@link PubNub} File object content to {@link Buffer}.
     *
     * @returns Asynchronous results of conversion to the {@link Buffer}.
     */
    toBuffer(): Promise<Buffer>;
    /**
     * Convert {@link PubNub} File object content to {@link ArrayBuffer}.
     *
     * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
     */
    toArrayBuffer(): Promise<ArrayBuffer>;
    /**
     * Convert {@link PubNub} File object content to {@link string}.
     *
     * @returns Asynchronous results of conversion to the {@link string}.
     */
    toString(encoding?: BufferEncoding): Promise<string>;
    /**
     * Convert {@link PubNub} File object content to {@link Readable} stream.
     *
     * @returns Asynchronous results of conversion to the {@link Readable} stream.
     */
    toStream(): Promise<Readable>;
    /**
     * Convert {@link PubNub} File object content to {@link File}.
     *
     * @throws Error because {@link File} not available in Node.js environment.
     */
    toFile(): Promise<void>;
    /**
     * Convert {@link PubNub} File object content to file `Uri`.
     *
     * @throws Error because file `Uri` not available in Node.js environment.
     */
    toFileUri(): Promise<Record<string, unknown>>;
    /**
     * Convert {@link PubNub} File object content to {@link Blob}.
     *
     * @throws Error because {@link Blob} not available in Node.js environment.
     */
    toBlob(): Promise<void>;
  }

  /**
   * Data encrypted by {@link NodeCryptoModule}.
   */
  export type EncryptedDataType = {
    /**
     * Encrypted data.
     */
    data: Buffer | string;
    /**
     * Used cryptor's metadata.
     */
    metadata: Buffer | null;
  };

  /**
   * {@link Readable} stream encrypted by {@link NodeCryptoModule}.
   */
  export type EncryptedStream = {
    /**
     * Stream with encrypted content.
     */
    stream: NodeJS.ReadableStream;
    /**
     * Length of encrypted data in {@link Readable} stream.
     */
    metadataLength: number;
    /**
     * Used cryptor's metadata.
     */
    metadata?: Buffer | undefined;
  };

  /**
   * Cryptor algorithm interface.
   */
  export interface ICryptor {
    /**
     * Cryptor unique identifier.
     *
     * @returns Cryptor identifier.
     */
    get identifier(): string;
    /**
     * Encrypt provided source data.
     *
     * @param data - Source data for encryption.
     *
     * @returns Encrypted data object.
     *
     * @throws Error if unknown data type has been passed.
     */
    encrypt(data: BufferSource | string): EncryptedDataType;
    /**
     * Encrypt provided source {@link Readable} stream.
     *
     * @param stream - Stream for encryption.
     *
     * @returns Encrypted stream object.
     *
     * @throws Error if unknown data type has been passed.
     */
    encryptStream(stream: NodeJS.ReadableStream): Promise<EncryptedStream>;
    /**
     * Decrypt provided encrypted data object.
     *
     * @param data - Encrypted data object for decryption.
     *
     * @returns Decrypted data.
     *
     * @throws Error if unknown data type has been passed.
     */
    decrypt(data: EncryptedDataType): ArrayBuffer;
    /**
     * Decrypt provided encrypted stream object.
     *
     * @param stream - Encrypted stream object for decryption.
     *
     * @returns Decrypted data as {@link Readable} stream.
     *
     * @throws Error if unknown data type has been passed.
     */
    decryptStream(stream: EncryptedStream): Promise<NodeJS.ReadableStream>;
  }

  /**
   * Legacy cryptor algorithm interface.
   */
  export interface ILegacyCryptor {
    /**
     * Cryptor unique identifier.
     */
    get identifier(): string;
    /**
     * Encrypt provided source data.
     *
     * @param data - Source data for encryption.
     *
     * @returns Encrypted data object.
     *
     * @throws Error if unknown data type has been passed.
     */
    encrypt(data: string): EncryptedDataType;
    /**
     * Encrypt provided source {@link PubNub} File object.
     *
     * @param file - Source {@link PubNub} File object for encryption.
     * @param File - Class constructor for {@link PubNub} File object.
     *
     * @returns Encrypted data as {@link PubNub} File object.
     *
     * @throws Error if file is empty or contains unsupported data type.
     * @throws Error if cipher key not set.
     */
    encryptFile(
      file: PubNubFile,
      File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
    ): Promise<PubNubFile | undefined>;
    /**
     * Decrypt provided encrypted data object.
     *
     * @param data - Encrypted data object for decryption.
     *
     * @returns Decrypted data.
     *
     * @throws Error if unknown data type has been passed.
     */
    decrypt(data: EncryptedDataType): Payload | null;
    /**
     * Decrypt provided encrypted {@link PubNub} File object.
     *
     * @param file - Encrypted {@link PubNub} File object for decryption.
     * @param File - Class constructor for {@link PubNub} File object.
     *
     * @returns Decrypted data as {@link PubNub} File object.
     *
     * @throws Error if file is empty or contains unsupported data type.
     * @throws Error if cipher key not set.
     */
    decryptFile(
      file: PubNubFile,
      File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
    ): Promise<PubNubFile | undefined>;
  }

  /**
   * NodeJS platform PubNub client configuration.
   */
  export type PubNubConfiguration = UserConfiguration & {
    /**
     * Set a custom parameters for setting your connection `keepAlive` if this is set to `true`.
     */
    keepAliveSettings?: TransportKeepAlive;
    /**
     * The cryptography module used for encryption and decryption of messages and files. Takes the
     * {@link cipherKey} and {@link useRandomIVs} parameters as arguments.
     *
     * For more information, refer to the
     * {@link /docs/sdks/javascript/api-reference/configuration#cryptomodule|cryptoModule} section.
     *
     * @default `not set`
     */
    cryptoModule?: ICryptoModule;
    /**
     * If passed, will encrypt the payloads.
     *
     * @deprecated Pass it to {@link cryptoModule} instead.
     */
    cipherKey?: string;
    /**
     * When `true` the initialization vector (IV) is random for all requests (not just for file
     * upload).
     * When `false` the IV is hard-coded for all requests except for file upload.
     *
     * @default `true`
     *
     * @deprecated Pass it to {@link cryptoModule} instead.
     */
    useRandomIVs?: boolean;
    /**
     * Custom data encryption method.
     *
     * @deprecated Instead use {@link cryptoModule} for data encryption.
     */
    customEncrypt?: (data: string | Payload) => string;
    /**
     * Custom data decryption method.
     *
     * @deprecated Instead use {@link cryptoModule} for data decryption.
     */
    customDecrypt?: (data: string) => string;
  };

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
     *
     * @deprecated Use {@link UserConfiguration.logLevel logLevel} and {@link UserConfiguration.loggers loggers} instead.
     */
    logVerbosity?: boolean;
    /**
     * Minimum messages log level which should be passed to the logger.
     */
    logLevel?: LogLevel;
    /**
     * List of additional custom {@link Logger loggers} to which logged messages will be passed.
     */
    loggers?: Logger[];
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
     * How often the client will announce itself to server. The value is in seconds.
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
     * File upload / download request timeout in milliseconds.
     *
     * Maximum duration for which PubNub client should wait for file upload / download request
     * completion.
     *
     * @default `300` seconds
     */
    fileRequestTimeout?: number;
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
     * Whether heartbeat should be postponed on successful subscribe response.
     *
     * With implicit heartbeat each successful `subscribe` loop response is treated as `heartbeat`
     * and there is no need to send another explicit heartbeat earlier than `heartbeatInterval`
     * since moment of `subscribe` response.
     *
     * **Note:** With disabled implicit heartbeat this feature may cause `timeout` if there is
     * constant activity on subscribed channels / groups.
     *
     * @default `true`
     */
    useSmartHeartbeat?: boolean;
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

  /**
   * List of known endpoint groups (by context).
   */
  export enum Endpoint {
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

  /**
   * Failed request retry policy.
   */
  export class RetryPolicy {
    static None(): RequestRetryPolicy;
    static LinearRetryPolicy(
      configuration: LinearRetryPolicyConfiguration,
    ): RequestRetryPolicy & LinearRetryPolicyConfiguration;
    static ExponentialRetryPolicy(
      configuration: ExponentialRetryPolicyConfiguration,
    ): RequestRetryPolicy & ExponentialRetryPolicyConfiguration;
  }

  /**
   * Represents a transport response from a service.
   */
  export type TransportResponse = {
    /**
     * Full remote resource URL used to retrieve response.
     */
    url: string;
    /**
     * Service response status code.
     */
    status: number;
    /**
     * Service response headers.
     *
     * **Important:** Header names are in lowercase.
     */
    headers: Record<string, string>;
    /**
     * Service response body.
     */
    body?: ArrayBuffer;
  };

  /**
   * Enum representing possible transport methods for HTTP requests.
   *
   * @enum {number}
   */
  export enum TransportMethod {
    /**
     * Request will be sent using `GET` method.
     */
    GET = 'GET',
    /**
     * Request will be sent using `POST` method.
     */
    POST = 'POST',
    /**
     * Request will be sent using `PATCH` method.
     */
    PATCH = 'PATCH',
    /**
     * Request will be sent using `DELETE` method.
     */
    DELETE = 'DELETE',
    /**
     * Local request.
     *
     * Request won't be sent to the service and probably used to compute URL.
     */
    LOCAL = 'LOCAL',
  }

  /**
   * Request cancellation controller.
   */
  export type CancellationController = {
    /**
     * Request cancellation / abort function.
     */
    abort: (reason?: string) => void;
  };

  /**
   * This object represents a request to be sent to the PubNub API.
   *
   * This struct represents a request to be sent to the PubNub API. It is used by the transport
   * provider which implements {@link Transport} interface.
   *
   * All fields are representing certain parts of the request that can be used to prepare one.
   */
  export type TransportRequest = {
    /**
     * Remote host name.
     */
    origin?: string;
    /**
     * Remote resource path.
     */
    path: string;
    /**
     * Query parameters to be sent with the request.
     */
    queryParameters?: Query;
    /**
     * Transport request HTTP method.
     */
    method: TransportMethod;
    /**
     * Headers to be sent with the request.
     */
    headers?: Record<string, string>;
    /**
     * Multipart form data fields.
     *
     * **Important:** `Content-Type` header should be sent the {@link body} data type when
     * `multipart/form-data` should request should be sent.
     */
    formData?: Record<string, string>[];
    /**
     * Body to be sent with the request.
     */
    body?: ArrayBuffer | PubNubFileInterface | string;
    /**
     * For how long (in seconds) request should wait response from the server.
     *
     * @default `10` seconds.
     */
    timeout: number;
    /**
     * Whether request can be cancelled or not.
     *
     * @default `false`.
     */
    cancellable: boolean;
    /**
     * Whether `POST` body should be compressed or not.
     */
    compressible: boolean;
    /**
     * Unique request identifier.
     */
    identifier: string;
  };

  /**
   * Enum with available log levels.
   */
  export enum LogLevel {
    /**
     * Used to notify about every last detail:
     * - function calls,
     * - full payloads,
     * - internal variables,
     * - state-machine hops.
     */
    Trace = 0,
    /**
     * Used to notify about broad strokes of your SDK’s logic:
     * - inputs/outputs to public methods,
     * - network request
     * - network response
     * - decision branches.
     */
    Debug = 1,
    /**
     * Used to notify summary of what the SDK is doing under the hood:
     * - initialized,
     * - connected,
     * - entity created.
     */
    Info = 2,
    /**
     * Used to notify about non-fatal events:
     * - deprecations,
     * - request retries.
     */
    Warn = 3,
    /**
     * Used to notify about:
     * - exceptions,
     * - HTTP failures,
     * - invalid states.
     */
    Error = 4,
    /**
     * Logging disabled.
     */
    None = 5,
  }

  /** Re-export aliased type. */
  export { LogLevel as LoggerLogLevel };

  /**
   * Stringified log levels presentation.
   */
  export type LogLevelString = Exclude<Lowercase<keyof typeof LogLevel>, 'none'>;

  /**
   * Basic content of a logged message.
   */
  export type BaseLogMessage = {
    /**
     * Date and time when the log message has been generated.
     */
    timestamp: Date;
    /**
     * Unique identifier of the PubNub client instance which generated the log message.
     */
    pubNubId: string;
    /**
     * Target log message level.
     */
    level: LogLevel;
    /**
     * Minimum log level which can be notified by {@link LoggerManager}.
     *
     * **Note:** This information can be used by {@link Logger logger} implementation show more information from a log
     * message.
     */
    minimumLevel: LogLevel;
    /**
     * The call site from which a log message has been sent.
     */
    location?: string;
  };

  /**
   * Plain text log message type.
   *
   * This type contains a pre-processed message.
   */
  export type TextLogMessage = BaseLogMessage & {
    /**
     * Data type which `message` represents.
     */
    messageType: 'text';
    /**
     * Textual message which has been logged.
     */
    message: string;
  };

  /**
   * Dictionary log message type.
   *
   * This type contains a dictionary which should be serialized for output.
   */
  export type ObjectLogMessage = BaseLogMessage & {
    /**
     * Data type which `message` represents.
     */
    messageType: 'object';
    /**
     * Object which has been logged.
     */
    message: Record<string, unknown> | unknown[] | unknown;
    /**
     * Additional details which describe data in a provided object.
     *
     * **Note:** Will usually be used to prepend serialized dictionary if provided.
     */
    details?: string;
    /**
     * List of keys which should be filtered from a serialized object.
     */
    ignoredKeys?: string[] | ((key: string, object: Record<string, unknown>) => boolean);
  };

  /**
   * Error log message type.
   *
   * This type contains an error type.
   */
  export type ErrorLogMessage = BaseLogMessage & {
    /**
     * Data type which `message` represents.
     */
    messageType: 'error';
    /**
     * Error with information about an exception or validation error.
     */
    message: PubNubError;
  };

  /**
   * Network request message type.
   *
   * This type contains a type that represents data to be sent using the transport layer.
   */
  export type NetworkRequestLogMessage = BaseLogMessage & {
    /**
     * Data type which `message` represents.
     */
    messageType: 'network-request';
    /**
     * Object which is used to construct a transport-specific request object.
     */
    message: TransportRequest;
    /**
     * Additional information which can be useful when {@link NetworkRequestLogMessage.canceled canceled} is set to
     * `true`.
     */
    details?: string;
    /**
     * Whether the request has been canceled or not.
     */
    canceled?: boolean;
    /**
     * Whether the request processing failed or not.
     */
    failed?: boolean;
  };

  /**
   * Network response message type.
   *
   * This type contains a type that represents a service response for a previously sent request.
   */
  export type NetworkResponseLogMessage = BaseLogMessage & {
    /**
     * Data type which `message` represents.
     */
    messageType: 'network-response';
    /**
     * Object with data received from a transport-specific response object.
     */
    message: TransportResponse;
  };

  /**
   * Logged message type.
   */
  export type LogMessage =
    | TextLogMessage
    | ObjectLogMessage
    | ErrorLogMessage
    | NetworkRequestLogMessage
    | NetworkResponseLogMessage;

  /**
   * This interface is used by {@link LoggerManager logger manager} to handle log messages.
   *
   * You can implement this interface for your own needs or use built-in {@link ConsoleLogger console} logger.
   *
   * **Important:** Function that corresponds to the logged message level will be called only if
   * {@link LoggerManager logger manager} configured to use high enough log level.
   */
  export interface Logger {
    /**
     * Process a `trace` level message.
     *
     * @param message - Message which should be handled by custom logger implementation.
     */
    trace(message: LogMessage): void;
    /**
     * Process a `debug` level message.
     *
     * @param message - Message which should be handled by custom logger implementation.
     */
    debug(message: LogMessage): void;
    /**
     * Process an `info` level message.
     *
     * @param message - Message which should be handled by custom logger implementation.
     */
    info(message: LogMessage): void;
    /**
     * Process a `warn` level message.
     *
     * @param message - Message which should be handled by custom logger implementation.
     */
    warn(message: LogMessage): void;
    /**
     * Process an `error` level message.
     *
     * @param message - Message which should be handled by custom logger implementation.
     */
    error(message: LogMessage): void;
  }

  /**
   * PubNub operation error.
   *
   * When an operation can't be performed or there is an error from the server, this object will be returned.
   */
  export class PubNubError extends Error {
    status?: Status | undefined;
  }

  /**
   * Represents the configuration options for keeping the transport connection alive.
   */
  export type TransportKeepAlive = {
    /**
     * The time interval in milliseconds for keeping the connection alive.
     *
     * @default 1000
     */
    keepAliveMsecs?: number;
    /**
     * The maximum number of sockets allowed per host.
     *
     * @default Infinity
     */
    maxSockets?: number;
    /**
     * The maximum number of open and free sockets in the pool per host.
     *
     * @default 256
     */
    maxFreeSockets?: number;
    /**
     * Timeout in milliseconds, after which the `idle` socket will be closed.
     *
     * @default 30000
     */
    timeout?: number;
  };

  /**
   * This interface is used to send requests to the PubNub API.
   *
   * You can implement this interface for your types or use one of the provided modules to use a
   * transport library.
   *
   * @interface
   */
  export interface Transport {
    /**
     * Make request sendable.
     *
     * @param req - The transport request to be processed.
     *
     * @returns - A promise that resolves to a transport response and request cancellation
     * controller (if required).
     */
    makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined];
    /**
     * Pre-processed request.
     *
     * Transport implementation may pre-process original transport requests before making
     * platform-specific request objects from it.
     *
     * @param req - Transport request provided by the PubNub client.
     *
     * @returns Transport request with updated properties (if it was required).
     */
    request(req: TransportRequest): TransportRequest;
  }

  /**
   * Real-time events' listener.
   */
  export type Listener = {
    /**
     * Real-time message events listener.
     *
     * @param message - Received message.
     */
    message?: (message: Subscription.Message) => void;
    /**
     * Real-time message signal listener.
     *
     * @param signal - Received signal.
     */
    signal?: (signal: Subscription.Signal) => void;
    /**
     * Real-time presence change events listener.
     *
     * @param presence - Received presence chane information.
     */
    presence?: (presence: Subscription.Presence) => void;
    /**
     * Real-time App Context Objects change events listener.
     *
     * @param object - Changed App Context Object information.
     */
    objects?: (object: Subscription.AppContextObject) => void;
    /**
     * Real-time message actions events listener.
     *
     * @param action - Message action information.
     */
    messageAction?: (action: Subscription.MessageAction) => void;
    /**
     * Real-time file share events listener.
     *
     * @param file - Shared file information.
     */
    file?: (file: Subscription.File) => void;
    /**
     * Real-time PubNub client status change event.
     *
     * @param status - PubNub client status information
     */
    status?: (status: Status | StatusEvent) => void;
    /**
     * Real-time User App Context Objects change events listener.
     *
     * @param user - User App Context Object information.
     *
     * @deprecated Use {@link objects} listener callback instead.
     */
    user?: (user: Subscription.UserAppContextObject) => void;
    /**
     * Real-time Space App Context Objects change events listener.
     *
     * @param space - Space App Context Object information.
     *
     * @deprecated Use {@link objects} listener callback instead.
     */
    space?: (space: Subscription.SpaceAppContextObject) => void;
    /**
     * Real-time VSP Membership App Context Objects change events listener.
     *
     * @param membership - VSP Membership App Context Object information.
     *
     * @deprecated Use {@link objects} listener callback instead.
     */
    membership?: (membership: Subscription.VSPMembershipAppContextObject) => void;
  };

  /**
   * PubNub-defined event types by payload.
   */
  export enum PubNubEventType {
    /**
     * Presence change event.
     */
    Presence = -2,
    /**
     * Regular message event.
     *
     * **Note:** This is default type assigned for non-presence events if `e` field is missing.
     */
    Message = -1,
    /**
     * Signal data event.
     */
    Signal = 1,
    /**
     * App Context object event.
     */
    AppContext = 2,
    /**
     * Message reaction event.
     */
    MessageAction = 3,
    /**
     * Files event.
     */
    Files = 4,
  }

  /**
   * Periodical presence change service response.
   */
  type PresenceIntervalData = {
    /**
     * Periodical subscribed channels and groups presence change announcement.
     */
    action: 'interval';
    /**
     * Unix timestamp when presence event has been triggered.
     */
    timestamp: number;
    /**
     * The current occupancy after the presence change is updated.
     */
    occupancy: number;
    /**
     * The list of unique user identifiers that `joined` the channel since the last interval
     * presence update.
     */
    join?: string[];
    /**
     * The list of unique user identifiers that `left` the channel since the last interval
     * presence update.
     */
    leave?: string[];
    /**
     * The list of unique user identifiers that `timeout` the channel since the last interval
     * presence update.
     */
    timeout?: string[];
    /**
     * Indicates whether presence should be requested manually using {@link PubNubCore.hereNow hereNow()}
     * or not.
     *
     * Depending on from the presence activity, the resulting interval update can be too large to be
     * returned as a presence event with subscribe REST API response. The server will set this flag to
     * `true` in this case.
     */
    hereNowRefresh: boolean;
  };

  /**
   * Subscribed user presence information change service response.
   */
  type PresenceChangeData = {
    /**
     * Change if user's presence.
     *
     * User's presence may change between: `join`, `leave` and `timeout`.
     */
    action: 'join' | 'leave' | 'timeout';
    /**
     * Unix timestamp when presence event has been triggered.
     */
    timestamp: number;
    /**
     * Unique identification of the user for whom presence information changed.
     */
    uuid: string;
    /**
     * The current occupancy after the presence change is updated.
     */
    occupancy: number;
    /**
     * The user's state associated with the channel has been updated.
     *
     * @deprecated Use set state methods to specify associated user's data instead of passing to
     * subscribe.
     */
    data?: {
      [p: string]: Payload;
    };
  };

  /**
   * Associated user presence state change service response.
   */
  type PresenceStateChangeData = {
    /**
     * Subscribed user associated presence state change.
     */
    action: 'state-change';
    /**
     * Unix timestamp when presence event has been triggered.
     */
    timestamp: number;
    /**
     * Unique identification of the user for whom associated presence state has been changed.
     */
    uuid: string;
    /**
     * The user's state associated with the channel has been updated.
     */
    state: {
      [p: string]: Payload;
    };
  };

  /**
   * Channel presence service response.
   */
  export type PresenceData = PresenceIntervalData | PresenceChangeData | PresenceStateChangeData;

  /**
   * Message reaction change service response.
   */
  export type MessageActionData = {
    /**
     * The type of event that happened during the message action update.
     *
     * Possible values are:
     * - `added` - action has been added to the message
     * - `removed` - action has been removed from message
     */
    event: 'added' | 'removed';
    /**
     * Information about message action for which update has been generated.
     */
    data: {
      /**
       * Timetoken of message for which action has been added / removed.
       */
      messageTimetoken: string;
      /**
       * Timetoken of message action which has been added / removed.
       */
      actionTimetoken: string;
      /**
       * Message action type.
       */
      type: string;
      /**
       * Value associated with message action {@link type}.
       */
      value: string;
    };
    /**
     * Name of service which generated update for message action.
     */
    source: string;
    /**
     * Version of service which generated update for message action.
     */
    version: string;
  };

  /**
   * VSP Objects change events.
   */
  type AppContextVSPEvents = 'updated' | 'removed';

  /**
   * App Context Objects change events.
   */
  type AppContextEvents = 'set' | 'delete';

  /**
   * Common real-time App Context Object service response.
   */
  type ObjectData<Event extends string, Type extends string, AppContextObject> = {
    /**
     * The type of event that happened during the object update.
     */
    event: Event;
    /**
     * App Context object type.
     */
    type: Type;
    /**
     * App Context object information.
     *
     * App Context object can be one of:
     * - `channel` / `space`
     * - `uuid` / `user`
     * - `membership`
     */
    data: AppContextObject;
    /**
     * Name of service which generated update for object.
     */
    source: string;
    /**
     * Version of service which generated update for object.
     */
    version: string;
  };

  /**
   * `Channel` object change real-time service response.
   */
  type ChannelObjectData = ObjectData<
    AppContextEvents,
    'channel',
    AppContext.ChannelMetadataObject<AppContext.CustomData>
  >;

  /**
   * `Space` object change real-time service response.
   */
  export type SpaceObjectData = ObjectData<
    AppContextVSPEvents,
    'space',
    AppContext.ChannelMetadataObject<AppContext.CustomData>
  >;

  /**
   * `Uuid` object change real-time service response.
   */
  type UuidObjectData = ObjectData<AppContextEvents, 'uuid', AppContext.UUIDMetadataObject<AppContext.CustomData>>;

  /**
   * `User` object change real-time service response.
   */
  export type UserObjectData = ObjectData<
    AppContextVSPEvents,
    'user',
    AppContext.UUIDMetadataObject<AppContext.CustomData>
  >;

  /**
   * `Membership` object change real-time service response.
   */
  type MembershipObjectData = ObjectData<
    AppContextEvents,
    'membership',
    Omit<AppContext.ObjectData<AppContext.CustomData>, 'id'> & {
      /**
       * User membership status.
       */
      status?: string;
      /**
       * User membership type.
       */
      type?: string;
      /**
       * `Uuid` object which has been used to create relationship with `channel`.
       */
      uuid: {
        /**
         * Unique `user` object identifier.
         */
        id: string;
      };
      /**
       * `Channel` object which has been used to create relationship with `uuid`.
       */
      channel: {
        /**
         * Unique `channel` object identifier.
         */
        id: string;
      };
    }
  >;

  /**
   * VSP `Membership` object change real-time service response.
   */
  export type VSPMembershipObjectData = ObjectData<
    AppContextVSPEvents,
    'membership',
    Omit<AppContext.ObjectData<AppContext.CustomData>, 'id'> & {
      /**
       * `User` object which has been used to create relationship with `space`.
       */
      user: {
        /**
         * Unique `user` object identifier.
         */
        id: string;
      };
      /**
       * `Space` object which has been used to create relationship with `user`.
       */
      space: {
        /**
         * Unique `channel` object identifier.
         */
        id: string;
      };
    }
  >;

  /**
   * App Context service response.
   */
  export type AppContextObjectData = ChannelObjectData | UuidObjectData | MembershipObjectData;

  /**
   * File service response.
   */
  export type FileData = {
    /**
     * Message which has been associated with uploaded file.
     */
    message?: Payload;
    /**
     * Information about uploaded file.
     */
    file: {
      /**
       * Unique identifier of uploaded file.
       */
      id: string;
      /**
       * Actual name with which file has been stored.
       */
      name: string;
    };
  };

  /**
   * Payload for `pn_apns` field in published message.
   */
  type APNSPayload = {
    /**
     * Payload for Apple Push Notification Service.
     */
    aps: {
      /**
       * Configuration of visual notification representation.
       */
      alert?: {
        /**
         * First line title.
         *
         * Title which is shown in bold on the first line of notification bubble.
         */
        title?: string;
        /**
         * Second line title.
         *
         * Subtitle which is shown under main title with smaller font.
         */
        subtitle?: string;
        /**
         * Notification body.
         *
         * Body which is shown to the user after interaction with notification.
         */
        body?: string;
      };
      /**
       * Unread notifications count badge value.
       */
      badge?: number | null;
      /**
       * Name of the file from resource bundle which should be played when notification received.
       */
      sound?: string;
      /**
       * Silent notification flag.
       */
      'content-available'?: 1;
    };
    /**
     * APNS2 payload recipients information.
     */
    pn_push: PubNubAPNS2Configuration[];
  };

  /**
   * APNS2 configuration type.
   */
  type APNS2Configuration = {
    /**
     * Notification group / collapse identifier. Value will be used in APNS POST request as `apns-collapse-id` header
     * value.
     */
    collapseId?: string;
    /**
     * Date till which APNS will try to deliver notification to target device. Value will be used in APNS POST request as
     * `apns-expiration` header value.
     */
    expirationDate?: Date;
    /**
     * List of topics which should receive this notification.
     */
    targets: APNS2Target[];
  };

  /**
   * Preformatted for PubNub service `APNS2` configuration type.
   */
  type PubNubAPNS2Configuration = {
    /**
     * PubNub service authentication method for APNS.
     */
    auth_method: 'token';
    /**
     * Target entities which should receive notification.
     */
    targets: PubNubAPNS2Target[];
    /**
     * Notifications group collapse identifier.
     */
    collapse_id?: string;
    /**
     * Notification receive expiration date.
     *
     * Date after which notification won't be delivered.
     */
    expiration?: string;
    /**
     * APNS protocol version.
     */
    version: 'v2';
  };

  /**
   * APNS2 configuration target type.
   */
  type APNS2Target = {
    /**
     * Notifications topic name (usually it is bundle identifier of application for Apple platform).
     *
     * **Important:** Required only if `pushGateway` is set to `apns2`.
     */
    topic: string;
    /**
     * Environment within which registered devices to which notifications should be delivered.
     *
     * Available:
     * - `development`
     * - `production`
     *
     * @default `development`
     */
    environment?: 'development' | 'production';
    /**
     * List of devices (their push tokens) to which this notification shouldn't be delivered.
     */
    excludedDevices?: string[];
  };

  /**
   * Preformatted for PubNub service `APNS2` configuration target type.
   */
  type PubNubAPNS2Target = Omit<APNS2Target, 'excludedDevices'> & {
    /**
     * List of devices (their push tokens) to which this notification shouldn't be delivered.
     */
    excluded_devices?: string[];
  };

  /**
   * Payload for `pn_fcm` field in published message.
   */
  type FCMPayload = {
    /**
     * Configuration of visual notification representation.
     */
    notification?: {
      /**
       * First line title.
       *
       * Title which is shown in bold on the first line of notification bubble.
       */
      title?: string;
      /**
       * Notification body.
       *
       * Body which is shown to the user after interaction with notification.
       */
      body?: string;
      /**
       * Name of the icon file from resource bundle which should be shown on notification.
       */
      icon?: string;
      /**
       * Name of the file from resource bundle which should be played when notification received.
       */
      sound?: string;
      tag?: string;
    };
    /**
     * Configuration of data notification.
     *
     * Silent notification configuration.
     */
    data?: {
      notification?: FCMPayload['notification'];
    };
  };

  /**
   * Base notification payload object.
   */
  class BaseNotificationPayload {
    /**
     * Retrieve resulting notification payload content for message.
     *
     * @returns Preformatted push notification payload data.
     */
    get payload(): unknown;
    /**
     * Update notification title.
     *
     * @param value - New notification title.
     */
    set title(value: string | undefined);
    /**
     * Update notification subtitle.
     *
     * @param value - New second-line notification title.
     */
    set subtitle(value: string | undefined);
    /**
     * Update notification body.
     *
     * @param value - Update main notification message (shown when expanded).
     */
    set body(value: string | undefined);
    /**
     * Update application badge number.
     *
     * @param value - Number which should be shown in application badge upon receiving notification.
     */
    set badge(value: number | null | undefined);
    /**
     * Update notification sound.
     *
     * @param value - Name of the sound file which should be played upon notification receive.
     */
    set sound(value: string | undefined);
  }

  /**
   * Message payload for Apple Push Notification Service.
   */
  export class APNSNotificationPayload extends BaseNotificationPayload {
    get payload(): APNSPayload;
    /**
     * Update notification receivers configuration.
     *
     * @param value - New APNS2 configurations.
     */
    set configurations(value: APNS2Configuration[]);
    /**
     * Notification payload.
     *
     * @returns Platform-specific part of PubNub notification payload.
     */
    get notification(): {
      /**
       * Configuration of visual notification representation.
       */
      alert?: {
        /**
         * First line title.
         *
         * Title which is shown in bold on the first line of notification bubble.
         */
        title?: string;
        /**
         * Second line title.
         *
         * Subtitle which is shown under main title with smaller font.
         */
        subtitle?: string;
        /**
         * Notification body.
         *
         * Body which is shown to the user after interaction with notification.
         */
        body?: string;
      };
      /**
       * Unread notifications count badge value.
       */
      badge?: number | null;
      /**
       * Name of the file from resource bundle which should be played when notification received.
       */
      sound?: string;
      /**
       * Silent notification flag.
       */
      'content-available'?: 1;
    };
    /**
     * Notification title.
     *
     * @returns Main notification title.
     */
    get title(): string | undefined;
    /**
     * Update notification title.
     *
     * @param value - New notification title.
     */
    set title(value: string | undefined);
    /**
     * Notification subtitle.
     *
     * @returns Second-line notification title.
     */
    get subtitle(): string | undefined;
    /**
     * Update notification subtitle.
     *
     * @param value - New second-line notification title.
     */
    set subtitle(value: string | undefined);
    /**
     * Notification body.
     *
     * @returns Main notification message (shown when expanded).
     */
    get body(): string | undefined;
    /**
     * Update notification body.
     *
     * @param value - Update main notification message (shown when expanded).
     */
    set body(value: string | undefined);
    /**
     * Retrieve unread notifications number.
     *
     * @returns Number of unread notifications which should be shown on application badge.
     */
    get badge(): number | null | undefined;
    /**
     * Update application badge number.
     *
     * @param value - Number which should be shown in application badge upon receiving notification.
     */
    set badge(value: number | null | undefined);
    /**
     * Retrieve notification sound file.
     *
     * @returns Notification sound file name from resource bundle.
     */
    get sound(): string | undefined;
    /**
     * Update notification sound.
     *
     * @param value - Name of the sound file which should be played upon notification receive.
     */
    set sound(value: string | undefined);
    /**
     * Set whether notification should be silent or not.
     *
     * `content-available` notification type will be used to deliver silent notification if set to `true`.
     *
     * @param value - Whether notification should be sent as silent or not.
     */
    set silent(value: boolean);
  }

  /**
   * Message payload for Firebase Cloud Messaging service.
   */
  export class FCMNotificationPayload extends BaseNotificationPayload {
    get payload(): FCMPayload;
    /**
     * Notification payload.
     *
     * @returns Platform-specific part of PubNub notification payload.
     */
    get notification():
      | {
          /**
           * First line title.
           *
           * Title which is shown in bold on the first line of notification bubble.
           */
          title?: string;
          /**
           * Notification body.
           *
           * Body which is shown to the user after interaction with notification.
           */
          body?: string;
          /**
           * Name of the icon file from resource bundle which should be shown on notification.
           */
          icon?: string;
          /**
           * Name of the file from resource bundle which should be played when notification received.
           */
          sound?: string;
          tag?: string;
        }
      | undefined;
    /**
     * Silent notification payload.
     *
     * @returns Silent notification payload (data notification).
     */
    get data():
      | {
          notification?: FCMPayload['notification'];
        }
      | undefined;
    /**
     * Notification title.
     *
     * @returns Main notification title.
     */
    get title(): string | undefined;
    /**
     * Update notification title.
     *
     * @param value - New notification title.
     */
    set title(value: string | undefined);
    /**
     * Notification body.
     *
     * @returns Main notification message (shown when expanded).
     */
    get body(): string | undefined;
    /**
     * Update notification body.
     *
     * @param value - Update main notification message (shown when expanded).
     */
    set body(value: string | undefined);
    /**
     * Retrieve notification sound file.
     *
     * @returns Notification sound file name from resource bundle.
     */
    get sound(): string | undefined;
    /**
     * Update notification sound.
     *
     * @param value - Name of the sound file which should be played upon notification receive.
     */
    set sound(value: string | undefined);
    /**
     * Retrieve notification icon file.
     *
     * @returns Notification icon file name from resource bundle.
     */
    get icon(): string | undefined;
    /**
     * Update notification icon.
     *
     * @param value - Name of the icon file which should be shown on notification.
     */
    set icon(value: string | undefined);
    /**
     * Retrieve notifications grouping tag.
     *
     * @returns Notifications grouping tag.
     */
    get tag(): string | undefined;
    /**
     * Update notifications grouping tag.
     *
     * @param value - String which will be used to group similar notifications in notification center.
     */
    set tag(value: string | undefined);
    /**
     * Set whether notification should be silent or not.
     *
     * All notification data will be sent under `data` field if set to `true`.
     *
     * @param value - Whether notification should be sent as silent or not.
     */
    set silent(value: boolean);
  }

  export class NotificationsPayload {
    /**
     * APNS-specific message payload.
     */
    apns: APNSNotificationPayload;
    /**
     * FCM-specific message payload.
     */
    fcm: FCMNotificationPayload;
    /**
     * Enable or disable push notification debugging message.
     *
     * @param value - Whether debug message from push notification scheduler should be published to the specific
     * channel or not.
     */
    set debugging(value: boolean);
    /**
     * Notification title.
     *
     * @returns Main notification title.
     */
    get title(): string;
    /**
     * Notification subtitle.
     *
     * @returns Second-line notification title.
     */
    get subtitle(): string | undefined;
    /**
     * Update notification subtitle.
     *
     * @param value - New second-line notification title.
     */
    set subtitle(value: string | undefined);
    /**
     * Notification body.
     *
     * @returns Main notification message (shown when expanded).
     */
    get body(): string;
    /**
     * Retrieve unread notifications number.
     *
     * @returns Number of unread notifications which should be shown on application badge.
     */
    get badge(): number | undefined;
    /**
     * Update application badge number.
     *
     * @param value - Number which should be shown in application badge upon receiving notification.
     */
    set badge(value: number | undefined);
    /**
     * Retrieve notification sound file.
     *
     * @returns Notification sound file name from resource bundle.
     */
    get sound(): string | undefined;
    /**
     * Update notification sound.
     *
     * @param value - Name of the sound file which should be played upon notification receive.
     */
    set sound(value: string | undefined);
    /**
     * Build notifications platform for requested platforms.
     *
     * @param platforms - List of platforms for which payload should be added to final dictionary. Supported values:
     * fcm, apns, and apns2.
     *
     * @returns Object with data, which can be sent with publish method call and trigger remote notifications for
     * specified platforms.
     */
    buildPayload(platforms: ('apns' | 'apns2' | 'fcm')[]): {
      pn_apns?: APNSPayload;
      pn_fcm?: FCMPayload;
      pn_debug?: boolean;
    };
  }

  /**
   * PubNub entity subscription configuration options.
   */
  export type SubscriptionOptions = {
    /**
     * Whether presence events for an entity should be received or not.
     */
    receivePresenceEvents?: boolean;
    /**
     * Real-time event filtering function.
     *
     * Function can be used to filter out events which shouldn't be populated to the registered event listeners.
     *
     * **Note:** This function is called for each received event.
     *
     * @param event - Pre-processed event object from real-time subscription stream.
     *
     * @returns `true` if event should be populated to the event listeners.
     */
    filter?: (event: Subscription.SubscriptionResponse['messages'][0]) => boolean;
  };

  /**
   * Common interface for entities which can be used in subscription.
   */
  export interface SubscriptionCapable {
    /**
     * Create a subscribable's subscription object for real-time updates.
     *
     * Create a subscription object which can be used to subscribe to the real-time updates sent to the specific data
     * stream.
     *
     * @param [subscriptionOptions] - Subscription object behavior customization options.
     *
     * @returns Configured and ready to use subscribable's subscription object.
     */
    subscription(subscriptionOptions?: SubscriptionOptions): EventEmitCapable;
  }

  export interface EventEmitCapable {
    /**
     * Set new message handler.
     *
     * Function, which will be called each time when a new message is received from the real-time network.
     */
    onMessage?: (event: Subscription.Message) => void;
    /**
     * Set a new presence events handler.
     *
     * Function, which will be called each time when a new presence event is received from the real-time network.
     */
    onPresence?: (event: Subscription.Presence) => void;
    /**
     * Set a new signal handler.
     *
     * Function, which will be called each time when a new signal is received from the real-time network.
     */
    onSignal?: (event: Subscription.Signal) => void;
    /**
     * Set a new app context event handler.
     *
     * Function, which will be called each time when a new app context event is received from the real-time network.
     */
    onObjects?: (event: Subscription.AppContextObject) => void;
    /**
     * Set a new message reaction event handler.
     *
     * Function, which will be called each time when a new message reaction event is received from the real-time network.
     */
    onMessageAction?: (event: Subscription.MessageAction) => void;
    /**
     * Set a new file handler.
     *
     * Function, which will be called each time when a new file is received from the real-time network.
     */
    onFile?: (event: Subscription.File) => void;
    /**
     * Set events handler.
     *
     * @param listener - Events listener configuration object, which lets specify handlers for multiple types of events.
     */
    addListener(listener: Listener): void;
    /**
     * Remove real-time event listener.
     *
     * @param listener - Event listeners which should be removed.
     */
    removeListener(listener: Listener): void;
    /**
     * Clear all real-time event listeners.
     */
    removeAllListeners(): void;
  }

  /**
   * First-class objects which provides access to the channel app context object-specific APIs.
   */
  export class ChannelMetadata extends Entity {
    /**
     * Get unique channel metadata object identifier.
     *
     * @returns Channel metadata identifier.
     */
    get id(): string;
  }

  /**
   * Common entity interface.
   */
  export abstract class Entity implements EntityInterface, SubscriptionCapable {
    /**
     * Create a subscribable's subscription object for real-time updates.
     *
     * Create a subscription object which can be used to subscribe to the real-time updates sent to the specific data
     * stream.
     *
     * @param [subscriptionOptions] - Subscription object behavior customization options.
     *
     * @returns Configured and ready to use subscribable's subscription object.
     */
    subscription(subscriptionOptions?: SubscriptionOptions): Subscription;
    /**
     * Stringify entity object.
     *
     * @returns Serialized entity object.
     */
    toString(): string;
  }

  /**
   * Common entity interface.
   */
  export interface EntityInterface extends SubscriptionCapable {}

  /**
   * Single-entity subscription object which can be used to receive and handle real-time updates.
   */
  export class Subscription extends SubscriptionBase {
    /**
     * Make a bare copy of the {@link Subscription} object.
     *
     * Copy won't have any type-specific listeners or added listener objects but will have the same internal state as
     * the source object.
     *
     * @returns Bare copy of a {@link Subscription} object.
     */
    cloneEmpty(): Subscription;
    /**
     * Graceful {@link Subscription} object destruction.
     *
     * This is an instance destructor, which will properly deinitialize it:
     * - remove and unset all listeners,
     * - try to unsubscribe (if subscribed and there are no more instances interested in the same data stream).
     *
     * **Important:** {@link Subscription#dispose dispose} won't have any effect if a subscription object is part of
     * {@link SubscriptionSet set}. To gracefully dispose an object, it should be removed from the set using
     * {@link SubscriptionSet#removeSubscription removeSubscription} (in this case call of
     * {@link Subscription#dispose dispose} not required).
     *
     * **Note:** Disposed instance won't call the dispatcher to deliver updates to the listeners.
     */
    dispose(): void;
    /**
     * Merge entities' subscription objects into {@link SubscriptionSet}.
     *
     * @param subscription - Another entity's subscription object to be merged with receiver.
     *
     * @return {@link SubscriptionSet} which contains both receiver and other entities' subscription objects.
     */
    addSubscription(subscription: Subscription): SubscriptionSet;
    /**
     * Stringify subscription object.
     *
     * @returns Serialized subscription object.
     */
    toString(): string;
  }

  /** Re-export aliased type. */
  export { Subscription as SubscriptionObject };

  /**
   * Base subscribe object.
   *
   * Implementation of base functionality used by {@link SubscriptionObject Subscription} and {@link SubscriptionSet}.
   */
  export abstract class SubscriptionBase implements EventEmitCapable, EventHandleCapable {
    protected readonly subscriptionType: 'Subscription' | 'SubscriptionSet';
    /**
     * Get a list of channels which is used for subscription.
     *
     * @returns List of channel names.
     */
    get channels(): string[];
    /**
     * Get a list of channel groups which is used for subscription.
     *
     * @returns List of channel group names.
     */
    get channelGroups(): string[];
    /**
     * Set a new message handler.
     *
     * @param listener - Listener function, which will be called each time when a new message
     * is received from the real-time network.
     */
    set onMessage(listener: ((event: Subscription.Message) => void) | undefined);
    /**
     * Set a new presence events handler.
     *
     * @param listener - Listener function, which will be called each time when a new
     * presence event is received from the real-time network.
     */
    set onPresence(listener: ((event: Subscription.Presence) => void) | undefined);
    /**
     * Set a new signal handler.
     *
     * @param listener - Listener function, which will be called each time when a new signal
     * is received from the real-time network.
     */
    set onSignal(listener: ((event: Subscription.Signal) => void) | undefined);
    /**
     * Set a new app context event handler.
     *
     * @param listener - Listener function, which will be called each time when a new
     * app context event is received from the real-time network.
     */
    set onObjects(listener: ((event: Subscription.AppContextObject) => void) | undefined);
    /**
     * Set a new message reaction event handler.
     *
     * @param listener - Listener function, which will be called each time when a
     * new message reaction event is received from the real-time network.
     */
    set onMessageAction(listener: ((event: Subscription.MessageAction) => void) | undefined);
    /**
     * Set a new file handler.
     *
     * @param listener - Listener function, which will be called each time when a new file
     * is received from the real-time network.
     */
    set onFile(listener: ((event: Subscription.File) => void) | undefined);
    /**
     * Set events handler.
     *
     * @param listener - Events listener configuration object, which lets specify handlers for multiple
     * types of events.
     */
    addListener(listener: Listener): void;
    /**
     * Remove events handler.
     *
     * @param listener - Event listener configuration, which should be removed from the list of notified
     * listeners. **Important:** Should be the same object which has been passed to the {@link addListener}.
     */
    removeListener(listener: Listener): void;
    /**
     * Remove all events listeners.
     */
    removeAllListeners(): void;
    /**
     * Make a bare copy of the subscription object.
     *
     * Copy won't have any type-specific listeners or added listener objects but will have the same internal state as
     * the source object.
     *
     * @returns Bare copy of a subscription object.
     */
    abstract cloneEmpty(): SubscriptionBase;
    /**
     * Graceful object destruction.
     *
     * This is an instance destructor, which will properly deinitialize it:
     * - remove and unset all listeners,
     * - try to unsubscribe (if subscribed and there are no more instances interested in the same data stream).
     *
     * **Important:** {@link SubscriptionBase#dispose dispose} won't have any effect if a subscription object is part of
     * set. To gracefully dispose an object, it should be removed from the set using
     * {@link SubscriptionSet#removeSubscription removeSubscription} (in this case call of
     * {@link SubscriptionBase#dispose dispose} not required.
     *
     * **Note:** Disposed instance won't call the dispatcher to deliver updates to the listeners.
     */
    dispose(): void;
    /**
     * Start receiving real-time updates.
     *
     * @param parameters - Additional subscription configuration options which should be used
     * for request.
     */
    subscribe(parameters?: { timetoken?: string }): void;
    /**
     * Stop real-time events processing.
     *
     * **Important:** {@link SubscriptionBase#unsubscribe unsubscribe} won't have any effect if a subscription object
     * is part of active (subscribed) set. To unsubscribe an object, it should be removed from the set using
     * {@link SubscriptionSet#removeSubscription removeSubscription} (in this case call of
     * {@link SubscriptionBase#unsubscribe unsubscribe} not required.
     *
     * **Note:** Unsubscribed instance won't call the dispatcher to deliver updates to the listeners.
     */
    unsubscribe(): void;
  }

  export interface EventHandleCapable {}

  /**
   * Multiple entities subscription set object which can be used to receive and handle real-time
   * updates.
   *
   * Subscription set object represents a collection of per-entity subscription objects and allows
   * processing them at once for subscription loop and events handling.
   */
  export class SubscriptionSet extends SubscriptionBase {
    /**
     * Get a list of entities' subscription objects registered in a subscription set.
     *
     * @returns Entities' subscription objects list.
     */
    get subscriptions(): PubNub.SubscriptionObject[];
    /**
     * Make a bare copy of the {@link SubscriptionSet} object.
     *
     * Copy won't have any type-specific listeners or added listener objects but will have the same internal state as
     * the source object.
     *
     * @returns Bare copy of a {@link SubscriptionSet} object.
     */
    cloneEmpty(): SubscriptionSet;
    /**
     * Graceful {@link SubscriptionSet} destruction.
     *
     * This is an instance destructor, which will properly deinitialize it:
     * - remove and unset all listeners,
     * - try to unsubscribe (if subscribed and there are no more instances interested in the same data stream).
     *
     * **Note:** Disposed instance won't call the dispatcher to deliver updates to the listeners.
     */
    dispose(): void;
    /**
     * Add an entity's subscription to the subscription set.
     *
     * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
     *
     * @param subscription - Another entity's subscription object, which should be added.
     */
    addSubscription(subscription: PubNub.SubscriptionObject): void;
    /**
     * Add an entity's subscriptions to the subscription set.
     *
     * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
     *
     * @param subscriptions - List of entity's subscription objects, which should be added.
     */
    addSubscriptions(subscriptions: PubNub.SubscriptionObject[]): void;
    /**
     * Remove an entity's subscription object from the set.
     *
     * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
     *
     * @param subscription - Another entity's subscription object, which should be removed.
     */
    removeSubscription(subscription: PubNub.SubscriptionObject): void;
    /**
     * Remove an entity's subscription objects from the set.
     *
     * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
     *
     * @param subscriptions - List entity's subscription objects, which should be removed.
     */
    removeSubscriptions(subscriptions: PubNub.SubscriptionObject[]): void;
    /**
     * Merge with another {@link SubscriptionSet} object.
     *
     * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
     *
     * @param subscriptionSet - Other entities' subscription set, which should be joined.
     */
    addSubscriptionSet(subscriptionSet: SubscriptionSet): void;
    /**
     * Subtract another {@link SubscriptionSet} object.
     *
     * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
     *
     * @param subscriptionSet - Other entities' subscription set, which should be subtracted.
     */
    removeSubscriptionSet(subscriptionSet: SubscriptionSet): void;
    /**
     * Stringify subscription object.
     *
     * @returns Serialized subscription object.
     */
    toString(): string;
  }

  /**
   * First-class objects which provides access to the channel group-specific APIs.
   */
  export class ChannelGroup extends Entity {
    /**
     * Get a unique channel group name.
     *
     * @returns Channel group name.
     */
    get name(): string;
  }

  /**
   * First-class objects which provides access to the user app context object-specific APIs.
   */
  export class UserMetadata extends Entity {
    /**
     * Get unique user metadata object identifier.
     *
     * @returns User metadata identifier.
     */
    get id(): string;
  }

  /**
   * First-class objects which provides access to the channel-specific APIs.
   */
  export class Channel extends Entity {
    /**
     * Get a unique channel name.
     *
     * @returns Channel name.
     */
    get name(): string;
  }

  /**
   * PubNub Stream / Channel group API interface.
   */
  export class PubNubChannelGroups {
    /**
     * Fetch channel group channels.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    listChannels(
      parameters: ChannelGroups.ListChannelGroupChannelsParameters,
      callback: ResultCallback<ChannelGroups.ListChannelGroupChannelsResponse>,
    ): void;
    /**
     * Fetch channel group channels.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get channel group channels response.
     */
    listChannels(
      parameters: ChannelGroups.ListChannelGroupChannelsParameters,
    ): Promise<ChannelGroups.ListChannelGroupChannelsResponse>;
    /**
     * Fetch all channel groups.
     *
     * @param callback - Request completion handler callback.
     *
     * @deprecated
     */
    listGroups(callback: ResultCallback<ChannelGroups.ListAllChannelGroupsResponse>): void;
    /**
     * Fetch all channel groups.
     *
     * @returns Asynchronous get all channel groups response.
     *
     * @deprecated
     */
    listGroups(): Promise<ChannelGroups.ListAllChannelGroupsResponse>;
    /**
     * Add channels to the channel group.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    addChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters, callback: StatusCallback): void;
    /**
     * Add channels to the channel group.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous add channels to the channel group response.
     */
    addChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters): Promise<Record<string, unknown>>;
    /**
     * Remove channels from the channel group.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    removeChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters, callback: StatusCallback): void;
    /**
     * Remove channels from the channel group.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous remove channels from the channel group response.
     */
    removeChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters): Promise<Record<string, unknown>>;
    /**
     * Remove channel group.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    deleteGroup(parameters: ChannelGroups.DeleteChannelGroupParameters, callback: StatusCallback): void;
    /**
     * Remove channel group.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous remove channel group response.
     */
    deleteGroup(parameters: ChannelGroups.DeleteChannelGroupParameters): Promise<Record<string, unknown>>;
  }

  /**
   * PubNub Push Notifications API interface.
   */
  export class PubNubPushNotifications {
    /**
     * Fetch device's push notification enabled channels.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    listChannels(
      parameters: Push.ListDeviceChannelsParameters,
      callback: ResultCallback<Push.ListDeviceChannelsResponse>,
    ): void;
    /**
     * Fetch device's push notification enabled channels.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get device channels response.
     */
    listChannels(parameters: Push.ListDeviceChannelsParameters): Promise<Push.ListDeviceChannelsResponse>;
    /**
     * Enable push notifications on channels for device.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    addChannels(parameters: Push.ManageDeviceChannelsParameters, callback: StatusCallback): void;
    /**
     * Enable push notifications on channels for device.
     *
     * @param parameters - Request configuration parameters.
     */
    addChannels(parameters: Push.ManageDeviceChannelsParameters): Promise<void>;
    /**
     * Disable push notifications on channels for device.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    removeChannels(parameters: Push.ManageDeviceChannelsParameters, callback: StatusCallback): void;
    /**
     * Disable push notifications on channels for device.
     *
     * @param parameters - Request configuration parameters.
     */
    removeChannels(parameters: Push.ManageDeviceChannelsParameters): Promise<void>;
    /**
     * Disable push notifications for device.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    deleteDevice(parameters: Push.RemoveDeviceParameters, callback: StatusCallback): void;
    /**
     * Disable push notifications for device.
     *
     * @param parameters - Request configuration parameters.
     */
    deleteDevice(parameters: Push.RemoveDeviceParameters): Promise<void>;
  }

  /**
   * PubNub App Context API interface.
   */
  export class PubNubObjects {
    /**
     * Fetch a paginated list of UUID Metadata objects.
     *
     * @param callback - Request completion handler callback.
     */
    getAllUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      callback: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
    ): void;
    /**
     * Fetch a paginated list of UUID Metadata objects.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    getAllUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      parameters: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>,
      callback: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
    ): void;
    /**
     * Fetch a paginated list of UUID Metadata objects.
     *
     * @param [parameters] - Request configuration parameters.
     *
     * @returns Asynchronous get all UUID metadata response.
     */
    getAllUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      parameters?: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>,
    ): Promise<AppContext.GetAllUUIDMetadataResponse<Custom>>;
    /**
     * Fetch a UUID Metadata object for the currently configured PubNub client `uuid`.
     *
     * @param callback - Request completion handler callback.
     */
    getUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      callback: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
    ): void;
    /**
     * Fetch a specific UUID Metadata object.
     *
     * @param parameters - Request configuration parameters. Will fetch a UUID metadata object for
     * a currently configured PubNub client `uuid` if not set.
     * @param callback - Request completion handler callback.
     */
    getUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      parameters: AppContext.GetUUIDMetadataParameters,
      callback: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
    ): void;
    /**
     * Fetch a specific UUID Metadata object.
     *
     * @param [parameters] - Request configuration parameters. Will fetch UUID Metadata object for
     * currently configured PubNub client `uuid` if not set.
     *
     * @returns Asynchronous get UUID metadata response.
     */
    getUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      parameters?: AppContext.GetUUIDMetadataParameters,
    ): Promise<AppContext.GetUUIDMetadataResponse<Custom>>;
    /**
     * Update a specific UUID Metadata object.
     *
     * @param parameters - Request configuration parameters. Will set UUID metadata for a currently
     * configured PubNub client `uuid` if not set.
     * @param callback - Request completion handler callback.
     */
    setUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      parameters: AppContext.SetUUIDMetadataParameters<Custom>,
      callback: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>,
    ): void;
    /**
     * Update specific UUID Metadata object.
     *
     * @param parameters - Request configuration parameters. Will set UUID metadata for currently
     * configured PubNub client `uuid` if not set.
     *
     * @returns Asynchronous set UUID metadata response.
     */
    setUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      parameters: AppContext.SetUUIDMetadataParameters<Custom>,
    ): Promise<AppContext.SetUUIDMetadataResponse<Custom>>;
    /**
     * Remove a UUID Metadata object for currently configured PubNub client `uuid`.
     *
     * @param callback - Request completion handler callback.
     */
    removeUUIDMetadata(callback: ResultCallback<AppContext.RemoveUUIDMetadataResponse>): void;
    /**
     * Remove a specific UUID Metadata object.
     *
     * @param parameters - Request configuration parameters. Will remove UUID metadata for currently
     * configured PubNub client `uuid` if not set.
     * @param callback - Request completion handler callback.
     */
    removeUUIDMetadata(
      parameters: AppContext.RemoveUUIDMetadataParameters,
      callback: ResultCallback<AppContext.RemoveUUIDMetadataResponse>,
    ): void;
    /**
     * Remove a specific UUID Metadata object.
     *
     * @param [parameters] - Request configuration parameters. Will remove UUID metadata for currently
     * configured PubNub client `uuid` if not set.
     *
     * @returns Asynchronous UUID metadata remove response.
     */
    removeUUIDMetadata(
      parameters?: AppContext.RemoveUUIDMetadataParameters,
    ): Promise<AppContext.RemoveUUIDMetadataResponse>;
    /**
     * Fetch a paginated list of Channel Metadata objects.
     *
     * @param callback - Request completion handler callback.
     */
    getAllChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      callback: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
    ): void;
    /**
     * Fetch a paginated list of Channel Metadata objects.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    getAllChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      parameters: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>,
      callback: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
    ): void;
    /**
     * Fetch a paginated list of Channel Metadata objects.
     *
     * @param [parameters] - Request configuration parameters.
     *
     * @returns Asynchronous get all Channel metadata response.
     */
    getAllChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      parameters?: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>,
    ): Promise<AppContext.GetAllChannelMetadataResponse<Custom>>;
    /**
     * Fetch Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    getChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      parameters: AppContext.GetChannelMetadataParameters,
      callback: ResultCallback<AppContext.GetChannelMetadataResponse<Custom>>,
    ): void;
    /**
     * Fetch a specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get Channel metadata response.
     */
    getChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      parameters: AppContext.GetChannelMetadataParameters,
    ): Promise<AppContext.GetChannelMetadataResponse<Custom>>;
    /**
     * Update specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    setChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      parameters: AppContext.SetChannelMetadataParameters<Custom>,
      callback: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>,
    ): void;
    /**
     * Update specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous set Channel metadata response.
     */
    setChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
      parameters: AppContext.SetChannelMetadataParameters<Custom>,
    ): Promise<AppContext.SetChannelMetadataResponse<Custom>>;
    /**
     * Remove Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    removeChannelMetadata(
      parameters: AppContext.RemoveChannelMetadataParameters,
      callback: ResultCallback<AppContext.RemoveChannelMetadataResponse>,
    ): void;
    /**
     * Remove a specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous Channel metadata remove response.
     */
    removeChannelMetadata(
      parameters: AppContext.RemoveChannelMetadataParameters,
    ): Promise<AppContext.RemoveChannelMetadataResponse>;
    /**
     * Fetch a paginated list of Channel Member objects.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    getChannelMembers<
      MemberCustom extends AppContext.CustomData = AppContext.CustomData,
      UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters: AppContext.GetMembersParameters,
      callback: ResultCallback<AppContext.GetMembersResponse<MemberCustom, UUIDCustom>>,
    ): void;
    /**
     * Fetch a paginated list of Channel Member objects.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get Channel Members response.
     */
    getChannelMembers<
      MemberCustom extends AppContext.CustomData = AppContext.CustomData,
      UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
    >(parameters: AppContext.GetMembersParameters): Promise<AppContext.GetMembersResponse<MemberCustom, UUIDCustom>>;
    /**
     * Update specific Channel Members list.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    setChannelMembers<
      MemberCustom extends AppContext.CustomData = AppContext.CustomData,
      UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters: AppContext.SetChannelMembersParameters<MemberCustom>,
      callback: ResultCallback<AppContext.SetMembersResponse<MemberCustom, UUIDCustom>>,
    ): void;
    /**
     * Update specific Channel Members list.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous update Channel Members list response.
     */
    setChannelMembers<
      MemberCustom extends AppContext.CustomData = AppContext.CustomData,
      UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters: AppContext.SetChannelMembersParameters<MemberCustom>,
    ): Promise<AppContext.SetMembersResponse<MemberCustom, UUIDCustom>>;
    /**
     * Remove Members from the Channel.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    removeChannelMembers<
      MemberCustom extends AppContext.CustomData = AppContext.CustomData,
      UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters: AppContext.RemoveMembersParameters,
      callback: ResultCallback<AppContext.RemoveMembersResponse<MemberCustom, UUIDCustom>>,
    ): void;
    /**
     * Remove Members from the Channel.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous Channel Members remove response.
     */
    removeChannelMembers<
      MemberCustom extends AppContext.CustomData = AppContext.CustomData,
      UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters: AppContext.RemoveMembersParameters,
    ): Promise<AppContext.RemoveMembersResponse<MemberCustom, UUIDCustom>>;
    /**
     * Fetch a specific UUID Memberships list for currently configured PubNub client `uuid`.
     *
     * @param callback - Request completion handler callback.
     *
     * @returns Asynchronous get UUID Memberships list response or `void` in case if `callback`
     * provided.
     */
    getMemberships<
      MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
      ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
    >(callback: ResultCallback<AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom>>): void;
    /**
     * Fetch a specific UUID Memberships list.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    getMemberships<
      MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
      ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters: AppContext.GetMembershipsParameters,
      callback: ResultCallback<AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom>>,
    ): void;
    /**
     * Fetch a specific UUID Memberships list.
     *
     * @param [parameters] - Request configuration parameters. Will fetch UUID Memberships list for
     * currently configured PubNub client `uuid` if not set.
     *
     * @returns Asynchronous get UUID Memberships list response.
     */
    getMemberships<
      MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
      ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters?: AppContext.GetMembershipsParameters,
    ): Promise<AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom>>;
    /**
     * Update a specific UUID Memberships list.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    setMemberships<
      MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
      ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters: AppContext.SetMembershipsParameters<MembershipCustom>,
      callback: ResultCallback<AppContext.SetMembershipsResponse<MembershipCustom, ChannelCustom>>,
    ): void;
    /**
     * Update specific UUID Memberships list.
     *
     * @param parameters - Request configuration parameters or callback from overload.
     *
     * @returns Asynchronous update UUID Memberships list response.
     */
    setMemberships<
      MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
      ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters: AppContext.SetMembershipsParameters<MembershipCustom>,
    ): Promise<AppContext.SetMembershipsResponse<MembershipCustom, ChannelCustom>>;
    /**
     * Remove a specific UUID Memberships.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    removeMemberships<
      MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
      ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters: AppContext.RemoveMembershipsParameters,
      callback: ResultCallback<AppContext.RemoveMembershipsResponse<MembershipCustom, ChannelCustom>>,
    ): void;
    /**
     * Remove a specific UUID Memberships.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous UUID Memberships remove response.
     */
    removeMemberships<
      MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
      ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters: AppContext.RemoveMembershipsParameters,
    ): Promise<AppContext.RemoveMembershipsResponse<MembershipCustom, ChannelCustom>>;
    /**
     * Fetch paginated list of specific Space members or specific User memberships.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get specific Space members or specific User memberships response.
     *
     * @deprecated Use {@link PubNubObjects#getChannelMembers getChannelMembers} or
     * {@link PubNubObjects#getMemberships getMemberships} methods instead.
     */
    fetchMemberships<
      RelationCustom extends AppContext.CustomData = AppContext.CustomData,
      MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters: AppContext.GetMembershipsParameters | AppContext.GetMembersParameters,
      callback?: ResultCallback<
        | AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom>
        | AppContext.UserMembersResponse<RelationCustom, MetadataCustom>
      >,
    ): Promise<
      | AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom>
      | AppContext.UserMembersResponse<RelationCustom, MetadataCustom>
      | void
    >;
    /**
     * Add members to specific Space or memberships specific User.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous add members to specific Space or memberships specific User response or
     * `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubObjects#setChannelMembers setChannelMembers} or
     * {@link PubNubObjects#setMemberships setMemberships} methods instead.
     */
    addMemberships<
      Custom extends AppContext.CustomData = AppContext.CustomData,
      MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
    >(
      parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>,
      callback?: ResultCallback<
        | AppContext.SetMembershipsResponse<Custom, MetadataCustom>
        | AppContext.SetMembersResponse<Custom, MetadataCustom>
      >,
    ): Promise<
      | AppContext.SetMembershipsResponse<Custom, MetadataCustom>
      | AppContext.SetMembersResponse<Custom, MetadataCustom>
      | void
    >;
  }

  /**
   * Logging module manager.
   *
   * Manager responsible for log requests handling and forwarding to the registered {@link Logger logger} implementations.
   */
  export class LoggerManager {}

  export namespace Subscription {
    /**
     * Time cursor.
     *
     * Cursor used by subscription loop to identify point in time after which updates will be
     * delivered.
     */
    export type SubscriptionCursor = {
      /**
       * PubNub high-precision timestamp.
       *
       * Aside of specifying exact time of receiving data / event this token used to catchup /
       * follow on real-time updates.
       */
      timetoken: string;
      /**
       * Data center region for which `timetoken` has been generated.
       */
      region?: number;
    };

    /**
     * Common real-time event.
     */
    type Event = {
      /**
       * Channel to which real-time event has been sent.
       */
      channel: string;
      /**
       * Actual subscription at which real-time event has been received.
       *
       * PubNub client provide various ways to subscribe to the real-time stream: channel groups,
       * wildcard subscription, and spaces.
       *
       * **Note:** Value will be `null` if it is the same as {@link channel}.
       */
      subscription: string | null;
      /**
       * High-precision PubNub timetoken with time when event has been received by PubNub services.
       */
      timetoken: string;
    };

    /**
     * Common legacy real-time event for backward compatibility.
     */
    type LegacyEvent = Event & {
      /**
       * Channel to which real-time event has been sent.
       *
       * @deprecated Use {@link channel} field instead.
       */
      actualChannel?: string | null;
      /**
       * Actual subscription at which real-time event has been received.
       *
       * @deprecated Use {@link subscription} field instead.
       */
      subscribedChannel?: string;
    };

    /**
     * Presence change real-time event.
     */
    export type Presence = LegacyEvent & PresenceData;

    /**
     * Extended presence real-time event.
     *
     * Type extended for listener manager support.
     */
    type PresenceEvent = {
      type: PubNubEventType.Presence;
      data: Presence;
    };

    /**
     * Common published data information.
     */
    type PublishedData = {
      /**
       * Unique identifier of the user which sent data.
       */
      publisher?: string;
      /**
       * Additional user-provided metadata which can be used with real-time filtering expression.
       */
      userMetadata?: {
        [p: string]: Payload;
      };
      /**
       * User-provided message type.
       */
      customMessageType?: string;
      /**
       * Sent data.
       */
      message: Payload;
    };

    /**
     * Real-time message event.
     */
    export type Message = LegacyEvent &
      PublishedData & {
        /**
         * Decryption error message in case of failure.
         */
        error?: string;
      };

    /**
     * Extended real-time message event.
     *
     * Type extended for listener manager support.
     */
    type MessageEvent = {
      type: PubNubEventType.Message;
      data: Message;
    };

    /**
     * Real-time signal event.
     */
    export type Signal = Event & PublishedData;

    /**
     * Extended real-time signal event.
     *
     * Type extended for listener manager support.
     */
    type SignalEvent = {
      type: PubNubEventType.Signal;
      data: Signal;
    };

    /**
     * Message action real-time event.
     */
    export type MessageAction = Event &
      Omit<MessageActionData, 'source' | 'version' | 'data'> & {
        /**
         * Unique identifier of the user which added message reaction.
         *
         * @deprecated Use `data.uuid` field instead.
         */
        publisher?: string;
        data: MessageActionData['data'] & {
          /**
           * Unique identifier of the user which added message reaction.
           */
          uuid: string;
        };
      };

    /**
     * Extended message action real-time event.
     *
     * Type extended for listener manager support.
     */
    type MessageActionEvent = {
      type: PubNubEventType.MessageAction;
      data: MessageAction;
    };

    /**
     * App Context Object change real-time event.
     */
    export type AppContextObject = Event & {
      /**
       * Information about App Context object for which event received.
       */
      message: AppContextObjectData;
    };

    /**
     * `User` App Context Object change real-time event.
     */
    export type UserAppContextObject = Omit<Event, 'channel'> & {
      /**
       * Space to which real-time event has been sent.
       */
      spaceId: string;
      /**
       * Information about User Object for which event received.
       */
      message: UserObjectData;
    };

    /**
     * `Space` App Context Object change real-time event.
     */
    export type SpaceAppContextObject = Omit<Event, 'channel'> & {
      /**
       * Space to which real-time event has been sent.
       */
      spaceId: string;
      /**
       * Information about `Space` Object for which event received.
       */
      message: SpaceObjectData;
    };

    /**
     * VSP `Membership` App Context Object change real-time event.
     */
    export type VSPMembershipAppContextObject = Omit<Event, 'channel'> & {
      /**
       * Space to which real-time event has been sent.
       */
      spaceId: string;
      /**
       * Information about `Membership` Object for which event received.
       */
      message: VSPMembershipObjectData;
    };

    /**
     * Extended App Context Object change real-time event.
     *
     * Type extended for listener manager support.
     */
    type AppContextEvent = {
      type: PubNubEventType.AppContext;
      data: AppContextObject;
    };

    /**
     * File real-time event.
     */
    export type File = Event &
      Omit<PublishedData, 'message'> &
      Omit<FileData, 'file'> & {
        /**
         * Message which has been associated with uploaded file.
         */
        message?: Payload;
        /**
         * Information about uploaded file.
         */
        file?: FileData['file'] & {
          /**
           * File download url.
           */
          url: string;
        };
        /**
         * Decryption error message in case of failure.
         */
        error?: string;
      };

    /**
     * Extended File real-time event.
     *
     * Type extended for listener manager support.
     */
    type FileEvent = {
      type: PubNubEventType.Files;
      data: File;
    };

    /**
     * Subscribe request parameters.
     */
    export type SubscribeParameters = {
      /**
       * List of channels from which real-time events should be delivered.
       *
       * @default `,` if {@link channelGroups} is set.
       */
      channels?: string[];
      /**
       * List of channel groups from which real-time events should be retrieved.
       */
      channelGroups?: string[];
      /**
       * Next subscription loop timetoken.
       */
      timetoken?: string | number;
      /**
       * Whether should subscribe to channels / groups presence announcements or not.
       *
       * @default `false`
       */
      withPresence?: boolean;
      /**
       * Presence information which should be associated with `userId`.
       *
       * `state` information will be associated with `userId` on channels mentioned as keys in
       * this object.
       *
       * @deprecated Use set state methods to specify associated user's data instead of passing to
       * subscribe.
       */
      state?: Record<string, Payload>;
      /**
       * Whether should subscribe to channels / groups presence announcements or not.
       *
       * @default `false`
       */
      withHeartbeats?: boolean;
    };

    /**
     * Service success response.
     */
    export type SubscriptionResponse = {
      cursor: SubscriptionCursor;
      messages: (PresenceEvent | MessageEvent | SignalEvent | MessageActionEvent | AppContextEvent | FileEvent)[];
    };
  }

  export namespace AppContext {
    /**
     * Partial nullability helper type.
     */
    type PartialNullable<T> = {
      [P in keyof T]?: T[P] | null;
    };

    /**
     * Custom data which should be associated with metadata objects or their relation.
     */
    export type CustomData = {
      [key: string]: string | number | boolean | null;
    };

    /**
     * Type provides shape of App Context parameters which is common to the all objects types to
     * be updated.
     */
    type ObjectParameters<Custom extends CustomData> = {
      custom?: Custom;
    };

    /**
     * Type provides shape of App Context object which is common to the all objects types received
     * from the PubNub service.
     */
    export type ObjectData<Custom extends CustomData> = {
      /**
       * Unique App Context object identifier.
       *
       * **Important:** For channel it is different from the channel metadata object name.
       */
      id: string;
      /**
       * Last date and time when App Context object has been updated.
       *
       * String built from date using ISO 8601.
       */
      updated: string;
      /**
       * App Context version hash.
       */
      eTag: string;
      /**
       * Additional data associated with App Context object.
       *
       * **Important:** Values must be scalars; only arrays or objects are supported.
       * {@link /docs/sdks/javascript/api-reference/objects#app-context-filtering-language-definition|App Context
       * filtering language} doesn’t support filtering by custom properties.
       */
      custom?: Custom | null;
    };

    /**
     * Type provides shape of object which let establish relation between metadata objects.
     */
    type ObjectsRelation<Custom extends CustomData> = {
      /**
       * App Context object unique identifier.
       */
      id: string;
      /**
       * App Context objects relation status.
       */
      status?: string;
      /**
       * App Context objects relation type.
       */
      type?: string;
      /**
       * Additional data associated with App Context object relation (membership or members).
       *
       * **Important:** Values must be scalars; only arrays or objects are supported.
       * {@link /docs/sdks/javascript/api-reference/objects#app-context-filtering-language-definition|App Context
       * filtering language} doesn’t support filtering by custom properties.
       */
      custom?: Custom;
    };

    /**
     * Response page cursor.
     */
    type Page = {
      /**
       * Random string returned from the server, indicating a specific position in a data set.
       *
       * Used for forward pagination, it fetches the next page, allowing you to continue from where
       * you left off.
       */
      next?: string;
      /**
       * Random string returned from the server, indicating a specific position in a data set.
       *
       * Used for backward pagination, it fetches the previous page, enabling access to earlier
       * data.
       *
       * **Important:** Ignored if the `next` parameter is supplied.
       */
      prev?: string;
    };

    /**
     * Metadata objects include options.
     *
     * Allows to configure what additional information should be included into service response.
     */
    type IncludeOptions = {
      /**
       * Whether to include total number of App Context objects in the response.
       *
       * @default `false`
       */
      totalCount?: boolean;
      /**
       * Whether to include App Context object `custom` field in the response.
       *
       * @default `false`
       */
      customFields?: boolean;
    };

    /**
     * Membership objects include options.
     *
     * Allows to configure what additional information should be included into service response.
     */
    type MembershipsIncludeOptions = IncludeOptions & {
      /**
       * Whether to include all {@link ChannelMetadata} fields in the response.
       *
       * @default `false`
       */
      channelFields?: boolean;
      /**
       * Whether to include {@link ChannelMetadata} `custom` field in the response.
       *
       * @default `false`
       */
      customChannelFields?: boolean;
      /**
       * Whether to include the membership's `status` field in the response.
       *
       * @default `false`
       */
      statusField?: boolean;
      /**
       * Whether to include the membership's `type` field in the response.
       *
       * @default `false`
       */
      typeField?: boolean;
      /**
       * Whether to include the channel's status field in the response.
       *
       * @default `false`
       */
      channelStatusField?: boolean;
      /**
       * Whether to include channel's type fields in the response.
       *
       * @default `false`
       */
      channelTypeField?: boolean;
    };

    /**
     * Members objects include options.
     *
     * Allows to configure what additional information should be included into service response.
     */
    type MembersIncludeOptions = IncludeOptions & {
      /**
       * Whether to include all {@link UUIMetadata} fields in the response.
       *
       * @default `false`
       */
      UUIDFields?: boolean;
      /**
       * Whether to include {@link UUIMetadata} `custom` field in the response.
       *
       * @default `false`
       */
      customUUIDFields?: boolean;
      /**
       * Whether to include the member's `status` field in the response.
       *
       * @default `false`
       */
      statusField?: boolean;
      /**
       * Whether to include the member's `type` field in the response.
       *
       * @default `false`
       */
      typeField?: boolean;
      /**
       * Whether to include the user's status field in the response.
       *
       * @default `false`
       */
      UUIDStatusField?: boolean;
      /**
       * Whether to include user's type fields in the response.
       *
       * @default `false`
       */
      UUIDTypeField?: boolean;
    };

    /**
     * Type provides shape of App Context parameters which is common to the all objects types to
     * fetch them by pages.
     */
    type PagedRequestParameters<Include, Sort> = {
      /**
       * Fields which can be additionally included into response.
       */
      include?: Include;
      /**
       * Expression used to filter the results.
       *
       * Only objects whose properties satisfy the given expression are returned. The filter language is
       * {@link /docs/sdks/javascript/api-reference/objects#app-context-filtering-language-definition|defined here}.
       */
      filter?: string;
      /**
       * Fetched App Context objects sorting options.
       */
      sort?: Sort;
      /**
       * Number of objects to return in response.
       *
       * **Important:** Maximum for this API is `100` objects per-response.
       *
       * @default `100`
       */
      limit?: number;
      /**
       * Response pagination configuration.
       */
      page?: Page;
    };

    /**
     * Type provides shape of App Context object fetch response which is common to the all objects
     * types received from the PubNub service.
     */
    type ObjectResponse<ObjectType> = {
      /**
       * App Context objects list fetch result status code.
       */
      status: number;
      /**
       * Received App Context object information.
       */
      data: ObjectType;
    };

    /**
     * Type provides shape of App Context objects fetch response which is common to the all
     * objects types received from the PubNub service.
     */
    type PagedResponse<ObjectType> = ObjectResponse<ObjectType[]> & {
      /**
       * Total number of App Context objects in the response.
       */
      totalCount?: number;
      /**
       * Random string returned from the server, indicating a specific position in a data set.
       *
       * Used for forward pagination, it fetches the next page, allowing you to continue from where
       * you left off.
       */
      next?: string;
      /**
       * Random string returned from the server, indicating a specific position in a data set.
       *
       * Used for backward pagination, it fetches the previous page, enabling access to earlier
       * data.
       *
       * **Important:** Ignored if the `next` parameter is supplied.
       */
      prev?: string;
    };

    /**
     * Key-value pair of a property to sort by, and a sort direction.
     */
    type MetadataSortingOptions<T> =
      | keyof Omit<T, 'id' | 'custom' | 'eTag'>
      | ({
          [K in keyof Omit<T, 'id' | 'custom' | 'eTag'>]?: 'asc' | 'desc' | null;
        } & {
          [key: `custom.${string}`]: 'asc' | 'desc' | null;
        });

    /**
     * Key-value pair of a property to sort by, and a sort direction.
     */
    type MembershipsSortingOptions =
      | 'channel.id'
      | 'channel.name'
      | 'channel.description'
      | 'channel.updated'
      | 'channel.status'
      | 'channel.type'
      | 'space.id'
      | 'space.name'
      | 'space.description'
      | 'space.updated'
      | 'updated'
      | 'status'
      | 'type'
      | {
          /**
           * Sort results by channel's `id` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          'channel.id'?: 'asc' | 'desc' | null;
          /**
           * Sort results by channel's `name` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          'channel.name'?: 'asc' | 'desc' | null;
          /**
           * Sort results by channel's `description` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          'channel.description'?: 'asc' | 'desc' | null;
          /**
           * Sort results by channel's `update` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          'channel.updated'?: 'asc' | 'desc' | null;
          /**
           * Sort results by channel's `status` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          'channel.status'?: 'asc' | 'desc' | null;
          /**
           * Sort results by channel's `type` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          'channel.type'?: 'asc' | 'desc' | null;
          /**
           * Sort results by channel's `id` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           *
           * @deprecated Use `channel.id` instead.
           */
          'space.id'?: 'asc' | 'desc' | null;
          /**
           * Sort results by channel's `name` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           *
           * @deprecated Use `channel.name` instead.
           */
          'space.name'?: 'asc' | 'desc' | null;
          /**
           * Sort results by channel's `description` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           *
           * @deprecated Use `channel.name` instead.
           */
          'space.description'?: 'asc' | 'desc' | null;
          /**
           * Sort results by channel's `update` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           *
           * @deprecated Use `channel.updated` instead.
           */
          'space.updated'?: 'asc' | 'desc' | null;
          /**
           * Sort results by `updated` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          updated?: 'asc' | 'desc' | null;
          /**
           * Sort results by `status` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          status?: 'asc' | 'desc' | null;
          /**
           * Sort results by `type` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          type?: 'asc' | 'desc' | null;
        };

    /**
     * Key-value pair of a property to sort by, and a sort direction.
     */
    type MembersSortingOptions =
      | 'uuid.id'
      | 'uuid.name'
      | 'uuid.updated'
      | 'uuid.status'
      | 'uuid.type'
      | 'user.id'
      | 'user.name'
      | 'user.updated'
      | 'updated'
      | 'status'
      | 'type'
      | {
          /**
           * Sort results by user's `id` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          'uuid.id'?: 'asc' | 'desc' | null;
          /**
           * Sort results by user's `name` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          'uuid.name'?: 'asc' | 'desc' | null;
          /**
           * Sort results by user's `update` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          'uuid.updated'?: 'asc' | 'desc' | null;
          /**
           * Sort results by user's `status` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          'uuid.status'?: 'asc' | 'desc' | null;
          /**
           * Sort results by user's `type` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          'uuid.type'?: 'asc' | 'desc' | null;
          /**
           * Sort results by user's `id` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           *
           * @deprecated Use `uuid.id` instead.
           */
          'user.id'?: 'asc' | 'desc' | null;
          /**
           * Sort results by user's `name` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           *
           * @deprecated Use `uuid.name` instead.
           */
          'user.name'?: 'asc' | 'desc' | null;
          /**
           * Sort results by user's `update` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           *
           * @deprecated Use `uuid.updated` instead.
           */
          'user.updated'?: 'asc' | 'desc' | null;
          /**
           * Sort results by `updated` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          updated?: 'asc' | 'desc' | null;
          /**
           * Sort results by `status` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          status?: 'asc' | 'desc' | null;
          /**
           * Sort results by `type` in ascending (`asc`) or descending (`desc`) order.
           *
           * Specify `null` for default sorting direction (ascending).
           */
          type?: 'asc' | 'desc' | null;
        };

    /**
     * Fetch All UUID or Channel Metadata request parameters.
     */
    export type GetAllMetadataParameters<AppContextObject> = PagedRequestParameters<
      IncludeOptions,
      MetadataSortingOptions<AppContextObject>
    >;

    /**
     * Type which describes own UUID metadata object fields.
     */
    type UUIDMetadataFields = {
      /**
       * Display name for the user.
       */
      name?: string;
      /**
       * The user's email address.
       */
      email?: string;
      /**
       * User's identifier in an external system.
       */
      externalId?: string;
      /**
       * The URL of the user's profile picture.
       */
      profileUrl?: string;
      /**
       * User's object type information.
       */
      type?: string;
      /**
       * User's object status.
       */
      status?: string;
    };

    /**
     * Updated UUID metadata object.
     *
     * Type represents updated UUID metadata object which will be pushed to the PubNub service.
     */
    type UUIDMetadata<Custom extends CustomData> = ObjectParameters<Custom> & Partial<UUIDMetadataFields>;

    /**
     * Received UUID metadata object.
     *
     * Type represents UUID metadata retrieved from the PubNub service.
     */
    export type UUIDMetadataObject<Custom extends CustomData> = ObjectData<Custom> &
      PartialNullable<UUIDMetadataFields>;

    /**
     * Response with fetched page of UUID metadata objects.
     */
    export type GetAllUUIDMetadataResponse<Custom extends CustomData> = PagedResponse<UUIDMetadataObject<Custom>>;

    /**
     * Fetch UUID Metadata request parameters.
     */
    export type GetUUIDMetadataParameters = {
      /**
       * Unique user identifier.
       *
       * **Important:** If not supplied then current user's uuid is used.
       *
       * @default Current `uuid`.
       */
      uuid?: string;
      /**
       * Unique user identifier.
       *
       * **Important:** If not supplied then current user's uuid is used.
       *
       * @default Current `userId`.
       *
       * @deprecated Use `getUUIDMetadata()` method instead.
       */
      userId?: string;
      /**
       * Fields which can be additionally included into response.
       */
      include?: Omit<IncludeOptions, 'totalCount'>;
    };

    /**
     * Response with requested UUID metadata object.
     */
    export type GetUUIDMetadataResponse<Custom extends CustomData> = ObjectResponse<UUIDMetadataObject<Custom>>;

    /**
     * Update UUID Metadata request parameters.
     */
    export type SetUUIDMetadataParameters<Custom extends CustomData> = {
      /**
       * Unique user identifier.
       *
       * **Important:** If not supplied then current user's uuid is used.
       *
       * @default Current `uuid`.
       */
      uuid?: string;
      /**
       * Unique user identifier.
       *
       * **Important:** If not supplied then current user's uuid is used.
       *
       * @default Current `userId`.
       *
       * @deprecated Use `setUUIDMetadata()` method instead.
       */
      userId?: string;
      /**
       * Metadata, which should be associated with UUID.
       */
      data: UUIDMetadata<Custom>;
      /**
       * Fields which can be additionally included into response.
       */
      include?: Omit<IncludeOptions, 'totalCount'>;
      /**
       * Optional entity tag from a previously received `PNUUIDMetadata`. The request
       * will fail if this parameter is specified and the ETag value on the server doesn't match.
       */
      ifMatchesEtag?: string;
    };

    /**
     * Response with result of the UUID metadata object update.
     */
    export type SetUUIDMetadataResponse<Custom extends CustomData> = ObjectResponse<UUIDMetadataObject<Custom>>;

    /**
     * Remove UUID Metadata request parameters.
     */
    export type RemoveUUIDMetadataParameters = {
      /**
       * Unique user identifier.
       *
       * **Important:** If not supplied then current user's uuid is used.
       *
       * @default Current `uuid`.
       */
      uuid?: string;
      /**
       * Unique user identifier.
       *
       * **Important:** If not supplied then current user's uuid is used.
       *
       * @default Current `userId`.
       *
       * @deprecated Use `removeUUIDMetadata()` method instead.
       */
      userId?: string;
    };

    /**
     * Response with result of the UUID metadata removal.
     */
    export type RemoveUUIDMetadataResponse = ObjectResponse<Record<string, unknown>>;

    /**
     * Type which describes own Channel metadata object fields.
     */
    type ChannelMetadataFields = {
      /**
       * Name of a channel.
       */
      name?: string;
      /**
       * Description of a channel.
       */
      description?: string;
      /**
       * Channel's object type information.
       */
      type?: string;
      /**
       * Channel's object status.
       */
      status?: string;
    };

    /**
     * Updated channel metadata object.
     *
     * Type represents updated channel metadata object which will be pushed to the PubNub service.
     */
    type ChannelMetadata<Custom extends CustomData> = ObjectParameters<Custom> & Partial<ChannelMetadataFields>;

    /**
     * Received channel metadata object.
     *
     * Type represents chanel metadata retrieved from the PubNub service.
     */
    export type ChannelMetadataObject<Custom extends CustomData> = ObjectData<Custom> &
      PartialNullable<ChannelMetadataFields>;

    /**
     * Response with fetched page of channel metadata objects.
     */
    export type GetAllChannelMetadataResponse<Custom extends CustomData> = PagedResponse<ChannelMetadataObject<Custom>>;

    /**
     * Fetch Channel Metadata request parameters.
     */
    export type GetChannelMetadataParameters = {
      /**
       * Channel name.
       */
      channel: string;
      /**
       * Space identifier.
       *
       * @deprecated Use `getChannelMetadata()` method instead.
       */
      spaceId?: string;
      /**
       * Fields which can be additionally included into response.
       */
      include?: Omit<IncludeOptions, 'totalCount'>;
    };

    /**
     * Response with requested channel metadata object.
     */
    export type GetChannelMetadataResponse<Custom extends CustomData> = ObjectResponse<ChannelMetadataObject<Custom>>;

    /**
     * Update Channel Metadata request parameters.
     */
    export type SetChannelMetadataParameters<Custom extends CustomData> = {
      /**
       * Channel name.
       */
      channel: string;
      /**
       * Space identifier.
       *
       * @deprecated Use `setChannelMetadata()` method instead.
       */
      spaceId?: string;
      /**
       * Metadata, which should be associated with UUID.
       */
      data: ChannelMetadata<Custom>;
      /**
       * Fields which can be additionally included into response.
       */
      include?: Omit<IncludeOptions, 'totalCount'>;
      /**
       * Optional entity tag from a previously received `PNUUIDMetadata`. The request
       * will fail if this parameter is specified and the ETag value on the server doesn't match.
       */
      ifMatchesEtag?: string;
    };

    /**
     * Response with result of the channel metadata object update.
     */
    export type SetChannelMetadataResponse<Custom extends CustomData> = ObjectResponse<ChannelMetadataObject<Custom>>;

    /**
     * Remove Channel Metadata request parameters.
     */
    export type RemoveChannelMetadataParameters = {
      /**
       * Channel name.
       */
      channel: string;
      /**
       * Space identifier.
       *
       * @deprecated Use `removeChannelMetadata()` method instead.
       */
      spaceId?: string;
    };

    /**
     * Response with result of the channel metadata removal.
     */
    export type RemoveChannelMetadataResponse = ObjectResponse<Record<string, unknown>>;

    /**
     * Related channel metadata object.
     *
     * Type represents chanel metadata which has been used to create membership relation with UUID.
     */
    type MembershipsObject<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = Omit<
      ObjectData<MembershipCustom>,
      'id'
    > & {
      /**
       * User's membership status.
       */
      status?: string;
      /**
       * User's membership type.
       */
      type?: string;
      /**
       * Channel for which `user` has membership.
       */
      channel:
        | ChannelMetadataObject<ChannelCustom>
        | {
            id: string;
          };
    };

    /**
     * Response with fetched page of UUID membership objects.
     */
    type MembershipsResponse<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = PagedResponse<
      MembershipsObject<MembershipCustom, ChannelCustom>
    >;

    /**
     * Fetch Memberships request parameters.
     */
    export type GetMembershipsParameters = PagedRequestParameters<
      MembershipsIncludeOptions,
      MembershipsSortingOptions
    > & {
      /**
       * Unique user identifier.
       *
       * **Important:** If not supplied then current user's uuid is used.
       *
       * @default Current `uuid`.
       */
      uuid?: string;
      /**
       * Unique user identifier.
       *
       * **Important:** If not supplied then current user's uuid is used.
       *
       * @default Current `uuidId`.
       *
       * @deprecated Use `uuid` field instead.
       */
      userId?: string;
    };

    /**
     * Response with requested channel memberships information.
     */
    export type GetMembershipsResponse<
      MembershipCustom extends CustomData,
      ChannelCustom extends CustomData,
    > = MembershipsResponse<MembershipCustom, ChannelCustom>;

    /**
     * Update Memberships request parameters.
     */
    export type SetMembershipsParameters<Custom extends CustomData> = PagedRequestParameters<
      MembershipsIncludeOptions,
      MembershipsSortingOptions
    > & {
      /**
       * Unique user identifier.
       *
       * **Important:** If not supplied then current user's uuid is used.
       *
       * @default Current `uuid`.
       */
      uuid?: string;
      /**
       * Unique user identifier.
       *
       * **Important:** If not supplied then current user's uuid is used.
       *
       * @default Current `userId`.
       *
       * @deprecated Use `uuid` field instead.
       */
      userId?: string;
      /**
       * List of channels with which UUID membership should be established.
       */
      channels: Array<string | ObjectsRelation<Custom>>;
      /**
       * List of channels with which UUID membership should be established.
       *
       * @deprecated Use `channels` field instead.
       */
      spaces?: Array<
        | string
        | (Omit<ObjectsRelation<Custom>, 'id'> & {
            /**
             * Unique Space object identifier.
             */
            spaceId: string;
          })
      >;
    };

    /**
     * Response with requested channel memberships information change.
     */
    export type SetMembershipsResponse<
      MembershipCustom extends CustomData,
      ChannelCustom extends CustomData,
    > = MembershipsResponse<MembershipCustom, ChannelCustom>;

    /**
     * Remove Memberships request parameters.
     */
    export type RemoveMembershipsParameters = PagedRequestParameters<
      MembershipsIncludeOptions,
      MembershipsSortingOptions
    > & {
      /**
       * Unique user identifier.
       *
       * **Important:** If not supplied then current user's uuid is used.
       *
       * @default Current `uuid`.
       */
      uuid?: string;
      /**
       * Unique user identifier.
       *
       * **Important:** If not supplied then current user's uuid is used.
       *
       * @default Current `userId`.
       *
       * @deprecated Use {@link uuid} field instead.
       */
      userId?: string;
      /**
       * List of channels for which membership which UUID should be removed.
       */
      channels: string[];
      /**
       * List of space names for which membership which UUID should be removed.
       *
       * @deprecated Use {@link channels} field instead.
       */
      spaceIds?: string[];
    };

    /**
     * Response with remaining memberships.
     */
    export type RemoveMembershipsResponse<
      MembershipCustom extends CustomData,
      ChannelCustom extends CustomData,
    > = MembershipsResponse<MembershipCustom, ChannelCustom>;

    /**
     * Related UUID metadata object.
     *
     * Type represents UUID metadata which has been used to when added members to the channel.
     */
    type MembersObject<MemberCustom extends CustomData, UUIDCustom extends CustomData> = Omit<
      ObjectData<MemberCustom>,
      'id'
    > & {
      /**
       * Channel's member status.
       */
      status?: string;
      /**
       * Channel's member type.
       */
      type?: string;
      /**
       * Member of the `channel`.
       */
      uuid:
        | UUIDMetadataObject<UUIDCustom>
        | {
            id: string;
          };
    };

    /**
     * Response with fetched page of channel member objects.
     */
    type MembersResponse<MemberCustom extends CustomData, UUIDCustom extends CustomData> = PagedResponse<
      MembersObject<MemberCustom, UUIDCustom>
    >;

    /**
     * Fetch Members request parameters.
     */
    export type GetMembersParameters = PagedRequestParameters<MembersIncludeOptions, MembersSortingOptions> & {
      /**
       * Channel name.
       */
      channel: string;
      /**
       * Space identifier.
       *
       * @deprecated Use `channel` field instead.
       */
      spaceId?: string;
    };

    /**
     * Response with requested channel memberships information.
     */
    export type GetMembersResponse<MembersCustom extends CustomData, UUIDCustom extends CustomData> = MembersResponse<
      MembersCustom,
      UUIDCustom
    >;

    /**
     * Update Members request parameters.
     */
    export type SetChannelMembersParameters<Custom extends CustomData> = PagedRequestParameters<
      MembersIncludeOptions,
      MembersSortingOptions
    > & {
      /**
       * Channel name.
       */
      channel: string;
      /**
       * Space identifier.
       *
       * @deprecated Use `channel` field instead.
       */
      spaceId?: string;
      /**
       * List of UUIDs which should be added as `channel` members.
       */
      uuids: Array<string | ObjectsRelation<Custom>>;
      /**
       * List of UUIDs which should be added as `channel` members.
       *
       * @deprecated Use `uuids` field instead.
       */
      users?: Array<
        | string
        | (Omit<ObjectsRelation<Custom>, 'id'> & {
            /**
             * Unique User object identifier.
             */
            userId: string;
          })
      >;
    };

    /**
     * Response with requested channel members information change.
     */
    export type SetMembersResponse<MemberCustom extends CustomData, UUIDCustom extends CustomData> = MembersResponse<
      MemberCustom,
      UUIDCustom
    >;

    /**
     * Remove Members request parameters.
     */
    export type RemoveMembersParameters = PagedRequestParameters<MembersIncludeOptions, MembersSortingOptions> & {
      /**
       * Channel name.
       */
      channel: string;
      /**
       * Space identifier.
       *
       * @deprecated Use {@link channel} field instead.
       */
      spaceId?: string;
      /**
       * List of UUIDs which should be removed from the `channel` members list.
       * removed.
       */
      uuids: string[];
      /**
       * List of user identifiers which should be removed from the `channel` members list.
       * removed.
       *
       * @deprecated Use {@link uuids} field instead.
       */
      userIds?: string[];
    };

    /**
     * Response with remaining members.
     */
    export type RemoveMembersResponse<MemberCustom extends CustomData, UUIDCustom extends CustomData> = MembersResponse<
      MemberCustom,
      UUIDCustom
    >;

    /**
     * Related User metadata object.
     *
     * Type represents User metadata which has been used to when added members to the Space.
     */
    type UserMembersObject<MemberCustom extends CustomData, UUIDCustom extends CustomData> = Omit<
      ObjectData<MemberCustom>,
      'id'
    > & {
      user:
        | UUIDMetadataObject<UUIDCustom>
        | {
            id: string;
          };
    };

    /**
     * Response with fetched page of Space member objects.
     */
    export type UserMembersResponse<MemberCustom extends CustomData, UUIDCustom extends CustomData> = PagedResponse<
      UserMembersObject<MemberCustom, UUIDCustom>
    >;

    type SpaceMembershipObject<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = Omit<
      ObjectData<MembershipCustom>,
      'id'
    > & {
      space:
        | ChannelMetadataObject<ChannelCustom>
        | {
            id: string;
          };
    };

    /**
     * Response with fetched page of User membership objects.
     */
    export type SpaceMembershipsResponse<
      MembershipCustom extends CustomData,
      ChannelCustom extends CustomData,
    > = PagedResponse<SpaceMembershipObject<MembershipCustom, ChannelCustom>>;
  }

  export namespace ChannelGroups {
    /**
     * Add or remove Channels to the channel group request parameters.
     */
    export type ManageChannelGroupChannelsParameters = {
      /**
       * Name of the channel group for which channels list should be changed.
       */
      channelGroup: string;
      /**
       * List of channels to be added or removed.
       */
      channels: string[];
    };

    /**
     * Channel group channels list manage response.
     */
    export type ManageChannelGroupChannelsResponse = Record<string, unknown>;

    /**
     * Response with result of the all channel groups list.
     */
    export type ListAllChannelGroupsResponse = {
      /**
       * All channel groups with channels.
       */
      groups: string[];
    };

    /**
     * List Channel Group Channels request parameters.
     */
    export type ListChannelGroupChannelsParameters = {
      /**
       * Name of the channel group for which list of channels should be retrieved.
       */
      channelGroup: string;
    };

    /**
     * Response with result of the list channel group channels.
     */
    export type ListChannelGroupChannelsResponse = {
      /**
       * List of the channels registered withing specified channel group.
       */
      channels: string[];
    };

    /**
     * Delete Channel Group request parameters.
     */
    export type DeleteChannelGroupParameters = {
      /**
       * Name of the channel group which should be removed.
       */
      channelGroup: string;
    };

    /**
     * Delete channel group response.
     */
    export type DeleteChannelGroupResponse = Record<string, unknown>;
  }

  export namespace Publish {
    /**
     * Request configuration parameters.
     */
    export type PublishParameters = {
      /**
       * Channel name to publish messages to.
       */
      channel: string;
      /**
       * Data which should be sent to the `channel`.
       *
       * The message may be any valid JSON type including objects, arrays, strings, and numbers.
       */
      message: Payload;
      /**
       * User-specified message type.
       *
       * **Important:** string limited by **3**-**50** case-sensitive alphanumeric characters with only
       * `-` and `_` special characters allowed.
       */
      customMessageType?: string;
      /**
       * Whether published data should be available with `Storage API` later or not.
       *
       * @default `true`
       */
      storeInHistory?: boolean;
      /**
       * Whether message should be sent as part of request POST body or not.
       *
       * @default `false`
       */
      sendByPost?: boolean;
      /**
       * Metadata, which should be associated with published data.
       *
       * Associated metadata can be utilized by message filtering feature.
       */
      meta?: Payload;
      /**
       * Specify duration during which data will be available with `Storage API`.
       *
       * - If `storeInHistory` = `true`, and `ttl` = `0`, the `message` is stored with no expiry time.
       * - If `storeInHistory` = `true` and `ttl` = `X` (`X` is an Integer value), the `message` is
       * stored with an expiry time of `X` hours.
       * - If `storeInHistory` = `false`, the `ttl` parameter is ignored.
       * - If `ttl` is not specified, then expiration of the `message` defaults back to the expiry value
       * for the key.
       */
      ttl?: number;
      /**
       * Whether published data should be replicated across all data centers or not.
       *
       * @default `true`
       * @deprecated
       */
      replicate?: boolean;
    };

    /**
     * Service success response.
     */
    export type PublishResponse = {
      /**
       * High-precision time when published data has been received by the PubNub service.
       */
      timetoken: string;
    };
  }

  export namespace Signal {
    /**
     * Request configuration parameters.
     */
    export type SignalParameters = {
      /**
       * Channel name to publish signal to.
       */
      channel: string;
      /**
       * Data which should be sent to the `channel`.
       *
       * The message may be any valid JSON type including objects, arrays, strings, and numbers.
       */
      message: Payload;
      /**
       * User-specified message type.
       *
       * **Important:** string limited by **3**-**50** case-sensitive alphanumeric characters with only
       * `-` and `_` special characters allowed.
       */
      customMessageType?: string;
    };

    /**
     * Service success response.
     */
    export type SignalResponse = {
      /**
       * High-precision time when published data has been received by the PubNub service.
       */
      timetoken: string;
    };
  }

  export namespace Presence {
    /**
     * Associated presence state fetch parameters.
     */
    export type GetPresenceStateParameters = {
      /**
       * The subscriber uuid to get the current state.
       *
       * @default `current uuid`
       */
      uuid?: string;
      /**
       * List of channels for which state associated with {@link uuid} should be retrieved.
       *
       * **Important:** Either {@link channels} or {@link channelGroups} should be provided;
       */
      channels?: string[];
      /**
       * List of channel groups for which state associated with {@link uuid} should be retrieved.
       *
       * **Important:** Either {@link channels} or {@link channelGroups} should be provided;
       */
      channelGroups?: string[];
    };

    /**
     * Associated presence state fetch response.
     */
    export type GetPresenceStateResponse = {
      /**
       * Channels map to state which `uuid` has associated with them.
       */
      channels: Record<string, Payload>;
    };

    /**
     * Associate presence state parameters.
     */
    export type SetPresenceStateParameters = {
      /**
       * List of channels for which state should be associated with {@link uuid}.
       */
      channels?: string[];
      /**
       * List of channel groups for which state should be associated with {@link uuid}.
       */
      channelGroups?: string[];
      /**
       * State which should be associated with `uuid` on provided list of {@link channels} and {@link channelGroups}.
       */
      state: Payload;
    };

    /**
     * Associate presence state parameters using heartbeat.
     */
    export type SetPresenceStateWithHeartbeatParameters = {
      /**
       * List of channels for which state should be associated with {@link uuid}.
       */
      channels?: string[];
      /**
       * State which should be associated with `uuid` on provided list of {@link channels}.
       */
      state: Payload;
      /**
       * Whether `presence/heartbeat` REST API should be used to manage state or not.
       *
       * @default `false`
       */
      withHeartbeat: boolean;
    };

    /**
     * Associate presence state response.
     */
    export type SetPresenceStateResponse = {
      /**
       * State which has been associated with `uuid` on provided list of channels and groups.
       */
      state: Payload;
    };

    /**
     * Announce heartbeat parameters.
     */
    export type PresenceHeartbeatParameters = {
      /**
       * How long the server will consider the client alive for presence.The value is in seconds.
       */
      heartbeat: number;
      /**
       * List of channels for which heartbeat should be announced for {@link uuid}.
       */
      channels?: string[];
      /**
       * List of channel groups for which heartbeat should be announced for {@link uuid}.
       */
      channelGroups?: string[];
      /**
       * State which should be associated with `uuid` on provided list of {@link channels} and {@link channelGroups}.
       */
      state?: Payload;
    };

    /**
     * Announce heartbeat response.
     */
    export type PresenceHeartbeatResponse = Record<string, unknown>;

    /**
     * Presence leave parameters.
     */
    export type PresenceLeaveParameters = {
      /**
       * List of channels for which `uuid` should be marked as `offline`.
       */
      channels?: string[];
      /**
       /**
       * List of channel groups for which `uuid` should be marked as `offline`.
       */
      channelGroups?: string[];
    };

    /**
     * Presence leave response.
     */
    export type PresenceLeaveResponse = Record<string, unknown>;

    /**
     * Channel / channel group presence fetch parameters..
     */
    export type HereNowParameters = {
      /**
       * List of channels for which presence should be retrieved.
       */
      channels?: string[];
      /**
       * List of channel groups for which presence should be retrieved.
       */
      channelGroups?: string[];
      /**
       * Whether `uuid` information should be included in response or not.
       *
       * **Note:** Only occupancy information will be returned if both {@link includeUUIDs} and {@link includeState} is
       * set to `false`.
       *
       * @default `true`
       */
      includeUUIDs?: boolean;
      /**
       * Whether state associated with `uuid` should be included in response or not.
       *
       * @default `false`.
       */
      includeState?: boolean;
      /**
       * Limit the number of results returned.
       *
       * @default `1000`.
       */
      limit?: number;
      /**
       * Zero-based starting index for pagination.
       */
      offset?: number;
      /**
       * Additional query parameters.
       */
      queryParameters?: Record<string, string>;
    };

    /**
     * `uuid` where now response.
     */
    export type HereNowResponse = {
      /**
       * Total number of channels for which presence information received.
       */
      totalChannels: number;
      /**
       * Total occupancy for all retrieved channels.
       */
      totalOccupancy: number;
      /**
       * List of channels to which `uuid` currently subscribed.
       */
      channels: {
        [p: string]: {
          /**
           * List of received channel subscribers.
           *
           * **Note:** Field is missing if `uuid` and `state` not included.
           */
          occupants: {
            uuid: string;
            state?: Payload | null;
          }[];
          /**
           * Name of channel for which presence information retrieved.
           */
          name: string;
          /**
           * Total number of active subscribers in single channel.
           */
          occupancy: number;
        };
      };
    };

    /**
     * `uuid` where now parameters.
     */
    export type WhereNowParameters = {
      /**
       * The subscriber uuid to get the current state.
       *
       * @default `current uuid`
       */
      uuid?: string;
    };

    /**
     * `uuid` where now response.
     */
    export type WhereNowResponse = {
      /**
       * Channels map to state which `uuid` has associated with them.
       */
      channels: string[];
    };
  }

  export namespace History {
    /**
     * Get history request parameters.
     */
    export type GetHistoryParameters = {
      /**
       * Channel to return history messages from.
       */
      channel: string;
      /**
       * Specifies the number of historical messages to return.
       *
       * **Note:** Maximum `100` messages can be returned in single response.
       *
       * @default `100`
       */
      count?: number;
      /**
       * Whether message `meta` information should be fetched or not.
       *
       * @default `false`
       */
      includeMeta?: boolean;
      /**
       * Timetoken delimiting the `start` of `time` slice (exclusive) to pull messages from.
       */
      start?: string;
      /**
       * Timetoken delimiting the `end` of `time` slice (inclusive) to pull messages from.
       */
      end?: string;
      /**
       * Whether timeline should traverse in reverse starting with the oldest message first or not.
       *
       * If both `start` and `end` arguments are provided, `reverse` is ignored and messages are
       * returned starting with the newest message.
       */
      reverse?: boolean;
      /**
       * Whether message timetokens should be stringified or not.
       *
       * @default `false`
       */
      stringifiedTimeToken?: boolean;
    };

    /**
     * Get history response.
     */
    export type GetHistoryResponse = {
      /**
       * List of previously published messages.
       */
      messages: {
        /**
         * Message payload (decrypted).
         */
        entry: Payload;
        /**
         * When message has been received by PubNub service.
         */
        timetoken: string | number;
        /**
         * Additional data which has been published along with message to be used with real-time
         * events filter expression.
         */
        meta?: Payload;
        /**
         * Message decryption error (if attempt has been done).
         */
        error?: string;
      }[];
      /**
       * Received messages timeline start.
       */
      startTimeToken: string | number;
      /**
       * Received messages timeline end.
       */
      endTimeToken: string | number;
    };

    /**
     * PubNub-defined message type.
     *
     * Types of messages which can be retrieved with fetch messages REST API.
     */
    export enum PubNubMessageType {
      /**
       * Regular message.
       */
      Message = -1,
      /**
       * File message.
       */
      Files = 4,
    }

    /**
     * Per-message actions information.
     */
    export type Actions = {
      /**
       * Message action type.
       */
      [t: string]: {
        /**
         * Message action value.
         */
        [v: string]: {
          /**
           * Unique identifier of the user which reacted on message.
           */
          uuid: string;
          /**
           * High-precision PubNub timetoken with time when {@link uuid} reacted on message.
           */
          actionTimetoken: string;
        }[];
      };
    };

    /**
     * Additional message actions fetch information.
     */
    export type MoreActions = {
      /**
       * Prepared fetch messages with actions REST API URL.
       */
      url: string;
      /**
       * Next page time offset.
       */
      start: string;
      /**
       * Number of messages to retrieve with next page.
       */
      max: number;
    };

    /**
     * Common content of the fetched message.
     */
    type BaseFetchedMessage = {
      /**
       * Name of channel for which message has been retrieved.
       */
      channel: string;
      /**
       * When message has been received by PubNub service.
       */
      timetoken: string | number;
      /**
       * Message publisher unique identifier.
       */
      uuid?: string;
      /**
       * Additional data which has been published along with message to be used with real-time
       * events filter expression.
       */
      meta?: Payload;
      /**
       * Message decryption error (if attempt has been done).
       */
      error?: string;
    };

    /**
     * Regular message published to the channel.
     */
    export type RegularMessage = BaseFetchedMessage & {
      /**
       * Message payload (decrypted).
       */
      message: Payload;
      /**
       * PubNub-defined message type.
       */
      messageType?: PubNubMessageType.Message;
      /**
       * User-provided message type.
       */
      customMessageType?: string;
    };

    /**
     * File message published to the channel.
     */
    export type FileMessage = BaseFetchedMessage & {
      /**
       * Message payload (decrypted).
       */
      message: {
        /**
         * File annotation message.
         */
        message?: Payload;
        /**
         * File information.
         */
        file: {
          /**
           * Unique file identifier.
           */
          id: string;
          /**
           * Name with which file has been stored.
           */
          name: string;
          /**
           * File's content mime-type.
           */
          'mime-type': string;
          /**
           * Stored file size.
           */
          size: number;
          /**
           * Pre-computed file download Url.
           */
          url: string;
        };
      };
      /**
       * PubNub-defined message type.
       */
      messageType?: PubNubMessageType.Files;
      /**
       * User-provided message type.
       */
      customMessageType?: string;
    };

    /**
     * Fetched message entry in channel messages list.
     */
    export type FetchedMessage = RegularMessage | FileMessage;

    /**
     * Fetched with actions message entry in channel messages list.
     */
    export type FetchedMessageWithActions = FetchedMessage & {
      /**
       * List of message reactions.
       */
      actions?: Actions;
      /**
       * List of message reactions.
       *
       * @deprecated Use {@link actions} field instead.
       */
      data?: Actions;
    };

    /**
     * Fetch messages request parameters.
     */
    export type FetchMessagesParameters = {
      /**
       * Specifies channels to return history messages from.
       *
       * **Note:** Maximum of `500` channels are allowed.
       */
      channels: string[];
      /**
       * Specifies the number of historical messages to return per channel.
       *
       * **Note:** Default is `100` per single channel and `25` per multiple channels or per
       * single channel if {@link includeMessageActions} is used.
       *
       * @default `100` or `25`
       */
      count?: number;
      /**
       * Include messages' custom type flag.
       *
       * Message / signal and file messages may contain user-provided type.
       */
      includeCustomMessageType?: boolean;
      /**
       * Whether message type should be returned with each history message or not.
       *
       * @default `true`
       */
      includeMessageType?: boolean;
      /**
       * Whether publisher `uuid` should be returned with each history message or not.
       *
       * @default `true`
       */
      includeUUID?: boolean;
      /**
       * Whether publisher `uuid` should be returned with each history message or not.
       *
       * @deprecated Use {@link includeUUID} property instead.
       */
      includeUuid?: boolean;
      /**
       * Whether message `meta` information should be fetched or not.
       *
       * @default `false`
       */
      includeMeta?: boolean;
      /**
       * Whether message-added message actions should be fetched or not.
       *
       * If used, the limit of messages retrieved will be `25` per single channel.
       *
       * Each message can have a maximum of `25000` actions attached to it. Consider the example of
       * querying for 10 messages. The first five messages have 5000 actions attached to each of
       * them. The API will return the first 5 messages and all their 25000 actions. The response
       * will also include a `more` link to get the remaining 5 messages.
       *
       * **Important:** Truncation will happen if the number of actions on the messages returned
       * is > 25000.
       *
       * @default `false`
       *
       * @throws Exception if API is called with more than one channel.
       */
      includeMessageActions?: boolean;
      /**
       * Timetoken delimiting the `start` of `time` slice (exclusive) to pull messages from.
       */
      start?: string;
      /**
       * Timetoken delimiting the `end` of `time` slice (inclusive) to pull messages from.
       */
      end?: string;
      /**
       * Whether message timetokens should be stringified or not.
       *
       * @default `false`
       */
      stringifiedTimeToken?: boolean;
    };

    /**
     * Fetch messages response.
     */
    export type FetchMessagesForChannelsResponse = {
      /**
       * List of previously published messages per requested channel.
       */
      channels: {
        [p: string]: FetchedMessage[];
      };
    };

    /**
     * Fetch messages with reactions response.
     */
    export type FetchMessagesWithActionsResponse = {
      channels: {
        [p: string]: FetchedMessageWithActions[];
      };
      /**
       * Additional message actions fetch information.
       */
      more: MoreActions;
    };

    /**
     * Fetch messages response.
     */
    export type FetchMessagesResponse = FetchMessagesForChannelsResponse | FetchMessagesWithActionsResponse;

    /**
     * Message count request parameters.
     */
    export type MessageCountParameters = {
      /**
       * The channels to fetch the message count.
       */
      channels: string[];
      /**
       * List of timetokens, in order of the {@link channels} list.
       *
       * Specify a single timetoken to apply it to all channels. Otherwise, the list of timetokens
       * must be the same length as the list of {@link channels}, or the function returns an error
       * flag.
       */
      channelTimetokens?: string[];
      /**
       * High-precision PubNub timetoken starting from which number of messages should be counted.
       *
       * Same timetoken will be used to count messages for each passed {@link channels}.
       *
       * @deprecated Use {@link channelTimetokens} field instead.
       */
      timetoken?: string;
    };

    /**
     * Message count response.
     */
    export type MessageCountResponse = {
      /**
       * Map of channel names to the number of counted messages.
       */
      channels: Record<string, number>;
    };

    /**
     * Delete messages from channel parameters.
     */
    export type DeleteMessagesParameters = {
      /**
       * Specifies channel messages to be deleted from history.
       */
      channel: string;
      /**
       * Timetoken delimiting the start of time slice (exclusive) to delete messages from.
       */
      start?: string;
      /**
       * Timetoken delimiting the end of time slice (inclusive) to delete messages from.
       */
      end?: string;
    };

    /**
     * Delete messages from channel response.
     */
    export type DeleteMessagesResponse = Record<string, unknown>;
  }

  export namespace MessageAction {
    /**
     * Message reaction object type.
     */
    export type MessageAction = {
      /**
       * What feature this message action represents.
       */
      type: string;
      /**
       * Value which should be stored along with message action.
       */
      value: string;
      /**
       * Unique identifier of the user which added message action.
       */
      uuid: string;
      /**
       * Timetoken of when message reaction has been added.
       *
       * **Note:** This token required when it will be required to remove reaction.
       */
      actionTimetoken: string;
      /**
       * Timetoken of message to which `action` has been added.
       */
      messageTimetoken: string;
    };

    /**
     * More message actions fetch information.
     */
    export type MoreMessageActions = {
      /**
       * Prepared REST API url to fetch next page with message actions.
       */
      url: string;
      /**
       * Message action timetoken denoting the start of the range requested with next page.
       *
       * **Note:** Return values will be less than {@link start}.
       */
      start: string;
      /**
       * Message action timetoken denoting the end of the range requested with next page.
       *
       * **Note:** Return values will be greater than or equal to {@link end}.
       */
      end: string;
      /**
       * Number of message actions to return in next response.
       */
      limit: number;
    };

    /**
     * Add Message Action request parameters.
     */
    export type AddMessageActionParameters = {
      /**
       * Name of channel which stores the message for which {@link action} should be added.
       */
      channel: string;
      /**
       * Timetoken of message for which {@link action} should be added.
       */
      messageTimetoken: string;
      /**
       * Message `action` information.
       */
      action: {
        /**
         * What feature this message action represents.
         */
        type: string;
        /**
         * Value which should be stored along with message action.
         */
        value: string;
      };
    };

    /**
     * Response with added message action object.
     */
    export type AddMessageActionResponse = {
      data: MessageAction;
    };

    /**
     * Get Message Actions request parameters.
     */
    export type GetMessageActionsParameters = {
      /**
       * Name of channel from which list of messages `actions` should be retrieved.
       */
      channel: string;
      /**
       * Message action timetoken denoting the start of the range requested.
       *
       * **Note:** Return values will be less than {@link start}.
       */
      start?: string;
      /**
       * Message action timetoken denoting the end of the range requested.
       *
       * **Note:** Return values will be greater than or equal to {@link end}.
       */
      end?: string;
      /**
       * Number of message actions to return in response.
       */
      limit?: number;
    };

    /**
     * Response with message actions in specific `channel`.
     */
    export type GetMessageActionsResponse = {
      /**
       * Retrieved list of message actions.
       */
      data: MessageAction[];
      /**
       * Received message actions time frame start.
       */
      start: string | null;
      /**
       * Received message actions time frame end.
       */
      end: string | null;
      /**
       * More message actions fetch information.
       */
      more?: MoreMessageActions;
    };

    /**
     * Remove Message Action request parameters.
     */
    export type RemoveMessageActionParameters = {
      /**
       * Name of channel which store message for which `action` should be removed.
       */
      channel: string;
      /**
       * Timetoken of message for which `action` should be removed.
       */
      messageTimetoken: string;
      /**
       * Action addition timetoken.
       */
      actionTimetoken: string;
    };

    /**
     * Response with message remove result.
     */
    export type RemoveMessageActionResponse = {
      data: Record<string, unknown>;
    };
  }

  export namespace FileSharing {
    /**
     * Shared file object.
     */
    export type SharedFile = {
      /**
       * Name with which file has been stored.
       */
      name: string;
      /**
       * Unique service-assigned file identifier.
       */
      id: string;
      /**
       * Shared file size.
       */
      size: number;
      /**
       * ISO 8601 time string when file has been shared.
       */
      created: string;
    };

    /**
     * List Files request parameters.
     */
    export type ListFilesParameters = {
      /**
       * Name of channel for which list of files should be requested.
       */
      channel: string;
      /**
       * How many entries return with single response.
       */
      limit?: number;
      /**
       * Next files list page token.
       */
      next?: string;
    };

    /**
     * List Files request response.
     */
    export type ListFilesResponse = {
      /**
       * Files list fetch result status code.
       */
      status: number;
      /**
       * List of fetched file objects.
       */
      data: SharedFile[];
      /**
       * Next files list page token.
       */
      next: string;
      /**
       * Number of retrieved files.
       */
      count: number;
    };

    /**
     * Send File request parameters.
     */
    export type SendFileParameters<FileParameters> = Omit<PublishFileMessageParameters, 'fileId' | 'fileName'> & {
      /**
       * Channel to send the file to.
       */
      channel: string;
      /**
       * File to send.
       */
      file: FileParameters;
    };

    /**
     * Send File request response.
     */
    export type SendFileResponse = PublishFileMessageResponse & {
      /**
       * Send file request processing status code.
       */
      status: number;
      /**
       * Actual file name under which file has been stored.
       *
       * File name and unique {@link id} can be used to download file from the channel later.
       *
       * **Important:** Actual file name may be different from the one which has been used during file
       * upload.
       */
      name: string;
      /**
       * Unique file identifier.
       *
       * Unique file identifier, and it's {@link name} can be used to download file from the channel
       * later.
       */
      id: string;
    };

    /**
     * Upload File request parameters.
     */
    export type UploadFileParameters = {
      /**
       * Unique file identifier.
       *
       * Unique file identifier, and it's {@link fileName} can be used to download file from the channel
       * later.
       */
      fileId: string;
      /**
       * Actual file name under which file has been stored.
       *
       * File name and unique {@link fileId} can be used to download file from the channel later.
       *
       * **Note:** Actual file name may be different from the one which has been used during file
       * upload.
       */
      fileName: string;
      /**
       * File which should be uploaded.
       */
      file: PubNubFileInterface;
      /**
       * Pre-signed file upload Url.
       */
      uploadUrl: string;
      /**
       * An array of form fields to be used in the pre-signed POST request.
       *
       * **Important:** Form data fields should be passed in exact same order as received from
       * the PubNub service.
       */
      formFields: {
        /**
         * Form data field name.
         */
        name: string;
        /**
         * Form data field value.
         */
        value: string;
      }[];
    };

    /**
     * Upload File request response.
     */
    export type UploadFileResponse = {
      /**
       * Upload File request processing status code.
       */
      status: number;
      /**
       * Service processing result response.
       */
      message: Payload;
    };

    /**
     * Generate File Upload URL request parameters.
     */
    export type GenerateFileUploadUrlParameters = {
      /**
       * Name of channel to which file should be uploaded.
       */
      channel: string;
      /**
       * Actual name of the file which should be uploaded.
       */
      name: string;
    };

    /**
     * Generation File Upload URL request response.
     */
    export type GenerateFileUploadUrlResponse = {
      /**
       * Unique file identifier.
       *
       * Unique file identifier, and it's {@link name} can be used to download file from the channel
       * later.
       */
      id: string;
      /**
       * Actual file name under which file has been stored.
       *
       * File name and unique {@link id} can be used to download file from the channel later.
       *
       * **Note:** Actual file name may be different from the one which has been used during file
       * upload.
       */
      name: string;
      /**
       * Pre-signed URL for file upload.
       */
      url: string;
      /**
       * An array of form fields to be used in the pre-signed POST request.
       *
       * **Important:** Form data fields should be passed in exact same order as received from
       * the PubNub service.
       */
      formFields: {
        /**
         * Form data field name.
         */
        name: string;
        /**
         * Form data field value.
         */
        value: string;
      }[];
    };

    /**
     * Publish File Message request parameters.
     */
    export type PublishFileMessageParameters = {
      /**
       * Name of channel to which file has been sent.
       */
      channel: string;
      /**
       * File annotation message.
       */
      message?: Payload;
      /**
       * User-specified message type.
       *
       * **Important:** string limited by **3**-**50** case-sensitive alphanumeric characters with only
       * `-` and `_` special characters allowed.
       */
      customMessageType?: string;
      /**
       * Custom file and message encryption key.
       *
       * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} configured for PubNub client
       * instance or encrypt file prior {@link PubNub#sendFile|sendFile} method call.
       */
      cipherKey?: string;
      /**
       * Unique file identifier.
       *
       * Unique file identifier, and it's {@link fileName} can be used to download file from the channel
       * later.
       */
      fileId: string;
      /**
       * Actual file name under which file has been stored.
       *
       * File name and unique {@link fileId} can be used to download file from the channel later.
       *
       * **Note:** Actual file name may be different from the one which has been used during file
       * upload.
       */
      fileName: string;
      /**
       * Whether published file messages should be stored in the channel's history.
       *
       * **Note:** If `storeInHistory` not specified, then the history configuration on the key is
       * used.
       *
       * @default `true`
       */
      storeInHistory?: boolean;
      /**
       * How long the message should be stored in the channel's history.
       *
       * **Note:** If not specified, defaults to the key set's retention value.
       *
       * @default `0`
       */
      ttl?: number;
      /**
       * Metadata, which should be associated with published file.
       *
       * Associated metadata can be utilized by message filtering feature.
       */
      meta?: Payload;
    };

    /**
     * Publish File Message request response.
     */
    export type PublishFileMessageResponse = {
      /**
       * High-precision time when published file message has been received by the PubNub service.
       */
      timetoken: string;
    };

    /**
     * Download File request parameters.
     */
    export type DownloadFileParameters = FileUrlParameters & {
      /**
       * Custom file and message encryption key.
       *
       * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} configured for PubNub client
       * instance or encrypt file prior {@link PubNub#sendFile|sendFile} method call.
       */
      cipherKey?: string;
    };

    /**
     * Generate File download Url request parameters.
     */
    export type FileUrlParameters = {
      /**
       * Name of channel where file has been sent.
       */
      channel: string;
      /**
       * Unique file identifier.
       *
       * Unique file identifier, and it's {@link name} can be used to download file from the channel
       * later.
       */
      id: string;
      /**
       * Actual file name under which file has been stored.
       *
       * File name and unique {@link id} can be used to download file from the channel later.
       *
       * **Important:** Actual file name may be different from the one which has been used during file
       * upload.
       */
      name: string;
    };

    /**
     * Generate File Download Url response.
     */
    export type FileUrlResponse = string;

    /**
     * Delete File request parameters.
     */
    export type DeleteFileParameters = {
      /**
       * Name of channel where file has been sent.
       */
      channel: string;
      /**
       * Unique file identifier.
       *
       * Unique file identifier, and it's {@link name} can be used to download file from the channel
       * later.
       */
      id: string;
      /**
       * Actual file name under which file has been stored.
       *
       * File name and unique {@link id} can be used to download file from the channel later.
       *
       * **Important:** Actual file name may be different from the one which has been used during file
       * upload.
       */
      name: string;
    };

    /**
     * Delete File request response.
     */
    export type DeleteFileResponse = {
      /**
       * Delete File request processing status code.
       */
      status: number;
    };
  }

  export namespace PAM {
    /**
     * Metadata which will be associated with access token.
     */
    export type Metadata = Record<string, string | number | boolean | null>;

    /**
     * Channel-specific token permissions.
     */
    export type ChannelTokenPermissions = {
      /**
       * Whether `read` operations are permitted for corresponding level or not.
       */
      read?: boolean;
      /**
       * Whether `write` operations are permitted for corresponding level or not.
       */
      write?: boolean;
      /**
       * Whether `get` operations are permitted for corresponding level or not.
       */
      get?: boolean;
      /**
       * Whether `manage` operations are permitted for corresponding level or not.
       */
      manage?: boolean;
      /**
       * Whether `update` operations are permitted for corresponding level or not.
       */
      update?: boolean;
      /**
       * Whether `join` operations are permitted for corresponding level or not.
       */
      join?: boolean;
      /**
       * Whether `delete` operations are permitted for corresponding level or not.
       */
      delete?: boolean;
    };

    /**
     * Space-specific token permissions.
     */
    type SpaceTokenPermissions = ChannelTokenPermissions;

    /**
     * Channel group-specific token permissions.
     */
    export type ChannelGroupTokenPermissions = {
      /**
       * Whether `read` operations are permitted for corresponding level or not.
       */
      read?: boolean;
      /**
       * Whether `manage` operations are permitted for corresponding level or not.
       */
      manage?: boolean;
    };

    /**
     * Uuid-specific token permissions.
     */
    export type UuidTokenPermissions = {
      /**
       * Whether `get` operations are permitted for corresponding level or not.
       */
      get?: boolean;
      /**
       * Whether `update` operations are permitted for corresponding level or not.
       */
      update?: boolean;
      /**
       * Whether `delete` operations are permitted for corresponding level or not.
       */
      delete?: boolean;
    };

    /**
     * User-specific token permissions.
     */
    type UserTokenPermissions = UuidTokenPermissions;

    /**
     * Generate access token with permissions.
     *
     * Generate time-limited access token with required permissions for App Context objects.
     */
    export type ObjectsGrantTokenParameters = {
      /**
       * Total number of minutes for which the token is valid.
       *
       * The minimum allowed value is `1`.
       * The maximum is `43,200` minutes (`30` days).
       */
      ttl: number;
      /**
       * Object containing resource permissions.
       */
      resources?: {
        /**
         * Object containing `spaces` metadata permissions.
         */
        spaces?: Record<string, SpaceTokenPermissions>;
        /**
         * Object containing `users` permissions.
         */
        users?: Record<string, UserTokenPermissions>;
      };
      /**
       * Object containing permissions to multiple resources specified by a RegEx pattern.
       */
      patterns?: {
        /**
         * Object containing `spaces` metadata permissions.
         */
        spaces?: Record<string, SpaceTokenPermissions>;
        /**
         * Object containing `users` permissions.
         */
        users?: Record<string, UserTokenPermissions>;
      };
      /**
       * Extra metadata to be published with the request.
       *
       * **Important:** Values must be scalar only; `arrays` or `objects` aren't supported.
       */
      meta?: Metadata;
      /**
       * Single `userId` which is authorized to use the token to make API requests to PubNub.
       */
      authorizedUserId?: string;
    };

    /**
     * Generate token with permissions.
     *
     * Generate time-limited access token with required permissions for resources.
     */
    export type GrantTokenParameters = {
      /**
       * Total number of minutes for which the token is valid.
       *
       * The minimum allowed value is `1`.
       * The maximum is `43,200` minutes (`30` days).
       */
      ttl: number;
      /**
       * Object containing resource permissions.
       */
      resources?: {
        /**
         * Object containing `uuid` metadata permissions.
         */
        uuids?: Record<string, UuidTokenPermissions>;
        /**
         * Object containing `channel` permissions.
         */
        channels?: Record<string, ChannelTokenPermissions>;
        /**
         * Object containing `channel group` permissions.
         */
        groups?: Record<string, ChannelGroupTokenPermissions>;
      };
      /**
       * Object containing permissions to multiple resources specified by a RegEx pattern.
       */
      patterns?: {
        /**
         * Object containing `uuid` metadata permissions to apply to all `uuids` matching the RegEx
         * pattern.
         */
        uuids?: Record<string, UuidTokenPermissions>;
        /**
         * Object containing `channel` permissions to apply to all `channels` matching the RegEx
         * pattern.
         */
        channels?: Record<string, ChannelTokenPermissions>;
        /**
         * Object containing `channel group` permissions to apply to all `channel groups` matching the
         * RegEx pattern.
         */
        groups?: Record<string, ChannelGroupTokenPermissions>;
      };
      /**
       * Extra metadata to be published with the request.
       *
       * **Important:** Values must be scalar only; `arrays` or `objects` aren't supported.
       */
      meta?: Metadata;
      /**
       * Single `uuid` which is authorized to use the token to make API requests to PubNub.
       */
      authorized_uuid?: string;
    };

    /**
     * Response with generated access token.
     */
    export type GrantTokenResponse = string;

    /**
     * Access token for which permissions should be revoked.
     */
    export type RevokeParameters = string;

    /**
     * Response with revoked access token.
     */
    export type RevokeTokenResponse = Record<string, unknown>;

    /**
     * Decoded access token representation.
     */
    export type Token = {
      /**
       * Token version.
       */
      version: number;
      /**
       * Token generation date time.
       */
      timestamp: number;
      /**
       * Maximum duration (in minutes) during which token will be valid.
       */
      ttl: number;
      /**
       * Permissions granted to specific resources.
       */
      resources?: Partial<Record<'channels' | 'groups' | 'uuids', Record<string, Permissions | undefined>>>;
      /**
       * Permissions granted to resources which match specified regular expression.
       */
      patterns?: Partial<Record<'channels' | 'groups' | 'uuids', Record<string, Permissions | undefined>>>;
      /**
       * The uuid that is exclusively authorized to use this token to make API requests.
       */
      authorized_uuid?: string;
      /**
       * PAM token content signature.
       */
      signature: ArrayBuffer;
      /**
       * Additional information which has been added to the token.
       */
      meta?: Payload;
    };

    /**
     * Granted resource permissions.
     *
     * **Note:** Following operations doesn't require any permissions:
     * - unsubscribe from channel / channel group
     * - where now
     */
    export type Permissions = {
      /**
       * Resource read permission.
       *
       * Read permission required for:
       * - subscribe to channel / channel group (including presence versions `-pnpres`)
       * - here now
       * - get presence state
       * - set presence state
       * - fetch history
       * - fetch messages count
       * - list shared files
       * - download shared file
       * - enable / disable push notifications
       * - get message actions
       * - get history with message actions
       */
      read: boolean;
      /**
       * Resource write permission.
       *
       * Write permission required for:
       * - publish message / signal
       * - share file
       * - add message actions
       */
      write: boolean;
      /**
       * Resource manage permission.
       *
       * Manage permission required for:
       * - add / remove channels to / from the channel group
       * - list channels in group
       * - remove channel group
       * - set / remove channel members
       */
      manage: boolean;
      /**
       * Resource delete permission.
       *
       * Delete permission required for:
       * - delete messages from history
       * - delete shared file
       * - delete user metadata
       * - delete channel metadata
       * - remove message action
       */
      delete: boolean;
      /**
       * Resource get permission.
       *
       * Get permission required for:
       * - get user metadata
       * - get channel metadata
       * - get channel members
       */
      get: boolean;
      /**
       * Resource update permission.
       *
       * Update permissions required for:
       * - set user metadata
       * - set channel metadata
       * - set / remove user membership
       */
      update: boolean;
      /**
       * Resource `join` permission.
       *
       * `Join` permission required for:
       * - set / remove channel members
       */
      join: boolean;
    };

    /**
     * Channel-specific permissions.
     *
     * Permissions include objects to the App Context Channel object as well.
     */
    type ChannelPermissions = {
      /**
       * Whether `read` operations are permitted for corresponding level or not.
       */
      r?: 0 | 1;
      /**
       * Whether `write` operations are permitted for corresponding level or not.
       */
      w?: 0 | 1;
      /**
       * Whether `delete` operations are permitted for corresponding level or not.
       */
      d?: 0 | 1;
      /**
       * Whether `get` operations are permitted for corresponding level or not.
       */
      g?: 0 | 1;
      /**
       * Whether `update` operations are permitted for corresponding level or not.
       */
      u?: 0 | 1;
      /**
       * Whether `manage` operations are permitted for corresponding level or not.
       */
      m?: 0 | 1;
      /**
       * Whether `join` operations are permitted for corresponding level or not.
       */
      j?: 0 | 1;
      /**
       * Duration for which permissions has been granted.
       */
      ttl?: number;
    };

    /**
     * Channel group-specific permissions.
     */
    type ChannelGroupPermissions = {
      /**
       * Whether `read` operations are permitted for corresponding level or not.
       */
      r?: 0 | 1;
      /**
       * Whether `manage` operations are permitted for corresponding level or not.
       */
      m?: 0 | 1;
      /**
       * Duration for which permissions has been granted.
       */
      ttl?: number;
    };

    /**
     * App Context User-specific permissions.
     */
    type UserPermissions = {
      /**
       * Whether `get` operations are permitted for corresponding level or not.
       */
      g?: 0 | 1;
      /**
       * Whether `update` operations are permitted for corresponding level or not.
       */
      u?: 0 | 1;
      /**
       * Whether `delete` operations are permitted for corresponding level or not.
       */
      d?: 0 | 1;
      /**
       * Duration for which permissions has been granted.
       */
      ttl?: number;
    };

    /**
     * Common permissions audit response content.
     */
    type BaseAuditResponse<
      Level extends 'channel' | 'channel+auth' | 'channel-group' | 'channel-group+auth' | 'user' | 'subkey',
    > = {
      /**
       * Permissions level.
       */
      level: Level;
      /**
       * Subscription key at which permissions has been granted.
       */
      subscribe_key: string;
      /**
       * Duration for which permissions has been granted.
       */
      ttl?: number;
    };

    /**
     * Auth keys permissions for specified `level`.
     */
    type AuthKeysPermissions<LevelPermissions> = {
      /**
       * Auth keys-based permissions for specified `level` permission.
       */
      auths: Record<string, LevelPermissions>;
    };

    /**
     * Single channel permissions audit result.
     */
    type ChannelPermissionsResponse = BaseAuditResponse<'channel+auth'> & {
      /**
       * Name of channel for which permissions audited.
       */
      channel: string;
    } & AuthKeysPermissions<ChannelPermissions>;

    /**
     * Multiple channels permissions audit result.
     */
    type ChannelsPermissionsResponse = BaseAuditResponse<'channel'> & {
      /**
       * Per-channel permissions.
       */
      channels: Record<string, ChannelPermissions & AuthKeysPermissions<ChannelPermissions>>;
    };

    /**
     * Single channel group permissions result.
     */
    type ChannelGroupPermissionsResponse = BaseAuditResponse<'channel-group+auth'> & {
      /**
       * Name of channel group for which permissions audited.
       */
      'channel-group': string;
    } & AuthKeysPermissions<ChannelGroupPermissions>;

    /**
     * Multiple channel groups permissions audit result.
     */
    type ChannelGroupsPermissionsResponse = BaseAuditResponse<'channel'> & {
      /**
       * Per-channel group permissions.
       */
      'channel-groups': Record<string, ChannelGroupPermissions & AuthKeysPermissions<ChannelGroupPermissions>>;
    };

    /**
     * App Context User permissions audit result.
     */
    type UserPermissionsResponse = BaseAuditResponse<'user'> & {
      /**
       * Name of channel for which `user` permissions audited.
       */
      channel: string;
    } & AuthKeysPermissions<UserPermissions>;

    /**
     * Global sub-key level permissions audit result.
     */
    type SubKeyPermissionsResponse = BaseAuditResponse<'subkey'> & {
      /**
       * Per-channel permissions.
       */
      channels: Record<string, ChannelPermissions & AuthKeysPermissions<ChannelPermissions>>;
      /**
       * Per-channel group permissions.
       */
      'channel-groups': Record<string, ChannelGroupPermissions & AuthKeysPermissions<ChannelGroupPermissions>>;
      /**
       * Per-object permissions.
       */
      objects: Record<string, UserPermissions & AuthKeysPermissions<UserPermissions>>;
    };

    /**
     * Response with permission information.
     */
    export type PermissionsResponse =
      | ChannelPermissionsResponse
      | ChannelsPermissionsResponse
      | ChannelGroupPermissionsResponse
      | ChannelGroupsPermissionsResponse
      | UserPermissionsResponse
      | SubKeyPermissionsResponse;

    /**
     * Audit permissions for provided auth keys / global permissions.
     *
     * Audit permissions on specific channel and / or channel group for the set of auth keys.
     */
    export type AuditParameters = {
      /**
       * Name of channel for which channel-based permissions should be checked for {@link authKeys}.
       */
      channel?: string;
      /**
       * Name of channel group for which channel group-based permissions should be checked for {@link authKeys}.
       */
      channelGroup?: string;
      /**
       * List of auth keys for which permissions should be checked.
       *
       * Leave this empty to check channel / group -based permissions or global permissions.
       *
       * @default `[]`
       */
      authKeys?: string[];
    };

    /**
     * Grant permissions for provided auth keys / global permissions.
     *
     * Grant permissions on specific channel and / or channel group for the set of auth keys.
     */
    export type GrantParameters = {
      /**
       * List of channels for which permissions should be granted.
       */
      channels?: string[];
      /**
       * List of channel groups for which permissions should be granted.
       */
      channelGroups?: string[];
      /**
       * List of App Context UUID for which permissions should be granted.
       */
      uuids?: string[];
      /**
       * List of auth keys for which permissions should be granted on specified objects.
       *
       * Leave this empty to grant channel / group -based permissions or global permissions.
       */
      authKeys?: string[];
      /**
       * Whether `read` operations are permitted for corresponding level or not.
       *
       * @default `false`
       */
      read?: boolean;
      /**
       * Whether `write` operations are permitted for corresponding level or not.
       *
       * @default `false`
       */
      write?: boolean;
      /**
       * Whether `delete` operations are permitted for corresponding level or not.
       *
       * @default `false`
       */
      delete?: boolean;
      /**
       * Whether `get` operations are permitted for corresponding level or not.
       *
       * @default `false`
       */
      get?: boolean;
      /**
       * Whether `update` operations are permitted for corresponding level or not.
       *
       * @default `false`
       */
      update?: boolean;
      /**
       * Whether `manage` operations are permitted for corresponding level or not.
       *
       * @default `false`
       */
      manage?: boolean;
      /**
       * Whether `join` operations are permitted for corresponding level or not.
       *
       * @default `false`
       */
      join?: boolean;
      /**
       * For how long permissions should be effective (in minutes).
       *
       * @default `1440`
       */
      ttl?: number;
    };
  }

  export namespace Time {
    /**
     * Service success response.
     */
    export type TimeResponse = {
      /**
       * High-precision time when published data has been received by the PubNub service.
       */
      timetoken: string;
    };
  }

  export namespace Push {
    /**
     * Common managed channels push notification parameters.
     */
    type ManagedDeviceChannels = {
      /**
       * Channels to register or unregister with mobile push notifications.
       */
      channels: string[];
      /**
       * The device ID to associate with mobile push notifications.
       */
      device: string;
      /**
       * Starting channel for pagination.
       *
       * **Note:** Use the last channel from the previous page request.
       */
      start?: string;
      /**
       * Number of channels to return for pagination.
       *
       * **Note:** maximum of 1000 tokens at a time.
       *
       * @default `500`
       */
      count?: number;
    };

    /**
     * List all FCM device push notification enabled channels parameters.
     */
    type ListFCMDeviceChannelsParameters = Omit<ManageFCMDeviceChannelsParameters, 'channels'>;

    /**
     * List all APNS device push notification enabled channels parameters.
     *
     * @deprecated Use `APNS2`-based endpoints.
     */
    type ListAPNSDeviceChannelsParameters = Omit<ManageAPNSDeviceChannelsParameters, 'channels'>;

    /**
     * List all APNS2 device push notification enabled channels parameters.
     */
    type ListAPNS2DeviceChannelsParameters = Omit<ManageAPNS2DeviceChannelsParameters, 'channels'>;

    /**
     * List all device push notification enabled channels parameters.
     */
    export type ListDeviceChannelsParameters =
      | ListFCMDeviceChannelsParameters
      | ListAPNSDeviceChannelsParameters
      | ListAPNS2DeviceChannelsParameters;

    /**
     * List all device push notification enabled channels response.
     */
    export type ListDeviceChannelsResponse = {
      /**
       * List of channels registered for device push notifications.
       */
      channels: string[];
    };

    /**
     * Manage FCM device push notification enabled channels parameters.
     */
    type ManageFCMDeviceChannelsParameters = ManagedDeviceChannels & {
      /**
       * Push Notifications gateway type.
       */
      pushGateway: 'fcm';
    };

    /**
     * Manage APNS device push notification enabled channels parameters.
     *
     * @deprecated Use `APNS2`-based endpoints.
     */
    type ManageAPNSDeviceChannelsParameters = ManagedDeviceChannels & {
      /**
       * Push Notifications gateway type.
       */
      pushGateway: 'apns';
    };

    /**
     * Manage APNS2 device push notification enabled channels parameters.
     */
    type ManageAPNS2DeviceChannelsParameters = ManagedDeviceChannels & {
      /**
       * Push Notifications gateway type.
       */
      pushGateway: 'apns2';
      /**
       * Environment within which device should manage list of channels with enabled notifications.
       */
      environment?: 'development' | 'production';
      /**
       * Notifications topic name (usually it is bundle identifier of application for Apple platform).
       */
      topic: string;
    };

    /**
     * Manage device push notification enabled channels parameters.
     */
    export type ManageDeviceChannelsParameters =
      | ManageFCMDeviceChannelsParameters
      | ManageAPNSDeviceChannelsParameters
      | ManageAPNS2DeviceChannelsParameters;

    /**
     * Manage device push notification enabled channels response.
     */
    export type ManageDeviceChannelsResponse = Record<string, unknown>;

    /**
     * Remove all FCM device push notification enabled channels parameters.
     */
    type RemoveFCMDeviceParameters = Omit<ManageFCMDeviceChannelsParameters, 'channels'>;

    /**
     * Manage APNS device push notification enabled channels parameters.
     *
     * @deprecated Use `APNS2`-based endpoints.
     */
    type RemoveAPNSDeviceParameters = Omit<ManageAPNSDeviceChannelsParameters, 'channels'>;

    /**
     * Manage APNS2 device push notification enabled channels parameters.
     */
    type RemoveAPNS2DeviceParameters = Omit<ManageAPNS2DeviceChannelsParameters, 'channels'>;

    /**
     * Remove all device push notification enabled channels parameters.
     */
    export type RemoveDeviceParameters =
      | RemoveFCMDeviceParameters
      | RemoveAPNSDeviceParameters
      | RemoveAPNS2DeviceParameters;

    /**
     * Remove all device push notification enabled channels response.
     */
    export type RemoveDeviceResponse = Record<string, unknown>;
  }
}

export = PubNub;
