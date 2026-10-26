/**
 * Legacy cryptography module.
 *
 * Platform-agnostic implementation which relies on platform-provided crypto primitives.
 *
 * @internal
 */

import {
  AesMode,
  bytesToHex,
  concatBytes,
  CryptoPrimitives,
  decodeUtf8,
  encodeUtf8,
  hexToBytes,
  toArrayBuffer,
} from './primitives';
import { CryptorConfiguration } from '../../interfaces/crypto-module';
import { LoggerManager } from '../logger-manager';
import { isSensitiveLogKey } from '../../utils';
import { decode, encode } from '../base64_codec';
import { Payload } from '../../types/api';

/**
 * Whether insecure random initialization vector fallback warning has been printed.
 *
 * @internal
 */
let insecureRandomWarningShown = false;

/**
 * Legacy cryptor configuration options.
 *
 * @internal
 */
type CryptoConfiguration = {
  encryptKey?: boolean;
  keyEncoding?: 'hex' | 'utf8' | 'base64' | 'binary';
  keyLength?: 128 | 256;
  mode?: 'ecb' | 'cbc';
};

/**
 * Legacy cryptography module for files and signature.
 *
 * @internal
 */
export class LegacyCrypto {
  /**
   * Crypto initialization vector.
   */
  private iv = '0123456789012345';

