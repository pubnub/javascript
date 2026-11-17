/**
 * AES-CBC cryptor module.
 */

import { toArrayBuffer } from '../../../core/components/cryptography/bytes';
import WebCryptoPrimitives from '../../primitives/web';
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
   * Native crypto primitives.
   *
   * @internal
   */
  private static primitives = new WebCryptoPrimitives();

  /**
   * Data encryption / decryption cipher key.
   */
  cipherKey: string;

  /**
   * Raw encryption key (SHA-256 digest of the cipher key).
   *
   * @internal
   */
  private key?: Promise<Uint8Array>;

  constructor({ cipherKey }: { cipherKey: string }) {
    this.cipherKey = cipherKey;
  }

  // --------------------------------------------------------
  // --------------------- Encryption -----------------------
  // --------------------------------------------------------
  // region Encryption

  async encrypt(data: ArrayBuffer | string): Promise<EncryptedDataType> {
    const plaintext = typeof data === 'string' ? AesCbcCryptor.encoder.encode(data) : new Uint8Array(data);
    if (plaintext.byteLength === 0) throw new Error('encryption error. empty content');

    return this.encryptFileData(plaintext);
  }

  async encryptFileData(data: ArrayBuffer | Uint8Array): Promise<EncryptedDataType> {
    const iv = this.getIv();
    const encrypted = await AesCbcCryptor.primitives.aesCbcEncrypt(
      await this.getKey(),
      iv,
      data instanceof Uint8Array ? data : new Uint8Array(data),
    );

    return { data: toArrayBuffer(encrypted), metadata: iv.buffer };
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------
  // region Decryption

  async decrypt(encryptedData: EncryptedDataType): Promise<ArrayBuffer> {
    try {
      return await this.decryptFileData(encryptedData);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Decryption error')) throw error;
      throw new Error(`Decryption error: ${error instanceof Error ? error.message : 'unable to decrypt data'}`);
    }
  }

  async decryptFileData(encryptedData: EncryptedDataType): Promise<ArrayBuffer> {
    if (typeof encryptedData.data === 'string')
      throw new Error('Decryption error: data for decryption should be ArrayBuffed.');

    const decrypted = await AesCbcCryptor.primitives.aesCbcDecrypt(
      await this.getKey(),
      new Uint8Array(encryptedData.metadata!),
      new Uint8Array(encryptedData.data),
    );

    return toArrayBuffer(decrypted);
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
   * Generate random initialization vector.
   *
   * @returns Random initialization vector.
   *
   * @internal
   */
  private getIv() {
    return AesCbcCryptor.primitives.randomBytes(AesCbcCryptor.BLOCK_SIZE);
  }

  /**
   * Compute raw encryption key (cached).
   *
   * @returns SHA-256 digest of the cipher key.
   *
   * @internal
   */
  private getKey() {
    if (!this.key) {
      this.key = AesCbcCryptor.primitives.sha256(AesCbcCryptor.encoder.encode(this.cipherKey));
      this.key.catch(() => (this.key = undefined));
    }

    return this.key;
  }
  // endregion

  /**
   * Serialize cryptor information to string.
   *
   * @returns Serialized cryptor information.
   */
  toString() {
    return 'AesCbcCryptor {}';
  }
}
