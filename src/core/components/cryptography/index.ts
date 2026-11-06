/**
 * Legacy cryptography module.
 *
 * @internal
 */

import { CryptoPrimitives } from '../../interfaces/crypto-primitives';
import { CryptorConfiguration } from '../../interfaces/crypto-module';
import { LoggerManager } from '../logger-manager';
import { isSensitiveLogKey } from '../../utils';
import { Payload } from '../../types/api';
import { bytesToHex, decodeUtf8Strict, toArrayBuffer } from './bytes';
import { decode, encode } from '../base64_codec';

/**
 * Legacy cryptography module for data encryption / decryption.
 *
 * Wire format (compatible with all PubNub SDKs):
 * - key: first 32 characters of HEX encoded SHA-256 digest of the cipher key, used as UTF-8 bytes (AES-256),
 * - cipher: AES-CBC with PKCS#7 padding,
 * - random IV: `base64(iv + ciphertext)`, static IV (`0123456789012345`): `base64(ciphertext)`.
 *
 * @internal
 */
export default class LegacyCrypto {
  /**
   * `string` to {@link Uint8Array} encoder.
   */
  private static readonly encoder = new TextEncoder();

  /**
   * Static crypto initialization vector (used when random IVs are disabled).
   */
  private static readonly staticIV = new TextEncoder().encode('0123456789012345');

  /**
   * Initialization vector length.
   */
  private static readonly IV_LENGTH = 16;

  /**
   * Derived key for configured cipher key (keys for per-call custom cipher keys aren't cached).
   */
  private configuredKey?: Promise<Uint8Array>;

  /**
   * Registered loggers' manager.
   */
  private _logger?: LoggerManager;

  constructor(
    private readonly configuration: CryptorConfiguration,
    private readonly primitives: CryptoPrimitives,
  ) {
    this.logger = configuration.logger;
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
   * Encrypt provided data.
   *
   * @param data - Source data which should be encrypted.
   * @param [customCipherKey] - Custom cipher key (different from defined on client level).
   *
   * @returns Encrypted `data`.
   */
  public async encrypt(data: string | Payload, customCipherKey?: string): Promise<string> {
    if (this.configuration.customEncrypt) {
      if (this.logger)
        this.logger.warn('Crypto', "'customEncrypt' is deprecated. Consult docs for better alternative.");

      return this.configuration.customEncrypt(data);
    }

    return this.pnEncrypt(typeof data === 'string' ? data : JSON.stringify(data), customCipherKey);
  }

  /**
   * Decrypt provided data.
   *
   * @param data - Encrypted data which should be decrypted.
   * @param [customCipherKey] - Custom cipher key (different from defined on client level).
   *
   * @returns Decrypted `data`.
   */
  public async decrypt(data: string, customCipherKey?: string): Promise<Payload | null> {
    if (this.configuration.customDecrypt) {
      if (this.logger)
        this.logger.warn('Crypto', "'customDecrypt' is deprecated. Consult docs for better alternative.");

      return this.configuration.customDecrypt(data);
    }

    return this.pnDecrypt(data, customCipherKey);
  }

  /**
   * Encrypt provided data.
   *
   * @param data - Source data which should be encrypted.
   * @param [customCipherKey] - Custom cipher key (different from defined on client level).
   *
   * @returns Encrypted `data` as string.
   */
  private async pnEncrypt(data: string, customCipherKey?: string): Promise<string> {
    const decidedCipherKey = customCipherKey ?? this.configuration.cipherKey;
    if (!decidedCipherKey) return data;

    if (this.logger) {
      this.logger.debug('Crypto', () => ({
        messageType: 'object',
        message: { data },
        details: 'Encrypt with parameters:',
        ignoredKeys: isSensitiveLogKey,
      }));
    }

    const key = await this.getKey(decidedCipherKey);
    const plaintext = LegacyCrypto.encoder.encode(data);

    if (this.configuration.useRandomIVs) {
      const iv = this.primitives.randomBytes(LegacyCrypto.IV_LENGTH);
      const ciphertext = await this.primitives.aesCbcEncrypt(key, iv, plaintext);

      return encode(this.concat(iv, ciphertext));
    }

    const ciphertext = await this.primitives.aesCbcEncrypt(key, LegacyCrypto.staticIV, plaintext);

    return encode(toArrayBuffer(ciphertext)) || data;
  }

  /**
   * Decrypt provided data.
   *
   * @param data - Encrypted data which should be decrypted.
   * @param [customCipherKey] - Custom cipher key (different from defined on client level).
   *
   * @returns Decrypted `data` or `null` if it can't be decrypted.
   */
  private async pnDecrypt(data: string, customCipherKey?: string): Promise<Payload | null> {
    const decidedCipherKey = customCipherKey ?? this.configuration.cipherKey;
    if (!decidedCipherKey) return data;

    if (this.logger) {
      this.logger.debug('Crypto', () => ({
        messageType: 'object',
        message: { data },
        details: 'Decrypt with parameters:',
        ignoredKeys: isSensitiveLogKey,
      }));
    }

    try {
      const key = await this.getKey(decidedCipherKey);
      const encrypted = new Uint8Array(decode(data));
      let iv = LegacyCrypto.staticIV;
      let ciphertext = encrypted;

      if (this.configuration.useRandomIVs) {
        iv = encrypted.slice(0, LegacyCrypto.IV_LENGTH);
        ciphertext = encrypted.slice(LegacyCrypto.IV_LENGTH);
      }

      const plaintext = await this.primitives.aesCbcDecrypt(key, iv, ciphertext);

      return JSON.parse(decodeUtf8Strict(plaintext));
    } catch (e) {
      if (this.logger) this.logger.error('Crypto', () => ({ messageType: 'error', message: e }));

      return null;
    }
  }

  /**
   * Derive AES-256 key from the cipher key (cached for configured cipher key).
   *
   * @param cipherKey - User-provided cipher key.
   *
   * @returns First 32 characters of HEX encoded SHA-256 digest as UTF-8 bytes.
   */
  private getKey(cipherKey: string): Promise<Uint8Array> {
    if (cipherKey !== this.configuration.cipherKey) return this.deriveKey(cipherKey);

    if (!this.configuredKey) {
      this.configuredKey = this.deriveKey(cipherKey);
      this.configuredKey.catch(() => (this.configuredKey = undefined));
    }

    return this.configuredKey;
  }

  /**
   * Derive AES-256 key from the cipher key.
   *
   * @param cipherKey - User-provided cipher key.
   *
   * @returns First 32 characters of HEX encoded SHA-256 digest as UTF-8 bytes.
   */
  private async deriveKey(cipherKey: string): Promise<Uint8Array> {
    const digest = await this.primitives.sha256(LegacyCrypto.encoder.encode(cipherKey));

    return LegacyCrypto.encoder.encode(bytesToHex(digest).slice(0, 32));
  }

  /**
   * Join two byte arrays into {@link ArrayBuffer}.
   */
  private concat(a: Uint8Array, b: Uint8Array): ArrayBuffer {
    const result = new Uint8Array(a.byteLength + b.byteLength);
    result.set(a, 0);
    result.set(b, a.byteLength);

    return result.buffer;
  }
}