  /**
   * List os allowed cipher key encodings.
   */
  private allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];

  /**
   * Allowed cipher key lengths.
   */
  private allowedKeyLengths = [128, 256];

  /**
   * Allowed crypto modes.
   */
  private allowedModes = ['ecb', 'cbc'];

  /**
   * Default cryptor configuration options.
   */
  private readonly defaultOptions: Required<CryptoConfiguration>;

  /**
   * Registered loggers' manager.
   */
  private _logger?: LoggerManager;

  constructor(
    private readonly configuration: CryptorConfiguration,
    private readonly primitives: CryptoPrimitives,
  ) {
    this.logger = configuration.logger;

    this.defaultOptions = {
      encryptKey: true,
      keyEncoding: 'utf8',
      keyLength: 256,
      mode: 'cbc',
    };
  }

  /**
   * Update registered loggers' manager.
   *
   * @param [logger] - Logger, which crypto should use.
   */
  set logger(logger: LoggerManager | undefined) {
    this._logger = logger;

    if (this.logger) {
      this.logger.debug('Crypto', () => ({
        messageType: 'object',
        message: this.configuration as unknown as Record<string, unknown>,
        details: 'Create with configuration:',
        ignoredKeys(key: string, obj: Record<string, unknown>) {
          return typeof obj[key] === 'function' || key === 'logger' || isSensitiveLogKey(key);
        },
      }));
    }
  }

  /**
   * Get loggers' manager.
   *
   * @returns Loggers' manager (if set).
   */
  get logger() {
    return this._logger;
  }

  /**
   * Generate HMAC-SHA256 hash from input data.
   *
   * @param data - Data from which hash should be generated.
   *
   * @returns HMAC-SHA256 hash from provided `data`.
   */
  public HMACSHA256(data: string): string {
    const hash = this.primitives.hmacSha256(encodeUtf8(this.configuration.secretKey ?? ''), encodeUtf8(data));
    return encode(toArrayBuffer(hash));
  }

  /**
   * Generate SHA256 hash from input data.
   *
   * @param data - Data from which hash should be generated.
   *
   * @returns SHA256 hash from provided `data`.
   */
  public SHA256(data: string): string {
    return bytesToHex(this.primitives.sha256(encodeUtf8(data)));
  }

  /**
   * Encrypt provided data.
   *
   * @param data - Source data which should be encrypted.
   * @param [customCipherKey] - Custom cipher key (different from defined on client level).
   * @param [options] - Specific crypto configuration options.
   *
   * @returns Encrypted `data`.
   */
  public encrypt(data: string | Payload, customCipherKey?: string, options?: CryptoConfiguration) {
    if (this.configuration.customEncrypt) {
      if (this.logger)
        this.logger.warn('Crypto', "'customEncrypt' is deprecated. Consult docs for better alternative.");

      return this.configuration.customEncrypt(data);
    }

    return this.pnEncrypt(data as string, customCipherKey, options);
  }

  /**
   * Decrypt provided data.
   *
   * @param data - Encrypted data which should be decrypted.
   * @param [customCipherKey] - Custom cipher key (different from defined on client level).
   * @param [options] - Specific crypto configuration options.
   *
   * @returns Decrypted `data`.
   */
  public decrypt(data: string, customCipherKey?: string, options?: CryptoConfiguration) {
    if (this.configuration.customDecrypt) {
      if (this.logger)
        this.logger.warn('Crypto', "'customDecrypt' is deprecated. Consult docs for better alternative.");

      return this.configuration.customDecrypt(data);
    }

    return this.pnDecrypt(data, customCipherKey, options);
  }

  /**
   * Encrypt provided data.
   *
   * @param data - Source data which should be encrypted.
   * @param [customCipherKey] - Custom cipher key (different from defined on client level).
   * @param [options] - Specific crypto configuration options.
   *
   * @returns Encrypted `data` as string.
   */
  private pnEncrypt(data: string, customCipherKey?: string, options?: CryptoConfiguration): string {
    const decidedCipherKey = customCipherKey ?? this.configuration.cipherKey;
    if (!decidedCipherKey) return data;

    if (this.logger) {
      this.logger.debug('Crypto', () => ({
        messageType: 'object',
        message: { data, ...(options ?? {}) },
        details: 'Encrypt with parameters:',
        ignoredKeys: isSensitiveLogKey,
      }));
    }

    if (typeof data !== 'string') throw new Error('Encryption error: data should be a string');

    options = this.parseOptions(options);
    const mode = this.getMode(options);
    const cipherKey = this.getPaddedKey(decidedCipherKey, options);
    const plaintext = encodeUtf8(data);

    if (this.configuration.useRandomIVs) {
      const iv = this.getRandomIV();
      const payload = this.primitives.aesEncrypt(mode, cipherKey, iv, plaintext);

      return encode(toArrayBuffer(concatBytes(iv, payload)));
    }

    const encrypted = this.primitives.aesEncrypt(mode, cipherKey, this.getIV(options), plaintext);
    const base64Encrypted = encode(toArrayBuffer(encrypted));

    return base64Encrypted || data;
  }

  /**
   * Decrypt provided data.
   *
   * @param data - Encrypted data which should be decrypted.
   * @param [customCipherKey] - Custom cipher key (different from defined on client level).
   * @param [options] - Specific crypto configuration options.
   *
   * @returns Decrypted `data`.
   */
  private pnDecrypt(data: string, customCipherKey?: string, options?: CryptoConfiguration): Payload | null {
    const decidedCipherKey = customCipherKey ?? this.configuration.cipherKey;
    if (!decidedCipherKey) return data;

    if (this.logger) {
      this.logger.debug('Crypto', () => ({
        messageType: 'object',
        message: { data, ...(options ?? {}) },
        details: 'Decrypt with parameters:',
        ignoredKeys: isSensitiveLogKey,
      }));
    }

    options = this.parseOptions(options);
    const mode = this.getMode(options);
    const cipherKey = this.getPaddedKey(decidedCipherKey, options);

    if (this.configuration.useRandomIVs) {
      const ciphertext = new Uint8Array(decode(data));

      const iv = ciphertext.slice(0, 16);
      const payload = ciphertext.slice(16);

      try {
        const plainJSON = decodeUtf8(this.primitives.aesDecrypt(mode, cipherKey, iv, payload));
        return JSON.parse(plainJSON);
      } catch (e) {
        if (this.logger) this.logger.error('Crypto', () => ({ messageType: 'error', message: e }));

        return null;
      }
    } else {
      const iv = this.getIV(options);
      try {
        const ciphertext = new Uint8Array(decode(data));
        const plainJSON = decodeUtf8(this.primitives.aesDecrypt(mode, cipherKey, iv, ciphertext));
        return JSON.parse(plainJSON);
      } catch (e) {
        if (this.logger) this.logger.error('Crypto', () => ({ messageType: 'error', message: e }));

        return null;
      }
    }
  }

  /**
   * Pre-process provided custom crypto configuration.
   *
   * @param incomingOptions - Configuration which should be pre-processed before use.
   *
   * @returns Normalized crypto configuration options.
   */
  private parseOptions(incomingOptions?: CryptoConfiguration): Required<CryptoConfiguration> {
    if (!incomingOptions) return this.defaultOptions;

    // Defaults
    const options = {
      encryptKey: incomingOptions.encryptKey ?? this.defaultOptions.encryptKey,
      keyEncoding: incomingOptions.keyEncoding ?? this.defaultOptions.keyEncoding,
      keyLength: incomingOptions.keyLength ?? this.defaultOptions.keyLength,
      mode: incomingOptions.mode ?? this.defaultOptions.mode,
    };

    // Validation
    if (this.allowedKeyEncodings.indexOf(options.keyEncoding!.toLowerCase()) === -1)
      options.keyEncoding = this.defaultOptions.keyEncoding;
    if (this.allowedKeyLengths.indexOf(options.keyLength!) === -1) options.keyLength = this.defaultOptions.keyLength;
    if (this.allowedModes.indexOf(options.mode!.toLowerCase()) === -1) options.mode = this.defaultOptions.mode;

    return options;
  }

  /**
   * Decode provided cipher key.
   *
   * @param key - Key in `encoding` provided by `options`.
   * @param options - Crypto configuration options with cipher key details.
   *
   * @returns Bytes array with decoded key.
   */
  private decodeKey(key: string, options: CryptoConfiguration): Uint8Array {
    if (options.keyEncoding === 'base64') return new Uint8Array(decode(key));
    if (options.keyEncoding === 'hex') return hexToBytes(key);

    return encodeUtf8(key);
  }

  /**
   * Add padding to the cipher key.
   *
   * @param key - Key which should be padded.
   * @param options - Crypto configuration options with cipher key details.
   *
   * @returns Properly padded cipher key.
   */
  private getPaddedKey(key: string, options: CryptoConfiguration): Uint8Array {
    const decodedKey = this.decodeKey(key, options);

    if (options.encryptKey) return encodeUtf8(bytesToHex(this.primitives.sha256(decodedKey)).slice(0, 32));

    return decodedKey;
  }

  /**
   * Cipher mode.
   *
   * @param options - Crypto configuration with information about cipher mode.
   *
   * @returns Crypto cipher mode.
   */
  private getMode(options: CryptoConfiguration): AesMode {
    return options.mode === 'ecb' ? 'ecb' : 'cbc';
  }

  /**
   * Cipher initialization vector.
   *
   * @param options - Crypto configuration with information about cipher mode.
   *
   * @returns Initialization vector.
   */
  private getIV(options: CryptoConfiguration): Uint8Array | null {
    return options.mode === 'cbc' ? encodeUtf8(this.iv) : null;
  }

  /**
   * Random initialization vector.
   *
   * Falls back to the insecure `Math.random()` source (previous behavior) when the platform doesn't provide
   * `crypto.getRandomValues` (for example, React Native without polyfill).
   *
   * @returns Generated random initialization vector.
   */
  private getRandomIV(): Uint8Array {
    try {
      return this.primitives.randomBytes(16);
    } catch (_) {
      if (!insecureRandomWarningShown && this.logger) {
        insecureRandomWarningShown = true;
        this.logger.warn(
          'Crypto',
          "'crypto.getRandomValues' is unavailable; falling back to insecure Math.random() IV. " +
            "Install 'react-native-get-random-values'.",
        );
      }

      return Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    }
  }
}
