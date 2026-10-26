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
   * Decrypt data with AES.
   *
   * Padding removed leniently (CryptoJS-compatible, see {@link unpadLegacy}).
   *
   * @param mode - AES block cipher mode.
   * @param key - AES key (16, 24 or 32 bytes).
   * @param iv - Initialization vector (ignored for `ecb`).
   * @param data - Data which should be decrypted.
   *
   * @returns Decrypted data with padding removed.
   *
   * @throws Error if data can't be decrypted (for example, data length isn't a multiple of the block size).
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
 * **Note:** Strings with lone surrogates are rejected (as CryptoJS `Utf8.parse` did through `encodeURIComponent`)
 * instead of being silently replaced with `U+FFFD` by `TextEncoder`.
 *
 * @param string - Source string.
 *
 * @returns UTF-8 bytes.
 *
 * @throws URIError if `string` contains lone surrogates.
 *
 * @internal
 */
export const encodeUtf8 = (string: string): Uint8Array => {
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = i + 1 < string.length ? string.charCodeAt(i + 1) : 0;
      if (next < 0xdc00 || next > 0xdfff) throw new URIError('URI malformed');
      i++;
    } else if (code >= 0xdc00 && code <= 0xdfff) throw new URIError('URI malformed');
  }

  return new TextEncoder().encode(string);
};

/**
 * Check whether bytes are well-formed UTF-8 (Unicode Table 3-7).
 *
 * Rejects the same sequences as `decodeURIComponent` (used by CryptoJS `Utf8.stringify`): invalid lead and
 * continuation bytes, truncated, overlong, surrogate (`U+D800`–`U+DFFF`) and out of range (> `U+10FFFF`) sequences.
 *
 * **Note:** Bytes are validated (rather than decoded `U+FFFD` characters) because `U+FFFD` can be legitimate input.
 *
 * @param bytes - Bytes which should be validated.
 *
 * @returns `true` if `bytes` are well-formed UTF-8.
 *
 * @internal
 */
export const isWellFormedUtf8 = (bytes: Uint8Array): boolean => {
  const length = bytes.length;
  let i = 0;

  while (i < length) {
    const lead = bytes[i];
    if (lead <= 0x7f) {
      i++;
      continue;
    }

    let count: number;
    let min = 0x80;
    let max = 0xbf;
    if (lead >= 0xc2 && lead <= 0xdf) count = 1;
    else if (lead >= 0xe0 && lead <= 0xef) {
      count = 2;
      if (lead === 0xe0) min = 0xa0;
      else if (lead === 0xed) max = 0x9f;
    } else if (lead >= 0xf0 && lead <= 0xf4) {
      count = 3;
      if (lead === 0xf0) min = 0x90;
      else if (lead === 0xf4) max = 0x8f;
    } else return false;

    // Truncated sequence.
    if (i + count >= length) return false;
    if (bytes[i + 1] < min || bytes[i + 1] > max) return false;
    for (let j = 2; j <= count; j++) if (bytes[i + j] < 0x80 || bytes[i + j] > 0xbf) return false;

    i += count + 1;
  }

  return true;
};

/**
 * Decode UTF-8 bytes to string.
 *
 * Preserves CryptoJS `Utf8.stringify` contract:
 * - malformed UTF-8 is rejected (React Native `TextDecoder` polyfill doesn't support `fatal` option, so bytes
 * validated with {@link isWellFormedUtf8});
 * - leading BOM is preserved (native `TextDecoder` strips it by default, the polyfill keeps it).
 *
 * @param bytes - UTF-8 bytes.
 *
 * @returns Decoded string.
 *
 * @throws Error if `bytes` aren't well-formed UTF-8.
 *
 * @internal
 */
export const decodeUtf8 = (bytes: Uint8Array): string => {
  if (!isWellFormedUtf8(bytes)) throw new Error('Malformed UTF-8 data');

  const string = new TextDecoder().decode(bytes);
  const hasBOM = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;

  return hasBOM && string.charCodeAt(0) !== 0xfeff ? `﻿${string}` : string;
};

/**
 * Remove block cipher padding leniently.
 *
 * Mirrors CryptoJS `Pkcs7.unpad`: strips the number of bytes stored in the last byte without validating padding
 * bytes (so data padded with ANSI X.923 or ISO 10126 schemes still decrypts as before).
 *
 * @param bytes - Decrypted bytes with padding.
 *
 * @returns Bytes without padding (empty if padding length exceeds data length).
 *
 * @internal
 */
export const unpadLegacy = (bytes: Uint8Array): Uint8Array => {
  const padding = bytes.length ? bytes[bytes.length - 1] : 0;
  return padding > bytes.length ? new Uint8Array(0) : bytes.subarray(0, bytes.length - padding);
};

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
