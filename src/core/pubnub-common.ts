// region Imports
// region Components
import { Listener, ListenerManager } from './components/listener_manager';
import { SubscriptionManager } from './components/subscription-manager';
import NotificationsPayload from './components/push_payload';
import { TokenManager } from './components/token_manager';
import { AbstractRequest } from './components/request';
import Crypto from './components/cryptography/index';
import EventEmitter from './components/eventEmitter';
import { encode } from './components/base64_codec';
import uuidGenerator from './components/uuid';
// endregion

// region Types
import { Payload, ResultCallback, Status, StatusCallback } from './types/api';
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

// region Event Engine
import { PresenceEventEngine } from '../event-engine/presence/presence';
import { RetryPolicy } from '../event-engine/core/retryPolicy';
import { EventEngine } from '../event-engine';
// endregion
// region Publish & Signal
import * as Publish from './endpoints/publish';
import * as Signal from './endpoints/signal';
// endregion
// region Subscription
import { RequestParameters as SubscribeRequestParameters, SubscribeRequest } from './endpoints/subscribe';
import { ReceiveMessagesSubscribeRequest } from './endpoints/subscriptionUtils/receiveMessages';
import { HandshakeSubscribeRequest } from './endpoints/subscriptionUtils/handshake';
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
import { SubscriptionOptions } from '../entities/commonTypes';
import { ChannelMetadata } from '../entities/ChannelMetadata';
import { SubscriptionSet } from '../entities/SubscriptionSet';
import { ChannelGroup } from '../entities/ChannelGroup';
import { UserMetadata } from '../entities/UserMetadata';
import { Channel } from '../entities/Channel';
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
import { encodeString } from './utils';
import { DownloadFileRequest } from './endpoints/file_upload/download_file';
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

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
> {
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
   * Real-time event listeners manager.
   *
   * @internal
   */
  // @ts-expect-error Allowed to simplify interface when module can be disabled.
  protected readonly listenerManager: ListenerManager;

  /**
   * User's presence event engine.
   *
   * @internal
   */
  private presenceEventEngine?: PresenceEventEngine;

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
   * Real-time events emitter.
   *
   * @internal
   */
  // @ts-expect-error Allowed to simplify interface when module can be disabled.
  private readonly eventEmitter: EventEmitter;

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
   * Exponential retry policy constructor.
   */
  static ExponentialRetryPolicy = RetryPolicy.ExponentialRetryPolicy;

  /**
   * Linear retry policy constructor.
   */
  static LinearRetryPolicy = RetryPolicy.LinearRetryPolicy;

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

  constructor(configuration: ClientInstanceConfiguration<CryptographyTypes>) {
    this._configuration = configuration.configuration;
    this.cryptography = configuration.cryptography;
    this.tokenManager = configuration.tokenManager;
    this.transport = configuration.transport;
    this.crypto = configuration.crypto;

    // API group entry points initialization.
    if (process.env.APP_CONTEXT_MODULE !== 'disabled')
      this._objects = new PubNubObjects(this._configuration, this.sendRequest.bind(this));
    if (process.env.CHANNEL_GROUPS_MODULE !== 'disabled')
      this._channelGroups = new PubNubChannelGroups(this._configuration.keySet, this.sendRequest.bind(this));
    if (process.env.MOBILE_PUSH_MODULE !== 'disabled')
      this._push = new PubNubPushNotifications(this._configuration.keySet, this.sendRequest.bind(this));

    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      // Prepare for real-time events announcement.
      this.listenerManager = new ListenerManager();
      this.eventEmitter = new EventEmitter(this.listenerManager);

      if (this._configuration.enableEventEngine) {
        if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
          let heartbeatInterval = this._configuration.getHeartbeatInterval();
          this.presenceState = {};

          if (process.env.PRESENCE_MODULE !== 'disabled') {
            if (heartbeatInterval) {
              this.presenceEventEngine = new PresenceEventEngine({
                heartbeat: this.heartbeat.bind(this),
                leave: (parameters) => this.makeUnsubscribe(parameters, () => {}),
                heartbeatDelay: () =>
                  new Promise((resolve, reject) => {
                    heartbeatInterval = this._configuration.getHeartbeatInterval();
                    if (!heartbeatInterval) reject(new PubNubError('Heartbeat interval has been reset.'));
                    else setTimeout(resolve, heartbeatInterval * 1000);
                  }),
                retryDelay: (amount) => new Promise((resolve) => setTimeout(resolve, amount)),
                emitStatus: (status) => this.listenerManager.announceStatus(status),
                config: this._configuration,
                presenceState: this.presenceState,
              });
            }
          }

          this.eventEngine = new EventEngine({
            handshake: this.subscribeHandshake.bind(this),
            receiveMessages: this.subscribeReceiveMessages.bind(this),
            delay: (amount) => new Promise((resolve) => setTimeout(resolve, amount)),
            join: this.join.bind(this),
            leave: this.leave.bind(this),
            leaveAll: this.leaveAll.bind(this),
            presenceState: this.presenceState,
            config: this._configuration,
            emitMessages: (events) => {
              try {
                events.forEach((event) => this.eventEmitter.emitEvent(event));
              } catch (e) {
                const errorStatus: Status = {
                  error: true,
                  category: StatusCategory.PNUnknownCategory,
                  errorData: e as Error,
                  statusCode: 0,
                };
                this.listenerManager.announceStatus(errorStatus);
              }
            },
            emitStatus: (status) => this.listenerManager.announceStatus(status),
          });
        } else throw new Error('Event Engine error: subscription event engine module disabled');
      } else {
        if (process.env.SUBSCRIBE_MANAGER_MODULE !== 'disabled') {
          this.subscriptionManager = new SubscriptionManager(
            this._configuration,
            this.listenerManager,
            this.eventEmitter,
            this.makeSubscribe.bind(this),
            this.heartbeat.bind(this),
            this.makeUnsubscribe.bind(this),
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
    this._configuration.setAuthKey(authKey);
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
    if (!value || typeof value !== 'string' || value.trim().length === 0)
      throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
    this._configuration.userId = value;
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
    if (!value || typeof value !== 'string' || value.trim().length === 0)
      throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
    this._configuration.userId = value;
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
    this._configuration.setFilterExpression(expression);
  }

  /**
   * Update real-time updates filtering expression.
   *
   * @param expression - New expression which should be used or `undefined` to disable filtering.
   */
  setFilterExpression(expression: string | null): void {
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
    this.cipherKey = key;
  }

  /**
   * Change heartbeat requests interval.
   *
   * @param interval - New presence request heartbeat intervals.
   */
  set heartbeatInterval(interval: number) {
    this._configuration.setHeartbeatInterval(interval);
  }

  /**
   * Change heartbeat requests interval.
   *
   * @param interval - New presence request heartbeat intervals.
   */
  setHeartbeatInterval(interval: number): void {
    this.heartbeatInterval = interval;
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
   * @param suffix - Suffix with information about framework.
   */
  _addPnsdkSuffix(name: string, suffix: string | number) {
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
   * @deprecated Use the {@link PubNubCore#setUserId} or {@link PubNubCore#userId} setter instead.
   */
  setUUID(value: string) {
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
    return new Channel(name, this.eventEmitter, this);
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
    return new ChannelGroup(name, this.eventEmitter, this);
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
    return new ChannelMetadata(id, this.eventEmitter, this);
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
    return new UserMetadata(id, this.eventEmitter, this);
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
    if (process.env.SUBSCRIBE_EVENT_ENGINE_MODULE !== 'disabled') {
      return new SubscriptionSet({ ...parameters, eventEmitter: this.eventEmitter, pubnub: this });
    } else throw new Error('Subscription error: subscription event engine module disabled');
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
   */
  private sendRequest<ResponseType>(
    request: AbstractRequest<ResponseType>,
    callback: ResultCallback<ResponseType>,
  ): void;

  /**
   * Schedule request execution.
   *
   * @param request - REST API request.
   *
   * @returns Asynchronous request execution and response parsing result.
   */
  private async sendRequest<ResponseType>(request: AbstractRequest<ResponseType>): Promise<ResponseType>;

  /**
   * Schedule request execution.
   *
   * @param request - REST API request.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous request execution and response parsing result or `void` in case if
   * `callback` provided.
   *
   * @throws PubNubError in case of request processing error.
   */
  private async sendRequest<ResponseType>(
    request: AbstractRequest<ResponseType>,
    callback?: ResultCallback<ResponseType>,
  ): Promise<ResponseType | void> {
    // Validate user-input.
    const validationResult = request.validate();
    if (validationResult) {
      if (callback) return callback(createValidationError(validationResult), null);
      throw new PubNubError('Validation failed, check status for details', createValidationError(validationResult));
    }

    // Complete request configuration.
    const transportRequest = request.request();
    if (transportRequest.formData && transportRequest.formData.length > 0) {
      // Set 300 seconds file upload request delay.
      transportRequest.timeout = 300;
    } else {
      if (request.operation() === RequestOperation.PNSubscribeOperation)
        transportRequest.timeout = this._configuration.getSubscribeTimeout();
      else transportRequest.timeout = this._configuration.getTransactionTimeout();
    }

    // API request processing status.
    const status: Status = {
      error: false,
      operation: request.operation(),
      category: StatusCategory.PNAcknowledgmentCategory,
      statusCode: 0,
    };

    const [sendableRequest, cancellationController] = this.transport.makeSendable(transportRequest);

    /**
     * **Important:** Because of multiple environments where JS SDK can be used control over
     * cancellation had to be inverted to let transport provider solve request cancellation task
     * more efficiently. As result, cancellation controller can be retrieved and used only after
     * request will be scheduled by transport provider.
     */
    request.cancellationController = cancellationController ? cancellationController : null;

    return sendableRequest
      .then((response) => {
        status.statusCode = response.status;

        // Handle special case when request completed but not fully processed by PubNub service.
        if (response.status !== 200 && response.status !== 204) {
          const contentType = response.headers['content-type'];
          if (contentType || contentType.indexOf('javascript') !== -1 || contentType.indexOf('json') !== -1) {
            const json = JSON.parse(PubNubCore.decoder.decode(response.body)) as Payload;
            if (typeof json === 'object' && 'error' in json && json.error && typeof json.error === 'object')
              status.errorData = json.error;
          }
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
        if (callback) return callback(apiError.toStatus(request.operation()), null);

        throw apiError.toPubNubError(
          request.operation(),
          'REST API request processing error, check status for details',
        );
      });
  }

  /**
   * Unsubscribe from all channels and groups.
   *
   * @param [isOffline] - Whether `offline` presence should be notified or not.
   */
  public destroy(isOffline?: boolean): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.subscriptionManager) {
        this.subscriptionManager.unsubscribeAll(isOffline);
        this.subscriptionManager.disconnect();
      } else if (this.eventEngine) this.eventEngine.dispose();
    }
  }

  /**
   * Unsubscribe from all channels and groups.
   *
   * @deprecated Use {@link destroy} method instead.
   */
  public stop(): void {
    this.destroy();
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Listener -----------------------
  // --------------------------------------------------------
  // region Listener

  /**
   * Register real-time events listener.
   *
   * @param listener - Listener with event callbacks to handle different types of events.
   */
  public addListener(listener: Listener): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') this.listenerManager.addListener(listener);
    else throw new Error('Subscription error: subscription module disabled');
  }

  /**
   * Remove real-time event listener.
   *
   * @param listener - Event listeners which should be removed.
   */
  public removeListener(listener: Listener): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') this.listenerManager.removeListener(listener);
    else throw new Error('Subscription error: subscription module disabled');
  }

  /**
   * Clear all real-time event listeners.
   */
  public removeAllListeners(): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') this.listenerManager.removeAllListeners();
    else throw new Error('Subscription error: subscription module disabled');
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
      const request = new Publish.PublishRequest({
        ...parameters,
        keySet: this._configuration.keySet,
        crypto: this._configuration.getCryptoModule(),
      });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const request = new Signal.SignalRequest({
        ...parameters,
        keySet: this._configuration.keySet,
      });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
    callback ??= () => {};
    return this.publish({ ...parameters, replicate: false, storeInHistory: false }, callback);
  }
  // endregion

  // --------------------------------------------------------
  // -------------------- Subscribe API ---------------------
  // --------------------------------------------------------
  // region Subscribe API

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
   * Subscribe to specified channels and groups real-time events.
   *
   * @param parameters - Request configuration parameters.
   */
  public subscribe(parameters: Subscription.SubscribeParameters): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.subscriptionManager) this.subscriptionManager.subscribe(parameters);
      else if (this.eventEngine) this.eventEngine.subscribe(parameters);
    } else throw new Error('Subscription error: subscription module disabled');
  }

  /**
   * Perform subscribe request.
   *
   * **Note:** Method passed into managers to let them use it when required.
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
       * **Note:** Had to be done after scheduling because transport provider return cancellation
       * controller only when schedule new request.
       */
      if (this.subscriptionManager) {
        // Creating identifiable abort caller.
        const callableAbort = () => request.abort();
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
      if (this.subscriptionManager) this.subscriptionManager.unsubscribe(parameters);
      else if (this.eventEngine) this.eventEngine.unsubscribe(parameters);
    } else throw new Error('Unsubscription error: subscription module disabled');
  }

  /**
   * Perform unsubscribe request.
   *
   * **Note:** Method passed into managers to let them use it when required.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  private makeUnsubscribe(parameters: Presence.PresenceLeaveParameters, callback: StatusCallback): void {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      this.sendRequest(
        new PresenceLeaveRequest({
          ...parameters,
          keySet: this._configuration.keySet,
        }),
        callback,
      );
    } else throw new Error('Unsubscription error: presence module disabled');
  }

  /**
   * Unsubscribe from all channels and groups.
   */
  public unsubscribeAll() {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.subscriptionManager) this.subscriptionManager.unsubscribeAll();
      else if (this.eventEngine) this.eventEngine.unsubscribeAll();
    } else throw new Error('Unsubscription error: subscription module disabled');
  }

  /**
   * Temporarily disconnect from real-time events stream.
   */
  public disconnect(): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.subscriptionManager) this.subscriptionManager.disconnect();
      else if (this.eventEngine) this.eventEngine.disconnect();
    } else throw new Error('Disconnection error: subscription module disabled');
  }

  /**
   * Restore connection to the real-time events stream.
   *
   * @param parameters - Reconnection catch up configuration. **Note:** available only with
   * enabled event engine.
   */
  public reconnect(parameters?: { timetoken?: string; region?: number }): void {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') {
      if (this.subscriptionManager) this.subscriptionManager.reconnect();
      else if (this.eventEngine) this.eventEngine.reconnect(parameters ?? {});
    } else throw new Error('Reconnection error: subscription module disabled');
  }

  /**
   * Event engine handshake subscribe.
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
        request.abort();
      });

      /**
       * Allow subscription cancellation.
       *
       * **Note:** Had to be done after scheduling because transport provider return cancellation
       * controller only when schedule new request.
       */
      const handshakeResponse = this.sendRequest(request);
      return handshakeResponse.then((response) => {
        abortUnsubscribe();
        return response.cursor;
      });
    } else throw new Error('Subscription error: subscription event engine module disabled');
  }

  /**
   * Event engine receive messages subscribe.
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
        request.abort();
      });

      /**
       * Allow subscription cancellation.
       *
       * **Note:** Had to be done after scheduling because transport provider return cancellation
       * controller only when schedule new request.
       */
      const handshakeResponse = this.sendRequest(request);
      return handshakeResponse.then((response) => {
        abortUnsubscribe();
        return response;
      });
    } else throw new Error('Subscription error: subscription event engine module disabled');
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
      const request = new GetMessageActionsRequest({ ...parameters, keySet: this._configuration.keySet });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const request = new AddMessageActionRequest({ ...parameters, keySet: this._configuration.keySet });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const request = new RemoveMessageAction({ ...parameters, keySet: this._configuration.keySet });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const request = new FetchMessagesRequest({
        ...parameters,
        keySet: this._configuration.keySet,
        crypto: this._configuration.getCryptoModule(),
        getFileUrl: this.getFileUrl.bind(this),
      });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
   * @deprecated
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
   * @deprecated
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
   * @deprecated
   */
  async deleteMessages(
    parameters: History.DeleteMessagesParameters,
    callback?: ResultCallback<History.DeleteMessagesResponse>,
  ): Promise<History.DeleteMessagesResponse | void> {
    if (process.env.MESSAGE_PERSISTENCE_MODULE !== 'disabled') {
      const request = new DeleteMessageRequest({ ...parameters, keySet: this._configuration.keySet });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const request = new MessageCountRequest({ ...parameters, keySet: this._configuration.keySet });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const request = new GetHistoryRequest({
        ...parameters,
        keySet: this._configuration.keySet,
        crypto: this._configuration.getCryptoModule(),
      });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const request = new HereNowRequest({ ...parameters, keySet: this._configuration.keySet });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const request = new WhereNowRequest({
        uuid: parameters.uuid ?? this._configuration.userId!,
        keySet: this._configuration.keySet,
      });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const request = new GetPresenceStateRequest({
        ...parameters,
        uuid: parameters.uuid ?? this._configuration.userId,
        keySet: this._configuration.keySet,
      });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const { keySet, userId: userId } = this._configuration;
      const heartbeat = this._configuration.getPresenceTimeout();
      let request: AbstractRequest<Presence.PresenceHeartbeatResponse | Presence.SetPresenceStateResponse>;

      // Maintain presence information (if required).
      if (this._configuration.enableEventEngine && this.presenceState) {
        const presenceState = this.presenceState;
        parameters.channels?.forEach((channel) => (presenceState[channel] = parameters.state));

        if ('channelGroups' in parameters) {
          parameters.channelGroups?.forEach((group) => (presenceState[group] = parameters.state));
        }
      }

      // Check whether state should be set with heartbeat or not.
      if ('withHeartbeat' in parameters) {
        request = new HeartbeatRequest({ ...parameters, keySet, heartbeat });
      } else {
        request = new SetPresenceStateRequest({ ...parameters, keySet, uuid: userId! });
      }

      // Update state used by subscription manager.
      if (this.subscriptionManager) this.subscriptionManager.setState(parameters);

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
    } else throw new Error('Set UUID State error: presence module disabled');
  }
  // endregion

  // region Change presence state
  /**
   * Manual presence management.
   *
   * @param parameters - Desired presence state for provided list of channels and groups.
   */
  public presence(parameters: { connected: boolean; channels?: string[]; channelGroups?: string[] }) {
    if (process.env.SUBSCRIBE_MANAGER_MODULE !== 'disabled') this.subscriptionManager?.changePresence(parameters);
    else throw new Error('Change UUID presence error: subscription manager module disabled');
  }
  // endregion

  // region Heartbeat
  /**
   * Announce user presence
   *
   * @param parameters - Desired presence state for provided list of channels and groups.
   * @param callback - Request completion handler callback.
   */
  private async heartbeat(
    parameters: Presence.PresenceHeartbeatParameters,
    callback?: ResultCallback<Presence.PresenceHeartbeatResponse>,
  ) {
    if (process.env.PRESENCE_MODULE !== 'disabled') {
      const request = new HeartbeatRequest({
        ...parameters,
        keySet: this._configuration.keySet,
      });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
    } else throw new Error('Announce UUID Presence error: presence module disabled');
  }
  // endregion

  // region Join
  /**
   * Announce user `join` on specified list of channels and groups.
   *
   * @param parameters - List of channels and groups where `join` event should be sent.
   */
  private join(parameters: { channels?: string[]; groups?: string[] }) {
    if (process.env.PRESENCE_MODULE !== 'disabled') this.presenceEventEngine?.join(parameters);
    else throw new Error('Announce UUID Presence error: presence module disabled');
  }
  // endregion

  // region Leave
  /**
   * Announce user `leave` on specified list of channels and groups.
   *
   * @param parameters - List of channels and groups where `leave` event should be sent.
   */
  private leave(parameters: { channels?: string[]; groups?: string[] }) {
    if (process.env.PRESENCE_MODULE !== 'disabled') this.presenceEventEngine?.leave(parameters);
    else throw new Error('Announce UUID Leave error: presence module disabled');
  }

  /**
   * Announce user `leave` on all subscribed channels.
   */
  private leaveAll() {
    if (process.env.PRESENCE_MODULE !== 'disabled') this.presenceEventEngine?.leaveAll();
    else throw new Error('Announce UUID Leave error: presence module disabled');
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
   * Generate access token with requested permissions.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous grant token response.
   */
  public async grantToken(parameters: PAM.GrantTokenParameters): Promise<PAM.GrantTokenResponse>;

  /**
   * Grant token permission.
   *
   * Generate access token with requested permissions.
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
      const request = new GrantTokenRequest({ ...parameters, keySet: this._configuration.keySet });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const request = new RevokeTokenRequest({ token, keySet: this._configuration.keySet });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
    } else throw new Error('Revoke Token error: PAM module disabled');
  }
  // endregion

  // region Token Manipulation
  /**
   * Get current access token.
   *
   * @returns Previously configured access token using {@link setToken} method.
   */
  public get token(): string | undefined {
    return this.tokenManager && this.tokenManager.getToken();
  }

  /**
   * Get current access token.
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
  public parseToken(token: string) {
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
      const request = new GrantRequest({ ...parameters, keySet: this._configuration.keySet });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const request = new AuditRequest({ ...parameters, keySet: this._configuration.keySet });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
   * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata} method instead.
   */
  public async fetchUsers<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parametersOrCallback?:
      | AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>
      | ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
    callback?: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.GetAllUUIDMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled')
      return this.objects._getAllUUIDMetadata(parametersOrCallback, callback);
    else throw new Error('Fetch Users Metadata error: App Context module disabled');
  }

  /**
   * Fetch User object for currently configured PubNub client `uuid`.
   *
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata} method instead.
   */
  public fetchUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    callback: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
  ): void;

  /**
   * Fetch User object for currently configured PubNub client `uuid`.
   *
   * @param parameters - Request configuration parameters. Will fetch User object for currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata} method instead.
   */
  public fetchUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetUUIDMetadataParameters,
    callback: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
  ): void;

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
  public async fetchUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters?: AppContext.GetUUIDMetadataParameters,
  ): Promise<AppContext.GetUUIDMetadataResponse<Custom>>;

  /**
   * Fetch User object for currently configured PubNub client `uuid`.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get User object response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata} method instead.
   */
  async fetchUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parametersOrCallback?:
      | AppContext.GetUUIDMetadataParameters
      | ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
    callback?: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.GetUUIDMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled')
      return this.objects._getUUIDMetadata(parametersOrCallback, callback);
    else throw new Error('Fetch User Metadata error: App Context module disabled');
  }

  /**
   * Create User object.
   *
   * @param parameters - Request configuration parameters. Will create User object for currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata} method instead.
   */
  public createUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
    callback: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>,
  ): void;

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
  public async createUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
  ): Promise<AppContext.SetUUIDMetadataResponse<Custom>>;

  /**
   * Create User object.
   *
   * @param parameters - Request configuration parameters. Will create User object for currently
   * configured PubNub client `uuid` if not set.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous create User object response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata} method instead.
   */
  async createUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
    callback?: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.SetUUIDMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') return this.objects._setUUIDMetadata(parameters, callback);
    else throw new Error('Create User Metadata error: App Context module disabled');
  }

  /**
   * Update User object.
   *
   * @param parameters - Request configuration parameters. Will update User object for currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata} method instead.
   */
  public updateUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
    callback: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>,
  ): void;

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
  public async updateUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
  ): Promise<AppContext.SetUUIDMetadataResponse<Custom>>;

  /**
   * Update User object.
   *
   * @param parameters - Request configuration parameters. Will update User object for currently
   * configured PubNub client `uuid` if not set.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous update User object response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata} method instead.
   */
  async updateUser<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
    callback?: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.SetUUIDMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') return this.objects._setUUIDMetadata(parameters, callback);
    else throw new Error('Update User Metadata error: App Context module disabled');
  }

  /**
   * Remove a specific User object.
   *
   * @param callback - Request completion handler callback. Will remove User object for currently
   * configured PubNub client `uuid` if not set.
   *
   * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata} method instead.
   */
  public removeUser(callback: ResultCallback<AppContext.RemoveUUIDMetadataResponse>): void;

  /**
   * Remove a specific User object.
   *
   * @param parameters - Request configuration parameters. Will remove User object for currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata} method instead.
   */
  public removeUser(
    parameters: AppContext.RemoveUUIDMetadataParameters,
    callback: ResultCallback<AppContext.RemoveUUIDMetadataResponse>,
  ): void;

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
  public async removeUser(
    parameters?: AppContext.RemoveUUIDMetadataParameters,
  ): Promise<AppContext.RemoveUUIDMetadataResponse>;

  /**
   * Remove a specific User object.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous User object remove response or `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata} method instead.
   */
  public async removeUser(
    parametersOrCallback?:
      | AppContext.RemoveUUIDMetadataParameters
      | ResultCallback<AppContext.RemoveUUIDMetadataResponse>,
    callback?: ResultCallback<AppContext.RemoveUUIDMetadataResponse>,
  ): Promise<AppContext.RemoveUUIDMetadataResponse | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled')
      return this.objects._removeUUIDMetadata(parametersOrCallback, callback);
    else throw new Error('Remove User Metadata error: App Context module disabled');
  }

  /**
   * Fetch a paginated list of Space objects.
   *
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata} method instead.
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
   * @returns Asynchronous get all Space objects response.
   *
   * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata} method instead.
   */
  async fetchSpaces<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parametersOrCallback?:
      | AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>
      | ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
    callback?: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.GetAllChannelMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled')
      return this.objects._getAllChannelMetadata(parametersOrCallback, callback);
    else throw new Error('Fetch Spaces Metadata error: App Context module disabled');
  }

  /**
   * Fetch a specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getChannelMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.getChannelMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.getChannelMetadata} method instead.
   */
  async fetchSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetChannelMetadataParameters,
    callback?: ResultCallback<AppContext.GetChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.GetChannelMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') return this.objects._getChannelMetadata(parameters, callback);
    else throw new Error('Fetch Space Metadata error: App Context module disabled');
  }

  /**
   * Create specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
   */
  async createSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetChannelMetadataParameters<Custom>,
    callback?: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.SetChannelMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') return this.objects._setChannelMetadata(parameters, callback);
    else throw new Error('Create Space Metadata error: App Context module disabled');
  }

  /**
   * Update specific Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
   */
  async updateSpace<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetChannelMetadataParameters<Custom>,
    callback?: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.SetChannelMetadataResponse<Custom> | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') return this.objects._setChannelMetadata(parameters, callback);
    else throw new Error('Update Space Metadata error: App Context module disabled');
  }

  /**
   * Remove Space object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata} method instead.
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
   * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata} method instead.
   */
  async removeSpace(
    parameters: AppContext.RemoveChannelMetadataParameters,
    callback?: ResultCallback<AppContext.RemoveChannelMetadataResponse>,
  ): Promise<AppContext.RemoveChannelMetadataResponse | void> {
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') return this.objects._removeChannelMetadata(parameters, callback);
    else throw new Error('Remove Space Metadata error: App Context module disabled');
  }

  /**
   * Fetch paginated list of specific Space members or specific User memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   *
   * @deprecated Use {@link PubNubCore#objects.getChannelMembers} or {@link PubNubCore#objects.getMemberships}
   * methods instead.
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
   * @deprecated Use {@link PubNubCore#objects.getChannelMembers} or {@link PubNubCore#objects.getMemberships}
   * methods instead.
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
   * Fetch paginated list of specific Space members or specific User memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get specific Space members or specific User memberships response or
   * `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubCore#objects.getChannelMembers} or {@link PubNubCore#objects.getMemberships}
   * methods instead.
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
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
   * methods instead.
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
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
   * methods instead.
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
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
   * methods instead.
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
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
   * methods instead.
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
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
   * methods instead.
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
   * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
   * methods instead.
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
    if (process.env.APP_CONTEXT_MODULE !== 'disabled') return this.objects.addMemberships(parameters, callback);
    else throw new Error('Update Memberships error: App Context module disabled');
  }

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
   * @deprecated Use {@link PubNubCore#objects.removeMemberships} or {@link PubNubCore#objects.removeChannelMembers}
   * methods instead
   * from `objects` API group..
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
   * @deprecated Use {@link PubNubCore#objects.removeMemberships} or {@link PubNubCore#objects.removeChannelMembers}
   * methods instead
   * from `objects` API group..
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

      return sendFileRequest
        .process()
        .then((response) => {
          status.statusCode = response.status;

          if (callback) return callback(status, response);
          return response;
        })
        .catch((error: unknown) => {
          let errorStatus: Status | undefined;
          if (error instanceof PubNubError) errorStatus = error.status;
          else if (error instanceof PubNubAPIError) errorStatus = error.toStatus(status.operation!);

          // Notify callback (if possible).
          if (callback && errorStatus) callback(errorStatus, null);

          throw new PubNubError('REST API request processing error, check status for details', errorStatus);
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

      const request = new PublishFileMessageRequest({
        ...parameters,
        keySet: this._configuration.keySet,
        crypto: this._configuration.getCryptoModule(),
      });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
      const request = new FilesListRequest({ ...parameters, keySet: this._configuration.keySet });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
   * Download shared file from specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public downloadFile(parameters: FileSharing.DownloadFileParameters, callback: ResultCallback<PlatformFile>): void;

  /**
   * Download shared file from specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous download shared file response.
   */
  public async downloadFile(parameters: FileSharing.DownloadFileParameters): Promise<PlatformFile>;

  /**
   * Download shared file from specific channel.
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

      const request = new DownloadFileRequest<PlatformFile>({
        ...parameters,
        keySet: this._configuration.keySet,
        PubNubFile: this._configuration.PubNubFile,
        cryptography: this.cryptography ? (this.cryptography as Cryptography<ArrayBuffer>) : undefined,
        crypto: this._configuration.getCryptoModule(),
      });

      if (callback) return this.sendRequest(request, callback);
      return (await this.sendRequest(request)) as PlatformFile;
    } else throw new Error('Download File error: file sharing module disabled');
  }
  // endregion

  // region Delete
  /**
   * Delete shared file from specific channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public deleteFile(
    parameters: FileSharing.DeleteFileParameters,
    callback: ResultCallback<FileSharing.DeleteFileResponse>,
  ): void;

  /**
   * Delete shared file from specific channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous delete shared file response.
   */
  public async deleteFile(parameters: FileSharing.DeleteFileParameters): Promise<FileSharing.DeleteFileResponse>;

  /**
   * Delete shared file from specific channel.
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
      const request = new DeleteFileRequest({ ...parameters, keySet: this._configuration.keySet });

      if (callback) return this.sendRequest(request, callback);
      return this.sendRequest(request);
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
    const request = new Time.TimeRequest();

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
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
   * @deprecated
   * @param [customCipherKey] - Cipher key which should be used to encrypt data. **Deprecated:**
   * use {@link Configuration#cryptoModule|cryptoModule} instead.
   *
   * @returns Data encryption result as a string.
   */
  public encrypt(data: string | Payload, customCipherKey?: string): string {
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
   */
  public decrypt(data: string, customCipherKey?: string): Payload | null {
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
   * @throws Error if source file not provided.
   * @throws File constructor not provided.
   * @throws Crypto module is missing (if non-legacy flow used).
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
   * @throws Error if source file not provided.
   * @throws File constructor not provided.
   * @throws Crypto module is missing (if non-legacy flow used).
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
   * @throws Error if source file not provided.
   * @throws File constructor not provided.
   * @throws Crypto module is missing (if non-legacy flow used).
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
   * @throws Error if source file not provided.
   * @throws File constructor not provided.
   * @throws Crypto module is missing (if non-legacy flow used).
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
   * @throws Error if source file not provided.
   * @throws File constructor not provided.
   * @throws Crypto module is missing (if non-legacy flow used).
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
   * @throws Error if source file not provided.
   * @throws File constructor not provided.
   * @throws Crypto module is missing (if non-legacy flow used).
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
