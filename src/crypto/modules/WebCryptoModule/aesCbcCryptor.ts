/**
 * AES-CBC cryptor module.
 */

import cryptoJS from '../../../core/components/cryptography/hmac-sha256';
import { decode } from '../../../core/components/base64_codec';
import { ICryptor, EncryptedDataType } from './ICryptor';

/**
 * AES-CBC cryptor.
 *
 * AES-CBC cryptor with enhanced cipher strength.
 */
export default class AesCbcCryptor implements ICryptor {
  /**
   * Cryptor block size.
   */
  static BLOCK_SIZE = 16;

  /**
   * {@link string|String} to {@link ArrayBuffer} response decoder.
   */
  static encoder = new TextEncoder();

  /**
   *  {@link ArrayBuffer} to {@link string} decoder.
   */
  static decoder = new TextDecoder();

  /**
   * Data encryption / decryption cipher key.
   */
  cipherKey: string;

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  encryptedKey: any;
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  CryptoJS: any;

  constructor({ cipherKey }: { cipherKey: string }) {
    this.cipherKey = cipherKey;
    this.CryptoJS = cryptoJS;
    this.encryptedKey = this.CryptoJS.SHA256(cipherKey);
  }

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------
  // region Encryption

  encrypt(data: ArrayBuffer | string): EncryptedDataType {
    const stringData = typeof data === 'string' ? data : AesCbcCryptor.decoder.decode(data);
    if (stringData.length === 0) throw new Error('encryption error. empty content');
    const abIv = this.getIv();

    return {
      metadata: abIv,
      data: decode(
        this.CryptoJS.AES.encrypt(data, this.encryptedKey, {
          iv: this.bufferToWordArray(abIv),
          mode: this.CryptoJS.mode.CBC,
        }).ciphertext.toString(this.CryptoJS.enc.Base64),
      ),
    };
  }

  async encryptFileData(data: ArrayBuffer): Promise<EncryptedDataType> {
    const key = await this.getKey();
    const iv = this.getIv();
    return {
      data: await crypto.subtle.encrypt({ name: this.algo, iv: iv }, key, data),
      metadata: iv,
    };
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------
  // region Decryption

  decrypt(encryptedData: EncryptedDataType) {
    if (typeof encryptedData.data === 'string')
      throw new Error('Decryption error: data for decryption should be ArrayBuffed.');

    const iv = this.bufferToWordArray(new Uint8ClampedArray(encryptedData.metadata!));
    const data = this.bufferToWordArray(new Uint8ClampedArray(encryptedData.data));

    return AesCbcCryptor.encoder.encode(
      this.CryptoJS.AES.decrypt({ ciphertext: data }, this.encryptedKey, {
        iv,
        mode: this.CryptoJS.mode.CBC,
      }).toString(this.CryptoJS.enc.Utf8),
    ).buffer;
  }

  async decryptFileData(encryptedData: EncryptedDataType): Promise<ArrayBuffer> {
    if (typeof encryptedData.data === 'string')
      throw new Error('Decryption error: data for decryption should be ArrayBuffed.');

    const key = await this.getKey();
    return crypto.subtle.decrypt({ name: this.algo, iv: encryptedData.metadata! }, key, encryptedData.data);
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  get identifier() {
    return 'ACRH';
  }

  /**
   * Cryptor algorithm.
   *
   * @returns Cryptor module algorithm.
   */
  private get algo() {
    return 'AES-CBC';
  }

  /**
   * Generate random initialization vector.
   *
   * @returns Random initialization vector.
   */

  private getIv() {
    return crypto.getRandomValues(new Uint8Array(AesCbcCryptor.BLOCK_SIZE));
  }

  /**
   * Convert cipher key to the {@link Buffer}.
   *
   * @returns SHA256 encoded cipher key {@link Buffer}.
   */
  private async getKey() {
    const bKey = AesCbcCryptor.encoder.encode(this.cipherKey);
    const abHash = await crypto.subtle.digest('SHA-256', bKey.buffer);
    return crypto.subtle.importKey('raw', abHash, this.algo, true, ['encrypt', 'decrypt']);
  }

  /**
   * Convert bytes array to words array.
   *
   * @param b - Bytes array (buffer) which should be converted.
   *
   * @returns Word sized array.
   */
  private bufferToWordArray(b: string | any[] | Uint8Array | Uint8ClampedArray) {
    const wa: number[] = [];
    let i;

    for (i = 0; i < b.length; i += 1) {
      wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
    }

    return this.CryptoJS.lib.WordArray.create(wa, b.length);
  }
}
