/**
 * {@link PubNub} client configuration module.
 *
 * @internal
 */

import { ExtendedConfiguration, PlatformConfiguration, PrivateClientConfiguration } from '../interfaces/configuration';
import { CryptorConfiguration, ICryptoModule } from '../interfaces/crypto-module';
import { PubNubFileConstructor, PubNubFileInterface } from '../types/file';
import { ConsoleLogger } from '../../loggers/console-logger';
import { Endpoint, RetryPolicy } from './retry-policy';
import { LogLevel } from '../interfaces/logger';
import { LoggerManager } from './logger-manager';
import { Payload } from '../types/api';
import uuidGenerator from './uuid';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether encryption (if set) should use random initialization vector or not.
 *
 * @internal
 */
const USE_RANDOM_INITIALIZATION_VECTOR = true;
// endregion

/**
 * Crypto Module instance configuration function.
 *
 * Function will be used each time when `cipherKey` will be changed.
 *
 * @internal
 */
type SetupCryptoModule = (configuration: CryptorConfiguration) => ICryptoModule | undefined;

/**
 * Internal state of the {@link PrivateClientConfiguration} to store temporarily information.
 */
type PrivateConfigurationFields = {
  /**
   * Registered loggers manager.
   */
  _loggerManager: LoggerManager;

  /**
   * Frameworks suffixes.
   *
   * Frameworks built atop of PubNub SDK can add key/value pairs which will be added to the
   * `pnsdk` query parameter.
   * @private
   */
  _pnsdkSuffix: Record<string, string>;

  /**
   * Unique PubNub client instance identifier.
   */
  _instanceId: string;

  /**
   * Crypto Module configuration callback.
   *
   * Callback allow to setup Crypto Module in platform-independent way.
   */
  _setupCryptoModule?: SetupCryptoModule;

  /**
   * Configured crypto module.
   */
  _cryptoModule?: ICryptoModule;

  /**
   * Currently used data encryption / decryption key.
   */
  _cipherKey: string | undefined;
};

/**
 * Create {@link PubNub} client private configuration object.
 *
 * @param base - User- and platform-provided configuration.
 * @param setupCryptoModule - Platform-provided {@link ICryptoModule} configuration block.
 *
 * @returns `PubNub` client private configuration.
 *
 * @internal
 */
