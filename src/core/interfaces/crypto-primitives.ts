/**
 * Platform-specific cryptographic primitives.
 *
 * Core SDK code doesn't depend on any concrete crypto implementation. Each platform entry point injects
 * primitives backed by the native crypto available on it (`crypto.subtle`, `node:crypto` or `@noble/*`).
 */

/**
 * Value which can be returned synchronously or asynchronously.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Cryptographic primitives required by the SDK cryptors.
 *
 * @internal
 */
export interface CryptoPrimitives {
  /**
   * Compute SHA-256 digest.
   *
   * @param data - Data for which digest should be computed.
   *
   * @returns 32 bytes digest.
   */
  sha256(data: Uint8Array): Promise<Uint8Array>;

  /**
   * Encrypt data using AES-CBC with PKCS#7 padding.
   *
   * @param key - 16, 24 or 32 bytes long raw key.
   * @param iv - 16 bytes long initialization vector.
   * @param data - Data which should be encrypted.
   *
   * @returns Encrypted data.
   */
  aesCbcEncrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array>;

  /**
   * Decrypt data using AES-CBC with PKCS#7 padding.
   *
   * @param key - 16, 24 or 32 bytes long raw key.
   * @param iv - 16 bytes long initialization vector.
   * @param data - Data which should be decrypted.
   *
   * @returns Decrypted data.
   *
   * @throws Error if data can't be decrypted (for example: wrong key or malformed padding).
   */
  aesCbcDecrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array>;

  /**
   * Generate cryptographically secure random bytes.
   *
   * @param length - Number of bytes which should be generated.
   *
   * @returns Random bytes.
   */
  randomBytes(length: number): Uint8Array;
}
