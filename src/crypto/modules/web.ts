/* global crypto */
/**
 * Legacy browser cryptography module.
 */

import { PubNubFile, PubNubFileParameters } from '../../file/modules/web';
import { Cryptography } from '../../core/interfaces/cryptography';
import { PubNubFileConstructor } from '../../core/types/file';

function concatArrayBuffer(ab1: ArrayBuffer, ab2: ArrayBuffer) {
  const tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);

  tmp.set(new Uint8Array(ab1), 0);
  tmp.set(new Uint8Array(ab2), ab1.byteLength);

  return tmp.buffer;
}

/**
 * Legacy cryptography implementation for browser-based {@link PubNub} client.
 */
export default class WebCryptography implements Cryptography<ArrayBuffer | string> {
  /**
   * Random initialization vector size.
   */
  static IV_LENGTH = 16;

  /**
   * {@link string|String} to {@link ArrayBuffer} response decoder.
   */
  static encoder = new TextEncoder();

  /**
   *  {@link ArrayBuffer} to {@link string} decoder.
   */
  static decoder = new TextDecoder();

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------

  // region Encryption
  /**
   * Encrypt provided source data using specific encryption {@link key}.
   *
   * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` data.
   * @param input - Source data for encryption.
   *
   * @returns Encrypted data as object or stream (depending on from source data type).
   *
   * @throws Error if unknown data type has been passed.
   */
  public async encrypt(key: string, input: ArrayBuffer | string) {
    if (!(input instanceof ArrayBuffer) && typeof input !== 'string')
      throw new Error('Cannot encrypt this file. In browsers file encryption supports only string or ArrayBuffer');

    const cKey = await this.getKey(key);

    return input instanceof ArrayBuffer ? this.encryptArrayBuffer(cKey, input) : this.encryptString(cKey, input);
  }

  /**
   * Encrypt provided source {@link Buffer} using specific encryption {@link ArrayBuffer}.
   *
   * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link ArrayBuffer}.
   * @param buffer - Source {@link ArrayBuffer} for encryption.
   *
   * @returns Encrypted data as {@link ArrayBuffer} object.
   */
  private async encryptArrayBuffer(key: CryptoKey, buffer: ArrayBuffer) {
    const abIv = crypto.getRandomValues(new Uint8Array(16));

    return concatArrayBuffer(abIv.buffer, await crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, buffer));
  }

  /**
   * Encrypt provided source {@link string} using specific encryption {@link key}.
   *
   * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link string}.
   * @param text - Source {@link string} for encryption.
   *
   * @returns Encrypted data as byte {@link string}.
   */
  private async encryptString(key: CryptoKey, text: string) {
    const abIv = crypto.getRandomValues(new Uint8Array(16));

    const abPlaintext = WebCryptography.encoder.encode(text).buffer;
    const abPayload = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, abPlaintext);

    const ciphertext = concatArrayBuffer(abIv.buffer, abPayload);

    return WebCryptography.decoder.decode(ciphertext);
  }

  /**
   * Encrypt provided {@link PubNub} File object using specific encryption {@link key}.
   *
   * @param key - Key for {@link PubNub} File object encryption. <br/>**Note:** Same key should be
   * used to `decrypt` data.
   * @param file - Source {@link PubNub} File object for encryption.
   * @param File - Class constructor for {@link PubNub} File object.
   *
   * @returns Encrypted data as {@link PubNub} File object.
   *
   * @throws Error if file is empty or contains unsupported data type.
   */
  public async encryptFile(
    key: string,
    file: PubNubFile,
    File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
  ) {
    if ((file.contentLength ?? 0) <= 0) throw new Error('encryption error. empty content');
    const bKey = await this.getKey(key);
    const abPlaindata = await file.toArrayBuffer();
    const abCipherdata = await this.encryptArrayBuffer(bKey, abPlaindata);

    return File.create({
      name: file.name,
      mimeType: file.mimeType ?? 'application/octet-stream',
      data: abCipherdata,
    });
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------

  // region Decryption
  /**
   * Decrypt provided encrypted data using specific decryption {@link key}.
   *
   * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` data.
   * @param input - Encrypted data for decryption.
   *
   * @returns Decrypted data as object or stream (depending on from encrypted data type).
   *
   * @throws Error if unknown data type has been passed.
   */
  public async decrypt(key: string, input: ArrayBuffer | string) {
    if (!(input instanceof ArrayBuffer) && typeof input !== 'string')
      throw new Error('Cannot decrypt this file. In browsers file decryption supports only string or ArrayBuffer');

    const cKey = await this.getKey(key);

    return input instanceof ArrayBuffer ? this.decryptArrayBuffer(cKey, input) : this.decryptString(cKey, input);
  }

  /**
   * Decrypt provided encrypted {@link ArrayBuffer} using specific decryption {@link key}.
   *
   * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link ArrayBuffer}.
   * @param buffer - Encrypted {@link ArrayBuffer} for decryption.
   *
   * @returns Decrypted data as {@link ArrayBuffer} object.
   */
  private async decryptArrayBuffer(key: CryptoKey, buffer: ArrayBuffer) {
    const abIv = buffer.slice(0, 16);
    if (buffer.slice(WebCryptography.IV_LENGTH).byteLength <= 0) throw new Error('decryption error: empty content');

    return await crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, buffer.slice(WebCryptography.IV_LENGTH));
  }

  /**
   * Decrypt provided encrypted {@link string} using specific decryption {@link key}.
   *
   * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link string}.
   * @param text - Encrypted {@link string} for decryption.
   *
   * @returns Decrypted data as byte {@link string}.
   */
  private async decryptString(key: CryptoKey, text: string) {
    const abCiphertext = WebCryptography.encoder.encode(text).buffer;
    const abIv = abCiphertext.slice(0, 16);
    const abPayload = abCiphertext.slice(16);
    const abPlaintext = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, abPayload);

    return WebCryptography.decoder.decode(abPlaintext);
  }

  /**
   * Decrypt provided {@link PubNub} File object using specific decryption {@link key}.
   *
   * @param key - Key for {@link PubNub} File object decryption. <br/>**Note:** Should be the same
   * as used to `encrypt` data.
   * @param file - Encrypted {@link PubNub} File object for decryption.
   * @param File - Class constructor for {@link PubNub} File object.
   *
   * @returns Decrypted data as {@link PubNub} File object.
   *
   * @throws Error if file is empty or contains unsupported data type.
   */
  public async decryptFile(
    key: string,
    file: PubNubFile,
    File: PubNubFileConstructor<PubNubFile, PubNubFileParameters>,
  ) {
    const bKey = await this.getKey(key);

    const abCipherdata = await file.toArrayBuffer();
    const abPlaindata = await this.decryptArrayBuffer(bKey, abCipherdata);

    return File.create({
      name: file.name,
      mimeType: file.mimeType,
      data: abPlaindata,
    });
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------

  // region Helpers
  /**
   * Convert cipher key to the {@link Buffer}.
   *
   * @param key - String cipher key.
   *
   * @returns SHA256 HEX encoded cipher key {@link CryptoKey}.
   */
  private async getKey(key: string) {
    const digest = await crypto.subtle.digest('SHA-256', WebCryptography.encoder.encode(key));
    const hashHex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const abKey = WebCryptography.encoder.encode(hashHex.slice(0, 32)).buffer;

    return crypto.subtle.importKey('raw', abKey, 'AES-CBC', true, ['encrypt', 'decrypt']);
  }
  // endregion
}
