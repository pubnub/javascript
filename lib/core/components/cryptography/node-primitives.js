"use strict";
/**
 * Cryptography primitives backed by `node:crypto` (Node.js).
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodePrimitives = void 0;
const crypto_1 = require("crypto");
const buffer_1 = require("buffer");
const primitives_1 = require("./primitives");
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
const algorithm = (mode, key) => `aes-${key.length * 8}-${mode}`;
/**
 * `node:crypto`-based cryptography primitives.
 *
 * @internal
 */
exports.nodePrimitives = {
    sha256: (data) => (0, crypto_1.createHash)('sha256').update(data).digest(),
    hmacSha256: (key, data) => (0, crypto_1.createHmac)('sha256', key).update(data).digest(),
    aesEncrypt: (mode, key, iv, data) => {
        const cipher = (0, crypto_1.createCipheriv)(algorithm(mode, key), key, mode === 'ecb' ? null : iv);
        return buffer_1.Buffer.concat([cipher.update(data), cipher.final()]);
    },
    aesDecrypt: (mode, key, iv, data) => {
        const decipher = (0, crypto_1.createDecipheriv)(algorithm(mode, key), key, mode === 'ecb' ? null : iv);
        // Padding removed leniently by `unpadLegacy` (CryptoJS-compatible).
        decipher.setAutoPadding(false);
        return (0, primitives_1.unpadLegacy)(buffer_1.Buffer.concat([decipher.update(data), decipher.final()]));
    },
    randomBytes: (length) => (0, crypto_1.randomBytes)(length),
};
