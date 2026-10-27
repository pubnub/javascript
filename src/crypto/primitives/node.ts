/**
 * Node.js cryptographic primitives backed by `node:crypto`.
 *
 * @internal
 */

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'crypto';

import { CryptoPrimitives } from '../../core/interfaces/crypto-primitives';

/**
 * Compute HMAC-SHA256 (used for request signature).
 *
 * @param data - Data for which HMAC should be computed.
 * @param secretKey - HMAC secret key.
 *
 * @returns Base64 encoded HMAC-SHA256 digest.
 *
 * @internal
 */
export const hmacSha256 = (data: string, secretKey: string): string =>
  createHmac('sha256', secretKey).update(data, 'utf8').digest('base64');

/**
 * Node.js cryptographic primitives.
 *
 * @internal
 */
export default class NodeCryptoPrimitives implements CryptoPrimitives {
  async sha256(data: Uint8Array): Promise<Uint8Array> {
    return new Uint8Array(createHash('sha256').update(data).digest());
  }

  async aesCbcEncrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const cipher = createCipheriv(this.algorithm(key), key, iv);
    return new Uint8Array(Buffer.concat([cipher.update(data), cipher.final()]));
  }

  async aesCbcDecrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const decipher = createDecipheriv(this.algorithm(key), key, iv);
    return new Uint8Array(Buffer.concat([decipher.update(data), decipher.final()]));
  }

  /**
   * Decrypt and authenticate data using AES-256-GCM (128-bit tag, no additional authenticated data).
   *
   * Used only by the decrypt-only `ACGM` cryptor (Web and Node.js). Intentionally not part of
   * {@link CryptoPrimitives}: React Native supports only the legacy cryptor.
   *
   * @param key - 32 bytes long raw key.
   * @param nonce - 12 bytes long nonce.
   * @param data - Data which should be decrypted (without authentication tag).
   * @param tag - 16 bytes long authentication tag.
   *
   * @returns Decrypted data (returned only after the authentication tag has been verified).
   *
   * @throws Error if data can't be authenticated (for example: wrong key or modified nonce, tag or data).
   */
  async aesGcmDecrypt(key: Uint8Array, nonce: Uint8Array, data: Uint8Array, tag: Uint8Array): Promise<Uint8Array> {
    const decipher = createDecipheriv('aes-256-gcm', key, nonce, { authTagLength: 16 });
    decipher.setAuthTag(tag);

    // `update` returns not yet authenticated data: release it only after `final` verified the tag.
    const decrypted = decipher.update(data);
    try {
      return new Uint8Array(Buffer.concat([decrypted, decipher.final()]));
    } catch (error) {
      decrypted.fill(0);
      throw error;
    }
  }

  randomBytes(length: number): Uint8Array {
    return new Uint8Array(randomBytes(length));
  }

  /**
   * AES-CBC algorithm name for provided key size.
   *
   * @param key - Raw key bytes.
   *
   * @returns `node:crypto` cipher name.
   */
  private algorithm(key: Uint8Array) {
    return `aes-${key.byteLength * 8}-cbc`;
  }
}
