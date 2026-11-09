/**
 * AES-GCM cryptor module.
 */

import { toArrayBuffer } from '../../../core/components/cryptography/bytes';
import WebCryptoPrimitives from '../../primitives/web';
import { ICryptor, EncryptedDataType } from './ICryptor';

/**
 * AES-GCM cryptor.
 *
 * Decrypt-only AES-256-GCM cryptor for payloads produced by other PubNub SDKs. Cryptor metadata stored in the
 * header is `nonce (12 bytes)` and the authentication tag (16 bytes) is appended to the ciphertext:
 * `ciphertext || authentication tag`.
 *
 * **Note:** Encryption isn't supported and cryptor can't be used as crypto module default cryptor.
 */
export default class AesGcmCryptor implements ICryptor {
  /**
   * Cryptor unique identifier.
   */
  static IDENTIFIER = 'ACGM';

  /**
   * Nonce length.
   */
  static NONCE_LENGTH = 12;

  /**
   * Authentication tag length.
   */
  static TAG_LENGTH = 16;

  /**
   * Cryptor metadata length (nonce only).
   */
  static METADATA_LENGTH = AesGcmCryptor.NONCE_LENGTH;

  /**
   * Generic decryption error message (doesn't reveal which part of the payload failed authentication).
   */
  static DECRYPTION_ERROR = 'Decryption error: unable to decrypt data';

  /**
   * Unsupported encryption error message.
   */
  static ENCRYPTION_ERROR = 'Encryption error: AES-GCM cryptor (ACGM) supports decryption only.';

  /**
   * {@link string|String} to {@link ArrayBuffer} response decoder.
   */
  static encoder = new TextEncoder();

  /**
   * Native crypto primitives.
   *
   * @internal
   */
  private static primitives = new WebCryptoPrimitives();

  /**
   * Data decryption cipher key.
   */
  cipherKey: string;

  /**
   * Raw decryption key (SHA-256 digest of the cipher key).
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

  encrypt(_data: ArrayBuffer | string): EncryptedDataType {
    throw new Error(AesGcmCryptor.ENCRYPTION_ERROR);
  }

  async encryptFileData(_data: ArrayBuffer): Promise<EncryptedDataType> {
    throw new Error(AesGcmCryptor.ENCRYPTION_ERROR);
  }
  // endregion

  // --------------------------------------------------------
  // --------------------- Decryption -----------------------
  // --------------------------------------------------------
  // region Decryption

  async decrypt(encryptedData: EncryptedDataType): Promise<ArrayBuffer> {
    return this.decryptFileData(encryptedData);
  }

  async decryptFileData(encryptedData: EncryptedDataType): Promise<ArrayBuffer> {
    if (typeof encryptedData.data === 'string')
      throw new Error('Decryption error: data for decryption should be ArrayBuffed.');
    if (!encryptedData.metadata || encryptedData.metadata.byteLength !== AesGcmCryptor.METADATA_LENGTH)
      throw new Error('Decryption error: invalid metadata');
    if (encryptedData.data.byteLength <= AesGcmCryptor.TAG_LENGTH) throw new Error('Decryption error: empty content');

    try {
      const decrypted = await AesGcmCryptor.primitives.aesGcmDecrypt(
        await this.getKey(),
        new Uint8Array(encryptedData.metadata),
        new Uint8Array(encryptedData.data),
      );

      return toArrayBuffer(decrypted);
    } catch (_error) {
      // Native error intentionally not exposed: wrong key and modified payload should be indistinguishable.
      throw new Error(AesGcmCryptor.DECRYPTION_ERROR);
    }
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  get identifier() {
    return AesGcmCryptor.IDENTIFIER;
  }

  /**
   * Compute raw decryption key (cached).
   *
   * @returns SHA-256 digest of the cipher key.
   *
   * @internal
   */
  private getKey() {
    if (!this.key) {
      this.key = AesGcmCryptor.primitives.sha256(AesGcmCryptor.encoder.encode(this.cipherKey));
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
    return 'AesGcmCryptor {}';
  }
}
