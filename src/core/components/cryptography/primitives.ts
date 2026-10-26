/**
 * Platform-agnostic cryptography primitives contract and byte helpers.
 *
 * @internal
 */

/**
 * AES block cipher mode.
 *
 * @internal
 */
export type AesMode = 'cbc' | 'ecb';

/**
 * Platform-provided cryptography primitives.
 *
 * @internal
 */
export type CryptoPrimitives = {
  /**
   * Compute SHA-256 digest.
   *
   * @param data - Data from which digest should be computed.
   *
   * @returns SHA-256 digest bytes.
   */
  sha256(data: Uint8Array): Uint8Array;

  /**
   * Compute HMAC-SHA256.
   *
   * @param key - HMAC key.
   * @param data - Data which should be signed.
   *
   * @returns HMAC-SHA256 bytes.
   */
  hmacSha256(key: Uint8Array, data: Uint8Array): Uint8Array;

  /**
   * Encrypt data with AES (PKCS#7 padding).
   *
   * @param mode - AES block cipher mode.
   * @param key - AES key (16, 24 or 32 bytes).
   * @param iv - Initialization vector (ignored for `ecb`).
   * @param data - Data which should be encrypted.
   *
   * @returns Encrypted data.
   */
  aesEncrypt(mode: AesMode, key: Uint8Array, iv: Uint8Array | null, data: Uint8Array): Uint8Array;

  /**
   * Decrypt data with AES (PKCS#7 padding).
   *
   * @param mode - AES block cipher mode.
   * @param key - AES key (16, 24 or 32 bytes).
   * @param iv - Initialization vector (ignored for `ecb`).
   * @param data - Data which should be decrypted.
   *
   * @returns Decrypted data.
   *
   * @throws Error if data can't be decrypted (for example, invalid padding).
   */
  aesDecrypt(mode: AesMode, key: Uint8Array, iv: Uint8Array | null, data: Uint8Array): Uint8Array;

  /**
   * Generate cryptographically secure random bytes.
   *
   * @param length - Number of bytes which should be generated.
   *
   * @returns Random bytes.
   *
   * @throws Error if platform doesn't provide secure random source.
   */
  randomBytes(length: number): Uint8Array;
};

/**
 * Encode string to UTF-8 bytes.
 *
 * @param string - Source string.
 *
 * @returns UTF-8 bytes.
 *
 * @internal
 */
export const encodeUtf8 = (string: string): Uint8Array => new TextEncoder().encode(string);

/**
 * Decode UTF-8 bytes to string.
 *
 * **Note:** Non-fatal decoder used because React Native `TextDecoder` polyfill doesn't support `fatal` option.
 *
 * @param bytes - UTF-8 bytes.
 *
 * @returns Decoded string.
 *
 * @internal
 */
export const decodeUtf8 = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

/**
 * Convert bytes to lowercase hex string.
 *
 * @param bytes - Source bytes.
 *
 * @returns Hex string.
 *
 * @internal
 */
export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

/**
 * Convert hex string to bytes.
 *
 * @param hex - Hex string.
 *
 * @returns Decoded bytes.
 *
 * @internal
 */
export const hexToBytes = (hex: string): Uint8Array =>
  Uint8Array.from(hex.match(/.{1,2}/g) ?? [], (byte) => parseInt(byte, 16));

/**
 * Concatenate two bytes arrays.
 *
 * @param a - First bytes array.
 * @param b - Second bytes array.
 *
 * @returns Concatenated bytes.
 *
 * @internal
 */
export const concatBytes = (a: Uint8Array, b: Uint8Array): Uint8Array => {
  const result = new Uint8Array(a.length + b.length);
  result.set(a);
  result.set(b, a.length);
  return result;
};

/**
 * Copy bytes into standalone `ArrayBuffer`.
 *
 * **Important:** Primitives may return views into larger buffers (noble subarrays, Node.js `Buffer` pool), so the
 * underlying `.buffer` must never be used directly.
 *
 * @param bytes - Source bytes (possibly a view).
 *
 * @returns `ArrayBuffer` with exactly `bytes` content.
 *
 * @internal
 */
export const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
