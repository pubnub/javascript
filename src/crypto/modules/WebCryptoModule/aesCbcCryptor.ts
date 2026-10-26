/**
 * AES-CBC cryptor module.
 */

import { cbc } from '@noble/ciphers/aes.js';
import { sha256 } from '@noble/hashes/sha2.js';

import { toArrayBuffer } from '../../../core/components/cryptography/primitives';
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

  /**
   * SHA-256 digest of the cipher key (AES-256 key).
   */
  encryptedKey: Uint8Array;

  constructor({ cipherKey }: { cipherKey: string }) {
    this.cipherKey = cipherKey;
    this.encryptedKey = sha256(AesCbcCryptor.encoder.encode(cipherKey));
  }

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------
  // region Encryption

  encrypt(data: ArrayBuffer | string): EncryptedDataType {
    const stringData = typeof data === 'string' ? data : AesCbcCryptor.decoder.decode(data);
    if (stringData.length === 0) throw new Error('encryption error. empty content');
    const abIv = this.getIv();
    const plaintext = typeof data === 'string' ? AesCbcCryptor.encoder.encode(data) : new Uint8Array(data);

    return { metadata: abIv, data: toArrayBuffer(cbc(this.encryptedKey, abIv).encrypt(plaintext)) };
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

    const iv = new Uint8Array(encryptedData.metadata!);
    const data = new Uint8Array(encryptedData.data);

    return toArrayBuffer(cbc(this.encryptedKey, iv).decrypt(data));
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
   * Serialize cryptor information to string.
   *
   * @returns Serialized cryptor information.
   */
  toString() {
    return 'AesCbcCryptor {}';
  }
}
