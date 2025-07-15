/**
 * Core PubNub API module.
 */

// region Imports
// region Components
import { EventDispatcher, Listener } from './components/event-dispatcher';
import { SubscriptionManager } from './components/subscription-manager';
import NotificationsPayload from './components/push_payload';
import { TokenManager } from './components/token_manager';
import { AbstractRequest } from './components/request';
import Crypto from './components/cryptography/index';
import { encode } from './components/base64_codec';
import uuidGenerator from './components/uuid';
// endregion

// region Types
import { Payload, ResultCallback, Status, StatusCallback, StatusEvent } from './types/api';
// endregion

// region Component Interfaces
import { ClientConfiguration, PrivateClientConfiguration } from './interfaces/configuration';
import { Cryptography } from './interfaces/cryptography';
import { Transport } from './interfaces/transport';
// endregion

// region Constants
import RequestOperation from './constants/operations';
import StatusCategory from './constants/categories';
// endregion

import { createValidationError, PubNubError } from '../errors/pubnub-error';
import { PubNubAPIError } from '../errors/pubnub-api-error';
import { RetryPolicy, Endpoint } from './components/retry-policy';

// region Event Engine
import { PresenceEventEngine } from '../event-engine/presence/presence';
import { EventEngine } from '../event-engine';
// endregion
// region Publish & Signal
import * as Publish from './endpoints/publish';
import * as Signal from './endpoints/signal';
// endregion
// region Subscription
import {
  SubscribeRequestParameters as SubscribeRequestParameters,
  SubscribeRequest,
  PubNubEventType,
} from './endpoints/subscribe';
import { ReceiveMessagesSubscribeRequest } from './endpoints/subscriptionUtils/receiveMessages';
import { HandshakeSubscribeRequest } from './endpoints/subscriptionUtils/handshake';
import { Subscription as SubscriptionObject } from '../entities/subscription';
import * as Subscription from './types/api/subscription';
// endregion
// region Presence
import { GetPresenceStateRequest } from './endpoints/presence/get_state';
import { SetPresenceStateRequest } from './endpoints/presence/set_state';
import { HeartbeatRequest } from './endpoints/presence/heartbeat';
import { PresenceLeaveRequest } from './endpoints/presence/leave';
import { WhereNowRequest } from './endpoints/presence/where_now';
import { HereNowRequest } from './endpoints/presence/here_now';
import * as Presence from './types/api/presence';
// endregion
// region Message Storage
import { DeleteMessageRequest } from './endpoints/history/delete_messages';
import { MessageCountRequest } from './endpoints/history/message_counts';
import { GetHistoryRequest } from './endpoints/history/get_history';
import { FetchMessagesRequest } from './endpoints/fetch_messages';
import * as History from './types/api/history';
// endregion
// region Message Actions
import { GetMessageActionsRequest } from './endpoints/actions/get_message_actions';
import { AddMessageActionRequest } from './endpoints/actions/add_message_action';
import { RemoveMessageAction } from './endpoints/actions/remove_message_action';
import * as MessageAction from './types/api/message-action';
// endregion
// region File sharing
import { PublishFileMessageRequest } from './endpoints/file_upload/publish_file';
import { GetFileDownloadUrlRequest } from './endpoints/file_upload/get_file_url';
import { DeleteFileRequest } from './endpoints/file_upload/delete_file';
import { FilesListRequest } from './endpoints/file_upload/list_files';
import { SendFileRequest } from './endpoints/file_upload/send_file';
import * as FileSharing from './types/api/file-sharing';
import { PubNubFileInterface } from './types/file';
// endregion
// region PubNub Access Manager
import { RevokeTokenRequest } from './endpoints/access_manager/revoke_token';
import { GrantTokenRequest } from './endpoints/access_manager/grant_token';
import { GrantRequest } from './endpoints/access_manager/grant';
import { AuditRequest } from './endpoints/access_manager/audit';
import * as PAM from './types/api/access-manager';
// endregion
// region Entities
import {
  SubscriptionCapable,
  SubscriptionOptions,
  SubscriptionType,
} from '../entities/interfaces/subscription-capable';
import { EventEmitCapable } from '../entities/interfaces/event-emit-capable';
import { EntityInterface } from '../entities/interfaces/entity-interface';
import { SubscriptionBase } from '../entities/subscription-base';
import { ChannelMetadata } from '../entities/channel-metadata';
import { SubscriptionSet } from '../entities/subscription-set';
import { ChannelGroup } from '../entities/channel-group';
import { UserMetadata } from '../entities/user-metadata';
import { Channel } from '../entities/channel';
// endregion
// region Channel Groups
import PubNubChannelGroups from './pubnub-channel-groups';
// endregion
// region Push Notifications
import PubNubPushNotifications from './pubnub-push';
// endregion
// region App Context
import * as AppContext from './types/api/app-context';
import PubNubObjects from './pubnub-objects';
// endregion
// region Time
import * as Time from './endpoints/time';
// endregion
import { EventHandleCapable } from '../entities/interfaces/event-handle-capable';
import { DownloadFileRequest } from './endpoints/file_upload/download_file';
import { SubscriptionInput } from './types/api/subscription';
import { LoggerManager } from './components/logger-manager';
import { LogLevel as LoggerLogLevel } from './interfaces/logger';
import { encodeString, messageFingerprint } from './utils';
import { Entity } from '../entities/entity';
import Categories from './constants/categories';

// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Core PubNub client configuration object.
 *
 * @internal
 */
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
// endregion

/**
 * Platform-agnostic PubNub client core.
 */
export class PubNubCore<
  CryptographyTypes,
  FileConstructorParameters,
  PlatformFile extends Partial<PubNubFileInterface> = Record<string, unknown>,
