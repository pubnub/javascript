import { Listener } from './components/listener_manager';
import NotificationsPayload from './components/push_payload';
import { TokenManager } from './components/token_manager';
import Crypto from './components/cryptography/index';
import { Payload, ResultCallback } from './types/api';
import { ClientConfiguration, PrivateClientConfiguration } from './interfaces/configuration';
import { Cryptography } from './interfaces/cryptography';
import { Transport } from './interfaces/transport';
import RequestOperation from './constants/operations';
import StatusCategory from './constants/categories';
import { RetryPolicy } from '../event-engine/core/retryPolicy';
import * as Publish from './endpoints/publish';
import * as Signal from './endpoints/signal';
import * as Subscription from './types/api/subscription';
import * as Presence from './types/api/presence';
import * as History from './types/api/history';
import * as MessageAction from './types/api/message-action';
import * as FileSharing from './types/api/file-sharing';
import { PubNubFileInterface } from './types/file';
import * as PAM from './types/api/access-manager';
import { SubscriptionOptions } from '../entities/commonTypes';
import { ChannelMetadata } from '../entities/ChannelMetadata';
import { SubscriptionSet } from '../entities/SubscriptionSet';
import { ChannelGroup } from '../entities/ChannelGroup';
import { UserMetadata } from '../entities/UserMetadata';
import { Channel } from '../entities/Channel';
import PubNubChannelGroups from './pubnub-channel-groups';
import PubNubPushNotifications from './pubnub-push';
import * as AppContext from './types/api/app-context';
import PubNubObjects from './pubnub-objects';
import * as Time from './endpoints/time';
type ClientInstanceConfiguration<CryptographyTypes> = {
    /**
     * Client-provided configuration.
     */
    configuration: PrivateClientConfiguration;
    /**
     * Transport provider for requests execution.
     */
    transport: Transport;
    /**
     * REST API endpoints access tokens manager.
     */
    tokenManager?: TokenManager;
    /**
     * Legacy crypto module implementation.
     */
    cryptography?: Cryptography<CryptographyTypes>;
    /**
     * Legacy crypto (legacy data encryption / decryption and request signature support).
     */
    crypto?: Crypto;
};
/**
 * Platform-agnostic PubNub client core.
 */