export const makeConfiguration = (
  base: ExtendedConfiguration & PlatformConfiguration,
  setupCryptoModule?: SetupCryptoModule,
): PrivateClientConfiguration & PrivateConfigurationFields => {
  // Set the default retry policy for subscribing (if new subscribe logic not used).
  if (!base.retryConfiguration && base.enableEventEngine) {
    base.retryConfiguration = RetryPolicy.ExponentialRetryPolicy({
      minimumDelay: 2,
      maximumDelay: 150,
      maximumRetry: 6,
      excluded: [
        Endpoint.MessageSend,
        Endpoint.Presence,
        Endpoint.Files,
        Endpoint.MessageStorage,
        Endpoint.ChannelGroups,
        Endpoint.DevicePushNotifications,
        Endpoint.AppContext,
        Endpoint.MessageReactions,
      ],
    });
  }

  const instanceId = `pn-${uuidGenerator.createUUID()}`;

  if (base.logVerbosity) base.logLevel = LogLevel.Debug;
  else if (base.logLevel === undefined) base.logLevel = LogLevel.None;

  // Prepare loggers manager.
  const loggerManager = new LoggerManager(hashFromString(instanceId), base.logLevel, [
    ...(base.loggers ?? []),
    new ConsoleLogger(),
  ]);

  if (base.logVerbosity !== undefined)
    loggerManager.warn('Configuration', "'logVerbosity' is deprecated. Use 'logLevel' instead.");

  // Ensure that retry policy has proper configuration (if has been set).
  base.retryConfiguration?.validate();

  base.useRandomIVs ??= USE_RANDOM_INITIALIZATION_VECTOR;
  if (base.useRandomIVs)
    loggerManager.warn('Configuration', "'useRandomIVs' is deprecated. Use 'cryptoModule' instead.");

  // Override origin value.
  base.origin = standardOrigin(base.ssl ?? false, base.origin!);

  const cryptoModule = base.cryptoModule;
  if (cryptoModule) delete base.cryptoModule;

  const clientConfiguration: PrivateClientConfiguration & PrivateConfigurationFields = {
    ...base,
    _pnsdkSuffix: {},
    _loggerManager: loggerManager,
    _instanceId: instanceId,
    _cryptoModule: undefined,
    _cipherKey: undefined,
    _setupCryptoModule: setupCryptoModule,
    get instanceId(): string | undefined {
      if (base.useInstanceId) return this._instanceId;
      return undefined;
    },
    getInstanceId(): string | undefined {
      if (base.useInstanceId) return this._instanceId;
      return undefined;
    },
    getUserId() {
      return this.userId!;
    },
    setUserId(value: string) {
      if (!value || typeof value !== 'string' || value.trim().length === 0)
        throw new Error('Missing or invalid userId parameter. Provide a valid string userId');

      this.userId = value;
    },
    logger(): LoggerManager {
      return this._loggerManager;
    },
    getAuthKey() {
      return this.authKey;
    },
    setAuthKey(authKey: string | null) {
      this.authKey = authKey;
    },
    getFilterExpression() {
      return this.filterExpression;
    },
    setFilterExpression(expression: string | null | undefined) {
      this.filterExpression = expression;
    },
    getCipherKey(): string | undefined {
      return this._cipherKey;
    },
    setCipherKey(key: string) {
      this._cipherKey = key;

      if (!key && this._cryptoModule) {
        this._cryptoModule = undefined;
        return;
      } else if (!key || !this._setupCryptoModule) return;

      this._cryptoModule = this._setupCryptoModule({
        cipherKey: key,
        useRandomIVs: base.useRandomIVs,
        customEncrypt: this.getCustomEncrypt(),
        customDecrypt: this.getCustomDecrypt(),
        logger: this.logger(),
      });
    },
    getCryptoModule(): ICryptoModule | undefined {
      return this._cryptoModule;
    },
    getUseRandomIVs(): boolean | undefined {
      return base.useRandomIVs;
    },
    isSharedWorkerEnabled(): boolean {
      // @ts-expect-error: Access field from web-based SDK configuration.
      return base.sdkFamily === 'Web' && base['subscriptionWorkerUrl'];
    },
    getKeepPresenceChannelsInPresenceRequests(): boolean {
      // @ts-expect-error: Access field from web-based SDK configuration.
      return base.sdkFamily === 'Web' && base['subscriptionWorkerUrl'];
    },
    setPresenceTimeout(value: number): void {
      this.heartbeatInterval = value / 2 - 1;
      this.presenceTimeout = value;
    },
    getPresenceTimeout(): number {
      return this.presenceTimeout!;
    },
    getHeartbeatInterval(): number | undefined {
      return this.heartbeatInterval;
    },
    setHeartbeatInterval(interval: number) {
      this.heartbeatInterval = interval;
    },
    getTransactionTimeout(): number {
      return this.transactionalRequestTimeout!;
    },
    getSubscribeTimeout(): number {
      return this.subscribeRequestTimeout!;
    },
    getFileTimeout(): number {
      return this.fileRequestTimeout!;
    },
    get PubNubFile(): PubNubFileConstructor<PubNubFileInterface, unknown> | undefined {
      return base.PubNubFile;
    },
    get version(): string {
      return '9.10.0';
    },
    getVersion(): string {
      return this.version;
    },
    _addPnsdkSuffix(name: string, suffix: string | number) {
      this._pnsdkSuffix[name] = `${suffix}`;
    },
    _getPnsdkSuffix(separator: string): string {
      const sdk = Object.values(this._pnsdkSuffix).join(separator);
      return sdk.length > 0 ? separator + sdk : '';
    },

    // --------------------------------------------------------
    // ---------------------- Deprecated ----------------------
    // --------------------------------------------------------
    // region Deprecated

    getUUID(): string {
      return this.getUserId();
    },
    setUUID(value: string) {
      this.setUserId(value);
    },
    getCustomEncrypt(): ((data: string | Payload) => string) | undefined {
      return base.customEncrypt;
    },
    getCustomDecrypt(): ((data: string) => string) | undefined {
      return base.customDecrypt;
    },
    // endregion
  };

  // Setup `CryptoModule` if possible.
  if (base.cipherKey) {
    loggerManager.warn('Configuration', "'cipherKey' is deprecated. Use 'cryptoModule' instead.");
    clientConfiguration.setCipherKey(base.cipherKey);
  } else if (cryptoModule) clientConfiguration._cryptoModule = cryptoModule;

  return clientConfiguration;
};

/**
 * Decide {@lin PubNub} service REST API origin.
 *
 * @param secure - Whether preferred to use secured connection or not.
 * @param origin - User-provided or default origin.
 *
 * @returns `PubNub` REST API endpoints origin.
 */
const standardOrigin = (secure: boolean, origin: string | string[]): string => {
  const protocol = secure ? 'https://' : 'http://';

  if (typeof origin === 'string') return `${protocol}${origin}`;

  return `${protocol}${origin[Math.floor(Math.random() * origin.length)]}`;
};

/**
 * Compute 32bit hash string from source value.
 *
 * @param value - String from which hash string should be computed.
 *
 * @returns Computed hash.
 */
const hashFromString = (value: string) => {
  let basis = 0x811c9dc5;

  for (let i = 0; i < value.length; i++) {
    basis ^= value.charCodeAt(i);
    basis = (basis + ((basis << 1) + (basis << 4) + (basis << 7) + (basis << 8) + (basis << 24))) >>> 0;
  }

  return basis.toString(16).padStart(8, '0');
};