> implements EventEmitCapable
{
  /**
   * PubNub client configuration.
   *
   * @internal
   */
  protected readonly _configuration: PrivateClientConfiguration;

  /**
   * Subscription loop manager.
   *
   * **Note:** Manager created when EventEngine is off.
   *
   * @internal
   */
  private readonly subscriptionManager?: SubscriptionManager;

  /**
   * Transport for network requests processing.
   *
   * @internal
   */
  protected readonly transport: Transport;

  /**
   * `userId` change handler.
   *
   * @internal
   */
  protected onUserIdChange?: (userId: string) => void;

  /**
   * Heartbeat interval change handler.
   *
   * @internal
   */
  protected onHeartbeatIntervalChange?: (interval: number) => void;

  /**
   * `authKey` or `token` change handler.
   *
   * @internal
   */
  protected onAuthenticationChange?: (auth?: string) => void;

  /**
   * REST API endpoints access tokens manager.
   *
   * @internal
   */
  private readonly tokenManager?: TokenManager;

  /**
   * Legacy crypto module implementation.
   *
   * @internal
   */
  private readonly cryptography?: Cryptography<CryptographyTypes>;

  /**
   * Legacy crypto (legacy data encryption / decryption and request signature support).
   *
   * @internal
   */
  private readonly crypto?: Crypto;

  /**
   * User's presence event engine.
   *
   * @internal
   */
  private readonly presenceEventEngine?: PresenceEventEngine;

  /**
   * List of subscribe capable objects with active subscriptions.
   *
   * Track list of {@link Subscription} and {@link SubscriptionSet} objects with active
   * subscription.
   *
   * @internal
   */
  private eventHandleCapable: Record<string, EventEmitCapable & EventHandleCapable> = {};

  /**
   * Client-level subscription set.
   *
   * **Note:** client-level subscription set for {@link subscribe}, {@link unsubscribe}, and {@link unsubscribeAll}
   * backward compatibility.
   *
   * **Important:** This should be removed as soon as the legacy subscription loop will be dropped.
   *
   * @internal
   */
  private _globalSubscriptionSet?: SubscriptionSet;

  /**
   * Subscription event engine.
   *
   * @internal
   */
  private readonly eventEngine?: EventEngine;

  /**
   * Client-managed presence information.
   *
   * @internal
   */
  private readonly presenceState?: Record<string, Payload>;

  /**
   * Event emitter, which will notify listeners about updates received for channels / groups.
   *
   * @internal
   */
  private readonly eventDispatcher?: EventDispatcher;

  /**
   * Created entities.
   *
   * Map of entities which have been created to access.
   *
   * @internal
   */
  private readonly entities: Record<string, EntityInterface | undefined> = {};

  /**
   * PubNub App Context REST API entry point.
   *
   * @internal
   */
  // @ts-expect-error Allowed to simplify interface when module can be disabled.
  private readonly _objects: PubNubObjects;

  /**
   * PubNub Channel Group REST API entry point.
   *
   * @internal
   */
  // @ts-expect-error Allowed to simplify interface when module can be disabled.
  private readonly _channelGroups: PubNubChannelGroups;

  /**
   * PubNub Push Notification REST API entry point.
   *
   * @internal
   */
  // @ts-expect-error Allowed to simplify interface when module can be disabled.
  private readonly _push: PubNubPushNotifications;

  /**
   * {@link ArrayBuffer} to {@link string} decoder.
   *
   * @internal
   */
  private static decoder = new TextDecoder();

  // --------------------------------------------------------
  // ----------------------- Static -------------------------
  // --------------------------------------------------------

  // region Static
  /**
   * Type of REST API endpoint which reported status.
   */
  static OPERATIONS = RequestOperation;

  /**
   * API call status category.
   */
  static CATEGORIES = StatusCategory;

  /**
   * Enum with API endpoint groups which can be used with retry policy to set up exclusions (which shouldn't be
   * retried).
   */
  static Endpoint = Endpoint;

  /**
   * Exponential retry policy constructor.
   */
  static ExponentialRetryPolicy = RetryPolicy.ExponentialRetryPolicy;

  /**
   * Linear retry policy constructor.
   */
  static LinearRetryPolicy = RetryPolicy.LinearRetryPolicy;

  /**
   * Disabled / inactive retry policy.
   *
   * **Note:** By default `ExponentialRetryPolicy` is set for subscribe requests and this one can be used to disable
   * retry policy for all requests (setting `undefined` for retry configuration will set default policy).
   */
  static NoneRetryPolicy = RetryPolicy.None;

  /**
   * Available minimum log levels.
   */
  static LogLevel = LoggerLogLevel;

  /**
   * Construct notification payload which will trigger push notification.
   *
   * @param title - Title which will be shown on notification.
   * @param body - Payload which will be sent as part of notification.
   *
   * @returns Pre-formatted message payload which will trigger push notification.
   */
  static notificationPayload(title: string, body: string) {
    if (process.env.PUBLISH_MODULE !== 'disabled') {
      return new NotificationsPayload(title, body);
    } else throw new Error('Notification Payload error: publish module disabled');
  }

  /**
   * Generate unique identifier.
   *
   * @returns Unique identifier.
   */
  static generateUUID() {
    return uuidGenerator.createUUID();
  }
  // endregion

  /**
   * Create and configure PubNub client core.
   *
   * @param configuration - PubNub client core configuration.
   * @returns Configured and ready to use PubNub client.
   *
   * @internal
   */
  constructor(configuration: ClientInstanceConfiguration<CryptographyTypes>) {
    this._configuration = configuration.configuration;
    this.cryptography = configuration.cryptography;
    this.tokenManager = configuration.tokenManager;
    this.transport = configuration.transport;
    this.crypto = configuration.crypto;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: configuration.configuration as unknown as Record<string, unknown>,
      details: 'Create with configuration:',
      ignoredKeys(key: string, obj: Record<string, unknown>) {
        return typeof obj[key] === 'function' || key.startsWith('_');
      },
    }));

    // API group entry points initialization.
    if (process.env.APP_CONTEXT_MODULE !== 'disabled')
      this._objects = new PubNubObjects(this._configuration, this.sendRequest.bind(this));
    if (process.env.CHANNEL_GROUPS_MODULE !== 'disabled')
      this._channelGroups = new PubNubChannelGroups(
        this._configuration.logger(),
        this._configuration.keySet,
        this.sendRequest.bind(this),
      );
    if (process.env.MOBILE_PUSH_MODULE !== 'disabled')
      this._push = new PubNubPushNotifications(
        this._configuration.logger(),
        this._configuration.keySet,
        this.sendRequest.bind(this),
      );

    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      // Prepare for a real-time events announcement.
      this.eventDispatcher = new EventDispatcher();

      if (this._configuration.enableEventEngine) {
        if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
          this.logger.debug('PubNub', 'Using new subscription loop management.');
          let heartbeatInterval = this._configuration.getHeartbeatInterval();
          this.presenceState = {};

          if (process.env.PRESENCE_MODULE !== 'disabled') {
            if (heartbeatInterval) {
              this.presenceEventEngine = new PresenceEventEngine({
                heartbeat: (parameters, callback) => {
                  this.logger.trace('PresenceEventEngine', () => ({
                    messageType: 'object',
                    message: { ...parameters },
                    details: 'Heartbeat with parameters:',
                  }));

                  return this.heartbeat(parameters, callback);
                },
                leave: (parameters) => {
                  this.logger.trace('PresenceEventEngine', () => ({
                    messageType: 'object',
                    message: { ...parameters },
                    details: 'Leave with parameters:',
                  }));

                  this.makeUnsubscribe(parameters, () => {});
                },
                heartbeatDelay: () =>
                  new Promise((resolve, reject) => {
                    heartbeatInterval = this._configuration.getHeartbeatInterval();
                    if (!heartbeatInterval) reject(new PubNubError('Heartbeat interval has been reset.'));
                    else setTimeout(resolve, heartbeatInterval * 1000);
                  }),
                emitStatus: (status) => this.emitStatus(status),
                config: this._configuration,
                presenceState: this.presenceState,
              });
            }
          }

          this.eventEngine = new EventEngine({
            handshake: (parameters) => {
              this.logger.trace('EventEngine', () => ({
                messageType: 'object',
                message: { ...parameters },
                details: 'Handshake with parameters:',
                ignoredKeys: ['abortSignal', 'crypto', 'timeout', 'keySet', 'getFileUrl'],
              }));

              return this.subscribeHandshake(parameters);
            },
            receiveMessages: (parameters) => {
              this.logger.trace('EventEngine', () => ({
                messageType: 'object',
                message: { ...parameters },
                details: 'Receive messages with parameters:',
                ignoredKeys: ['abortSignal', 'crypto', 'timeout', 'keySet', 'getFileUrl'],
              }));

              return this.subscribeReceiveMessages(parameters);
            },
            delay: (amount) => new Promise((resolve) => setTimeout(resolve, amount)),
            join: (parameters) => {
              this.logger.trace('EventEngine', () => ({
                messageType: 'object',
                message: { ...parameters },
                details: 'Join with parameters:',
              }));

              if (parameters && (parameters.channels ?? []).length === 0 && (parameters.groups ?? []).length === 0) {
                this.logger.trace('EventEngine', "Ignoring 'join' announcement request.");
                return;
              }

              this.join(parameters);
            },
            leave: (parameters) => {
              this.logger.trace('EventEngine', () => ({
                messageType: 'object',
                message: { ...parameters },
                details: 'Leave with parameters:',
              }));

              if (parameters && (parameters.channels ?? []).length === 0 && (parameters.groups ?? []).length === 0) {
                this.logger.trace('EventEngine', "Ignoring 'leave' announcement request.");
                return;
              }

              this.leave(parameters);
            },
            leaveAll: (parameters) => {
              this.logger.trace('EventEngine', () => ({
                messageType: 'object',
                message: { ...parameters },
                details: 'Leave all with parameters:',
              }));

              this.leaveAll(parameters);
            },
            presenceReconnect: (parameters) => {
              this.logger.trace('EventEngine', () => ({
                messageType: 'object',
                message: { ...parameters },
                details: 'Reconnect with parameters:',
              }));

              this.presenceReconnect(parameters);
            },
            presenceDisconnect: (parameters) => {
              this.logger.trace('EventEngine', () => ({
                messageType: 'object',
                message: { ...parameters },
                details: 'Disconnect with parameters:',
              }));

              this.presenceDisconnect(parameters);
            },
            presenceState: this.presenceState,
            config: this._configuration,
            emitMessages: (cursor, events) => {
              try {
                this.logger.debug('EventEngine', () => {
                  const hashedEvents = events.map((event) => {
                    const pn_mfp =
                      event.type === PubNubEventType.Message || event.type === PubNubEventType.Signal
                        ? messageFingerprint(event.data.message)
                        : undefined;
                    return pn_mfp ? { type: event.type, data: { ...event.data, pn_mfp } } : event;
                  });
                  return { messageType: 'object', message: hashedEvents, details: 'Received events:' };
                });

                events.forEach((event) => this.emitEvent(cursor, event));
              } catch (e) {
                const errorStatus: Status = {
                  error: true,
                  category: StatusCategory.PNUnknownCategory,
                  errorData: e as Error,
                  statusCode: 0,
                };
                this.emitStatus(errorStatus);
              }
            },
            emitStatus: (status) => this.emitStatus(status),
          });
        } else throw new Error('Event Engine error: subscription event engine module disabled');
      } else {
        if (process.env.SUBSCRIBE_MANAGER_MODULE !== 'disabled') {
          this.logger.debug('PubNub', 'Using legacy subscription loop management.');
          this.subscriptionManager = new SubscriptionManager(
            this._configuration,
            (cursor, event) => {
              try {
                this.emitEvent(cursor, event);
              } catch (e) {
                const errorStatus: Status = {
                  error: true,
                  category: StatusCategory.PNUnknownCategory,
                  errorData: e as Error,
                  statusCode: 0,
                };
                this.emitStatus(errorStatus);
              }
            },
            this.emitStatus.bind(this),
            (parameters, callback) => {
              this.logger.trace('SubscriptionManager', () => ({
                messageType: 'object',
                message: { ...parameters },
                details: 'Subscribe with parameters:',
                ignoredKeys: ['crypto', 'timeout', 'keySet', 'getFileUrl'],
              }));

              this.makeSubscribe(parameters, callback);
            },
            (parameters, callback) => {
              this.logger.trace('SubscriptionManager', () => ({
                messageType: 'object',
                message: { ...parameters },
                details: 'Heartbeat with parameters:',
                ignoredKeys: ['crypto', 'timeout', 'keySet', 'getFileUrl'],
              }));

              return this.heartbeat(parameters, callback);
            },
            (parameters, callback) => {
              this.logger.trace('SubscriptionManager', () => ({
                messageType: 'object',
                message: { ...parameters },
                details: 'Leave with parameters:',
              }));

              this.makeUnsubscribe(parameters, callback);
            },
            this.time.bind(this),
          );
        } else throw new Error('Subscription Manager error: subscription manager module disabled');
      }
    }
  }

  // --------------------------------------------------------
  // -------------------- Configuration ----------------------
  // --------------------------------------------------------
  // region Configuration

  /**
   * PubNub client configuration.
   *
   * @returns Currently user PubNub client configuration.
   */
  public get configuration(): ClientConfiguration {
    return this._configuration;
  }

  /**
   * Current PubNub client configuration.
   *
   * @returns Currently user PubNub client configuration.
   *
   * @deprecated Use {@link configuration} getter instead.
   */
  public get _config(): ClientConfiguration {
    return this.configuration;
  }

  /**
   * REST API endpoint access authorization key.
   *
   * It is required to have `authorization key` with required permissions to access REST API
   * endpoints when `PAM` enabled for user key set.
   */
  get authKey(): string | undefined {
    return this._configuration.authKey ?? undefined;
  }

  /**
   * REST API endpoint access authorization key.
   *
   * It is required to have `authorization key` with required permissions to access REST API
   * endpoints when `PAM` enabled for user key set.
   */
  getAuthKey(): string | undefined {
    return this.authKey;
  }

  /**
   * Change REST API endpoint access authorization key.
   *
   * @param authKey - New authorization key which should be used with new requests.
   */
  setAuthKey(authKey: string): void {
    this.logger.debug('PubNub', `Set auth key: ${authKey}`);
    this._configuration.setAuthKey(authKey);

    if (this.onAuthenticationChange) this.onAuthenticationChange(authKey);
  }

  /**
   * Get a PubNub client user identifier.
   *
   * @returns Current PubNub client user identifier.
   */
  get userId(): string {
    return this._configuration.userId!;
  }

  /**
   * Change the current PubNub client user identifier.
   *
   * **Important:** Change won't affect ongoing REST API calls.
   *
   * @param value - New PubNub client user identifier.
   *
   * @throws Error empty user identifier has been provided.
   */
  set userId(value: string) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      const error = new Error('Missing or invalid userId parameter. Provide a valid string userId');
      this.logger.error('PubNub', () => ({ messageType: 'error', message: error }));

      throw error;
    }

    this.logger.debug('PubNub', `Set user ID: ${value}`);
    this._configuration.userId = value;

    if (this.onUserIdChange) this.onUserIdChange(this._configuration.userId);
  }

  /**
   * Get a PubNub client user identifier.
   *
   * @returns Current PubNub client user identifier.
   */
  getUserId(): string {
    return this._configuration.userId!;
  }

  /**
   * Change the current PubNub client user identifier.
   *
   * **Important:** Change won't affect ongoing REST API calls.
   *
   * @param value - New PubNub client user identifier.
   *
   * @throws Error empty user identifier has been provided.
   */
  setUserId(value: string): void {
    this.userId = value;
  }

  /**
   * Real-time updates filtering expression.
   *
   * @returns Filtering expression.
   */
  get filterExpression(): string | undefined {
    return this._configuration.getFilterExpression() ?? undefined;
  }

  /**
   * Real-time updates filtering expression.
   *
   * @returns Filtering expression.
   */
  getFilterExpression(): string | undefined {
    return this.filterExpression;
  }

  /**
   * Update real-time updates filtering expression.
   *
   * @param expression - New expression which should be used or `undefined` to disable filtering.
   */
  set filterExpression(expression: string | null | undefined) {
    this.logger.debug('PubNub', `Set filter expression: ${expression}`);
    this._configuration.setFilterExpression(expression);
  }

  /**
   * Update real-time updates filtering expression.
   *
   * @param expression - New expression which should be used or `undefined` to disable filtering.
   */
  setFilterExpression(expression: string | null): void {
    this.logger.debug('PubNub', `Set filter expression: ${expression}`);
    this.filterExpression = expression;
  }

  /**
   * Dta encryption / decryption key.
   *
   * @returns Currently used key for data encryption / decryption.
   */
  get cipherKey(): string | undefined {
    return this._configuration.getCipherKey();
  }

  /**
   * Change data encryption / decryption key.
   *
   * @param key - New key which should be used for data encryption / decryption.
   */
  set cipherKey(key: string | undefined) {
    this._configuration.setCipherKey(key);
  }

  /**
   * Change data encryption / decryption key.
   *
   * @param key - New key which should be used for data encryption / decryption.
   */
  setCipherKey(key: string): void {
    this.logger.debug('PubNub', `Set cipher key: ${key}`);
    this.cipherKey = key;
  }

  /**
   * Change a heartbeat requests interval.
   *
   * @param interval - New presence request heartbeat intervals.
   */
  set heartbeatInterval(interval: number) {
    this.logger.debug('PubNub', `Set heartbeat interval: ${interval}`);
    this._configuration.setHeartbeatInterval(interval);

    if (this.onHeartbeatIntervalChange) this.onHeartbeatIntervalChange(this._configuration.getHeartbeatInterval() ?? 0);
  }

  /**
   * Change a heartbeat requests interval.
   *
   * @param interval - New presence request heartbeat intervals.
   */
  setHeartbeatInterval(interval: number): void {
    this.heartbeatInterval = interval;
  }

  /**
   * Get registered loggers' manager.
   *
   * @returns Registered loggers' manager.
   */
  get logger(): LoggerManager {
    return this._configuration.logger();
  }

  /**
   * Get PubNub SDK version.
   *
   * @returns Current SDK version.
   */
  getVersion(): string {
    return this._configuration.getVersion();
  }

  /**
   * Add framework's prefix.
   *
   * @param name - Name of the framework which would want to add own data into `pnsdk` suffix.
   * @param suffix - Suffix with information about a framework.
   */
  _addPnsdkSuffix(name: string, suffix: string | number) {
    this.logger.debug('PubNub', `Add '${name}' 'pnsdk' suffix: ${suffix}`);
    this._configuration._addPnsdkSuffix(name, suffix);
  }

  // --------------------------------------------------------
  // ---------------------- Deprecated ----------------------
  // --------------------------------------------------------
  // region Deprecated

  /**
   * Get a PubNub client user identifier.
   *
   * @returns Current PubNub client user identifier.
   *
   * @deprecated Use the {@link getUserId} or {@link userId} getter instead.
   */
  getUUID(): string {
    return this.userId;
  }

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
  setUUID(value: string) {
    this.logger.warn('PubNub', "'setUserId` is deprecated, please use 'setUserId' or 'userId' setter instead.");
    this.logger.debug('PubNub', `Set UUID: ${value}`);
    this.userId = value;
  }

  /**
   * Custom data encryption method.
   *
   * @deprecated Instead use {@link cryptoModule} for data encryption.
   */
  get customEncrypt(): ((data: string) => string) | undefined {
    return this._configuration.getCustomEncrypt();
  }

  /**
   * Custom data decryption method.
   *
   * @deprecated Instead use {@link cryptoModule} for data decryption.
   */
  get customDecrypt(): ((data: string) => string) | undefined {
    return this._configuration.getCustomDecrypt();
  }
  // endregion
  // endregion

  // --------------------------------------------------------
  // ---------------------- Entities ------------------------
  // --------------------------------------------------------
  // region Entities

  /**
   * Create a `Channel` entity.
   *
   * Entity can be used for the interaction with the following API:
   * - `subscribe`
   *
   * @param name - Unique channel name.
   * @returns `Channel` entity.
   */
  public channel(name: string): Channel {
    let channel = this.entities[`${name}_ch`];
    if (!channel) channel = this.entities[`${name}_ch`] = new Channel(name, this);

    return channel as Channel;
  }

  /**
   * Create a `ChannelGroup` entity.
   *
   * Entity can be used for the interaction with the following API:
   * - `subscribe`
   *
   * @param name - Unique channel group name.
   * @returns `ChannelGroup` entity.
   */
  public channelGroup(name: string): ChannelGroup {
    let channelGroup = this.entities[`${name}_chg`];
    if (!channelGroup) channelGroup = this.entities[`${name}_chg`] = new ChannelGroup(name, this);

    return channelGroup as ChannelGroup;
  }

  /**
   * Create a `ChannelMetadata` entity.
   *
   * Entity can be used for the interaction with the following API:
   * - `subscribe`
   *
   * @param id - Unique channel metadata object identifier.
   * @returns `ChannelMetadata` entity.
   */
  public channelMetadata(id: string): ChannelMetadata {
    let metadata = this.entities[`${id}_chm`];
    if (!metadata) metadata = this.entities[`${id}_chm`] = new ChannelMetadata(id, this);

    return metadata as ChannelMetadata;
  }

  /**
   * Create a `UserMetadata` entity.
   *
   * Entity can be used for the interaction with the following API:
   * - `subscribe`
   *
   * @param id - Unique user metadata object identifier.
   * @returns `UserMetadata` entity.
   */
  public userMetadata(id: string): UserMetadata {
    let metadata = this.entities[`${id}_um`];
    if (!metadata) metadata = this.entities[`${id}_um`] = new UserMetadata(id, this);

    return metadata as UserMetadata;
  }

  /**
   * Create subscriptions set object.
   *
   * @param parameters - Subscriptions set configuration parameters.
   */
  public subscriptionSet(parameters: {
    channels?: string[];
    channelGroups?: string[];
    subscriptionOptions?: SubscriptionOptions;
  }): SubscriptionSet {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      // Prepare a list of entities for a set.
      const entities: (EntityInterface & SubscriptionCapable)[] = [];
      parameters.channels?.forEach((name) => entities.push(this.channel(name)));
      parameters.channelGroups?.forEach((name) => entities.push(this.channelGroup(name)));

      return new SubscriptionSet({ client: this, entities, options: parameters.subscriptionOptions });
    } else throw new Error('Subscription set error: subscription module disabled');
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Common -------------------------
  // --------------------------------------------------------

  // region Common
  /**
   * Schedule request execution.
   *
   * @param request - REST API request.
   * @param callback - Request completion handler callback.
   *
   * @returns Asynchronous request execution and response parsing result.
   *
   * @internal
   */
  private sendRequest<ResponseType, ServiceResponse extends object>(
    request: AbstractRequest<ResponseType, ServiceResponse>,
    callback: ResultCallback<ResponseType>,
  ): void;

  /**
   * Schedule request execution.
   *
   * @internal
   *
   * @param request - REST API request.
   *
   * @returns Asynchronous request execution and response parsing result.
   */
  private async sendRequest<ResponseType, ServiceResponse extends object>(
    request: AbstractRequest<ResponseType, ServiceResponse>,
  ): Promise<ResponseType>;

  /**
   * Schedule request execution.
   *
   * @internal
   *
   * @param request - REST API request.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous request execution and response parsing result or `void` in case if
   * `callback` provided.
   *
   * @throws PubNubError in case of request processing error.
   */
  private async sendRequest<ResponseType, ServiceResponse extends object>(
    request: AbstractRequest<ResponseType, ServiceResponse>,
    callback?: ResultCallback<ResponseType>,
  ): Promise<ResponseType | void> {
    // Validate user-input.
    const validationResult = request.validate();
    if (validationResult) {
      const validationError = createValidationError(validationResult);

      this.logger.error('PubNub', () => ({ messageType: 'error', message: validationError }));

      if (callback) return callback(validationError, null);
      throw new PubNubError('Validation failed, check status for details', validationError);
    }

    // Complete request configuration.
    const transportRequest = request.request();
    const operation = request.operation();
    if (
      (transportRequest.formData && transportRequest.formData.length > 0) ||
      operation === RequestOperation.PNDownloadFileOperation
    ) {
      // Set file upload / download request delay.
      transportRequest.timeout = this._configuration.getFileTimeout();
    } else {
      if (
        operation === RequestOperation.PNSubscribeOperation ||
        operation === RequestOperation.PNReceiveMessagesOperation
      )
        transportRequest.timeout = this._configuration.getSubscribeTimeout();
      else transportRequest.timeout = this._configuration.getTransactionTimeout();
    }

    // API request processing status.
    const status: Status = {
      error: false,
      operation,
      category: StatusCategory.PNAcknowledgmentCategory,
      statusCode: 0,
    };

    const [sendableRequest, cancellationController] = this.transport.makeSendable(transportRequest);

    /**
     * **Important:** Because of multiple environments where JS SDK can be used, control over
     * cancellation had to be inverted to let the transport provider solve a request cancellation task
     * more efficiently. As a result, cancellation controller can be retrieved and used only after
     *  the request will be scheduled by the transport provider.
     */
    request.cancellationController = cancellationController ? cancellationController : null;

    return sendableRequest
      .then((response) => {
        status.statusCode = response.status;

        // Handle a special case when request completed but not fully processed by PubNub service.
        if (response.status !== 200 && response.status !== 204) {
          const responseText = PubNubCore.decoder.decode(response.body);
          const contentType = response.headers['content-type'];
          if (contentType || contentType.indexOf('javascript') !== -1 || contentType.indexOf('json') !== -1) {
            const json = JSON.parse(responseText) as Payload;
            if (typeof json === 'object' && 'error' in json && json.error && typeof json.error === 'object')
              status.errorData = json.error;
          } else status.responseText = responseText;
        }

        return request.parse(response);
      })
      .then((parsed) => {
        // Notify callback (if possible).
        if (callback) return callback(status, parsed);

        return parsed;
      })
      .catch((error: Error) => {
        const apiError = !(error instanceof PubNubAPIError) ? PubNubAPIError.create(error) : error;

        // Notify callback (if possible).
        if (callback) {
          if (apiError.category !== Categories.PNCancelledCategory) {
            this.logger.error('PubNub', () => ({
              messageType: 'error',
              message: apiError.toPubNubError(operation, 'REST API request processing error, check status for details'),
            }));
          }

          return callback(apiError.toStatus(operation), null);
        }

        const pubNubError = apiError.toPubNubError(
          operation,
          'REST API request processing error, check status for details',
        );

        if (apiError.category !== Categories.PNCancelledCategory)
          this.logger.error('PubNub', () => ({ messageType: 'error', message: pubNubError }));

        throw pubNubError;
      });
  }

  /**
   * Unsubscribe from all channels and groups.
   *
   * @param [isOffline] - Whether `offline` presence should be notified or not.
   */
  public destroy(isOffline: boolean = false): void {
    this.logger.info('PubNub', 'Destroying PubNub client.');

    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this._globalSubscriptionSet) {
        this._globalSubscriptionSet.invalidate(true);
        this._globalSubscriptionSet = undefined;
      }
      Object.values(this.eventHandleCapable).forEach((subscription) => subscription.invalidate(true));
      this.eventHandleCapable = {};

      if (this.subscriptionManager) {
        this.subscriptionManager.unsubscribeAll(isOffline);
        this.subscriptionManager.disconnect();
      } else if (this.eventEngine) this.eventEngine.unsubscribeAll(isOffline);
    }

    if (process.env.PRESENCE_MODULE !== 'disabled') {
      if (this.presenceEventEngine) this.presenceEventEngine.leaveAll(isOffline);
    }
  }

  /**
   * Unsubscribe from all channels and groups.
   *
   * @deprecated Use {@link destroy} method instead.
   */
  public stop(): void {
    this.logger.warn('PubNub', "'stop' is deprecated, please use 'destroy' instead.");
    this.destroy();
  }
  // endregion

  // --------------------------------------------------------
  // ---------------------- Publish API ---------------------
  // --------------------------------------------------------
  // region Publish API

  /**
   * Publish data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public publish(parameters: Publish.PublishParameters, callback: ResultCallback<Publish.PublishResponse>): void;

  /**
   * Publish data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous publish data response.
   */
  public async publish(parameters: Publish.PublishParameters): Promise<Publish.PublishResponse>;

  /**
   * Publish data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous publish data response or `void` in case if `callback` provided.
   */
  async publish(
    parameters: Publish.PublishParameters,
    callback?: ResultCallback<Publish.PublishResponse>,
  ): Promise<Publish.PublishResponse | void> {
    if (process.env.PUBLISH_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Publish with parameters:',
      }));

      const isFireRequest = parameters.replicate === false && parameters.storeInHistory === false;
      const request = new Publish.PublishRequest({
        ...parameters,
        keySet: this._configuration.keySet,
        crypto: this._configuration.getCryptoModule(),
      });

      const logResponse = (response: Publish.PublishResponse | null) => {
        if (!response) return;
        this.logger.debug(
          'PubNub',
          `${isFireRequest ? 'Fire' : 'Publish'} success with timetoken: ${response.timetoken}`,
        );
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Publish error: publish module disabled');
  }
  // endregion

  // --------------------------------------------------------
  // ---------------------- Signal API ----------------------
  // --------------------------------------------------------
  // region Signal API

  /**
   * Signal data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public signal(parameters: Signal.SignalParameters, callback: ResultCallback<Signal.SignalResponse>): void;

  /**
   * Signal data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous signal data response.
   */
  public async signal(parameters: Signal.SignalParameters): Promise<Signal.SignalResponse>;

  /**
   * Signal data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous signal data response or `void` in case if `callback` provided.
   */
  async signal(
    parameters: Signal.SignalParameters,
    callback?: ResultCallback<Signal.SignalResponse>,
  ): Promise<Signal.SignalResponse | void> {
    if (process.env.PUBLISH_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Signal with parameters:',
      }));

      const request = new Signal.SignalRequest({
        ...parameters,
        keySet: this._configuration.keySet,
      });

      const logResponse = (response: Signal.SignalResponse | null) => {
        if (!response) return;
        this.logger.debug('PubNub', `Publish success with timetoken: ${response.timetoken}`);
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Publish error: publish module disabled');
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Fire API ----------------------
  // --------------------------------------------------------
  // region Fire API

  /**
   * `Fire` a data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link publish} method instead.
   */
  public fire(parameters: Publish.PublishParameters, callback: ResultCallback<Publish.PublishResponse>): void;

  /**
   * `Fire` a data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous signal data response.
   *
   * @deprecated Use {@link publish} method instead.
   */
  public async fire(parameters: Publish.PublishParameters): Promise<Publish.PublishResponse>;

  /**
   * `Fire` a data to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous signal data response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link publish} method instead.
   */
  async fire(
    parameters: Publish.PublishParameters,
    callback?: ResultCallback<Publish.PublishResponse>,
  ): Promise<Publish.PublishResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Fire with parameters:',
    }));

    callback ??= () => {};
    return this.publish({ ...parameters, replicate: false, storeInHistory: false }, callback);
  }
  // endregion

  // --------------------------------------------------------
  // -------------------- Subscribe API ---------------------
  // --------------------------------------------------------
  // region Subscribe API

  /**
   * Global subscription set which supports legacy subscription interface.
   *
   * @returns Global subscription set.
   *
   * @internal
   */
  private get globalSubscriptionSet() {
    if (!this._globalSubscriptionSet) this._globalSubscriptionSet = this.subscriptionSet({});

    return this._globalSubscriptionSet;
  }

  /**
   * Subscription-based current timetoken.
   *
   * @returns Timetoken based on current timetoken plus diff between current and loop start time.
   *
   * @internal
   */
  get subscriptionTimetoken(): string | undefined {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.subscriptionManager) return this.subscriptionManager.subscriptionTimetoken;
      else if (this.eventEngine) return this.eventEngine.subscriptionTimetoken;
    }
    return undefined;
  }

  /**
   * Get list of channels on which PubNub client currently subscribed.
   *
   * @returns List of active channels.
   */
  public getSubscribedChannels(): string[] {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.subscriptionManager) return this.subscriptionManager.subscribedChannels;
      else if (this.eventEngine) return this.eventEngine.getSubscribedChannels();
    } else throw new Error('Subscription error: subscription module disabled');

    return [];
  }

  /**
   * Get list of channel groups on which PubNub client currently subscribed.
   *
   * @returns List of active channel groups.
   */
  public getSubscribedChannelGroups(): string[] {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.subscriptionManager) return this.subscriptionManager.subscribedChannelGroups;
      else if (this.eventEngine) return this.eventEngine.getSubscribedChannelGroups();
    } else throw new Error('Subscription error: subscription module disabled');

    return [];
  }

  /**
   * Register an events handler object ({@link Subscription} or {@link SubscriptionSet}) with an active subscription.
   *
   * @param subscription - {@link Subscription} or {@link SubscriptionSet} object.
   * @param [cursor] - Subscription catchup timetoken.
   * @param [subscriptions] - List of subscriptions for partial subscription loop update.
   *
   * @internal
   */
  public registerEventHandleCapable(
    subscription: SubscriptionBase,
    cursor?: Subscription.SubscriptionCursor,
    subscriptions?: EventHandleCapable[],
  ) {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      this.logger.trace('PubNub', () => ({
        messageType: 'object',
        message: {
          subscription: subscription,
          ...(cursor ? { cursor } : []),
          ...(subscriptions ? { subscriptions } : {}),
        },
        details: `Register event handle capable:`,
      }));

      if (!this.eventHandleCapable[subscription.state.id])
        this.eventHandleCapable[subscription.state.id] = subscription;

      let subscriptionInput: SubscriptionInput;
      if (!subscriptions || subscriptions.length === 0) subscriptionInput = subscription.subscriptionInput(false);
      else {
        subscriptionInput = new SubscriptionInput({});
        subscriptions.forEach((subscription) => subscriptionInput.add(subscription.subscriptionInput(false)));
      }

      const parameters: Subscription.SubscribeParameters = {};
      parameters.channels = subscriptionInput.channels;
      parameters.channelGroups = subscriptionInput.channelGroups;
      if (cursor) parameters.timetoken = cursor.timetoken;

      if (this.subscriptionManager) this.subscriptionManager.subscribe(parameters);
      else if (this.eventEngine) this.eventEngine.subscribe(parameters);
    }
  }

  /**
   * Unregister an events handler object ({@link Subscription} or {@link SubscriptionSet}) with inactive subscription.
   *
   * @param subscription - {@link Subscription} or {@link SubscriptionSet} object.
   * @param [subscriptions] - List of subscriptions for partial subscription loop update.
   *
   * @internal
   */
  public unregisterEventHandleCapable(subscription: SubscriptionBase, subscriptions?: SubscriptionObject[]) {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (!this.eventHandleCapable[subscription.state.id]) return;

      const inUseSubscriptions: SubscriptionBase[] = [];

      this.logger.trace('PubNub', () => ({
        messageType: 'object',
        message: { subscription: subscription, subscriptions },
        details: `Unregister event handle capable:`,
      }));

      // Check whether only subscription object has been passed to be unregistered.
      let shouldDeleteEventHandler = !subscriptions || subscriptions.length === 0;

      // Check whether subscription set is unregistering with all managed Subscription objects,
      if (
        !shouldDeleteEventHandler &&
        subscription instanceof SubscriptionSet &&
        subscription.subscriptions.length === subscriptions?.length
      )
        shouldDeleteEventHandler = subscription.subscriptions.every((sub) => subscriptions.includes(sub));

      if (shouldDeleteEventHandler) delete this.eventHandleCapable[subscription.state.id];

      let subscriptionInput: SubscriptionInput;
      if (!subscriptions || subscriptions.length === 0) {
        subscriptionInput = subscription.subscriptionInput(true);
        if (subscriptionInput.isEmpty) inUseSubscriptions.push(subscription);
      } else {
        subscriptionInput = new SubscriptionInput({});
        subscriptions.forEach((subscription) => {
          const input = subscription.subscriptionInput(true);
          if (input.isEmpty) inUseSubscriptions.push(subscription);
          else subscriptionInput.add(input);
        });
      }

      if (inUseSubscriptions.length > 0) {
        this.logger.trace('PubNub', () => {
          const entities: Entity[] = [];
          if (inUseSubscriptions[0] instanceof SubscriptionSet) {
            inUseSubscriptions[0].subscriptions.forEach((subscription) =>
              entities.push(subscription.state.entity as Entity),
            );
          } else
            inUseSubscriptions.forEach((subscription) =>
              entities.push((subscription as SubscriptionObject).state.entity as Entity),
            );

          return {
            messageType: 'object',
            message: { entities },
            details: `Can't unregister event handle capable because entities still in use:`,
          };
        });
      }

      if (subscriptionInput.isEmpty) return;
      else {
        const _channelGroupsInUse: string[] = [];
        const _channelsInUse: string[] = [];

        Object.values(this.eventHandleCapable).forEach((_subscription) => {
          const _subscriptionInput = _subscription.subscriptionInput(false);
          const _subscriptionChannelGroups = _subscriptionInput.channelGroups;
          const _subscriptionChannels = _subscriptionInput.channels;
          _channelGroupsInUse.push(
            ...subscriptionInput.channelGroups.filter((channel) => _subscriptionChannelGroups.includes(channel)),
          );
          _channelsInUse.push(
            ...subscriptionInput.channels.filter((channel) => _subscriptionChannels.includes(channel)),
          );
        });

        if (_channelsInUse.length > 0 || _channelGroupsInUse.length > 0) {
          this.logger.trace('PubNub', () => {
            const _entitiesInUse: Entity[] = [];
            const addEntityIfInUse = (entity: Entity) => {
              const namesOrIds = entity.subscriptionNames(true);
              const checkList =
                entity.subscriptionType === SubscriptionType.Channel ? _channelsInUse : _channelGroupsInUse;
              if (namesOrIds.some((id) => checkList.includes(id))) _entitiesInUse.push(entity);
            };

            Object.values(this.eventHandleCapable).forEach((_subscription) => {
              if (_subscription instanceof SubscriptionSet) {
                _subscription.subscriptions.forEach((_subscriptionInSet) => {
                  addEntityIfInUse(_subscriptionInSet.state.entity as Entity);
                });
              } else if (_subscription instanceof SubscriptionObject)
                addEntityIfInUse(_subscription.state.entity as Entity);
            });

            let details = 'Some entities still in use:';
            if (_channelsInUse.length + _channelGroupsInUse.length === subscriptionInput.length)
              details = "Can't unregister event handle capable because entities still in use:";

            return { messageType: 'object', message: { entities: _entitiesInUse }, details };
          });

          subscriptionInput.remove(
            new SubscriptionInput({ channels: _channelsInUse, channelGroups: _channelGroupsInUse }),
          );

          if (subscriptionInput.isEmpty) return;
        }
      }

      const parameters: Presence.PresenceLeaveParameters = {};
      parameters.channels = subscriptionInput.channels;
      parameters.channelGroups = subscriptionInput.channelGroups;

      if (this.subscriptionManager) this.subscriptionManager.unsubscribe(parameters);
      else if (this.eventEngine) this.eventEngine.unsubscribe(parameters);
    }
  }

  /**
   * Subscribe to specified channels and groups real-time events.
   *
   * @param parameters - Request configuration parameters.
   */
  public subscribe(parameters: Subscription.SubscribeParameters): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Subscribe with parameters:',
      }));

      // The addition of a new subscription set into the subscribed global subscription set will update the active
      // subscription loop with new channels and groups.
      const subscriptionSet = this.subscriptionSet({
        ...parameters,
        subscriptionOptions: { receivePresenceEvents: parameters.withPresence },
      });
      this.globalSubscriptionSet.addSubscriptionSet(subscriptionSet);
      subscriptionSet.dispose();

      const timetoken = typeof parameters.timetoken === 'number' ? `${parameters.timetoken}` : parameters.timetoken;
      this.globalSubscriptionSet.subscribe({ timetoken });
    } else throw new Error('Subscription error: subscription module disabled');
  }

  /**
   * Perform subscribe request.
   *
   * **Note:** Method passed into managers to let them use it when required.
   *
   * @internal
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  private makeSubscribe(
    parameters: Omit<SubscribeRequestParameters, 'crypto' | 'timeout' | 'keySet' | 'getFileUrl'>,
    callback: ResultCallback<Subscription.SubscriptionResponse>,
  ): void {
    if (process.env.SUBSCRIBE_MANAGER_MODULE !== 'disabled') {
      const request = new SubscribeRequest({
        ...parameters,
        keySet: this._configuration.keySet,
        crypto: this._configuration.getCryptoModule(),
        getFileUrl: this.getFileUrl.bind(this),
      });

      this.sendRequest(request, (status, result) => {
        if (this.subscriptionManager && this.subscriptionManager.abort?.identifier === request.requestIdentifier)
          this.subscriptionManager.abort = null;

        callback(status, result);
      });

      /**
       * Allow subscription cancellation.
       *
       * **Note:** Had to be done after scheduling because the transport provider returns the cancellation
       * controller only when schedule new request.
       */
      if (this.subscriptionManager) {
        // Creating an identifiable abort caller.
        const callableAbort = () => request.abort('Cancel long-poll subscribe request');
        callableAbort.identifier = request.requestIdentifier;

        this.subscriptionManager.abort = callableAbort;
      }
    } else throw new Error('Subscription error: subscription manager module disabled');
  }

  /**
   * Unsubscribe from specified channels and groups real-time events.
   *
   * @param parameters - Request configuration parameters.
   */
  public unsubscribe(parameters: Presence.PresenceLeaveParameters): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Unsubscribe with parameters:',
      }));

      if (!this._globalSubscriptionSet) {
        this.logger.debug('PubNub', 'There are no active subscriptions. Ignore.');
        return;
      }

      const subscriptions = this.globalSubscriptionSet.subscriptions.filter((subscription) => {
        const subscriptionInput = subscription.subscriptionInput(false);
        if (subscriptionInput.isEmpty) return false;

        for (const channel of parameters.channels ?? []) if (subscriptionInput.contains(channel)) return true;
        for (const group of parameters.channelGroups ?? []) if (subscriptionInput.contains(group)) return true;
      });

      // Removal from the active subscription also will cause `unsubscribe`.
      if (subscriptions.length > 0) this.globalSubscriptionSet.removeSubscriptions(subscriptions);
    } else throw new Error('Unsubscription error: subscription module disabled');
  }

  /**
   * Perform unsubscribe request.
   *
   * **Note:** Method passed into managers to let them use it when required.
   *
   * @internal
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  private makeUnsubscribe(parameters: Presence.PresenceLeaveParameters, callback: StatusCallback): void {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      // Filtering out presence channels and groups.
      let { channels, channelGroups } = parameters;

      // Remove `-pnpres` channels / groups if they not acceptable in the current PubNub client configuration.
      if (!this._configuration.getKeepPresenceChannelsInPresenceRequests()) {
        if (channelGroups) channelGroups = channelGroups.filter((channelGroup) => !channelGroup.endsWith('-pnpres'));
        if (channels) channels = channels.filter((channel) => !channel.endsWith('-pnpres'));
      }

      // Complete immediately request only for presence channels.
      if ((channelGroups ?? []).length === 0 && (channels ?? []).length === 0) {
        return callback({
          error: false,
          operation: RequestOperation.PNUnsubscribeOperation,
          category: StatusCategory.PNAcknowledgmentCategory,
          statusCode: 200,
        });
      }

      this.sendRequest(
        new PresenceLeaveRequest({ channels, channelGroups, keySet: this._configuration.keySet }),
        callback,
      );
    } else throw new Error('Unsubscription error: presence module disabled');
  }

  /**
   * Unsubscribe from all channels and groups.
   */
  public unsubscribeAll() {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', 'Unsubscribe all channels and groups');

      // Keeping a subscription set instance after invalidation so to make it possible to deliver the expected
      // disconnection status.
      if (this._globalSubscriptionSet) this._globalSubscriptionSet.invalidate(false);

      Object.values(this.eventHandleCapable).forEach((subscription) => subscription.invalidate(false));
      this.eventHandleCapable = {};

      if (this.subscriptionManager) this.subscriptionManager.unsubscribeAll();
      else if (this.eventEngine) this.eventEngine.unsubscribeAll();
    } else throw new Error('Unsubscription error: subscription module disabled');
  }

  /**
   * Temporarily disconnect from the real-time events stream.
   *
   * **Note:** `isOffline` is set to `true` only when a client experiences network issues.
   *
   * @param [isOffline] - Whether `offline` presence should be notified or not.
   */
  public disconnect(isOffline: boolean = false): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', `Disconnect (while offline? ${!!isOffline ? 'yes' : 'no'})`);

      if (this.subscriptionManager) this.subscriptionManager.disconnect();
      else if (this.eventEngine) this.eventEngine.disconnect(isOffline);
    } else throw new Error('Disconnection error: subscription module disabled');
  }

  /**
   * Restore connection to the real-time events stream.
   *
   * @param parameters - Reconnection catch-up configuration. **Note:** available only with the enabled event engine.
   */
  public reconnect(parameters?: { timetoken?: string; region?: number }): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Reconnect with parameters:',
      }));

      if (this.subscriptionManager) this.subscriptionManager.reconnect();
      else if (this.eventEngine) this.eventEngine.reconnect(parameters ?? {});
    } else throw new Error('Reconnection error: subscription module disabled');
  }

  /**
   * Event engine handshake subscribe.
   *
   * @internal
   *
   * @param parameters - Request configuration parameters.
   */
  private async subscribeHandshake(parameters: Subscription.CancelableSubscribeParameters) {
    if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
      const request = new HandshakeSubscribeRequest({
        ...parameters,
        keySet: this._configuration.keySet,
        crypto: this._configuration.getCryptoModule(),
        getFileUrl: this.getFileUrl.bind(this),
      });

      const abortUnsubscribe = parameters.abortSignal.subscribe((err) => {
        request.abort('Cancel subscribe handshake request');
      });

      /**
       * Allow subscription cancellation.
       *
       * **Note:** Had to be done after scheduling because the transport provider returns the cancellation
       * controller only when schedule new request.
       */
      const handshakeResponse = this.sendRequest(request);
      return handshakeResponse.then((response) => {
        abortUnsubscribe();
        return response.cursor;
      });
    } else throw new Error('Handshake subscription error: subscription event engine module disabled');
  }

  /**
   * Event engine receive messages subscribe.
   *
   * @internal
   *
   * @param parameters - Request configuration parameters.
   */
  private async subscribeReceiveMessages(parameters: Subscription.CancelableSubscribeParameters) {
    if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
      const request = new ReceiveMessagesSubscribeRequest({
        ...parameters,
        keySet: this._configuration.keySet,
        crypto: this._configuration.getCryptoModule(),
        getFileUrl: this.getFileUrl.bind(this),
      });

      const abortUnsubscribe = parameters.abortSignal.subscribe((err) => {
        request.abort('Cancel long-poll subscribe request');
      });

      /**
       * Allow subscription cancellation.
       *
       * **Note:** Had to be done after scheduling because the transport provider returns the cancellation
       * controller only when schedule new request.
       */
      const receiveResponse = this.sendRequest(request);
      return receiveResponse.then((response) => {
        abortUnsubscribe();
        return response;
      });
    } else throw new Error('Subscription receive error: subscription event engine module disabled');
  }
  // endregion

  // --------------------------------------------------------
  // ------------------ Message Action API ------------------
  // --------------------------------------------------------
  // region Message Action API

  // region List
  /**
   * Get reactions to a specific message.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getMessageActions(
    parameters: MessageAction.GetMessageActionsParameters,
    callback: ResultCallback<MessageAction.GetMessageActionsResponse>,
  ): void;

  /**
   * Get reactions to a specific message.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get reactions response.
   */
  public async getMessageActions(
    parameters: MessageAction.GetMessageActionsParameters,
  ): Promise<MessageAction.GetMessageActionsResponse>;

  /**
   * Get reactions to a specific message.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get reactions response or `void` in case if `callback` provided.
   */
  async getMessageActions(
    parameters: MessageAction.GetMessageActionsParameters,
    callback?: ResultCallback<MessageAction.GetMessageActionsResponse>,
  ): Promise<MessageAction.GetMessageActionsResponse | void> {
    if (process.env.MESSAGE_REACTIONS_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Get message actions with parameters:',
      }));

      const request = new GetMessageActionsRequest({ ...parameters, keySet: this._configuration.keySet });

      const logResponse = (response: MessageAction.GetMessageActionsResponse | null) => {
        if (!response) return;

        this.logger.debug('PubNub', `Get message actions success. Received ${response.data.length} message actions.`);
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Get Message Actions error: message reactions module disabled');
  }
  // endregion

  // region Add
  /**
   * Add a reaction to a specific message.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public addMessageAction(
    parameters: MessageAction.AddMessageActionParameters,
    callback: ResultCallback<MessageAction.AddMessageActionResponse>,
  ): void;

  /**
   * Add a reaction to a specific message.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous add a reaction response.
   */
  public async addMessageAction(
    parameters: MessageAction.AddMessageActionParameters,
  ): Promise<MessageAction.AddMessageActionResponse>;

  /**
   * Add a reaction to a specific message.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous add a reaction response or `void` in case if `callback` provided.
   */
  async addMessageAction(
    parameters: MessageAction.AddMessageActionParameters,
    callback?: ResultCallback<MessageAction.AddMessageActionResponse>,
  ): Promise<MessageAction.AddMessageActionResponse | void> {
    if (process.env.MESSAGE_REACTIONS_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Add message action with parameters:',
      }));

      const request = new AddMessageActionRequest({ ...parameters, keySet: this._configuration.keySet });
      const logResponse = (response: MessageAction.AddMessageActionResponse | null) => {
        if (!response) return;

        this.logger.debug(
          'PubNub',
          `Message action add success. Message action added with timetoken: ${response.data.actionTimetoken}`,
        );
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Add Message Action error: message reactions module disabled');
  }
  // endregion

  // region Remove
  /**
   * Remove a reaction from a specific message.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public removeMessageAction(
    parameters: MessageAction.RemoveMessageActionParameters,
    callback: ResultCallback<MessageAction.RemoveMessageActionResponse>,
  ): void;

  /**
   * Remove a reaction from a specific message.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous remove a reaction response.
   */
  public async removeMessageAction(
    parameters: MessageAction.RemoveMessageActionParameters,
  ): Promise<MessageAction.RemoveMessageActionResponse>;

  /**
   * Remove a reaction from a specific message.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous remove a reaction response or `void` in case if `callback` provided.
   */
  async removeMessageAction(
    parameters: MessageAction.RemoveMessageActionParameters,
    callback?: ResultCallback<MessageAction.RemoveMessageActionResponse>,
  ): Promise<MessageAction.RemoveMessageActionResponse | void> {
    if (process.env.MESSAGE_REACTIONS_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Remove message action with parameters:',
      }));

      const request = new RemoveMessageAction({ ...parameters, keySet: this._configuration.keySet });
      const logResponse = (response: MessageAction.RemoveMessageActionResponse | null) => {
        if (!response) return;
        this.logger.debug(
          'PubNub',
          `Message action remove success. Removed message action with ${parameters.actionTimetoken} timetoken.`,
        );
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Remove Message Action error: message reactions module disabled');
  }
  // endregion
  // endregion

  // --------------------------------------------------------
  // --------------- Message Persistence API ----------------
  // --------------------------------------------------------
  // region Message Persistence API

  // region Fetch Messages
  /**
   * Fetch messages history for channels.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public fetchMessages(
    parameters: History.FetchMessagesParameters,
    callback: ResultCallback<History.FetchMessagesResponse>,
  ): void;

  /**
   * Fetch messages history for channels.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous fetch messages response.
   */
  public async fetchMessages(parameters: History.FetchMessagesParameters): Promise<History.FetchMessagesResponse>;

  /**
   * Fetch messages history for channels.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous fetch messages response or `void` in case if `callback` provided.
   */
  async fetchMessages(
    parameters: History.FetchMessagesParameters,
    callback?: ResultCallback<History.FetchMessagesResponse>,
  ): Promise<History.FetchMessagesResponse | void> {
    if (process.env.MESSAGE_PERSISTENCE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Fetch messages with parameters:',
      }));

      const request = new FetchMessagesRequest({
        ...parameters,
        keySet: this._configuration.keySet,
        crypto: this._configuration.getCryptoModule(),
        getFileUrl: this.getFileUrl.bind(this),
      });
      const logResponse = (response: History.FetchMessagesResponse | null) => {
        if (!response) return;

        const messagesCount = Object.values(response.channels).reduce((acc, message) => acc + message.length, 0);
        this.logger.debug('PubNub', `Fetch messages success. Received ${messagesCount} messages.`);
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Fetch Messages History error: message persistence module disabled');
  }
  // endregion

  // region Delete Messages
  /**
   * Delete messages from the channel history.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   */
  public deleteMessages(
    parameters: History.DeleteMessagesParameters,
    callback: ResultCallback<History.DeleteMessagesResponse>,
  ): void;

  /**
   * Delete messages from the channel history.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous delete messages response.
   *
   */
  public async deleteMessages(parameters: History.DeleteMessagesParameters): Promise<History.DeleteMessagesResponse>;

  /**
   * Delete messages from the channel history.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous delete messages response or `void` in case if `callback` provided.
   *
   */
  async deleteMessages(
    parameters: History.DeleteMessagesParameters,
    callback?: ResultCallback<History.DeleteMessagesResponse>,
  ): Promise<History.DeleteMessagesResponse | void> {
    if (process.env.MESSAGE_PERSISTENCE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Delete messages with parameters:',
      }));

      const request = new DeleteMessageRequest({ ...parameters, keySet: this._configuration.keySet });
      const logResponse = (response: History.DeleteMessagesResponse | null) => {
        if (!response) return;

        this.logger.debug('PubNub', `Delete messages success.`);
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Delete Messages error: message persistence module disabled');
  }
  // endregion

  // region Count Messages
  /**
   * Count messages from the channels' history.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public messageCounts(
    parameters: History.MessageCountParameters,
    callback: ResultCallback<History.MessageCountResponse>,
  ): void;

  /**
   * Count messages from the channels' history.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous count messages response.
   */
  public async messageCounts(parameters: History.MessageCountParameters): Promise<History.MessageCountResponse>;

  /**
   * Count messages from the channels' history.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous count messages response or `void` in case if `callback` provided.
   */
  async messageCounts(
    parameters: History.MessageCountParameters,
    callback?: ResultCallback<History.MessageCountResponse>,
  ): Promise<History.MessageCountResponse | void> {
    if (process.env.MESSAGE_PERSISTENCE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Get messages count with parameters:',
      }));

      const request = new MessageCountRequest({ ...parameters, keySet: this._configuration.keySet });
      const logResponse = (response: History.MessageCountResponse | null) => {
        if (!response) return;

        const messagesCount = Object.values(response.channels).reduce((acc, messagesCount) => acc + messagesCount, 0);
        this.logger.debug(
          'PubNub',
          `Get messages count success. There are ${messagesCount} messages since provided reference timetoken${
            parameters.channelTimetokens ? parameters.channelTimetokens.join(',') : ''.length > 1 ? 's' : ''
          }.`,
        );
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Get Messages Count error: message persistence module disabled');
  }
  // endregion

  // region Deprecated
  // region Fetch History
  /**
   * Fetch single channel history.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated
   */
  public history(parameters: History.GetHistoryParameters, callback: ResultCallback<History.GetHistoryResponse>): void;

  /**
   * Fetch single channel history.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous fetch channel history response.
   *
   * @deprecated
   */
  public async history(parameters: History.GetHistoryParameters): Promise<History.GetHistoryResponse>;

  /**
   * Fetch single channel history.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous fetch channel history response or `void` in case if `callback` provided.
   *
   * @deprecated
   */
  async history(
    parameters: History.GetHistoryParameters,
    callback?: ResultCallback<History.GetHistoryResponse>,
  ): Promise<History.GetHistoryResponse | void> {
    if (process.env.MESSAGE_PERSISTENCE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Fetch history with parameters:',
      }));

      const request = new GetHistoryRequest({
        ...parameters,
        keySet: this._configuration.keySet,
        crypto: this._configuration.getCryptoModule(),
      });
      const logResponse = (response: History.GetHistoryResponse | null) => {
        if (!response) return;

        this.logger.debug('PubNub', `Fetch history success. Received ${response.messages.length} messages.`);
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Get Messages History error: message persistence module disabled');
  }
  // endregion
  // endregion
  // endregion

  // --------------------------------------------------------
  // --------------------- Presence API ---------------------
  // --------------------------------------------------------
  // region Presence API

  // region Here Now
  /**
   * Get channel's presence information.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public hereNow(parameters: Presence.HereNowParameters, callback: ResultCallback<Presence.HereNowResponse>): void;

  /**
   * Get channel presence information.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get channel's presence response.
   */
  public async hereNow(parameters: Presence.HereNowParameters): Promise<Presence.HereNowResponse>;

  /**
   * Get channel's presence information.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get channel's presence response or `void` in case if `callback` provided.
   */
  async hereNow(
    parameters: Presence.HereNowParameters,
    callback?: ResultCallback<Presence.HereNowResponse>,
  ): Promise<Presence.HereNowResponse | void> {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Here now with parameters:',
      }));

      const request = new HereNowRequest({ ...parameters, keySet: this._configuration.keySet });
      const logResponse = (response: Presence.HereNowResponse | null) => {
        if (!response) return;

        this.logger.debug(
          'PubNub',
          `Here now success. There are ${response.totalOccupancy} participants in ${response.totalChannels} channels.`,
        );
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Get Channel Here Now error: presence module disabled');
  }
  // endregion

  // region Where Now
  /**
   * Get user's presence information.
   *
   * Get list of channels to which `uuid` currently subscribed.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public whereNow(parameters: Presence.WhereNowParameters, callback: ResultCallback<Presence.WhereNowResponse>): void;

  /**
   * Get user's presence information.
   *
   * Get list of channels to which `uuid` currently subscribed.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get user's presence response.
   */
  public async whereNow(parameters: Presence.WhereNowParameters): Promise<Presence.WhereNowResponse>;

  /**
   * Get user's presence information.
   *
   * Get list of channels to which `uuid` currently subscribed.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get user's presence response or `void` in case if `callback` provided.
   */
  async whereNow(
    parameters: Presence.WhereNowParameters,
    callback?: ResultCallback<Presence.WhereNowResponse>,
  ): Promise<Presence.WhereNowResponse | void> {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Where now with parameters:',
      }));

      const request = new WhereNowRequest({
        uuid: parameters.uuid ?? this._configuration.userId!,
        keySet: this._configuration.keySet,
      });
      const logResponse = (response: Presence.WhereNowResponse | null) => {
        if (!response) return;

        this.logger.debug('PubNub', `Where now success. Currently present in ${response.channels.length} channels.`);
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Get UUID Here Now error: presence module disabled');
  }
  // endregion

  // region Get Presence State
  /**
   * Get associated user's data for channels and groups.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getState(
    parameters: Presence.GetPresenceStateParameters,
    callback: ResultCallback<Presence.GetPresenceStateResponse>,
  ): void;

  /**
   * Get associated user's data for channels and groups.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get associated user's data response.
   */
  public async getState(parameters: Presence.GetPresenceStateParameters): Promise<Presence.GetPresenceStateResponse>;

  /**
   * Get associated user's data for channels and groups.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get user's data response or `void` in case if `callback` provided.
   */
  async getState(
    parameters: Presence.GetPresenceStateParameters,
    callback?: ResultCallback<Presence.GetPresenceStateResponse>,
  ): Promise<Presence.GetPresenceStateResponse | void> {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Get presence state with parameters:',
      }));

      const request = new GetPresenceStateRequest({
        ...parameters,
        uuid: parameters.uuid ?? this._configuration.userId,
        keySet: this._configuration.keySet,
      });
      const logResponse = (response: Presence.GetPresenceStateResponse | null) => {
        if (!response) return;

        this.logger.debug(
          'PubNub',
          `Get presence state success. Received presence state for ${Object.keys(response.channels).length} channels.`,
        );
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Get UUID State error: presence module disabled');
  }
  // endregion

  // region Set Presence State
  /**
   * Set associated user's data for channels and groups.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public setState(
    parameters: Presence.SetPresenceStateParameters | Presence.SetPresenceStateWithHeartbeatParameters,
    callback: ResultCallback<Presence.SetPresenceStateResponse | Presence.PresenceHeartbeatResponse>,
  ): void;

  /**
   * Set associated user's data for channels and groups.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous set associated user's data response.
   */
  public async setState(
    parameters: Presence.SetPresenceStateParameters | Presence.SetPresenceStateWithHeartbeatParameters,
  ): Promise<Presence.SetPresenceStateResponse | Presence.PresenceHeartbeatResponse>;

  /**
   * Set associated user's data for channels and groups.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous set user's data response or `void` in case if `callback` provided.
   */
  async setState(
    parameters: Presence.SetPresenceStateParameters | Presence.SetPresenceStateWithHeartbeatParameters,
    callback?: ResultCallback<Presence.SetPresenceStateResponse | Presence.PresenceHeartbeatResponse>,
  ): Promise<Presence.SetPresenceStateResponse | Presence.PresenceHeartbeatResponse | void> {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Set presence state with parameters:',
      }));

      const { keySet, userId: userId } = this._configuration;
      const heartbeat = this._configuration.getPresenceTimeout();
      let request: AbstractRequest<
        Presence.PresenceHeartbeatResponse | Presence.SetPresenceStateResponse,
        Record<string, unknown>
      >;

      // Maintain presence information (if required).
      if (this._configuration.enableEventEngine && this.presenceState) {
        const presenceState = this.presenceState;
        parameters.channels?.forEach((channel) => (presenceState[channel] = parameters.state));

        if ('channelGroups' in parameters) {
          parameters.channelGroups?.forEach((group) => (presenceState[group] = parameters.state));
        }
      }

      // Check whether the state should be set with heartbeat or not.
      if ('withHeartbeat' in parameters && parameters.withHeartbeat) {
        request = new HeartbeatRequest({ ...parameters, keySet, heartbeat });
      } else {
        request = new SetPresenceStateRequest({ ...parameters, keySet, uuid: userId! });
      }
      const logResponse = (response: Presence.SetPresenceStateResponse | Presence.PresenceHeartbeatResponse | null) => {
        if (!response) return;

        this.logger.debug(
          'PubNub',
          `Set presence state success.${
            request instanceof HeartbeatRequest ? ' Presence state has been set using heartbeat endpoint.' : ''
          }`,
        );
      };

      // Update state used by subscription manager.
      if (this.subscriptionManager) this.subscriptionManager.setState(parameters);

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Set UUID State error: presence module disabled');
  }
  // endregion

  // region Change presence state
  /**
   * Manual presence management.
   *
   * @param parameters - Desired presence state for a provided list of channels and groups.
   */
  public presence(parameters: { connected: boolean; channels?: string[]; channelGroups?: string[] }) {
    if (process.env.SUBSCRIBE_MANAGER_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Change presence with parameters:',
      }));

      this.subscriptionManager?.changePresence(parameters);
    } else throw new Error('Change UUID presence error: subscription manager module disabled');
  }
  // endregion

  // region Heartbeat
  /**
   * Announce user presence
   *
   * @internal
   *
   * @param parameters - Desired presence state for provided list of channels and groups.
   * @param callback - Request completion handler callback.
   */
  private async heartbeat(
    parameters: Presence.CancelablePresenceHeartbeatParameters,
    callback?: ResultCallback<Presence.PresenceHeartbeatResponse>,
  ) {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      this.logger.trace('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Heartbeat with parameters:',
      }));

      // Filtering out presence channels and groups.
      let { channels, channelGroups } = parameters;

      // Remove `-pnpres` channels / groups if they not acceptable in the current PubNub client configuration.
      if (!this._configuration.getKeepPresenceChannelsInPresenceRequests()) {
        if (channelGroups) channelGroups = channelGroups.filter((channelGroup) => !channelGroup.endsWith('-pnpres'));
        if (channels) channels = channels.filter((channel) => !channel.endsWith('-pnpres'));
      }

      // Complete immediately request only for presence channels.
      if ((channelGroups ?? []).length === 0 && (channels ?? []).length === 0) {
        const responseStatus = {
          error: false,
          operation: RequestOperation.PNHeartbeatOperation,
          category: StatusCategory.PNAcknowledgmentCategory,
          statusCode: 200,
        };

        this.logger.trace('PubNub', 'There are no active subscriptions. Ignore.');

        if (callback) return callback(responseStatus, {});
        return Promise.resolve(responseStatus);
      }

      const request = new HeartbeatRequest({
        ...parameters,
        channels,
        channelGroups,
        keySet: this._configuration.keySet,
      });

      const logResponse = (response: Presence.PresenceHeartbeatResponse | null) => {
        if (!response) return;

        this.logger.trace('PubNub', 'Heartbeat success.');
      };

      const abortUnsubscribe = parameters.abortSignal?.subscribe((err) => {
        request.abort('Cancel long-poll subscribe request');
      });

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          if (abortUnsubscribe) abortUnsubscribe();
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        if (abortUnsubscribe) abortUnsubscribe();
        return response;
      });
    } else throw new Error('Announce UUID Presence error: presence module disabled');
  }
  // endregion

  // region Join
  /**
   * Announce user `join` on specified list of channels and groups.
   *
   * @internal
   *
   * @param parameters - List of channels and groups where `join` event should be sent.
   */
  private join(parameters: { channels?: string[]; groups?: string[] }) {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      this.logger.trace('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Join with parameters:',
      }));

      if (parameters && (parameters.channels ?? []).length === 0 && (parameters.groups ?? []).length === 0) {
        this.logger.trace('PubNub', "Ignoring 'join' announcement request.");
        return;
      }

      if (this.presenceEventEngine) this.presenceEventEngine.join(parameters);
      else {
        this.heartbeat(
          {
            channels: parameters.channels,
            channelGroups: parameters.groups,
            ...(this._configuration.maintainPresenceState &&
              this.presenceState &&
              Object.keys(this.presenceState).length > 0 && { state: this.presenceState }),
            heartbeat: this._configuration.getPresenceTimeout(),
          },
          () => {},
        );
      }
    } else throw new Error('Announce UUID Presence error: presence module disabled');
  }

  /**
   * Reconnect presence event engine after network issues.
   *
   * @param parameters - List of channels and groups where `join` event should be sent.
   *
   * @internal
   */
  private presenceReconnect(parameters: { channels?: string[]; groups?: string[] }) {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      this.logger.trace('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Presence reconnect with parameters:',
      }));

      if (this.presenceEventEngine) this.presenceEventEngine.reconnect();
      else {
        this.heartbeat(
          {
            channels: parameters.channels,
            channelGroups: parameters.groups,
            ...(this._configuration.maintainPresenceState && { state: this.presenceState }),
            heartbeat: this._configuration.getPresenceTimeout(),
          },
          () => {},
        );
      }
    } else throw new Error('Announce UUID Presence error: presence module disabled');
  }
  // endregion

  // region Leave
  /**
   * Announce user `leave` on specified list of channels and groups.
   *
   * @internal
   *
   * @param parameters - List of channels and groups where `leave` event should be sent.
   */
  private leave(parameters: { channels?: string[]; groups?: string[] }) {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      this.logger.trace('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Leave with parameters:',
      }));

      if (parameters && (parameters.channels ?? []).length === 0 && (parameters.groups ?? []).length === 0) {
        this.logger.trace('PubNub', "Ignoring 'leave' announcement request.");
        return;
      }

      if (this.presenceEventEngine) this.presenceEventEngine?.leave(parameters);
      else this.makeUnsubscribe({ channels: parameters.channels, channelGroups: parameters.groups }, () => {});
    } else throw new Error('Announce UUID Leave error: presence module disabled');
  }

  /**
   * Announce user `leave` on all subscribed channels.
   *
   * @internal
   *
   * @param parameters - List of channels and groups where `leave` event should be sent.
   */
  private leaveAll(parameters: { channels?: string[]; groups?: string[]; isOffline?: boolean } = {}) {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      this.logger.trace('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Leave all with parameters:',
      }));

      if (this.presenceEventEngine) this.presenceEventEngine.leaveAll(!!parameters.isOffline);
      else if (!parameters.isOffline)
        this.makeUnsubscribe({ channels: parameters.channels, channelGroups: parameters.groups }, () => {});
    } else throw new Error('Announce UUID Leave error: presence module disabled');
  }

  /**
   * Announce user `leave` on disconnection.
   *
   * @internal
   *
   * @param parameters - List of channels and groups where `leave` event should be sent.
   */
  private presenceDisconnect(parameters: { channels?: string[]; groups?: string[]; isOffline?: boolean }) {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      this.logger.trace('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Presence disconnect parameters:',
      }));

      if (this.presenceEventEngine) this.presenceEventEngine.disconnect(!!parameters.isOffline);
      else if (!parameters.isOffline)
        this.makeUnsubscribe({ channels: parameters.channels, channelGroups: parameters.groups }, () => {});
    } else throw new Error('Announce UUID Leave error: presence module disabled');
  }
  // endregion
  // endregion

  // --------------------------------------------------------
  // ------------------------ PAM API -----------------------
  // --------------------------------------------------------
  // region PAM API

  // region Grant
  /**
   * Grant token permission.
   *
   * Generate access token with requested permissions.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public grantToken(parameters: PAM.GrantTokenParameters, callback: ResultCallback<PAM.GrantTokenResponse>): void;

  /**
   * Grant token permission.
   *
   * Generate an access token with requested permissions.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous grant token response.
   */
  public async grantToken(parameters: PAM.GrantTokenParameters): Promise<PAM.GrantTokenResponse>;

  /**
   * Grant token permission.
   *
   * Generate an access token with requested permissions.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous grant token response or `void` in case if `callback` provided.
   */
  async grantToken(
    parameters: PAM.GrantTokenParameters,
    callback?: ResultCallback<PAM.GrantTokenResponse>,
  ): Promise<PAM.GrantTokenResponse | void> {
    if (process.env.PAM_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Grant token permissions with parameters:',
      }));

      const request = new GrantTokenRequest({ ...parameters, keySet: this._configuration.keySet });
      const logResponse = (response: PAM.GrantTokenResponse | null) => {
        if (!response) return;

        this.logger.debug(
          'PubNub',
          `Grant token permissions success. Received token with requested permissions: ${response}`,
        );
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Grant Token error: PAM module disabled');
  }
  // endregion

  // region Revoke
  /**
   * Revoke token permission.
   *
   * @param token - Access token for which permissions should be revoked.
   * @param callback - Request completion handler callback.
   */
  public revokeToken(token: PAM.RevokeParameters, callback: ResultCallback<PAM.RevokeTokenResponse>): void;

  /**
   * Revoke token permission.
   *
   * @param token - Access token for which permissions should be revoked.
   *
   * @returns Asynchronous revoke token response.
   */
  public async revokeToken(token: PAM.RevokeParameters): Promise<PAM.RevokeTokenResponse>;

  /**
   * Revoke token permission.
   *
   * @param token - Access token for which permissions should be revoked.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous revoke token response or `void` in case if `callback` provided.
   */
  async revokeToken(
    token: PAM.RevokeParameters,
    callback?: ResultCallback<PAM.RevokeTokenResponse>,
  ): Promise<PAM.RevokeTokenResponse | void> {
    if (process.env.PAM_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { token },
        details: 'Revoke token permissions with parameters:',
      }));

      const request = new RevokeTokenRequest({ token, keySet: this._configuration.keySet });
      const logResponse = (response: PAM.RevokeTokenResponse | null) => {
        if (!response) return;

        this.logger.debug('PubNub', 'Revoke token permissions success.');
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Revoke Token error: PAM module disabled');
  }
  // endregion

  // region Token Manipulation
  /**
   * Get a current access token.
   *
   * @returns Previously configured access token using {@link setToken} method.
   */
  public get token(): string | undefined {
    return this.tokenManager && this.tokenManager.getToken();
  }

  /**
   * Get a current access token.
   *
   * @returns Previously configured access token using {@link setToken} method.
   */
  public getToken(): string | undefined {
    return this.token;
  }

  /**
   * Set current access token.
   *
   * @param token - New access token which should be used with next REST API endpoint calls.
   */
  public set token(token: string | undefined) {
    if (this.tokenManager) this.tokenManager.setToken(token);
    if (this.onAuthenticationChange) this.onAuthenticationChange(token);
  }

  /**
   * Set current access token.
   *
   * @param token - New access token which should be used with next REST API endpoint calls.
   */
  public setToken(token: string | undefined): void {
    this.token = token;
  }

  /**
   * Parse access token.
   *
   * Parse token to see what permissions token owner has.
   *
   * @param token - Token which should be parsed.
   *
   * @returns Token's permissions information for the resources.
   */
  public parseToken(token: string): PAM.Token | undefined {
    return this.tokenManager && this.tokenManager.parseToken(token);
  }
  // endregion

  // region Deprecated
  // region Grant Auth Permissions
  /**
   * Grant auth key(s) permission.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link grantToken} and {@link setToken} methods instead.
   */
  public grant(parameters: PAM.GrantParameters, callback: ResultCallback<PAM.PermissionsResponse>): void;

  /**
   * Grant auth key(s) permission.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous grant auth key(s) permissions response.
   *
   * @deprecated Use {@link grantToken} and {@link setToken} methods instead.
   */
  public async grant(parameters: PAM.GrantParameters): Promise<PAM.PermissionsResponse>;

  /**
   * Grant auth key(s) permission.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous grant auth key(s) permissions or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link grantToken} and {@link setToken} methods instead.
   */
  async grant(
    parameters: PAM.GrantParameters,
    callback?: ResultCallback<PAM.PermissionsResponse>,
  ): Promise<PAM.PermissionsResponse | void> {
    if (process.env.PAM_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Grant auth key(s) permissions with parameters:',
      }));

      const request = new GrantRequest({ ...parameters, keySet: this._configuration.keySet });
      const logResponse = (response: PAM.PermissionsResponse | null) => {
        if (!response) return;

        this.logger.debug('PubNub', 'Grant auth key(s) permissions success.');
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Grant error: PAM module disabled');
  }
  // endregion

  // region Audit Permissions
  /**
   * Audit auth key(s) permission.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated
   */
  public audit(parameters: PAM.AuditParameters, callback: ResultCallback<PAM.PermissionsResponse>): void;

  /**
   * Audit auth key(s) permission.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous audit auth key(s) permissions response.
   *
   * @deprecated
   */
  public async audit(parameters: PAM.AuditParameters): Promise<PAM.PermissionsResponse>;

  /**
   * Audit auth key(s) permission.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @deprecated
   *
   * @deprecated Use {@link grantToken} and {@link setToken} methods instead.
   */
  async audit(
    parameters: PAM.AuditParameters,
    callback?: ResultCallback<PAM.PermissionsResponse>,
  ): Promise<PAM.PermissionsResponse | void> {
    if (process.env.PAM_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: 'Audit auth key(s) permissions with parameters:',
      }));

      const request = new AuditRequest({ ...parameters, keySet: this._configuration.keySet });
      const logResponse = (response: PAM.PermissionsResponse | null) => {
        if (!response) return;

        this.logger.debug('PubNub', 'Audit auth key(s) permissions success.');
      };

      if (callback) {
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          return callback(status, response);
        });
      }

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Grant Permissions error: PAM module disabled');
  }
  // endregion
  // endregion
  // endregion

  // --------------------------------------------------------
  // ------------------- App Context API --------------------
  // --------------------------------------------------------
  // region App Context API

  /**
   * PubNub App Context API group.
   */
  get objects(): PubNubObjects {
    return this._objects;
  }

  // region Deprecated API
  /**
   * Fetch a paginated list of User objects.
   *
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata getAllUUIDMetadata} method instead.
   */
  public fetchUsers<Custom extends AppContext.CustomData = AppContext.CustomData>(
    callback: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
  ): void;

  /**
   * Fetch a paginated list of User objects.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata getAllUUIDMetadata} method instead.
   */
  public fetchUsers<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>,
    callback: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
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
  public async fetchUsers<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters?: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>,
  ): Promise<AppContext.GetAllUUIDMetadataResponse<Custom>>;

  /**
   Fetch a paginated list of User objects.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get all User objects response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata getAllUUIDMetadata} method instead.
   */
  public async fetchUsers<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parametersOrCallback?:
      | AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>
      | ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
    callback?: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.GetAllUUIDMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
      this.logger.warn('PubNub', "'fetchUsers' is deprecated. Use 'pubnub.objects.getAllUUIDMetadata' instead.");
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: !parametersOrCallback || typeof parametersOrCallback === 'function' ? {} : parametersOrCallback,
        details: `Fetch all User objects with parameters:`,
      }));

      return this.objects._getAllUUIDMetadata(parametersOrCallback, callback);
    } else throw new Error('Fetch Users Metadata error: App Context module disabled');
  }

  /**
   * Fetch User object for a currently configured PubNub client `uuid`.
   *
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata getUUIDMetadata} method instead.
   */
  public fetchUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    callback: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
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
  public fetchUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetUUIDMetadataParameters,
    callback: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
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
  public async fetchUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters?: AppContext.GetUUIDMetadataParameters,
  ): Promise<AppContext.GetUUIDMetadataResponse<Custom>>;

  /**
   * Fetch User object for a currently configured PubNub client `uuid`.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get User object response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata getUUIDMetadata} method instead.
   */
  async fetchUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parametersOrCallback?:
      | AppContext.GetUUIDMetadataParameters
      | ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
    callback?: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.GetUUIDMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
      this.logger.warn('PubNub', "'fetchUser' is deprecated. Use 'pubnub.objects.getUUIDMetadata' instead.");
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message:
          !parametersOrCallback || typeof parametersOrCallback === 'function'
            ? { uuid: this.userId }
            : parametersOrCallback,
        details: `Fetch${
          !parametersOrCallback || typeof parametersOrCallback === 'function' ? ' current' : ''
        } User object with parameters:`,
      }));

      return this.objects._getUUIDMetadata(parametersOrCallback, callback);
    } else throw new Error('Fetch User Metadata error: App Context module disabled');
  }

  /**
   * Create a User object.
   *
   * @param parameters - Request configuration parameters. Will create a User object for a currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata setUUIDMetadata} method instead.
   */
  public createUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
    callback: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>,
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
  public async createUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
  ): Promise<AppContext.SetUUIDMetadataResponse<Custom>>;

  /**
   * Create a User object.
   *
   * @param parameters - Request configuration parameters. Will create a User object for a currently
   * configured PubNub client `uuid` if not set.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous create User object response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata setUUIDMetadata} method instead.
   */
  async createUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
    callback?: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.SetUUIDMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
      this.logger.warn('PubNub', "'createUser' is deprecated. Use 'pubnub.objects.setUUIDMetadata' instead.");
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `Create User object with parameters:`,
      }));

      return this.objects._setUUIDMetadata(parameters, callback);
    } else throw new Error('Create User Metadata error: App Context module disabled');
  }

  /**
   * Update a User object.
   *
   * @param parameters - Request configuration parameters. Will update User object for currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata setUUIDMetadata} method instead.
   */
  public updateUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
    callback: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>,
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
  public async updateUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
  ): Promise<AppContext.SetUUIDMetadataResponse<Custom>>;

  /**
   * Update a User object.
   *
   * @param parameters - Request configuration parameters. Will update a User object for a currently
   * configured PubNub client `uuid` if not set.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous update User object response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata setUUIDMetadata} method instead.
   */
  async updateUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
    callback?: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.SetUUIDMetadataResponse<Custom> | void> {
    this.logger.warn('PubNub', "'updateUser' is deprecated. Use 'pubnub.objects.setUUIDMetadata' instead.");
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `Update User object with parameters:`,
      }));

      return this.objects._setUUIDMetadata(parameters, callback);
    } else throw new Error('Update User Metadata error: App Context module disabled');
  }

  /**
   * Remove a specific User object.
   *
   * @param callback - Request completion handler callback. Will remove a User object for a currently
   * configured PubNub client `uuid` if not set.
   *
   * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata removeUUIDMetadata} method instead.
   */
  public removeUser(callback: ResultCallback<AppContext.RemoveUUIDMetadataResponse>): void;

  /**
   * Remove a specific User object.
   *
   * @param parameters - Request configuration parameters. Will remove a User object for a currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata removeUUIDMetadata} method instead.
   */
  public removeUser(
    parameters: AppContext.RemoveUUIDMetadataParameters,
    callback: ResultCallback<AppContext.RemoveUUIDMetadataResponse>,
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
  public async removeUser(
    parameters?: AppContext.RemoveUUIDMetadataParameters,
  ): Promise<AppContext.RemoveUUIDMetadataResponse>;

  /**
   * Remove a specific User object.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous User object removes response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata removeUUIDMetadata} method instead.
   */
  public async removeUser(
    parametersOrCallback?:
      | AppContext.RemoveUUIDMetadataParameters
      | ResultCallback<AppContext.RemoveUUIDMetadataResponse>,
    callback?: ResultCallback<AppContext.RemoveUUIDMetadataResponse>,
  ): Promise<AppContext.RemoveUUIDMetadataResponse | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
      this.logger.warn('PubNub', "'removeUser' is deprecated. Use 'pubnub.objects.removeUUIDMetadata' instead.");
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message:
          !parametersOrCallback || typeof parametersOrCallback === 'function'
            ? { uuid: this.userId }
            : parametersOrCallback,
        details: `Remove${
          !parametersOrCallback || typeof parametersOrCallback === 'function' ? ' current' : ''
        } User object with parameters:`,
      }));

      return this.objects._removeUUIDMetadata(parametersOrCallback, callback);
    } else throw new Error('Remove User Metadata error: App Context module disabled');
  }

  /**
   * Fetch a paginated list of Space objects.
   *
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata getAllChannelMetadata} method instead.
   */
  public fetchSpaces<Custom extends AppContext.CustomData = AppContext.CustomData>(
    callback: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
  ): void;

  /**
   * Fetch a paginated list of Space objects.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata getAllChannelMetadata} method instead.
   */
  public fetchSpaces<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>,
    callback: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
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
  public async fetchSpaces<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters?: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>,
  ): Promise<AppContext.GetAllChannelMetadataResponse<Custom>>;

  /**
   * Fetch a paginated list of Space objects.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get all Space objects response or `void` in case if `callback`
   * provided.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata getAllChannelMetadata} method instead.
   */
  async fetchSpaces<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parametersOrCallback?:
      | AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>
      | ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
    callback?: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.GetAllChannelMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
      this.logger.warn('PubNub', "'fetchSpaces' is deprecated. Use 'pubnub.objects.getAllChannelMetadata' instead.");
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: !parametersOrCallback || typeof parametersOrCallback === 'function' ? {} : parametersOrCallback,
        details: `Fetch all Space objects with parameters:`,
      }));

      return this.objects._getAllChannelMetadata(parametersOrCallback, callback);
    } else throw new Error('Fetch Spaces Metadata error: App Context module disabled');
  }

  /**
   * Fetch a specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getChannelMetadata getChannelMetadata} method instead.
   */
  public fetchSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetChannelMetadataParameters,
    callback: ResultCallback<AppContext.GetChannelMetadataResponse<Custom>>,
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
  public async fetchSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetChannelMetadataParameters,
  ): Promise<AppContext.GetChannelMetadataResponse<Custom>>;

  /**
   * Fetch a specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get Space object response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.getChannelMetadata getChannelMetadata} method instead.
   */
  async fetchSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetChannelMetadataParameters,
    callback?: ResultCallback<AppContext.GetChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.GetChannelMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
      this.logger.warn('PubNub', "'fetchSpace' is deprecated. Use 'pubnub.objects.getChannelMetadata' instead.");
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `Fetch Space object with parameters:`,
      }));

      return this.objects._getChannelMetadata(parameters, callback);
    } else throw new Error('Fetch Space Metadata error: App Context module disabled');
  }

  /**
   * Create a specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata setChannelMetadata} method instead.
   */
  public createSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetChannelMetadataParameters<Custom>,
    callback: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>,
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
  public async createSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetChannelMetadataParameters<Custom>,
  ): Promise<AppContext.SetChannelMetadataResponse<Custom>>;

  /**
   * Create specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous create Space object response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata setChannelMetadata} method instead.
   */
  async createSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetChannelMetadataParameters<Custom>,
    callback?: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.SetChannelMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
      this.logger.warn('PubNub', "'createSpace' is deprecated. Use 'pubnub.objects.setChannelMetadata' instead.");
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `Create Space object with parameters:`,
      }));

      return this.objects._setChannelMetadata(parameters, callback);
    } else throw new Error('Create Space Metadata error: App Context module disabled');
  }

  /**
   * Update specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata setChannelMetadata} method instead.
   */
  public updateSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetChannelMetadataParameters<Custom>,
    callback: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>,
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
  public async updateSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetChannelMetadataParameters<Custom>,
  ): Promise<AppContext.SetChannelMetadataResponse<Custom>>;

  /**
   * Update specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous update Space object response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata setChannelMetadata} method instead.
   */
  async updateSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetChannelMetadataParameters<Custom>,
    callback?: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.SetChannelMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
      this.logger.warn('PubNub', "'updateSpace' is deprecated. Use 'pubnub.objects.setChannelMetadata' instead.");
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `Update Space object with parameters:`,
      }));

      return this.objects._setChannelMetadata(parameters, callback);
    } else throw new Error('Update Space Metadata error: App Context module disabled');
  }

  /**
   * Remove a Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata removeChannelMetadata} method instead.
   */
  public removeSpace(
    parameters: AppContext.RemoveChannelMetadataParameters,
    callback: ResultCallback<AppContext.RemoveChannelMetadataResponse>,
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
  public async removeSpace(
    parameters: AppContext.RemoveChannelMetadataParameters,
  ): Promise<AppContext.RemoveChannelMetadataResponse>;

  /**
   * Remove a specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous Space object remove response or `void` in case if `callback`
   * provided.
   *
   * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata removeChannelMetadata} method instead.
   */
  async removeSpace(
    parameters: AppContext.RemoveChannelMetadataParameters,
    callback?: ResultCallback<AppContext.RemoveChannelMetadataResponse>,
  ): Promise<AppContext.RemoveChannelMetadataResponse | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
      this.logger.warn('PubNub', "'removeSpace' is deprecated. Use 'pubnub.objects.removeChannelMetadata' instead.");
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `Remove Space object with parameters:`,
      }));

      return this.objects._removeChannelMetadata(parameters, callback);
    } else throw new Error('Remove Space Metadata error: App Context module disabled');
  }

  /**
   * Fetch a paginated list of specific Space members or specific User memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getChannelMembers getChannelMembers} or
   * {@link PubNubCore#objects.getMemberships getMemberships} methods instead.
   */
  public fetchMemberships<
    RelationCustom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.GetMembershipsParameters | AppContext.GetMembersParameters,
    callback: ResultCallback<
      | AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom>
      | AppContext.UserMembersResponse<RelationCustom, MetadataCustom>
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
  public async fetchMemberships<
    RelationCustom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.GetMembershipsParameters | AppContext.GetMembersParameters,
  ): Promise<
    | AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom>
    | AppContext.UserMembersResponse<RelationCustom, MetadataCustom>
  >;

  /**
   * Fetch a paginated list of specific Space members or specific User memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get specific Space members or specific User memberships response or
   * `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.getChannelMembers getChannelMembers} or
   * {@link PubNubCore#objects.getMemberships getMemberships} methods instead.
   */
  public async fetchMemberships<
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
  > {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') return this.objects.fetchMemberships(parameters, callback);
    else throw new Error('Fetch Memberships error: App Context module disabled');
  }

  /**
   * Add members to specific Space or memberships specific User.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers setChannelMembers} or
   * {@link PubNubCore#objects.setMemberships setMemberships} methods instead.
   */
  public addMemberships<
    Custom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>,
    callback: ResultCallback<
      AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom>
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
  public async addMemberships<
    Custom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>,
  ): Promise<
    AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom>
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
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers setChannelMembers} or
   * {@link PubNubCore#objects.setMemberships setMemberships} methods instead.
   */
  async addMemberships<
    Custom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>,
    callback?: ResultCallback<
      AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom>
    >,
  ) {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') return this.objects.addMemberships(parameters, callback);
    else throw new Error('Add Memberships error: App Context module disabled');
  }

  /**
   * Update specific Space members or User memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers setChannelMembers} or
   * {@link PubNubCore#objects.setMemberships setMemberships} methods instead.
   */
  public updateMemberships<
    Custom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>,
    callback: ResultCallback<
      AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom>
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
  public async updateMemberships<
    Custom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>,
  ): Promise<
    AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom>
  >;

  /**
   * Update specific Space members or User memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous update Space members or User memberships response or `void` in case
   * if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers setChannelMembers} or
   * {@link PubNubCore#objects.setMemberships setMemberships} methods instead.
   */
  async updateMemberships<
    Custom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>,
    callback?: ResultCallback<
      AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom>
    >,
  ) {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
      this.logger.warn(
        'PubNub',
        "'addMemberships' is deprecated. Use 'pubnub.objects.setChannelMembers' or 'pubnub.objects.setMemberships'" +
          ' instead.',
      );
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `Update memberships with parameters:`,
      }));

      return this.objects.addMemberships(parameters, callback);
    } else throw new Error('Update Memberships error: App Context module disabled');
  }

  /**
   * Remove User membership.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.removeMemberships removeMemberships} or
   * {@link PubNubCore#objects.removeChannelMembers removeChannelMembers} methods instead from `objects` API group.
   */
  public removeMemberships<
    RelationCustom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.RemoveMembersParameters | AppContext.RemoveMembershipsParameters,
    callback: ResultCallback<
      | AppContext.RemoveMembersResponse<RelationCustom, MetadataCustom>
      | AppContext.RemoveMembershipsResponse<RelationCustom, MetadataCustom>
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
  public async removeMemberships<
    RelationCustom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.RemoveMembersParameters | AppContext.RemoveMembershipsParameters,
  ): Promise<AppContext.RemoveMembersResponse<RelationCustom, MetadataCustom>>;

  /**
   * Remove User membership.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous memberships modification response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.removeMemberships removeMemberships} or
   * {@link PubNubCore#objects.removeChannelMembers removeChannelMembers} methods instead from `objects` API group.
   */
  public async removeMemberships<
    RelationCustom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.RemoveMembersParameters | AppContext.RemoveMembershipsParameters,
    callback?: ResultCallback<
      | AppContext.RemoveMembersResponse<RelationCustom, MetadataCustom>
      | AppContext.RemoveMembershipsResponse<RelationCustom, MetadataCustom>
    >,
  ): Promise<
    | AppContext.RemoveMembersResponse<RelationCustom, MetadataCustom>
    | AppContext.RemoveMembershipsResponse<RelationCustom, MetadataCustom>
    | void
  > {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') {
      this.logger.warn(
        'PubNub',
        "'removeMemberships' is deprecated. Use 'pubnub.objects.removeMemberships' or" +
          " 'pubnub.objects.removeChannelMembers' instead.",
      );
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `Remove memberships with parameters:`,
      }));

      if ('spaceId' in parameters) {
        const spaceParameters = parameters as AppContext.RemoveMembersParameters;
        const requestParameters = {
          channel: spaceParameters.spaceId ?? spaceParameters.channel,
          uuids: spaceParameters.userIds ?? spaceParameters.uuids,
          limit: 0,
        };
        if (callback) return this.objects.removeChannelMembers(requestParameters, callback);
        return this.objects.removeChannelMembers(requestParameters);
      }

      const userParameters = parameters as AppContext.RemoveMembershipsParameters;
      const requestParameters = {
        uuid: userParameters.userId,
        channels: userParameters.spaceIds ?? userParameters.channels,
        limit: 0,
      };
      if (callback) return this.objects.removeMemberships(requestParameters, callback);
      return this.objects.removeMemberships(requestParameters);
    } else throw new Error('Remove Memberships error: App Context module disabled');
  }
  // endregion
  // endregion

  // --------------------------------------------------------
  // ----------------- Channel Groups API -------------------
  // --------------------------------------------------------
  // region Channel Groups API

  /**
   * PubNub Channel Groups API group.
   */
  get channelGroups(): PubNubChannelGroups {
    return this._channelGroups;
  }
  // endregion

  // --------------------------------------------------------
  // ---------------- Push Notifications API -----------------
  // --------------------------------------------------------
  // region Push Notifications API

  /**
   * PubNub Push Notifications API group.
   */
  get push(): PubNubPushNotifications {
    return this._push;
  }
  // endregion

  // --------------------------------------------------------
  // ------------------ File sharing API --------------------
  // --------------------------------------------------------
  // region File sharing API

  // region Send
  /**
   * Share file to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public sendFile(
    parameters: FileSharing.SendFileParameters<FileConstructorParameters>,
    callback: ResultCallback<FileSharing.SendFileResponse>,
  ): void;

  /**
   * Share file to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous file sharing response.
   */
  public async sendFile(
    parameters: FileSharing.SendFileParameters<FileConstructorParameters>,
  ): Promise<FileSharing.SendFileResponse>;

  /**
   * Share file to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous file sharing response or `void` in case if `callback` provided.
   */
  public async sendFile(
    parameters: FileSharing.SendFileParameters<FileConstructorParameters>,
    callback?: ResultCallback<FileSharing.SendFileResponse>,
  ): Promise<FileSharing.SendFileResponse | void> {
    if (process.env.FILE_SHARING_MODULE !== 'disabled') {
      if (!this._configuration.PubNubFile)
        throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");

      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `Send file with parameters:`,
      }));

      const sendFileRequest = new SendFileRequest<FileConstructorParameters>({
        ...parameters,
        keySet: this._configuration.keySet,
        PubNubFile: this._configuration.PubNubFile,
        fileUploadPublishRetryLimit: this._configuration.fileUploadPublishRetryLimit,
        file: parameters.file,
        sendRequest: this.sendRequest.bind(this),
        publishFile: this.publishFile.bind(this),
        crypto: this._configuration.getCryptoModule(),
        cryptography: this.cryptography ? (this.cryptography as Cryptography<ArrayBuffer>) : undefined,
      });

      const status: Status = {
        error: false,
        operation: RequestOperation.PNPublishFileOperation,
        category: StatusCategory.PNAcknowledgmentCategory,
        statusCode: 0,
      };
      const logResponse = (response: FileSharing.SendFileResponse | null) => {
        if (!response) return;

        this.logger.debug('PubNub', `Send file success. File shared with ${response.id} ID.`);
      };

      return sendFileRequest
        .process()
        .then((response) => {
          status.statusCode = response.status;

          logResponse(response);
          if (callback) return callback(status, response);
          return response;
        })
        .catch((error: unknown) => {
          let errorStatus: Status | undefined;
          if (error instanceof PubNubError) errorStatus = error.status;
          else if (error instanceof PubNubAPIError) errorStatus = error.toStatus(status.operation!);

          this.logger.error('PubNub', () => ({
            messageType: 'error',
            message: new PubNubError('File sending error. Check status for details', errorStatus),
          }));

          // Notify callback (if possible).
          if (callback && errorStatus) callback(errorStatus, null);

          throw new PubNubError('REST API request processing error. Check status for details', errorStatus);
        });
    } else throw new Error('Send File error: file sharing module disabled');
  }
  // endregion

  // region Publish File Message
  /**
   * Publish file message to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public publishFile(
    parameters: FileSharing.PublishFileMessageParameters,
    callback: ResultCallback<FileSharing.PublishFileMessageResponse>,
  ): void;

  /**
   * Publish file message to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous publish file message response.
   */
  public async publishFile(
    parameters: FileSharing.PublishFileMessageParameters,
  ): Promise<FileSharing.PublishFileMessageResponse>;

  /**
   * Publish file message to a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous publish file message response or `void` in case if `callback` provided.
   */
  public async publishFile(
    parameters: FileSharing.PublishFileMessageParameters,
    callback?: ResultCallback<FileSharing.PublishFileMessageResponse>,
  ): Promise<FileSharing.PublishFileMessageResponse | void> {
    if (process.env.FILE_SHARING_MODULE !== 'disabled') {
      if (!this._configuration.PubNubFile)
        throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");

      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `Publish file message with parameters:`,
      }));

      const request = new PublishFileMessageRequest({
        ...parameters,
        keySet: this._configuration.keySet,
        crypto: this._configuration.getCryptoModule(),
      });
      const logResponse = (response: FileSharing.PublishFileMessageResponse | null) => {
        if (!response) return;

        this.logger.debug(
          'PubNub',
          `Publish file message success. File message published with timetoken: ${response.timetoken}`,
        );
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Publish File error: file sharing module disabled');
  }
  // endregion

  // region List
  /**
   * Retrieve list of shared files in specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public listFiles(
    parameters: FileSharing.ListFilesParameters,
    callback: ResultCallback<FileSharing.ListFilesResponse>,
  ): void;

  /**
   * Retrieve list of shared files in specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous shared files list response.
   */
  public async listFiles(parameters: FileSharing.ListFilesParameters): Promise<FileSharing.ListFilesResponse>;

  /**
   * Retrieve list of shared files in specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous shared files list response or `void` in case if `callback` provided.
   */
  public async listFiles(
    parameters: FileSharing.ListFilesParameters,
    callback?: ResultCallback<FileSharing.ListFilesResponse>,
  ): Promise<FileSharing.ListFilesResponse | void> {
    if (process.env.FILE_SHARING_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `List files with parameters:`,
      }));

      const request = new FilesListRequest({ ...parameters, keySet: this._configuration.keySet });
      const logResponse = (response: FileSharing.ListFilesResponse | null) => {
        if (!response) return;

        this.logger.debug('PubNub', `List files success. There are ${response.count} uploaded files.`);
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('List Files error: file sharing module disabled');
  }
  // endregion

  // region Get Download Url
  /**
   * Get file download Url.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns File download Url.
   */
  public getFileUrl(parameters: FileSharing.FileUrlParameters): FileSharing.FileUrlResponse {
    if (process.env.FILE_SHARING_MODULE !== 'disabled') {
      const request = this.transport.request(
        new GetFileDownloadUrlRequest({ ...parameters, keySet: this._configuration.keySet }).request(),
      );
      const query = request.queryParameters ?? {};
      const queryString = Object.keys(query)
        .map((key) => {
          const queryValue = query[key];
          if (!Array.isArray(queryValue)) return `${key}=${encodeString(queryValue)}`;

          return queryValue.map((value) => `${key}=${encodeString(value)}`).join('&');
        })
        .join('&');

      return `${request.origin}${request.path}?${queryString}`;
    } else throw new Error('Generate File Download Url error: file sharing module disabled');
  }
  // endregion

  // region Download
  /**
   * Download a shared file from a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public downloadFile(parameters: FileSharing.DownloadFileParameters, callback: ResultCallback<PlatformFile>): void;

  /**
   * Download a shared file from a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous download shared file response.
   */
  public async downloadFile(parameters: FileSharing.DownloadFileParameters): Promise<PlatformFile>;

  /**
   * Download a shared file from a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous download shared file response or `void` in case if `callback` provided.
   */
  public async downloadFile(
    parameters: FileSharing.DownloadFileParameters,
    callback?: ResultCallback<PlatformFile>,
  ): Promise<PlatformFile | void> {
    if (process.env.FILE_SHARING_MODULE !== 'disabled') {
      if (!this._configuration.PubNubFile)
        throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");

      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `Download file with parameters:`,
      }));

      const request = new DownloadFileRequest<PlatformFile>({
        ...parameters,
        keySet: this._configuration.keySet,
        PubNubFile: this._configuration.PubNubFile,
        cryptography: this.cryptography ? (this.cryptography as Cryptography<ArrayBuffer>) : undefined,
        crypto: this._configuration.getCryptoModule(),
      });
      const logResponse = (response: PlatformFile | null) => {
        if (!response) return;

        this.logger.debug('PubNub', `Download file success.`);
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return (await this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      })) as PlatformFile;
    } else throw new Error('Download File error: file sharing module disabled');
  }
  // endregion

  // region Delete
  /**
   * Delete a shared file from a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public deleteFile(
    parameters: FileSharing.DeleteFileParameters,
    callback: ResultCallback<FileSharing.DeleteFileResponse>,
  ): void;

  /**
   * Delete a shared file from a specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous delete shared file response.
   */
  public async deleteFile(parameters: FileSharing.DeleteFileParameters): Promise<FileSharing.DeleteFileResponse>;

  /**
   * Delete a shared file from a specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous delete shared file response or `void` in case if `callback` provided.
   */
  public async deleteFile(
    parameters: FileSharing.DeleteFileParameters,
    callback?: ResultCallback<FileSharing.DeleteFileResponse>,
  ): Promise<FileSharing.DeleteFileResponse | void> {
    if (process.env.FILE_SHARING_MODULE !== 'disabled') {
      this.logger.debug('PubNub', () => ({
        messageType: 'object',
        message: { ...parameters },
        details: `Delete file with parameters:`,
      }));

      const request = new DeleteFileRequest({ ...parameters, keySet: this._configuration.keySet });
      const logResponse = (response: FileSharing.DeleteFileResponse | null) => {
        if (!response) return;

        this.logger.debug('PubNub', `Delete file success. Deleted file with ${parameters.id} ID.`);
      };

      if (callback)
        return this.sendRequest(request, (status, response) => {
          logResponse(response);
          callback(status, response);
        });

      return this.sendRequest(request).then((response) => {
        logResponse(response);
        return response;
      });
    } else throw new Error('Delete File error: file sharing module disabled');
  }
  // endregion
  // endregion

  // --------------------------------------------------------
  // ---------------------- Time API ------------------------
  // --------------------------------------------------------
  // region Time API

  /**
   Get current high-precision timetoken.
   *
   * @param callback - Request completion handler callback.
   */
  public time(callback: ResultCallback<Time.TimeResponse>): void;

  /**
   * Get current high-precision timetoken.
   *
   * @returns Asynchronous get current timetoken response.
   */
  public async time(): Promise<Time.TimeResponse>;

  /**
   Get current high-precision timetoken.
   *
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get current timetoken response or `void` in case if `callback` provided.
   */
  async time(callback?: ResultCallback<Time.TimeResponse>): Promise<Time.TimeResponse | void> {
    this.logger.debug('PubNub', 'Get service time.');

    const request = new Time.TimeRequest();
    const logResponse = (response: Time.TimeResponse | null) => {
      if (!response) return;

      this.logger.debug('PubNub', `Get service time success. Current timetoken: ${response.timetoken}`);
    };

    if (callback)
      return this.sendRequest(request, (status, response) => {
        logResponse(response);
        callback(status, response);
      });

    return this.sendRequest(request).then((response) => {
      logResponse(response);
      return response;
    });
  }
  // endregion

  // --------------------------------------------------------
  // -------------------- Event emitter ---------------------
  // --------------------------------------------------------
  // region Event emitter

  /**
   * Emit received a status update.
   *
   * Use global and local event dispatchers to deliver a status object.
   *
   * @param status - Status object which should be emitted through the listeners.
   *
   * @internal
   */
  emitStatus(status: Status | StatusEvent) {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') this.eventDispatcher?.handleStatus(status);
  }

  /**
   * Emit receiver real-time event.
   *
   * Use global and local event dispatchers to deliver an event object.
   *
   * @param cursor - Next subscription loop timetoken.
   * @param event - Event object which should be emitted through the listeners.
   *
   * @internal
   */
  private emitEvent(cursor: Subscription.SubscriptionCursor, event: Subscription.SubscriptionResponse['messages'][0]) {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this._globalSubscriptionSet) this._globalSubscriptionSet.handleEvent(cursor, event);
      this.eventDispatcher?.handleEvent(event);

      Object.values(this.eventHandleCapable).forEach((eventHandleCapable) => {
        if (eventHandleCapable !== this._globalSubscriptionSet) eventHandleCapable.handleEvent(cursor, event);
      });
    }
  }

  /**
   * Set a connection status change event handler.
   *
   * @param listener - Listener function, which will be called each time when the connection status changes.
   */
  set onStatus(listener: ((status: Status | StatusEvent) => void) | undefined) {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.eventDispatcher) this.eventDispatcher.onStatus = listener;
    } else throw new Error('Listener error: subscription module disabled');
  }

  /**
   * Set a new message handler.
   *
   * @param listener - Listener function, which will be called each time when a new message
   * is received from the real-time network.
   */
  set onMessage(listener: ((event: Subscription.Message) => void) | undefined) {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.eventDispatcher) this.eventDispatcher.onMessage = listener;
    } else throw new Error('Listener error: subscription module disabled');
  }

  /**
   * Set a new presence events handler.
   *
   * @param listener - Listener function, which will be called each time when a new
   * presence event is received from the real-time network.
   */
  set onPresence(listener: ((event: Subscription.Presence) => void) | undefined) {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.eventDispatcher) this.eventDispatcher.onPresence = listener;
    } else throw new Error('Listener error: subscription module disabled');
  }

  /**
   * Set a new signal handler.
   *
   * @param listener - Listener function, which will be called each time when a new signal
   * is received from the real-time network.
   */
  set onSignal(listener: ((event: Subscription.Signal) => void) | undefined) {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.eventDispatcher) this.eventDispatcher.onSignal = listener;
    } else throw new Error('Listener error: subscription module disabled');
  }

  /**
   * Set a new app context event handler.
   *
   * @param listener - Listener function, which will be called each time when a new
   * app context event is received from the real-time network.
   */
  set onObjects(listener: ((event: Subscription.AppContextObject) => void) | undefined) {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.eventDispatcher) this.eventDispatcher.onObjects = listener;
    } else throw new Error('Listener error: subscription module disabled');
  }

  /**
   * Set a new message reaction event handler.
   *
   * @param listener - Listener function, which will be called each time when a
   * new message reaction event is received from the real-time network.
   */
  set onMessageAction(listener: ((event: Subscription.MessageAction) => void) | undefined) {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.eventDispatcher) this.eventDispatcher.onMessageAction = listener;
    } else throw new Error('Listener error: subscription module disabled');
  }

  /**
   * Set a new file handler.
   *
   * @param listener - Listener function, which will be called each time when a new file
   * is received from the real-time network.
   */
  set onFile(listener: ((event: Subscription.File) => void) | undefined) {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.eventDispatcher) this.eventDispatcher.onFile = listener;
    } else throw new Error('Listener error: subscription module disabled');
  }

  /**
   * Set events handler.
   *
   * @param listener - Events listener configuration object, which lets specify handlers for multiple
   * types of events.
   */
  addListener(listener: Listener) {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.eventDispatcher) {
        this.eventDispatcher.addListener(listener);
      }
    } else throw new Error('Listener error: subscription module disabled');
  }

  /**
   * Remove real-time event listener.
   *
   * @param listener - Event listener configuration, which should be removed from the list of notified
   * listeners. **Important:** Should be the same object which has been passed to the
   * {@link addListener}.
   */
  public removeListener(listener: Listener): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.eventDispatcher) this.eventDispatcher.removeListener(listener);
    } else throw new Error('Listener error: subscription module disabled');
  }

  /**
   * Clear all real-time event listeners.
   */
  public removeAllListeners(): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.eventDispatcher) this.eventDispatcher.removeAllListeners();
    } else throw new Error('Listener error: subscription module disabled');
  }
  // endregion

  // --------------------------------------------------------
  // ------------------ Cryptography API --------------------
  // --------------------------------------------------------
  // region Cryptography
  // region Common

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
  public encrypt(data: string | Payload, customCipherKey?: string): string {
    this.logger.warn('PubNub', "'encrypt' is deprecated. Use cryptoModule instead.");

    const cryptoModule = this._configuration.getCryptoModule();

    if (!customCipherKey && cryptoModule && typeof data === 'string') {
      const encrypted = cryptoModule.encrypt(data);

      return typeof encrypted === 'string' ? encrypted : encode(encrypted);
    }

    if (!this.crypto) throw new Error('Encryption error: cypher key not set');

    if (process.env.CRYPTO_MODULE !== 'disabled') {
      return this.crypto.encrypt(data, customCipherKey);
    } else throw new Error('Encryption error: crypto module disabled');
  }

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
  public decrypt(data: string, customCipherKey?: string): Payload | null {
    this.logger.warn('PubNub', "'decrypt' is deprecated. Use cryptoModule instead.");

    const cryptoModule = this._configuration.getCryptoModule();
    if (!customCipherKey && cryptoModule) {
      const decrypted = cryptoModule.decrypt(data);

      return decrypted instanceof ArrayBuffer ? JSON.parse(new TextDecoder().decode(decrypted)) : decrypted;
    }

    if (!this.crypto) throw new Error('Decryption error: cypher key not set');

    if (process.env.CRYPTO_MODULE !== 'disabled') {
      return this.crypto.decrypt(data, customCipherKey);
    } else throw new Error('Decryption error: crypto module disabled');
  }
  // endregion

  // region File
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
  public async encryptFile(file: PubNubFileInterface): Promise<PubNubFileInterface>;

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
  public async encryptFile(key: string, file: PubNubFileInterface): Promise<PubNubFileInterface>;

  /**
   * Encrypt file content.
   *
   * @param keyOrFile - Cipher key which should be used to encrypt data or file which should be
   * encrypted using `CryptoModule`.
   * @param [file] - File which should be encrypted using legacy cryptography.
   *
   * @returns Asynchronous file encryption result.
   *
   * @throws Error if a source file isn't provided.
   * @throws File constructor not provided.
   * @throws Crypto module is missing (if non-legacy flow used).
   *
   * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
   */
  public async encryptFile(keyOrFile: string | PubNubFileInterface, file?: PubNubFileInterface) {
    if (typeof keyOrFile !== 'string') file = keyOrFile;

    if (!file) throw new Error('File encryption error. Source file is missing.');
    if (!this._configuration.PubNubFile) throw new Error('File encryption error. File constructor not configured.');
    if (typeof keyOrFile !== 'string' && !this._configuration.getCryptoModule())
      throw new Error('File encryption error. Crypto module not configured.');

    if (typeof keyOrFile === 'string') {
      if (!this.cryptography) throw new Error('File encryption error. File encryption not available');
      if (process.env.FILE_SHARING_MODULE !== 'disabled')
        return this.cryptography.encryptFile(keyOrFile, file, this._configuration.PubNubFile);
      else throw new Error('Encryption error: file sharing module disabled');
    }

    if (process.env.FILE_SHARING_MODULE !== 'disabled')
      return this._configuration.getCryptoModule()?.encryptFile(file, this._configuration.PubNubFile);
    else throw new Error('Encryption error: file sharing module disabled');
  }

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
  public async decryptFile(file: PubNubFileInterface): Promise<PubNubFileInterface>;

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
  public async decryptFile(key: string | PubNubFileInterface, file?: PubNubFileInterface): Promise<PubNubFileInterface>;

  /**
   * Decrypt file content.
   *
   * @param keyOrFile - Cipher key which should be used to decrypt data or file which should be
   * decrypted using `CryptoModule`.
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
  public async decryptFile(keyOrFile: string | PubNubFileInterface, file?: PubNubFileInterface) {
    if (typeof keyOrFile !== 'string') file = keyOrFile;

    if (!file) throw new Error('File encryption error. Source file is missing.');
    if (!this._configuration.PubNubFile)
      throw new Error('File decryption error. File constructor' + ' not configured.');
    if (typeof keyOrFile === 'string' && !this._configuration.getCryptoModule())
      throw new Error('File decryption error. Crypto module not configured.');

    if (typeof keyOrFile === 'string') {
      if (!this.cryptography) throw new Error('File decryption error. File decryption not available');
      if (process.env.FILE_SHARING_MODULE !== 'disabled')
        return this.cryptography.decryptFile(keyOrFile, file, this._configuration.PubNubFile);
      else throw new Error('Decryption error: file sharing module disabled');
    }

    if (process.env.FILE_SHARING_MODULE !== 'disabled')
      return this._configuration.getCryptoModule()?.decryptFile(file, this._configuration.PubNubFile);
    else throw new Error('Decryption error: file sharing module disabled');
  }
  // endregion
  // endregion
}