export declare class PubNubCore<CryptographyTypes, FileConstructorParameters, PlatformFile extends Partial<PubNubFileInterface> = Record<string, unknown>> {
    /**
     * Type of REST API endpoint which reported status.
     */
    static OPERATIONS: typeof RequestOperation;
    /**
     * API call status category.
     */
    static CATEGORIES: typeof StatusCategory;
    /**
     * Exponential retry policy constructor.
     */
    static ExponentialRetryPolicy: typeof RetryPolicy.ExponentialRetryPolicy;
    /**
     * Linear retry policy constructor.
     */
    static LinearRetryPolicy: typeof RetryPolicy.LinearRetryPolicy;
    /**
     * Construct notification payload which will trigger push notification.
     *
     * @param title - Title which will be shown on notification.
     * @param body - Payload which will be sent as part of notification.
     *
     * @returns Pre-formatted message payload which will trigger push notification.
     */
    static notificationPayload(title: string, body: string): NotificationsPayload;
    /**
     * Generate unique identifier.
     *
     * @returns Unique identifier.
     */
    static generateUUID(): any;
    constructor(configuration: ClientInstanceConfiguration<CryptographyTypes>);
    /**
     * PubNub client configuration.
     *
     * @returns Currently user PubNub client configuration.
     */
    get configuration(): ClientConfiguration;
    /**
     * Current PubNub client configuration.
     *
     * @returns Currently user PubNub client configuration.
     *
     * @deprecated Use {@link configuration} getter instead.
     */
    get _config(): ClientConfiguration;
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
     * Change heartbeat requests interval.
     *
     * @param interval - New presence request heartbeat intervals.
     */
    set heartbeatInterval(interval: number);
    /**
     * Change heartbeat requests interval.
     *
     * @param interval - New presence request heartbeat intervals.
     */
    setHeartbeatInterval(interval: number): void;
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
     * @throws Error empty user identifier has been provided.
     *
     * @deprecated Use the {@link PubNubCore#setUserId} or {@link PubNubCore#userId} setter instead.
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
    channel(name: string): Channel;
    /**
     * Create a `ChannelGroup` entity.
     *
     * Entity can be used for the interaction with the following API:
     * - `subscribe`
     *
     * @param name - Unique channel group name.
     * @returns `ChannelGroup` entity.
     */
    channelGroup(name: string): ChannelGroup;
    /**
     * Create a `ChannelMetadata` entity.
     *
     * Entity can be used for the interaction with the following API:
     * - `subscribe`
     *
     * @param id - Unique channel metadata object identifier.
     * @returns `ChannelMetadata` entity.
     */
    channelMetadata(id: string): ChannelMetadata;
    /**
     * Create a `UserMetadata` entity.
     *
     * Entity can be used for the interaction with the following API:
     * - `subscribe`
     *
     * @param id - Unique user metadata object identifier.
     * @returns `UserMetadata` entity.
     */
    userMetadata(id: string): UserMetadata;
    /**
     * Create subscriptions set object.
     *
     * @param parameters - Subscriptions set configuration parameters.
     */
    subscriptionSet(parameters: {
        channels?: string[];
        channelGroups?: string[];
        subscriptionOptions?: SubscriptionOptions;
    }): SubscriptionSet;
    /**
     * Schedule request execution.
     *
     * @param request - REST API request.
     * @param callback - Request completion handler callback.
     *
     * @returns Asynchronous request execution and response parsing result.
     */
    private sendRequest;
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
     * Register real-time events listener.
     *
     * @param listener - Listener with event callbacks to handle different types of events.
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
    /**
     * Publish data to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    publish(parameters: Publish.PublishParameters, callback: ResultCallback<Publish.PublishResponse>): void;
    /**
     * Publish data to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous publish data response.
     */
    publish(parameters: Publish.PublishParameters): Promise<Publish.PublishResponse>;
    /**
     * Signal data to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    signal(parameters: Signal.SignalParameters, callback: ResultCallback<Signal.SignalResponse>): void;
    /**
     * Signal data to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous signal data response.
     */
    signal(parameters: Signal.SignalParameters): Promise<Signal.SignalResponse>;
    /**
     * `Fire` a data to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link publish} method instead.
     */
    fire(parameters: Publish.PublishParameters, callback: ResultCallback<Publish.PublishResponse>): void;
    /**
     * `Fire` a data to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous signal data response.
     *
     * @deprecated Use {@link publish} method instead.
     */
    fire(parameters: Publish.PublishParameters): Promise<Publish.PublishResponse>;
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
    subscribe(parameters: Subscription.SubscribeParameters): void;
    /**
     * Perform subscribe request.
     *
     * **Note:** Method passed into managers to let them use it when required.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    private makeSubscribe;
    /**
     * Unsubscribe from specified channels and groups real-time events.
     *
     * @param parameters - Request configuration parameters.
     */
    unsubscribe(parameters: Presence.PresenceLeaveParameters): void;
    /**
     * Perform unsubscribe request.
     *
     * **Note:** Method passed into managers to let them use it when required.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    private makeUnsubscribe;
    /**
     * Unsubscribe from all channels and groups.
     */
    unsubscribeAll(): void;
    /**
     * Temporarily disconnect from real-time events stream.
     */
    disconnect(): void;
    /**
     * Restore connection to the real-time events stream.
     *
     * @param parameters - Reconnection catch up configuration. **Note:** available only with
     * enabled event engine.
     */
    reconnect(parameters?: {
        timetoken?: string;
        region?: number;
    }): void;
    /**
     * Event engine handshake subscribe.
     *
     * @param parameters - Request configuration parameters.
     */
    private subscribeHandshake;
    /**
     * Event engine receive messages subscribe.
     *
     * @param parameters - Request configuration parameters.
     */
    private subscribeReceiveMessages;
    /**
     * Get reactions to a specific message.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    getMessageActions(parameters: MessageAction.GetMessageActionsParameters, callback: ResultCallback<MessageAction.GetMessageActionsResponse>): void;
    /**
     * Get reactions to a specific message.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get reactions response.
     */
    getMessageActions(parameters: MessageAction.GetMessageActionsParameters): Promise<MessageAction.GetMessageActionsResponse>;
    /**
     * Add a reaction to a specific message.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    addMessageAction(parameters: MessageAction.AddMessageActionParameters, callback: ResultCallback<MessageAction.AddMessageActionResponse>): void;
    /**
     * Add a reaction to a specific message.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous add a reaction response.
     */
    addMessageAction(parameters: MessageAction.AddMessageActionParameters): Promise<MessageAction.AddMessageActionResponse>;
    /**
     * Remove a reaction from a specific message.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    removeMessageAction(parameters: MessageAction.RemoveMessageActionParameters, callback: ResultCallback<MessageAction.RemoveMessageActionResponse>): void;
    /**
     * Remove a reaction from a specific message.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous remove a reaction response.
     */
    removeMessageAction(parameters: MessageAction.RemoveMessageActionParameters): Promise<MessageAction.RemoveMessageActionResponse>;
    /**
     * Fetch messages history for channels.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    fetchMessages(parameters: History.FetchMessagesParameters, callback: ResultCallback<History.FetchMessagesResponse>): void;
    /**
     * Fetch messages history for channels.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous fetch messages response.
     */
    fetchMessages(parameters: History.FetchMessagesParameters): Promise<History.FetchMessagesResponse>;
    /**
     * Delete messages from the channel history.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated
     */
    deleteMessages(parameters: History.DeleteMessagesParameters, callback: ResultCallback<History.DeleteMessagesResponse>): void;
    /**
     * Delete messages from the channel history.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous delete messages response.
     *
     * @deprecated
     */
    deleteMessages(parameters: History.DeleteMessagesParameters): Promise<History.DeleteMessagesResponse>;
    /**
     * Count messages from the channels' history.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    messageCounts(parameters: History.MessageCountParameters, callback: ResultCallback<History.MessageCountResponse>): void;
    /**
     * Count messages from the channels' history.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous count messages response.
     */
    messageCounts(parameters: History.MessageCountParameters): Promise<History.MessageCountResponse>;
    /**
     * Fetch single channel history.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated
     */
    history(parameters: History.GetHistoryParameters, callback: ResultCallback<History.GetHistoryResponse>): void;
    /**
     * Fetch single channel history.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous fetch channel history response.
     *
     * @deprecated
     */
    history(parameters: History.GetHistoryParameters): Promise<History.GetHistoryResponse>;
    /**
     * Get channel's presence information.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    hereNow(parameters: Presence.HereNowParameters, callback: ResultCallback<Presence.HereNowResponse>): void;
    /**
     * Get channel presence information.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get channel's presence response.
     */
    hereNow(parameters: Presence.HereNowParameters): Promise<Presence.HereNowResponse>;
    /**
     * Get user's presence information.
     *
     * Get list of channels to which `uuid` currently subscribed.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    whereNow(parameters: Presence.WhereNowParameters, callback: ResultCallback<Presence.WhereNowResponse>): void;
    /**
     * Get user's presence information.
     *
     * Get list of channels to which `uuid` currently subscribed.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get user's presence response.
     */
    whereNow(parameters: Presence.WhereNowParameters): Promise<Presence.WhereNowResponse>;
    /**
     * Get associated user's data for channels and groups.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    getState(parameters: Presence.GetPresenceStateParameters, callback: ResultCallback<Presence.GetPresenceStateResponse>): void;
    /**
     * Get associated user's data for channels and groups.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get associated user's data response.
     */
    getState(parameters: Presence.GetPresenceStateParameters): Promise<Presence.GetPresenceStateResponse>;
    /**
     * Set associated user's data for channels and groups.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    setState(parameters: Presence.SetPresenceStateParameters | Presence.SetPresenceStateWithHeartbeatParameters, callback: ResultCallback<Presence.SetPresenceStateResponse | Presence.PresenceHeartbeatResponse>): void;
    /**
     * Set associated user's data for channels and groups.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous set associated user's data response.
     */
    setState(parameters: Presence.SetPresenceStateParameters | Presence.SetPresenceStateWithHeartbeatParameters): Promise<Presence.SetPresenceStateResponse | Presence.PresenceHeartbeatResponse>;
    /**
     * Manual presence management.
     *
     * @param parameters - Desired presence state for provided list of channels and groups.
     */
    presence(parameters: {
        connected: boolean;
        channels?: string[];
        channelGroups?: string[];
    }): void;
    /**
     * Announce user presence
     *
     * @param parameters - Desired presence state for provided list of channels and groups.
     * @param callback - Request completion handler callback.
     */
    private heartbeat;
    /**
     * Announce user `join` on specified list of channels and groups.
     *
     * @param parameters - List of channels and groups where `join` event should be sent.
     */
    private join;
    /**
     * Announce user `leave` on specified list of channels and groups.
     *
     * @param parameters - List of channels and groups where `leave` event should be sent.
     */
    private leave;
    /**
     * Announce user `leave` on all subscribed channels.
     */
    private leaveAll;
    /**
     * Grant token permission.
     *
     * Generate access token with requested permissions.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    grantToken(parameters: PAM.GrantTokenParameters, callback: ResultCallback<PAM.GrantTokenResponse>): void;
    /**
     * Grant token permission.
     *
     * Generate access token with requested permissions.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous grant token response.
     */
    grantToken(parameters: PAM.GrantTokenParameters): Promise<PAM.GrantTokenResponse>;
    /**
     * Revoke token permission.
     *
     * @param token - Access token for which permissions should be revoked.
     * @param callback - Request completion handler callback.
     */
    revokeToken(token: PAM.RevokeParameters, callback: ResultCallback<PAM.RevokeTokenResponse>): void;
    /**
     * Revoke token permission.
     *
     * @param token - Access token for which permissions should be revoked.
     *
     * @returns Asynchronous revoke token response.
     */
    revokeToken(token: PAM.RevokeParameters): Promise<PAM.RevokeTokenResponse>;
    /**
     * Get current access token.
     *
     * @returns Previously configured access token using {@link setToken} method.
     */
    get token(): string | undefined;
    /**
     * Get current access token.
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
    parseToken(token: string): {
        version: number;
        timestamp: number;
        ttl: number;
        resources?: Partial<Record<"groups" | "channels" | "uuids", Record<string, {
            read: boolean;
            write: boolean;
            manage: boolean;
            delete: boolean;
            get: boolean;
            update: boolean;
            join: boolean;
        } | undefined>>> | undefined;
        patterns?: Partial<Record<"groups" | "channels" | "uuids", Record<string, {
            read: boolean;
            write: boolean;
            manage: boolean;
            delete: boolean;
            get: boolean;
            update: boolean;
            join: boolean;
        } | undefined>>> | undefined;
        authorized_uuid?: string | undefined;
        signature: ArrayBuffer;
        meta?: Payload | undefined;
    } | undefined;
    /**
     * Grant auth key(s) permission.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link grantToken} and {@link setToken} methods instead.
     */
    grant(parameters: PAM.GrantParameters, callback: ResultCallback<PAM.PermissionsResponse>): void;
    /**
     * Grant auth key(s) permission.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous grant auth key(s) permissions response.
     *
     * @deprecated Use {@link grantToken} and {@link setToken} methods instead.
     */
    grant(parameters: PAM.GrantParameters): Promise<PAM.PermissionsResponse>;
    /**
     * Audit auth key(s) permission.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated
     */
    audit(parameters: PAM.AuditParameters, callback: ResultCallback<PAM.PermissionsResponse>): void;
    /**
     * Audit auth key(s) permission.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous audit auth key(s) permissions response.
     *
     * @deprecated
     */
    audit(parameters: PAM.AuditParameters): Promise<PAM.PermissionsResponse>;
    /**
     * PubNub App Context API group.
     */
    get objects(): PubNubObjects;
    /**
     * Fetch a paginated list of User objects.
     *
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata} method instead.
     */
    fetchUsers<Custom extends AppContext.CustomData = AppContext.CustomData>(callback: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>): void;
    /**
     * Fetch a paginated list of User objects.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata} method instead.
     */
    fetchUsers<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>, callback: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>): void;
    /**
     * Fetch a paginated list of User objects.
     *
     * @param [parameters] - Request configuration parameters.
     *
     * @returns Asynchronous get all User objects response.
     *
     * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata} method instead.
     */
    fetchUsers<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters?: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>): Promise<AppContext.GetAllUUIDMetadataResponse<Custom>>;
    /**
     * Fetch User object for currently configured PubNub client `uuid`.
     *
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata} method instead.
     */
    fetchUser<Custom extends AppContext.CustomData = AppContext.CustomData>(callback: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>): void;
    /**
     * Fetch User object for currently configured PubNub client `uuid`.
     *
     * @param parameters - Request configuration parameters. Will fetch User object for currently
     * configured PubNub client `uuid` if not set.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata} method instead.
     */
    fetchUser<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetUUIDMetadataParameters, callback: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>): void;
    /**
     * Fetch User object for currently configured PubNub client `uuid`.
     *
     * @param [parameters] - Request configuration parameters. Will fetch User object for currently
     * configured PubNub client `uuid` if not set.
     *
     * @returns Asynchronous get User object response.
     *
     * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata} method instead.
     */
    fetchUser<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters?: AppContext.GetUUIDMetadataParameters): Promise<AppContext.GetUUIDMetadataResponse<Custom>>;
    /**
     * Create User object.
     *
     * @param parameters - Request configuration parameters. Will create User object for currently
     * configured PubNub client `uuid` if not set.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata} method instead.
     */
    createUser<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetUUIDMetadataParameters<Custom>, callback: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>): void;
    /**
     * Create User object.
     *
     * @param parameters - Request configuration parameters. Will create User object for currently
     * configured PubNub client `uuid` if not set.
     *
     * @returns Asynchronous create User object response.
     *
     * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata} method instead.
     */
    createUser<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetUUIDMetadataParameters<Custom>): Promise<AppContext.SetUUIDMetadataResponse<Custom>>;
    /**
     * Update User object.
     *
     * @param parameters - Request configuration parameters. Will update User object for currently
     * configured PubNub client `uuid` if not set.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata} method instead.
     */
    updateUser<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetUUIDMetadataParameters<Custom>, callback: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>): void;
    /**
     * Update User object.
     *
     * @param parameters - Request configuration parameters. Will update User object for currently
     * configured PubNub client `uuid` if not set.
     *
     * @returns Asynchronous update User object response.
     *
     * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata} method instead.
     */
    updateUser<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetUUIDMetadataParameters<Custom>): Promise<AppContext.SetUUIDMetadataResponse<Custom>>;
    /**
     * Remove a specific User object.
     *
     * @param callback - Request completion handler callback. Will remove User object for currently
     * configured PubNub client `uuid` if not set.
     *
     * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata} method instead.
     */
    removeUser(callback: ResultCallback<AppContext.RemoveUUIDMetadataResponse>): void;
    /**
     * Remove a specific User object.
     *
     * @param parameters - Request configuration parameters. Will remove User object for currently
     * configured PubNub client `uuid` if not set.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata} method instead.
     */
    removeUser(parameters: AppContext.RemoveUUIDMetadataParameters, callback: ResultCallback<AppContext.RemoveUUIDMetadataResponse>): void;
    /**
     * Remove a specific User object.
     *
     * @param [parameters] - Request configuration parameters. Will remove User object for currently
     * configured PubNub client `uuid` if not set.
     *
     * @returns Asynchronous User object remove response.
     *
     * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata} method instead.
     */
    removeUser(parameters?: AppContext.RemoveUUIDMetadataParameters): Promise<AppContext.RemoveUUIDMetadataResponse>;
    /**
     * Fetch a paginated list of Space objects.
     *
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata} method instead.
     */
    fetchSpaces<Custom extends AppContext.CustomData = AppContext.CustomData>(callback: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>): void;
    /**
     * Fetch a paginated list of Space objects.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata} method instead.
     */
    fetchSpaces<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>, callback: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>): void;
    /**
     * Fetch a paginated list of Space objects.
     *
     * @param [parameters] - Request configuration parameters.
     *
     * @returns Asynchronous get all Space objects response.
     *
     * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata} method instead.
     */
    fetchSpaces<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters?: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>): Promise<AppContext.GetAllChannelMetadataResponse<Custom>>;
    /**
     * Fetch a specific Space object.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.getChannelMetadata} method instead.
     */
    fetchSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetChannelMetadataParameters, callback: ResultCallback<AppContext.GetChannelMetadataResponse<Custom>>): void;
    /**
     * Fetch a specific Space object.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get Channel metadata response.
     *
     * @deprecated Use {@link PubNubCore#objects.getChannelMetadata} method instead.
     */
    fetchSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetChannelMetadataParameters): Promise<AppContext.GetChannelMetadataResponse<Custom>>;
    /**
     * Create specific Space object.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
     */
    createSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetChannelMetadataParameters<Custom>, callback: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>): void;
    /**
     * Create specific Space object.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous create Space object response.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
     */
    createSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetChannelMetadataParameters<Custom>): Promise<AppContext.SetChannelMetadataResponse<Custom>>;
    /**
     * Update specific Space object.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
     */
    updateSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetChannelMetadataParameters<Custom>, callback: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>): void;
    /**
     * Update specific Space object.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous update Space object response.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
     */
    updateSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetChannelMetadataParameters<Custom>): Promise<AppContext.SetChannelMetadataResponse<Custom>>;
    /**
     * Remove Space object.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata} method instead.
     */
    removeSpace(parameters: AppContext.RemoveChannelMetadataParameters, callback: ResultCallback<AppContext.RemoveChannelMetadataResponse>): void;
    /**
     * Remove a specific Space object.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous Space object remove response.
     *
     * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata} method instead.
     */
    removeSpace(parameters: AppContext.RemoveChannelMetadataParameters): Promise<AppContext.RemoveChannelMetadataResponse>;
    /**
     * Fetch paginated list of specific Space members or specific User memberships.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.getChannelMembers} or {@link PubNubCore#objects.getMemberships}
     * methods instead.
     */
    fetchMemberships<RelationCustom extends AppContext.CustomData = AppContext.CustomData, MetadataCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetMembershipsParameters | AppContext.GetMembersParameters, callback: ResultCallback<AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom> | AppContext.UserMembersResponse<RelationCustom, MetadataCustom>>): void;
    /**
     * Fetch paginated list of specific Space members or specific User memberships.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get specific Space members or specific User memberships response.
     *
     * @deprecated Use {@link PubNubCore#objects.getChannelMembers} or {@link PubNubCore#objects.getMemberships}
     * methods instead.
     */
    fetchMemberships<RelationCustom extends AppContext.CustomData = AppContext.CustomData, MetadataCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetMembershipsParameters | AppContext.GetMembersParameters): Promise<AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom> | AppContext.UserMembersResponse<RelationCustom, MetadataCustom>>;
    /**
     * Add members to specific Space or memberships specific User.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
     * methods instead.
     */
    addMemberships<Custom extends AppContext.CustomData = AppContext.CustomData, MetadataCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>, callback: ResultCallback<AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom>>): void;
    /**
     * Add members to specific Space or memberships specific User.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous add members to specific Space or memberships specific User response.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
     * methods instead.
     */
    addMemberships<Custom extends AppContext.CustomData = AppContext.CustomData, MetadataCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>): Promise<AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom>>;
    /**
     * Update specific Space members or User memberships.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
     * methods instead.
     */
    updateMemberships<Custom extends AppContext.CustomData = AppContext.CustomData, MetadataCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>, callback: ResultCallback<AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom>>): void;
    /**
     * Update specific Space members or User memberships.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous update Space members or User memberships response.
     *
     * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
     * methods instead.
     */
    updateMemberships<Custom extends AppContext.CustomData = AppContext.CustomData, MetadataCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>): Promise<AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom>>;
    /**
     * Remove User membership.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     *
     * @deprecated Use {@link PubNubCore#objects.removeMemberships} or {@link PubNubCore#objects.removeChannelMembers}
     * methods instead
     * from `objects` API group..
     */
    removeMemberships<RelationCustom extends AppContext.CustomData = AppContext.CustomData, MetadataCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.RemoveMembersParameters | AppContext.RemoveMembershipsParameters, callback: ResultCallback<AppContext.RemoveMembersResponse<RelationCustom, MetadataCustom> | AppContext.RemoveMembershipsResponse<RelationCustom, MetadataCustom>>): void;
    /**
     * Remove User membership.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous memberships modification response.
     *
     * @deprecated Use {@link PubNubCore#objects.removeMemberships} or {@link PubNubCore#objects.removeChannelMembers}
     * methods instead
     * from `objects` API group..
     */
    removeMemberships<RelationCustom extends AppContext.CustomData = AppContext.CustomData, MetadataCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.RemoveMembersParameters | AppContext.RemoveMembershipsParameters): Promise<AppContext.RemoveMembersResponse<RelationCustom, MetadataCustom>>;
    /**
     * PubNub Channel Groups API group.
     */
    get channelGroups(): PubNubChannelGroups;
    /**
     * PubNub Push Notifications API group.
     */
    get push(): PubNubPushNotifications;
    /**
     * Share file to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    sendFile(parameters: FileSharing.SendFileParameters<FileConstructorParameters>, callback: ResultCallback<FileSharing.SendFileResponse>): void;
    /**
     * Share file to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous file sharing response.
     */
    sendFile(parameters: FileSharing.SendFileParameters<FileConstructorParameters>): Promise<FileSharing.SendFileResponse>;
    /**
     * Publish file message to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    publishFile(parameters: FileSharing.PublishFileMessageParameters, callback: ResultCallback<FileSharing.PublishFileMessageResponse>): void;
    /**
     * Publish file message to a specific channel.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous publish file message response.
     */
    publishFile(parameters: FileSharing.PublishFileMessageParameters): Promise<FileSharing.PublishFileMessageResponse>;
    /**
     * Retrieve list of shared files in specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    listFiles(parameters: FileSharing.ListFilesParameters, callback: ResultCallback<FileSharing.ListFilesResponse>): void;
    /**
     * Retrieve list of shared files in specific channel.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous shared files list response.
     */
    listFiles(parameters: FileSharing.ListFilesParameters): Promise<FileSharing.ListFilesResponse>;
    /**
     * Get file download Url.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns File download Url.
     */
    getFileUrl(parameters: FileSharing.FileUrlParameters): FileSharing.FileUrlResponse;
    /**
     * Download shared file from specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    downloadFile(parameters: FileSharing.DownloadFileParameters, callback: ResultCallback<PlatformFile>): void;
    /**
     * Download shared file from specific channel.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous download shared file response.
     */
    downloadFile(parameters: FileSharing.DownloadFileParameters): Promise<PlatformFile>;
    /**
     * Delete shared file from specific channel.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    deleteFile(parameters: FileSharing.DeleteFileParameters, callback: ResultCallback<FileSharing.DeleteFileResponse>): void;
    /**
     * Delete shared file from specific channel.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous delete shared file response.
     */
    deleteFile(parameters: FileSharing.DeleteFileParameters): Promise<FileSharing.DeleteFileResponse>;
    /**
     Get current high-precision timetoken.
     *
     * @param callback - Request completion handler callback.
     */
    time(callback: ResultCallback<Time.TimeResponse>): void;
    /**
     * Get current high-precision timetoken.
     *
     * @returns Asynchronous get current timetoken response.
     */
    time(): Promise<Time.TimeResponse>;
    /**
     * Encrypt data.
     *
     * @param data - Stringified data which should be encrypted using `CryptoModule`.
     * @deprecated
     * @param [customCipherKey] - Cipher key which should be used to encrypt data. **Deprecated:**
     * use {@link Configuration#cryptoModule|cryptoModule} instead.
     *
     * @returns Data encryption result as a string.
     */
    encrypt(data: string | Payload, customCipherKey?: string): string;
    /**
     * Decrypt data.
     *
     * @param data - Stringified data which should be encrypted using `CryptoModule`.
     * @param [customCipherKey] - Cipher key which should be used to decrypt data. **Deprecated:**
     * use {@link Configuration#cryptoModule|cryptoModule} instead.
     *
     * @returns Data decryption result as an object.
     */
    decrypt(data: string, customCipherKey?: string): Payload | null;
    /**
     * Encrypt file content.
     *
     * @param file - File which should be encrypted using `CryptoModule`.
     *
     * @returns Asynchronous file encryption result.
     *
     * @throws Error if source file not provided.
     * @throws File constructor not provided.
     * @throws Crypto module is missing (if non-legacy flow used).
     */
    encryptFile(file: PubNubFileInterface): Promise<PubNubFileInterface>;
    /**
     * Encrypt file content.
     *
     * @param key - Cipher key which should be used to encrypt data.
     * @param file - File which should be encrypted using legacy cryptography.
     *
     * @returns Asynchronous file encryption result.
     *
     * @throws Error if source file not provided.
     * @throws File constructor not provided.
     * @throws Crypto module is missing (if non-legacy flow used).
     */
    encryptFile(key: string, file: PubNubFileInterface): Promise<PubNubFileInterface>;
    /**
     * Decrypt file content.
     *
     * @param file - File which should be decrypted using legacy cryptography.
     *
     * @returns Asynchronous file decryption result.
     *
     * @throws Error if source file not provided.
     * @throws File constructor not provided.
     * @throws Crypto module is missing (if non-legacy flow used).
     */
    decryptFile(file: PubNubFileInterface): Promise<PubNubFileInterface>;
    /**
     * Decrypt file content.
     *
     * @param key - Cipher key which should be used to decrypt data.
     * @param [file] - File which should be decrypted using legacy cryptography.
     *
     * @returns Asynchronous file decryption result.
     *
     * @throws Error if source file not provided.
     * @throws File constructor not provided.
     * @throws Crypto module is missing (if non-legacy flow used).
     */
    decryptFile(key: string | PubNubFileInterface, file?: PubNubFileInterface): Promise<PubNubFileInterface>;
}
export {};
