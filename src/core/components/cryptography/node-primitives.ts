/**
 * Cryptography primitives backed by `node:crypto` (Node.js).
 *
 * @internal
 */

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'crypto';
import { Buffer } from 'buffer';

import { AesMode, CryptoPrimitives } from './primitives';

/**
 * OpenSSL cipher name for provided AES mode and key.
 *
 * @param mode - AES block cipher mode.
 * @param key - AES key.
 *
 * @returns Cipher algorithm name.
 *
 * @internal
 */
const algorithm = (mode: AesMode, key: Uint8Array) => `aes-${key.length * 8}-${mode}`;

/**
 * `node:crypto`-based cryptography primitives.
 *
 * @internal
 */
export const nodePrimitives: CryptoPrimitives = {
  sha256: (data) => createHash('sha256').update(data).digest(),
  hmacSha256: (key, data) => createHmac('sha256', key).update(data).digest(),
  aesEncrypt: (mode, key, iv, data) => {
    const cipher = createCipheriv(algorithm(mode, key), key, mode === 'ecb' ? null : iv);
    return Buffer.concat([cipher.update(data), cipher.final()]);
  },
  aesDecrypt: (mode, key, iv, data) => {
    const decipher = createDecipheriv(algorithm(mode, key), key, mode === 'ecb' ? null : iv);
    return Buffer.concat([decipher.update(data), decipher.final()]);
  },
  randomBytes: (length) => randomBytes(length),
};
