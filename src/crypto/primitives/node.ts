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
