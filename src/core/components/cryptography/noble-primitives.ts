/**
 * Cryptography primitives backed by `@noble` (Web, React Native).
 *
 * @internal
 */

import { cbc } from '@noble/ciphers/aes.js';
import { randomBytes } from '@noble/ciphers/utils.js';
import { sha256 } from '@noble/hashes/sha2.js';

import { AesMode, CryptoPrimitives } from './primitives';

/**
 * Prepare AES-CBC cipher instance.
 *
 * **Note:** AES-ECB isn't reachable through public API and intentionally not bundled.
 *
 * @param mode - AES block cipher mode.
 * @param key - AES key.
 * @param iv - Initialization vector.
 *
 * @returns AES-CBC cipher.
 *
 * @internal
 */
const aesCipher = (mode: AesMode, key: Uint8Array, iv: Uint8Array | null) => {
  if (mode === 'ecb') throw new Error('AES-ECB is not supported');
  return cbc(key, iv!);
};

/**
 * `@noble`-based cryptography primitives.
 *
 * **Note:** Request signature (HMAC-SHA256) is Node.js-only and intentionally not bundled.
 *
 * @internal
 */
export const noblePrimitives: CryptoPrimitives = {
  sha256: (data) => sha256(data),
  hmacSha256: () => {
    throw new Error('HMAC-SHA256 is not supported on this platform');
  },
  aesEncrypt: (mode, key, iv, data) => aesCipher(mode, key, iv).encrypt(data),
  aesDecrypt: (mode, key, iv, data) => aesCipher(mode, key, iv).decrypt(data),
  randomBytes: (length) => randomBytes(length),
};
