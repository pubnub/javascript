/**
 * {@link PubNub} client configuration module.
 */

import { ExtendedConfiguration, PlatformConfiguration, PrivateClientConfiguration } from '../interfaces/configuration';
import { CryptoModule, CryptorConfiguration } from '../interfaces/crypto-module';
import { PubNubFileConstructor, PubNubFileInterface } from '../types/file';
import uuidGenerator from './uuid';
import { Payload } from '../types/api';

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
type SetupCryptoModule = (configuration: CryptorConfiguration) => CryptoModule | undefined;

/**
 * Internal state of the {@link PrivateClientConfiguration} to store temporarily information.
 */
type PrivateConfigurationFields = {
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
  _cryptoModule?: CryptoModule;

  /**
   * Currently used data encryption / decryption key.
   */
  _cipherKey: string | undefined;
};

/**
 * Create {@link PubNub} client private configuration object.
 *
 * @param base - User- and platform-provided configuration.
 * @param setupCryptoModule - Platform-provided {@link CryptoModule} configuration block.
 *
 * @returns `PubNub` client private configuration.
 *
 * @internal
 */
export const makeConfiguration = (
  base: ExtendedConfiguration & PlatformConfiguration,
  setupCryptoModule?: SetupCryptoModule,
): PrivateClientConfiguration & PrivateConfigurationFields => {
  // Ensure that retry policy has proper configuration (if has been set).
  base.retryConfiguration?.validate();

  base.useRandomIVs ??= USE_RANDOM_INITIALIZATION_VECTOR;
  // Override origin value.
  base.origin = standardOrigin(base.ssl ?? false, base.origin!);

  const cryptoModule = base.cryptoModule;
  if (cryptoModule) delete base.cryptoModule;

  const clientConfiguration: PrivateClientConfiguration & PrivateConfigurationFields = {
    ...base,
    _pnsdkSuffix: {},
    _instanceId: `pn-${uuidGenerator.createUUID()}`,
    _cryptoModule: undefined,
    _cipherKey: undefined,
    _setupCryptoModule: setupCryptoModule,
    get instanceId(): string | undefined {
      if (this.useInstanceId) return this._instanceId;
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
      });
    },
    getCryptoModule(): CryptoModule | undefined {
      return this._cryptoModule;
    },
    getUseRandomIVs(): boolean | undefined {
      return base.useRandomIVs;
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
    get PubNubFile(): PubNubFileConstructor<PubNubFileInterface, unknown> | undefined {
      return base.PubNubFile;
    },
    get version(): string {
      return '8.2.7';
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
  if (base.cipherKey) clientConfiguration.setCipherKey(base.cipherKey);
  else if (cryptoModule) clientConfiguration._cryptoModule = cryptoModule;

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
