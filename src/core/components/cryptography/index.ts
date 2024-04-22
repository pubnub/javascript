/**
 * Legacy cryptography module.
 */

import { CryptorConfiguration } from '../../interfaces/crypto-module';
import { Payload } from '../../types/api';
import { decode } from '../base64_codec';
import CryptoJS from './hmac-sha256';

/**
 * Convert bytes array to words array.
 *
 * @param b - Bytes array (buffer) which should be converted.
 *
 * @returns Word sized array.
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
function bufferToWordArray(b: string | any[] | Uint8ClampedArray) {
  const wa: number[] = [];
  let i;
  for (i = 0; i < b.length; i += 1) {
    wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
  }

  // @ts-expect-error Bundled library without types.
  return CryptoJS.lib.WordArray.create(wa, b.length);
}

/**
 * Legacy cryptor configuration options.
 */
type CryptoConfiguration = {
  encryptKey?: boolean;
  keyEncoding?: 'hex' | 'utf8' | 'base64' | 'binary';
  keyLength?: 128 | 256;
  mode?: 'ecb' | 'cbc';
};

export default class {
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

  constructor(private readonly configuration: CryptorConfiguration) {
    this.defaultOptions = {
      encryptKey: true,
      keyEncoding: 'utf8',
      keyLength: 256,
      mode: 'cbc',
    };
  }

  /**
   * Generate HMAC-SHA256 hash from input data.
   *
   * @param data - Data from which hash should be generated.
   *
   * @returns HMAC-SHA256 hash from provided `data`.
   */
  public HMACSHA256(data: string): string {
    // @ts-expect-error Bundled library without types.
    const hash = CryptoJS.HmacSHA256(data, this.configuration.secretKey);
    // @ts-expect-error Bundled library without types.
    return hash.toString(CryptoJS.enc.Base64);
  }

  /**
   * Generate SHA256 hash from input data.
   *
   * @param data - Data from which hash should be generated.
   *
   * @returns SHA256 hash from provided `data`.
   */
  public SHA256(data: string): string {
    // @ts-expect-error Bundled library without types.
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
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
    if (this.configuration.customEncrypt) return this.configuration.customEncrypt(data);

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
    if (this.configuration.customDecrypt) return this.configuration.customDecrypt(data);

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

    options = this.parseOptions(options);
    const mode = this.getMode(options);
    const cipherKey = this.getPaddedKey(decidedCipherKey, options);

    if (this.configuration.useRandomIVs) {
      const waIv = this.getRandomIV();
      // @ts-expect-error Bundled library without types.
      const waPayload = CryptoJS.AES.encrypt(data, cipherKey, { iv: waIv, mode }).ciphertext;

      // @ts-expect-error Bundled library without types.
      return waIv.clone().concat(waPayload.clone()).toString(CryptoJS.enc.Base64);
    }

    const iv = this.getIV(options);
    // @ts-expect-error Bundled library without types.
    const encryptedHexArray = CryptoJS.AES.encrypt(data, cipherKey, { iv, mode }).ciphertext;
    // @ts-expect-error Bundled library without types.
    const base64Encrypted = encryptedHexArray.toString(CryptoJS.enc.Base64);

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

    options = this.parseOptions(options);
    const mode = this.getMode(options);
    const cipherKey = this.getPaddedKey(decidedCipherKey, options);

    if (this.configuration.useRandomIVs) {
      const ciphertext = new Uint8ClampedArray(decode(data));

      const iv = bufferToWordArray(ciphertext.slice(0, 16));
      const payload = bufferToWordArray(ciphertext.slice(16));

      try {
        // @ts-expect-error Bundled library without types.
        const plainJSON = CryptoJS.AES.decrypt({ ciphertext: payload }, cipherKey, { iv, mode }).toString(
          // @ts-expect-error Bundled library without types.
          CryptoJS.enc.Utf8,
        );
        return JSON.parse(plainJSON);
      } catch (e) {
        return null;
      }
    } else {
      const iv = this.getIV(options);
      try {
        // @ts-expect-error Bundled library without types.
        const ciphertext = CryptoJS.enc.Base64.parse(data);
        // @ts-expect-error Bundled library without types.
        const plainJSON = CryptoJS.AES.decrypt({ ciphertext }, cipherKey, { iv, mode }).toString(CryptoJS.enc.Utf8);
        return JSON.parse(plainJSON);
      } catch (e) {
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
   * @returns Array buffer with decoded key.
   */
  private decodeKey(key: string, options: CryptoConfiguration) {
    // @ts-expect-error Bundled library without types.
    if (options.keyEncoding === 'base64') return CryptoJS.enc.Base64.parse(key);
    // @ts-expect-error Bundled library without types.
    if (options.keyEncoding === 'hex') return CryptoJS.enc.Hex.parse(key);

    return key;
  }

  /**
   * Add padding to the cipher key.
   *
   * @param key - Key which should be padded.
   * @param options - Crypto configuration options with cipher key details.
   *
   * @returns Properly padded cipher key.
   */
  private getPaddedKey(key: string, options: CryptoConfiguration) {
    key = this.decodeKey(key, options);

    // @ts-expect-error Bundled library without types.
    if (options.encryptKey) return CryptoJS.enc.Utf8.parse(this.SHA256(key).slice(0, 32));

    return key;
  }

  /**
   * Cipher mode.
   *
   * @param options - Crypto configuration with information about cipher mode.
   *
   * @returns Crypto cipher mode.
   */
  private getMode(options: CryptoConfiguration) {
    // @ts-expect-error Bundled library without types.
    if (options.mode === 'ecb') return CryptoJS.mode.ECB;

    // @ts-expect-error Bundled library without types.
    return CryptoJS.mode.CBC;
  }

  /**
   * Cipher initialization vector.
   *
   * @param options - Crypto configuration with information about cipher mode.
   *
   * @returns Initialization vector.
   */
  private getIV(options: CryptoConfiguration) {
    // @ts-expect-error Bundled library without types.
    return options.mode === 'cbc' ? CryptoJS.enc.Utf8.parse(this.iv) : null;
  }

  /**
   * Random initialization vector.
   *
   * @returns Generated random initialization vector.
   */
  private getRandomIV() {
    // @ts-expect-error Bundled library without types.
    return CryptoJS.lib.WordArray.random(16);
  }
}
